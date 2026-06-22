import React from "react";

/**
 * Shared atmospheric backdrop for the landing page:
 * faint grid, indigo/emerald radial glows, and a film-grain overlay
 * to keep the dark gradients smooth and premium.
 */
export function LandingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* faint grid that fades toward the top */}
      <div className="absolute inset-0 bg-grid-fade" />

      {/* primary indigo spotlight behind the hero */}
      <div className="absolute -top-48 left-1/2 h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_60%)] blur-3xl" />

      {/* cool emerald accent low and to the right */}
      <div className="absolute top-1/3 right-[-10%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_65%)] blur-3xl" />

      {/* soft violet accent low-left */}
      <div className="absolute bottom-0 left-[-8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.07),transparent_65%)] blur-3xl" />

      {/* grain */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  );
}
