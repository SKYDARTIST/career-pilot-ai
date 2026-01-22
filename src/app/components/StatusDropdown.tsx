"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = [
    { value: 'Found', label: 'Found', color: 'bg-neutral-500/20 text-neutral-400' },
    { value: 'Applied', label: 'Applied', color: 'bg-emerald-500/20 text-emerald-400' },
    { value: 'Interviewing', label: 'Interviewing', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'Offered', label: 'Offered', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${currentOption.color} hover:ring-2 hover:ring-white/10`}
            >
                {currentOption.label}
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-50 min-w-[140px] bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option.value);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${option.value === status ? 'bg-white/5' : ''
                                    }`}
                            >
                                <span className={`px-2 py-0.5 rounded-full ${option.color}`}>
                                    {option.label}
                                </span>
                                {option.value === status && (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
