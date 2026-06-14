'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle2, Clock, Flame, ChevronDown } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { useEcoApp } from '@/hooks/useEcoApp';
import { HABITS_DATABASE, Habit } from '@/lib/calculations';

type Category = 'all' | 'transport' | 'energy' | 'food' | 'waste';

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  energy: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  food: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  waste: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};
const IMPACT_COLORS: Record<string, string> = {
  High: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20',
  Medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
  Low: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
};

export default function TrackerPage() {
  const router = useRouter();
  const { user, loading, activities, fetchActivities, refreshUser, logHabit, toggleTheme, logout } = useEcoApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [logging, setLogging] = useState<string | null>(null);
  const [logged, setLogged] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sortBy, setSortBy] = useState<'impact' | 'co2' | 'xp'>('impact');

  useEffect(() => {
    if (!user) return;
    fetchActivities();
    // Mark today's already-logged habit IDs
    const today = new Date().toDateString();
    const todayIds = new Set(
      activities
        .filter((a) => new Date(a.timestamp).toDateString() === today)
        .map((a) => a.habitId)
    );
    setLogged(todayIds);
  }, [user?.id]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLog = async (habit: Habit) => {
    if (logged.has(habit.id)) {
      showToast('Already logged today!', 'error');
      return;
    }
    setLogging(habit.id);
    const { ok, data } = await logHabit(habit.id);
    setLogging(null);
    if (ok) {
      setLogged((prev) => new Set([...prev, habit.id]));
      showToast(`✅ Logged! +${habit.xpGained} XP · −${habit.co2Saved} kg CO₂`);
    } else {
      showToast(data?.error || 'Failed to log habit.', 'error');
    }
  };

  const filtered = HABITS_DATABASE
    .filter((h) => {
      const matchCat = category === 'all' || h.category === category;
      const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) || h.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'co2') return b.co2Saved - a.co2Saved;
      if (sortBy === 'xp') return b.xpGained - a.xpGained;
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[a.impact] ?? 3) - (order[b.impact] ?? 3);
    });

  const todayActivities = activities.filter(
    (a) => new Date(a.timestamp).toDateString() === new Date().toDateString()
  );
  const todaySaved = todayActivities.reduce((s, a) => s + a.co2Saved, 0);
  const todayXP = todayActivities.reduce((s, a) => s + a.xpGained, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse-soft text-4xl">🌱</div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav user={user} activeSection="tracker" onChangeSection={(s) => router.push(`/${s}`)} onLogout={logout} onThemeToggle={toggleTheme} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl animate-scale-in ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Habits & Tracker</p>
          <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">Log your green actions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Every action counted reduces your footprint. Log daily!</p>
        </div>

        {/* Today summary */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up">
          {[
            { label: "Today's Habits", value: todayActivities.length, icon: '📋', color: 'bg-blue-500/10 text-blue-600' },
            { label: 'CO₂ Saved Today', value: `${todaySaved.toFixed(1)} kg`, icon: '🌿', color: 'bg-emerald-500/10 text-emerald-600' },
            { label: 'XP Earned Today', value: `+${todayXP}`, icon: '⚡', color: 'bg-amber-500/10 text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-card-border rounded-2xl p-5">
              <div className={`h-9 w-9 ${s.color} rounded-xl flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
              <p className="font-display text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="tracker-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search habits…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'transport', 'energy', 'food', 'waste'] as const).map((cat) => (
              <button
                key={cat}
                id={`filter-${cat}`}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                  category === cat
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            id="tracker-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none"
          >
            <option value="impact">Sort: Impact</option>
            <option value="co2">Sort: CO₂</option>
            <option value="xp">Sort: XP</option>
          </select>
        </div>

        {/* Habit cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map((h) => {
            const isLogged = logged.has(h.id);
            const isLogging = logging === h.id;
            return (
              <div
                key={h.id}
                className={`card-lift animate-fade-up bg-card border rounded-2xl p-5 transition-all ${isLogged ? 'border-emerald-300 dark:border-emerald-800 opacity-75' : 'border-card-border'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{h.icon}</span>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[h.category]}`}>
                        {h.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${IMPACT_COLORS[h.impact]}`}>
                    {h.impact}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">{h.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{h.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs font-semibold">
                    <span className="text-emerald-500">−{h.co2Saved} kg</span>
                    <span className="text-amber-500">+{h.xpGained} XP</span>
                  </div>
                  <button
                    id={`log-habit-${h.id}`}
                    onClick={() => handleLog(h)}
                    disabled={isLogging}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isLogged
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {isLogging ? (
                      <Clock className="h-3 w-3 animate-spin" />
                    ) : isLogged ? (
                      <><CheckCircle2 className="h-3 w-3" /> Done</>
                    ) : (
                      <><Flame className="h-3 w-3" /> Log it</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No habits match your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
