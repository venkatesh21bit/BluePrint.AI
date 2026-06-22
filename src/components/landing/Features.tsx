import React from "react";
import {
  GitBranch,
  MessageSquareWarning,
  ShieldCheck,
  Bot,
  Route,
  Gauge,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Opportunity Solution Trees",
    desc: "Deconstruct any concept into Jobs-to-be-Done, then branch into opportunities, solutions, and experiments — Teresa Torres' continuous discovery, automated.",
    accent: "text-indigo-400",
    ring: "group-hover:border-indigo-500/40",
    span: "md:col-span-2",
  },
  {
    icon: MessageSquareWarning,
    title: "The Mom Test audits",
    desc: "Paste an interview transcript. Our coach flags compliments, hypotheticals, and leading questions you mistook for validation.",
    accent: "text-amber-400",
    ring: "group-hover:border-amber-500/40",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "DVF-U risk scoring",
    desc: "Quantify desirability, viability, feasibility, and usability risk so you tackle the riskiest leap-of-faith assumption first.",
    accent: "text-emerald-400",
    ring: "group-hover:border-emerald-500/40",
    span: "",
  },
  {
    icon: Bot,
    title: "Multi-agent user simulation",
    desc: "Autonomous personas with real biases debate your idea across configurable rounds, then a master evaluator synthesizes high-signal insight.",
    accent: "text-violet-400",
    ring: "group-hover:border-violet-500/40",
    span: "md:col-span-2",
  },
  {
    icon: Route,
    title: "30 / 60 / 90 roadmaps",
    desc: "Sequence validated assumptions into deterministic milestone phases — each with explicit fallback paths.",
    accent: "text-sky-400",
    ring: "group-hover:border-sky-500/40",
    span: "",
  },
  {
    icon: Gauge,
    title: "HITL governance",
    desc: "Human-in-the-loop safety checks gate every phase, keeping the AI's recommendations accountable and reviewable.",
    accent: "text-rose-400",
    ring: "group-hover:border-rose-500/40",
    span: "",
  },
];

export function Features() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 md:px-12">
      <SectionHeading
        eyebrow="The platform"
        title="One workspace for the entire discovery loop"
        description="Every framework a principal PM relies on, unified into a single end-to-end pipeline — from raw idea to sequenced, de-risked roadmap."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 transition-all duration-300 hover:bg-white/[0.03] ${f.ring} ${f.span}`}
          >
            {/* hover glow */}
            <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(400px_circle_at_var(--x,50%)_0%,rgba(99,102,241,0.06),transparent_70%)]" />
            <div className="relative">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-neutral-950/60">
                <f.icon className={`h-5 w-5 ${f.accent}`} />
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
