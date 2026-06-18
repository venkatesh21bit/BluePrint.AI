"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';

export default function MomTestEvaluator() {
  const { phase2Ready, state } = useStreaming();

  const MOCK_TRANSCRIPT = `Interviewer: So we're building a new habit tracker. Would you use an app that sends you contextual push notifications?
User: Oh yeah, I would definitely buy that! It sounds really useful.
Interviewer: Great! How much would you pay for it?
User: Probably like $5 a month.
Interviewer: Awesome. Do you think a feature where it tracks your location to prompt you when you arrive at the gym would be good?
User: Yes, that would be a game changer. I always forget when I get there.`;

  if (state === 'running' && !phase2Ready) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-sm animate-pulse">Generating Behavioral Script...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Script Generator */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Structured Script Generator</h2>
        </div>
        <p className="text-sm text-muted-foreground text-pretty mb-2">
          Behavior-focused, non-leading questions designed to extract empirical facts rather than opinions.
        </p>

        <div className="flex flex-col gap-3">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-[#121212] border border-white/5 rounded-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-emerald-500">PAST ACTION</span>
            </div>
            <p className="text-sm">"Walk me through the last time you tried to start a new habit. What exactly did you do?"</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-4 bg-[#121212] border border-white/5 rounded-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-emerald-500">WORKAROUNDS</span>
            </div>
            <p className="text-sm">"How are you currently dealing with forgetting to log your activities?"</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-4 bg-[#121212] border border-white/5 rounded-xl relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-mono text-amber-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> RULE</span>
             </div>
             <p className="text-sm text-muted-foreground">Avoid mentioning your idea entirely until you understand their current reality.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Transcript Evaluator */}
      <div className="w-full lg:w-2/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Transcript Coach</h2>
          <Button variant="default" size="sm" className="h-8" onClick={() => {}}>Analyze Interview Log</Button>
        </div>

        <GlassCard className="flex-1 p-1 flex flex-col min-h-[400px]">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden">
            
            <div className="p-4 border-b border-white/5 bg-[#121212] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-mono text-muted-foreground">Flaws Detected: 3</span>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 font-mono text-sm leading-relaxed">
              <div>
                <span className="text-primary font-bold">Interviewer:</span> So we're building a new habit tracker. 
                <span className="inline-block mx-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 px-1 rounded relative group cursor-help">
                  Would you use an app that sends you contextual push notifications?
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1A1A1A] border border-white/10 rounded shadow-xl text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="text-amber-400 font-bold block mb-1">Leading Question</span>
                    Pitching the idea before understanding the problem.
                  </div>
                </span>
              </div>
              
              <div>
                <span className="text-white font-bold">User:</span> Oh yeah, 
                <span className="inline-block mx-1 bg-red-500/20 text-red-300 border border-red-500/50 px-1 rounded relative group cursor-help">
                  I would definitely buy that!
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[#1A1A1A] border border-white/10 rounded shadow-xl text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="text-red-400 font-bold block mb-1">Speculative Compliment</span>
                    People are bad at predicting future behavior. Ignore this data.
                  </div>
                </span>
                It sounds really useful.
              </div>

              <div>
                <span className="text-primary font-bold">Interviewer:</span> Great! 
                <span className="inline-block mx-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 px-1 rounded relative group cursor-help">
                  How much would you pay for it?
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1A1A1A] border border-white/10 rounded shadow-xl text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="text-amber-400 font-bold block mb-1">Hypothetical Pricing</span>
                    Ask what they currently pay for solutions instead.
                  </div>
                </span>
              </div>

              <div>
                <span className="text-white font-bold">User:</span> Probably like $5 a month.
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 font-sans">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suggested Reframing
                </h4>
                <div className="bg-[#121212] p-4 rounded-lg border border-white/5 text-sm text-muted-foreground">
                  Instead of pitching the app, ask: "Tell me about the last time you tried to form a new habit. What tools did you use? Did you pay for any of them?"
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
