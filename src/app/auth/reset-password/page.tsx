"use client";
import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!token || !emailParam) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
        Invalid reset link. Please request a new password reset.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }
      setSuccess('Password reset successful! Redirecting to sign in...');
      setTimeout(() => router.push('/auth/signin'), 2000);
      setIsLoading(false);
    } catch {
      setError('Something went wrong. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 rounded-lg bg-[#1A1A1A] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="At least 6 characters"
            required
            minLength={6}
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full h-11 px-4 rounded-lg bg-[#1A1A1A] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Repeat your password"
            required
            minLength={6}
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
          disabled={!!isLoading}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Set New Password</h1>
            <p className="text-sm text-muted-foreground">Enter your new password below.</p>
          </div>

          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <ResetForm />
          </Suspense>
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-8">
          <Link href="/auth/signin" className="underline hover:text-white">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
