import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { SCENARIOS } from '@/lib/scenarios';
import { Play, Activity, Users, Send, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';

export default function SimulationTheater() {
  const { 
    simulationStatus, 
    simulationPersonas, 
    simulationLogs, 
    simulationDebrief, 
    runScenarioSimulation, 
    injectGlobalEvent,
    globalEventInput,
    setGlobalEventInput
  } = useStreaming();

  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0].id);

  const handleStart = () => {
    runScenarioSimulation(selectedScenario);
  };

  const handleInjectEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalEventInput.trim()) {
      injectGlobalEvent(globalEventInput);
    }
  };

  return (
    <div className="w-full h-full p-6 md:p-12 relative overflow-auto bg-[#020202] text-white">
      {/* Background SVG Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%">
          <pattern id="sim-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#sim-grid)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-8 h-full">
        {/* Header / Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Scenario Simulation Engine
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Stress test your startup idea against simulated AI personas before you build.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              disabled={simulationStatus !== 'idle' && simulationStatus !== 'complete'}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {SCENARIOS.map(s => (
                <option key={s.id} value={s.id} className="bg-neutral-900">{s.name}</option>
              ))}
            </select>
            
            <button
              onClick={handleStart}
              disabled={simulationStatus === 'running' || simulationStatus === 'generating-personas' || simulationStatus === 'debriefing'}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {simulationStatus === 'idle' ? 'Run Scenario' : 'Restart Sim'}
            </button>
          </div>
        </div>

        {/* Status Tracker */}
        {simulationStatus !== 'idle' && (
          <div className="flex items-center gap-3 text-sm font-mono bg-white/5 border border-white/10 p-3 rounded-xl">
            <Activity className={`w-4 h-4 ${simulationStatus === 'running' ? 'text-purple-400 animate-pulse' : 'text-emerald-400'}`} />
            <span>
              {simulationStatus === 'generating-personas' && 'Spawning Agents...'}
              {simulationStatus === 'running' && 'Simulation in progress...'}
              {simulationStatus === 'debriefing' && 'Generating post-sim debrief...'}
              {simulationStatus === 'complete' && 'Simulation Complete'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
          {/* Left Column: Personas Cast */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Cast of Characters
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
              {simulationPersonas.length === 0 ? (
                <div className="text-sm text-neutral-500 italic p-4 bg-white/5 rounded-xl border border-white/5">
                  Agents will appear here once the simulation starts.
                </div>
              ) : (
                simulationPersonas.map((persona, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={persona.id}
                  >
                    <GlassCard className="p-4 border-white/5 hover:border-purple-500/30 transition-colors cursor-default">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                          {persona.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight">{persona.name}</p>
                          <p className="text-xs text-indigo-300">{persona.role}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Pain Points</div>
                        <ul className="text-xs text-neutral-300 space-y-1 pl-3 list-disc">
                          {persona.painPoints.slice(0, 2).map((pp, i) => (
                            <li key={i}>{pp}</li>
                          ))}
                        </ul>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Live Feed & Debrief */}
          <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Town Hall Feed
            </h3>
            
            <GlassCard className="flex-1 p-0 flex flex-col overflow-hidden border-white/10 relative">
              {/* Event Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {simulationLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                    Awaiting simulation start...
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {simulationLogs.map((log, idx) => {
                      const persona = simulationPersonas.find(p => p.id === log.agentId);
                      const isPositive = ['decide_to_buy', 'spread_word'].includes(log.action.actionType);
                      const isNegative = ['reject', 'raise_objection', 'compare_competitor'].includes(log.action.actionType);
                      
                      return (
                        <motion.div
                          key={`${log.round}-${log.agentId}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4"
                        >
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs shrink-0 mt-1 border border-white/10">
                            {persona?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 bg-white/5 rounded-xl rounded-tl-none p-4 border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm text-indigo-300">{persona?.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">Round {log.round}</span>
                            </div>
                            
                            <div className="mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                isPositive ? 'bg-emerald-500/20 text-emerald-400' :
                                isNegative ? 'bg-rose-500/20 text-rose-400' :
                                'bg-indigo-500/20 text-indigo-400'
                              }`}>
                                {log.action.actionType.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <p className="text-sm text-neutral-200 leading-relaxed">
                              {log.action.content}
                            </p>

                            {log.globalEventContext && (
                              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-200 flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                <span>Reacting to: "{log.globalEventContext}"</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Founder Intervention Input */}
              {simulationStatus === 'running' && (
                <div className="p-4 border-t border-white/10 bg-neutral-900/50">
                  <form onSubmit={handleInjectEvent} className="relative">
                    <input
                      type="text"
                      value={globalEventInput}
                      onChange={(e) => setGlobalEventInput(e.target.value)}
                      placeholder="Inject a global event (e.g., 'We just dropped the price by 50%')"
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!globalEventInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[10px] text-neutral-500 mt-2 text-center">
                    Events injected here will be perceived by all agents in the next round.
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Debrief Section */}
            {simulationDebrief && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <GlassCard className="p-6 border-emerald-500/30 bg-emerald-500/5">
                  <h3 className="text-xl font-bold mb-4 text-emerald-400 flex items-center gap-2">
                    <Activity className="w-6 h-6" />
                    Simulation Debrief
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-neutral-400 mb-1">Signal Strength Score</p>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-white">{simulationDebrief.signalStrengthScore}/100</div>
                          <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${simulationDebrief.signalStrengthScore > 70 ? 'bg-emerald-500' : simulationDebrief.signalStrengthScore > 40 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                              style={{ width: `${simulationDebrief.signalStrengthScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-rose-400 mb-2">Top Objections</p>
                        <ul className="text-sm text-neutral-300 list-disc pl-4 space-y-1">
                          {simulationDebrief.topObjections.map((obj: string, i: number) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-indigo-400 mb-2">Pivot Suggestions</p>
                        <ul className="text-sm text-neutral-300 list-disc pl-4 space-y-1">
                          {simulationDebrief.pivotSuggestions.map((sug: string, i: number) => (
                            <li key={i}>{sug}</li>
                          ))}
                        </ul>
                      </div>

                      {simulationDebrief.killSignals?.length > 0 && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                          <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Kill Signals Detected
                          </p>
                          <ul className="text-sm text-rose-200 list-disc pl-4 space-y-1">
                            {simulationDebrief.killSignals.map((kill: string, i: number) => (
                              <li key={i}>{kill}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
