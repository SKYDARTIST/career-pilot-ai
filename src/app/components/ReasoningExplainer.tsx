"use client";

import React from 'react';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    Target,
    ShieldCheck,
    Zap,
    Brain
} from 'lucide-react';

interface ReasoningExplainerProps {
    reasoning: string;
}

export default function ReasoningExplainer({ reasoning }: ReasoningExplainerProps) {
    // Try to parse structured reasoning if it's JSON
    let structured: any = null;
    try {
        // n8n might send it as a JSON string
        if (reasoning.trim().startsWith('{')) {
            structured = JSON.parse(reasoning);
        }
    } catch (e) {
        // Not JSON, fallback to plain text
    }

    if (!structured) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <Brain className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">AI Reasoning Analysis</h3>
                </div>
                <div className="bg-secondary/50 border border-border rounded-2xl p-6 text-sm leading-relaxed italic text-muted-foreground">
                    "{reasoning}"
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Thought Process */}
            {structured.thought_process && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Brain className="w-4 h-4" />
                        <h3 className="font-bold uppercase tracking-widest text-[10px]">Thought Signature</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                        {structured.thought_process}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matching Skills */}
                <div className="glass-card p-5 bg-emerald-500/5 border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Skill Overlap ({structured.skills_overlap_percentage || 0}%)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {structured.matching_skills?.map((skill: string) => (
                            <span key={skill} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-bold border border-emerald-500/10">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Missing Skills */}
                <div className="glass-card p-5 bg-amber-500/5 border-amber-500/10">
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Missing Criteria</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {structured.missing_skills?.map((skill: string) => (
                            <span key={skill} className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-[10px] font-bold border border-amber-500/10">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Green Flags */}
                {structured.green_flags?.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Zap className="w-4 h-4" />
                            <h3 className="font-bold uppercase tracking-widest text-[10px]">Market Green Flags</h3>
                        </div>
                        <div className="space-y-2">
                            {structured.green_flags.map((flag: string) => (
                                <div key={flag} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                    {flag}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Red Flags */}
                {structured.red_flags?.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-500">
                            <ShieldCheck className="w-4 h-4 rotate-180" />
                            <h3 className="font-bold uppercase tracking-widest text-[10px]">Risk Assessment</h3>
                        </div>
                        <div className="space-y-2">
                            {structured.red_flags.map((flag: string) => (
                                <div key={flag} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 bg-red-500 rounded-full" />
                                    {flag}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Decision */}
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Final Recommendation</p>
                    <p className="text-lg font-bold">{structured.reasoning_summary || 'Analysis Complete'}</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-2xl font-black text-primary font-mono">{structured.score}/10</div>
                    <div className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Match Grade</div>
                </div>
            </div>
        </div>
    );
}
