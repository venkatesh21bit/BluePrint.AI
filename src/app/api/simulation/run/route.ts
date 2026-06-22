import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { AgentActionSchema } from '@/schemas/simulation';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { 
      masterPlan, 
      scenario, 
      agentPersona, 
      otherPersonas, 
      pastLogs, 
      globalEventContext, 
      round 
    } = await req.json();

    // Limit context to prevent blowing up tokens - Capped Town-Hall pattern
    const recentLogs = pastLogs.slice(-20); 

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: AgentActionSchema,
      schemaName: 'AgentAction',
      schemaDescription: 'The action chosen by the agent for this round.',
      prompt: `You are simulating the behavior of a specific person in a startup validation scenario.

SCENARIO: ${scenario.name} - ${scenario.description}
WORLD EVENT: ${scenario.worldEventPrompt}

YOUR PERSONA:
Name: ${agentPersona.name} (${agentPersona.age})
Role: ${agentPersona.role}
Traits: Openness (${agentPersona.traits.openness}), Conscientiousness (${agentPersona.traits.conscientiousness}), Risk Tolerance (${agentPersona.traits.riskTolerance})
Goals: ${agentPersona.goals.join(', ')}
Pain Points: ${agentPersona.painPoints.join(', ')}
Budget: ${agentPersona.budget || 'N/A'}

STARTUP CONCEPT BEING TESTED:
Name: ${masterPlan?.conceptName || 'Unknown Concept'}
Market: ${masterPlan?.marketAnalysis?.targetAudience || 'Unknown Market'}
Key Value Prop: ${masterPlan?.jtbdFramework?.[0]?.outcome || 'Unknown Value'}

${globalEventContext ? `🚨 LATEST FOUNDER INTERVENTION (GLOBAL EVENT): ${globalEventContext}` : ''}

RECENT ACTIONS IN THE TOWN HALL:
${recentLogs.length > 0 ? recentLogs.map((log: any) => `Round ${log.round} - ${log.agentName || log.agentId}: [${log.action.actionType}] ${log.action.content}`).join('\n') : 'No actions yet. You are the first to act.'}

CURRENT STATE:
It is Round ${round} of ${scenario.maxRounds}.
Other people in the room: ${otherPersonas.map((p: any) => `${p.name} (${p.role})`).join(', ')}

YOUR TASK:
Based on your persona's traits, goals, and pain points, decide what you want to do right now. 
- You can 'speak' to broadcast a thought to the room.
- You can 'react' to what someone else just said.
- You can 'raise_objection' if the startup concept doesn't meet your needs or budget.
- You can 'decide_to_buy' if you are completely convinced.
- You can 'compare_competitor' if you think another tool is better.
- You can 'idle' if you have nothing to add.

NOTE ON DIALOGUE: To prevent infinite loops, keep conversations concise. If someone just spoke to you, you can reply ('react'). Do not engage in a thread deeper than 2 replies.
`,
      system: `You are an AI agent in a social simulation acting as a specific persona evaluating a startup. Stay strictly in character. If the product is bad for you, reject it. If you are risk-averse, be skeptical. If there is a global event (like the founder changing the price), react to it according to your budget. Your output MUST be a valid action matching the schema.`,
    });

    return new Response(JSON.stringify({ action: result.object }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating agent action:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate agent action' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
