"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Fingerprint, Lock, Database, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HITLGovernance() {
  const [approved, setApproved] = useState(false);
  const confidenceScore = 0.72;

  // Calculate SVG arc for radial gauge
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidenceScore * circumference);

  return (
    <div className="w-full h-full p-4 md:p-12 overflow-y-auto bg-[#020202]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* AI Confidence Meter */}
          <GlassCard className="p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[#121212]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Fingerprint className="w-24 h-24" />
            </div>
            
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8 text-center w-full">System Confidence</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                {/* Foreground Circle */}
                <motion.circle 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="80" cy="80" r="60" fill="transparent" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  className={confidenceScore > 0.8 ? "text-emerald-500" : confidenceScore > 0.6 ? "text-amber-500" : "text-red-500"}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono">{(confidenceScore * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-6 max-w-xs text-balance">
              Confidence is derived from cross-referencing DVF-U risk metrics and Mom Test semantic analysis.
            </p>
          </GlassCard>

          {/* Limitation & Risk Advisory Panel */}
          <GlassCard className="p-0 border-amber-500/30 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
             <div className="p-6 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-4 text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold">Responsible AI Advisory</h3>
                </div>
                <ul className="space-y-3 text-sm text-amber-100/70 list-disc pl-5 marker:text-amber-500/50">
                  <li><strong>Confirmation Bias:</strong> The engine may echo your underlying assumptions if not explicitly challenged.</li>
                  <li><strong>Market Sizing:</strong> Financial projections and scale estimates are hypothesized approximations, not definitive facts.</li>
                  <li><strong>Structural Reasoning:</strong> This system provides frameworks, not guarantees. All output must be empirically validated with real users.</li>
                </ul>
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Approval Gate */}
        <div className="flex-1">
          <GlassCard className="h-full flex flex-col p-0 border-white/10 relative overflow-hidden bg-[#121212]">
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">Action Blockade</h3>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center relative">
              {!approved ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
                    <AlertTriangle className="w-8 h-8 text-amber-500 relative z-10" />
                  </div>
                  
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 mb-6 text-left max-w-sm mx-auto">
                    <div className="text-xs font-mono text-muted-foreground mb-2">TARGET ACTION</div>
                    <div className="text-sm font-medium flex items-center gap-2 text-white">
                      <Database className="w-4 h-4 text-indigo-400" />
                      Generate Mock System Schema SQL
                    </div>
                  </div>

                  <p className="text-lg font-medium text-white mb-2">Engine holds action</p>
                  <p className="text-sm text-muted-foreground text-balance max-w-sm mx-auto mb-8">
                    User confirmation required before executing high-stakes automated tasks.
                  </p>

                  <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                    <Button 
                      className="w-full bg-primary text-white hover:bg-primary/90 glow-violet h-12"
                      onClick={() => setApproved(true)}
                    >
                      Approve Action & Execute
                    </Button>
                    <Button variant="outline" className="w-full h-12 text-muted-foreground hover:text-white" onClick={() => {}}>
                      Reject & Abort
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Action Authorized</h3>
                  <p className="text-sm text-muted-foreground mb-6">Executing schema generation protocol...</p>
                  
                  {/* Mock terminal output */}
                  <div className="w-full bg-black/60 rounded-xl border border-white/5 p-4 text-left font-mono text-xs text-emerald-400 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none" />
                    <div className="animate-slide-up space-y-2">
                      <div>&gt; Initializing schema builder... OK</div>
                      <div>&gt; Mapping OST models to relational tables... OK</div>
                      <div>&gt; Defining user_profiles... OK</div>
                      <div>&gt; Defining habit_logs... OK</div>
                      <div>&gt; Applying RLS policies... OK</div>
                      <div>&gt; Validating foreign keys... OK</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
