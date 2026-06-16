import { z } from 'zod';

export const OstNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['outcome', 'opportunity', 'solution', 'test']),
  title: z.string().describe('Clear, short description of the opportunity solution tree node.'),
  parentId: z.string().uuid().nullable().describe('Valid reference linking back to parental outcome hierarchy.'),
});

export const MomTestPromptSchema = z.object({
  targetHypothesis: z.string().describe('The core assumption being tested.'),
  nonLeadingQuestions: z.array(z.string()).min(3).max(5).describe('Questions targeting past behaviors.'),
  antiPatternsToAvoid: z.array(z.string()).describe('Identified leading or hypothetical statements to avoid.'),
});

export const JtbdStorySchema = z.object({
  role: z.string().describe('The primary actor or target persona.'),
  situation: z.string().describe('The triggering context: When this event happens.'),
  motivation: z.string().describe('The core motivation: I want to perform this action.'),
  outcome: z.string().describe('The emotional, functional, or social benefit: So that I can achieve this.'),
  dimension: z.enum(['functional', 'emotional', 'social']).describe('The classification of user need.'),
});

export const AssumptionSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['desirability', 'viability', 'feasibility', 'usability']),
  statement: z.string().describe('Empirical assumption formulated as a factual truth.'),
  importance: z.number().min(0.0).max(1.0).describe('Impact of assumption failure (0 = minimal, 1 = fatal).'),
  evidence: z.number().min(0.0).max(1.0).describe('Level of existing empirical proof (0 = assumption, 1 = validated).'),
  validationScore: z.number().min(0.0).max(1.0).describe('Calculated validation score: Importance * (1.0 - Evidence).'),
  recommendedExperiment: z.string().describe('Fastest, lowest-cost experiment to gather validation evidence.'),
});

export const RoadmapTaskSchema = z.object({
  id: z.string(),
  title: z.string().describe('Direct action-oriented task title.'),
  durationDays: z.number().min(1).describe('Estimated days to build.'),
  dependencies: z.array(z.string()).describe('Identified tasks that must complete first.'),
  complexity: z.enum(['low', 'medium', 'high']),
  alternativeApproach: z.string().optional().describe('Alternative validation pathway if technical blockers arise.'),
});

export const MilestoneSchema = z.object({
  phase: z.string().describe('Phase identifier (e.g., Phase 1: Core Loop Validation).'),
  objective: z.string().describe('The physical outcome of this milestone.'),
  tasks: z.array(RoadmapTaskSchema),
});

export const SystemGovernanceSchema = z.object({
  confidenceIndex: z.number().min(0.0).max(1.0).describe('Overall systems validation confidence.'),
  requiresHumanApproval: z.boolean().describe('Triggers a physical UI block requiring manual confirmation.'),
  governanceWarning: z.string().optional().describe('Warning detailing planning assumptions or key limitations.'),
});

export const MasterExecutionPlanSchema = z.object({
  conceptName: z.string().describe('The refined, action-oriented name of the concept.'),
  ostFramework: z.array(OstNodeSchema),
  momTestValidation: MomTestPromptSchema,
  jtbdFramework: z.array(JtbdStorySchema),
  prioritizedAssumptions: z.array(AssumptionSchema),
  milestones: z.array(MilestoneSchema),
  governance: SystemGovernanceSchema,
});

export type MasterExecutionPlan = z.infer<typeof MasterExecutionPlanSchema>;
