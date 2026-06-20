"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loader2, AlertCircle, Fingerprint, Mail, Key, Shield, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';

interface Suggestion {
  title: string;
  description: string;
  icon: 'passkey' | 'email' | 'forgot' | 'google';
  action: string;
  href: string;
}

const suggestions: Suggestion[] = [
  {
    title: 'Use a Passkey',
    description: 'Sign in with your device biometrics (fingerprint, face, or security key).',
    icon: 'passkey',
    action: 'Sign in with Passkey',
    href: '/auth/signin',
  },
  {
    title: 'Reset Password',
    description: 'Get a password reset link sent to your email.',
    icon: 'forgot',
    action: 'Reset Password',
    href: '/auth/forgot-password',
  },
  {
    title: 'Try Google Sign-In',
    description: 'Use your Google account to authenticate directly.',
    icon: 'google',
    action: 'Continue with Google',
    href: '/auth/signin',
  },
  {
    title: 'Set Up Recovery Email',
    description: 'Add a recovery email to your account for future account recovery.',
    icon: 'email',
    action: 'Learn More',
    href: '/auth/signin',
  },
];

const iconMap = {
  passkey: Fingerprint,
  email: Mail,
  forgot: Key,
  google: Shield,
};

export default function RecoveryPage() {
  const [issue, setIssue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [planText, setPlanText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const planRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (planRef.current) {
      planRef.current.scrollTop = planRef.current.scrollHeight;
    }
  }, [planText]);

  const getRecoveryPlan = async () => {
    if (!issue.trim()) return;
    setShowSuggestions(false);
    setIsStreaming(true);
    setPlanText('');
    try {
      const res = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue: issue.trim(),
          hasPasskey: typeof PublicKeyCredential !== 'undefined',
        }),
      });
      if (!res.ok) throw new Error('Failed to generate plan');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6);
            if (text === '[DONE]') continue;
            try {
              const parsed = JSON.parse(text);
              setPlanText((prev) => prev + (parsed.text || ''));
            } catch {
              setPlanText((prev) => prev + text);
            }
          }
        }
      }
      setIsStreaming(false);
    } catch {
      setPlanText('Failed to generate a recovery plan. Please try the options below manually.');
      setIsStreaming(false);
    }
  };

  const Icon = (name: Suggestion['icon']) => {
    const Comp = iconMap[name];
    return <Comp className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-foreground flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            transformOrigin: 'top center'
          }}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10 p-6"
      >
        <Link href="/auth/signin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" />
          Back to sign in
        </Link>

        <GlassCard className="p-8 backdrop-blur-2xl bg-black/60 border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Account Recovery</h1>
              <p className="text-xs text-muted-foreground">AI-powered sign-in assistance</p>
            </div>
          </div>

          {showSuggestions && !isStreaming && !planText && (
            <>
              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Describe your sign-in issue or choose an option below:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="e.g., I forgot my password and my passkey isn't working..."
                    className="flex-1 h-11 px-4 rounded-lg bg-[#1A1A1A] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && getRecoveryPlan()}
                  />
                  <Button
                    className="h-11 px-4 bg-primary hover:bg-primary/90"
                    onClick={getRecoveryPlan}
                    disabled={!issue.trim()}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((s) => {
                  const SvgIcon = iconMap[s.icon];
                  return (
                    <Link
                      key={s.title}
                      href={s.href}
                      className="p-4 rounded-lg bg-[#1A1A1A] border border-white/5 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <SvgIcon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{s.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      <span className="text-xs text-primary/70 mt-2 inline-block group-hover:text-primary transition-colors">
                        {s.action} →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {(isStreaming || planText) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">
                  {isStreaming ? 'Generating your recovery plan...' : 'Recovery Plan'}
                </span>
              </div>
              <div
                ref={planRef}
                className="max-h-[400px] overflow-y-auto text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {planText}
                {isStreaming && <span className="animate-pulse">▊</span>}
              </div>
              {!isStreaming && planText && (
                <div className="mt-4 space-y-2">
                  <Link href="/auth/signin">
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium">
                      Try Signing In Again
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-11 bg-[#1A1A1A] hover:bg-[#2A2A2A] border-white/5"
                    onClick={() => { setPlanText(''); setShowSuggestions(true); setIssue(''); }}
                  >
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          )}

          {!showSuggestions && !isStreaming && !planText && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Preparing...</p>
            </div>
          )}
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-8">
          <Link href="/auth/forgot-password" className="underline hover:text-white">Forgot your password?</Link>
          {' · '}
          <Link href="/auth/register" className="underline hover:text-white">Create a new account</Link>
        </p>
      </motion.div>
    </div>
  );
}
