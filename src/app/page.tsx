"use client";

import React from 'react';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Globe,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BrandLink from './components/BrandLink';
import ThemeToggle from './components/ThemeToggle';

const popularRoles = ['AI Engineer', 'Full Stack', 'Automation', 'Remote'];

const jobCards = [
  {
    company: 'Google DeepMind',
    title: 'Senior AI Engineer',
    salary: '$180k - $250k',
    location: 'Remote',
    score: 9,
    color: 'bg-[#dff7ef]',
    accent: 'text-[#13845e]',
  },
  {
    company: 'OpenAI',
    title: 'AI Product Engineer',
    salary: '$170k - $230k',
    location: 'San Francisco',
    score: 8,
    color: 'bg-[#f6dfef]',
    accent: 'text-[#ba3b82]',
  },
  {
    company: 'Zapier',
    title: 'Automation Engineer',
    salary: '$140k - $190k',
    location: 'Remote',
    score: 9,
    color: 'bg-[#fff1d9]',
    accent: 'text-[#b86916]',
  },
];

const filterRows = ['Remote only', 'Actively hiring', 'AI products', 'High salary'];
const trustLogos = ['Luminous', 'Lightbox', 'FocalPoint', 'Polymath', 'Alt+Shift'];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3ff] text-[#080915] dark:bg-background dark:text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-16rem] h-[34rem] w-[34rem] rounded-full bg-[#ff7d2d]/10 blur-3xl" />
        <div className="absolute right-[-12%] top-20 h-[38rem] w-[38rem] rounded-full bg-[#4e7cff]/10 blur-3xl" />
        <div className="absolute bottom-[-18rem] left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[#c9b9ff]/16 blur-3xl" />
      </div>

      <nav className="relative z-20 mx-auto flex h-24 max-w-7xl items-center justify-between px-5">
        <BrandLink />

        <div className="hidden items-center gap-8 text-sm font-bold text-[#50566b] md:flex">
          <Link href="/dashboard" className="hover:text-[#080915]">Dashboard</Link>
          <Link href="/stats" className="hover:text-[#080915]">Insights</Link>
          <Link href="/settings" className="hover:text-[#080915]">Profile</Link>
          <Link href="/login" className="hover:text-[#080915]">Demo</Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden rounded-full border border-[#cbd1df] bg-white/90 px-5 py-2.5 text-sm font-black shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#090a1f] dark:bg-card md:inline-flex">
            Sign in
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#090a1f] px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-[#090a1f]/15 transition-all hover:-translate-y-0.5 dark:bg-primary">
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-6 md:pb-24">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, rotate: -8, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="pointer-events-none absolute left-4 top-36 hidden h-10 w-10 text-[#f2bd2f] md:block"
        >
          <Sparkles className="h-10 w-10" />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce1ee] bg-white/90 px-4 py-2 text-xs font-black text-[#50566b] shadow-lg shadow-[#8794b8]/10 backdrop-blur dark:bg-card">
            <span className="h-2 w-2 rounded-full bg-[#73c66b]" />
            Gemini job discovery, built for demos
          </div>

          <h1 className="text-balance text-5xl font-black leading-[0.94] tracking-tight md:text-8xl">
            Modernizing the Job Search Experience
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-[#60677b] md:text-xl md:leading-8">
            CareerPilot scans the market, ranks the best roles, and prepares tailored application materials before you open a job board.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-full border border-[#e2c8c8] bg-white/95 p-2 shadow-2xl shadow-[#9aa8d0]/25 backdrop-blur dark:bg-card"
          >
            <Search className="ml-3 h-5 w-5 text-[#8790a6]" />
            <input
              aria-label="Search roles"
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3b7] md:text-base"
              placeholder="Search your needs"
              readOnly
            />
            <button className="hidden items-center gap-2 rounded-full border border-[#e7e9f1] bg-white/80 px-4 py-2.5 text-xs font-black text-[#50566b] dark:bg-secondary sm:inline-flex">
              AI roles
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <Link href="/dashboard" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7d2d] text-white shadow-lg shadow-[#ff7d2d]/30 transition-transform hover:scale-105">
              <Search className="h-5 w-5" />
            </Link>
          </motion.div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#6c7284]">
            <span>Popular jobs:</span>
            {popularRoles.map((role) => (
              <span key={role} className="rounded-full border border-[#dbe1ed] bg-white/90 px-3 py-1 shadow-sm backdrop-blur dark:bg-card">
                {role}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 42, scale: 0.975 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.62, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 rounded-[2rem] border border-white/70 bg-white/20 p-3 shadow-2xl shadow-[#8794b8]/30 backdrop-blur md:mt-20 md:p-7 dark:border-border dark:bg-white/5"
        >
          <div className="pointer-events-none absolute inset-x-8 top-5 h-10 rounded-full bg-white/40 blur-2xl dark:bg-white/10" />
          <div className="relative overflow-hidden rounded-[1.35rem] border border-white/75 bg-[#f6f8ff] shadow-2xl dark:border-border dark:bg-secondary">
            <div className="flex h-16 items-center justify-between border-b border-[#e5e8f0] bg-white/95 px-5 backdrop-blur md:px-8 dark:bg-card">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090a1f] text-white shadow-lg shadow-[#090a1f]/15 dark:bg-primary">
                  <Briefcase className="h-5 w-5" />
                </span>
                <span className="text-lg font-black">S.Jobs</span>
              </div>
              <div className="hidden items-center gap-8 text-xs font-black text-[#5d6476] md:flex">
                <span>Home</span>
                <span>Find Jobs</span>
                <span>Candidates</span>
                <span>Blog</span>
              </div>
              <Link href="/login" className="rounded-full border border-[#090a1f] bg-white/70 px-4 py-2 text-xs font-black transition-all hover:-translate-y-0.5 dark:bg-secondary">
                Get Started
              </Link>
            </div>

            <div className="grid min-h-[540px] grid-cols-1 bg-[#f5f7fd] dark:bg-background md:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="hidden border-r border-[#e4e7f0] bg-white/95 p-5 dark:bg-card md:block">
                <div className="space-y-3">
                  {[
                    ['Home', Globe],
                    ['Profile', UserRound],
                    ['Jobs', Search],
                    ['History', FileText],
                    ['Messages', MessageSquare],
                    ['Discover', Sparkles],
                  ].map(([label, Icon]) => (
                    <div key={label as string} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-black transition-all ${label === 'Jobs' ? 'border border-[#e6e8ef] bg-[#f9fbff] shadow-sm dark:bg-secondary' : 'text-[#596174]'}`}>
                      <Icon className="h-4 w-4" />
                      {label as string}
                    </div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mt-10 rounded-2xl border border-[#e7eaf2] bg-[#fafbff] p-4 shadow-sm dark:bg-secondary"
                >
                  <p className="text-lg font-black leading-tight">Resume tuned for each role</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <span className="h-10 rounded bg-[#d8f2ff]" />
                    <span className="h-10 rounded bg-[#ffd6e8]" />
                    <span className="h-10 rounded bg-[#d8f5b4]" />
                  </div>
                  <button className="mt-4 w-full rounded bg-[#f144a7] py-2 text-xs font-black text-white">
                    Generate
                  </button>
                </motion.div>
              </aside>

              <div className="min-w-0 p-4 md:p-7">
                <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
                  <aside className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.42, duration: 0.4 }}
                      className="rounded-2xl border border-[#e3e6ee] bg-white/95 p-5 shadow-sm dark:bg-card"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-black">Sorting tags</p>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        {filterRows.map((row) => (
                          <div key={row} className="flex items-center justify-between text-sm font-bold text-[#5d6476]">
                            {row}
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#edf4ef] text-[#2f8a5a]">
                              <Check className="h-3 w-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="rounded-2xl border border-[#e3e6ee] bg-white/95 p-5 shadow-sm dark:bg-card"
                    >
                      <p className="text-sm font-black">Tools</p>
                      <div className="mt-4 space-y-3">
                        {['Gemini', 'Supabase', 'SerpAPI', 'Vercel'].map((tool) => (
                          <div key={tool} className="flex items-center justify-between text-sm font-bold text-[#5d6476]">
                            {tool}
                            <span className="h-2 w-2 rounded-full bg-[#73c66b]" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </aside>

                  <section className="min-w-0 rounded-[1.25rem] border border-[#e3e6ee] bg-white/95 p-5 shadow-sm dark:bg-card md:p-7">
                    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <p className="text-sm font-black text-[#8b92a3]">Friday, 23 August</p>
                        <h2 className="mt-3 text-3xl font-black">Ideal Matches</h2>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-black">
                        <Bell className="h-5 w-5 text-[#d0448d]" />
                        Notifications
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4c8bd] text-xs">CP</span>
                      </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                      {[
                        ['Browse all', '1245 jobs', Briefcase],
                        ['Ideal Matches', '132 jobs', ShieldCheck],
                        ['Saved', '13 jobs', Bookmark],
                        ['Hidden', '1 job', Check],
                      ].map(([label, count, Icon], index) => (
                        <motion.div
                          key={label as string}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 + index * 0.05, duration: 0.35 }}
                          className={`flex min-h-[108px] flex-col justify-between rounded-2xl border p-4 shadow-sm ${index === 1 ? 'border-[#c7b7ff] bg-[#c9b9ff]' : 'border-[#e4e7f0] bg-white dark:bg-secondary'}`}
                        >
                          <Icon className="mb-3 h-5 w-5" />
                          <div>
                            <p className="text-sm font-black leading-tight">{label as string}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase text-[#7a8294]">{count as string}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {jobCards.map((job, index) => (
                        <motion.article
                          key={job.title}
                          initial={{ opacity: 0, y: 16, scale: 0.985 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.68 + index * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                          className="rounded-2xl border border-[#dde1ea] bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#8794b8]/10 dark:bg-secondary md:p-4"
                        >
                          <div className="grid gap-4 md:grid-cols-[150px_minmax(0,1fr)_auto] md:items-center">
                            <div className={`${job.color} flex min-h-[132px] flex-col justify-between rounded-2xl p-4`}>
                              <div className="flex items-start justify-between gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#626a7b]">Posted today</span>
                                <Bookmark className="h-5 w-5 shrink-0 text-[#596174]" />
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px] font-black text-[#5b6475]">
                                <span className="rounded-full border border-black/10 px-2 py-1">Full time</span>
                                <span className="rounded-full border border-black/10 px-2 py-1">AI</span>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#596174]">{job.company}</p>
                              <h3 className="mt-2 text-2xl font-black leading-tight">{job.title}</h3>
                              <p className="mt-3 flex items-center gap-1 text-sm font-bold text-[#6c7284]">
                                <MapPin className="h-4 w-4 shrink-0" />
                                {job.location}
                              </p>
                              <div className={`mt-3 flex items-center gap-1 text-sm font-black ${job.accent}`}>
                                <CircleDollarSign className="h-4 w-4" />
                                {job.score}/10 match score
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                              <p className="whitespace-nowrap text-xl font-black">{job.salary}</p>
                              <Link href="/dashboard" className="rounded-full bg-[#090a1f] px-5 py-2.5 text-xs font-black text-white transition-all hover:-translate-y-0.5 dark:bg-primary">
                                Details
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="bg-[#07101e] px-5 py-6 text-white md:px-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[150px] text-sm font-black leading-tight">Trusted by builders shipping AI career tools</p>
                <div className="grid flex-1 grid-cols-2 gap-4 text-sm font-black text-white/45 md:grid-cols-5">
                  {trustLogos.map((logo) => (
                    <span key={logo}>{logo}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">
        {[
          ['1.7h', 'Saved in demo mode from four analyzed jobs'],
          ['4 nodes', 'Score, culture, resume, and cover letter run in parallel'],
          ['Zero n8n', 'Standalone demo runs directly on Vercel'],
        ].map(([value, label], index) => (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.06, duration: 0.38 }}
            className="rounded-2xl border border-[#dbe1ed] bg-white/90 p-6 shadow-lg shadow-[#8794b8]/10 backdrop-blur transition-all hover:-translate-y-0.5 dark:bg-card"
          >
            <p className="text-4xl font-black">{value}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#60677b]">{label}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
