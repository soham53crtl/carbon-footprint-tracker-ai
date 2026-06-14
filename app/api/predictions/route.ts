import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db/json-db';
import { getSessionUser } from '@/lib/auth/auth-service';

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

  const userActivities = db.activities.filter((act) => act.userId === session.userId);
  const baselineTotal = user.totalFootprint || 6.5; // fallback to UK average if not calculated yet
  const monthlyBaseline = baselineTotal / 12;

  const currentMonthIdx = new Date().getMonth();

  const monthly = Array(12)
    .fill(0)
    .map((_, idx) => {
      // Activities logged in this month (0-indexed)
      const monthActs = userActivities.filter((act) => {
        try {
          if (!act.date) return false;
          const actMonth = new Date(act.date).getMonth();
          return actMonth === idx;
        } catch {
          return false;
        }
      });

      const savedKg = monthActs.reduce((sum, act) => sum + act.co2Saved, 0);
      const savedTonnes = savedKg / 1000;

      if (idx <= currentMonthIdx) {
        // Past or current month: actual baseline minus whatever the user saved
        return Math.max(0.05, monthlyBaseline - savedTonnes);
      } else {
        // Future months: model a forecast reduction as the user builds more habits
        const totalSavedSoFarKg = userActivities.reduce((sum, act) => sum + act.co2Saved, 0);
        const activeFactor = Math.min(0.25, (totalSavedSoFarKg / 100) * 0.05); // cap at 25% max reduction

        const monthsAhead = idx - currentMonthIdx;
        const projectedSavingsTonnes = monthlyBaseline * activeFactor * (monthsAhead / 6);
        return Math.max(0.05, monthlyBaseline - projectedSavingsTonnes);
      }
    });

  return NextResponse.json({ success: true, monthly });
}

