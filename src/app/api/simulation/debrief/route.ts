import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

const DebriefSchema = z.object({
  signalStrengthScore: z.number().min(0).max(100).describe('0-100 score of how positive the overall reception was.'),
  topObjections: z.array(z.string()).describe('Ranked list of the top 3-5 specific concerns raised across all agents.'),
  wordOfMouthMap: z.array(z.object({
    agentName: z.string(),
    sentiment: z.enum(['promoter', 'passive', 'detractor']),
    quote: z.string().describe('What they would tell others about the product.'),
  })),
  killSignals: z.array(z.string()).describe('Hard "no" reasons that indicate fundamental product-market fit problems. Empty if none.'),
  pivotSuggestions: z.array(z.string()).describe('Specific changes the founder should make based on the simulation.'),
});

export async function POST(req: Request) {
  try {
    const { masterPlan, scenario, personas, logs } = await req.json();

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: DebriefSchema,
      schemaName: 'SimulationDebrief',
      schemaDescription: 'Post-simulation analysis and insights.',
      prompt: `Analyze the following scenario simulation for a startup concept.

STARTUP CONCEPT: ${masterPlan?.conceptName || 'Unknown Concept'}
SCENARIO: ${scenario.name}

SIMULATION TRANSCRIPT:
${logs.map((log: any) => `Round ${log.round} - ${log.agentName} [${log.action.actionType}]: ${log.action.content}`).join('\n')}

Based on the transcript, generate a comprehensive debrief for the founder. 
- Be ruthless but constructive. If the agents hated it, say so and explain why.
- Identify the most common objections.
- Determine the Net Promoter sentiment for each key persona.
- Provide actionable pivot suggestions based strictly on what the agents complained about or desired.`,
      system: `You are an expert startup advisor and data analyst. You synthesize multi-agent simulation logs into hard-hitting, actionable insights for founders.`,
    });

    return new Response(JSON.stringify({ debrief: result.object }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating debrief:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate debrief' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
