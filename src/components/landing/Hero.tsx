"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";

const DEFAULT_PROMPT =
  "Build an ADHD habit-loop tracking app with contextual push notifications.";

const SUGGESTIONS = [
  "A B2B onboarding analytics tool",
  "Carbon tracking for logistics fleets",
  "An AI tutor for medical students",
];

export function Hero() {
  const router = useRouter();
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");

  const handleStream = useCallback(
    (override?: string) => {
      const concept = (override ?? prompt).trim() || DEFAULT_PROMPT;
      const encodedPrompt = encodeURIComponent(concept);

      if (!session?.user) {
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(
            "/dashboard?prompt=" + encodedPrompt
          )}`
        );
      } else {
        router.push(`/dashboard?prompt=${encodedPrompt}`);
      }
    },
    [prompt, session, router]
  );

  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-8 pb-24 md:px-12 md:pt-12 lg:pt-14">
      {/* Bordered hero frame with corner crosshairs (AI SDK style) */}
      <div className="relative">
        <CornerCrosshair className="-top-3 -left-3" />
        <CornerCrosshair className="-top-3 -right-3" />
        <CornerCrosshair className="-bottom-3 -left-3" />
        <CornerCrosshair className="-bottom-3 -right-3" />

        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.01] px-6 py-12 text-center backdrop-blur-sm md:px-12 md:py-16">
          {/* Announcement pill */}
          <div className="animate-fade-up mb-8 flex justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-3 text-xs font-medium text-neutral-300 backdrop-blur-md transition-colors hover:border-indigo-500/40 hover:text-white"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                <Sparkles className="h-3 w-3" />
                New
              </span>
              Multi-agent simulation engine is live
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "60ms" }}
          >
            Turn vague ideas into{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              structured execution plans
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-neutral-400 md:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            Stop building blind. Map opportunities with Opportunity Solution
            Trees, audit assumptions with The Mom Test, score DVF-U risk, and
            simulate real users — before you write a single line of code.
          </p>

          {/* Prompt input */}
          <div
            className="animate-fade-up mx-auto mt-10 max-w-2xl"
            style={{ animationDelay: "180ms" }}
          >
            <div className="group relative flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-neutral-950/60 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition-colors focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/15">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStream();
                }}
                placeholder="Describe your product concept…"
                aria-label="Describe your product concept"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder-neutral-500 outline-none md:text-base"
              />
              <button
                onClick={() => handleStream()}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all hover:bg-indigo-400 active:translate-y-px"
              >
                Analyze
                <CornerDownLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Suggestion chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-neutral-500">Try</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStream(s)}
                  className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-neutral-400 transition-colors hover:border-white/15 hover:text-neutral-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary CTAs */}
          <div
            className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-neutral-200 transition-colors hover:border-white/20 hover:text-white sm:w-auto"
            >
              Open the console
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:w-auto"
            >
              View pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CornerCrosshair({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute z-10 text-neutral-600 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 0v16M0 8h16"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </span>
  );
}
