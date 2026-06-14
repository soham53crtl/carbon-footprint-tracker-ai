'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Bot, Sparkles, Leaf } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { useEcoApp } from '@/hooks/useEcoApp';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STARTERS = [
  'What are the easiest ways to reduce my footprint?',
  'How does my diet affect carbon emissions?',
  'Should I buy an EV or use public transit?',
  'What\'s the most impactful change I can make today?',
  'How do carbon offsets work?',
  'Give me a weekly eco action plan.',
];

export default function ChatbotPage() {
  const router = useRouter();
  const { user, loading, toggleTheme, logout } = useEcoApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi there! 🌿 I'm your EcoSphere AI assistant. I can help you understand your carbon footprint, suggest personalised actions, explain sustainability concepts, and guide you on your journey to net-zero.\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const token = localStorage.getItem('ecosphere-token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.ok ? data.reply : 'Sorry, I could not process that right now. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Network error. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse-soft">💬</div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav user={user} activeSection="chatbot" onChangeSection={(s) => router.push(`/${s}`)} onLogout={logout} onThemeToggle={toggleTheme} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-card-border bg-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              Eco AI Chatbot <Sparkles className="h-4 w-4 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400">Powered by Gemini · Always learning</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            >
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 mr-3 shadow-sm">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-xl px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-sm shadow-lg shadow-emerald-500/20'
                    : 'bg-card border border-card-border text-slate-700 dark:text-slate-300 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start animate-fade-in">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 mr-3">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <div className="bg-card border border-card-border rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <span className="text-xs text-slate-400 font-semibold">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 animate-fade-up">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  id={`starter-${s.slice(0, 20).replace(/\W/g, '-')}`}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/8 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-card-border bg-card">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              id="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your carbon footprint…"
              rows={1}
              style={{ resize: 'none' }}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition placeholder:text-slate-400 max-h-32 overflow-y-auto"
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 128) + 'px';
              }}
            />
            <button
              id="chatbot-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending}
              className="h-11 w-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white flex items-center justify-center transition shadow-md shadow-emerald-500/20 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </main>
    </div>
  );
}
