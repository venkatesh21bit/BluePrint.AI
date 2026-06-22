"use client";
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Lightbulb, Target, Route, BrainCircuit, Send, Loader2 } from 'lucide-react';
import { SimulationHypeScreen } from '@/components/dashboard/SimulationHypeScreen';

const DEFAULT_PROMPT = "Build an ADHD habit-loop tracking app with contextual push notifications.";
const PHASES = [
  { label: 'Phase 1 (30 Days)', title: 'Core Habit Loop MVP', desc: 'Validate push delivery and user engagement metrics.', fallback: 'If native push fails, fallback to SMS trigger via Twilio.', color: 'indigo' },
  { label: 'Phase 2 (60 Days)', title: 'Contextual Sensors', desc: 'Integrate background location & motion detection.', fallback: 'Time-based triggers if OS background limits block sensor access.', color: 'neutral' },
  { label: 'Phase 3 (90 Days)', title: 'Scale Infrastructure', desc: 'Migrate to edge functions & read replicas.', color: 'neutral' },
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');

  const handleStream = useCallback(() => {
    const concept = prompt.trim() || DEFAULT_PROMPT;
    const encodedPrompt = encodeURIComponent(concept);
    
    if (!session?.user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/dashboard?prompt=' + encodedPrompt)}`);
    } else {
      router.push(`/dashboard?prompt=${encodedPrompt}`);
    }
  }, [prompt, session, router]);

  return (
    <div className="min-h-screen bg-[#030303] text-neutral-200 font-sans relative overflow-hidden selection:bg-indigo-500/30">

      {/* Matrix Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none" />

      {/* Floating Radial Spotlights */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-transparent blur-[120px] rounded-full w-[500px] h-[500px] absolute -top-40 left-1/4 -z-10 pointer-events-none" />
      <div className="bg-gradient-to-l from-emerald-500/5 to-transparent blur-[100px] rounded-full w-[400px] h-[400px] absolute top-1/2 right-0 -translate-y-1/2 -z-10 pointer-events-none" />

      <Header />

      <main className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">

        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 text-balance leading-tight">
            Turn Vague Ideas Into <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Structured Execution Plans.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 tracking-tight max-w-3xl mx-auto mb-8 text-pretty leading-relaxed">
            Stop building blind. Map opportunities with Teresa Torres' OST framework, run Fitzpatrick's 'Mom Test' transcript audits, calculate DVF-U risk metrics, and sequence progressive development milestones.
          </p>

          {/* Prompt Input */}
          <div className="flex items-center gap-2 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleStream(); }}
                placeholder="Describe your concept..."
                className="w-full bg-neutral-900/60 border border-white/[0.08] rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <Button
              onClick={handleStream}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-4 rounded-xl h-[52px] shrink-0"
            >
              <Send className="w-5 h-5 mr-2" />
              Analyze
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] group"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Building
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-white/10 text-neutral-300 hover:text-white px-8 py-6 text-lg rounded-xl"
            >
              Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Simulation Engine Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="w-full mt-8"
        >
          <SimulationHypeScreen />
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="w-full max-w-5xl mt-16 mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Lightbulb, title: '1. Describe Your Idea', desc: 'Type your product concept in natural language. The AI deconstructs it into Jobs-to-be-Done stories and identifies opportunity spaces.', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
              { icon: Target, title: '2. Analyze & Validate', desc: 'The Mom Test coach audits your assumptions. Risk metrics identify leap-of-faith gaps across desirability, viability, feasibility, and usability.', color: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20', text: 'text-indigo-400' },
              { icon: Route, title: '3. Get Your Roadmap', desc: 'Receive a phased 30/60/90-day execution plan with milestone tasks, fallback paths, and safety governance checks.', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-b ${item.color} border ${item.border} rounded-2xl p-6 text-left backdrop-blur-xl hover:border-opacity-100 transition-all duration-300`}>
                <item.icon className={`w-8 h-8 ${item.text} mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>


        {/* Risk Matrix */}
        <div className="mt-32 w-full max-w-5xl text-left">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Assumption Mapping</h2>
            <p className="text-neutral-400">Map leap-of-faith assumptions via David Bland's DVF-U framework. Click any node to explore.</p>
          </div>

          <div className="bg-neutral-900/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden group hover:border-white/[0.1]">
            <div className="border-b border-white/[0.06] bg-neutral-950/80 px-6 py-3 flex items-center justify-between">
              <span className="font-sans text-xs tracking-wider uppercase text-neutral-400 font-medium flex items-center gap-2">
                <span className="text-indigo-400">Risk Matrix</span>
              </span>
              <span className="font-mono text-xs tracking-wider uppercase text-neutral-400 font-medium">
                S_risk = I_importance × (1.0 - E_evidence)
              </span>
            </div>

            <div className="aspect-square md:aspect-[21/9] w-full relative bg-neutral-950/40 overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-500/5 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)] border-r border-b border-amber-500/10" />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-px border-t border-white/10 border-dashed" />
                <div className="absolute top-0 left-1/2 w-px h-full border-l border-white/10 border-dashed" />
              </div>

              <div className="absolute top-4 left-4 text-[10px] font-mono tracking-widest text-amber-500/70 uppercase">Leap of Faith</div>
              <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-emerald-500/50 uppercase">Proven Core</div>
              <div className="absolute -left-8 top-1/2 -rotate-90 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Importance</div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Evidence</div>

              <button onClick={() => router.push('/dashboard')} className="absolute top-[20%] left-[20%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.4)] hover:scale-125 duration-200 transition-transform animate-pulse" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-pink-400 font-mono">
                  Desirability (High Risk)
                </div>
              </button>

              <button onClick={() => router.push('/dashboard')} className="absolute top-[30%] left-[70%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-teal-500 rounded-full hover:scale-125 duration-200 transition-transform" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-teal-400 font-mono">
                  Viability (Safe)
                </div>
              </button>

              <button onClick={() => router.push('/dashboard')} className="absolute top-[70%] left-[30%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-indigo-500 rounded-full hover:scale-125 duration-200 transition-transform" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-indigo-400 font-mono">
                  Feasibility
                </div>
              </button>

              <button onClick={() => router.push('/dashboard')} className="absolute top-[60%] left-[60%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-orange-500 rounded-full hover:scale-125 duration-200 transition-transform" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-orange-400 font-mono">
                  Usability
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="mt-32 w-full max-w-5xl text-left mb-32">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Execution Timelines</h2>
            <p className="text-neutral-400">Sequence validated assumptions into deterministic milestone phases. Click a phase to start planning.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative border-l-2 border-white/[0.04] pl-6 md:border-l-0 md:pl-0">
            {PHASES.map((phase, i) => (
              <button
                key={i}
                onClick={() => router.push('/dashboard')}
                className={`relative before:absolute before:left-[-31px] before:top-1.5 before:w-4 before:h-4 before:rounded-full before:border-4 before:border-[#030303] md:before:hidden flex flex-col gap-4 text-left ${phase.color === 'indigo' ? 'before:bg-indigo-500' : 'before:bg-neutral-700'}`}
              >
                <div className={`text-xs uppercase tracking-widest font-mono mb-2 ${phase.color === 'indigo' ? 'text-indigo-400' : 'text-neutral-500'}`}>{phase.label}</div>

                <div className={`bg-neutral-900/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-xl transition-all duration-500 relative overflow-hidden group ${i > 0 ? 'opacity-60 hover:opacity-100' : ''} ${phase.color === 'indigo' ? 'hover:border-indigo-500/40' : 'hover:border-white/10'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent bg-[length:200%_auto] bg-[position:left_center] group-hover:bg-[position:right_center] transition-all duration-1000 z-0 opacity-0 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative z-10">
                    <h4 className="font-semibold text-white tracking-tight mb-1">{phase.title}</h4>
                    <p className="text-xs text-neutral-400 mb-4">{phase.desc}</p>

                    {phase.fallback && (
                      <div className="bg-neutral-950 border border-white/[0.04] p-3 rounded-lg text-neutral-400 text-xs transition-all duration-300 ease-in-out">
                        <span className={`font-mono text-[10px] uppercase block mb-1 ${phase.color === 'indigo' ? 'text-indigo-400/80' : 'text-neutral-500'}`}>Fallback Path</span>
                        {phase.fallback}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* System Status Badge */}
      <button onClick={() => router.push('/dashboard')} className="fixed bottom-6 right-6 z-40 bg-[#0A0A0A] border border-white/[0.08] px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-neutral-300 shadow-2xl backdrop-blur-md hover:border-indigo-500/40 transition-colors cursor-pointer">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono tracking-tight">Engine Ready</span>
      </button>

    </div>
  );
}
