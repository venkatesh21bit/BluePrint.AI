"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Bot, Users, Zap, Layers, PlayCircle, ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const POINTS = [
  {
    icon: Users,
    title: "Real human personas",
    desc: "Agents carry distinct biases, friction points, and domain expertise. They argue, agree, and collaborate like real people.",
    accent: "text-emerald-400",
  },
  {
    icon: Layers,
    title: "Deep debate rounds",
    desc: "Configure up to 10 back-and-forth rounds and watch ideas evolve as agents challenge each other's assumptions.",
    accent: "text-sky-400",
  },
  {
    icon: Zap,
    title: "Massively parallel",
    desc: "Simulate hours of customer interviews and board meetings in seconds with parallel LLM execution.",
    accent: "text-amber-400",
  },
  {
    icon: Bot,
    title: "Unbiased synthesis",
    desc: "A master evaluator monitors the whole simulation to extract signal and invalidate your riskiest assumptions.",
    accent: "text-violet-400",
  },
];

const TRANSCRIPT = [
  { who: "Maya · Skeptical CFO", tone: "text-rose-300", text: "Show me the unit economics before we discuss scale." },
  { who: "Devin · Early Adopter", tone: "text-emerald-300", text: "I'd switch today if the onboarding took under five minutes." },
  { who: "Priya · Power User", tone: "text-sky-300", text: "The notification logic breaks down once I have 20+ habits." },
  { who: "Evaluator", tone: "text-indigo-300", text: "Desirability validated. Viability remains the top leap-of-faith risk." },
];

export function SimulationShowcase() {
  const router = useRouter();

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12">
      <SectionHeading
        eyebrow="Simulation engine"
        title={
          <>
            Stress-test your idea against{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-violet-400 bg-clip-text text-transparent">
              autonomous users
            </span>
          </>
        }
        description="Stop guessing how people will react. Watch AI personas debate your concept like a real-world room — before you commit a single sprint."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live-feed mockup */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-neutral-950/40 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-neutral-950/80 px-5 py-3">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Simulation · Round 4 / 10
            </span>
            <span className="font-mono text-xs text-neutral-500">4 personas</span>
          </div>

          <div className="space-y-3 p-5">
            {TRANSCRIPT.map((m, i) => (
              <div
                key={i}
                className="animate-fade-up rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className={`mb-1 font-mono text-[11px] ${m.tone}`}>
                  {m.who}
                </div>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature points */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition-colors hover:border-white/15"
            >
              <p.icon className={`h-6 w-6 ${p.accent}`} />
              <h3 className="mt-4 text-sm font-semibold text-white">
                {p.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all hover:bg-indigo-400 active:translate-y-px"
        >
          <PlayCircle className="h-4 w-4" />
          Open the simulation workspace
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}
