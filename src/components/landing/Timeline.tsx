"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "./SectionHeading";

const PHASES = [
  {
    label: "Phase 1 · 30 days",
    title: "Core habit-loop MVP",
    desc: "Validate push delivery and core engagement metrics.",
    fallback: "If native push fails, fall back to SMS triggers via Twilio.",
    active: true,
  },
  {
    label: "Phase 2 · 60 days",
    title: "Contextual sensors",
    desc: "Integrate background location and motion detection.",
    fallback: "Time-based triggers if OS background limits block sensors.",
    active: false,
  },
  {
    label: "Phase 3 · 90 days",
    title: "Scale infrastructure",
    desc: "Migrate to edge functions and read replicas.",
    fallback: null,
    active: false,
  },
];

export function Timeline() {
  const router = useRouter();

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12">
      <SectionHeading
        align="left"
        eyebrow="Execution timeline"
        title="Validated assumptions become a deterministic plan"
        description="Each milestone carries explicit fallback paths, so a failed bet never stalls the roadmap. Click any phase to start planning yours."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PHASES.map((phase, i) => (
          <button
            key={phase.title}
            onClick={() => router.push("/dashboard")}
            className="group flex flex-col gap-4 text-left"
          >
            {/* connector dot + line */}
            <div className="flex items-center gap-3">
              <span
                className={`relative flex h-3 w-3 items-center justify-center rounded-full ${
                  phase.active ? "bg-indigo-500" : "bg-neutral-700"
                }`}
              >
                {phase.active && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-60" />
                )}
              </span>
              <span
                className={`h-px flex-1 ${
                  i < PHASES.length - 1 ? "bg-white/10" : "bg-transparent"
                }`}
              />
            </div>

            <span
              className={`font-mono text-xs uppercase tracking-widest ${
                phase.active ? "text-indigo-400" : "text-neutral-500"
              }`}
            >
              {phase.label}
            </span>

            <div
              className={`relative flex-1 overflow-hidden rounded-2xl border bg-white/[0.015] p-5 transition-all duration-300 ${
                phase.active
                  ? "border-indigo-500/30 hover:border-indigo-500/50"
                  : "border-white/[0.06] opacity-70 hover:opacity-100 hover:border-white/15"
              }`}
            >
              <h4 className="font-semibold tracking-tight text-white">
                {phase.title}
              </h4>
              <p className="mt-1 text-xs text-neutral-400">{phase.desc}</p>

              {phase.fallback && (
                <div className="mt-4 rounded-lg border border-white/[0.05] bg-neutral-950/60 p-3">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-indigo-400/80">
                    Fallback path
                  </span>
                  <p className="text-xs text-neutral-400">{phase.fallback}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
