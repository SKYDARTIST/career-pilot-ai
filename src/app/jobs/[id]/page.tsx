"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Briefcase,
    Clock,
    Brain,
    FileText,
    ExternalLink,
    Loader2,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Trash2,
    Copy,
    Check,
    Calendar,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';

interface Job {
    id: number;
    title: string;
    company: string;
    score: number;
    reasoning: string;
    status: string;
    tags: string[];
    notes?: string;
    url?: string;
    createdAt: string;
    updatedAt?: string;
    tailoredResume?: string;
    coverLetter?: string;
}

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'resume' | 'cover'>('details');

    useEffect(() => {
        if (params.id) {
            fetchJob();
        }
    }, [params.id]);

    async function fetchJob() {
        try {
            const res = await fetch(`/api/jobs/${params.id}`);
            if (!res.ok) throw new Error('Job not found');
            const data = await res.json();
            setJob(data);
            setNotes(data.notes || '');
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!job) return;
        try {
            const res = await fetch(`/api/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setJob({ ...job, status: newStatus });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleSaveNotes = async () => {
        if (!job) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });
            if (res.ok) {
                setJob({ ...job, notes });
            }
        } catch (error) {
            console.error('Failed to save notes:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!job || !confirm('Are you sure you want to remove this node?')) return;
        try {
            const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/');
            }
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <XCircle className="w-12 h-12 text-destructive" />
                <h1 className="text-xl font-bold">Node missing from grid</h1>
                <button
                    onClick={() => router.push('/')}
                    className="text-primary hover:underline flex items-center gap-2 font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20 font-sans">
            {/* Nav */}
            <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center h-14 justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors border border-transparent hover:border-border"
                            >
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <div className="h-6 w-[1px] bg-border mx-1" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{job.company}</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{job.title}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDelete}
                                className="p-2 hover:bg-red-500/5 rounded-lg transition-colors text-red-500/50 hover:text-red-500"
                                title="Remove node"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="h-6 w-[1px] bg-border mx-1" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Primary Content */}
                    <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Block */}
                        <div>
                            <div className="flex items-start justify-between mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border w-fit">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Node #{job.id}</span>
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter text-foreground leading-[0.9]">{job.title}</h2>
                                    <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                        <span className="text-lg">{job.company}</span>
                                        <span className="text-border">|</span>
                                        <div className="flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(job.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right p-6 bg-secondary/30 border border-border rounded-2xl min-w-[120px]">
                                    <div className={`text-5xl font-black tracking-tighter ${job.score >= 8 ? 'text-emerald-500' : 'text-primary'}`}>
                                        {job.score}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Accuracy</div>
                                </div>
                            </div>

                            {/* AI Rationale */}
                            <div className="p-8 bg-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden group">
                                <Brain className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/10 transition-transform group-hover:scale-110 duration-1000" />
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/30">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[.2em] text-primary mb-2">Gemini Analysis Core</p>
                                        <p className="text-lg font-medium text-foreground leading-relaxed italic">
                                            "{job.reasoning}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Tabs */}
                        <div className="space-y-6">
                            <div className="flex gap-1 p-1 bg-secondary border border-border rounded-xl w-fit">
                                {[
                                    { key: 'details', label: 'Overview', icon: FileText },
                                    { key: 'resume', label: 'Tailored Resume', icon: Sparkles },
                                    { key: 'cover', label: 'Cover Letter', icon: MessageSquare },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                                            ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-10 min-h-[400px]"
                            >
                                {activeTab === 'details' && (
                                    <div className="space-y-6 max-w-2xl mx-auto">
                                        <h3 className="text-xl font-bold tracking-tight">Strategy Notes</h3>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Define your entry strategy or robot instructions..."
                                            className="w-full h-64 bg-secondary border border-border rounded-2xl p-6 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={saving}
                                            className="w-full py-4 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            Commit Local Changes
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'resume' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold tracking-tight">Tailored Curriculum Vitae</h3>
                                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-black">Optimized for Gemini Recruiter Flow</p>
                                            </div>
                                            {job.tailoredResume && (
                                                <button
                                                    onClick={() => copyToClipboard(job.tailoredResume || '')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-border border border-border rounded-lg text-xs font-bold transition-all"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? 'Captured' : 'Copy Text'}
                                                </button>
                                            )}
                                        </div>
                                        {job.tailoredResume ? (
                                            <div className="bg-secondary/50 border border-border rounded-2xl p-8 whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">
                                                {job.tailoredResume}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale">
                                                <FileText className="w-16 h-16 mb-6" />
                                                <p className="text-sm font-black uppercase tracking-[.2em]">Generation Pending</p>
                                                <p className="text-[10px] mt-2 max-w-[200px]">Node score below generation threshold (minimum 8.0 required)</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'cover' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold tracking-tight">Executive Briefing</h3>
                                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-black">Generated Content for Application Body</p>
                                            </div>
                                            {job.coverLetter && (
                                                <button
                                                    onClick={() => copyToClipboard(job.coverLetter || '')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-border border border-border rounded-lg text-xs font-bold transition-all"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? 'Captured' : 'Copy Text'}
                                                </button>
                                            )}
                                        </div>
                                        {job.coverLetter ? (
                                            <div className="bg-secondary/50 border border-border rounded-2xl p-8 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                                {job.coverLetter}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale">
                                                <MessageSquare className="w-16 h-16 mb-6" />
                                                <p className="text-sm font-black uppercase tracking-[.2em]">Briefing Absent</p>
                                                <p className="text-[10px] mt-2 max-w-[200px]">Target score below automation criteria (minimum 8.0 required)</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Sidebar Panels */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Status Engine */}
                        <div className="glass-card p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground mb-6">
                                Pipeline Sector
                            </h3>
                            <div className="space-y-3">
                                {['Found', 'Applied', 'Interviewing', 'Offered', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={`w-full px-5 py-3 rounded-xl text-left text-xs font-bold transition-all border group relative overflow-hidden ${job.status === status
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border text-muted-foreground hover:border-zinc-400 hover:text-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${job.status === status ? 'bg-primary' : 'bg-zinc-300'}`} />
                                                {status}
                                            </div>
                                            {job.status === status && <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* External Actions */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground mb-4 ml-2">
                                External Links
                            </h3>
                            {job.url && (
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-all rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Launch Original Node
                                </a>
                            )}
                            <div className="p-6 glass-card bg-secondary/20 border-dashed text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Safety Lock Active</p>
                                <p className="text-[9px] font-mono text-muted-foreground/60 leading-tight">All external comms are routed through the CareerPilot AI proxy server for your protection.</p>
                            </div>
                        </div>

                        {/* Technical Metadata */}
                        <div className="glass-card p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground mb-6">
                                Node Metadata
                            </h3>
                            <div className="space-y-5 font-mono text-[10px]">
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-muted-foreground uppercase">Created</span>
                                    <span className="font-bold">{formatDate(job.createdAt)}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-muted-foreground uppercase">Identity</span>
                                    <span className="font-bold">#CP-{job.id}00X</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-muted-foreground uppercase">Security</span>
                                    <span className="font-bold text-emerald-500 uppercase tracking-tighter">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
