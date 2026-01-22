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
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';

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

const STATUS_COLORS: Record<string, string> = {
    'Found': 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
    'Applied': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Interviewing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Offered': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
};

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
        if (!job || !confirm('Are you sure you want to remove this job?')) return;
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
                <XCircle className="w-12 h-12 text-red-400" />
                <h1 className="text-xl font-bold">Job not found</h1>
                <button
                    onClick={() => router.push('/')}
                    className="text-blue-400 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-400" />
                        </button>
                        <div className="flex-1">
                            <h1 className="font-bold text-lg">{job.title}</h1>
                            <p className="text-sm text-neutral-500">{job.company}</p>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                            title="Remove job"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Score Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-neutral-900 rounded-xl flex items-center justify-center border border-white/5">
                                        <Briefcase className="w-8 h-8 text-neutral-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{job.title}</h2>
                                        <p className="text-neutral-400">{job.company}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-black ${job.score >= 8 ? 'text-emerald-400' : job.score >= 6 ? 'text-blue-400' : 'text-neutral-400'}`}>
                                        {job.score}
                                    </div>
                                    <div className="text-xs text-neutral-500 font-bold uppercase">Fit Score</div>
                                </div>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Brain className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-blue-400 uppercase mb-1">AI Analysis</div>
                                        <p className="text-neutral-300">{job.reasoning}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {job.tags && job.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-neutral-400 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-sm text-neutral-500">
                                <Clock className="w-4 h-4" />
                                Found on {formatDate(job.createdAt)}
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-white/10 pb-2">
                            {[
                                { key: 'details', label: 'Details', icon: FileText },
                                { key: 'resume', label: 'Tailored Resume', icon: FileText },
                                { key: 'cover', label: 'Cover Letter', icon: MessageSquare },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
                                            ? 'bg-blue-600 text-white'
                                            : 'text-neutral-400 hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 rounded-2xl min-h-[200px]"
                        >
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg">Application Notes</h3>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this application, interview prep, contacts, etc..."
                                        className="w-full h-40 bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    />
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Save Notes
                                    </button>
                                </div>
                            )}

                            {activeTab === 'resume' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg">Tailored Resume</h3>
                                        {job.tailoredResume && (
                                            <button
                                                onClick={() => copyToClipboard(job.tailoredResume || '')}
                                                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        )}
                                    </div>
                                    {job.tailoredResume ? (
                                        <div className="bg-black/50 border border-white/10 rounded-lg p-4 whitespace-pre-wrap text-sm text-neutral-300">
                                            {job.tailoredResume}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-neutral-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No tailored resume generated yet</p>
                                            <p className="text-xs mt-1">Resumes are generated for jobs with score ≥ 8</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'cover' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg">Cover Letter</h3>
                                        {job.coverLetter && (
                                            <button
                                                onClick={() => copyToClipboard(job.coverLetter || '')}
                                                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        )}
                                    </div>
                                    {job.coverLetter ? (
                                        <div className="bg-black/50 border border-white/10 rounded-lg p-4 whitespace-pre-wrap text-sm text-neutral-300">
                                            {job.coverLetter}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-neutral-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No cover letter generated yet</p>
                                            <p className="text-xs mt-1">Cover letters are generated for jobs with score ≥ 8</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Application Status
                            </h3>
                            <div className="space-y-2">
                                {['Found', 'Applied', 'Interviewing', 'Offered', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all border ${job.status === status
                                                ? STATUS_COLORS[status]
                                                : 'border-white/5 text-neutral-500 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            {status}
                                            {job.status === status && <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="glass-card p-6 rounded-2xl space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Actions
                            </h3>
                            {job.url && (
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Original Posting
                                </a>
                            )}
                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl font-medium text-neutral-400 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                        </div>

                        {/* Timeline */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                                Timeline
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-3 text-sm">
                                    <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full" />
                                    <div>
                                        <div className="text-neutral-300">Job discovered</div>
                                        <div className="text-xs text-neutral-600">{formatDate(job.createdAt)}</div>
                                    </div>
                                </div>
                                {job.updatedAt && (
                                    <div className="flex gap-3 text-sm">
                                        <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full" />
                                        <div>
                                            <div className="text-neutral-300">Last updated</div>
                                            <div className="text-xs text-neutral-600">{formatDate(job.updatedAt)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
