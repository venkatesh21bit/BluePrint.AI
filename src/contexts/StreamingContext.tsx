"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { experimental_useObject as useObject, useChat } from '@ai-sdk/react';
import { MasterExecutionPlanSchema } from '@/schemas/builder';

interface StreamingContextType {
  state: 'idle' | 'running' | 'completed';
  progress: number;
  phase1Ready: boolean;
  phase2Ready: boolean;
  phase3Ready: boolean;
  ostNodes: any;
  startSimulation: (prompt?: string) => void;
  resetSimulation: () => void;
  object: any; // The raw streaming object
  chat: {
    messages: any[];
    sendMessage: any;
    status: string;
    input: string;
    setInput: (val: string) => void;
  };
}

const StreamingContext = createContext<StreamingContextType | undefined>(undefined);

export function StreamingProvider({ children }: { children: ReactNode }) {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [chatInput, setChatInput] = useState('');

  const { messages, sendMessage, status } = useChat();

  const { object, submit, isLoading } = useObject({
    api: '/api/builder',
    schema: MasterExecutionPlanSchema,
    onFinish: () => {
      setSimulationState('completed');
      setProgress(100);
    }
  });

  const startSimulation = (prompt?: string) => {
    setSimulationState('running');
    setProgress(10);
    submit({
      conceptPrompt: prompt || "Build an AI-based inventory helper for local hardware stores.",
      sessionUserId: "demo-user-123"
    });
    
    // Simulate progress bar movement since real streaming doesn't give us a %
    let p = 10;
    const interval = setInterval(() => {
      p += 5;
      if (p >= 95) clearInterval(interval);
      setProgress(Math.min(p, 95));
    }, 1000);
  };

  const resetSimulation = () => {
    setSimulationState('idle');
    setProgress(0);
  };

  // Derive phase readiness from what has streamed in so far
  const phase1Ready = !!object?.ostFramework && object.ostFramework.length > 0;
  const phase2Ready = !!object?.momTestValidation?.targetHypothesis;
  const phase3Ready = !!object?.prioritizedAssumptions && object.prioritizedAssumptions.length > 0;

  return (
    <StreamingContext.Provider value={{
      state: isLoading ? 'running' : simulationState,
      progress,
      phase1Ready,
      phase2Ready,
      phase3Ready,
      ostNodes: object?.ostFramework,
      startSimulation,
      resetSimulation,
      object,
      chat: {
        messages,
        sendMessage,
        status,
        input: chatInput,
        setInput: setChatInput
      }
    }}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreaming() {
  const context = useContext(StreamingContext);
  if (context === undefined) {
    throw new Error('useStreaming must be used within a StreamingProvider');
  }
  return context;
}
