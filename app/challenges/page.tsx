'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Users, Clock, CheckCircle2, Lock } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { useEcoApp } from '@/hooks/useEcoApp';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: { xp: number; coins: number; badge?: string };
  durationDays: number;
  participants: number;
  goalDescription: string;
  icon: string;
  requiredLevel: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'meatless-week',
    title: 'Meatless Week',
    description: 'Go entirely plant-based for 7 consecutive days. No meat, no poultry.',
    category: 'food',
    difficulty: 'Medium',
    reward: { xp: 250, coins: 150, badge: 'eco-warrior' },
    durationDays: 7,
    participants: 1842,
    goalDescription: 'Log a plant-based meal every day for 7 days.',
    icon: '🥗',
    requiredLevel: 1,
  },
  {
    id: 'car-free-fortnight',
    title: 'Car-Free Fortnight',
    description: 'Ditch the car for two whole weeks. Walk, cycle or take public transit.',
    category: 'transport',
    difficulty: 'Hard',
    reward: { xp: 500, coins: 300, badge: 'habit-master' },
    durationDays: 14,
    participants: 974,
    goalDescription: 'Log a car-free commute every day for 14 days.',
    icon: '🚲',
    requiredLevel: 2,
  },
  {
    id: 'energy-diet',
    title: '5-Day Energy Diet',
    description: 'Slash home energy use by 20%. Turn off standby devices and lower your thermostat.',
    category: 'energy',
    difficulty: 'Easy',
    reward: { xp: 120, coins: 80 },
    durationDays: 5,
    participants: 3201,
    goalDescription: 'Log at least one energy-saving action every day for 5 days.',
    icon: '💡',
    requiredLevel: 1,
  },
  {
    id: 'zero-waste-weekend',
    title: 'Zero-Waste Weekend',
    description: 'Produce no landfill waste for an entire weekend. Compost, recycle, refuse.',
    category: 'waste',
    difficulty: 'Medium',
    reward: { xp: 200, coins: 120, badge: 'zero-waste-hero' },
    durationDays: 2,
    participants: 2108,
    goalDescription: 'Log zero-waste actions across Saturday and Sunday.',
    icon: '♻️',
    requiredLevel: 1,
  },
  {
    id: 'cold-shower-streak',
    title: 'Cold Shower Streak',
    description: 'Take a cold shower (under 5 min) every morning for a week. Save water and energy.',
    category: 'energy',
    difficulty: 'Easy',
    reward: { xp: 100, coins: 60 },
    durationDays: 7,
    participants: 5470,
    goalDescription: 'Log 7 cold showers.',
    icon: '🚿',
    requiredLevel: 1,
  },
  {
    id: 'local-food-month',
    title: 'Local Food Month',
    description: 'Source all fresh produce from within 100 miles for 30 days.',
    category: 'food',
    difficulty: 'Hard',
    reward: { xp: 600, coins: 400, badge: 'habit-master' },
    durationDays: 30,
    participants: 412,
    goalDescription: 'Log local-produce purchases every week for 4 weeks.',
    icon: '🍎',
    requiredLevel: 3,
  },
];

const DIFF_COLORS: Record<string, string> = {
  Easy: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  Medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  Hard: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
};

const CAT_COLORS: Record<string, string> = {
  food: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  transport: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  energy: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  waste: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

export default function ChallengesPage() {
  const router = useRouter();
  const { user, loading, toggleTheme, logout } = useEcoApp();
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleJoin = (c: Challenge) => {
    if (!user) return;
    if (user.level < c.requiredLevel) {
      showToast(`🔒 Requires Level ${c.requiredLevel}. Keep logging to level up!`);
      return;
    }
    if (joined.has(c.id)) {
      showToast('You already joined this challenge!');
      return;
    }
    setJoined((prev) => new Set([...prev, c.id]));
    showToast(`🏆 Joined "${c.title}"! Good luck — you've got this!`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse-soft">🏆</div></div>;
  if (!user) return null;

  const activeChallenges = CHALLENGES.filter((c) => joined.has(c.id));
  const availableChallenges = CHALLENGES.filter((c) => !joined.has(c.id));

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav user={user} activeSection="challenges" onChangeSection={(s) => router.push(`/${s}`)} onLogout={logout} onThemeToggle={toggleTheme} />

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold shadow-xl animate-scale-in max-w-xs">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Community</p>
          <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">Challenges</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete community challenges to earn bonus XP, coins, and exclusive badges.</p>
        </div>

        {/* Active challenges */}
        {activeChallenges.length > 0 && (
          <div className="mb-8 animate-fade-up">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Your active challenges ({activeChallenges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((c) => (
                <div key={c.id} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{c.title}</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {c.durationDays} days remaining
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.goalDescription}</p>
                  <div className="mt-3 w-full bg-emerald-200/40 dark:bg-emerald-900/30 rounded-full h-1.5">
                    <div className="h-full bg-emerald-500 rounded-full w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All challenges */}
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Available challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
            {availableChallenges.map((c) => {
              const locked = user.level < c.requiredLevel;
              return (
                <div
                  key={c.id}
                  className={`card-lift animate-fade-up bg-card border border-card-border rounded-2xl p-5 flex flex-col ${locked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.icon}</span>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CAT_COLORS[c.category]}`}>{c.category}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLORS[c.difficulty]}`}>{c.difficulty}</span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">{c.description}</p>

                  <div className="flex items-center gap-3 text-xs mb-4">
                    <span className="flex items-center gap-1 text-slate-500"><Users className="h-3 w-3" /> {c.participants.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-slate-500"><Clock className="h-3 w-3" /> {c.durationDays}d</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-card-border pt-4">
                    <div className="text-xs font-semibold space-y-0.5">
                      <p className="text-amber-500">+{c.reward.xp} XP</p>
                      <p className="text-violet-500">+{c.reward.coins} coins</p>
                      {c.reward.badge && <p className="text-rose-500">🏅 badge</p>}
                    </div>
                    <button
                      id={`join-challenge-${c.id}`}
                      onClick={() => handleJoin(c)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        locked
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {locked ? <><Lock className="h-3 w-3" /> Lvl {c.requiredLevel}</> : 'Join →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
