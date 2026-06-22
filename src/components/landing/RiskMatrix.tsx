"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "./SectionHeading";

const NODES = [
  { top: "20%", left: "20%", color: "bg-rose-500", glow: "shadow-[0_0_12px_rgba(244,63,94,0.5)]", label: "Desirability", tone: "text-rose-300", risk: "High risk", pulse: true },
  { top: "30%", left: "70%", color: "bg-teal-500", glow: "", label: "Viability", tone: "text-teal-300", risk: "Validated", pulse: false },
  { top: "68%", left: "32%", color: "bg-indigo-500", glow: "", label: "Feasibility", tone: "text-indigo-300", risk: "Investigating", pulse: false },
  { top: "60%", left: "62%", color: "bg-amber-500", glow: "", label: "Usability", tone: "text-amber-300", risk: "Moderate", pulse: false },
];

export function RiskMatrix() {
  const router = useRouter();

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12">
      <SectionHeading
        align="left"
        eyebrow="Assumption mapping"
        title="See exactly where your idea is most likely to break"
        description="Plot every leap-of-faith assumption across David Bland's DVF-U framework. The riskiest, least-evidenced bets rise to the top-left — so you know what to test first."
      />

      <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06] bg-neutral-950/40 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-neutral-950/80 px-5 py-3">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-400">
            <span className="text-indigo-400">Risk matrix</span>
          </span>
          <span className="hidden font-mono text-xs tracking-wider text-neutral-500 sm:block">
            S_risk = I_importance × (1.0 − E_evidence)
          </span>
        </div>

        <div className="relative aspect-square w-full overflow-hidden bg-neutral-950/40 md:aspect-[21/9]">
          {/* high-risk quadrant tint */}
          <div className="absolute left-0 top-0 h-1/2 w-1/2 border-b border-r border-rose-500/10 bg-rose-500/[0.04]" />

          {/* axes */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-1/2 w-full border-t border-dashed border-white/10" />
            <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-white/10" />
          </div>

          {/* labels */}
          <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-rose-400/70">
            Leap of faith
          </div>
          <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest text-emerald-400/50">
            Proven core
          </div>
          <div className="absolute -left-6 top-1/2 -rotate-90 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Importance
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Evidence
          </div>

          {NODES.map((n) => (
            <button
              key={n.label}
              onClick={() => router.push("/dashboard")}
              className="group/node absolute cursor-pointer"
              style={{ top: n.top, left: n.left }}
              aria-label={`${n.label}: ${n.risk}`}
            >
              <span
                className={`block h-4 w-4 rounded-full ${n.color} ${n.glow} transition-transform duration-200 group-hover/node:scale-125 ${
                  n.pulse ? "animate-pulse" : ""
                }`}
              />
              <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-neutral-900 px-2 py-1 font-mono text-[10px] opacity-0 transition-opacity group-hover/node:opacity-100">
                <span className={n.tone}>{n.label}</span>
                <span className="text-neutral-500"> · {n.risk}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
