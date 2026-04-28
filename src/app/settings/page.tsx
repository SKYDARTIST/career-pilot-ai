"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Loader2,
    Bell,
    Filter,
    User,
    CheckCircle2,
    Zap,
    Shield,
    Database,
    Globe
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BrandLink from '../components/BrandLink';
import ThemeToggle from '../components/ThemeToggle';

interface Preferences {
    email: string;
    filters: {
        minScore: number;
        locations: string[];
        salaryMin: number | null;
        salaryMax: number | null;
        jobTypes: string[];
    };
    notifications: {
        emailEnabled: boolean;
        dailyDigest: boolean;
        instantAlerts: boolean;
        minScoreForAlert: number;
    };
    profile: {
        name: string;
        targetRole: string;
        skills: string;
        yearsExperience: number | null;
        workHistory: string;
    };
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function SettingsPage() {
    const router = useRouter();
    const [prefs, setPrefs] = useState<Preferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [activeTab, setActiveTab] = useState('identity');
    const [hasOAuthSession, setHasOAuthSession] = useState(false);

    const googleAccountConnected = !isDemoMode && hasOAuthSession;

    useEffect(() => {
        fetchPreferences();
        if (isDemoMode) {
            setHasOAuthSession(false);
            return;
        }

        createClient().auth.getSession().then(({ data }) => {
            setHasOAuthSession(Boolean(data.session));
        });
    }, []);

    async function fetchPreferences() {
        try {
            const res = await fetch('/api/preferences');
            const data = await res.json();
            setPrefs(data);
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!prefs) return;
        setSaving(true);
        try {
            const res = await fetch('/api/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prefs)
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const addLocation = () => {
        if (!prefs || !locationInput.trim()) return;
        if (!prefs.filters.locations.includes(locationInput.trim())) {
            setPrefs({
                ...prefs,
                filters: {
                    ...prefs.filters,
                    locations: [...prefs.filters.locations, locationInput.trim()]
                }
            });
        }
        setLocationInput('');
    };

    const removeLocation = (loc: string) => {
        if (!prefs) return;
        setPrefs({
            ...prefs,
            filters: {
                ...prefs.filters,
                locations: prefs.filters.locations.filter(l => l !== loc)
            }
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!prefs) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Initialization Failure</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary"
                            >
                                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <BrandLink />
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-xl shadow-primary/15 transition-all ${saved
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                    : 'bg-primary hover:bg-primary/90 text-white'
                                    }`}
                            >
                                {saving ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : saved ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                    <Save className="w-3.5 h-3.5" />
                                )}
                                {saved ? 'Synchronized' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-5xl space-y-10 px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Section header */}
                <div className="rounded-lg border border-white/70 bg-white p-8 shadow-2xl shadow-[#8794b8]/20">
                    <p className="mb-4 inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#596174]">
                        Profile controls
                    </p>
                    <h2 className="text-4xl font-black tracking-tight">Preferences</h2>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#60677b]">
                        Tune your profile, alerts, filters, and account status for better job discovery.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    {/* Left: Section Selection */}
                    <div className="space-y-2 md:col-span-3">
                        {[
                            { key: 'identity', label: 'Identity', icon: User },
                            { key: 'telemetry', label: 'Telemetry', icon: Bell },
                            { key: 'filters', label: 'Filters', icon: Filter },
                            { key: 'security', label: 'Security', icon: Shield },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-black transition-all ${activeTab === item.key ? 'border border-primary bg-primary text-white' : 'border border-transparent text-[#596174] hover:border-border hover:bg-white'}`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Right: Form Content */}
                    <div className="space-y-10 rounded-lg border border-border bg-white p-6 shadow-sm md:col-span-9 md:p-8">

                        {/* Profile Block */}
                        {activeTab === 'identity' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-[.2em] text-muted-foreground">User Identity</h3>
                                </div>
                                <div className="grid gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</label>
                                        <input
                                            type="text"
                                            value={prefs.profile.name}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                profile: { ...prefs.profile, name: e.target.value }
                                            })}
                                            placeholder="John Doe"
                                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Market Position (Target Role)</label>
                                        <input
                                            type="text"
                                            value={prefs.profile.targetRole}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                profile: { ...prefs.profile, targetRole: e.target.value }
                                            })}
                                            placeholder="AI Engineer, Data Scientist, etc."
                                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Experience / Work History</label>
                                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">AI Source of Truth</span>
                                        </div>
                                        <textarea
                                            value={prefs.profile.workHistory}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                profile: { ...prefs.profile, workHistory: e.target.value }
                                            })}
                                            placeholder="Paste your existing resume points, projects, and career history here. The AI will use this as the ONLY source of truth for tailoring."
                                            className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium min-h-[160px] resize-none"
                                        />
                                        <p className="text-[9px] text-muted-foreground ml-1">Provide your real experience to prevent the AI from inventing fake projects.</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Core Skills (One per line)</label>
                                        <textarea
                                            value={prefs.profile.skills}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                profile: { ...prefs.profile, skills: e.target.value }
                                            })}
                                            placeholder="Next.js&#10;TypeScript&#10;n8n Automation"
                                            rows={5}
                                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Block */}
                        {activeTab === 'telemetry' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-[.2em] text-muted-foreground">Alert Telemetry</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="glass-card p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Zap className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Instant Core Alert</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">High-priority matches</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={prefs.notifications.instantAlerts}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                notifications: { ...prefs.notifications, instantAlerts: e.target.checked }
                                            })}
                                            className="w-5 h-5 rounded-md accent-primary border-border"
                                        />
                                    </div>

                                    <div className="glass-card p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Database className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Daily Data Digest</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">24h node summary</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={prefs.notifications.dailyDigest}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                notifications: { ...prefs.notifications, dailyDigest: e.target.checked }
                                            })}
                                            className="w-5 h-5 rounded-md accent-primary border-border"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters Block */}
                        {activeTab === 'filters' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-[.2em] text-muted-foreground">Scoring Thresholds</h3>
                                </div>
                                <div className="space-y-8 p-8 glass-card">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-foreground">Global Minimum Fit Score</label>
                                            <span className="text-lg font-black text-primary font-mono">{prefs.filters.minScore}.0</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={prefs.filters.minScore}
                                            onChange={(e) => setPrefs({
                                                ...prefs,
                                                filters: { ...prefs.filters, minScore: parseInt(e.target.value) }
                                            })}
                                            className="w-full accent-primary bg-secondary h-2 rounded-full appearance-none cursor-pointer"
                                        />
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold text-right">Sensitivity: HIGH</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-foreground">Operational Sectors (Locations)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={locationInput}
                                                onChange={(e) => setLocationInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                                                placeholder="Add Sector (e.g., Remote, San Francisco)"
                                                className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            />
                                            <button
                                                onClick={addLocation}
                                                className="px-4 py-2 bg-secondary hover:bg-border border border-border rounded-xl text-xs font-bold transition-all"
                                            >
                                                Link Sector
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {prefs.filters.locations.map((loc) => (
                                                <span
                                                    key={loc}
                                                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all hover:border-primary/50 group"
                                                >
                                                    <Globe className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    {loc}
                                                    <button
                                                        onClick={() => removeLocation(loc)}
                                                        className="text-muted-foreground hover:text-red-500 font-bold ml-1"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Block */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-[.2em] text-muted-foreground">Security & Privacy</h3>
                                </div>
                                <div className="glass-card p-8 space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold">Connected Accounts</p>
                                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-border">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Google Account</p>
                                                    <p className="text-[10px] text-muted-foreground">Primary authentication</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${googleAccountConnected ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                                {googleAccountConnected ? 'Connected' : 'Not Connected'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-sm font-bold mb-2">Data Export</p>
                                        <p className="text-xs text-muted-foreground mb-4">Download all your data in JSON format.</p>
                                        <button className="px-4 py-2 bg-secondary hover:bg-border border border-border rounded-xl text-xs font-bold transition-all">
                                            Export My Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
