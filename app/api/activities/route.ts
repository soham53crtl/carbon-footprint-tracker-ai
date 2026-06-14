import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Activity, User } from '@/lib/db/json-db';
import { getSessionUser } from '@/lib/auth/auth-service';
import { HABITS_DATABASE, HABITS_DATABASE as habits, BADGES_DATABASE } from '@/lib/calculations';

// GET: Retrieve all activities for the logged-in user
export async function GET(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const db = readDb();
  // Filter by user
  const userActivities = db.activities.filter((act) => act.userId === session.userId).map((act) => {
    const habit = HABITS_DATABASE.find((h) => h.id === act.habitId);
    return {
      ...act,
      icon: habit?.icon || '🌱',
    };
  });

  return NextResponse.json({ activities: userActivities });
}

// POST: Log a new sustainability action
export async function POST(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { habitId } = body;

    if (!habitId) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    // Resolve habit configurations
    const habit = HABITS_DATABASE.find((h) => h.id === habitId);
    if (!habit) {
      return NextResponse.json({ error: 'Invalid Habit ID' }, { status: 404 });
    }

    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === session.userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = db.users[userIndex] as User;
    const today = new Date().toISOString().split('T')[0];

    // Check if this habit is already logged today by this user
    const loggedToday = db.activities.some(
      (act) => act.userId === user.id && act.habitId === habitId && act.date === today
    );

    if (loggedToday) {
      return NextResponse.json({ error: 'Action already logged today' }, { status: 400 });
    }

    // 1. STREAK HANDLING
    if (user.lastActiveDate) {
      const lastDate = new Date(user.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If last log was yesterday (or today itself, which is normal for multiple logs)
      if (diffDays === 1) {
        // Increment streak only if this is the FIRST log of today
        const todaysLogs = db.activities.some((act) => act.userId === user.id && act.date === today);
        if (!todaysLogs) {
          user.streakCount += 1;
        }
      } else if (diffDays > 1) {
        // Broken streak
        user.streakCount = 1;
      }
    } else {
      user.streakCount = 1;
    }
    user.lastActiveDate = today;

    // 2. ADD TO LOGS
    const activityId = 'act_' + Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toISOString();
    
    const newActivity: Activity & { icon: string } = {
      id: activityId,
      userId: user.id,
      habitId: habit.id,
      title: habit.title,
      category: habit.category,
      co2Saved: habit.co2Saved,
      xpGained: habit.xpGained,
      icon: habit.icon,
      timestamp: timestamp,
      date: today,
    };

    db.activities.unshift(newActivity);

    // 3. UPDATE USER METRICS
    user.dailyOffset = parseFloat((user.dailyOffset + habit.co2Saved).toFixed(2));
    user.cumulativeSavings = parseFloat((user.cumulativeSavings + habit.co2Saved).toFixed(2));
    
    // Gain XP
    let gainedXP = habit.xpGained;
    user.xp += gainedXP;

    // Determine level up: Lvl boundary = level * 100
    const nextLevelTarget = user.level * 100;
    let leveledUp = false;
    if (user.xp >= nextLevelTarget) {
      user.level += 1;
      leveledUp = true;
    }

    // 4. ACHIEVEMENT BADGES EVALUATION
    const unlockedBadges: string[] = [...user.unlockedBadges];
    const triggerUnlock = (badgeId: string) => {
      if (!unlockedBadges.includes(badgeId)) {
        unlockedBadges.push(badgeId);
        user.xp += 50; // Bonus XP for badge
      }
    };

    // 'habit-starter': first logged action
    triggerUnlock('habit-starter');

    // 'habit-master': >= 10 logged actions
    const totalLogsCount = db.activities.filter((act) => act.userId === user.id).length;
    if (totalLogsCount >= 10) {
      triggerUnlock('habit-master');
    }

    // 'streak-3': >= 3 days streak
    if (user.streakCount >= 3) {
      triggerUnlock('streak-3');
    }

    // 'offset-100': cumulative savings >= 100 kg
    if (user.cumulativeSavings >= 100) {
      triggerUnlock('offset-100');
    }

    // 'eco-warrior': level >= 3
    if (user.level >= 3) {
      triggerUnlock('eco-warrior');
    }

    user.unlockedBadges = unlockedBadges;
    db.users[userIndex] = user;
    writeDb(db);

    return NextResponse.json({
      success: true,
      activity: newActivity,
      leveledUp,
      unlockedBadges: user.unlockedBadges,
      user: {
        id: user.id,
        level: user.level,
        xp: user.xp,
        dailyOffset: user.dailyOffset,
        cumulativeSavings: user.cumulativeSavings,
        streakCount: user.streakCount,
        unlockedBadges: user.unlockedBadges,
      },
    });
  } catch (error) {
    console.error('Logging activity error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
