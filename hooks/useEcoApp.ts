'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  level: number;
  xp: number;
  greenCoins: number;
  streak: number;
  totalCO2Saved: number;
  unlockedBadges: string[];
  theme: 'light' | 'dark';
  baselineFootprint: number | null;
  baselineBreakdown: {
    energy: number;
    transport: number;
    food: number;
    shopping: number;
  } | null;
  weeklyGoalKg: number;
  monthlySavings: number[];
}

export interface Activity {
  id: string;
  habitId: string;
  title: string;
  category: string;
  co2Saved: number;
  xpGained: number;
  icon: string;
  timestamp: string;
  note?: string;
}

export function useEcoApp() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  // ── Auth init ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ecosphere-token');
      const storedUser = localStorage.getItem('ecosphere-user');
      if (!storedToken) {
        router.replace('/login');
        return;
      }
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── Theme ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const html = document.documentElement;
    if (user.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('ecosphere-theme', user.theme);
  }, [user?.theme]);

  // ── API helper ─────────────────────────────────────────────
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const storedToken = localStorage.getItem('ecosphere-token');
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
          ...(options.headers ?? {}),
        },
      });
      if (res.status === 401) {
        localStorage.removeItem('ecosphere-token');
        localStorage.removeItem('ecosphere-user');
        router.replace('/login');
        throw new Error('Unauthorised');
      }
      return res;
    },
    [router]
  );

  // ── Refresh user from server ───────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authFetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('ecosphere-user', JSON.stringify(data.user));
      }
    } catch (_) {}
  }, [authFetch]);

  // ── Fetch activity log ─────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    try {
      const res = await authFetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (_) {}
  }, [authFetch]);

  // ── Log a habit ────────────────────────────────────────────
  const logHabit = useCallback(
    async (habitId: string, note?: string) => {
      const res = await authFetch('/api/activities', {
        method: 'POST',
        body: JSON.stringify({ habitId, note }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        await fetchActivities();
      }
      return { ok: res.ok, data };
    },
    [authFetch, refreshUser, fetchActivities]
  );

  // ── Toggle theme ───────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' };
    });
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('ecosphere-token');
    localStorage.removeItem('ecosphere-user');
    localStorage.removeItem('ecosphere-theme');
    document.documentElement.classList.remove('dark');
    router.replace('/');
  }, [router]);

  return {
    user,
    setUser,
    token,
    loading,
    activities,
    authFetch,
    refreshUser,
    fetchActivities,
    logHabit,
    toggleTheme,
    logout,
  };
}
