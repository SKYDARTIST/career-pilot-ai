"use client";

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    target_role: string | null;
    years_experience: number | null;
    subscription_tier: 'free' | 'pro' | 'lifetime';
    subscription_expires_at: string | null;
}

interface UseAuthReturn {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// Demo user for hackathon demo mode
const DEMO_USER: User = {
    id: 'demo-user-id',
    email: 'demo@careerpilot.ai',
    app_metadata: {},
    user_metadata: { full_name: 'Demo User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
} as User;

const DEMO_PROFILE: Profile = {
    id: 'demo-user-id',
    email: 'demo@careerpilot.ai',
    full_name: 'Demo User',
    target_role: 'AI Engineer',
    years_experience: 3,
    subscription_tier: 'pro',
    subscription_expires_at: null,
};

export function useAuth(): UseAuthReturn {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setProfile(data as Profile);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        // Demo mode: Use mock user (unless user explicitly signed out)
        if (isDemoMode) {
            const signedOut = localStorage.getItem('demo_signed_out');
            if (signedOut === 'true') {
                setLoading(false);
                return;
            }
            setUser(DEMO_USER);
            setProfile(DEMO_PROFILE);
            setLoading(false);
            return;
        }

        // Production mode: Use real auth
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    await fetchProfile(user.id);
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                if (event === 'SIGNED_OUT') {
                    router.push('/login');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (isDemoMode) {
            localStorage.setItem('demo_signed_out', 'true');
            setUser(null);
            setProfile(null);
            router.push('/login');
            return;
        }

        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        router.push('/login');
    };

    return { user, profile, loading, signOut, refreshProfile };
}
