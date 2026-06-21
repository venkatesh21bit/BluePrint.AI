import { NextResponse } from "next/server";
import { app } from "@/ai/agent";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { conceptPrompt, userId } = await req.json();

    if (!conceptPrompt) {
      return NextResponse.json({ error: "conceptPrompt is required" }, { status: 400 });
    }

    const result = await app.invoke({
      conceptPrompt,
      userId: userId || "anonymous",
      stepCount: 0,
      confidenceIndex: 0,
      jtbdFramework: [],
      momTestValidation: null,
      prioritizedAssumptions: [],
      milestones: [],
      requiresHumanApproval: false,
    });

    return NextResponse.json({
      conceptName: conceptPrompt.split(" ").slice(0, 5).join(" "),
      jtbdFramework: result.jtbdFramework || [],
      momTestValidation: result.momTestValidation || null,
      prioritizedAssumptions: result.prioritizedAssumptions || [],
      milestones: result.milestones || [],
      governance: {
        confidenceIndex: result.confidenceIndex || 0,
        requiresHumanApproval: result.requiresHumanApproval || false,
        governanceWarning: result.governanceWarning || undefined,
      },
      safetyGovernor: {
        currentStepCount: result.stepCount || 0,
        estimatedTokensUsed: 0,
        maxTokensAllowed: 10000,
        complianceFlags: result.governanceWarning ? [result.governanceWarning] : [],
        confidenceScore: result.confidenceIndex || 0,
        isPaused: result.requiresHumanApproval || false,
        approvalRequired: result.requiresHumanApproval || false,
        nextAction: result.requiresHumanApproval ? "Awaiting human review" : "Proceed to execution",
      },
    });
  } catch (error) {
    console.error("Agent pipeline error:", error);
    return NextResponse.json({ error: "Agent pipeline failed" }, { status: 500 });
  }
}
