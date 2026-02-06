"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Search,
    FileCheck,
    ArrowLeft,
    Bot,
    Brain,
    Zap,
    Loader2,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

interface Job {
    id: number;
    score: number;
    status: string;
    company: string;
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-card p-6 group hover:border-primary/50 transition-all">
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-secondary border border-border ${color} transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <div className="text-4xl font-black font-mono tracking-tighter">{value}</div>
    </div>
);

export default function StatsPage() {
    const { user, loading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
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
        const avgScore = total > 0 ? (jobs.reduce((acc, job) => acc + job.score, 0) / total).toFixed(1) : 0;
        const highFit = jobs.filter(j => j.score >= 8).length;
        const timeSaved = (total * 15 / 60).toFixed(1); // Assuming 15 mins saved per job

        const statusCounts = jobs.reduce((acc: any, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {});

        const topCompanies = Object.entries(
            jobs.reduce((acc: any, job) => {
                acc[job.company] = (acc[job.company] || 0) + 1;
                return acc;
            }, {})
        )
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5);

        return { total, avgScore, highFit, timeSaved, statusCounts, topCompanies };
    }, [jobs]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Navigation */}
            <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between h-14 items-center">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-secondary rounded-lg transition-colors border border-transparent hover:border-border"
                            >
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">
                                    CareerPilot<span className="text-primary">.ai</span>
                                </span>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black tracking-tight mb-3">Intelligence Dashboard</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Real-time analytics from your autonomous career agent. Gemini is maximizing your market efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Jobs Analyzed"
                        value={stats.total}
                        icon={Search}
                        color="text-blue-500"
                    />
                    <StatCard
                        title="Avg. Match Score"
                        value={`${stats.avgScore}/10`}
                        icon={Brain}
                        color="text-amber-500"
                    />
                    <StatCard
                        title="Time Saved"
                        value={`${stats.timeSaved}h`}
                        icon={Clock}
                        color="text-emerald-500"
                    />
                    <StatCard
                        title="Priority Matches"
                        value={stats.highFit}
                        icon={Zap}
                        color="text-primary"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Status Distribution */}
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Pipeline Velocity</h2>
                        </div>
                        <div className="space-y-6">
                            {Object.entries({
                                Found: "bg-blue-500",
                                Applied: "bg-amber-500",
                                Interviewing: "bg-emerald-500",
                                Offered: "bg-primary",
                                Rejected: "bg-muted-foreground"
                            }).map(([status, color]) => {
                                const count = stats.statusCounts[status] || 0;
                                const percentage = stats.total > 0 ? (count / stats.total * 100) : 0;
                                return (
                                    <div key={status} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                            <span className="text-muted-foreground">{status}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full ${color}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Companies */}
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Sector Penetration</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.topCompanies.length > 0 ? (
                                stats.topCompanies.map(([company, count]: any, i: number) => (
                                    <div key={company} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center font-bold text-xs border border-border">
                                                {i + 1}
                                            </div>
                                            <span className="font-bold text-foreground">{company}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground">{count} Signals</span>
                                            <ArrowLeft className="w-4 h-4 text-primary rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-muted-foreground text-sm italic">
                                    Awaiting more market data to identify trends...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Impact Message */}
                <div className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-3xl text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-black mb-2 tracking-tight">Your Career is Accelerating</h3>
                        <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                            By using CareerPilot AI, you've saved approximately <span className="text-primary font-bold">{stats.timeSaved} hours</span> of manual searching.
                            Your match accuracy is trending <span className="text-emerald-500 font-bold">upwards</span>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
