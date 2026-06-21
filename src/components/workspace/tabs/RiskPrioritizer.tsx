"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { GlassCard } from '@/components/ui/card';
import { Calculator, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RiskPrioritizer() {
  const { phase3Ready, state, object, simulationDebrief } = useStreaming();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const ASSUMPTIONS = (object?.prioritizedAssumptions || []).map((a: any, i: number) => ({
    id: a.id || i.toString(),
    label: a.statement,
    i: a.importance,
    e: a.evidence,
    category: a.category,
    color: a.category === 'desirability' ? 'bg-pink-500' : a.category === 'viability' ? 'bg-teal-500' : a.category === 'usability' ? 'bg-orange-500' : 'bg-indigo-500',
    text: a.category === 'desirability' ? 'text-pink-500' : a.category === 'viability' ? 'text-teal-500' : a.category === 'usability' ? 'text-orange-500' : 'text-indigo-500',
    shadow: a.category === 'desirability' ? 'shadow-[0_0_15px_rgba(236,72,153,0.6)]' : a.category === 'viability' ? 'shadow-[0_0_15px_rgba(20,184,166,0.6)]' : '',
    experiment: a.recommendedExperiment
  }));

  if (state === 'running' && !phase3Ready) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
          <p className="font-mono text-sm animate-pulse">Calculating DVF-U Risk Metrics...</p>
        </div>
      </div>
    );
  }

  if (ASSUMPTIONS.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Calculator className="w-8 h-8 text-white/20" />
          <p className="font-mono text-sm">No risk data generated yet.</p>
        </div>
      </div>
    );
  }

  const selectedData = selectedNode ? ASSUMPTIONS.find((a: any) => a.id === selectedNode) : null;
  const sRisk = selectedData ? (selectedData.i * (1 - selectedData.e)).toFixed(2) : '0.00';
  const isHighRisk = parseFloat(sRisk) > 0.60;

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col relative overflow-hidden bg-[#020202]">
      
      {/* Top Bar: Formula */}
      <div className="flex justify-center mb-8 z-10">
        <GlassCard className="px-6 py-3 flex items-center gap-4 border-primary/20 bg-primary/5">
          <Calculator className="w-5 h-5 text-primary" />
          <div className="font-mono text-sm tracking-wider">
            <span className="text-white">S</span><sub className="text-xs text-muted-foreground">risk</sub> = 
            <span className="text-indigo-400 mx-2">I</span><sub className="text-xs text-muted-foreground">importance</sub> 
            <span className="mx-2">×</span> 
            (1.0 - <span className="text-emerald-400 ml-2">E</span><sub className="text-xs text-muted-foreground">evidence</sub>)
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-1 min-h-0 gap-8 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Main Canvas: 2x2 Grid */}
        <div className="flex-1 relative border-l-2 border-b-2 border-white/20 bg-[#0A0A0A] rounded-tr-xl flex flex-col justify-end">
          
          {/* Simulation Overlay */}
          {simulationDebrief && (
            <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col items-start gap-3">
              {simulationDebrief.killSignals?.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl pointer-events-auto backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.1)] max-w-md">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <AlertCircle className="w-4 h-4" /> Simulation Kill Signals
                  </div>
                  <ul className="text-xs text-rose-200/90 list-disc pl-4 space-y-1.5">
                    {simulationDebrief.killSignals.map((k: string, i: number) => <li key={i}>{k}</li>)}
                  </ul>
                </div>
              )}
              {simulationDebrief.topObjections?.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl pointer-events-auto backdrop-blur-md max-w-md">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-2">
                    <Activity className="w-4 h-4" /> Top Simulated Objections
                  </div>
                  <ul className="text-xs text-amber-200/80 list-disc pl-4 space-y-1.5">
                    {simulationDebrief.topObjections.map((obj: string, i: number) => <li key={i}>{obj}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Axis Labels */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-mono text-muted-foreground tracking-widest uppercase">Importance (I)</div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground tracking-widest uppercase">Evidence (E)</div>
          
          {/* Quadrant Lines */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            {/* Top Left: Leap of Faith (High Risk) */}
            <div className="border-r border-b border-white/5 relative overflow-hidden">
              {/* Radial glow for high risk area */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-amber-500/10 to-transparent opacity-50" />
              <div className="absolute top-4 right-4 text-xs font-bold text-amber-500/50 uppercase tracking-widest font-mono text-right">Leap of Faith</div>
            </div>
            {/* Top Right: Proven Core */}
            <div className="border-b border-white/5 relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-emerald-500/30 uppercase tracking-widest font-mono text-right">Proven Core</div>
            </div>
            {/* Bottom Left: Risky Distraction */}
            <div className="border-r border-white/5 relative">
              <div className="absolute bottom-4 left-4 text-xs font-bold text-muted-foreground/30 uppercase tracking-widest font-mono">Distraction</div>
            </div>
            {/* Bottom Right: Safe Bet */}
            <div className="relative">
              <div className="absolute bottom-4 right-4 text-xs font-bold text-muted-foreground/30 uppercase tracking-widest font-mono text-right">Safe Bet</div>
            </div>
          </div>

          {/* Plot Points */}
          {ASSUMPTIONS.map((item: any, i: number) => {
            const isLeapOfFaith = (item.i * (1 - item.e)) > 0.6;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                onClick={() => setSelectedNode(item.id)}
                className={`absolute w-6 h-6 -ml-3 -mb-3 rounded-full cursor-pointer transition-all duration-200 z-20 ${item.color} ${isLeapOfFaith ? 'animate-pulse ' + item.shadow : ''} ${selectedNode === item.id ? 'ring-4 ring-white/50 scale-125' : 'hover:scale-110'}`}
                style={{
                  left: `${item.e * 100}%`,
                  bottom: `${item.i * 100}%`
                }}
              />
            );
          })}
        </div>

        {/* Slide-out Drawer / Detail Panel */}
        <AnimatePresence>
          {selectedNode && selectedData && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              className="w-80 shrink-0 flex flex-col"
            >
              <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden bg-[#121212]/90 border-white/10">
                
                {/* Header */}
                <div className={`p-4 border-b border-white/5 ${isHighRisk ? 'bg-amber-500/10' : 'bg-white/5'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-mono uppercase tracking-wider font-bold ${selectedData.text}`}>
                      {selectedData.category}
                    </span>
                    <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-white">&times;</button>
                  </div>
                  <h3 className="font-semibold text-lg text-balance">{selectedData.label}</h3>
                </div>

                {/* Score Section */}
                <div className="p-6 border-b border-white/5 flex flex-col items-center justify-center bg-black/40">
                  <div className="text-xs text-muted-foreground font-mono mb-2 uppercase tracking-widest">Risk Score</div>
                  <div className={`text-5xl font-mono font-bold tracking-tighter ${isHighRisk ? 'text-amber-500 glow-amber' : 'text-emerald-400'}`}>
                    {sRisk}
                  </div>
                  {isHighRisk && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" />
                      Requires immediate validation
                    </div>
                  )}
                </div>

                {/* Experiment Layout */}
                <div className="p-6 flex-1 overflow-y-auto">
                  <h4 className="text-sm font-semibold mb-4 text-white/80">Recommended Experiment</h4>
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 relative text-sm text-white/90">
                    {selectedData.experiment}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <Button className="w-full" variant={isHighRisk ? "default" : "secondary"} onClick={() => {}}>
                      Add to Timeline
                    </Button>
                  </div>
                </div>

              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
