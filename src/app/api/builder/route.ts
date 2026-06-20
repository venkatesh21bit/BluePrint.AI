import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { MasterExecutionPlanSchema } from '@/schemas/builder';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { conceptPrompt, sessionUserId } = await req.json();

    const result = streamObject({
      model: google('gemini-3-flash-preview'),
      schema: MasterExecutionPlanSchema,
      schemaName: 'MasterExecutionPlan',
      schemaDescription: 'A comprehensive, investor-grade startup execution blueprint with deep market analysis, actionable OST framework, real Mom Test interview questions, prioritized risk assumptions with validation experiments, and phased milestones.',
      prompt: `You are generating a COMPREHENSIVE Zero-to-One Startup Execution Plan for this concept:
"${conceptPrompt}"

CRITICAL QUALITY REQUIREMENTS — every section must be detailed enough for a founder to ACT on immediately:

## OST Framework (Opportunity Solution Tree)
Generate a DEEP tree with at minimum:
- 1 root "outcome" node (measurable business goal with KPI, e.g., "Achieve $100K MRR within 18 months")
- 3-4 "opportunity" nodes (specific user pain points with evidence, not generic statements)
- 2-3 "solution" nodes per opportunity (concrete product features, not vague descriptions)
- 1-2 "test" nodes per solution (specific experiments with success criteria)
That's 15-25 nodes minimum. Each node title must be detailed, not vague.

## Mom Test Validation
- behavioralQuestions: Generate 5-8 REAL interview questions a founder should ask customers TODAY. Each must focus on PAST behavior. Example: "Walk me through the last time you closed your monthly books — what tool did you use, how long did it take, and what went wrong?" NOT "Would you use an AI tool?"
- auditReport: Generate 5+ specific pitfall warnings with BAD vs BETTER question examples tailored to this startup idea.
- cheapestExperiment: A step-by-step validation experiment (who to recruit, what to measure, timeline, success criteria).

## JTBD Framework
Generate 4-6 Jobs-To-Be-Done stories covering functional, emotional, AND social dimensions. Each role must be a specific persona (e.g., "CFO at a 30-person SaaS startup"), not generic.

## Prioritized Assumptions
Generate 6-10 falsifiable assumptions ranked by risk. Most evidence scores should be 0.1-0.4 (untested). Each recommendedExperiment must be a concrete action plan, not a vague suggestion.

## Milestones
Generate 3-4 phases with 3-5 tasks each. Task titles must be engineer-assignable (e.g., "Build Plaid API integration for bank feed ingestion" not "Connect to banks"). Duration estimates should be realistic (7-30 days per task).

## Market Analysis
Include specific dollar figures with sources for TAM/SAM/SOM. List 5-8 real competitors with differentiation. GTM strategy should have month-by-month tactics.

DO NOT be vague. DO NOT use placeholder text. Every field must contain actionable, specific content.`,
      system: `You are a world-class startup strategist who has advised 500+ YC companies. You produce investor-grade execution plans that founders can immediately act on. You never produce vague, generic, or placeholder content. Every recommendation is specific, measurable, and actionable. You always include real competitor names, realistic market figures, and concrete validation experiments. Your Mom Test questions always focus on past behavior, never hypothetical futures. Your OST trees are deep and interconnected, not shallow. Your risk assumptions have realistic evidence scores (most untested assumptions should be 0.1-0.4, not 0.7+).`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process execution stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
