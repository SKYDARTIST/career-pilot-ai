"use client";

import Link from 'next/link';
import { Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BrandLinkProps {
    className?: string;
}

export default function BrandLink({ className = '' }: BrandLinkProps) {
    const { user } = useAuth();
    const href = user ? '/dashboard' : '/';

    return (
        <Link href={href} className={`flex items-center gap-3 group ${className}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/15 transition-transform group-hover:scale-105">
                <Bot className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">CareerPilot</span>
        </Link>
    );
}
