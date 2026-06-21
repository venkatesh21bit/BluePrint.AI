import { z } from 'zod';

export const AgentPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  role: z.string(),
  traits: z.object({
    openness: z.number().min(0).max(1),
    conscientiousness: z.number().min(0).max(1),
    riskTolerance: z.number().min(0).max(1),
  }),
  goals: z.array(z.string()),
  painPoints: z.array(z.string()),
  budget: z.string().optional(),
});

export const MemoryEntrySchema = z.object({
  timestamp: z.number(),
  content: z.string(),
  importance: z.number().min(0).max(1),
  source: z.enum(['observation', 'conversation', 'reflection', 'action']),
  linkedAgentIds: z.array(z.string()).optional(),
});

export const ReflectionSchema = z.object({
  insight: z.string(),
  sourceMemoryIds: z.array(z.string()).optional(),
});

export const AgentActionSchema = z.object({
  actionType: z.enum([
    'speak', 
    'react', 
    'decide_to_buy', 
    'reject', 
    'spread_word', 
    'raise_objection', 
    'request_demo', 
    'compare_competitor', 
    'idle'
  ]),
  content: z.string(),
  targetAgentId: z.string().optional(),
});

export const SimulationScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  worldEventPrompt: z.string(),
  agentRolesToSpawn: z.array(z.string()),
  maxRounds: z.number(),
});

export const SimulationLogSchema = z.object({
  round: z.number(),
  agentId: z.string(),
  action: AgentActionSchema,
  globalEventContext: z.string().optional(),
});

export type AgentPersona = z.infer<typeof AgentPersonaSchema>;
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;
export type AgentAction = z.infer<typeof AgentActionSchema>;
export type SimulationScenario = z.infer<typeof SimulationScenarioSchema>;
export type SimulationLog = z.infer<typeof SimulationLogSchema>;
