"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  FileText,
  Bell,
  ExternalLink,
  Loader2,
  TrendingUp,
  Clock,
  Briefcase,
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
import ReactMarkdown from 'react-markdown';
import StatusDropdown from '../components/StatusDropdown';
import BrandLink from '../components/BrandLink';
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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfirmTypes, setShowConfirmTypes] = useState<{ type: 'reset' | 'clear', count: number } | null>(null);
  const [minScore, setMinScore] = useState(7);
  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  const [discoveryMessage, setDiscoveryMessage] = useState('');

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

  const handleRunDiscovery = async () => {
    setDiscoveryRunning(true);
    setDiscoveryMessage('');

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxJobs: 5 }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Discovery failed');
      }

      setDiscoveryMessage(`Saved ${data.saved || 0}/${data.discovered || 0} jobs`);
      await fetchJobs();
    } catch (error) {
      setDiscoveryMessage(error instanceof Error ? error.message : 'Discovery failed');
    } finally {
      setDiscoveryRunning(false);
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
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary/20">
      {/* Professional Nav */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <BrandLink />

            <div className="flex items-center gap-2">
              <div className="mr-2 hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 md:flex">
                <div className="h-1.5 w-1.5 rounded-full bg-[#73c66b]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#596174]">Demo workspace live</span>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7c6bc] bg-[#f4c8bd] text-xs font-black text-primary">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-white py-2 shadow-2xl"
                    >
                      <div className="border-b border-border bg-secondary px-4 py-3">
                        <p className="text-sm font-bold truncate">{profile?.full_name || 'Member'}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-tighter">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[9px] font-black uppercase text-primary">
                            {profile?.subscription_tier || 'Free'} Plan
                          </span>
                        </div>
                      </div>
                      <a href="/stats" className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary flex items-center gap-2 transition-colors">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        Market Insights
                      </a>
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
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-5 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 md:px-8 md:py-10">

        {/* Minimal Hero / Stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="motion-panel mb-10 overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-6 shadow-2xl shadow-[#8794b8]/20 backdrop-blur md:p-8 dark:border-border dark:bg-card"
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dce1ee] bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#596174]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#73c66b]" />
                AI job board
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Ideal Matches</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#60677b]">
                CareerPilot ranks live opportunities, prepares application materials, and keeps your shortlist clean.
              </p>
            </div>
            <button
              onClick={handleRunDiscovery}
              disabled={discoveryRunning}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-white shadow-xl shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {discoveryRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {discoveryRunning ? 'Running Discovery' : 'Run Discovery'}
            </button>
          </div>
          {discoveryMessage && (
            <div className="mt-5 rounded-lg border border-border bg-secondary px-4 py-3 text-xs font-bold text-[#596174]">
              {discoveryMessage}
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Jobs Scanned", value: stats.total, icon: Search, color: "text-blue-500" },
              { label: "Top Fits", value: stats.highFit, icon: Sparkles, color: "text-amber-500" },
              { label: "Submitted", value: stats.applied, icon: CheckCircle2, color: "text-emerald-500" },
              { label: "Interviews", value: stats.interviewing, icon: Clock, color: "text-primary" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-border bg-secondary/90 p-5 transition-all hover:-translate-y-0.5 hover:border-[#cbd1df] hover:bg-white dark:hover:bg-secondary"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className={`rounded-xl border border-border bg-white p-2.5 shadow-sm ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#596174]">{stat.label}</span>
                </div>
                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View Controls */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.38, delay: 0.08 }}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center"
        >
          <div className="flex w-full overflow-x-auto rounded-2xl border border-border bg-white/90 p-1 shadow-sm backdrop-blur md:w-fit dark:bg-card">
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
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${activeFilter === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-[#596174] hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeFilter === tab.key ? 'bg-white/15 text-white' : 'bg-secondary text-[#596174]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative group md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full rounded-2xl border border-border bg-white/90 py-3 pl-10 pr-4 text-xs font-bold shadow-sm transition-all placeholder:text-[#9ca3b7] focus:outline-none focus:ring-1 focus:ring-primary md:w-64 dark:bg-card"
            />
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white/90 px-2 py-1 shadow-sm dark:bg-card">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#596174]">Threshold</span>
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
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Feed */}
          <div className="space-y-5 lg:col-span-8">
            {loading && jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 pro-card border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Loading your job feed...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 pro-card border-dashed bg-secondary/20">
                <Briefcase className="w-10 h-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No jobs in this view</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Adjust your filters or run discovery.</p>
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
                    initial={{ opacity: 0, y: 16, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedJob(job)}
                    className="pro-card-hover group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-white/95 p-5 shadow-sm backdrop-blur md:p-6 dark:bg-card"
                  >
                    {/* Score Indicator */}
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#c9b9ff] transition-colors group-hover:bg-primary" />

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary transition-colors group-hover:border-[#cbd1df]">
                            <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black leading-tight tracking-tight">{job.title}</h3>
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
                          <div className={`text-3xl font-black tracking-tight ${job.score >= 8 ? 'text-emerald-600' : 'text-primary'}`}>
                            {job.score}<span className="text-[10px] font-bold text-muted-foreground ml-0.5">/10</span>
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-tight text-muted-foreground">Match Score</div>
                        </div>
                      </div>

                      <div className="group/quote relative mb-5 rounded-xl border border-border bg-secondary/90 px-4 py-3">
                        <div className="text-xs text-foreground italic leading-relaxed line-clamp-2 pr-6">
                          {job.reasoning ? (
                            `"${job.reasoning}"`
                          ) : (
                            <span className="font-normal not-italic opacity-50">Analysis pending. Run discovery to generate reasoning.</span>
                          )}
                        </div>
                        <Brain className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-hover/quote:text-primary transition-colors" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-1.5">
                        {job.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[9px] font-black uppercase tracking-tight text-[#596174]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
                        <StatusDropdown
                          jobId={job.id}
                          currentStatus={job.status}
                          onStatusChange={handleStatusChange}
                        />
                        <div className="h-4 w-[1px] bg-border" />
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedJob(job)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-primary">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              window.location.href = `/jobs/${job.id}`;
                            }}
                            className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-primary"
                          >
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
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.42, delay: 0.16 }}
              className="motion-panel overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm backdrop-blur dark:bg-card"
            >
              <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-3">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#596174]">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Discovery Activity
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="h-64 space-y-3 overflow-y-auto bg-white p-5 text-[10px] dark:bg-card">
                <div className="font-black uppercase tracking-widest text-[#9ca3b7]">Ready</div>
                <div className="text-[#596174]">Market search uses your saved profile and filters.</div>
                <div className="font-bold text-primary">Gemini scoring, culture fit, resume, and cover letter run in parallel.</div>
                <div className="font-bold text-emerald-600">High-fit matches appear in the feed.</div>
                <div className="mt-3 animate-pulse font-black text-primary">Run discovery when you want fresh jobs.</div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Demo Health</span>
                    <span className="text-[9px] font-bold text-green-600">READY</span>
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
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/settings'}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-black text-white shadow-xl shadow-primary/15 transition-all hover:-translate-y-0.5"
              >
                <Settings className="w-4 h-4" />
                Tune Preferences
              </button>
              <div className="pro-card border-dashed bg-white/95 p-4 text-center dark:bg-card">
                <p className="mb-1 text-[10px] font-black uppercase text-[#596174]">Demo Ready</p>
                <p className="text-xs font-bold text-[#60677b]">Standalone discovery runs without n8n.</p>
              </div>
            </div>
          </div>
        </div>
      </main >

      {/* Job Detail Drawer */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-border bg-white shadow-2xl md:w-[520px] dark:bg-card"
            >
              <div className="sticky top-0 z-10 border-b border-border bg-white/95 px-6 py-5 backdrop-blur-md dark:bg-card/95">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close job details"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="pr-12">
                  <h2 className="text-xl font-black tracking-tight leading-tight">{selectedJob.title}</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1">{selectedJob.company}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${selectedJob.score >= 8 ? 'bg-emerald-500/10 text-emerald-500' :
                    selectedJob.score >= 6 ? 'bg-blue-500/10 text-blue-500' :
                      'bg-zinc-500/10 text-muted-foreground'
                    }`}>
                    {selectedJob.score}/10 match
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-secondary border border-border text-muted-foreground">
                    {selectedJob.status}
                  </span>
                  {selectedJob.url && (
                    <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/10">
                      Posting <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {selectedJob.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedJob.tags.map(tag => (
                      <span key={tag} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-8 px-6 py-6">
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Tailored Resume
                  </h3>
                  <div className="rounded-2xl border border-border bg-secondary p-4 text-sm leading-relaxed">
                    {selectedJob.tailoredResume && selectedJob.tailoredResume !== 'N/A' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{selectedJob.tailoredResume}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tailored resume generated for this job.</p>
                    )}
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Cover Letter
                    </h3>
                    {selectedJob.coverLetter && selectedJob.coverLetter !== 'N/A' && (
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedJob.coverLetter || '')}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-black text-white transition-colors hover:bg-primary/90"
                      >
                        Copy Cover Letter
                      </button>
                    )}
                  </div>
                  <div className="rounded-2xl border border-border bg-secondary p-4 text-sm leading-relaxed">
                    {selectedJob.coverLetter && selectedJob.coverLetter !== 'N/A' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{selectedJob.coverLetter}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No cover letter generated for this job.</p>
                    )}
                  </div>
                </motion.section>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

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
            CareerPilot AI demo workspace
          </div>
          <div className="flex items-center gap-6">
            <span className="cursor-pointer text-[10px] font-bold uppercase text-muted-foreground transition-colors hover:text-primary">Privacy</span>
            <span className="cursor-pointer text-[10px] font-bold uppercase text-muted-foreground transition-colors hover:text-primary">Terms</span>
          </div>
        </div>
      </footer>
    </div >
  );
}
