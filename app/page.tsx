'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  BarChart3,
  Trophy,
  MessageSquare,
  ShoppingBag,
  Globe,
  Zap,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    title: 'Smart Analytics',
    desc: 'Real-time dashboards tracking your energy, transport, food, and shopping footprint.',
  },
  {
    icon: MessageSquare,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'AI Eco Chatbot',
    desc: 'Personalised sustainability advice powered by Gemini AI — available 24/7.',
  },
  {
    icon: Trophy,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    title: 'Challenges & Badges',
    desc: 'Level up, earn XP, and unlock badges for every green habit you form.',
  },
  {
    icon: TrendingDown,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    title: 'Carbon Forecasting',
    desc: 'AI-driven predictions show your emissions path and where to intervene.',
  },
  {
    icon: ShoppingBag,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    title: 'Green Marketplace',
    desc: 'Spend earned Green Coins on sustainable products and eco certifications.',
  },
  {
    icon: Globe,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    title: 'Carbon Offsets',
    desc: 'Support verified reforestation and renewable energy projects worldwide.',
  },
];

const STATS = [
  { value: '4.8T', label: 'Global avg CO₂/person/yr' },
  { value: '2.0T', label: 'Paris Agreement target' },
  { value: '58%', label: 'Achievable reduction w/ habits' },
  { value: '22kg', label: 'CO₂ absorbed per tree/yr' },
];

const STEPS = [
  { step: '01', title: 'Set your baseline', desc: 'Answer a quick lifestyle quiz to calculate your current annual carbon footprint.' },
  { step: '02', title: 'Log daily actions', desc: 'Record eco habits every day — biking, plant meals, cold washes — to earn XP.' },
  { step: '03', title: 'Get AI insights', desc: 'Our chatbot analyses your data and surfaces the highest-impact changes for you.' },
  { step: '04', title: 'Offset & celebrate', desc: 'Fund real-world projects and celebrate milestones with community challenges.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // If already logged in, go straight to dashboard
    try {
      const token = localStorage.getItem('ecosphere-token');
      if (token) router.replace('/dashboard');
    } catch (_) {}

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#080f1a] text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-[#080f1a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
              🌱
            </div>
            <span className="font-display font-bold text-lg tracking-tight">EcoSphere</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="nav-login-btn"
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Log in
            </button>
            <button
              id="nav-signup-btn"
              onClick={() => router.push('/signup')}
              className="px-5 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition shadow-md shadow-emerald-500/25"
            >
              Start free →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-80px] left-[10%] w-[560px] h-[560px] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-8 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider animate-fade-in">
          <Zap className="h-3 w-3 fill-emerald-500 text-emerald-500" />
          AI-Powered Carbon Intelligence
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6 animate-fade-up">
          Live lighter.{' '}
          <span className="gradient-text">Tread greener.</span>
          <br />
          Fight smarter.
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '80ms' }}>
          EcoSphere calculates your personal carbon footprint, gamifies daily
          eco habits, and uses AI to guide you toward a sustainable lifestyle —
          one green action at a time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <button
            id="hero-cta-signup"
            onClick={() => router.push('/signup')}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/30 text-base"
          >
            Get started — it's free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            id="hero-cta-login"
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 px-8 py-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-base"
          >
            Log in
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Hero visual */}
        <div className="mt-20 max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden animate-scale-in" style={{ animationDelay: '240ms' }}>
          <div className="h-8 bg-slate-50 dark:bg-slate-800 flex items-center px-4 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total CO₂', value: '6.2 T', color: 'text-emerald-500', sub: 'annual footprint' },
              { label: 'This Month', value: '−14%', color: 'text-blue-500', sub: 'vs last month' },
              { label: 'XP Earned', value: '2,480', color: 'text-amber-500', sub: 'Level 3 reached' },
              { label: 'Habits Logged', value: '47', color: 'text-violet-500', sub: 'this month' },
            ].map((m) => (
              <div key={m.label} className="text-center space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{m.label}</p>
                <p className={`text-3xl font-display font-black ${m.color}`}>{m.value}</p>
                <p className="text-[11px] text-slate-400">{m.sub}</p>
              </div>
            ))}
          </div>
          <div className="h-32 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 flex items-center justify-center">
            <div className="flex items-end gap-2 h-20">
              {[35, 55, 40, 70, 50, 80, 65, 90, 75, 100, 85, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-5 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-80"
                  style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="font-display text-3xl font-black gradient-text">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="font-display text-4xl md:text-5xl font-black">Built for real impact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card-lift animate-fade-up p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 group"
                >
                  <div className={`h-11 w-11 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="font-display text-4xl md:text-5xl font-black">How EcoSphere works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="flex gap-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 card-lift">
                <span className="font-display font-black text-3xl text-emerald-500/20 dark:text-emerald-500/15 select-none">{s.step}</span>
                <div>
                  <h3 className="font-display font-bold text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            {[...Array(3)].map((_, i) => (
              <CheckCircle2 key={i} className="h-5 w-5 text-emerald-500" />
            ))}
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-6">
            Ready to make a <span className="gradient-text">difference?</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
            Join thousands of people tracking their impact. Free forever.
          </p>
          <button
            id="footer-cta-signup"
            onClick={() => router.push('/signup')}
            className="group inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/30 text-lg"
          >
            Create free account
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-500" />
            <span className="font-display font-bold text-sm">EcoSphere</span>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} EcoSphere Carbon Hub. For the planet. 🌍</p>
        </div>
      </footer>
    </div>
  );
}
