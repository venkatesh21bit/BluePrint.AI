"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { GitCommit, Circle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';

export default function MilestoneTimeline() {
  const { phase3Ready, state, object } = useStreaming();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const MILESTONES = object?.milestones || [];

  if (state === 'running' && !phase3Ready) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
          </div>
          <p className="font-mono text-sm">Sequencing Timeline...</p>
        </div>
      </div>
    );
  }

  if (MILESTONES.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Clock className="w-8 h-8 text-white/20" />
          <p className="font-mono text-sm">No milestones generated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-12 overflow-y-auto bg-[#020202]">
      <div className="max-w-4xl mx-auto">
        
        {MILESTONES.map((milestone: any, mIndex: number) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mIndex * 0.2 }}
            key={mIndex} 
            className="mb-12 relative"
          >
            {/* Connecting line to next milestone */}
            {mIndex < MILESTONES.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-[-48px] w-0.5 bg-white/10" />
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-[#020202]
                ${mIndex === 0 ? 'border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-white/20'}`}
              >
                {mIndex === 0 ? <Circle className="w-3 h-3 fill-primary text-primary" /> : <Circle className="w-3 h-3 text-white/20" />}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${mIndex > 0 ? 'text-muted-foreground' : 'text-white'}`}>
                  {milestone.phase}
                </h2>
                <p className="text-sm text-muted-foreground">{milestone.objective}</p>
              </div>
            </div>

            <div className="pl-12 space-y-4">
              {milestone.tasks?.map((task: any, tIndex: number) => (
                <div key={task.id} className="relative">
                  
                  {/* Task Dependency Drawing (mocked visually) */}
                  {tIndex > 0 && (
                    <svg className="absolute -top-4 -left-6 w-6 h-8 text-white/10 pointer-events-none" fill="none">
                      <path d="M 0 0 V 20 C 0 28, 8 32, 16 32" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}

                  <GlassCard 
                    className={`bg-[#121212]/80 border transition-all cursor-pointer border-white/5 hover:border-white/20`}
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GitCommit className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm text-white">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.durationDays}d
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider
                            ${task.complexity === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                              task.complexity === 'medium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                              'bg-white/5 text-muted-foreground'}`}
                          >
                            {task.complexity}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedTask === task.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Collapsible Drawer for Technical Fallback */}
                    <AnimatePresence>
                      {expandedTask === task.id && task.alternativeApproach && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 border-t border-white/5 bg-black/20 mt-2">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2 pt-3">Alternative Approach</div>
                            <p className="text-sm text-white/80">{task.alternativeApproach}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}
