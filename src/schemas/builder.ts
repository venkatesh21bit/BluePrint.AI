import { z } from 'zod';

export const OstNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['outcome', 'opportunity', 'solution', 'test']),
  title: z.string().describe('Detailed description of the node. Outcomes should be measurable business goals with KPIs. Opportunities should describe specific user pain points with evidence. Solutions should be concrete product features with implementation notes. Tests should be specific experiments with success criteria.'),
  parentId: z.string().nullable().describe('Valid reference linking back to parental outcome hierarchy.'),
});

export const MomTestCoachSchema = z.object({
  executionWorkflow: z.enum(["PLANNER", "EVALUATOR", "PIVOT"]),
  targetHypothesis: z.string().describe('The core unvalidated assumption being tested, written as a falsifiable statement (e.g., "SMB founders spend >5 hours/week on manual bookkeeping and would pay $200/mo to eliminate it").'),
  validationMetrics: z.object({
    interviewQualityScore: z.number(),
    empiricalFactsCount: z.number(),
    hypotheticalSpeculationsCount: z.number(),
    complimentTrapsCount: z.number(),
  }),
  behavioralQuestions: z.array(z.string()).describe('5 to 8 open-ended, non-leading, past-behavior-focused questions that a founder should ask real potential customers. Each question must focus on PAST behavior (not hypothetical future). Example: "Walk me through the last time you had to close your books at month-end — what took the longest?" NOT "Would you use an AI tool for bookkeeping?"'),
  auditReport: z.array(z.string()).describe('5+ structured warnings flagging common interview pitfalls: Future Tense Trap examples, Compliment Trap examples, Leading Question examples. Each should include a BAD example and a BETTER alternative specific to this startup idea.'),
  recommendedActionPlan: z.object({
    verdict: z.enum(["PROCEED_TO_MVP", "REFRAME_HYPOTHESIS", "SHIFT_CUSTOMER_ICP"]),
    cheapestExperiment: z.string().describe('A detailed, step-by-step description of the fastest, lowest-cost behavioral validation experiment to perform before writing code. Include who to recruit, what to measure, how long it should take, and what a positive signal looks like.'),
  })
});

export const JtbdStorySchema = z.object({
  role: z.string().describe('The primary actor or target persona with specifics (e.g., "CFO at a Series A SaaS startup with 15-50 employees").'),
  situation: z.string().describe('The triggering context with detail: When [specific event] happens, including frequency and urgency.'),
  motivation: z.string().describe('The core motivation: I want to [specific action] so concretely described that a developer could build it.'),
  outcome: z.string().describe('The emotional, functional, or social benefit with measurable impact: So that I can [achieve X], saving [Y hours/dollars] and feeling [Z].'),
  dimension: z.enum(['functional', 'emotional', 'social']).describe('The classification of user need.'),
});

export const AssumptionSchema = z.object({
  id: z.string(),
  category: z.enum(['desirability', 'viability', 'feasibility', 'usability']),
  statement: z.string().describe('A specific, falsifiable assumption written as a declarative statement (e.g., "60% of SMB owners currently use spreadsheets for tax tracking and find it error-prone").'),
  importance: z.number().min(0.0).max(1.0).describe('Impact of assumption failure (0 = minimal, 1 = fatal). Be precise — a score of 0.9+ means the entire business fails if this is wrong.'),
  evidence: z.number().min(0.0).max(1.0).describe('Level of existing empirical proof (0 = pure guess, 0.5 = anecdotal, 1 = validated with data). Most assumptions for a new startup should be between 0.1 and 0.4.'),
  validationScore: z.number().min(0.0).max(1.0).describe('Calculated as: Importance * (1.0 - Evidence). Higher scores = test this first.'),
  recommendedExperiment: z.string().describe('A concrete, actionable experiment: who to talk to, what to measure, how long it takes, what "success" looks like. Example: "Interview 10 CFOs at post-seed startups using Calendly outreach. Ask about month-end close process. Success = 7/10 report >4 hours spent on manual reconciliation."'),
});

export const RoadmapTaskSchema = z.object({
  id: z.string(),
  title: z.string().describe('Direct action-oriented task title with enough detail to be assigned to an engineer (e.g., "Build Plaid/Mercury API integration for automated bank feed ingestion" not just "Bank integration").'),
  durationDays: z.number().min(1).describe('Estimated days to build. Be realistic: most tasks are 7-21 days.'),
  dependencies: z.array(z.string()).describe('Identified tasks that must complete first.'),
  complexity: z.enum(['low', 'medium', 'high']),
  alternativeApproach: z.string().optional().describe('Alternative validation pathway if technical blockers arise.'),
});

export const MilestoneSchema = z.object({
  phase: z.string().describe('Phase identifier (e.g., "Phase 1: Core Loop Validation" or "Phase 2: Revenue Traction").'),
  objective: z.string().describe('The physical, measurable outcome of this milestone (e.g., "Achieve 10 paying customers with <5% monthly churn" not just "Launch product").'),
  tasks: z.array(RoadmapTaskSchema),
});

export const SystemGovernanceSchema = z.object({
  confidenceIndex: z.number().min(0.0).max(1.0).describe('Overall systems validation confidence.'),
  requiresHumanApproval: z.boolean().describe('Triggers a physical UI block requiring manual confirmation.'),
  governanceWarning: z.string().optional().describe('Warning detailing planning assumptions or key limitations.'),
});



export const SafetyGovernorSchema = z.object({
  currentStepCount: z.number().describe('Number of steps executed so far (max: 5)'),
  estimatedTokensUsed: z.number().describe('Estimated tokens spent in this session'),
  maxTokensAllowed: z.number().describe('Session token budget'),
  complianceFlags: z.array(z.string()).describe('Red flags or compliance issues detected'),
  confidenceScore: z.number().min(0).max(1).describe('Confidence in current plan (0-1 scale)'),
  isPaused: z.boolean().describe('Whether execution is halted pending human review'),
  approvalRequired: z.boolean().describe('Whether human approval is needed to proceed'),
  nextAction: z.string().describe('Recommended next action or hold reason'),
});

export const MarketAnalysisSchema = z.object({
  tam: z.string().describe('Total Addressable Market with specific dollar figure, source, and growth rate (e.g., "$340B global accounting services market, growing at 8.5% CAGR through 2030 — Statista 2024").'),
  sam: z.string().describe('Serviceable Available Market narrowed to segment with reasoning (e.g., "$12B AI-powered accounting for SMBs in US/UK, representing 3.5% of TAM where AI adoption is viable").'),
  som: z.string().describe('Serviceable Obtainable Market with realistic year-1 capture estimate (e.g., "$2.4M in ARR targeting 200 early-adopter startups at $1,000/mo average contract").'),
  competitors: z.array(z.string()).describe('List of 5-8 specific competitors with brief differentiation (e.g., "Pilot.com — full-service bookkeeping for startups, $500-2500/mo, human-heavy model vulnerable to AI disruption").'),
  targetAudience: z.string().describe('Detailed ICP with firmographics and psychographics (e.g., "Post-seed SaaS startups with 10-50 employees, $1-10M ARR, currently spending $2-5K/mo on fractional CFO + bookkeeper, tech-forward founders who prefer API-first tools").'),
  gtmStrategy: z.string().describe('Multi-channel GTM strategy with specific tactics and timeline (e.g., "Month 1-3: Direct outreach to YC W24/S24 batch companies via warm intros. Month 4-6: Content marketing targeting \'startup accounting pain\' keywords. Month 7-12: Partner integrations with Mercury, Brex, and Gusto for embedded distribution").'),
});

export const MasterExecutionPlanSchema = z.object({
  conceptName: z.string().describe('The refined, action-oriented name of the concept.'),
  ostFramework: z.array(OstNodeSchema),
  momTestValidation: MomTestCoachSchema,
  safetyGovernor: SafetyGovernorSchema.optional(),
  jtbdFramework: z.array(JtbdStorySchema),
  prioritizedAssumptions: z.array(AssumptionSchema),
  milestones: z.array(MilestoneSchema),
  governance: SystemGovernanceSchema,
  marketAnalysis: MarketAnalysisSchema.optional(),
});



export type MasterExecutionPlan = z.infer<typeof MasterExecutionPlanSchema>;
