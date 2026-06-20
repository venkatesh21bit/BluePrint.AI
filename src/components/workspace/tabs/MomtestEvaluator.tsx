"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function MomTestEvaluator({ isDashboard = false }: { isDashboard?: boolean }) {
  const { phase2Ready, state, object, chat } = useStreaming();
  const validation = object?.momTestValidation;
  
  // Provide fallback questions if not generated yet
  const questions = validation?.behavioralQuestions || [
    "What's the hardest part about your current process?",
    "Can you tell me about the last time that happened?",
    "Why was that hard?",
    "What, if anything, have you done to solve that problem?",
    "What don't you love about the solutions you've tried?"
  ];

  const { messages, append, status, input, setInput } = chat;
  const isLoading = status === 'streaming';

  const handleInputChange = (e: any) => setInput(e.target.value);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;
    append(
      { role: 'user', content: input },
      { body: { targetHypothesis: validation?.targetHypothesis || "Brainstorming a new product idea." } }
    );
    setInput('');
  };

  if (state === 'running' && !phase2Ready) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-sm animate-pulse">Generating Behavioral Script...</p>
        </div>
      </div>
    );
  }

  // Remove the hard blocker so it can be used on the dashboard

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Script Generator */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Structured Script Generator</h2>
        </div>
        <div className="text-sm text-white/80 bg-primary/10 border border-primary/30 rounded-xl p-3 mb-2">
          <span className="font-mono text-xs text-primary block mb-1">TARGET HYPOTHESIS</span>
          {validation?.targetHypothesis || "Not generated yet. Start chatting to discover your target customer and core problem."}
        </div>
        <p className="text-sm text-muted-foreground text-pretty mb-2">
          Behavior-focused, non-leading questions designed to extract empirical facts rather than opinions.
        </p>

        <div className="flex flex-col gap-3">
          {questions.map((q: string, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-4 bg-[#121212] border border-white/5 rounded-xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-emerald-500">QUESTION {i+1}</span>
              </div>
              <p className="text-sm">"{q}"</p>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: questions.length * 0.1 }} className="p-4 bg-[#121212] border border-white/5 rounded-xl relative overflow-hidden mt-4">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-mono text-amber-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> RULE</span>
             </div>
             <p className="text-sm text-muted-foreground">Avoid mentioning your idea entirely until you understand their current reality.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Interactive Roleplay Chat */}
      <div className="w-full lg:w-2/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Interactive Roleplay Simulator</h2>
          {messages.length > 5 && (
            <Button variant="default" size="sm" className="h-8" onClick={() => {}}>Evaluate My Performance</Button>
          )}
        </div>

        <GlassCard className="flex-1 p-1 flex flex-col min-h-[400px]">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden relative">
            
            <div className="p-4 border-b border-white/5 bg-[#121212] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">AI Persona Active: Target Customer</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{messages.length} messages</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm mt-12 font-mono">
                  Type your first question below to start the interview.<br />
                  Try asking about their past behavior.
                </div>
              )}
              {messages.map((m, index) => (
                <div key={index} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-xs font-mono mb-1 ${m.role === 'user' ? 'text-primary' : 'text-emerald-500'}`}>
                    {m.role === 'user' ? 'You (Interviewer)' : 'Target Customer'}
                  </div>
                  <div className={`p-4 rounded-xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                    {m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('')}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="text-xs font-mono mb-1 text-emerald-500">Target Customer</div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/50 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#121212] border-t border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea 
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="min-h-[60px] resize-none bg-black/50 border-white/10 focus-visible:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="h-auto w-24">Send</Button>
              </form>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
