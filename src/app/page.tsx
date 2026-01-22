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
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusDropdown from './components/StatusDropdown';
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
    // Poll for new jobs every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate real stats
  const stats = useMemo(() => {
    const total = jobs.length;
    const highFit = jobs.filter(j => j.score >= 8).length;
    const applied = jobs.filter(j => j.status === 'Applied').length;
    const interviewing = jobs.filter(j => j.status === 'Interviewing').length;
    return { total, highFit, applied, interviewing };
  }, [jobs]);

  // Filtered jobs based on active tab
  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobs;
    return jobs.filter(job => job.status === activeFilter);
  }, [jobs, activeFilter]);

  // Handle status change
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

  // Handle notes save
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

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                CareerPilot AI
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-4">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  ROBOT ONLINE (MARATHON MODE)
                </div>
                <div className="text-[10px] text-neutral-500">Autonomous Agent Syncing...</div>
              </div>
              <a href="/settings" className="p-2 rounded-full hover:bg-white/5">
                <Settings className="w-5 h-5 text-neutral-400" />
              </a>
              <button className="p-2 rounded-full hover:bg-white/5 relative">
                <Bell className="w-5 h-5 text-neutral-400" />
                {stats.highFit > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-black" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full uppercase">
                        {profile?.subscription_tier || 'free'}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Jobs Scanned", value: stats.total.toString(), icon: Search, color: "text-blue-400" },
            { label: "High Fit (8+)", value: stats.highFit.toString(), icon: Brain, color: "text-purple-400" },
            { label: "Applied", value: stats.applied.toString(), icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Interviewing", value: stats.interviewing.toString(), icon: Clock, color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex justify-between items-start mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === 'all'
              ? jobs.length
              : jobs.filter(j => j.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                  }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Job Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Autonomous Job Feed
              </h2>
            </div>

            <div className="space-y-4">
              {loading && jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                  <span>Loading job feed...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <Briefcase className="w-8 h-8 mb-2 opacity-50" />
                  <span>No jobs in this category</span>
                </div>
              ) : (
                filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    className="glass-card p-5 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/jobs/${job.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center border border-white/5">
                          <Briefcase className="w-6 h-6 text-neutral-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{job.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-neutral-500">
                            <span>{job.company}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(job.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`text-xl font-black ${job.score >= 8 ? 'text-emerald-400' : job.score >= 6 ? 'text-blue-400' : 'text-neutral-400'}`}>
                          {job.score}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Fit Score</div>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-neutral-300 italic line-clamp-2">
                          "{job.reasoning}"
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        {job.tags && job.tags.length > 0 ? (
                          job.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-neutral-400 border border-white/5">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-neutral-600">No tags</span>
                        )}
                        {job.notes && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                              setNotes(job.notes || '');
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <MessageSquare className="w-4 h-4 text-amber-400" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown
                          jobId={job.id}
                          currentStatus={job.status}
                          onStatusChange={handleStatusChange}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                            setNotes(job.notes || '');
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                          title="Add notes"
                        >
                          <FileText className="w-4 h-4 text-neutral-500" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Agent Status & Artifacts */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border-blue-500/20 bg-blue-950/20">
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Live Agent Operations
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1 h-auto bg-blue-500/20 rounded-full" />
                  <div className="space-y-3">
                    {[
                      { t: "12:30:05", m: "Triggering Cron: Periodic Job Discovery" },
                      { t: "12:30:12", m: "Fetching LinkedIn (scrapingdog_api)..." },
                      { t: "12:30:45", m: `${stats.total} jobs in database` },
                      { t: "12:31:02", m: `${stats.highFit} high-match jobs found` },
                    ].map((log, i) => (
                      <div key={i} className="text-[11px] leading-tight">
                        <span className="text-neutral-600 mr-2 font-mono">{log.t}</span>
                        <span className="text-neutral-400">{log.m}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-[11px] text-blue-400 font-bold italic animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Agent ready for next scan...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-neutral-400">Avg. Fit Score</span>
                  <span className="text-lg font-bold text-blue-400">
                    {jobs.length > 0 ? (jobs.reduce((sum, j) => sum + j.score, 0) / jobs.length).toFixed(1) : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-neutral-400">Success Rate</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {stats.applied > 0 ? Math.round((stats.interviewing / stats.applied) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <a
              href="/settings"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <Settings className="w-4 h-4" />
              Configure Preferences
            </a>
          </div>
        </div>
      </main>

      {/* Notes Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedJob.title}</h3>
                  <p className="text-sm text-neutral-500">{selectedJob.company}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Application Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-neutral-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-[.2em]">
          Powered by Gemini 3 + n8n + Vibe Engineering
        </div>
      </footer>
    </div>
  );
}
