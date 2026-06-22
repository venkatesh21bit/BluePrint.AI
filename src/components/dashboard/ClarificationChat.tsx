import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { MessageSquareText, FileText, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStreaming } from '@/contexts/StreamingContext';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/card';
import { PaywallModal } from '@/components/paywall/PaywallModal';

interface ClarificationChatProps {
  chatId?: string | null;
  onChatUpdated?: (id?: string) => void;
}

export default function ClarificationChat({ chatId, onChatUpdated }: ClarificationChatProps) {
  const router = useRouter();
  const { startSimulation } = useStreaming();
  const [jtbd, setJtbd] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;
  const onChatUpdatedRef = useRef(onChatUpdated);
  onChatUpdatedRef.current = onChatUpdated;
  // Track whether we're currently streaming to avoid saving mid-stream
  const isStreamingRef = useRef(false);
  // Track whether we've already loaded for a given chatId to avoid re-fetching
  const loadedChatIdRef = useRef<string | null>(null);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: 'clarification-session',
    onFinish: () => {
      // Stream finished — now it's safe to save
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

  // Track streaming state
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      isStreamingRef.current = true;
    }
  }, [status]);

  // Save chat to backend — only called when safe (not mid-stream)
  const saveChat = useCallback(async () => {
    if (messages.length === 0) return;
    
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentChatIdRef.current,
          messages: messages,
          agentType: 'clarification'
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
      } else if (currentChatIdRef.current) {
        if (onChatUpdatedRef.current) onChatUpdatedRef.current();
      }
    } catch (err) {
      console.error('Failed to save chat', err);
    }
  }, [messages]);

  // Load chat history when chatId prop changes (user clicks a sidebar item)
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
      // User clicked "New Brainstorm"
      loadedChatIdRef.current = null;
      setMessages([]);
      setCurrentChatId(null);
      currentChatIdRef.current = null;
      setLoadingHistory(false);
    }
  }, [chatId, setMessages]);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input }, { body: { isClarification: true } });
    setInput('');
  };

  const insights: any[] = [];
  let documentationDraft: string | null = null;

  messages.forEach(m => {
    const processTool = (toolName: string, args: any) => {
      if (['extract_jtbd_insight', 'extract_problem_insight', 'extract_target_audience_insight', 'register_current_workaround'].includes(toolName)) {
        if (args) insights.push({ toolName, args });
      } else if (toolName === 'draft_documentation') {
        if (args?.markdown_content) documentationDraft = args.markdown_content;
      }
    };

    (m as any).toolInvocations?.forEach((ti: any) => {
      let args = ti.args;
      if ((!args || Object.keys(args).length === 0) && ti.result) {
        try {
          const res = typeof ti.result === 'string' ? JSON.parse(ti.result) : ti.result;
          if (res.args) args = res.args;
        } catch(e) {}
      }
      processTool(ti.toolName, args);
    });

    (m as any).parts?.forEach((p: any) => {
      if (p.type === 'tool-invocation') {
        const toolName = p.toolInvocation?.toolName || p.toolName;
        // AI SDK v6 uses 'input' instead of 'args'
        let args = p.toolInvocation?.args || p.toolInvocation?.input || p.args || p.input;
        if ((!args || Object.keys(args).length === 0)) {
          // Try to recover from output/result
          const output = p.toolInvocation?.output || p.toolInvocation?.result || p.output || p.result;
          if (output) {
            try {
              const parsed = typeof output === 'string' ? JSON.parse(output) : output;
              if (parsed.args) args = parsed.args;
            } catch(e) {}
          }
        }
        if (toolName) processTool(toolName, args);
      }
    });
  });

  const handleGenerate = () => {
    if (documentationDraft) {
      startSimulation(documentationDraft);
      router.push('/workspace/new');
    }
  };

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
            <MessageSquareText className="w-6 h-6 text-primary" />
            Product Clarification Agent
          </h2>
          <p className="text-muted-foreground">
            Let's dig into your idea. I'll ask questions and extract validated facts before we draft the final document.
          </p>
        </div>

        <GlassCard className="flex-1 p-1 flex flex-col min-h-[400px]">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden relative">
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Explain your idea to start the clarification process...
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

                // Hide if there's no text and no search calls
                if ((!textContent || !textContent.trim()) && searchCalls.length === 0) return null; 

                return (
                  <div key={m.id || index} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-xs font-mono mb-1 ${m.role === 'user' ? 'text-primary' : 'text-emerald-500'}`}>
                      {m.role === 'user' ? 'You' : 'Clarification Agent'}
                    </div>
                    {searchCalls.map((tc: any, tcIdx: number) => {
                      const args = tc.args || tc.toolInvocation?.args;
                      return (
                        <div key={`tc-${tcIdx}`} className="mb-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-mono text-blue-400 flex items-center gap-2">
                          <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                          Searching web for: &quot;{args?.query}&quot;
                        </div>
                      );
                    })}
                    {textContent && textContent.trim() && (
                      <div className={`p-4 rounded-xl max-w-[85%] text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                        {textContent}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="text-xs font-mono mb-1 text-emerald-500">Clarification Agent</div>
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
                  placeholder={jtbd ? "You can keep chatting, or generate the blueprint above." : "Explain your idea..."}
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

      {/* Right Column: Insight Canvas */}
      <div className="w-[400px] flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Insight Canvas
          </h2>
          <p className="text-xs text-muted-foreground">
            Empirical facts extracted from our chat.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-12 pr-2">
          {insights.length === 0 && (
            <div className="p-6 border border-white/5 rounded-xl border-dashed flex flex-col items-center justify-center text-center text-white/30 h-[200px]">
              <span className="text-sm">No insights extracted yet.</span>
            </div>
          )}

          {insights.map((insight, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-xs font-mono text-purple-400 mb-2 uppercase tracking-wider">
                {insight.toolName.replace('extract_', '').replace('_insight', '').replace(/_/g, ' ')}
              </div>
              
              {insight.toolName === 'extract_jtbd_insight' && (
                <div className="text-sm space-y-1">
                  <div><strong className="text-white/50">Role:</strong> {insight.args.role}</div>
                  <div><strong className="text-white/50">Situation:</strong> {insight.args.situation}</div>
                  <div><strong className="text-white/50">Motivation:</strong> {insight.args.motivation}</div>
                  <div><strong className="text-white/50">Outcome:</strong> {insight.args.expectedOutcome}</div>
                </div>
              )}

              {insight.toolName === 'register_current_workaround' && (
                <div className="text-sm space-y-1">
                  <div><strong className="text-white/50">Tool:</strong> {insight.args.currentTool}</div>
                  <div><strong className="text-white/50">Process:</strong> {insight.args.manualProcess}</div>
                  <div><strong className="text-white/50">Friction:</strong> {insight.args.frictionPoint}</div>
                  <div><strong className="text-white/50">Cost:</strong> {insight.args.estimatedCost}</div>
                </div>
              )}

              {insight.toolName === 'extract_problem_insight' && (
                <div className="text-sm space-y-1">
                  <div><strong className="text-white/50">Problem:</strong> {insight.args.problemDescription}</div>
                  <div><strong className="text-white/50">Impact:</strong> {insight.args.businessImpact}</div>
                </div>
              )}

              {insight.toolName === 'extract_target_audience_insight' && (
                <div className="text-sm">{insight.args.audienceDescription}</div>
              )}

              {insight.args.sourceContext && (
                <div className="mt-3 text-xs italic text-white/40 border-l-2 border-white/10 pl-2">
                  &quot;{insight.args.sourceContext}&quot;
                </div>
              )}
            </motion.div>
          ))}

          {documentationDraft && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                Documentation Draft Ready!
              </div>
              <p className="text-xs text-white/70 mb-4 line-clamp-3 font-mono">
                {documentationDraft}
              </p>
              <Button onClick={handleGenerate} className="bg-primary hover:bg-primary/90 text-white w-full">
                Save &amp; Initialize Workspace
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
