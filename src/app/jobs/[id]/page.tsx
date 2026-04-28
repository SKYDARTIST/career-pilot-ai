"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
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
import ReasoningExplainer from '../../components/ReasoningExplainer';
import BrandLink from '../../components/BrandLink';
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

type DocumentTab = 'details' | 'resume' | 'cover';

const documentTabs: Array<{ key: DocumentTab; label: string; icon: typeof FileText }> = [
    { key: 'details', label: 'Overview', icon: FileText },
    { key: 'resume', label: 'Tailored Resume', icon: Sparkles },
    { key: 'cover', label: 'Cover Letter', icon: MessageSquare },
];

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<DocumentTab>('details');

    useEffect(() => {
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

        if (params.id) {
            fetchJob();
        }
    }, [params.id]);

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
                router.push('/dashboard');
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

    const handlePrint = () => {
        window.print();
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
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
                <XCircle className="w-12 h-12 text-destructive" />
                <h1 className="text-xl font-bold">Job not found</h1>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-primary hover:underline flex items-center gap-2 font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary"
                            >
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <BrandLink />
                            <div className="mx-1 h-6 w-[1px] bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{job.company}</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{job.title}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <button
                                onClick={handleDelete}
                                className="rounded-lg p-2 text-red-500/50 transition-colors hover:bg-red-500/5 hover:text-red-500"
                                title="Remove job"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Primary Content */}
                    <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Block */}
                        <div className="mb-8 rounded-lg border border-white/70 bg-white p-8 shadow-2xl shadow-[#8794b8]/20 md:flex md:items-start md:justify-between">
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border w-fit">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Job #{job.id}</span>
                                    </div>
                                    {job.tags && job.tags.map((tag, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 w-fit">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{tag}</span>
                                        </div>
                                    ))}
                                </div>
                                <h2 className="text-4xl font-black leading-tight tracking-tight text-foreground">{job.title}</h2>
                                <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                    <span className="text-lg">{job.company}</span>
                                    <span className="text-border">|</span>
                                    <div className="flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(job.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 min-w-[120px] rounded-lg border border-border bg-secondary p-6 text-right md:mt-0">
                                <div className={`text-5xl font-black tracking-tight ${job.score >= 8 ? 'text-emerald-600' : 'text-primary'}`}>
                                    {job.score}
                                </div>
                                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match Score</div>
                            </div>
                        </div>

                        {/* AI Rationale */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            <ReasoningExplainer reasoning={job.reasoning} />
                        </div>

                        {/* Document Tabs */}
                        <div className="space-y-6">
                            <div className="flex w-full overflow-x-auto rounded-lg border border-border bg-white p-1 md:w-fit">
                                {documentTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex shrink-0 items-center gap-2 rounded-md px-6 py-2 text-xs font-black transition-all ${activeTab === tab.key
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
                                className="min-h-[400px] rounded-lg border border-border bg-white p-6 shadow-sm md:p-10"
                            >
                                {activeTab === 'details' && (
                                    <div className="space-y-6 max-w-2xl mx-auto">
                                        <h3 className="text-xl font-bold tracking-tight">Strategy Notes</h3>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add interview notes, outreach angles, or application reminders..."
                                            className="h-64 w-full resize-none rounded-lg border border-border bg-secondary p-6 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={saving}
                                            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-black text-white shadow-xl shadow-primary/15 transition-all hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            Save Notes
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'resume' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight">Tailored Resume</h3>
                                                <p className="mt-1 text-xs font-black uppercase tracking-widest text-muted-foreground">Generated for this role</p>
                                            </div>
                                            {job.tailoredResume && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handlePrint}
                                                        className="no-print flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black text-white transition-all hover:bg-primary/90"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Export PDF
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(job.tailoredResume || '')}
                                                        className="no-print flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-black transition-all hover:bg-border"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                        {copied ? 'Captured' : 'Copy Text'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {job.tailoredResume ? (
                                            <div className="min-h-[500px] rounded-lg border border-border bg-secondary p-8 text-sm leading-relaxed text-foreground">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{job.tailoredResume}</ReactMarkdown>
                                                </div>
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
                                                <h3 className="text-xl font-black tracking-tight">Cover Letter</h3>
                                                <p className="mt-1 text-xs font-black uppercase tracking-widest text-muted-foreground">Generated application copy</p>
                                            </div>
                                            {job.coverLetter && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handlePrint}
                                                        className="no-print flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black text-white transition-all hover:bg-primary/90"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Export PDF
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(job.coverLetter || '')}
                                                        className="no-print flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-black transition-all hover:bg-border"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                        {copied ? 'Captured' : 'Copy Text'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {job.coverLetter ? (
                                            <div className="min-h-[500px] rounded-lg border border-border bg-secondary p-8 text-sm leading-relaxed text-foreground">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{job.coverLetter}</ReactMarkdown>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale">
                                                <MessageSquare className="w-16 h-16 mb-6" />
                                                <p className="text-sm font-black uppercase tracking-[.2em]">Cover Letter Pending</p>
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
                        <div className="rounded-lg border border-border bg-white p-8 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground mb-6">
                                Pipeline Status
                            </h3>
                            <div className="space-y-3">
                                {['Found', 'Applied', 'Interviewing', 'Offered', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={`group relative w-full overflow-hidden rounded-lg border px-5 py-3 text-left text-xs font-black transition-all ${job.status === status
                                            ? 'border-primary bg-primary text-white'
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
                            <h3 className="mb-4 ml-2 text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground">
                                External Links
                            </h3>
                            {job.url && (
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 font-black text-white shadow-xl shadow-primary/15 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open Original Posting
                                </a>
                            )}
                            <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center">
                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Application Review</p>
                                <p className="text-[10px] font-medium leading-tight text-muted-foreground/70">Review generated materials before sending anything externally.</p>
                            </div>
                        </div>

                        {/* Technical Metadata */}
                        <div className="rounded-lg border border-border bg-white p-8 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground mb-6">
                                Job Metadata
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
