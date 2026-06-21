import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { OstNodeSchema } from '@/schemas/builder';

export const runtime = 'edge';
export const maxDuration = 60;

const Pass2Schema = z.object({
  ostFramework: z.array(OstNodeSchema),
});

export async function POST(req: Request) {
  try {
    const { conceptPrompt, marketAnalysis, jtbdFramework } = await req.json();

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: Pass2Schema,
      schemaName: 'OSTFramework',
      schemaDescription: 'Deep Opportunity Solution Tree with 15-25+ nodes.',
      prompt: `You are generating a DEEP Opportunity Solution Tree (OST) for this startup:
"${conceptPrompt}"

MARKET CONTEXT (from previous analysis):
${JSON.stringify(marketAnalysis, null, 2)}

JTBD STORIES (from previous analysis):
${JSON.stringify(jtbdFramework, null, 2)}

## OST Framework Requirements

Generate a DEEP, INTERCONNECTED tree. You MUST generate ALL of the following:

### Level 1: Outcomes (2-3 nodes)
- Each outcome must be a measurable business goal with a specific KPI and timeframe
- Example: "Reduce monthly close time from 15 days to 2 days for 500 SMB customers within 18 months"
- type: "outcome", parentId: null

### Level 2: Opportunities (3-4 per outcome = 6-12 nodes)
- Each opportunity describes a SPECIFIC user pain point backed by evidence
- Must link to a JTBD story from above
- Example: "Seed-stage founders waste 8+ hours/month manually categorizing transactions because their bookkeeper doesn't understand SaaS revenue recognition"
- type: "opportunity", parentId: <outcome UUID>

### Level 3: Solutions (2-3 per opportunity = 12-36 nodes)
- Each solution is a CONCRETE product feature with implementation detail
- Example: "Auto-categorization engine using fine-tuned LLM trained on 100K SaaS chart-of-accounts entries, achieving 98% accuracy on standard categories"
- type: "solution", parentId: <opportunity UUID>

### Level 4: Tests (1-2 per solution = 12-72 nodes)
- Each test is a SPECIFIC experiment with success criteria
- Example: "Wizard of Oz test: manually categorize 500 transactions for 5 beta users, measure time saved vs. QuickBooks, target: 80% reduction in categorization time"
- type: "test", parentId: <solution UUID>

MINIMUM 20 nodes total. Each title must be a detailed sentence, NOT a vague phrase.
Make sure parentId references are CONSISTENT — every child must reference a valid parent UUID.`,
      system: `You are an expert product strategist specializing in Opportunity Solution Trees. You create deep, interconnected trees where every node is specific enough to be actionable. Your outcome nodes have measurable KPIs. Your opportunity nodes cite specific user pain points. Your solution nodes describe concrete features. Your test nodes specify exact experiments with success criteria. You ALWAYS generate at least 20 nodes with proper parent-child relationships using consistent UUIDs.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate OST' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
