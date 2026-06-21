import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { MomTestCoachSchema, AssumptionSchema } from '@/schemas/builder';

export const runtime = 'edge';
export const maxDuration = 60;

const Pass3Schema = z.object({
  momTestValidation: MomTestCoachSchema,
  prioritizedAssumptions: z.array(AssumptionSchema),
});

export async function POST(req: Request) {
  try {
    const { conceptPrompt, marketAnalysis, jtbdFramework, ostFramework } = await req.json();

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: Pass3Schema,
      schemaName: 'ValidationPlan',
      schemaDescription: 'Mom Test interview preparation and prioritized risk assumptions.',
      prompt: `You are generating the VALIDATION PLAN for this startup:
"${conceptPrompt}"

MARKET CONTEXT:
${JSON.stringify(marketAnalysis, null, 2)}

KEY JTBD STORIES:
${JSON.stringify(jtbdFramework?.slice(0, 3), null, 2)}

OST KEY OPPORTUNITIES:
${JSON.stringify(ostFramework?.filter((n: any) => n.type === 'opportunity')?.slice(0, 4), null, 2)}

## Mom Test Validation

### targetHypothesis
Write ONE falsifiable hypothesis that captures the #1 riskiest assumption (e.g., "SMB founders spend >5 hours/week on manual bookkeeping and would pay $200/mo to eliminate it").

### behavioralQuestions (EXACTLY 4 questions)
Generate 4 interview questions a founder should ask REAL potential customers TODAY.

RULES:
- Every question MUST ask about PAST behavior, never hypothetical future
- Start with "Tell me about the last time...", "Walk me through how you...", "What happened when..."
- NEVER ask "Would you...", "Do you think...", "How much would you pay for..."
- Questions should progressively dig deeper: start broad, then narrow to specific pain points

Example GOOD questions:
1. "Walk me through how you handled your month-end close last quarter — who was involved and how long did it take?"
2. "Tell me about the last time you found an error in your financial reports. How did you discover it and what did it cost you?"
3. "What tools or processes did you try before settling on your current bookkeeping setup? Why did you switch?"

### auditReport (EXACTLY 3 warnings)
Generate 6 interview pitfall warnings. Each must include:
- The TRAP name (Future Tense Trap, Compliment Trap, Leading Question, etc.)
- A BAD example specific to this startup
- A BETTER alternative

Example:
"COMPLIMENT TRAP: BAD: 'What do you think about an AI that does your books automatically?' (invites polite praise). BETTER: 'Tell me about the last time your bookkeeper made a mistake — what happened next?' (forces recall of real events)."

### recommendedActionPlan
- cheapestExperiment: Write a DETAILED step-by-step plan (5+ sentences) including: who to recruit (be specific — "10 post-seed SaaS founders via YC Bookface"), what to measure, how long it takes, and exactly what a positive/negative signal looks like.

## Prioritized Assumptions (EXACTLY 5)
Generate 5 falsifiable assumptions ordered by risk (highest validationScore first).

RULES:
- evidence scores should be REALISTIC: most untested assumptions are 0.1-0.3
- importance scores vary: some are 0.9+ (fatal if wrong), others 0.5-0.7 (painful but survivable)  
- validationScore = importance × (1.0 - evidence)
- Each recommendedExperiment must be a concrete 2-3 sentence action plan with specific numbers

MUST cover ALL 4 categories:
- 2 desirability assumptions
- 1 viability assumption
- 1 feasibility assumption
- 1 usability assumption`,
      system: `You are The Mom Test expert — you've trained 500+ founders on customer interview technique. Your behavioral questions ALWAYS focus on past behavior, never hypothetical futures. You are ruthless about identifying interview traps. Your risk assumptions are calibrated with realistic evidence scores (most new startups have very low evidence for their assumptions). You generate exactly the number of items requested — no more, no less.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate validation plan' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
