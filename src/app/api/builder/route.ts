import { app } from '@/ai/agent';
import { MasterExecutionPlanSchema } from '@/schemas/builder';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { conceptPrompt, sessionUserId } = await req.json();

    if (!conceptPrompt) {
      return Response.json({ error: 'conceptPrompt is required' }, { status: 400 });
    }

    const finalState = await app.invoke({
      conceptPrompt,
      userId: sessionUserId || 'anonymous',
      stepCount: 0,
      confidenceIndex: 0,
      jtbdFramework: [],
      momTestValidation: null,
      prioritizedAssumptions: [],
      milestones: [],
      requiresHumanApproval: false,
    });

    const result = MasterExecutionPlanSchema.parse({
      conceptName: conceptPrompt.split(' ').slice(0, 6).join(' '),
      ostFramework: [],
      jtbdFramework: finalState.jtbdFramework || [],
      momTestValidation: finalState.momTestValidation || {
        executionWorkflow: 'PLANNER',
        targetHypothesis: conceptPrompt,
        validationMetrics: { interviewQualityScore: 0, empiricalFactsCount: 0, hypotheticalSpeculationsCount: 0, complimentTrapsCount: 0 },
        behavioralQuestions: [],
        auditReport: [],
        recommendedActionPlan: { verdict: 'REFRAME_HYPOTHESIS', cheapestExperiment: '' },
      },
      prioritizedAssumptions: finalState.prioritizedAssumptions || [],
      milestones: finalState.milestones || [],
      governance: {
        confidenceIndex: finalState.confidenceIndex ?? 0.85,
        requiresHumanApproval: finalState.requiresHumanApproval || false,
        governanceWarning: finalState.governanceWarning || null,
      },
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
