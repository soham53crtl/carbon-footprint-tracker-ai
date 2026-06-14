import fs from 'fs';
import path from 'path';

// Define DB paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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
  timestamp: string; // ISO or local HH:MM
  date: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  userId: string;
  category: string; // 'general' | 'transport' | 'energy' | 'food' | 'waste'
  targetValue: number; // Target carbon footprint in tonnes/yr or daily offset in kg
  targetDate: string; // YYYY-MM-DD
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

// Check and initialize the DB file
function initializeDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
  }
}

// Read database contents
export function readDb(): DbSchema {
  initializeDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read JSON DB, returning defaults:', error);
    return DEFAULT_DB;
  }
}

// Write database contents
export function writeDb(data: DbSchema): void {
  initializeDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to JSON DB:', error);
  }
}

// Clear database contents (used for testing)
export function clearDb(): void {
  initializeDb();
  writeDb(DEFAULT_DB);
}
