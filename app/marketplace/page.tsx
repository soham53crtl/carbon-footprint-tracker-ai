'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Coins, CheckCircle2, Lock, Star } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { useEcoApp } from '@/hooks/useEcoApp';

interface MarketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  icon: string;
  requiredLevel: number;
  tag?: string;
}

const ITEMS: MarketItem[] = [
  {
    id: 'bamboo-kit',
    title: 'Bamboo Essentials Kit',
    description: 'Zero-waste starter pack: bamboo toothbrush, compostable floss, and solid shampoo bar.',
    category: 'Personal Care',
    price: 120,
    rating: 4.9,
    icon: '🪥',
    requiredLevel: 1,
    tag: 'Best Seller',
  },
  {
    id: 'seed-packet',
    title: 'Heirloom Seed Collection',
    description: 'Grow your own herbs & veg. 12 non-GMO heirloom seed varieties, organically sourced.',
    category: 'Garden',
    price: 80,
    rating: 4.7,
    icon: '🌱',
    requiredLevel: 1,
  },
  {
    id: 'reusable-set',
    title: 'Reusable Travel Set',
    description: 'Stainless steel straw, collapsible cup, organic cotton tote, and bamboo cutlery.',
    category: 'On-the-Go',
    price: 150,
    rating: 4.8,
    icon: '🌍',
    requiredLevel: 1,
    tag: 'Popular',
  },
  {
    id: 'solar-charger',
    title: 'Foldable Solar Charger',
    description: '10W solar panel charger. Perfect for camping, commuting, or everyday eco energy.',
    category: 'Tech',
    price: 300,
    rating: 4.6,
    icon: '☀️',
    requiredLevel: 2,
  },
  {
    id: 'beeswax-wraps',
    title: 'Beeswax Food Wraps (10pk)',
    description: 'Replace single-use cling film. Reusable up to 1 year. Handmade, compostable.',
    category: 'Kitchen',
    price: 60,
    rating: 4.8,
    icon: '🍯',
    requiredLevel: 1,
  },
  {
    id: 'tree-cert',
    title: 'Plant-a-Tree Certificate',
    description: 'We plant 5 native trees in your name in a verified reforestation project in Kenya.',
    category: 'Offsets',
    price: 200,
    rating: 5.0,
    icon: '🌳',
    requiredLevel: 1,
    tag: '🌍 Impact',
  },
  {
    id: 'eco-audit',
    title: 'Home Energy Audit Guide',
    description: 'Detailed DIY guide to audit and optimise your home\'s energy use. Save £300+/yr.',
    category: 'Education',
    price: 90,
    rating: 4.5,
    icon: '📋',
    requiredLevel: 2,
  },
  {
    id: 'compost-bin',
    title: 'Indoor Bokashi Compost Kit',
    description: 'Ferment any kitchen waste (including meat) into garden compost. Odour-free design.',
    category: 'Garden',
    price: 250,
    rating: 4.7,
    icon: '🪣',
    requiredLevel: 2,
  },
  {
    id: 'green-subscription',
    title: '1-Month EcoPro Subscription',
    description: 'Unlock advanced analytics, unlimited AI chat, and priority offset project access for 30 days.',
    category: 'Premium',
    price: 500,
    rating: 4.9,
    icon: '🚀',
    requiredLevel: 3,
    tag: '✨ Premium',
  },
];

const CAT_FILTER = ['All', 'Personal Care', 'Garden', 'On-the-Go', 'Tech', 'Kitchen', 'Offsets', 'Education', 'Premium'];

export default function MarketplacePage() {
  const router = useRouter();
  const { user, loading, setUser, toggleTheme, logout } = useEcoApp();
  const [filter, setFilter] = useState('All');
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleBuy = (item: MarketItem) => {
    if (!user) return;
    if (user.level < item.requiredLevel) {
      showToast(`🔒 Requires Level ${item.requiredLevel}!`);
      return;
    }
    if (user.greenCoins < item.price) {
      showToast(`💚 Not enough Green Coins! You need ${item.price - user.greenCoins} more.`);
      return;
    }
    if (purchased.has(item.id)) {
      showToast('You already own this item!');
      return;
    }
    setUser((prev) => prev ? { ...prev, greenCoins: prev.greenCoins - item.price } : prev);
    setPurchased((prev) => new Set([...prev, item.id]));
    showToast(`🎉 Purchased "${item.title}"! Enjoy your eco reward.`);
  };

  const filtered = filter === 'All' ? ITEMS : ITEMS.filter((i) => i.category === filter);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse-soft">🛍️</div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav user={user} activeSection="marketplace" onChangeSection={(s) => router.push(`/${s}`)} onLogout={logout} onThemeToggle={toggleTheme} />

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold shadow-xl animate-scale-in max-w-xs">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rewards</p>
            <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">Green Marketplace</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Spend your Green Coins on real eco-friendly rewards.</p>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-500/10 border border-violet-200 dark:border-violet-800">
            <Coins className="h-5 w-5 text-violet-500" />
            <span className="font-display font-black text-xl text-violet-600 dark:text-violet-400">{user.greenCoins}</span>
            <span className="text-xs font-bold text-violet-500">coins</span>
          </div>
        </div>

        {/* How to earn */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 animate-fade-up">
          <span className="text-xl">💡</span>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            <strong>How to earn more coins:</strong> Log daily habits, complete challenges, and maintain your streak. You earn <strong>1 coin per XP</strong> gained.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-up">
          {CAT_FILTER.map((c) => (
            <button
              key={c}
              id={`market-filter-${c.replace(/\s/g, '-')}`}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === c
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {filtered.map((item) => {
            const owned = purchased.has(item.id);
            const locked = user.level < item.requiredLevel;
            const canAfford = user.greenCoins >= item.price;
            return (
              <div key={item.id} className={`card-lift animate-fade-up bg-card border border-card-border rounded-2xl flex flex-col overflow-hidden ${locked ? 'opacity-60' : ''}`}>
                {/* Product visual */}
                <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-5xl relative">
                  {item.icon}
                  {item.tag && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                      {item.tag}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 mb-4">{item.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-card-border">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-violet-500" />
                      <span className="font-display font-black text-lg text-violet-600 dark:text-violet-400">{item.price}</span>
                    </div>
                    <button
                      id={`buy-${item.id}`}
                      onClick={() => handleBuy(item)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        owned
                          ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 cursor-default'
                          : locked
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-violet-500 hover:bg-violet-600 text-white shadow-md shadow-violet-500/20'
                      }`}
                    >
                      {owned ? (
                        <><CheckCircle2 className="h-3 w-3" /> Owned</>
                      ) : locked ? (
                        <><Lock className="h-3 w-3" /> Lvl {item.requiredLevel}</>
                      ) : !canAfford ? (
                        <>Need more coins</>
                      ) : (
                        <><ShoppingBag className="h-3 w-3" /> Redeem</>
                      )}
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
