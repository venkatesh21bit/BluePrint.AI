import React from "react";

const FRAMEWORKS = [
  "Opportunity Solution Trees",
  "The Mom Test",
  "DVF-U Risk Scoring",
  "Jobs-to-be-Done",
  "Continuous Discovery",
  "30 / 60 / 90 Roadmaps",
  "Assumption Mapping",
  "Multi-Agent Simulation",
];

export function Frameworks() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-8 md:px-12">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
        Built on the frameworks top product teams trust
      </p>

      <div className="mask-fade-x relative mt-8 overflow-hidden">
        <div className="flex w-max animate-marquee gap-4">
          {[...FRAMEWORKS, ...FRAMEWORKS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 font-mono text-xs tracking-tight text-neutral-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
