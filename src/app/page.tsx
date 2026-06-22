import React from "react";
import { Header } from "@/components/layout/Header";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { Hero } from "@/components/landing/Hero";
import { Frameworks } from "@/components/landing/Frameworks";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SimulationShowcase } from "@/components/landing/SimulationShowcase";
import { RiskMatrix } from "@/components/landing/RiskMatrix";
import { Timeline } from "@/components/landing/Timeline";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-sans text-neutral-200 selection:bg-indigo-500/30">
      <LandingBackground />
      <Header />

      <main className="relative z-10">
        <Hero />
        <Frameworks />
        <Features />
        <HowItWorks />
        <SimulationShowcase />
        <RiskMatrix />
        <Timeline />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
