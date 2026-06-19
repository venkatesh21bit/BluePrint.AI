"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileCheck2, AlertTriangle, Fingerprint, RefreshCcw } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';

export default function TranscriptEvaluator() {
  const { phase2Ready, state, object } = useStreaming();
  const validation = object?.momTestValidation;
  
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async () => {
    if (!transcript.trim()) return;
    setIsEvaluating(true);
    
    try {
      const response = await fetch('/api/evaluate-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      const data = await response.json();
      setResult(data);
      // In a real app, this would trigger updateAssumptionEvidence in Context
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
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

  if (!validation) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <MessageCircle className="w-8 h-8 text-white/20" />
          <p className="font-mono text-sm">No validation data generated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* Left Column: Input Transcript */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <Fingerprint className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Mom Test Evaluator</h2>
        </div>
        <p className="text-sm text-muted-foreground text-pretty mb-2 shrink-0">
          Paste your raw interview notes or transcript below. The engine will parse it as a "Truth Filter" to separate polite fluff from empirical past behavior.
        </p>

        <div className="flex-1 min-h-[300px] flex flex-col">
          <Textarea 
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Interviewer: How do you currently handle...&#10;Customer: Well, last week I paid $50 to..."
            className="flex-1 bg-[#121212] border-white/10 resize-none font-mono text-sm p-4 focus-visible:ring-primary/50"
          />
        </div>
        <Button 
          onClick={handleEvaluate} 
          disabled={isEvaluating || !transcript.trim()} 
          className="w-full shrink-0"
        >
          {isEvaluating ? (
            <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Evaluating Transcript...</>
          ) : (
            <><FileCheck2 className="w-4 h-4 mr-2" /> Extract Empirical Facts</>
          )}
        </Button>
      </div>

      {/* Right Column: Results & Matrix Shift */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 shrink-0">
          <FileCheck2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold">Truth Filter Results</h2>
        </div>

        {!result && !isEvaluating && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
            <span className="text-muted-foreground text-sm font-mono">Awaiting transcript data...</span>
          </div>
        )}

        {isEvaluating && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02] gap-4">
            <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
            <span className="text-muted-foreground text-sm font-mono">Parsing linguistic patterns...</span>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6 pb-6">
            <GlassCard className="p-6 bg-gradient-to-br from-[#121212] to-[#0A0A0A]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-medium text-white/90">Interview Quality Score (Q)</h3>
                  <p className="text-xs text-muted-foreground">Ratio of facts to fluff/hypotheticals.</p>
                </div>
                <div className={`text-3xl font-bold font-mono ${result.qScore > 0.5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {Math.round(result.qScore * 100)}%
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-emerald-500 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    VERIFIED EMPIRICAL FACTS ({result.facts.length})
                  </h4>
                  {result.facts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic pl-3">No concrete past behaviors detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.facts.map((fact: string, i: number) => (
                        <li key={i} className="text-sm text-white/80 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                          "{fact}"
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-mono text-rose-500 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    POLITE FLUFF & HYPOTHETICALS ({result.fluff.length})
                  </h4>
                  {result.fluff.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic pl-3">No speculative fluff detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {result.fluff.map((fluff: string, i: number) => (
                        <li key={i} className="text-sm text-white/80 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                          "{fluff}"
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </GlassCard>

            {result.facts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#121212] border border-primary/20 rounded-xl relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                 <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-mono text-primary flex items-center gap-1">MATRIX UPDATE TRIGGERED</span>
                 </div>
                 <p className="text-sm text-muted-foreground mb-3">
                   The Evidence (E) axis for related assumptions has been increased. Risk scores (S_risk) have dropped below the 0.40 threshold.
                 </p>
                 <Button variant="outline" size="sm" className="w-full text-xs font-mono border-white/10 hover:bg-white/5" onClick={() => window.alert('Navigating to Risk Prioritizer...')}>
                   View Updated Risk Matrix
                 </Button>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
