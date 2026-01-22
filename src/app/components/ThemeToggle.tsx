"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95 group relative overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="relative z-10 flex items-center justify-center">
                {theme === 'light' ? (
                    <Moon className="w-4 h-4" />
                ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                )}
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${theme === 'light' ? 'bg-zinc-950/5 opacity-0 group-hover:opacity-100' : 'bg-amber-400/10 opacity-0 group-hover:opacity-100'}`} />
        </button>
    );
}
