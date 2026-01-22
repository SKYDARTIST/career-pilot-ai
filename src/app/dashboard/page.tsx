"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  Search,
  CheckCircle2,
  FileText,
  Bell,
  ExternalLink,
  Loader2,
  TrendingUp,
  Clock,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Brain,
  Settings,
  X,
  MessageSquare,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusDropdown from '../components/StatusDropdown';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

// Types
interface Job {
  id: number;
  title: string;
  company: string;
  score: number;
  reasoning: string;
  status: string;
  tags: string[];
  notes?: string;
  time: string;
  createdAt: string;
  url?: string;
}

// Filter tabs
const FILTER_TABS = [
  { key: 'all', label: 'All Jobs' },
  { key: 'Found', label: 'Found' },
  { key: 'Applied', label: 'Applied' },
  { key: 'Interviewing', label: 'Interviewing' },
  { key: 'Offered', label: 'Offered' },
];

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = jobs.length;
    const highFit = jobs.filter(j => j.score >= 8).length;
    const applied = jobs.filter(j => j.status === 'Applied').length;
    const interviewing = jobs.filter(j => j.status === 'Interviewing').length;
    return { total, highFit, applied, interviewing };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobs;
    return jobs.filter(job => job.status === activeFilter);
  }, [jobs, activeFilter]);

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/jobs?id=${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (res.ok) {
        setJobs(prev => prev.map(job =>
          job.id === selectedJob.id ? { ...job, notes } : job
        ));
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Professional Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                CareerPilot<span className="text-primary">.ai</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border mr-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Autonomous Agent Online</span>
              </div>

              <button className="p-2 rounded-md hover:bg-secondary transition-colors relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                {stats.highFit > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </button>

              <div className="h-6 w-[1px] bg-border mx-1" />

              <ThemeToggle />

              <div className="h-6 w-[1px] bg-border mx-1" />

              {/* User Identity */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 hover:bg-secondary rounded-lg transition-all"
                >
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border bg-secondary/30">
                        <p className="text-sm font-bold truncate">{profile?.full_name || 'Member'}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-tighter">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase border border-primary/10">
                            {profile?.subscription_tier || 'Free'} Plan
                          </span>
                        </div>
                      </div>
                      <a href="/settings" className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary flex items-center gap-2 transition-colors">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Account Settings
                      </a>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          signOut();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/5 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Minimal Hero / Stats */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Command Center</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Autonomous agent syncing with LinkedIn, Indeed, and Beehiiv. Gemini is currently analyzing 442 market signals.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Jobs Scanned", value: stats.total, icon: Search, color: "text-blue-500" },
              { label: "Top Fits", value: stats.highFit, icon: Sparkles, color: "text-amber-500" },
              { label: "Submitted", value: stats.applied, icon: CheckCircle2, color: "text-emerald-500" },
              { label: "Interviews", value: stats.interviewing, icon: Clock, color: "text-primary" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 group hover:border-primary/50 transition-all cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-secondary border border-border ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold font-mono tracking-tighter">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex p-1 bg-secondary border border-border rounded-xl w-fit">
            {FILTER_TABS.map((tab) => {
              const count = tab.key === 'all' ? jobs.length : jobs.filter(j => j.status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeFilter === tab.key
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab.label}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search robot feed..."
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none w-full md:w-64 transition-all group-hover:border-zinc-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {loading && jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 pro-card border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Synchronizing agent database...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 pro-card border-dashed bg-secondary/20">
                <Briefcase className="w-10 h-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No active nodes in this sector</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Adjust your filters or wait for the next robot scan.</p>
              </div>
            ) : (
              <div className="grid gap-5">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 group pro-card-hover relative overflow-hidden"
                  >
                    {/* Score Indicator */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />

                    <div onClick={() => window.location.href = `/jobs/${job.id}`} className="cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
                            <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold tracking-tight">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-medium text-muted-foreground">{job.company}</span>
                              <span className="text-muted-foreground/30">•</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(job.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-black tracking-tighter ${job.score >= 8 ? 'text-emerald-500' : 'text-primary'}`}>
                            {job.score}<span className="text-[10px] font-bold text-muted-foreground ml-0.5">/10</span>
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Match Accuracy</div>
                        </div>
                      </div>

                      <div className="py-3 px-4 bg-secondary/50 rounded-xl border border-border/50 mb-5 relative group/quote">
                        <div className="text-xs text-foreground italic leading-relaxed line-clamp-2 pr-6">
                          "{job.reasoning}"
                        </div>
                        <Brain className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-hover/quote:text-primary transition-colors" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-1.5">
                        {job.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-secondary text-muted-foreground border border-border rounded-full uppercase tracking-tight">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusDropdown
                          jobId={job.id}
                          currentStatus={job.status}
                          onStatusChange={handleStatusChange}
                        />
                        <div className="h-4 w-[1px] bg-border" />
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelectedJob(job); setNotes(job.notes || ''); }} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => window.location.href = `/jobs/${job.id}`} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-8">
            {/* Live Console */}
            <div className="glass-card overflow-hidden">
              <div className="bg-secondary/50 px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Agent Telemetry
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="p-5 font-mono text-[10px] space-y-3 bg-card h-64 overflow-y-auto">
                <div className="opacity-40">-- INITIATING CLOUD SYNC --</div>
                <div className="text-zinc-500">[0.0001s] <span className="text-foreground">Fetching market signals (n8n_v3)</span></div>
                <div className="text-zinc-500">[0.0004s] <span className="text-primary font-bold">GEMINI ANALYZING 44 JOBS...</span></div>
                <div className="text-zinc-500">[0.0009s] <span className="text-emerald-500">3 HIGH-FIT MATCHES DETECTED</span></div>
                <div className="text-zinc-500 text-xs mt-3 animate-pulse text-primary font-bold">_ AGENT STANDBY.</div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">System Health</span>
                    <span className="text-[9px] text-green-500 font-bold">OPTIMAL</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/settings'}
                className="w-full py-4 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
              >
                <Settings className="w-4 h-4" />
                Optimization Engine
              </button>
              <div className="pro-card p-4 bg-secondary/20 border-dashed text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Last Data Integrity Check</p>
                <p className="text-xs font-mono">22 JAN 2026 - 18:04:11</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Note Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setSelectedJob(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold tracking-tight mb-1">{selectedJob.company}</h3>
              <p className="text-sm text-muted-foreground mb-6">{selectedJob.title}</p>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log internal communication or agent instructions..."
                className="w-full h-40 bg-secondary border border-border rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />

              <div className="flex gap-3 mt-6">
                <button onClick={() => setSelectedJob(null)} className="flex-1 py-3 bg-secondary hover:bg-border rounded-xl text-sm font-bold transition-colors">Discard</button>
                <button onClick={handleSaveNotes} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Commit Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-border py-8 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground">
            Google Hackathon Edition 2026 • Gemini 3.5 Core
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer hover:text-primary transition-colors">Privacy Neuralink</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer hover:text-primary transition-colors">Terms of Synth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
