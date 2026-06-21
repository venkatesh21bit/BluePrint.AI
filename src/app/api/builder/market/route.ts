import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { MarketAnalysisSchema, JtbdStorySchema } from '@/schemas/builder';

export const runtime = 'edge';
export const maxDuration = 60;

const Pass1Schema = z.object({
  conceptName: z.string().describe('The refined, action-oriented name of the concept.'),
  marketAnalysis: MarketAnalysisSchema,
  jtbdFramework: z.array(JtbdStorySchema),
});

export async function POST(req: Request) {
  try {
    const { conceptPrompt } = await req.json();

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: Pass1Schema,
      schemaName: 'MarketStrategyPlan',
      schemaDescription: 'Deep market analysis and JTBD framework for a startup concept.',
      prompt: `You are generating the MARKET ANALYSIS and JTBD FRAMEWORK for this startup concept:
"${conceptPrompt}"

## conceptName
Give it a compelling, brandable name.

## Market Analysis
- TAM: Include specific dollar figure with growth rate and source (e.g., "$340B global accounting services market, growing at 8.5% CAGR through 2030 — Statista 2024")
- SAM: Narrow to the specific segment with reasoning and dollar figure
- SOM: Realistic year-1 capture estimate with unit economics (e.g., "$2.4M ARR from 200 startups at $1K/mo")
- competitors: List 3 REAL companies with 1-sentence differentiation each (e.g., "Pilot.com — full-service bookkeeping for startups, $500-2500/mo, human-heavy model")
- targetAudience: Detailed ICP with firmographics AND psychographics
- gtmStrategy: Month-by-month plan for the first 12 months with specific channels and tactics

## JTBD Framework
Generate exactly 3 Jobs-To-Be-Done stories:
- 1 functional (concrete tasks users need to accomplish)
- 1 emotional (feelings and fears driving behavior)
- 1 social (how this affects their standing with peers/investors/team)

Each role must be a SPECIFIC persona (e.g., "CFO at a 30-person post-Series A SaaS company"), NOT generic.
Each situation must describe a SPECIFIC triggering event with frequency.
Each outcome must include measurable impact (time saved, money saved, stress reduced).`,
      system: `You are a world-class startup market analyst who has evaluated 1000+ YC applications. You produce investor-grade market analyses with real data points. Your JTBD stories are specific enough that a product manager could build features from them. You always use real competitor names and realistic market figures. Every number you cite should be defensible in a pitch deck.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate market analysis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
