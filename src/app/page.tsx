"use client";

import React from 'react';
import {
  Bot,
  Zap,
  Brain,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  ChevronRight,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';

const features = [
  {
    icon: Brain,
    title: "Gemini-Powered Analysis",
    description: "Our AI reads job postings like a recruiter, scoring each one against your unique profile.",
    color: "text-blue-500",
  },
  {
    icon: Zap,
    title: "Autonomous Scanning",
    description: "24/7 monitoring across LinkedIn, Indeed, and 50+ job boards. Never miss a perfect match.",
    color: "text-amber-500",
  },
  {
    icon: FileCheck,
    title: "Auto-Generated Materials",
    description: "Tailored resumes and cover letters created instantly for each high-scoring opportunity.",
    color: "text-emerald-500",
  },
];

const stats = [
  { value: "10x", label: "Faster Applications" },
  { value: "97%", label: "Match Accuracy" },
  { value: "24/7", label: "Always Scanning" },
  { value: "50+", label: "Job Boards" },
];

const steps = [
  { number: "01", title: "Configure Your Profile", description: "Tell us your target role, skills, and preferences. Takes 2 minutes." },
  { number: "02", title: "Agent Scans the Market", description: "Gemini analyzes thousands of jobs daily, scoring each against your profile." },
  { number: "03", title: "Review Top Matches", description: "Get a curated feed of high-fit opportunities with AI-generated reasoning." },
  { number: "04", title: "Apply with One Click", description: "Auto-generated resumes and cover letters tailored to each role." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                CareerPilot<span className="text-primary">.ai</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Powered by Google Gemini</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              Your Autonomous
              <br />
              <span className="text-primary">Job Application Robot</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop applying manually. CareerPilot uses Gemini AI to scan job boards 24/7,
              score opportunities against your profile, and generate tailored application materials automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-lg font-bold hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 hover:translate-y-[-2px]"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card text-foreground rounded-2xl text-lg font-bold hover:border-primary/50 transition-all">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              AI That Thinks Like a Recruiter
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              CareerPilot doesn't just search keywords. It understands context, culture fit, and career trajectory.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 group hover:border-primary/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              How CareerPilot Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From setup to your first interview, it takes less than a day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 relative group hover:border-primary/50 transition-all"
              >
                <div className="text-6xl font-black text-primary/10 absolute top-4 right-6 group-hover:text-primary/20 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2 relative">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Ready to Automate Your Job Search?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of job seekers who let AI handle the tedious work while they focus on what matters.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-lg font-bold hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Free forever plan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">CareerPilot.ai</span>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Built with Gemini AI for the Google Hackathon 2026
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
