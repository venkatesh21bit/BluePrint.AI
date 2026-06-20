"use client";
import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { useChat } from '@ai-sdk/react';

interface MasterPlan {
  conceptName?: string;
  marketAnalysis?: any;
  jtbdFramework?: any[];
  ostFramework?: any[];
  momTestValidation?: any;
  prioritizedAssumptions?: any[];
  milestones?: any[];
  governance?: any;
  safetyGovernor?: any;
}

interface StreamingContextType {
  state: 'idle' | 'running' | 'completed';
  progress: number;
  currentPass: string;
  phase1Ready: boolean;
  phase2Ready: boolean;
  phase3Ready: boolean;
  ostNodes: any;
  startSimulation: (prompt?: string) => void;
  resetSimulation: () => void;
  object: MasterPlan | null;
  chat: {
    messages: any[];
    sendMessage: any;
    status: string;
    input: string;
    setInput: (val: string) => void;
  };
}

const StreamingContext = createContext<StreamingContextType | undefined>(undefined);

async function streamPass(url: string, body: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Pass failed: ${res.statusText}`);
  }

  return await res.json();
}

export function StreamingProvider({ children }: { children: ReactNode }) {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentPass, setCurrentPass] = useState('');
  const [masterPlan, setMasterPlan] = useState<MasterPlan | null>(null);
  const [chatInput, setChatInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const { messages, sendMessage, status } = useChat();

  const startSimulation = useCallback(async (prompt?: string) => {
    const conceptPrompt = prompt || "Build an AI-based inventory helper for local hardware stores.";
    
    setSimulationState('running');
    setProgress(5);
    setCurrentPass('Analyzing market & strategy...');
    setMasterPlan(null);

    try {
      // === PASS 1: Market & Strategy ===
      setCurrentPass('Pass 1/4: Market Analysis & JTBD...');
      setProgress(10);
      const pass1 = await streamPass('/api/builder/market', { conceptPrompt });
      
      const plan: MasterPlan = {
        conceptName: pass1.conceptName,
        marketAnalysis: pass1.marketAnalysis,
        jtbdFramework: pass1.jtbdFramework,
      };
      setMasterPlan({ ...plan });
      setProgress(30);

      // === PASS 2: OST Framework ===
      setCurrentPass('Pass 2/4: Building OST Framework...');
      const pass2 = await streamPass('/api/builder/ost', {
        conceptPrompt,
        marketAnalysis: pass1.marketAnalysis,
        jtbdFramework: pass1.jtbdFramework,
      });
      
      plan.ostFramework = pass2.ostFramework;
      setMasterPlan({ ...plan });
      setProgress(55);

      // === PASS 3: Validation ===
      setCurrentPass('Pass 3/4: Mom Test & Risk Analysis...');
      const pass3 = await streamPass('/api/builder/validation', {
        conceptPrompt,
        marketAnalysis: pass1.marketAnalysis,
        jtbdFramework: pass1.jtbdFramework,
        ostFramework: pass2.ostFramework,
      });
      
      plan.momTestValidation = pass3.momTestValidation;
      plan.prioritizedAssumptions = pass3.prioritizedAssumptions;
      setMasterPlan({ ...plan });
      setProgress(80);

      // === PASS 4: Roadmap ===
      setCurrentPass('Pass 4/4: Building Execution Roadmap...');
      const pass4 = await streamPass('/api/builder/roadmap', {
        conceptPrompt,
        marketAnalysis: pass1.marketAnalysis,
        prioritizedAssumptions: pass3.prioritizedAssumptions,
        ostFramework: pass2.ostFramework,
      });
      
      plan.milestones = pass4.milestones;
      plan.governance = pass4.governance;
      plan.safetyGovernor = pass4.safetyGovernor;
      setMasterPlan({ ...plan });
      setProgress(100);

      setSimulationState('completed');
      setCurrentPass('Engine Cycle Complete');
    } catch (error) {
      console.error('Multi-pass builder error:', error);
      setSimulationState('completed');
      setCurrentPass('Error during generation');
      setProgress(100);
    }
  }, []);

  const resetSimulation = () => {
    setSimulationState('idle');
    setProgress(0);
    setCurrentPass('');
    setMasterPlan(null);
  };

  // Derive phase readiness from what has been generated
  const phase1Ready = !!masterPlan?.ostFramework && masterPlan.ostFramework.length > 0;
  const phase2Ready = !!masterPlan?.momTestValidation?.targetHypothesis;
  const phase3Ready = !!masterPlan?.prioritizedAssumptions && masterPlan.prioritizedAssumptions.length > 0;

  return (
    <StreamingContext.Provider value={{
      state: simulationState,
      progress,
      currentPass,
      phase1Ready,
      phase2Ready,
      phase3Ready,
      ostNodes: masterPlan?.ostFramework,
      startSimulation,
      resetSimulation,
      object: masterPlan,
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
