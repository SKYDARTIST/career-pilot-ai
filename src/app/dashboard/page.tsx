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
  tailoredResume?: string;
  coverLetter?: string;
}

// Filter tabs
const FILTER_TABS = [
  { key: 'all', label: 'All Jobs' },
  { key: 'Found', label: 'Found' },
  { key: 'Applied', label: 'Applied' },
  { key: 'Interviewing', label: 'Interviewing' },
  { key: 'Offered', label: 'Offered' },
  { key: 'Rejected', label: 'Rejected' },
];

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfirmTypes, setShowConfirmTypes] = useState<{ type: 'reset' | 'clear', count: number } | null>(null);
  const [minScore, setMinScore] = useState(7);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchJobs() {
    try {
      // Fetch both jobs and preferences
      const [jobsRes, prefsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/preferences')
      ]);

      const jobsData = await jobsRes.json();
      const prefsData = await prefsRes.json();

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      if (prefsData && prefsData.filters && typeof prefsData.filters.minScore === 'number') {
        setMinScore(prefsData.filters.minScore);
      }
    } catch (error) {
      console.error("Failed to fetch jobs or preferences:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    // Stats should only reflect what the user actually sees (above threshold)
    const visibleJobs = jobs.filter(j => j.score >= minScore && j.status !== 'Rejected');

    const total = visibleJobs.length;
    const highFit = visibleJobs.filter(j => j.score >= 8).length;
    const applied = visibleJobs.filter(j => j.status === 'Applied').length;
    const interviewing = visibleJobs.filter(j => j.status === 'Interviewing').length;
    return { total, highFit, applied, interviewing };
  }, [jobs, minScore]);

  const filteredJobs = useMemo(() => {
    // Stage 1: Filter by score threshold
    const aboveThreshold = jobs.filter(job => job.score >= minScore);

    // Stage 2: Filter by tab status
    if (activeFilter === 'all') {
      // Exclude Rejected jobs from "All Jobs" tab to keep it focused
      // and only show those above threshold
      return jobs.filter(job => job.score >= minScore && job.status !== 'Rejected');
    }

    if (activeFilter === 'Rejected') {
      // Show ALL rejected jobs regardless of score in the specialized tab
      return jobs.filter(job => job.status === 'Rejected');
    }

    return jobs.filter(job => job.status === activeFilter && job.score >= minScore);
  }, [jobs, activeFilter, minScore]);

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

  const handleClearLowScores = async () => {
    const jobsToRemove = jobs.filter(j => j.score < minScore || j.status === 'Rejected');
    if (jobsToRemove.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/jobs/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: jobsToRemove.map(j => j.id) })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Bulk delete failed');
      }

      fetchJobs();
    } catch (error) {
      console.error('Failed to clear jobs:', error);
      alert(`Error clearing jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFeed = async () => {
    if (jobs.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/jobs/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: jobs.map(j => j.id) })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Reset failed');
      }

      setJobs([]);
      // Refresh to ensure sync
      fetchJobs();
    } catch (error) {
      console.error('Failed to reset feed:', error);
      alert(`Error resetting feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
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
              let count;
              if (tab.key === 'all') {
                count = jobs.filter(j => j.score >= minScore && j.status !== 'Rejected').length;
              } else if (tab.key === 'Rejected') {
                count = jobs.filter(j => j.status === 'Rejected').length;
              } else {
                count = jobs.filter(j => j.status === tab.key && j.score >= minScore).length;
              }
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

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary border border-border rounded-lg">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Threshold</span>
              <span className="text-xs font-black text-primary font-mono">{minScore}.0</span>
            </div>
            <div className="flex items-center gap-2">
              {jobs.length > 0 && (
                <button
                  onClick={() => setShowConfirmTypes({ type: 'reset', count: jobs.length })}
                  className="px-4 py-2 bg-zinc-500/10 hover:bg-zinc-500/20 text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  title="Wipe all historical data"
                >
                  <LogOut className="w-3 h-3 rotate-180" />
                  Reset Feed
                </button>
              )}
              {jobs.some(j => j.score < minScore || j.status === 'Rejected') && (
                <button
                  onClick={() => setShowConfirmTypes({ type: 'clear', count: jobs.filter(j => j.score < minScore || j.status === 'Rejected').length })}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clean Dashboard ({jobs.filter(j => j.score < minScore || j.status === 'Rejected').length})
                </button>
              )}
            </div>
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
                {jobs.length > 0 && (
                  <p className="text-xs text-amber-500 font-bold mt-4 animate-pulse">
                    {jobs.length} jobs detected below current threshold ({minScore})
                  </p>
                )}
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
                    className="glass-card p-6 group pro-card-hover relative"
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
                          {job.reasoning ? (
                            `"${job.reasoning}"`
                          ) : (
                            <span className="opacity-50 font-normal not-italic">Node active. Analysis protocol initiated... awaiting next scan cycle.</span>
                          )}
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
      </main >

      {/* Note Modal */}
      <AnimatePresence>
        {
          selectedJob && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setSelectedJob(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl p-8 overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-1">{selectedJob.company}</h3>
                    <p className="text-sm text-muted-foreground">{selectedJob.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedJob.score >= 8 ? 'bg-green-500/10 text-green-500' :
                        selectedJob.score >= 6 ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        Score: {selectedJob.score}/10
                      </span>
                      {selectedJob.url && (
                        <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          View Posting <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Reasoning */}
                {selectedJob.reasoning && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      AI Analysis
                    </h4>
                    <div className="bg-secondary/50 border border-border rounded-xl p-4 text-sm text-muted-foreground italic">
                      "{selectedJob.reasoning}"
                    </div>
                  </div>
                )}

                {/* Tailored Resume */}
                {selectedJob.tailoredResume && selectedJob.tailoredResume !== 'N/A' && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Tailored Resume
                    </h4>
                    <div className="bg-secondary/50 border border-border rounded-xl p-4 text-sm whitespace-pre-wrap">
                      {selectedJob.tailoredResume}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedJob.coverLetter && selectedJob.coverLetter !== 'N/A' && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Cover Letter
                    </h4>
                    <div className="bg-secondary/50 border border-border rounded-xl p-4 text-sm whitespace-pre-wrap">
                      {selectedJob.coverLetter}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log internal communication or agent instructions..."
                    className="w-full h-32 bg-secondary border border-border rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setSelectedJob(null)} className="flex-1 py-3 bg-secondary hover:bg-border rounded-xl text-sm font-bold transition-colors">Close</button>
                  <button onClick={handleSaveNotes} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Save Notes</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmTypes && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setShowConfirmTypes(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <ShieldCheck className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-xl font-bold tracking-tight mb-2">
                {showConfirmTypes.type === 'reset' ? 'System Reset Initiated' : 'Purge Low-Scoring Nodes'}
              </h3>

              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {showConfirmTypes.type === 'reset'
                  ? `WARNING: This will permanently delete ALL ${showConfirmTypes.count} jobs from your feed. This action cannot be undone.`
                  : `This will remove ${showConfirmTypes.count} jobs falling below your quality threshold (${minScore}/10).`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmTypes(null)}
                  className="flex-1 py-3 bg-secondary hover:bg-border rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showConfirmTypes.type === 'reset') handleResetFeed();
                    else handleClearLowScores();
                    setShowConfirmTypes(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
                >
                  Confirm Deletion
                </button>
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
    </div >
  );
}
