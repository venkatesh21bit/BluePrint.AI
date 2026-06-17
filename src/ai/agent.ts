import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";

// Define the State Interface
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

// Model Initialization
const model = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  temperature: 0.2,
});

// Define Nodes
async function clarificationAgent(state: AgentState) {
  // Parse raw concept into JTBD and OST
  return {
    stepCount: 1,
    jtbdFramework: [{
      role: "User",
      situation: "When managing early stage concepts",
      motivation: "I want a clear roadmap",
      outcome: "So that I can build with confidence",
      dimension: "functional"
    }]
  };
}

import { MomTestCoachSchema } from "@/schemas/builder";

async function momTestCoachNode(state: AgentState) {
  const systemPrompt = `Your rOLE is Principal UX Researcher & "The Mom Test" Discovery Coach
ARCHETYPE: Inspired by Rob Fitzpatrick (author of "The Mom Test") and Teresa Torres (author of "Continuous Discovery Habits").
MISSION: You are a ruthless "Truth Filter" for product discovery. Your objective is to help early-stage founders separate polite fluff, false-positive compliance, and speculative compliments from raw, unvarnished, empirical behavioral facts. You treat hypothetical interest as a failure signal and historical behavioral evidence as the only valid form of currency.

## Core Operational Pillars (The Three Laws)
1. Talk about their life, not your idea: Never let the developer pitch, explain features, or mention their product directly. The moment a solution is proposed, the customer starts lying to protect the developer's feelings.
2. Ask about specifics in the past, never generics or hypotheticals about the future: Reject statements containing future-tense indicators ("would you use," "how much would you pay," "will you buy"). Replace them with investigations of past occurrences ("How do you currently handle...", "Tell me about the last time you...") within a specific, recent time window (e.g., the last 7 to 30 days).
3. Talk less and listen more: Actively identify moments in transcripts where the interviewer over-talks, interrupts, or guides the customer toward a pre-conceived solution (the "Feature Dumping" anti-pattern).

## Operational Command & Input Pipelines
You operate across three distinct execution workflows:
Workflow A: The Behavioral Interview Planner (Trigger: feature idea/hypothesis).
Workflow B: The Active Transcript Coach (Trigger: transcript log).
Workflow C: The "Dig Deeper" Pivot Engine (Trigger: request for follow-up).

## Anti-Pattern Classification Dictionary
* The Future Tense Trap: Permitting the user to commit to hypothetical actions.
* The Feature Dump: The interviewer transitioning into a sales pitch.
* Sycophancy (The Polite User Trap): User is just saying "yes" to be nice.
* The Opinion Collector: Asking for abstract opinions instead of workflow demonstrations.`;

  const structuredModel = model.withStructuredOutput(MomTestCoachSchema);
  const response = await structuredModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: state.conceptPrompt || "I want to interview cafe owners to see if they'd pay $29/mo for an automated iPad app that lets customers scan a QR code to join their loyalty program." }
  ]);

  return {
    stepCount: 1,
    momTestValidation: response
  };
}

async function riskAssessmentAgent(state: AgentState) {
  return {
    stepCount: 1,
    prioritizedAssumptions: [{
      id: "a1",
      category: "desirability",
      statement: "Users want structured validation.",
      importance: 0.9,
      evidence: 0.2,
      validationScore: 0.72,
      recommendedExperiment: "Conduct user interviews."
    }]
  };
}

async function planningAgent(state: AgentState) {
  return {
    stepCount: 1,
    milestones: [{
      phase: "Phase 1: Core Loop",
      objective: "Validate core assumptions",
      tasks: []
    }]
  };
}

async function safetyGovernorNode(state: AgentState) {
  // Calculate confidence index
  const confidence = 0.85; // Mock logic
  
  // Enforce step cap
  if (state.stepCount > 5) {
    return {
      confidenceIndex: 0,
      governanceWarning: "Execution step cap exceeded. Halting.",
      requiresHumanApproval: true
    };
  }

  return {
    stepCount: 1,
    confidenceIndex: confidence,
    requiresHumanApproval: confidence < 0.70
  };
}

// Define the router function for Safety Governor
function shouldContinue(state: AgentState) {
  if (state.requiresHumanApproval || state.stepCount > 5) {
    return "human_approval";
  }
  if (state.confidenceIndex < 0.70) {
    return "clarification_agent"; // Loop back
  }
  return END;
}

// Build the graph
const workflow = new StateGraph<AgentState>({
  channels: {
    conceptPrompt: { value: (x, y) => y ?? x, default: () => "" },
    userId: { value: (x, y) => y ?? x, default: () => "" },
    stepCount: { value: (x, y) => (x ?? 0) + (y ?? 0), default: () => 0 },
    confidenceIndex: { value: (x, y) => y ?? x, default: () => 0 },
    jtbdFramework: { value: (x, y) => y ?? x, default: () => [] },
    momTestValidation: { value: (x, y) => y ?? x, default: () => null },
    prioritizedAssumptions: { value: (x, y) => y ?? x, default: () => [] },
    milestones: { value: (x, y) => y ?? x, default: () => [] },
    governanceWarning: { value: (x, y) => y ?? x, default: () => undefined },
    requiresHumanApproval: { value: (x, y) => y ?? x, default: () => false },
  }
});

workflow.addNode("clarification_agent", clarificationAgent);
workflow.addNode("mom_test_coach", momTestCoachNode);
workflow.addNode("risk_assessment_agent", riskAssessmentAgent);
workflow.addNode("planning_agent", planningAgent);
workflow.addNode("safety_governor", safetyGovernorNode);

// @ts-ignore
workflow.addEdge(START, "clarification_agent");
// @ts-ignore
workflow.addEdge("clarification_agent", "mom_test_coach");
// @ts-ignore
workflow.addEdge("mom_test_coach", "risk_assessment_agent");
// @ts-ignore
workflow.addEdge("risk_assessment_agent", "planning_agent");
// @ts-ignore
workflow.addEdge("planning_agent", "safety_governor");

// Conditional Edge from Safety Governor
workflow.addConditionalEdges("safety_governor", shouldContinue, {
  clarification_agent: "clarification_agent",
  human_approval: END, // We mock human_approval as stopping state
  [END]: END,
});

export const app = workflow.compile();
