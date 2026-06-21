"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2, AlertCircle, CheckCircle, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);

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
          Blueprint.AI
        </Link>

        <GlassCard className="p-8 backdrop-blur-2xl bg-black/60 border-white/10 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground">Join BluePrint.AI with email or Google.</p>
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

          <form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setSuccess('');
            setIsLoading(true);
            try {
              const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error);
                setIsLoading(false);
                return;
              }
              setSuccess('Account created! Signing you in...');
              const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
              });
              if (result?.ok) {
                router.push('/dashboard');
              } else {
                router.push('/auth/signin');
              }
            } catch {
              setError('Failed to create account. Try again.');
              setIsLoading(false);
            }
          }} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A1A] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Your name"
              />
            </div>
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
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A1A] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={!!isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] border-white/5 transition-all"
              onClick={() => signIn('google', { redirectTo: '/dashboard' })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Create account with Google
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="underline hover:text-white">Sign in</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
