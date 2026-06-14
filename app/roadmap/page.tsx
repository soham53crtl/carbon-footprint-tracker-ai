'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Leaf, Zap, ArrowRight } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { useEcoApp } from '@/hooks/useEcoApp';

interface RoadmapStep {
  id: string;
  phase: number;
  title: string;
  description: string;
  tips: string[];
  co2Impact: string;
  timeframe: string;
  icon: string;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'mindset';
}

const ROADMAP: RoadmapStep[] = [
  {
    id: 'step-baseline',
    phase: 1,
    title: 'Know your baseline',
    description: 'You can\'t improve what you don\'t measure. Complete the carbon calculator to set your starting point.',
    tips: ['Use the EcoSphere baseline calculator', 'Be honest — accuracy drives better recommendations', 'Note your highest-impact categories'],
    co2Impact: 'Awareness only',
    timeframe: 'Day 1',
    icon: '📊',
    category: 'mindset',
  },
  {
    id: 'step-diet',
    phase: 1,
    title: 'Shift your diet',
    description: 'Food production accounts for ~26% of global emissions. Even small shifts make a big difference.',
    tips: ['Try Meatless Monday first', 'Swap beef for chicken or legumes', 'Buy seasonal and local produce', 'Reduce food waste by meal planning'],
    co2Impact: '400–900 kg CO₂/yr',
    timeframe: 'Week 1–4',
    icon: '🥗',
    category: 'food',
  },
  {
    id: 'step-transport',
    phase: 1,
    title: 'Rethink how you move',
    description: 'Transport is typically the #1 or #2 emissions source. Short trips by car are the easiest to eliminate.',
    tips: ['Walk or cycle trips under 3 km', 'Take public transit 2× per week', 'Carpool with colleagues', 'Combine errands into one journey'],
    co2Impact: '500–2000 kg CO₂/yr',
    timeframe: 'Month 1',
    icon: '🚲',
    category: 'transport',
  },
  {
    id: 'step-home-energy',
    phase: 2,
    title: 'Optimise home energy',
    description: 'Heating and cooling dominate household energy bills. Small changes compound quickly.',
    tips: ['Lower heating by 1–2°C', 'Switch to LED bulbs throughout', 'Unplug standby appliances', 'Wash clothes at 30°C cold'],
    co2Impact: '200–500 kg CO₂/yr',
    timeframe: 'Month 1–2',
    icon: '🏠',
    category: 'energy',
  },
  {
    id: 'step-green-energy',
    phase: 2,
    title: 'Switch to green electricity',
    description: 'Moving to a renewable tariff can eliminate 1–3 tonnes of CO₂ overnight with a single call.',
    tips: ['Research renewable tariffs in your area', 'Compare green energy suppliers', 'Consider rooftop solar if you own your home', 'Look into community energy schemes'],
    co2Impact: '1–3 T CO₂/yr',
    timeframe: 'Month 2–3',
    icon: '⚡',
    category: 'energy',
  },
  {
    id: 'step-waste',
    phase: 2,
    title: 'Master waste reduction',
    description: 'Landfill waste produces methane — 80× more potent than CO₂ over 20 years.',
    tips: ['Start a compost bin', 'Recycle paper, glass, and plastics consistently', 'Choose products with minimal packaging', 'Repair before buying new'],
    co2Impact: '100–300 kg CO₂/yr',
    timeframe: 'Month 2–4',
    icon: '♻️',
    category: 'waste',
  },
  {
    id: 'step-flights',
    phase: 3,
    title: 'Address flight emissions',
    description: 'A single return long-haul flight can add 1–2 tonnes of CO₂. Fly less; offset when unavoidable.',
    tips: ['Take trains for journeys under 6 hours', 'Fly direct — take-off uses most fuel', 'Purchase high-quality carbon offsets', 'Work from home instead of business travel'],
    co2Impact: '500–2000 kg CO₂/flight',
    timeframe: 'Ongoing',
    icon: '✈️',
    category: 'transport',
  },
  {
    id: 'step-consumption',
    phase: 3,
    title: 'Conscious consumption',
    description: 'The fashion and manufacturing sector produces ~10% of global emissions. Buy less, buy better.',
    tips: ['Shop second-hand first (ThredUp, eBay, Vinted)', 'Choose quality items that last', 'Borrow or rent instead of buying', 'Avoid fast fashion brands'],
    co2Impact: '200–800 kg CO₂/yr',
    timeframe: 'Ongoing',
    icon: '👕',
    category: 'waste',
  },
  {
    id: 'step-offset',
    phase: 3,
    title: 'Offset residual emissions',
    description: 'For the emissions you can\'t yet eliminate, invest in verified carbon offset projects.',
    tips: ['Choose Gold Standard or VCS certified projects', 'Prioritise direct air capture or reforestation', 'Use the EcoSphere Offsets planner', 'Aim to be net-zero, not just neutral'],
    co2Impact: 'Up to 100% of remainder',
    timeframe: 'Ongoing',
    icon: '🌳',
    category: 'mindset',
  },
];

const CAT_COLORS: Record<string, string> = {
  transport: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  energy: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  food: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  waste: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  mindset: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const PHASE_LABELS = ['', 'Phase 1 — Quick Wins', 'Phase 2 — Structural Changes', 'Phase 3 — Deep Decarbonisation'];

export default function RoadmapPage() {
  const router = useRouter();
  const { user, loading, toggleTheme, logout } = useEcoApp();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['step-baseline']));

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse-soft">🗺️</div></div>;
  if (!user) return null;

  const totalSteps = ROADMAP.length;
  const doneSteps = completed.size;
  const progress = Math.round((doneSteps / totalSteps) * 100);

  const phases = [1, 2, 3];

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav user={user} activeSection="roadmap" onChangeSection={(s) => router.push(`/${s}`)} onLogout={logout} onThemeToggle={toggleTheme} />

      <main className="flex-1 overflow-y-auto p-8 max-w-4xl">
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your journey</p>
          <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">Sustainability Roadmap</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">A personalised step-by-step plan to reach net-zero.</p>
        </div>

        {/* Overall progress */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200 dark:border-emerald-800 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-display font-black text-2xl text-slate-900 dark:text-white">{progress}% complete</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{doneSteps} of {totalSteps} steps marked done</p>
            </div>
            <Leaf className="h-10 w-10 text-emerald-500/30" />
          </div>
          <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Phase groups */}
        {phases.map((phase) => {
          const phaseSteps = ROADMAP.filter((s) => s.phase === phase);
          return (
            <div key={phase} className="mb-10 animate-fade-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">{phase}</div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">{PHASE_LABELS[phase]}</h2>
              </div>

              <div className="relative pl-5 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
                {phaseSteps.map((step) => {
                  const done = completed.has(step.id);
                  const open = expanded.has(step.id);
                  return (
                    <div
                      key={step.id}
                      className={`relative -ml-[21px] pl-6 card-lift bg-card border rounded-2xl transition-all ${done ? 'border-emerald-300 dark:border-emerald-800' : 'border-card-border'}`}
                    >
                      {/* Connector dot */}
                      <div className={`absolute left-0 top-5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition ${done ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                        {done && <CheckCircle2 className="h-2.5 w-2.5 text-white fill-white" />}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{step.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h3 className={`font-display font-bold text-base ${done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{step.title}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CAT_COLORS[step.category]}`}>{step.category}</span>
                              </div>
                              <div className="flex gap-3 text-xs text-slate-400">
                                <span>⏱ {step.timeframe}</span>
                                <span>🌍 {step.co2Impact}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              id={`roadmap-check-${step.id}`}
                              onClick={() => toggle(step.id)}
                              className={`p-2 rounded-xl transition ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                            >
                              {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </button>
                            <button
                              id={`roadmap-expand-${step.id}`}
                              onClick={() => toggleExpand(step.id)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {open && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-up">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{step.description}</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Actionable tips</p>
                            <ul className="space-y-1.5">
                              {step.tips.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {doneSteps === totalSteps && (
          <div className="text-center py-12 animate-scale-in">
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="font-display font-black text-2xl text-emerald-500">Roadmap complete!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">You're a certified Climate Leader. Now help others!</p>
          </div>
        )}
      </main>
    </div>
  );
}
