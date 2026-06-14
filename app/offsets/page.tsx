'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, TreePine, Wind, Sun, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { useEcoApp } from '@/hooks/useEcoApp';
import { BENCHMARKS } from '@/lib/calculations';

interface OffsetProject {
  id: string;
  name: string;
  location: string;
  type: 'reforestation' | 'renewable' | 'efficiency' | 'direct-capture';
  standard: string;
  pricePerTonne: number;
  totalAvailable: number;
  impact: string;
  description: string;
  icon: string;
  sdgs: number[];
}

const PROJECTS: OffsetProject[] = [
  {
    id: 'kariba-forest',
    name: 'Kariba REDD+ Forest Protection',
    location: 'Zimbabwe, Africa',
    type: 'reforestation',
    standard: 'Verra VCS + CCB',
    pricePerTonne: 18,
    totalAvailable: 50000,
    impact: 'Protects 785,000 ha of miombo woodland',
    description: 'Prevents deforestation in one of Africa\'s most biodiverse forests, supporting local communities and wildlife corridors.',
    icon: '🌳',
    sdgs: [13, 15, 1, 2],
  },
  {
    id: 'india-wind',
    name: 'Rajasthan Wind Farm',
    location: 'Rajasthan, India',
    type: 'renewable',
    standard: 'Gold Standard',
    pricePerTonne: 12,
    totalAvailable: 30000,
    impact: '50 MW of clean wind energy annually',
    description: 'Displaces coal-fired electricity in Northern India\'s grid, reducing local air pollution alongside CO₂.',
    icon: '💨',
    sdgs: [7, 13, 8],
  },
  {
    id: 'cookstove-kenya',
    name: 'Kenya Clean Cookstoves',
    location: 'Kenya, East Africa',
    type: 'efficiency',
    standard: 'Gold Standard',
    pricePerTonne: 8,
    totalAvailable: 20000,
    impact: 'Serving 50,000 households with clean cooking',
    description: 'Replaces wood-burning fires with efficient cookstoves, dramatically reducing indoor air pollution and deforestation.',
    icon: '🍳',
    sdgs: [3, 5, 13, 15],
  },
  {
    id: 'peru-amazon',
    name: 'Peruvian Amazon Conservation',
    location: 'Ucayali, Peru',
    type: 'reforestation',
    standard: 'Verra VCS',
    pricePerTonne: 22,
    totalAvailable: 45000,
    impact: 'Protects 1.3M hectares of primary rainforest',
    description: 'Safeguards ancient Amazon biodiversity hotspot with satellite monitoring and community ranger programs.',
    icon: '🦜',
    sdgs: [13, 15, 10],
  },
  {
    id: 'dac-pilot',
    name: 'Direct Air Capture Pilot',
    location: 'Iceland',
    type: 'direct-capture',
    standard: 'Puro.earth',
    pricePerTonne: 85,
    totalAvailable: 2000,
    impact: 'Permanent geological CO₂ storage',
    description: 'Cutting-edge technology that removes CO₂ directly from the air and permanently mineralises it underground.',
    icon: '🏭',
    sdgs: [9, 13],
  },
];

const TYPE_COLORS: Record<string, string> = {
  reforestation: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  renewable: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  efficiency: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'direct-capture': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

export default function OffsetsPage() {
  const router = useRouter();
  const { user, loading, toggleTheme, logout } = useEcoApp();
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [offsetted, setOffseted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [showCalc, setShowCalc] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const updateBasket = (id: string, tonnes: number) => {
    setBasket((prev) => ({ ...prev, [id]: Math.max(0, tonnes) }));
  };

  const handleOffset = (project: OffsetProject) => {
    const t = basket[project.id] || 0;
    if (t <= 0) {
      showToast('Please enter how many tonnes to offset.');
      return;
    }
    setOffseted((prev) => new Set([...prev, project.id]));
    showToast(`🌍 Offset committed! ${t}T CO₂ via "${project.name}" — thank you!`);
  };

  const fp = user?.baselineFootprint ?? 0;
  const totalBasket = Object.values(basket).reduce((s, v) => s + v, 0);
  const totalCost = PROJECTS.reduce((s, p) => s + (basket[p.id] || 0) * p.pricePerTonne, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse-soft">🌿</div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav user={user} activeSection="offsets" onChangeSection={(s) => router.push(`/${s}`)} onLogout={logout} onThemeToggle={toggleTheme} />

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white text-sm font-semibold shadow-xl animate-scale-in max-w-xs">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Climate Action</p>
          <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">Carbon Offsets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Neutralise your unavoidable emissions by funding verified climate projects.</p>
        </div>

        {/* Footprint overview */}
        {fp > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-up">
            {[
              { label: 'Your annual footprint', value: `${fp} T`, icon: Globe, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Paris Target', value: `${BENCHMARKS.parisTarget} T`, icon: TreePine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Tonnes to offset', value: `${Math.max(0, fp - BENCHMARKS.parisTarget).toFixed(1)} T`, icon: Wind, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
                  <div className={`h-11 w-11 ${s.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="font-display font-black text-2xl text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Basket summary */}
        {totalBasket > 0 && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between animate-fade-up">
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white">Basket: {totalBasket} tonnes CO₂</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Estimated cost: ~${totalCost.toFixed(0)} USD</p>
            </div>
            <button
              id="offsets-checkout-btn"
              onClick={() => showToast('💳 Redirecting to secure payment (demo mode).')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition"
            >
              Checkout →
            </button>
          </div>
        )}

        {/* Standards note */}
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/8 border border-blue-200 dark:border-blue-800 animate-fade-up">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            All listed projects are verified under internationally recognised standards (Verra VCS, Gold Standard, Puro.earth). 
            Offsets should complement — not replace — genuine emissions reductions.
          </p>
        </div>

        {/* Project cards */}
        <div className="space-y-5">
          {PROJECTS.map((p) => {
            const done = offsetted.has(p.id);
            return (
              <div
                key={p.id}
                className={`card-lift animate-fade-up bg-card border rounded-2xl overflow-hidden ${done ? 'border-emerald-300 dark:border-emerald-800' : 'border-card-border'}`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                      {p.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{p.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${TYPE_COLORS[p.type]}`}>
                          {p.type.replace('-', ' ')}
                        </span>
                        {done && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">✅ Committed</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        📍 {p.location} · 🏅 {p.standard}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full font-medium">
                          🌍 {p.impact}
                        </span>
                        {p.sdgs.map((sdg) => (
                          <span key={sdg} className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                            SDG {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Purchase row */}
                  <div className="mt-5 pt-5 border-t border-card-border flex items-center gap-4 flex-wrap">
                    <div className="font-display">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">${p.pricePerTonne}</span>
                      <span className="text-slate-400 text-sm"> /tonne</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <label htmlFor={`tonnes-${p.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Tonnes:</label>
                      <input
                        id={`tonnes-${p.id}`}
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={basket[p.id] || ''}
                        onChange={(e) => updateBasket(p.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                      />
                      {(basket[p.id] || 0) > 0 && (
                        <span className="text-sm font-bold text-slate-500">= ~${((basket[p.id] || 0) * p.pricePerTonne).toFixed(0)}</span>
                      )}
                    </div>
                    <button
                      id={`offset-${p.id}`}
                      onClick={() => handleOffset(p)}
                      disabled={done}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                        done
                          ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {done ? <><CheckCircle2 className="h-4 w-4" /> Committed</> : <><Globe className="h-4 w-4" /> Commit offset</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
