import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { MessageSquareText, FileText, ChevronRight, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStreaming } from '@/contexts/StreamingContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/card';
import { PaywallModal } from '@/components/paywall/PaywallModal';

interface StartupPlannerChatProps {
  chatId?: string | null;
  onChatUpdated?: (id?: string) => void;
}

export default function StartupPlannerChat({ chatId, onChatUpdated }: StartupPlannerChatProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startSimulation } = useStreaming();
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;
  const onChatUpdatedRef = useRef(onChatUpdated);
  onChatUpdatedRef.current = onChatUpdated;
  const isStreamingRef = useRef(false);
  const loadedChatIdRef = useRef<string | null>(null);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: 'planner-session',
    onFinish: () => {
      isStreamingRef.current = false;
      saveChat();
    },
    onError: (err) => {
      isStreamingRef.current = false;
      if (err.message?.includes('403') || err.message?.includes('LIMIT')) {
        setShowPaywall(true);
      }
    }
  });

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      isStreamingRef.current = true;
    }
  }, [status]);

  const hasAutoSubmittedRef = useRef(false);
  useEffect(() => {
    const initialPrompt = searchParams?.get('prompt');
    if (initialPrompt && messages.length === 0 && !hasAutoSubmittedRef.current && !loadingHistory) {
      hasAutoSubmittedRef.current = true;
      // Remove prompt from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('prompt');
      window.history.replaceState({}, '', newUrl.toString());
      
      sendMessage({ text: initialPrompt }, { body: { isPlanner: true } });
    }
  }, [searchParams, messages.length, loadingHistory, sendMessage]);

  const saveChat = useCallback(async () => {
    if (messages.length === 0) return;
    
    const messagesToSave = messages;
    
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentChatIdRef.current,
          messages: messagesToSave,
          agentType: 'planner'
        })
      });
      const data = await res.json();
      
      if (res.status === 403 && data.error === 'LIMIT_CHAT') {
         setShowPaywall(true);
         return;
      }
      
      if (!currentChatIdRef.current && data.id) {
        setCurrentChatId(data.id);
        currentChatIdRef.current = data.id;
        if (onChatUpdatedRef.current) onChatUpdatedRef.current();
      } else if (onChatUpdatedRef.current) {
        onChatUpdatedRef.current();
      }
    } catch (err) {
      console.error('Failed to save chat', err);
    }
  }, [messages]);

  useEffect(() => {
    if (chatId === loadedChatIdRef.current) return;
    
    if (chatId) {
      setLoadingHistory(true);
      loadedChatIdRef.current = chatId;
      fetch(`/api/chats/${chatId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.messages) {
            setMessages(data.messages);
            setCurrentChatId(chatId);
            currentChatIdRef.current = chatId;
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingHistory(false));
    } else if (chatId === null && loadedChatIdRef.current !== null) {
      loadedChatIdRef.current = null;
      setMessages([]);
      setCurrentChatId(null);
      currentChatIdRef.current = null;
      setLoadingHistory(false);
    }
  }, [chatId, setMessages]);

  const isLoading = status === 'streaming' || status === 'submitted';
  const [planReady, setPlanReady] = useState(false);
  const [planText, setPlanText] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setPlanReady(false);
    setPlanText(null);
    sendMessage({ text: input }, { body: { isPlanner: true } });
    setInput('');
  };

  // When streaming finishes, check if there's a substantial assistant response
  useEffect(() => {
    if (status === 'ready' && messages.length >= 2 && !isStreamingRef.current) {
      const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg) {
        const parts = (lastAssistantMsg as any).parts;
        const text = parts && parts.length > 0
          ? parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
          : (lastAssistantMsg as any).content || (lastAssistantMsg as any).text || '';
        
        // If the assistant produced a response longer than a short question, the plan is ready
        if (text && text.length > 200) {
          setPlanReady(true);
          setPlanText(text);
        }
      }
    }
  }, [status, messages]);

  const handleGenerate = () => {
    if (planText) {
      startSimulation(planText);
      router.push('/workspace/new');
    }
  };

  // Helper to strip markdown formatting from extracted text
  const stripMd = (s: string) => s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '').replace(/^#+\s*/gm, '').trim();

  // Extract market data from assistant text for the sidebar display
  let startupPlan: any = null;
  if (planReady && planText) {
    const tamMatch = planText.match(/(?:TAM|Total Addressable Market)[:\s]*([^\n]+)/i);
    const samMatch = planText.match(/(?:SAM|Serviceable Available Market)[:\s]*([^\n]+)/i);
    const somMatch = planText.match(/(?:SOM|Serviceable Obtainable Market)[:\s]*([^\n]+)/i);
    const targetMatch = planText.match(/(?:Target Audience|Target Market)[:\s]*([^\n]+)/i);
    const gtmMatch = planText.match(/(?:Go-To-Market|GTM)[:\s]*([^\n]+)/i);
    
    if (tamMatch || samMatch || somMatch) {
      startupPlan = {
        tam: stripMd(tamMatch?.[1] || 'See plan details'),
        sam: stripMd(samMatch?.[1] || 'See plan details'),
        som: stripMd(somMatch?.[1] || 'See plan details'),
        targetAudience: stripMd(targetMatch?.[1] || 'See plan details'),
        gtmStrategy: stripMd(gtmMatch?.[1] || 'See plan details'),
        competitors: [],
      };
      
      // Extract competitors
      const compSection = planText.match(/(?:Competitors?|Competitive Landscape)[:\s]*\n?((?:[-•*]\s*[^\n]+\n?)+)/i);
      if (compSection) {
        startupPlan.competitors = compSection[1]
          .split('\n')
          .map((l: string) => stripMd(l.replace(/^[-•*]\s*/, '').trim()))
          .filter((l: string) => l.length > 0);
      }
    }
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full h-full p-4 md:p-8 flex items-stretch gap-6">
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        title="Chat Limit Reached"
        description="Standard accounts are limited to 3 chats. Upgrade to an Exclusive Membership to unlock unlimited conversations."
      />
      
      {/* Left Column: Chat */}
      <div className="flex-1 flex flex-col max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <MessageSquareText className="w-6 h-6 text-indigo-400" />
            Startup Planner Agent
          </h2>
          <p className="text-muted-foreground">
            Share your startup idea. I'll research the market, analyze competitors, and create a comprehensive startup plan.
          </p>
        </div>

        <GlassCard className="flex-1 p-1 flex flex-col min-h-[400px]">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden relative">
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Explain your startup idea to begin...
                </div>
              ) : null}
              
              {error && (
                <div className="p-4 m-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Error
                  </p>
                  <p className="text-sm mt-1">{error.message || 'An unknown error occurred while communicating with the agent.'}</p>
                </div>
              )}

              {messages.map((m, index) => {
                const parts = (m as any).parts;
                const textContent = parts && parts.length > 0
                  ? parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                  : (m as any).content || (m as any).text || '';
                
                const toolCalls = parts 
                  ? parts.filter((p: any) => p.type === 'tool-call' || p.type === 'tool-invocation') 
                  : (m as any).toolInvocations || [];

                const searchCalls = toolCalls.filter((tc: any) => {
                  const name = tc.toolName || tc.toolInvocation?.toolName;
                  return name === 'search_web';
                });

                if ((!textContent || !textContent.trim()) && searchCalls.length === 0) return null; 

                return (
                  <div key={m.id || index} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-xs font-mono mb-1 ${m.role === 'user' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                      {m.role === 'user' ? 'You' : 'Planner Agent'}
                    </div>
                    {searchCalls.map((tc: any, tcIdx: number) => {
                      const args = tc.args || tc.toolInvocation?.args;
                      return (
                        <div key={`tc-${tcIdx}`} className="mb-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-mono text-blue-400 flex items-center gap-2">
                          <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <Search className="w-3 h-3" />
                          Searching web: &quot;{args?.query}&quot;
                        </div>
                      );
                    })}
                    {textContent && textContent.trim() && (
                      <div className={`p-4 rounded-xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-indigo-500/10 border border-indigo-500/20 text-white' : 'bg-white/5 border border-white/10 text-white/90 prose prose-invert prose-sm max-w-none'}`}>
                        {m.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{textContent}</div>
                        ) : (
                          <ReactMarkdown>{textContent}</ReactMarkdown>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="text-xs font-mono mb-1 text-emerald-500">Planner Agent</div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/50 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#121212] border-t border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea 
                  value={input}
                  onChange={handleInputChange}
                  placeholder={startupPlan ? "You can keep chatting, or generate the blueprint above." : "Explain your startup idea..."}
                  className="min-h-[60px] resize-none bg-black/50 border-white/10 focus-visible:ring-indigo-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="h-auto w-24 bg-indigo-600 hover:bg-indigo-700 text-white">Send</Button>
              </form>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Market Analysis Dashboard */}
      <div className="w-[400px] flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-indigo-400" />
            Market Analysis
          </h2>
          <p className="text-xs text-muted-foreground">
            Real-time market data extracted from web searches.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-12 pr-2">
          {!startupPlan && (
            <div className="p-6 border border-white/5 rounded-xl border-dashed flex flex-col items-center justify-center text-center text-white/30 h-[200px]">
              <span className="text-sm">No market data generated yet. Describe your idea!</span>
            </div>
          )}

          {startupPlan && (
            <>
              {/* TAM SAM SOM Widget */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">Market Sizing</div>
                
                <div className="space-y-3">
                  <div className="bg-[#0A0A0A] p-3 rounded-lg border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    <div className="text-[10px] font-mono text-muted-foreground mb-1">Total Addressable Market (TAM)</div>
                    <div className="text-sm font-semibold">{startupPlan.tam}</div>
                  </div>
                  
                  <div className="bg-[#0A0A0A] p-3 rounded-lg border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    <div className="text-[10px] font-mono text-muted-foreground mb-1">Serviceable Available Market (SAM)</div>
                    <div className="text-sm font-semibold">{startupPlan.sam}</div>
                  </div>
                  
                  <div className="bg-[#0A0A0A] p-3 rounded-lg border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                    <div className="text-[10px] font-mono text-muted-foreground mb-1">Serviceable Obtainable Market (SOM)</div>
                    <div className="text-sm font-semibold">{startupPlan.som}</div>
                  </div>
                </div>
              </motion.div>

              {/* Competitors Widget */}
              {startupPlan.competitors && startupPlan.competitors.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-3">Key Competitors</div>
                  <ul className="space-y-2">
                    {startupPlan.competitors.map((comp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0" />
                        {comp}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Target Audience & GTM */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Target Audience</div>
                  <div className="text-sm text-white/90">{startupPlan.targetAudience}</div>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">GTM Strategy</div>
                  <div className="text-sm text-white/90">{startupPlan.gtmStrategy}</div>
                </div>
              </motion.div>

              {/* Generation Actions */}
              {planReady && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mt-4">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    Startup Plan Ready!
                  </div>
                  <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                    Save &amp; Initialize Workspace
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
