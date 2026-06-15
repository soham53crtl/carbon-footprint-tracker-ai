import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db/json-db';
import { getSessionUser } from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const db = await readDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const userActivities = db.activities.filter((act) => act.userId === session.userId);
  const baselineTotal = user.totalFootprint || 6.5;
  const monthlyBaseline = baselineTotal / 12;
  const currentMonthIdx = new Date().getMonth();
  const monthly = Array(12).fill(0).map((_, idx) => {
    const savedKg = userActivities.filter((act) => { try { return act.date && new Date(act.date).getMonth() === idx; } catch { return false; } })
      .reduce((sum, act) => sum + act.co2Saved, 0);
    if (idx <= currentMonthIdx) return Math.max(0.05, monthlyBaseline - savedKg / 1000);
    const totalSaved = userActivities.reduce((sum, act) => sum + act.co2Saved, 0);
    const activeFactor = Math.min(0.25, (totalSaved / 100) * 0.05);
    return Math.max(0.05, monthlyBaseline - monthlyBaseline * activeFactor * ((idx - currentMonthIdx) / 6));
  });
  return NextResponse.json({ success: true, monthly });
}