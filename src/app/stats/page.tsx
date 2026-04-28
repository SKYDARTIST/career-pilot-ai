"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Search,
    ArrowLeft,
    Brain,
    Zap,
    Loader2,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { LucideIcon } from 'lucide-react';
import BrandLink from '../components/BrandLink';
import ThemeToggle from '../components/ThemeToggle';

interface Job {
    id: number;
    score: number;
    status: string;
    company: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
    <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-all hover:border-[#cbd1df]">
        <div className="mb-4 flex items-center gap-3">
            <div className={`rounded-lg border border-border bg-secondary p-2 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <div className="text-4xl font-black tracking-tight">{value}</div>
    </div>
);

export default function StatsPage() {
    const { loading: authLoading } = useAuth();
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
        const jobCount = jobs.length;
        const total = jobCount;
        const avgScore = total > 0 ? (jobs.reduce((acc, job) => acc + job.score, 0) / total).toFixed(1) : 0;
        const highFit = jobs.filter(j => j.score >= 8).length;
        const timeSaved = (jobCount * 25 / 60).toFixed(1) + 'h';

        const statusCounts = jobs.reduce<Record<string, number>>((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {});

        const topCompanies = Object.entries(
            jobs.reduce<Record<string, number>>((acc, job) => {
                acc[job.company] = (acc[job.company] || 0) + 1;
                return acc;
            }, {})
        )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return { total, avgScore, highFit, timeSaved, statusCounts, topCompanies };
    }, [jobs]);

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary"
                            >
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </Link>
                            <BrandLink />
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Link href="/dashboard" className="rounded-full bg-primary px-4 py-2 text-xs font-black text-white">
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-10 rounded-lg border border-white/70 bg-white p-8 shadow-2xl shadow-[#8794b8]/20">
                    <p className="mb-4 inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#596174]">
                        Insights
                    </p>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Application Analytics</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#60677b]">
                        Track match quality, pipeline movement, and time saved from analyzed jobs.
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
                        value={stats.timeSaved}
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

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Status Distribution */}
                    <div className="rounded-lg border border-border bg-white p-8 shadow-sm">
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
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
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
                    <div className="rounded-lg border border-border bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Sector Penetration</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.topCompanies.length > 0 ? (
                                stats.topCompanies.map(([company, count], i) => (
                                    <div key={company} className="group flex items-center justify-between rounded-lg border border-border bg-secondary p-4 transition-all hover:border-[#cbd1df]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center font-bold text-xs border border-border">
                                                {i + 1}
                                            </div>
                                            <span className="font-bold text-foreground">{company}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground">{count} signals</span>
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
                <div className="group relative mt-10 overflow-hidden rounded-lg border border-border bg-white p-8 text-center shadow-sm">
                    <div className="relative z-10">
                        <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                        <h3 className="mb-2 text-2xl font-black tracking-tight">Your search is getting lighter</h3>
                        <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                            By using CareerPilot AI, you&apos;ve saved approximately <span className="text-primary font-bold">{stats.timeSaved}</span> of manual searching.
                            Your match accuracy is trending <span className="text-emerald-500 font-bold">upwards</span>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
