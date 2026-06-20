"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, MessageSquareText, Target, CalendarDays, ShieldAlert, PieChart } from 'lucide-react';
import { useStreaming } from '@/contexts/StreamingContext';

import OSTCanvas from '@/components/workspace/tabs/OSTCanvas';
import TranscriptEvaluator from '@/components/workspace/tabs/TranscriptEvaluator';
import RiskPrioritizer from '@/components/workspace/tabs/RiskPrioritizer';
import MilestoneTimeline from '@/components/workspace/tabs/MilestoneTimeline';
import HITLGovernance from '@/components/workspace/tabs/HITLGovernance';
import MarketAnalysisTab from '@/components/workspace/tabs/MarketAnalysisTab';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const TABS = [
  { id: 'market', label: 'Market Analysis', icon: PieChart },
  { id: 'ost', label: 'OST Canvas', icon: Network },
  { id: 'mom-test', label: 'Script & Transcript', icon: MessageSquareText },
  { id: 'risk', label: '2x2 Risk Matrix', icon: Target },
  { id: 'timeline', label: 'Milestones', icon: CalendarDays },
  { id: 'governance', label: 'HITL Center', icon: ShieldAlert }
];

export default function WorkspaceLayout() {
  const [activeTab, setActiveTab] = useState('market');
  const { state, progress, currentPass, resetSimulation, startSimulation } = useStreaming();

  // Auto-start simulation when mounting a workspace
  React.useEffect(() => {
    if (state === 'idle') {
      startSimulation();
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#020202] text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 shrink-0 flex flex-col border-r border-white/5 bg-[#050505] transition-all duration-300 z-20">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5 shrink-0">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
            Z
          </div>
          <span className="ml-3 font-bold tracking-tight hidden md:block">ZeroOne</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto min-w-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 min-w-0 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}`} />
                <span className="hidden md:block truncate text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5 hidden md:block shrink-0">
          <div className="bg-[#121212] rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2 text-muted-foreground">
              <span>Traversal Cap</span>
              <span>5 max</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[60%]" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-muted-foreground">MCP Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020202]">
        {/* Engine Status Bar */}
        <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-[#0A0A0A] z-10">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="hidden md:flex items-center gap-2 text-sm font-mono text-muted-foreground whitespace-nowrap">
              {state === 'running' ? (
                <span className="text-primary animate-pulse">{currentPass || 'Starting...'}</span>
              ) : state === 'completed' ? (
                <span className="text-emerald-500">{currentPass || 'Engine Cycle Complete'}</span>
              ) : (
                <span>Engine Idle</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {state === 'running' && (
              <div className="w-32 hidden sm:block">
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { resetSimulation(); startSimulation(); }}
              className="font-mono text-xs border-white/10"
            >
              Restart Simulator
            </Button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              {activeTab === 'market' && <MarketAnalysisTab />}
              {activeTab === 'ost' && <OSTCanvas />}
              {activeTab === 'mom-test' && <TranscriptEvaluator />}
              {activeTab === 'risk' && <RiskPrioritizer />}
              {activeTab === 'timeline' && <MilestoneTimeline />}
              {activeTab === 'governance' && <HITLGovernance />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
