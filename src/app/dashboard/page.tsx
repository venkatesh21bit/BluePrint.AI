"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, MessageSquareText, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import ClarificationChat from '@/components/dashboard/ClarificationChat';

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
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

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-foreground overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Recent Chats */}
        <aside className="w-64 border-r border-white/5 bg-[#050505] p-4 hidden md:flex flex-col gap-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-white border-white/10 h-10"
            onClick={() => setActiveChatId(null)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Brainstorm
          </Button>

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
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex flex-col text-left p-3 rounded-lg transition-colors gap-1 border ${activeChatId === chat.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'} group`}
                >
                  <span className={`text-sm font-medium transition-colors ${activeChatId === chat.id ? 'text-primary' : 'text-white/90 group-hover:text-primary'}`}>
                    {chat.title}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquareText className="w-3 h-3" /> {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Area: Mom Test Evaluator */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#020202]">
          <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]">
            <h1 className="text-lg font-medium flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-primary" />
              Clarification Agent
            </h1>
          </header>
          
          <div className="flex-1 overflow-y-auto">
            <ClarificationChat 
              chatId={activeChatId} 
              onChatUpdated={() => {
                fetchChats();
              }} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
