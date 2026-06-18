"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { Plus, Maximize, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OSTCanvas() {
  const { phase1Ready, phase2Ready, ostNodes, state } = useStreaming();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Fallback visual state if simulation hasn't reached phase1
  if (state === 'running' && !phase1Ready) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-sm animate-pulse">Constructing Opportunity Solution Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 md:p-12 relative overflow-hidden bg-[#020202]">
      {/* Background SVG Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto h-full flex flex-col items-center">
        
        {/* Outcome Node */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 w-80 text-center backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.15)] mb-16 relative"
        >
          <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-2">Target Outcome</div>
          <div className="text-xl font-bold text-white text-balance">Increase User Retention by 15%</div>
          
          {/* Connection Line */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-indigo-500/50 to-transparent" />
        </motion.div>

        {/* Opportunity Nodes Row */}
        {phase1Ready && (
          <div className="flex justify-center gap-8 w-full mb-16 relative">
            {/* SVG Lines connecting Outcome to Opportunities */}
            <svg className="absolute -top-16 left-0 w-full h-16 pointer-events-none overflow-visible">
               <path d="M 50% 0 C 50% 30, 20% 70, 20% 100" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="4 4" />
               <path d="M 50% 0 C 50% 30, 80% 70, 80% 100" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Left Opportunity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-5 w-72 backdrop-blur-sm relative"
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Opportunity</div>
              <div className="text-sm font-medium text-white text-pretty mb-3">"I keep forgetting to log my daily habits"</div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-white/20" />
              </div>
              
              {/* Connection Line Down */}
              {phase2Ready && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
              )}
            </motion.div>

            {/* Right Opportunity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-5 w-72 backdrop-blur-sm opacity-50"
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Opportunity</div>
              <div className="text-sm font-medium text-white text-pretty">"The UI is too complex to use quickly"</div>
            </motion.div>
          </div>
        )}

        {/* Solutions & Tests Row */}
        {phase2Ready && (
          <div className="flex justify-start w-full relative pl-[5%]">
            <div className="flex flex-col gap-6">
              
              {/* Solution Node */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedNode('sol-1')}
                className={`bg-indigo-900/20 border cursor-pointer transition-all duration-300 rounded-xl p-5 w-64 backdrop-blur-sm ${selectedNode === 'sol-1' ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-indigo-500/30 hover:border-indigo-500/60'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">Solution</div>
                  <Maximize className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium text-white">Contextual Push Notifications</div>
              </motion.div>

              {/* Validation Test Node */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-amber-950/30 border border-amber-500/50 rounded-xl p-5 w-64 backdrop-blur-sm ml-12 relative"
              >
                {/* Connecting horizontal line */}
                <div className="absolute right-full top-1/2 w-12 h-px bg-white/10" />
                <div className="absolute right-full top-1/2 w-px h-20 -translate-y-full bg-white/10" />

                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Validation Test
                  </div>
                </div>
                <div className="text-sm font-medium text-white mb-2">Fake door test for push consent</div>
                <div className="text-[10px] text-amber-200/70">Status: High Risk Assumption</div>
              </motion.div>

              {/* Add New Test Button */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="ml-12"
              >
                <Button variant="outline" size="sm" className="border-dashed border-white/20 text-muted-foreground hover:text-white bg-transparent h-10 w-64 justify-start" onClick={() => {}}>
                  <Plus className="w-4 h-4 mr-2" />
                  Attach New Experiment
                </Button>
              </motion.div>

            </div>
          </div>
        )}

      </div>
      
      {/* Inline Dialog for Selected Solution */}
      {selectedNode && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 bottom-6 w-80 bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col z-20"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Solution Details</h3>
            <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-white">&times;</button>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded p-3 mb-6">
            <span className="text-xs text-indigo-400 font-mono block mb-1">CANDIDATE</span>
            <span className="text-sm">Contextual Push Notifications</span>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-3">Attach Experiment</h4>
            <div className="space-y-4">
              <div className="p-3 border border-white/5 rounded-lg bg-black/40 hover:bg-white/5 cursor-pointer transition-colors">
                <div className="text-sm font-medium mb-1">Fake Door Pitch</div>
                <div className="text-xs text-muted-foreground">Add a 'Notify Me' button before feature exists.</div>
              </div>
              <div className="p-3 border border-white/5 rounded-lg bg-black/40 hover:bg-white/5 cursor-pointer transition-colors">
                <div className="text-sm font-medium mb-1">Concierge MVP</div>
                <div className="text-xs text-muted-foreground">Manually text 10 users at optimal times.</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
