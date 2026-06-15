import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, User } from '@/lib/db/json-db';
import { hashPassword, verifyPassword, signToken, setSessionCookie, clearSessionCookie, getSessionUser } from '@/lib/auth/auth-service';

function safeUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    userName: u.userName,
    level: u.level,
    xp: u.xp,
    greenCoins: u.xp,
    streak: u.streakCount,
    totalCO2Saved: u.cumulativeSavings,
    unlockedBadges: u.unlockedBadges,
    theme: u.theme,
    baselineFootprint: u.hasCalculated ? u.totalFootprint : null,
    baselineBreakdown: u.hasCalculated ? u.footprintByCategories : null,
    weeklyGoalKg: 15,
    monthlySavings: [],
  };
}

export async function GET(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, error: 'Not authenticated' }, { status: 401 });
  }
  const db = await readDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false, error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ authenticated: true, user: safeUser(user) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action: string = body.action;
    const email: string | undefined = body.email;
    const password: string | undefined = body.password;
    const userName: string = body.name || body.userName || '';

    const db = await readDb();

    if (action === 'register' || action === 'signup') {
      if (!email || !password || !userName.trim()) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      const newUser: User = {
        id: userId,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        userName: userName.trim(),
        level: 1,
        xp: 0,
        dailyOffset: 0,
        cumulativeSavings: 0,
        streakCount: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        unlockedBadges: [],
        theme: 'light',
        hasCalculated: false,
        totalFootprint: 0,
        calculatorInputs: {
          electricity: 300, gas: 50, water: 4000,
          vehicleType: 'petrol', vehicleDistance: 120,
          transitDistance: 50, flightsShort: 2, flightsLong: 1,
          dietType: 'average-meat', recycling: ['paper', 'plastic'],
        },
        footprintByCategories: { energy: 0, transport: 0, food: 0, shopping: 0.8 },
      };

      db.users.push(newUser);
      await writeDb(db);

      const token = signToken({ userId: newUser.id, email: newUser.email, userName: newUser.userName });
      const response = NextResponse.json({ success: true, token, user: safeUser(newUser) }, { status: 201 });
      setSessionCookie(response, newUser.id, newUser.email, newUser.userName);
      return response;
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const today = new Date().toISOString().split('T')[0];
      if (user.lastActiveDate !== today) {
        const last = new Date(user.lastActiveDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr.getTime() - last.getTime()) / 86400000);
        if (diffDays > 1) user.streakCount = 0;
        user.dailyOffset = 0;
        user.lastActiveDate = today;
        await writeDb(db);
      }

      const token = signToken({ userId: user.id, email: user.email, userName: user.userName });
      const response = NextResponse.json({ success: true, token, user: safeUser(user) });
      setSessionCookie(response, user.id, user.email, user.userName);
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[auth]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}