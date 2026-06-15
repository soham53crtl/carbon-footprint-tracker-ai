'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  TrendingDown,
  TrendingUp,
  Zap,
  Award,
  Flame,
  Coins,
  Target,
  RefreshCw,
  ChevronRight,
  Globe,
  TreePine,
} from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import dynamic from 'next/dynamic';
const CalculatorModal = dynamic(() => import('@/components/calculator-modal').then(m => m.CalculatorModal), {
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />,
  ssr: false,
});
const EmissionsChart = dynamic(() => import('@/components/charts/emissions-charts').then(m => m.EmissionsChart), {
  loading: () => <div className="animate-pulse h-48 bg-gray-200 rounded-lg" />,
  ssr: false,
});
import { useEcoApp } from '@/hooks/useEcoApp';
import { BENCHMARKS, HABITS_DATABASE } from '@/lib/calculations';

const NATIONAL_AVG = 7.5;

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, activities, fetchActivities, refreshUser, toggleTheme, logout, logHabit } = useEcoApp();
  const [showCalculator, setShowCalculator] = useState(false);
  const [predictions, setPredictions] = useState<{ monthly: number[] } | null>(null);
  const [recs, setRecs] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchActivities();
    if (!user.baselineFootprint) setShowCalculator(true);
    else fetchPredictions();
    fetchRecs();
  }, [user?.id]);

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('ecosphere-token');
      const res = await fetch('/api/predictions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setPredictions(d);
      }
    } catch (_) {}
  };

  const fetchRecs = async () => {
    setLoadingRecs(true);
    try {
      const token = localStorage.getItem('ecosphere-token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'Give me 3 personalised tips to reduce my carbon footprint this week.' }),
      });
      if (res.ok) {
        const d = await res.json();
        const lines = (d.reply as string)
          .split('\n')
          .map((l: string) => l.replace(/^[-•*\d.]+\s*/, '').trim())
          .filter((l: string) => l.length > 20)
          .slice(0, 3);
        setRecs(lines);
      }
    } catch (_) {}
    setLoadingRecs(false);
  };

  const { fp, breakdown, vsGlobal, vsNational, totalSavedKg, treesEquiv } = useMemo(() => {
    const fp = user?.baselineFootprint ?? 0;
    const breakdown = user?.baselineBreakdown;
    const vsGlobal = fp > 0 ? ((fp - BENCHMARKS.globalAverage) / BENCHMARKS.globalAverage) * 100 : 0;
    const vsNational = fp > 0 ? ((fp - NATIONAL_AVG) / NATIONAL_AVG) * 100 : 0;
    const totalSavedKg = activities.reduce((s, a) => s + a.co2Saved, 0);
    const treesEquiv = parseFloat((totalSavedKg / 22).toFixed(1));
    return { fp, breakdown, vsGlobal, vsNational, totalSavedKg, treesEquiv };
  }, [user, activities]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-pulse-soft">
            🌱
          </div>
          <p className="text-sm text-slate-500 animate-pulse-soft">Loading your eco profile…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const STAT_CARDS = [
    {
      id: 'card-footprint',
      label: 'Annual Footprint',
      value: fp > 0 ? `${fp} T` : '—',
      sub: fp > 0 ? (fp <= BENCHMARKS.parisTarget ? '✅ Paris-aligned' : `${Math.abs(vsGlobal).toFixed(0)}% ${vsGlobal > 0 ? 'above' : 'below'} global avg`) : 'Complete baseline →',
      icon: Globe,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'card-streak',
      label: 'Habit Streak',
      value: `${user.streak}d`,
      sub: user.streak >= 3 ? '🔥 On fire!' : 'Keep it going',
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      id: 'card-xp',
      label: 'Total XP',
      value: user.xp.toLocaleString(),
      sub: `Level ${user.level} · ${user.xp % 100}/100 XP`,
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      id: 'card-saved',
      label: 'CO₂ Saved',
      value: `${totalSavedKg.toFixed(1)} kg`,
      sub: `≈ ${treesEquiv} trees planted`,
      icon: TreePine,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
    },
    {
      id: 'card-coins',
      label: 'Green Coins',
      value: user.greenCoins,
      sub: 'Spend in Marketplace',
      icon: Coins,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      id: 'card-badges',
      label: 'Badges Earned',
      value: user.unlockedBadges.length,
      sub: 'Keep logging to unlock more',
      icon: Award,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = predictions?.monthly
    ? predictions.monthly.map((v, i) => ({ month: monthLabels[i], emissions: parseFloat(v.toFixed(2)) }))
    : monthLabels.map((m, i) => ({ month: m, emissions: fp > 0 ? parseFloat((fp / 12 + (Math.random() - 0.5) * 0.3).toFixed(2)) : 0 }));

  const pieData = breakdown
    ? [
        { name: 'Energy', value: breakdown.energy, color: '#10b981' },
        { name: 'Transport', value: breakdown.transport, color: '#3b82f6' },
        { name: 'Food', value: breakdown.food, color: '#f59e0b' },
        { name: 'Shopping', value: breakdown.shopping, color: '#8b5cf6' },
      ]
    : [];

  const recentHabits = HABITS_DATABASE.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav
        user={user}
        activeSection="dashboard"
        onChangeSection={(s) => router.push(`/${s}`)}
        onLogout={logout}
        onThemeToggle={toggleTheme}
      />

      <main className="flex-1 overflow-y-auto p-8 max-w-full">
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">
              Hey, {user.userName.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here's your carbon impact summary.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              id="dashboard-refresh-btn"
              onClick={() => { refreshUser(); fetchActivities(); fetchPredictions(); }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              id="dashboard-calculator-btn"
              onClick={() => setShowCalculator(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {user.baselineFootprint ? 'Recalculate' : 'Set Baseline'}
            </button>
          </div>
        </div>

        {!user.baselineFootprint && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between animate-fade-up">
            <div>
              <p className="font-display font-black text-lg">Set your carbon baseline first!</p>
              <p className="text-emerald-100 text-sm mt-0.5">Answer a quick lifestyle quiz to unlock your full dashboard.</p>
            </div>
            <button
              onClick={() => setShowCalculator(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition shrink-0"
            >
              Start now →
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 stagger-children">
          {STAT_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} id={c.id} className="card-lift animate-fade-up bg-card border border-card-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                </div>
                <p className="font-display text-2xl font-black text-slate-900 dark:text-white">{c.value}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{c.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.sub}</p>
              </div>
            );
          })}
        </div>

        {fp > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Emissions</p>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white mt-0.5">12-month trend</h3>
                </div>
              </div>
              <EmissionsChart data={chartData} type="line" />
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-6 animate-fade-up">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Breakdown</p>
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">By category</h3>
              <EmissionsChart data={pieData} type="pie" />
            </div>
          </div>
        )}

        {fp > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'vs Paris Target', value: fp, target: BENCHMARKS.parisTarget, color: 'emerald' },
              { label: 'vs Global Avg', value: fp, target: BENCHMARKS.globalAverage, color: 'blue' },
              { label: 'vs National Avg', value: fp, target: NATIONAL_AVG, color: 'violet' },
            ].map((b) => {
              const pct = Math.min((b.value / (b.target * 2)) * 100, 100);
              const under = b.value <= b.target;
              return (
                <div key={b.label} className="bg-card border border-card-border rounded-2xl p-5 animate-fade-up">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{b.label}</p>
                    {under
                      ? <TrendingDown className="h-4 w-4 text-emerald-500" />
                      : <TrendingUp className="h-4 w-4 text-red-400" />
                    }
                  </div>
                  <p className="font-display font-black text-xl text-slate-900 dark:text-white">
                    {b.target} T <span className="text-slate-400 font-normal text-sm">target</span>
                  </p>
                  <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${under ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1.5 font-semibold ${under ? 'text-emerald-500' : 'text-red-400'}`}>
                    You: {fp} T/yr — {under ? `${(b.target - fp).toFixed(1)}T under` : `${(fp - b.target).toFixed(1)}T over`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-card-border rounded-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Insights</p>
                <h3 className="font-display font-bold text-slate-900 dark:text-white mt-0.5">This week's tips</h3>
              </div>
              <button
                id="dashboard-refresh-recs-btn"
                onClick={fetchRecs}
                disabled={loadingRecs}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition"
              >
                <RefreshCw className={`h-4 w-4 ${loadingRecs ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-3">
              {loadingRecs ? (
                [1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-full" />)
              ) : recs.length > 0 ? (
                recs.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/8">
                    <Leaf className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{r}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Set your baseline to get personalised recommendations.</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Log</p>
                <h3 className="font-display font-bold text-slate-900 dark:text-white mt-0.5">Today's actions</h3>
              </div>
              <button onClick={() => router.push('/tracker')} className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1">
                All habits <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentHabits.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                  <span className="text-xl">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{h.title}</p>
                    <p className="text-xs text-slate-400">−{h.co2Saved} kg CO₂ · +{h.xpGained} XP</p>
                  </div>
                  <button
                    id={`quick-log-${h.id}`}
                    onClick={() => logHabit(h.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition hover:bg-emerald-500 hover:text-white"
                  >
                    Log
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {activities.length > 0 && (
          <div className="bg-card border border-card-border rounded-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">History</p>
                <h3 className="font-display font-bold text-slate-900 dark:text-white mt-0.5">Recent activity</h3>
              </div>
              <button onClick={() => router.push('/tracker')} className="text-xs font-semibold text-emerald-500 hover:underline">View all →</button>
            </div>
            <div className="space-y-2">
              {activities.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                    <p className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-500">−{a.co2Saved} kg</p>
                    <p className="text-xs text-amber-500">+{a.xpGained} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showCalculator && (
        <CalculatorModal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          onSuccess={() => { setShowCalculator(false); refreshUser(); fetchPredictions(); }}
        />
      )}
    </div>
  );
}
