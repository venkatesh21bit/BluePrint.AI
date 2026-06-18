"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';

export default function LandingPage() {
  const [streamText, setStreamText] = useState('');
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [showRendered, setShowRendered] = useState(false);
  const fullText = '> ZeroOne Engine initializing...\n> Parsing user input: "Build an ADHD habit-loop tracking app."\n> Deconstructing opportunity space...\n> Identifying leap-of-faith assumptions...';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setStreamText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowSkeletons(true), 500);
        setTimeout(() => setShowRendered(true), 2500);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-neutral-200 font-sans relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Matrix Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none" />
      
      {/* Floating Radial Spotlights */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-transparent blur-[120px] rounded-full w-[500px] h-[500px] absolute -top-40 left-1/4 -z-10 pointer-events-none" />
      <div className="bg-gradient-to-l from-emerald-500/5 to-transparent blur-[100px] rounded-full w-[400px] h-[400px] absolute top-1/2 right-0 -translate-y-1/2 -z-10 pointer-events-none" />

      <Header />

      <main className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 text-balance leading-tight">
            Turn Vague Ideas Into <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Structured Execution Plans.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 tracking-tight max-w-3xl mx-auto mb-12 text-pretty leading-relaxed">
            Stop building blind. Map opportunities with Teresa Torres' OST framework, run Fitzpatrick's 'Mom Test' transcript audits, calculate DVF-U risk metrics, and sequence progressive development milestones.
          </p>
        </motion.div>

        {/* The Vibe Streaming Terminal */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="w-full">
          <div className="bg-[#0A0A0A] border border-white/[0.08] shadow-2xl rounded-xl p-4 md:p-6 font-mono text-sm leading-relaxed overflow-hidden relative max-w-4xl mx-auto mt-12 text-left">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
            </div>
            
            <div className="min-h-[100px] whitespace-pre-wrap text-emerald-400/90 font-medium">
              {streamText}
              {!showSkeletons && <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse align-middle" />}
            </div>

            {/* Progressive Skeletons -> Rendered View */}
            <div className="mt-8 border-t border-white/[0.04] pt-8 transition-all duration-1000">
              {!showSkeletons && !showRendered && (
                 <div className="flex flex-col gap-4 opacity-50">
                   <div className="h-8 w-1/3 bg-neutral-900/50 rounded animate-pulse" />
                   <div className="h-24 w-full bg-neutral-900/50 rounded-lg animate-pulse" />
                 </div>
              )}
              
              {showSkeletons && !showRendered && (
                <div className="flex flex-col items-center gap-6 relative animate-in fade-in zoom-in duration-500">
                  <div className="h-12 w-64 bg-blue-950/30 rounded-xl animate-pulse border border-blue-500/20" />
                  <div className="w-px h-6 bg-indigo-500/20" />
                  <div className="h-12 w-72 bg-indigo-950/30 rounded-xl animate-pulse border border-indigo-500/20" />
                  <div className="w-px h-6 bg-indigo-500/20" />
                  <div className="h-12 w-80 bg-neutral-900/50 rounded-xl animate-pulse border border-white/[0.06]" />
                </div>
              )}

              {showRendered && (
                <div className="flex flex-col items-center gap-6 relative animate-in fade-in zoom-in duration-500">
                  {/* Outcome Node */}
                  <div className="bg-blue-950/20 border border-blue-500/20 text-blue-400 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.05)] font-sans text-center">
                    <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Outcome</div>
                    <div className="font-semibold text-white tracking-tight">Increase Retention by 15%</div>
                  </div>
                  
                  {/* SVG Connection */}
                  <svg className="absolute top-14 w-full h-8 pointer-events-none" style={{ left: 0 }}>
                    <path d="M 50% 0 L 50% 100%" fill="none" className="stroke-indigo-500/20 stroke-2" strokeDasharray="4 4" />
                  </svg>

                  {/* Opportunity Node */}
                  <div className="bg-indigo-950/20 border border-indigo-500/20 text-indigo-400 px-6 py-3 rounded-xl font-sans text-center mt-2">
                    <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Opportunity</div>
                    <div className="font-medium text-white tracking-tight">"I forget to log habits daily"</div>
                  </div>

                  {/* SVG Connection */}
                  <svg className="absolute top-[120px] w-full h-8 pointer-events-none" style={{ left: 0 }}>
                    <path d="M 50% 0 L 50% 100%" fill="none" className="stroke-indigo-500/20 stroke-2" strokeDasharray="4 4" />
                  </svg>

                  {/* Solution Card */}
                  <div className="bg-neutral-900/40 border border-white/[0.06] hover:border-indigo-500/40 transition-colors px-6 py-3 rounded-xl font-sans text-center mt-2 cursor-pointer group">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 group-hover:text-indigo-400 transition-colors">Solution</div>
                    <div className="font-medium text-neutral-200 tracking-tight">Contextual Push Notifications</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* David Bland's 2x2 Risk & Prioritization Grid */}
        <div className="mt-32 w-full max-w-5xl text-left">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Assumption Mapping</h2>
            <p className="text-neutral-400">Map leap-of-faith assumptions via David Bland's DVF-U framework.</p>
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
              {/* Leap of Faith Zone */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-500/5 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)] border-r border-b border-amber-500/10" />
              
              {/* Axes Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-px border-t border-white/10 border-dashed" />
                <div className="absolute top-0 left-1/2 w-px h-full border-l border-white/10 border-dashed" />
              </div>
              
              {/* Labels */}
              <div className="absolute top-4 left-4 text-[10px] font-mono tracking-widest text-amber-500/70 uppercase">Leap of Faith</div>
              <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-emerald-500/50 uppercase">Proven Core</div>
              <div className="absolute -left-8 top-1/2 -rotate-90 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Importance</div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Evidence</div>

              {/* Scatter Nodes */}
              <div className="absolute top-[20%] left-[20%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.4)] hover:scale-125 duration-200 transition-transform animate-pulse" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-pink-400 font-mono">
                  Desirability (High Risk)
                </div>
              </div>

              <div className="absolute top-[30%] left-[70%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-teal-500 rounded-full hover:scale-125 duration-200 transition-transform" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-teal-400 font-mono">
                  Viability (Safe)
                </div>
              </div>

              <div className="absolute top-[70%] left-[30%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-indigo-500 rounded-full hover:scale-125 duration-200 transition-transform" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-indigo-400 font-mono">
                  Feasibility
                </div>
              </div>

              <div className="absolute top-[60%] left-[60%] group/node cursor-pointer">
                <div className="w-4 h-4 bg-orange-500 rounded-full hover:scale-125 duration-200 transition-transform" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-[10px] px-2 py-1 rounded text-orange-400 font-mono">
                  Usability
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Milestone & Gantt Timeline */}
        <div className="mt-32 w-full max-w-5xl text-left mb-32">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Execution Timelines</h2>
            <p className="text-neutral-400">Sequence validated assumptions into deterministic milestone phases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative border-l-2 border-white/[0.04] pl-6 md:border-l-0 md:pl-0">
            {/* Phase 1 */}
            <div className="relative before:absolute before:left-[-31px] before:top-1.5 before:w-4 before:h-4 before:rounded-full before:bg-indigo-500 before:border-4 before:border-[#030303] md:before:hidden flex flex-col gap-4">
              <div className="text-xs uppercase tracking-widest font-mono text-indigo-400 mb-2">Phase 1 (30 Days)</div>
              
              <div className="bg-neutral-900/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-xl transition-all duration-500 hover:border-indigo-500/40 relative overflow-hidden group">
                {/* Glowing Border Masking Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent bg-[length:200%_auto] bg-[position:left_center] group-hover:bg-[position:right_center] transition-all duration-1000 z-0 opacity-0 group-hover:opacity-100 pointer-events-none" />
                
                <div className="relative z-10">
                  <h4 className="font-semibold text-white tracking-tight mb-1">Core Habit Loop MVP</h4>
                  <p className="text-xs text-neutral-400 mb-4">Validate push delivery and user engagement metrics.</p>
                  
                  <div className="bg-neutral-950 border border-white/[0.04] p-3 rounded-lg text-neutral-400 text-xs transition-all duration-300 ease-in-out">
                    <span className="text-indigo-400/80 font-mono text-[10px] uppercase block mb-1">Fallback Path</span>
                    If native push fails, fallback to SMS trigger via Twilio.
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative before:absolute before:left-[-31px] before:top-1.5 before:w-4 before:h-4 before:rounded-full before:bg-neutral-700 before:border-4 before:border-[#030303] md:before:hidden flex flex-col gap-4">
              <div className="text-xs uppercase tracking-widest font-mono text-neutral-500 mb-2">Phase 2 (60 Days)</div>
              
              <div className="bg-neutral-900/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-xl transition-all duration-500 hover:border-white/10 relative overflow-hidden group opacity-60 hover:opacity-100">
                <div className="relative z-10">
                  <h4 className="font-semibold text-white tracking-tight mb-1">Contextual Sensors</h4>
                  <p className="text-xs text-neutral-400 mb-4">Integrate background location & motion detection.</p>
                  
                  <div className="bg-neutral-950 border border-white/[0.04] p-3 rounded-lg text-neutral-400 text-xs transition-all duration-300 ease-in-out">
                    <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Fallback Path</span>
                    Time-based triggers if OS background limits block sensor access.
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative before:absolute before:left-[-31px] before:top-1.5 before:w-4 before:h-4 before:rounded-full before:bg-neutral-700 before:border-4 before:border-[#030303] md:before:hidden flex flex-col gap-4">
              <div className="text-xs uppercase tracking-widest font-mono text-neutral-500 mb-2">Phase 3 (90 Days)</div>
              
              <div className="bg-neutral-900/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-xl transition-all duration-500 hover:border-white/10 relative overflow-hidden group opacity-40 hover:opacity-100">
                <div className="relative z-10">
                  <h4 className="font-semibold text-white tracking-tight mb-1">Scale Infrastructure</h4>
                  <p className="text-xs text-neutral-400 mb-4">Migrate to edge functions & read replicas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* OpenTelemetry Vital Status Badges */}
      <div className="fixed bottom-6 right-6 z-40 bg-[#0A0A0A] border border-white/[0.08] px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-neutral-300 shadow-2xl backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono tracking-tight">Engine: Syncing</span>
      </div>

    </div>
  );
}
