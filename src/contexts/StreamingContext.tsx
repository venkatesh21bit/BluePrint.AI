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

import { SCENARIOS } from '@/lib/scenarios';
import { AgentPersona, SimulationLog } from '@/schemas/simulation';

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
  // New Scenario Simulation Engine State
  simulationStatus: 'idle' | 'generating-personas' | 'running' | 'debriefing' | 'complete';
  simulationPersonas: AgentPersona[];
  simulationLogs: SimulationLog[];
  simulationDebrief: any;
  runScenarioSimulation: (scenarioId: string) => void;
  injectGlobalEvent: (event: string) => void;
  globalEventInput: string;
  setGlobalEventInput: (val: string) => void;
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

  // Scenario Simulation Engine State
  const [simStatus, setSimStatus] = useState<'idle' | 'generating-personas' | 'running' | 'debriefing' | 'complete'>('idle');
  const [simPersonas, setSimPersonas] = useState<AgentPersona[]>([]);
  const [simLogs, setSimLogs] = useState<SimulationLog[]>([]);
  const [simDebrief, setSimDebrief] = useState<any>(null);
  const [globalEventInput, setGlobalEventInput] = useState('');

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

  const globalEventRef = useRef('');

  const runScenarioSimulation = useCallback(async (scenarioId: string) => {
    if (!masterPlan) return;
    
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    setSimStatus('generating-personas');
    setSimLogs([]);
    setSimDebrief(null);
    setGlobalEventInput('');
    globalEventRef.current = '';

    try {
      // Step 1: Generate Personas
      const personasRes = await fetch('/api/simulation/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterPlan,
          rolesToSpawn: scenario.agentRolesToSpawn,
          scenarioName: scenario.name
        })
      });
      const personasData = await personasRes.json();
      const generatedPersonas: AgentPersona[] = personasData.personas;
      setSimPersonas(generatedPersonas);

      // Step 2: Run Simulation Loop
      setSimStatus('running');
      let currentLogs: SimulationLog[] = [];
      let currentGlobalEvent = '';

      for (let round = 1; round <= scenario.maxRounds; round++) {
        for (const persona of generatedPersonas) {
          // Check if user submitted a global event via the ref
          if (globalEventRef.current) {
            currentGlobalEvent = globalEventRef.current;
            globalEventRef.current = ''; // Clear it so it's only picked up once
          }

          const actionRes = await fetch('/api/simulation/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              masterPlan,
              scenario,
              agentPersona: persona,
              otherPersonas: generatedPersonas.filter(p => p.id !== persona.id),
              pastLogs: currentLogs,
              globalEventContext: currentGlobalEvent,
              round
            })
          });

          const actionData = await actionRes.json();
          if (actionData.action) {
            const newLog: SimulationLog = {
              round,
              agentId: persona.id,
              action: actionData.action,
              globalEventContext: currentGlobalEvent || undefined,
            };
            currentLogs = [...currentLogs, newLog];
            setSimLogs(currentLogs); // Update state incrementally
          }
        }
        
        // Clear global event after round completes so it doesn't repeatedly apply
        currentGlobalEvent = '';
      }

      // Step 3: Debrief
      setSimStatus('debriefing');
      const debriefRes = await fetch('/api/simulation/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterPlan,
          scenario,
          personas: generatedPersonas,
          logs: currentLogs
        })
      });
      const debriefData = await debriefRes.json();
      setSimDebrief(debriefData.debrief);

      setSimStatus('complete');

    } catch (error) {
      console.error('Simulation error:', error);
      setSimStatus('idle');
    }
  }, [masterPlan, globalEventInput]);

  const injectGlobalEvent = useCallback((event: string) => {
    globalEventRef.current = event;
    setGlobalEventInput('');
  }, []);

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
      },
      // Simulation exports
      simulationStatus: simStatus,
      simulationPersonas: simPersonas,
      simulationLogs: simLogs,
      simulationDebrief: simDebrief,
      runScenarioSimulation,
      injectGlobalEvent,
      globalEventInput,
      setGlobalEventInput
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
