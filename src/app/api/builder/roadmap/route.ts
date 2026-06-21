import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { MilestoneSchema, SystemGovernanceSchema, SafetyGovernorSchema } from '@/schemas/builder';


export const maxDuration = 60;

const Pass4Schema = z.object({
  milestones: z.array(MilestoneSchema),
  governance: SystemGovernanceSchema,
  safetyGovernor: SafetyGovernorSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const { conceptPrompt, marketAnalysis, prioritizedAssumptions, ostFramework } = await req.json();

    // Extract key context for the prompt
    const topRisks = prioritizedAssumptions
      ?.sort((a: any, b: any) => (b.validationScore || 0) - (a.validationScore || 0))
      ?.slice(0, 5)
      ?.map((a: any) => a.statement) || [];

    const solutions = ostFramework
      ?.filter((n: any) => n.type === 'solution')
      ?.slice(0, 8)
      ?.map((n: any) => n.title) || [];

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: Pass4Schema,
      schemaName: 'RoadmapPlan',
      schemaDescription: 'Detailed phased milestone roadmap with governance.',
      prompt: `You are generating the EXECUTION ROADMAP for this startup:
"${conceptPrompt}"

MARKET CONTEXT:
- TAM: ${marketAnalysis?.tam || 'N/A'}
- Target: ${marketAnalysis?.targetAudience || 'N/A'}

TOP 5 RISKIEST ASSUMPTIONS TO VALIDATE:
${topRisks.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

KEY SOLUTIONS FROM OST:
${solutions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

## Milestones (EXACTLY 4 phases)

### Phase 1: Discovery & Validation (Weeks 1-6)
- 2 tasks focused on customer interviews, prototype testing, assumption validation
- Tasks should directly address the TOP riskiest assumptions above
- Duration: 5-14 days per task
- Example tasks: "Conduct 15 structured Mom Test interviews with post-seed SaaS founders via YC Bookface outreach", "Build clickable Figma prototype of core reconciliation flow for user testing"

### Phase 2: Core MVP Build (Weeks 7-14)
- 2 engineering tasks for the minimum viable product
- Tasks should map to solutions from the OST framework above
- Duration: 7-21 days per task
- Example tasks: "Build Plaid API integration for automated bank transaction ingestion with retry logic", "Develop ML categorization engine using fine-tuned model on 50K labeled transactions"

### Phase 3: Early Traction (Weeks 15-22)
- 2 tasks focused on first 10-50 customers, pricing validation, retention metrics
- Duration: 7-21 days per task
- Example tasks: "Launch 'Founder's Circle' beta with 20 startups at $0/mo, measure daily active usage and NPS", "Implement usage-based pricing engine and A/B test $99 vs $199 vs $299/mo tiers"

### Phase 4: Scale Preparation (Weeks 23-30)
- 2 tasks focused on growth systems, partnerships, fundraising prep
- Duration: 14-30 days per task
- Example tasks: "Build Mercury + Brex embedded partner integration for distribution channel", "Prepare Series A deck with validated metrics: CAC, LTV, churn, NPS from Phase 3"

RULES for each task:
- title: Must be specific enough to assign to an engineer or founder (never vague like "Do marketing")
- durationDays: Realistic (most are 7-21 days, not 1-3)
- complexity: Accurately reflects difficulty
- dependencies: Reference other task IDs where appropriate
- alternativeApproach: Provide for high-complexity tasks

## Governance
- confidenceIndex: Calculate based on how validated the assumptions are (likely 0.2-0.4 for a new idea)
- requiresHumanApproval: true (always for new plans)
- governanceWarning: Honest assessment of the biggest risk or limitation`,
      system: `You are a startup execution coach who has helped 300+ startups go from idea to Series A. Your roadmaps are realistic — no task takes "1 day" and no phase is vague. Every task title is specific enough to assign to a team member. You always create clear dependency chains between tasks. Your phase objectives are measurable outcomes, not vague goals. Duration estimates reflect real engineering and business development timelines.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate roadmap' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
