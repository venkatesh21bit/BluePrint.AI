"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { GitCommit, Circle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';

export default function MilestoneTimeline() {
  const { phase3Ready, state } = useStreaming();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const MILESTONES = [
    {
      id: 'm1',
      title: '30-Day Core Habit Loop',
      status: 'active',
      tasks: [
        { id: 't1', title: 'Fake Door Landing Page', est: '3d', complexity: 'Low', status: 'done', fallback: 'Manual user interviews if ad spend too high' },
        { id: 't2', title: 'Database Schema Definition', est: '2d', complexity: 'Medium', status: 'active', fallback: 'Use Firebase BaaS temporarily' },
        { id: 't3', title: 'Basic Notification Service', est: '5d', complexity: 'High', status: 'pending', fallback: 'Email digests instead of push' },
      ]
    },
    {
      id: 'm2',
      title: '60-Day Technical Feasibility',
      status: 'pending',
      tasks: [
        { id: 't4', title: 'Background Location Tracking', est: '10d', complexity: 'High', status: 'pending', fallback: 'Time-based triggers only' },
        { id: 't5', title: 'Offline Sync Queue', est: '7d', complexity: 'Medium', status: 'pending', fallback: 'Require internet connection for V1' }
      ]
    },
    {
      id: 'm3',
      title: '90-Day Pilot Release',
      status: 'pending',
      tasks: [
        { id: 't6', title: 'App Store Submission Prep', est: '5d', complexity: 'Medium', status: 'pending', fallback: 'TestFlight / Web App Beta' }
      ]
    }
  ];

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

  return (
    <div className="w-full h-full p-4 md:p-12 overflow-y-auto bg-[#020202]">
      <div className="max-w-4xl mx-auto">
        
        {MILESTONES.map((milestone, mIndex) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mIndex * 0.2 }}
            key={milestone.id} 
            className="mb-12 relative"
          >
            {/* Connecting line to next milestone */}
            {mIndex < MILESTONES.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-[-48px] w-0.5 bg-white/10" />
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-[#020202]
                ${milestone.status === 'active' ? 'border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                  milestone.status === 'done' ? 'border-emerald-500' : 'border-white/20'}`}
              >
                {milestone.status === 'active' && <Circle className="w-3 h-3 fill-primary text-primary" />}
                {milestone.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {milestone.status === 'pending' && <Circle className="w-3 h-3 text-white/20" />}
              </div>
              <h2 className={`text-xl font-bold ${milestone.status === 'pending' ? 'text-muted-foreground' : 'text-white'}`}>
                {milestone.title}
              </h2>
            </div>

            <div className="pl-12 space-y-4">
              {milestone.tasks.map((task, tIndex) => (
                <div key={task.id} className="relative">
                  
                  {/* Task Dependency Drawing (mocked visually) */}
                  {tIndex > 0 && (
                    <svg className="absolute -top-4 -left-6 w-6 h-8 text-white/10 pointer-events-none" fill="none">
                      <path d="M 0 0 V 20 C 0 28, 8 32, 16 32" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}

                  <GlassCard 
                    className={`bg-[#121212]/80 border transition-all cursor-pointer
                      ${task.status === 'active' ? 'border-primary/50 border-l-4 border-l-primary' : 'border-white/5 hover:border-white/20'}`}
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GitCommit className={`w-4 h-4 ${task.status === 'done' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                        <span className={`font-medium text-sm ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-white'}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.est}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider
                            ${task.complexity === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                              task.complexity === 'Medium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
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
                      {expandedTask === task.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 border-t border-white/5 bg-black/20 mt-2">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2 pt-3">Technical Fallback</div>
                            <p className="text-sm text-white/80">{task.fallback}</p>
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
