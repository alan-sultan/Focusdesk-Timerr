'use client';

import React from 'react';
import { Sidebar, MobileNav } from '@/components/navigation';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, Flame, Lightbulb, ShieldCheck, TrendingUp, Bell, User, Zap, XCircle } from 'lucide-react';
import { useTimer } from '@/lib/timer-context';
import { cn } from '@/lib/utils';

const DUMMY_DATA = [
  { day: 'Oct 12', hours: 3.2 },
  { day: 'Oct 13', hours: 5.1 },
  { day: 'Today', hours: 6.8 },
  { day: 'Oct 15', hours: 4.0 },
  { day: 'Oct 16', hours: 2.4 },
  { day: 'Oct 17', hours: 4.4 },
  { day: 'Oct 18', hours: 3.6 },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_DATA = [
  [3, 0, 2, 1],
  [0, 3, 3, 2],
  [2, 3, 0, 0],
  [3, 3, 3, 3],
  [0, 1, 2, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];

const RECENT_SESSIONS = [
  { id: 1, title: 'Design System Architecture', project: 'CHRONOS', duration: '90 min', status: 'Success', time: 'Today, 09:45 AM' },
  { id: 2, title: 'Database Schema Refactor', project: 'Backend API', duration: '45 min', status: 'Success', time: 'Oct 14, 02:15 PM' },
  { id: 3, title: 'Client Meeting Prep', project: 'Freelance', duration: '12 min', status: 'Aborted', time: 'Oct 14, 11:00 AM' },
] as const;

function getHeatmapColor(val: number) {
  switch (val) {
    case 3:
      return 'bg-[var(--primary)]';
    case 2:
      return 'bg-[var(--primary)]/50';
    case 1:
      return 'bg-[var(--primary)]/20';
    default:
      return 'bg-[var(--surface-container)]';
  }
}

export default function StatisticsPage() {
  const { isMounted } = useTimer();

  if (!isMounted) {
    return (
      <div className="flex bg-[var(--background)] min-h-screen text-[var(--foreground)] font-sans">
        <Sidebar />
        <main className="page-main with-mobile-nav flex-1 lg:ml-64 flex flex-col relative" />
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--background)] min-h-screen text-[var(--foreground)] font-sans">
      <Sidebar />

      <main className="page-main with-mobile-nav flex-1 lg:ml-64 flex flex-col relative">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h2 className="type-title">Performance</h2>
            <p className="type-subtitle">Analytics and Historical Data</p>
          </div>
          <div className="flex items-center space-x-4">
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--foreground)] transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--foreground)] transition-all">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="dashboard-card col-span-12 md:col-span-4 relative overflow-hidden group md:p-8">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="w-[120px] h-[120px]" />
            </div>
            <span className="text-[0.65rem] font-black text-[var(--on-surface-variant)] tracking-[0.3em] uppercase mb-4 block">Total focus time</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-[var(--foreground)] tracking-tighter">
                24<span className="text-[var(--primary)] text-2xl font-medium">h</span> 15
                <span className="text-[var(--primary)] text-2xl font-medium">m</span>
              </span>
            </div>
            <div className="mt-6 flex items-center text-[var(--secondary)] space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[0.7rem] font-bold tracking-widest uppercase">12% from last week</span>
            </div>
          </div>

          <div className="dashboard-card col-span-12 md:col-span-4 relative overflow-hidden group md:p-8">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 className="w-[120px] h-[120px]" />
            </div>
            <span className="text-[0.65rem] font-black text-[var(--on-surface-variant)] tracking-[0.3em] uppercase mb-4 block">Sessions completed</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-[var(--foreground)] tracking-tighter">42</span>
              <span className="text-[var(--surface-container)] font-black text-lg">/ 50 Goal</span>
            </div>
            <div className="mt-6 h-1 w-full bg-[var(--surface-container)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] w-[84%] shadow-[0_0_10px_rgba(225,29,72,0.3)]" />
            </div>
          </div>

          <div className="dashboard-card col-span-12 md:col-span-4 relative overflow-hidden group md:p-8">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Flame className="w-[120px] h-[120px]" />
            </div>
            <span className="text-[0.65rem] font-black text-[var(--on-surface-variant)] tracking-[0.3em] uppercase mb-4 block">Daily streak</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-[var(--foreground)] tracking-tighter">5</span>
              <span className="text-[var(--on-surface-variant)] font-black text-lg uppercase tracking-widest">Days</span>
            </div>
            <div className="mt-6 flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(225,29,72,0.5)]" />
              ))}
              {[6, 7].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[var(--surface-container)]" />
              ))}
            </div>
          </div>

          <div className="dashboard-card col-span-12 md:p-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[0.75rem] font-black text-[var(--foreground)] tracking-[0.3em] uppercase">Weekly Activity Density</h3>
              <div className="flex items-center space-x-2 text-[0.6rem] text-[var(--on-surface-variant)] tracking-widest uppercase">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-sm bg-[var(--surface-container)]" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/20" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/50" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--primary)]" />
                </div>
                <span>More</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-4">
              {WEEK_DAYS.map((day, dIdx) => (
                <div key={day} className="space-y-4">
                  <span className="text-[0.6rem] text-[var(--on-surface-variant)] uppercase tracking-widest block text-center">{day}</span>
                  <div className="grid grid-rows-4 gap-2">
                    {HEATMAP_DATA[dIdx].map((val, vIdx) => (
                      <div key={`${dIdx}-${vIdx}`} className={cn('h-10 rounded-lg transition-all hover:scale-105 cursor-pointer', getHeatmapColor(val))} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card col-span-12 md:col-span-8 h-[400px] flex flex-col md:p-8">
            <h3 className="text-[0.75rem] font-black text-[var(--foreground)] tracking-[0.3em] uppercase mb-12">Focus hours per day</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DUMMY_DATA} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold' }}
                    dy={16}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--surface-container)] border border-[var(--border)] px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md">
                            <p className="text-[8px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-1">{label}</p>
                            <p className="text-xl font-black text-[var(--foreground)]">{`${payload[0].value}h`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={24}>
                    {DUMMY_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.day === 'Today' ? 'var(--primary)' : 'var(--surface-container)'}
                        className="hover:fill-[var(--primary)] transition-all cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card col-span-12 md:col-span-4 relative flex flex-col md:p-8">
            <h3 className="text-[0.75rem] font-black text-[var(--foreground)] tracking-[0.3em] uppercase mb-8">Focus Insights</h3>
            <div className="space-y-6 flex-1">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">Peak Focus Time</p>
                  <p className="text-[0.7rem] text-[var(--on-surface-variant)] leading-relaxed">
                    You are 40% more likely to complete long sessions between 8:00 AM and 10:00 AM.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[var(--secondary)]/20 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-[var(--secondary)]" />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">Consistency Award</p>
                  <p className="text-[0.7rem] text-[var(--on-surface-variant)] leading-relaxed">
                    You&apos;ve hit your daily goal 4 days in a row. One more day for a perfect week.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 p-6 rounded-xl bg-[var(--surface-container)]/50 border border-[var(--border)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[0.6rem] font-black text-[var(--primary)] uppercase tracking-widest">Efficiency Score</span>
                <span className="text-xl font-black text-[var(--foreground)]">92%</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] w-[92%] shadow-[0_0_10px_rgba(225,29,72,0.3)]" />
              </div>
            </div>
          </div>
        </div>

        <section>
          <h3 className="text-[0.75rem] font-black text-[var(--foreground)] tracking-[0.3em] uppercase mb-8">Recent Sessions</h3>
          <div className="space-y-3">
            {RECENT_SESSIONS.map((session) => (
              <div key={session.id} className="dashboard-card grid grid-cols-12 items-center transition-all cursor-pointer group hover:bg-[var(--surface-container)]">
                <div className="col-span-1 flex justify-center">
                  {session.status === 'Success' ? (
                    <Zap className="w-5 h-5 text-[var(--primary)] opacity-50 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[var(--on-surface-variant)]" />
                  )}
                </div>
                <div className="col-span-4">
                  <p className="text-[0.75rem] font-bold text-[var(--foreground)] uppercase tracking-wide">{session.title}</p>
                  <p className="text-[0.65rem] text-[var(--on-surface-variant)] uppercase tracking-widest mt-1">Project: {session.project}</p>
                </div>
                <div className="col-span-3 text-center">
                  <span className="text-[0.75rem] font-bold text-[var(--foreground)] uppercase">{session.duration}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className={cn(
                      'text-[0.65rem] font-black border px-3 py-1 rounded-full uppercase tracking-widest',
                      session.status === 'Success'
                        ? 'text-[var(--secondary)] border-[var(--secondary)]/30'
                        : 'text-[var(--primary)] border-[var(--primary)]/30'
                    )}
                  >
                    {session.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[0.65rem] text-[var(--on-surface-variant)] uppercase tracking-widest">{session.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <MobileNav />
      </main>
    </div>
  );
}