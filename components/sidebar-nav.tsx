'use client';

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Trophy,
  Route,
  ShoppingBag,
  Leaf,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';

export interface SidebarNavProps {
  user: {
    userName: string;
    level: number;
    xp: number;
    unlockedBadges: string[];
    theme: 'light' | 'dark';
  } | null;
  activeSection: string;
  onChangeSection: (section: string) => void;
  onLogout: () => void;
  onThemeToggle: () => void;
}

export function SidebarNav({
  user,
  activeSection,
  onChangeSection,
  onLogout,
  onThemeToggle,
}: SidebarNavProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Habits & Tracker', icon: ClipboardList },
    { id: 'chatbot', label: 'Eco Chatbot', icon: MessageSquare },
    { id: 'roadmap', label: 'Roadmap Plan', icon: Route },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'marketplace', label: 'Rewards Shop', icon: ShoppingBag },
    { id: 'offsets', label: 'Carbon Offsets', icon: Leaf },
  ];

  // Resolve Level Names
  const getLevelName = (lvl: number) => {
    if (lvl === 1) return 'Green Novice';
    if (lvl === 2) return 'Eco Apprentice';
    if (lvl === 3) return 'Carbon Guardian';
    if (lvl === 4) return 'Sustainability Champ';
    return 'Climate Leader';
  };

  const currentLevelXP = user ? user.xp % 100 : 0;
  const levelProgress = user ? currentLevelXP : 0;

  return (
    <aside className="w-68 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 sticky top-0">
      
      {/* Brand Title */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-500/10">
          🌱
        </div>
        <div>
          <h1 className="text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white leading-none">EcoSphere</h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Carbon Hub</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeSection(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all select-none ${
                isActive
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 pl-3'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
        
        {/* Theme Toggler */}
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-2">
            {user?.theme === 'light' ? <Moon className="h-4 w-4 text-indigo-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <span>{user?.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Toggle</span>
        </button>

        {user && (
          <div className="space-y-3.5">
            {/* Quick Profile */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
                {user.userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.userName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate leading-none">
                    Lvl {user.level} • {getLevelName(user.level)}
                  </span>
                </div>
              </div>
            </div>

            {/* Level XP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>XP Progress</span>
                <span>{levelProgress} / 100</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 hover:text-red-600 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out session</span>
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}
