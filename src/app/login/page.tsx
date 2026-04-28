"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    Eye,
    EyeOff,
    AlertCircle,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BrandLink from '../components/BrandLink';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                // Clear demo signed out flag on successful login
                localStorage.removeItem('demo_signed_out');
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        }
    };

    const handleDemoLogin = () => {
        localStorage.removeItem('demo_signed_out');
        window.location.href = '/dashboard';
    };

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 selection:bg-primary/20">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-white/55" />
            <div className="absolute right-6 top-6 z-20">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/70 bg-white shadow-2xl shadow-[#8794b8]/25 md:grid-cols-[1fr_420px]"
            >
                <div className="hidden bg-[#f6f8ff] p-10 md:block">
                    <BrandLink className="mb-16" />

                    <div className="max-w-md">
                        <p className="mb-5 inline-flex rounded-full border border-border bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#596174]">
                            Demo-ready job search
                        </p>
                        <h1 className="text-5xl font-black leading-tight tracking-tight">Your AI job board is ready.</h1>
                        <p className="mt-5 text-sm font-medium leading-6 text-[#60677b]">
                            Enter demo mode or sign in to review matches, tailored resumes, and generated cover letters.
                        </p>
                    </div>

                    <div className="mt-14 grid grid-cols-3 gap-3">
                        {['4 jobs', '1.7h saved', '4 AI nodes'].map((item) => (
                            <div key={item} className="rounded-lg border border-border bg-white p-4 text-sm font-black">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:p-10">
                    <div className="mb-8 text-center md:hidden">
                        <BrandLink className="mb-4 justify-center" />
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-foreground">Welcome back</h2>
                        <p className="mt-2 text-sm font-medium text-[#60677b]">Sign in or enter the standalone demo.</p>
                    </div>

                {/* Login Container */}
                <div className="relative overflow-hidden">

                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-600">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-bold leading-tight">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Work Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Identity Key
                                </label>
                                <span className="text-[10px] text-primary hover:underline cursor-pointer font-bold">Forgot?</span>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-12 text-sm text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-black text-white shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-white px-4 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-secondary py-3 text-xs font-black transition-all hover:bg-white active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {isDemoMode && (
                        <button
                            onClick={handleDemoLogin}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-primary bg-primary py-3 text-xs font-black text-white transition-all hover:bg-primary/90 active:scale-[0.98]"
                        >
                            Enter Demo Mode
                        </button>
                    )}

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                        <p className="text-xs text-muted-foreground font-medium">
                            First time here?{' '}
                            <Link href="/signup" className="text-primary hover:underline font-bold">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3 text-[#8b92a3]">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure auth enabled</span>
                </div>
                </div>
            </motion.div>
        </div>
    );
}
