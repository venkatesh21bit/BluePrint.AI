import React from "react";
import { Lightbulb, Target, Route } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: Lightbulb,
    step: "01",
    title: "Describe your idea",
    desc: "Type your concept in plain language. Blueprint deconstructs it into Jobs-to-be-Done stories and surfaces the real opportunity spaces.",
    accent: "text-amber-400",
  },
  {
    icon: Target,
    step: "02",
    title: "Analyze & validate",
    desc: "The Mom Test coach audits your assumptions while DVF-U scoring pinpoints the leap-of-faith gaps that could sink the product.",
    accent: "text-indigo-400",
  },
  {
    icon: Route,
    step: "03",
    title: "Get your roadmap",
    desc: "Receive a phased 30/60/90-day execution plan with milestone tasks, fallback paths, and governance checkpoints.",
    accent: "text-emerald-400",
  },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12">
      <SectionHeading
        eyebrow="How it works"
        title="From a sentence to a sequenced plan"
        description="Three steps take you from a fuzzy hunch to an execution plan you can actually defend in a room."
      />

      <div className="relative mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className="group relative bg-[#0b0b10] p-8 transition-colors hover:bg-[#0e0e15]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-neutral-950/60">
                <s.icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <span className="font-mono text-2xl font-semibold text-white/10 transition-colors group-hover:text-white/20">
                {s.step}
              </span>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
