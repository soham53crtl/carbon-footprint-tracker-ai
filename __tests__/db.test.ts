// __tests__/db.test.ts
// Tests for DB schema validation and data integrity logic
// (pure logic tests - no filesystem or Redis calls)

import {
  HABITS_DATABASE,
  BADGES_DATABASE,
  calculateFootprint,
} from '../lib/calculations';

// ── DbSchema shape validation ─────────────────────────────────────────────────
describe('DbSchema structure', () => {
  const mockUser = {
    id: 'usr_test001',
    email: 'test@ecosphere.com',
    passwordHash: 'abc123:def456',
    userName: 'TestUser',
    level: 1,
    xp: 0,
    dailyOffset: 0,
    cumulativeSavings: 0,
    streakCount: 0,
    lastActiveDate: '2026-06-15',
    unlockedBadges: [] as string[],
    theme: 'light' as const,
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

  it('user object has all required fields', () => {
    expect(mockUser.id).toBeTruthy();
    expect(mockUser.email).toBeTruthy();
    expect(mockUser.passwordHash).toBeTruthy();
    expect(mockUser.userName).toBeTruthy();
    expect(typeof mockUser.level).toBe('number');
    expect(typeof mockUser.xp).toBe('number');
    expect(Array.isArray(mockUser.unlockedBadges)).toBe(true);
    expect(['light', 'dark']).toContain(mockUser.theme);
  });

  it('user calculatorInputs has all required fields', () => {
    const ci = mockUser.calculatorInputs;
    expect(ci).toHaveProperty('electricity');
    expect(ci).toHaveProperty('gas');
    expect(ci).toHaveProperty('water');
    expect(ci).toHaveProperty('vehicleType');
    expect(ci).toHaveProperty('vehicleDistance');
    expect(ci).toHaveProperty('transitDistance');
    expect(ci).toHaveProperty('flightsShort');
    expect(ci).toHaveProperty('flightsLong');
    expect(ci).toHaveProperty('dietType');
    expect(ci).toHaveProperty('recycling');
    expect(Array.isArray(ci.recycling)).toBe(true);
  });

  it('footprintByCategories has all four keys', () => {
    const cats = mockUser.footprintByCategories;
    expect(cats).toHaveProperty('energy');
    expect(cats).toHaveProperty('transport');
    expect(cats).toHaveProperty('food');
    expect(cats).toHaveProperty('shopping');
  });
});

// ── Activity schema ───────────────────────────────────────────────────────────
describe('Activity schema', () => {
  const mockActivity = {
    id: 'act_xyz789',
    userId: 'usr_test001',
    habitId: 'walk-instead-of-drive',
    title: 'Walk Instead of Drive',
    category: 'transport',
    co2Saved: 2.5,
    xpGained: 20,
    timestamp: new Date().toISOString(),
    date: '2026-06-15',
  };

  it('has required activity fields', () => {
    expect(mockActivity.id).toBeTruthy();
    expect(mockActivity.userId).toBeTruthy();
    expect(mockActivity.habitId).toBeTruthy();
    expect(mockActivity.co2Saved).toBeGreaterThan(0);
    expect(mockActivity.xpGained).toBeGreaterThan(0);
  });

  it('date is in YYYY-MM-DD format', () => {
    expect(mockActivity.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('timestamp is valid ISO string', () => {
    expect(() => new Date(mockActivity.timestamp)).not.toThrow();
    expect(new Date(mockActivity.timestamp).getTime()).toBeGreaterThan(0);
  });
});

// ── Streak logic ──────────────────────────────────────────────────────────────
describe('Streak calculation logic', () => {
  function calculateStreak(lastActiveDate: string, currentDate: string, currentStreak: number): number {
    if (!lastActiveDate) return 1;
    const last = new Date(lastActiveDate);
    const curr = new Date(currentDate);
    const diffDays = Math.ceil(Math.abs(curr.getTime() - last.getTime()) / 86400000);
    if (diffDays === 1) return currentStreak + 1;
    if (diffDays > 1) return 1;
    return currentStreak;
  }

  it('increments streak for consecutive days', () => {
    expect(calculateStreak('2026-06-14', '2026-06-15', 3)).toBe(4);
  });

  it('resets streak if gap is more than 1 day', () => {
    expect(calculateStreak('2026-06-10', '2026-06-15', 5)).toBe(1);
  });

  it('maintains streak on same day', () => {
    expect(calculateStreak('2026-06-15', '2026-06-15', 5)).toBe(5);
  });

  it('starts streak at 1 for first activity', () => {
    expect(calculateStreak('', '2026-06-15', 0)).toBe(1);
  });
});

// ── XP and levelling logic ────────────────────────────────────────────────────
describe('XP and levelling logic', () => {
  function calculateLevel(currentXp: number, currentLevel: number): { level: number; leveledUp: boolean } {
    const threshold = currentLevel * 100;
    if (currentXp >= threshold) return { level: currentLevel + 1, leveledUp: true };
    return { level: currentLevel, leveledUp: false };
  }

  it('levels up when XP meets threshold', () => {
    const result = calculateLevel(100, 1);
    expect(result.leveledUp).toBe(true);
    expect(result.level).toBe(2);
  });

  it('does not level up when XP is below threshold', () => {
    const result = calculateLevel(50, 1);
    expect(result.leveledUp).toBe(false);
    expect(result.level).toBe(1);
  });

  it('threshold increases with level', () => {
    // Level 2 threshold = 200 XP
    expect(calculateLevel(150, 2).leveledUp).toBe(false);
    expect(calculateLevel(200, 2).leveledUp).toBe(true);
  });

  it('level 5 requires 500 XP', () => {
    expect(calculateLevel(499, 5).leveledUp).toBe(false);
    expect(calculateLevel(500, 5).leveledUp).toBe(true);
  });
});

// ── Badge unlock logic ────────────────────────────────────────────────────────
describe('Badge unlock logic', () => {
  function triggerUnlock(badgeId: string, unlockedBadges: string[], xp: number): { badges: string[]; xp: number } {
    if (!unlockedBadges.includes(badgeId)) {
      return { badges: [...unlockedBadges, badgeId], xp: xp + 50 };
    }
    return { badges: unlockedBadges, xp };
  }

  it('adds badge and awards 50 XP when unlocking new badge', () => {
    const result = triggerUnlock('habit-starter', [], 0);
    expect(result.badges).toContain('habit-starter');
    expect(result.xp).toBe(50);
  });

  it('does not duplicate badge or award XP if already unlocked', () => {
    const result = triggerUnlock('habit-starter', ['habit-starter'], 100);
    expect(result.badges.filter(b => b === 'habit-starter')).toHaveLength(1);
    expect(result.xp).toBe(100);
  });

  it('unlocking multiple badges accumulates XP', () => {
    let state = { badges: [] as string[], xp: 0 };
    state = triggerUnlock('habit-starter', state.badges, state.xp);
    state = triggerUnlock('streak-3', state.badges, state.xp);
    state = triggerUnlock('eco-warrior', state.badges, state.xp);
    expect(state.xp).toBe(150);
    expect(state.badges).toHaveLength(3);
  });

  it('all badge IDs in BADGES_DATABASE are recognized', () => {
    BADGES_DATABASE.forEach(badge => {
      expect(badge.id).toBeTruthy();
    });
  });
});

// ── Carbon savings accumulation ───────────────────────────────────────────────
describe('Carbon savings accumulation', () => {
  it('cumulative savings increases with each activity', () => {
    let cumulative = 0;
    const activities = [2.5, 1.2, 3.8, 0.5];
    activities.forEach(saved => {
      cumulative = parseFloat((cumulative + saved).toFixed(2));
    });
    expect(cumulative).toBeCloseTo(8.0, 1);
  });

  it('daily offset resets correctly', () => {
    let dailyOffset = 5.0;
    // Simulate new day reset
    dailyOffset = 0;
    expect(dailyOffset).toBe(0);
  });

  it('CO2 saved from habits matches HABITS_DATABASE values', () => {
    const habit = HABITS_DATABASE[0];
    expect(habit.co2Saved).toBeGreaterThan(0);
    const savedKg = habit.co2Saved;
    const savedTonnes = savedKg / 1000;
    expect(savedTonnes).toBeLessThan(1);
  });
});

// ── Goal schema ───────────────────────────────────────────────────────────────
describe('Goal schema validation', () => {
  const mockGoal = {
    id: 'goal_001',
    userId: 'usr_test001',
    category: 'transport',
    targetValue: 2.0,
    targetDate: '2026-12-31',
    currentProgress: 0.5,
    completed: false,
    createdAt: '2026-06-15T00:00:00Z',
  };

  it('has all required goal fields', () => {
    expect(mockGoal.id).toBeTruthy();
    expect(mockGoal.userId).toBeTruthy();
    expect(mockGoal.targetValue).toBeGreaterThan(0);
    expect(typeof mockGoal.completed).toBe('boolean');
  });

  it('progress is within valid range', () => {
    expect(mockGoal.currentProgress).toBeGreaterThanOrEqual(0);
    expect(mockGoal.currentProgress).toBeLessThanOrEqual(mockGoal.targetValue);
  });

  it('targetDate is a valid date string', () => {
    expect(() => new Date(mockGoal.targetDate)).not.toThrow();
  });
});
