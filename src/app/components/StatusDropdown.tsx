"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = [
    { value: 'Found', label: 'Found', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500', dot: 'bg-zinc-400' },
    { value: 'Applied', label: 'Applied', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500', dot: 'bg-emerald-500' },
    { value: 'Interviewing', label: 'Interviewing', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500', dot: 'bg-blue-500' },
    { value: 'Offered', label: 'Offered', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500', dot: 'bg-purple-500' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500', dot: 'bg-red-500' },
];

interface StatusDropdownProps {
    jobId: number;
    currentStatus: string;
    onStatusChange: (jobId: number, newStatus: string) => void;
}

export default function StatusDropdown({ jobId, currentStatus, onStatusChange }: StatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (newStatus: string) => {
        if (newStatus === status) {
            setIsOpen(false);
            return;
        }

        setStatus(newStatus);
        setIsOpen(false);
        onStatusChange(jobId, newStatus);
    };

    return (
        <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className={`text-[10px] font-bold uppercase tracking-tight px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-border bg-card hover:bg-secondary active:scale-95`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${currentOption.dot}`} />
                <span className="text-foreground">{currentOption.label}</span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 z-[60] min-w-[160px] glass-card overflow-hidden py-1.5"
                    >
                        <div className="px-3 py-1.5 border-b border-border mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Change Node Status</span>
                        </div>
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option.value);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-secondary/80 transition-colors group ${option.value === status ? 'bg-secondary/50' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${option.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />
                                    <span className={`font-medium ${option.value === status ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                        {option.label}
                                    </span>
                                </div>
                                {option.value === status && (
                                    <Check className="w-3 h-3 text-primary" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
