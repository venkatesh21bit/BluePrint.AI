"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquareText, FileText, ChevronRight, Loader2, Sparkles, Bot } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import ClarificationChat from '@/components/dashboard/ClarificationChat';
import StartupPlannerChat from '@/components/dashboard/StartupPlannerChat';

interface Chat {
  id: string;
  title: string;
  agentType: 'clarification' | 'planner' | 'simulation';
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeAgentType, setActiveAgentType] = useState<'clarification' | 'planner' | 'simulation' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error('Failed to fetch chats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleNewChat = (type: 'clarification' | 'planner' | 'simulation') => {
    setActiveChatId(null);
    setActiveAgentType(type);
  };

  const handleSelectChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setActiveAgentType(chat.agentType || 'clarification');
  };

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-foreground overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Recent Chats */}
        <aside className="w-64 border-r border-white/5 bg-[#050505] p-4 hidden md:flex flex-col gap-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-indigo-400 hover:text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/10 h-10"
              onClick={() => handleNewChat('planner')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Startup Plan
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/10 h-10"
              onClick={() => handleNewChat('clarification')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Clarification
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-purple-400 hover:text-purple-300 border-purple-500/20 hover:bg-purple-500/10 h-10"
              onClick={() => handleNewChat('simulation')}
            >
              <Bot className="w-4 h-4 mr-2" />
              Simulation Engine
            </Button>
          </div>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-2">Recent Chats</span>
            
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2">No recent chats</div>
            ) : (
              chats.map((chat) => (
                <button 
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex flex-col text-left p-3 rounded-lg transition-colors gap-1 border ${activeChatId === chat.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'} group`}
                >
                  <span className={`text-sm font-medium transition-colors ${activeChatId === chat.id ? 'text-primary' : 'text-white/90 group-hover:text-primary'}`}>
                    {chat.title}
                  </span>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquareText className="w-3 h-3" /> {new Date(chat.updatedAt).toLocaleDateString()}
                    </span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                      (chat.agentType || 'clarification') === 'planner' 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : (chat.agentType === 'simulation' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20')
                    }`}>
                      {(chat.agentType || 'clarification')}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Area: Agent Interface */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#020202]">
          <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]">
            <h1 className="text-lg font-medium flex items-center gap-2">
              {activeAgentType === 'planner' ? (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Startup Planner Agent
                </>
              ) : activeAgentType === 'clarification' ? (
                <>
                  <MessageSquareText className="w-5 h-5 text-emerald-400" />
                  Clarification Agent
                </>
              ) : activeAgentType === 'simulation' ? (
                <>
                  <Bot className="w-5 h-5 text-purple-400" />
                  Simulation Engine
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 text-white/50" />
                  ZeroOne Command Center
                </>
              )}
            </h1>
          </header>
          
          <div className="flex-1 overflow-y-auto">
            {activeAgentType === 'planner' ? (
              <StartupPlannerChat 
                chatId={activeChatId} 
                onChatUpdated={() => fetchChats()} 
              />
            ) : activeAgentType === 'clarification' ? (
              <ClarificationChat 
                chatId={activeChatId} 
                onChatUpdated={() => fetchChats()} 
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-[#020202]">
                <Bot className="w-16 h-16 text-neutral-800 mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-2">ZeroOne Command Center</h2>
                <p className="text-neutral-500 max-w-md">Select an agent from the sidebar or create a new session to begin analyzing your startup ideas.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
