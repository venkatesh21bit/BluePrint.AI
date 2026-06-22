"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  const router = useRouter();

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-950/50 px-6 py-16 text-center md:px-12 md:py-24">
        {/* glow */}
        <div className="pointer-events-none absolute -top-1/2 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22),transparent_60%)] blur-3xl" />

        <div className="relative">
          <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Stop building blind. Start with a blueprint.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-neutral-400">
            Turn your next idea into a de-risked, sequenced execution plan in
            minutes — grounded in the frameworks the best product teams use.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/dashboard")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(99,102,241,0.4)] transition-all hover:bg-indigo-400 active:translate-y-px sm:w-auto"
            >
              Start building free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-neutral-200 transition-colors hover:border-white/20 hover:text-white sm:w-auto"
            >
              Compare plans
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
