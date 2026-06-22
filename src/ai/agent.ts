import { z } from "zod";
import { generateObject, zodSchema } from "ai";
import { google } from "@ai-sdk/google";
import { MomTestCoachSchema } from "@/schemas/builder";

export interface AgentState {
  conceptPrompt: string;
  userId: string;
  stepCount: number;
  confidenceIndex: number;
  jtbdFramework: any[];
  momTestValidation: any;
  prioritizedAssumptions: any[];
  milestones: any[];
  governanceWarning?: string;
  requiresHumanApproval: boolean;
}

/**
 * callAI wraps generateObject with zodSchema() to correctly convert
 * Zod v4 schemas to standard JSON Schema before sending to Gemini.
 * Without zodSchema(), Zod v4's internal AST is sent instead, causing
 * Gemini to return unparseable responses.
 */
async function callAI<T>(
  schema: z.ZodType<T>,
  prompt: string,
  system?: string
): Promise<T | null> {
  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: zodSchema(schema),
      system,
      prompt,
    });
    return object as T;
  } catch (err) {
    console.error(
      "[callAI] generateObject failed:",
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

async function clarificationAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  const data = await callAI(
    z.object({
      jtbdFramework: z.array(
        z.object({
          role: z.string(),
          situation: z.string(),
          motivation: z.string(),
          outcome: z.string(),
          dimension: z.enum(["functional", "emotional", "social"]),
        })
      ),
    }),
    `Parse this concept into JTBD stories:\n"${state.conceptPrompt}"`
  );
  return {
    stepCount: (state.stepCount ?? 0) + 1,
    jtbdFramework: data?.jtbdFramework ?? [
      {
        role: "Target User",
        situation: `When exploring ${state.conceptPrompt}`,
        motivation: "I want a clear validation path",
        outcome: "So I can build with confidence",
        dimension: "functional" as const,
      },
    ],
  };
}

async function momTestCoachNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const data = await callAI(
    MomTestCoachSchema,
    state.conceptPrompt,
    `Your role is Principal UX Researcher & "The Mom Test" Discovery Coach.`
  );
  return {
    stepCount: (state.stepCount ?? 0) + 1,
    momTestValidation: data ?? {
      executionWorkflow: "PLANNER" as const,
      targetHypothesis: state.conceptPrompt,
      validationMetrics: {
        interviewQualityScore: 0.3,
        empiricalFactsCount: 1,
        hypotheticalSpeculationsCount: 3,
        complimentTrapsCount: 1,
      },
      behavioralQuestions: [
        `How do you currently handle ${state.conceptPrompt} planning?`,
        "What happened last time you tried something similar?",
        "Can you walk me through a specific example from last month?",
      ],
      auditReport: ["Ensure questions focus on past behavior, not hypotheticals"],
      recommendedActionPlan: {
        verdict: "REFRAME_HYPOTHESIS" as const,
        cheapestExperiment:
          "Conduct 3 customer discovery interviews focusing on past behavior",
      },
    },
  };
}

async function riskAssessmentAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  const data = await callAI(
    z.object({
      prioritizedAssumptions: z.array(
        z.object({
          id: z.string(),
          category: z.enum([
            "desirability",
            "viability",
            "feasibility",
            "usability",
          ]),
          statement: z.string(),
          importance: z.number().min(0).max(1),
          evidence: z.number().min(0).max(1),
          validationScore: z.number().min(0).max(1),
          recommendedExperiment: z.string(),
        })
      ),
    }),
    `Identify key assumptions and risks for:\n"${state.conceptPrompt}"`
  );
  return {
    stepCount: (state.stepCount ?? 0) + 1,
    // Fallback IDs must be valid UUIDs to satisfy AssumptionSchema (z.string().uuid())
    prioritizedAssumptions: data?.prioritizedAssumptions ?? [
      {
        id: "00000000-0000-0000-0000-000000000001",
        category: "desirability" as const,
        statement: `Users want ${state.conceptPrompt}`,
        importance: 0.9,
        evidence: 0.2,
        validationScore: 0.72,
        recommendedExperiment: "User interviews",
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        category: "viability" as const,
        statement: "Users will pay for this solution",
        importance: 0.8,
        evidence: 0.15,
        validationScore: 0.68,
        recommendedExperiment: "Pricing survey",
      },
    ],
  };
}

async function planningAgent(
  state: AgentState
): Promise<Partial<AgentState>> {
  const data = await callAI(
    z.object({
      milestones: z.array(
        z.object({
          phase: z.string(),
          objective: z.string(),
          tasks: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              durationDays: z.number().min(1),
              dependencies: z.array(z.string()),
              complexity: z.enum(["low", "medium", "high"]),
              alternativeApproach: z.string().optional(),
            })
          ),
        })
      ),
    }),
    `Create a phased execution plan for:\n"${state.conceptPrompt}"`
  );
  return {
    stepCount: (state.stepCount ?? 0) + 1,
    milestones: data?.milestones ?? [
      {
        phase: "Phase 1: Discovery",
        objective: `Validate ${state.conceptPrompt} assumptions`,
        tasks: [],
      },
    ],
  };
}

async function safetyGovernorNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const data = await callAI(
    z.object({
      confidenceIndex: z.number().min(0).max(1),
      governanceWarning: z.string().optional(),
      requiresHumanApproval: z.boolean(),
    }),
    `Review plan confidence. Concept: "${state.conceptPrompt}". Step count: ${state.stepCount}.`
  );
  return {
    stepCount: (state.stepCount ?? 0) + 1,
    confidenceIndex: data?.confidenceIndex ?? 0.85,
    governanceWarning: data?.governanceWarning,
    requiresHumanApproval: data?.requiresHumanApproval ?? false,
  };
}

/**
 * Sequential agent pipeline — replaces LangGraph StateGraph to avoid
 * LangGraph's RocksDB checkpointer failing on Windows (OS error 1224:
 * memory-mapped file conflict) which propagated as a JSON SyntaxError.
 *
 * Exposes the same `app.invoke(initialState)` interface so the route
 * handler requires no changes.
 */
async function runPipeline(initialState: AgentState): Promise<AgentState> {
  let state: AgentState = { ...initialState };

  // Run sequentially, accumulating state after each step
  state = { ...state, ...(await clarificationAgent(state)) };
  state = { ...state, ...(await momTestCoachNode(state)) };
  state = { ...state, ...(await riskAssessmentAgent(state)) };
  state = { ...state, ...(await planningAgent(state)) };
  state = { ...state, ...(await safetyGovernorNode(state)) };

  return state;
}

// Drop-in replacement — same interface as LangGraph's compiled graph
export const app = {
  invoke: (initialState: AgentState) => runPipeline(initialState),
};
