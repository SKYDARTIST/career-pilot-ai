"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Loader2,
    Mail,
    Bell,
    Filter,
    User,
    CheckCircle2,
    Sliders,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

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
        yearsExperience: number | null;
    };
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];

export default function SettingsPage() {
    const router = useRouter();
    const [prefs, setPrefs] = useState<Preferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [locationInput, setLocationInput] = useState('');

    useEffect(() => {
        fetchPreferences();
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

    const toggleJobType = (type: string) => {
        if (!prefs) return;
        const types = prefs.filters.jobTypes.includes(type)
            ? prefs.filters.jobTypes.filter(t => t !== type)
            : [...prefs.filters.jobTypes, type];
        setPrefs({
            ...prefs,
            filters: { ...prefs.filters, jobTypes: types }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!prefs) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <p className="text-neutral-500">Failed to load preferences</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-neutral-400" />
                            </button>
                            <h1 className="font-bold text-lg">Settings</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${saved
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-lg font-bold">Profile</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Your Name</label>
                            <input
                                type="text"
                                value={prefs.profile.name}
                                onChange={(e) => setPrefs({
                                    ...prefs,
                                    profile: { ...prefs.profile, name: e.target.value }
                                })}
                                placeholder="John Doe"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Target Role</label>
                            <input
                                type="text"
                                value={prefs.profile.targetRole}
                                onChange={(e) => setPrefs({
                                    ...prefs,
                                    profile: { ...prefs.profile, targetRole: e.target.value }
                                })}
                                placeholder="AI Engineer, Data Scientist, etc."
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Years of Experience</label>
                            <input
                                type="number"
                                value={prefs.profile.yearsExperience || ''}
                                onChange={(e) => setPrefs({
                                    ...prefs,
                                    profile: { ...prefs.profile, yearsExperience: e.target.value ? parseInt(e.target.value) : null }
                                })}
                                placeholder="3"
                                min="0"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Notifications Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-lg font-bold">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        type="email"
                                        value={prefs.email}
                                        onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
                                        placeholder="you@example.com"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg cursor-pointer hover:bg-black/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <div className="font-medium">Instant Alerts</div>
                                        <div className="text-xs text-neutral-500">Get notified immediately for high-fit jobs</div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.notifications.instantAlerts}
                                    onChange={(e) => setPrefs({
                                        ...prefs,
                                        notifications: { ...prefs.notifications, instantAlerts: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded accent-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg cursor-pointer hover:bg-black/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="font-medium">Daily Digest</div>
                                        <div className="text-xs text-neutral-500">Receive a summary of jobs each day</div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.notifications.dailyDigest}
                                    onChange={(e) => setPrefs({
                                        ...prefs,
                                        notifications: { ...prefs.notifications, dailyDigest: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded accent-blue-500"
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Minimum Score for Alerts: {prefs.notifications.minScoreForAlert}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={prefs.notifications.minScoreForAlert}
                                onChange={(e) => setPrefs({
                                    ...prefs,
                                    notifications: { ...prefs.notifications, minScoreForAlert: parseInt(e.target.value) }
                                })}
                                className="w-full accent-blue-500"
                            />
                            <div className="flex justify-between text-xs text-neutral-600">
                                <span>1</span>
                                <span>10</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Filter className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-bold">Job Filters</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Minimum Fit Score: {prefs.filters.minScore}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={prefs.filters.minScore}
                                onChange={(e) => setPrefs({
                                    ...prefs,
                                    filters: { ...prefs.filters, minScore: parseInt(e.target.value) }
                                })}
                                className="w-full accent-emerald-500"
                            />
                            <div className="flex justify-between text-xs text-neutral-600">
                                <span>1 (All jobs)</span>
                                <span>10 (Perfect matches only)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Preferred Locations</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                                    placeholder="Add location (e.g., Remote, New York)"
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <button
                                    onClick={addLocation}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {prefs.filters.locations.map((loc) => (
                                    <span
                                        key={loc}
                                        className="px-3 py-1 bg-white/5 rounded-full text-sm flex items-center gap-2 border border-white/10"
                                    >
                                        {loc}
                                        <button
                                            onClick={() => removeLocation(loc)}
                                            className="text-neutral-500 hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {prefs.filters.locations.length === 0 && (
                                    <span className="text-sm text-neutral-600">No location preferences (all locations)</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-3">Job Types</label>
                            <div className="flex flex-wrap gap-2">
                                {JOB_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleJobType(type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${prefs.filters.jobTypes.includes(type)
                                                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                                                : 'bg-white/5 text-neutral-500 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Min Salary ($K)</label>
                                <input
                                    type="number"
                                    value={prefs.filters.salaryMin || ''}
                                    onChange={(e) => setPrefs({
                                        ...prefs,
                                        filters: { ...prefs.filters, salaryMin: e.target.value ? parseInt(e.target.value) : null }
                                    })}
                                    placeholder="50"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Max Salary ($K)</label>
                                <input
                                    type="number"
                                    value={prefs.filters.salaryMax || ''}
                                    onChange={(e) => setPrefs({
                                        ...prefs,
                                        filters: { ...prefs.filters, salaryMax: e.target.value ? parseInt(e.target.value) : null }
                                    })}
                                    placeholder="200"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
