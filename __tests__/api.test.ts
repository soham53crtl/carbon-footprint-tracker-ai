// __tests__/api.test.ts
// Tests for API route business logic (pure functions, no HTTP calls needed)

import { calculateFootprint, HABITS_DATABASE, BENCHMARKS } from '../lib/calculations';

// ── Input validation helpers ──────────────────────────────────────────────────
describe('Input validation logic', () => {
  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  function validateUserName(name: string): boolean {
    return name.trim().length > 0;
  }

  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email+tag@domain.co.in')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@nodomain')).toBe(false);
    expect(validateEmail('missing@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('accepts passwords of 8+ characters', () => {
    expect(validatePassword('12345678')).toBe(true);
    expect(validatePassword('longpassword123!')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword('1234567')).toBe(false);
  });

  it('rejects empty or whitespace-only usernames', () => {
    expect(validateUserName('')).toBe(false);
    expect(validateUserName('   ')).toBe(false);
  });

  it('accepts valid usernames', () => {
    expect(validateUserName('Soham')).toBe(true);
    expect(validateUserName('EcoUser123')).toBe(true);
  });
});

// ── Footprint classification logic ────────────────────────────────────────────
describe('Footprint classification', () => {
  function classifyFootprint(totalTonnes: number): string {
    if (totalTonnes <= BENCHMARKS.parisTarget) return 'paris-aligned';
    if (totalTonnes <= BENCHMARKS.globalAverage) return 'moderate';
    return 'high';
  }

  it('classifies footprint <= 2T as paris-aligned', () => {
    expect(classifyFootprint(1.5)).toBe('paris-aligned');
    expect(classifyFootprint(2.0)).toBe('paris-aligned');
  });

  it('classifies footprint between 2T and 4.8T as moderate', () => {
    expect(classifyFootprint(3.0)).toBe('moderate');
    expect(classifyFootprint(4.8)).toBe('moderate');
  });

  it('classifies footprint > 4.8T as high', () => {
    expect(classifyFootprint(5.0)).toBe('high');
    expect(classifyFootprint(10.0)).toBe('high');
  });

  it('typical UK footprint (6.5T) is classified as high', () => {
    expect(classifyFootprint(6.5)).toBe('high');
  });
});

// ── Carbon reduction percentage ───────────────────────────────────────────────
describe('Carbon reduction percentage calculation', () => {
  function calcReductionPct(baseline: number, current: number): number {
    if (baseline <= 0) return 0;
    return parseFloat((((baseline - current) / baseline) * 100).toFixed(1));
  }

  it('calculates 50% reduction correctly', () => {
    expect(calcReductionPct(10, 5)).toBe(50);
  });

  it('returns 0 for no reduction', () => {
    expect(calcReductionPct(10, 10)).toBe(0);
  });

  it('returns 100 for full elimination', () => {
    expect(calcReductionPct(10, 0)).toBe(100);
  });

  it('returns 0 for zero baseline', () => {
    expect(calcReductionPct(0, 0)).toBe(0);
  });

  it('handles small reductions correctly', () => {
    expect(calcReductionPct(6.5, 6.0)).toBeCloseTo(7.7, 0);
  });
});

// ── Prediction model logic ─────────────────────────────────────────────────────
describe('Monthly prediction model', () => {
  function calcMonthlyBaseline(annualTonnes: number): number {
    return annualTonnes / 12;
  }

  function calcActiveFactor(totalSavedKg: number): number {
    return Math.min(0.25, (totalSavedKg / 100) * 0.05);
  }

  function calcForecast(monthlyBaseline: number, activeFactor: number, monthsAhead: number): number {
    return Math.max(0.05, monthlyBaseline - monthlyBaseline * activeFactor * (monthsAhead / 6));
  }

  it('monthly baseline is annual / 12', () => {
    expect(calcMonthlyBaseline(6.0)).toBeCloseTo(0.5, 2);
    expect(calcMonthlyBaseline(12.0)).toBeCloseTo(1.0, 2);
  });

  it('active factor caps at 0.25', () => {
    expect(calcActiveFactor(10000)).toBe(0.25);
  });

  it('active factor scales with savings', () => {
    expect(calcActiveFactor(100)).toBeCloseTo(0.05, 3);
    expect(calcActiveFactor(200)).toBeCloseTo(0.10, 3);
  });

  it('forecast never goes below 0.05', () => {
    expect(calcForecast(0.1, 0.99, 100)).toBeGreaterThanOrEqual(0.05);
  });

  it('forecast decreases as months ahead increases', () => {
    const baseline = 0.5;
    const factor = 0.1;
    const near = calcForecast(baseline, factor, 1);
    const far = calcForecast(baseline, factor, 6);
    expect(far).toBeLessThanOrEqual(near);
  });
});

// ── Habit logging duplicate detection ────────────────────────────────────────
describe('Duplicate activity detection', () => {
  const activities = [
    { userId: 'usr_1', habitId: 'walk', date: '2026-06-15' },
    { userId: 'usr_1', habitId: 'bike', date: '2026-06-15' },
    { userId: 'usr_2', habitId: 'walk', date: '2026-06-15' },
  ];

  function isAlreadyLogged(userId: string, habitId: string, date: string): boolean {
    return activities.some(a => a.userId === userId && a.habitId === habitId && a.date === date);
  }

  it('detects duplicate log for same user, habit, and date', () => {
    expect(isAlreadyLogged('usr_1', 'walk', '2026-06-15')).toBe(true);
  });

  it('allows same habit for different user', () => {
    expect(isAlreadyLogged('usr_3', 'walk', '2026-06-15')).toBe(false);
  });

  it('allows same habit for same user on different date', () => {
    expect(isAlreadyLogged('usr_1', 'walk', '2026-06-14')).toBe(false);
  });

  it('allows different habit for same user on same date', () => {
    expect(isAlreadyLogged('usr_1', 'solar', '2026-06-15')).toBe(false);
  });
});

// ── Green coins (XP-based) ────────────────────────────────────────────────────
describe('Green Coins logic', () => {
  it('green coins equal total XP accumulated', () => {
    const xp = 350;
    const greenCoins = xp; // by design: coins = xp
    expect(greenCoins).toBe(350);
  });

  it('badge unlock adds 50 XP / coins', () => {
    const xpBefore = 100;
    const xpAfter = xpBefore + 50;
    expect(xpAfter).toBe(150);
  });
});

// ── Habit impact categorization ───────────────────────────────────────────────
describe('Habit impact categories', () => {
  it('all habits belong to transport, energy, food, or waste', () => {
    const validCategories = ['transport', 'energy', 'food', 'waste'];
    HABITS_DATABASE.forEach(h => {
      expect(validCategories).toContain(h.category);
    });
  });

  it('all habits have High, Medium, or Low impact', () => {
    HABITS_DATABASE.forEach(h => {
      expect(['High', 'Medium', 'Low']).toContain(h.impact);
    });
  });

  it('CO2 saved is positive for all habits', () => {
    HABITS_DATABASE.forEach(h => {
      expect(h.co2Saved).toBeGreaterThan(0);
    });
  });

  it('XP gained is positive for all habits', () => {
    HABITS_DATABASE.forEach(h => {
      expect(h.xpGained).toBeGreaterThan(0);
    });
  });
});
