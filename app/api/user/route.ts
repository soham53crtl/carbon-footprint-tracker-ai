import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, User } from '@/lib/db/json-db';
import { getSessionUser } from '@/lib/auth/auth-service';
import { calculateFootprint } from '@/lib/calculations';

// ── Helper ─────────────────────────────────────────────────────────────────
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

// ── GET: Fetch current user profile ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const db = readDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ user: safeUser(user) });
}

// ── POST: Recalculate baseline / update theme / challenges ─────────────────
export async function POST(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === session.userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = db.users[userIndex] as User;

    // ── 1. RECALCULATE ──────────────────────────────────────────────────────
    if (action === 'recalculate') {
      const { inputs } = body;
      if (!inputs) {
        return NextResponse.json({ error: 'Calculator inputs are required' }, { status: 400 });
      }
      const results = calculateFootprint(inputs);
      user.calculatorInputs = inputs;
      user.footprintByCategories = {
        energy: results.energy,
        transport: results.transport,
        food: results.food,
        shopping: results.shopping,
      };
      user.totalFootprint = results.total;
      user.hasCalculated = true;

      // Badge evaluation
      const unlocked = [...user.unlockedBadges];
      let xpBonus = 0;
      const tryUnlock = (id: string) => {
        if (!unlocked.includes(id)) { unlocked.push(id); xpBonus += 50; }
      };
      tryUnlock('first-calc');
      if (results.total < 5.0) tryUnlock('low-carbon');
      if (['paper', 'plastic', 'glass', 'compost'].every((m) => inputs.recycling.includes(m))) {
        tryUnlock('zero-waste-hero');
      }
      user.unlockedBadges = unlocked;
      user.xp += xpBonus;
      if (user.xp >= user.level * 100) user.level += 1;

      db.users[userIndex] = user;
      writeDb(db);
      return NextResponse.json({ success: true, user: safeUser(user) });
    }

    // ── 2. UPDATE THEME ─────────────────────────────────────────────────────
    if (action === 'updateTheme') {
      const { theme } = body;
      if (theme !== 'light' && theme !== 'dark') {
        return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
      }
      user.theme = theme;
      db.users[userIndex] = user;
      writeDb(db);
      return NextResponse.json({ success: true, theme });
    }

    // ── 3. ENROLL CHALLENGE ─────────────────────────────────────────────────
    if (action === 'enrollChallenge') {
      const { challengeId, title, category, targetDays, xpReward } = body;
      if (!challengeId) {
        return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
      }
      const exists = db.enrolledChallenges.find(
        (ec) => ec.userId === user.id && ec.challengeId === challengeId
      );
      if (exists) {
        return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
      }
      const enrollment = {
        id: 'ec_' + Math.random().toString(36).slice(2, 10),
        userId: user.id,
        challengeId,
        title: title ?? '',
        category: category ?? 'general',
        targetDays: targetDays ?? 7,
        completedDays: 0,
        lastLoggedDate: '',
        completed: false,
        xpReward: xpReward ?? 100,
      };
      db.enrolledChallenges.push(enrollment);
      writeDb(db);
      return NextResponse.json({ success: true, enrolledChallenge: enrollment });
    }

    // ── 4. GET CHALLENGES ───────────────────────────────────────────────────
    if (action === 'getChallenges') {
      const userChallenges = db.enrolledChallenges.filter((ec) => ec.userId === user.id);
      return NextResponse.json({ success: true, enrolledChallenges: userChallenges });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[user]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
