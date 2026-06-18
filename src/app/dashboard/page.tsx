"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, MessageSquareText, FileText, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import MomTestEvaluator from '@/components/workspace/tabs/MomtestEvaluator';

export default function DashboardPage() {
  const router = useRouter();

  const handleGenerate = () => {
    router.push('/workspace/new');
  };

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-foreground overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Recent Chats */}
        <aside className="w-64 border-r border-white/5 bg-[#050505] p-4 hidden md:flex flex-col gap-4">
          <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-white border-white/10 h-10">
            <Plus className="w-4 h-4 mr-2" />
            New Brainstorm
          </Button>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-2">Recent Chats</span>
            
            <button className="flex flex-col text-left p-3 rounded-lg hover:bg-white/5 transition-colors gap-1 border border-transparent hover:border-white/10 group">
              <span className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors">Habit Tracker App</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquareText className="w-3 h-3" /> 12 messages
              </span>
            </button>
            
            <button className="flex flex-col text-left p-3 rounded-lg hover:bg-white/5 transition-colors gap-1 border border-transparent hover:border-white/10 group">
              <span className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors">P2P Escrow Idea</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquareText className="w-3 h-3" /> 5 messages
              </span>
            </button>
          </div>
        </aside>

        {/* Main Area: Mom Test Evaluator */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#020202]">
          <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]">
            <h1 className="text-lg font-medium flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-primary" />
              Startup Coach Brainstormer
            </h1>
            <Button 
              onClick={handleGenerate}
              className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Blueprint
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </header>
          
          <div className="flex-1 overflow-y-auto">
            <MomTestEvaluator isDashboard={true} />
          </div>
        </main>
      </div>
    </div>
  );
}
