"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { AuthButtons } from "@/components/auth/AuthButtons";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-neutral-950/50 backdrop-blur-xl">
      <div className="flex items-center justify-between py-4 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            </span>
            Blueprint.AI
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {session?.user && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/profile" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Profile</Link>
                <Link href="/pricing" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Upgrade</Link>
              </>
            )}
            {!session?.user && (
              <Link href="/pricing" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Pricing
              </Link>
            )}
            {!session?.user && (
              <Link href="/auth/signin" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Sign In</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <AuthButtons />
          ) : (
            <Link href="/auth/signin">
              <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-semibold text-neutral-200 rounded-lg group bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-600 hover:text-white focus:ring-2 focus:outline-none focus:ring-indigo-800 transition-all">
                <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-neutral-950 rounded-md group-hover:bg-opacity-0">
                  Launch Console
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
