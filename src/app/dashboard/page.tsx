"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Map, Terminal, Clock, FolderGit2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const MOCK_BLUEPRINTS = [
  {
    id: '1',
    title: 'P2P Escrow System for Digital Artists',
    phase: 'Phase 2: Experiment Validation',
    progress: 45,
    lastActive: '2 hours ago',
    stats: { identified: 12, unvalidated: 8, validated: 4 },
    theme: 'violet'
  },
  {
    id: '2',
    title: 'AI-based Inventory Helper',
    phase: 'Phase 3: Core Loop Milestone Ready',
    progress: 80,
    lastActive: '1 day ago',
    stats: { identified: 24, unvalidated: 3, validated: 21 },
    theme: 'emerald'
  },
  {
    id: '3',
    title: 'ADHD Habit-Loop Tracker',
    phase: 'Phase 1: Opportunity Finding',
    progress: 15,
    lastActive: '3 days ago',
    stats: { identified: 5, unvalidated: 5, validated: 0 },
    theme: 'amber'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      router.push('/workspace/new');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Command Prompt Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-16 relative"
        >
          <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-[32px] z-0" />
          <div className="relative z-10 bg-[#121212] rounded-[24px] border border-white/10 p-2 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your next product idea..."
              className="min-h-[120px] bg-transparent border-none text-lg lg:text-xl resize-none focus-visible:ring-0 shadow-none px-6 py-6"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 pb-4 gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-white/5" onClick={() => setPrompt("AI-based inventory helper for local hardware stores")}>
                  Inventory helper
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/5" onClick={() => setPrompt("P2P escrow system for digital artists")}>
                  P2P escrow
                </Badge>
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:w-auto px-8 rounded-full h-12"
              >
                {isGenerating ? (
                  <>Initializing Engine...</>
                ) : (
                  <>
                    <Terminal className="w-4 h-4 mr-2" />
                    Generate Blueprint
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Catalog Header */}
        <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-primary" />
            Active Blueprints
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-9 w-[250px] bg-[#121212] border-white/5" />
            </div>
          </div>
        </div>

        {/* Blueprint Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {MOCK_BLUEPRINTS.map((blueprint, i) => (
            <motion.div
              key={blueprint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(`/workspace/${blueprint.id}`)}
            >
              <Card className="h-full cursor-pointer hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 group overflow-hidden bg-[#0A0A0A]">
                <div className={`h-1 w-full ${
                  blueprint.theme === 'violet' ? 'bg-primary' : 
                  blueprint.theme === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{blueprint.title}</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-mono">{blueprint.phase}</span>
                      <span>{blueprint.progress}%</span>
                    </div>
                    <Progress value={blueprint.progress} className="h-1" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-[#121212] rounded p-2 text-center border border-white/5">
                      <div className="text-lg font-mono text-white">{blueprint.stats.identified}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Identified</div>
                    </div>
                    <div className="bg-[#121212] rounded p-2 text-center border border-white/5">
                      <div className="text-lg font-mono text-amber-500">{blueprint.stats.unvalidated}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Risks</div>
                    </div>
                    <div className="bg-[#121212] rounded p-2 text-center border border-white/5">
                      <div className="text-lg font-mono text-emerald-500">{blueprint.stats.validated}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Validated</div>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground gap-1.5 pt-4 border-t border-white/5">
                    <Clock className="w-3 h-3" />
                    Last updated {blueprint.lastActive}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: MOCK_BLUEPRINTS.length * 0.1 }}
            onClick={() => document.querySelector('textarea')?.focus()}
          >
            <Card className="h-full min-h-[300px] cursor-pointer hover:border-white/20 transition-all duration-300 border-dashed bg-transparent flex flex-col items-center justify-center text-muted-foreground hover:text-white group">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/5 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">New Blueprint</span>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
