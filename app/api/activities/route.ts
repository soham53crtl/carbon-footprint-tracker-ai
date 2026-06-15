import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Activity, User } from '@/lib/db/json-db';
import { getSessionUser } from '@/lib/auth/auth-service';
import { HABITS_DATABASE, BADGES_DATABASE } from '@/lib/calculations';

export async function GET(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const db = await readDb();
  const userActivities = db.activities.filter((act) => act.userId === session.userId).map((act) => {
    const habit = HABITS_DATABASE.find((h) => h.id === act.habitId);
    return { ...act, icon: habit?.icon || '🌱' };
  });
  return NextResponse.json({ activities: userActivities });
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await request.json();
    const { habitId } = body;
    if (!habitId) return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    const habit = HABITS_DATABASE.find((h) => h.id === habitId);
    if (!habit) return NextResponse.json({ error: 'Invalid Habit ID' }, { status: 404 });
    const db = await readDb();
    const userIndex = db.users.findIndex((u) => u.id === session.userId);
    if (userIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const user = db.users[userIndex] as User;
    const today = new Date().toISOString().split('T')[0];
    const loggedToday = db.activities.some((act) => act.userId === user.id && act.habitId === habitId && act.date === today);
    if (loggedToday) return NextResponse.json({ error: 'Action already logged today' }, { status: 400 });
    if (user.lastActiveDate) {
      const diffDays = Math.ceil(Math.abs(new Date(today).getTime() - new Date(user.lastActiveDate).getTime()) / 86400000);
      if (diffDays === 1) {
        const todaysLogs = db.activities.some((act) => act.userId === user.id && act.date === today);
        if (!todaysLogs) user.streakCount += 1;
      } else if (diffDays > 1) user.streakCount = 1;
    } else user.streakCount = 1;
    user.lastActiveDate = today;
    const newActivity: Activity & { icon: string } = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      userId: user.id, habitId: habit.id, title: habit.title,
      category: habit.category, co2Saved: habit.co2Saved, xpGained: habit.xpGained,
      icon: habit.icon, timestamp: new Date().toISOString(), date: today,
    };
    db.activities.unshift(newActivity);
    user.dailyOffset = parseFloat((user.dailyOffset + habit.co2Saved).toFixed(2));
    user.cumulativeSavings = parseFloat((user.cumulativeSavings + habit.co2Saved).toFixed(2));
    user.xp += habit.xpGained;
    let leveledUp = false;
    if (user.xp >= user.level * 100) { user.level += 1; leveledUp = true; }
    const unlockedBadges: string[] = [...user.unlockedBadges];
    const triggerUnlock = (badgeId: string) => {
      if (!unlockedBadges.includes(badgeId)) { unlockedBadges.push(badgeId); user.xp += 50; }
    };
    triggerUnlock('habit-starter');
    if (db.activities.filter((act) => act.userId === user.id).length >= 10) triggerUnlock('habit-master');
    if (user.streakCount >= 3) triggerUnlock('streak-3');
    if (user.cumulativeSavings >= 100) triggerUnlock('offset-100');
    if (user.level >= 3) triggerUnlock('eco-warrior');
    user.unlockedBadges = unlockedBadges;
    db.users[userIndex] = user;
    await writeDb(db);
    return NextResponse.json({ success: true, activity: newActivity, leveledUp, unlockedBadges: user.unlockedBadges,
      user: { id: user.id, level: user.level, xp: user.xp, dailyOffset: user.dailyOffset,
        cumulativeSavings: user.cumulativeSavings, streakCount: user.streakCount, unlockedBadges: user.unlockedBadges } });
  } catch (error) {
    console.error('Logging activity error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}