import { kv } from '@vercel/kv';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  userName: string;
  level: number;
  xp: number;
  dailyOffset: number;
  cumulativeSavings: number;
  streakCount: number;
  lastActiveDate: string;
  unlockedBadges: string[];
  theme: 'light' | 'dark';
  hasCalculated: boolean;
  totalFootprint: number;
  calculatorInputs: {
    electricity: number;
    gas: number;
    water: number;
    vehicleType: string;
    vehicleDistance: number;
    transitDistance: number;
    flightsShort: number;
    flightsLong: number;
    dietType: string;
    recycling: string[];
  };
  footprintByCategories: {
    energy: number;
    transport: number;
    food: number;
    shopping: number;
  };
}

export interface Activity {
  id: string;
  userId: string;
  habitId: string;
  title: string;
  category: string;
  co2Saved: number;
  xpGained: number;
  timestamp: string;
  date: string;
}

export interface Goal {
  id: string;
  userId: string;
  category: string;
  targetValue: number;
  targetDate: string;
  currentProgress: number;
  completed: boolean;
  createdAt: string;
}

export interface EnrolledChallenge {
  id: string;
  userId: string;
  challengeId: string;
  title: string;
  category: string;
  targetDays: number;
  completedDays: number;
  lastLoggedDate: string;
  completed: boolean;
  xpReward: number;
}

export interface DbSchema {
  users: User[];
  activities: Activity[];
  goals: Goal[];
  enrolledChallenges: EnrolledChallenge[];
}

const DEFAULT_DB: DbSchema = {
  users: [],
  activities: [],
  goals: [],
  enrolledChallenges: [],
};

export async function readDb(): Promise<DbSchema> {
  try {
    const data = await kv.get<DbSchema>('ecosphere_db');
    return data ?? DEFAULT_DB;
  } catch (error) {
    console.error('Failed to read KV DB:', error);
    return DEFAULT_DB;
  }
}

export async function writeDb(data: DbSchema): Promise<void> {
  try {
    await kv.set('ecosphere_db', data);
  } catch (error) {
    console.error('Failed to write KV DB:', error);
  }
}

export async function clearDb(): Promise<void> {
  await writeDb(DEFAULT_DB);
}