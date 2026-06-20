"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devLink, setDevLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setIsLoading(false);
        return;
      }
      setSent(true);
      setSuccess('If the email exists, a reset link has been sent.');
      if (data.devResetUrl) {
        setDevLink(data.devResetUrl);
      }
      setIsLoading(false);
    } catch {
      setError('Failed to send. Try again.');
      setIsLoading(false);
    }
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
        className="w-full max-w-md relative z-10 p-6"
      >
        <Link href="/" className="inline-block mb-8 text-2xl font-bold tracking-tighter text-white hover:text-primary transition-colors">
          ZeroOne
        </Link>

        <GlassCard className="p-8 backdrop-blur-2xl bg-black/60 border-white/10 shadow-2xl">
          <Link href="/auth/signin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" />
            Back to sign in
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              {sent
                ? 'Check your email for a reset link. It expires in 1 hour.'
                : 'Enter your email and we\'ll send you a password reset link.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {devLink && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
              <p className="font-semibold mb-1">Development Mode — Reset Link:</p>
              <a href={devLink} className="underline break-all hover:text-amber-300">{devLink}</a>
            </div>
          )}

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-[#1A1A1A] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
                disabled={!!isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {sent && (
            <div className="text-center">
              <Button
                variant="outline"
                className="w-full h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] border-white/5"
                onClick={() => { setSent(false); setEmail(''); setDevLink(''); }}
              >
                Send again
              </Button>
            </div>
          )}
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-8">
          <Link href="/auth/recovery" className="underline hover:text-white">Need help with other sign-in issues?</Link>
        </p>
      </motion.div>
    </div>
  );
}
