import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { AgentPersonaSchema } from '@/schemas/simulation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { masterPlan, rolesToSpawn, scenarioName } = await req.json();

    const userRecord = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const user = userRecord[0];
    if (user && !user.isExclusive && user.simulationCount >= 1) {
      return new Response(JSON.stringify({ error: 'LIMIT_SIMULATION' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    if (user) {
      await db.update(users).set({ simulationCount: (user.simulationCount || 0) + 1 }).where(eq(users.id, session.user.id));
    }

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        personas: z.array(AgentPersonaSchema),
      }),
      schemaName: 'SimulationPersonas',
      schemaDescription: 'A cast of characters to populate a simulated scenario.',
      prompt: `Generate ${rolesToSpawn.length} unique agent personas for the scenario: "${scenarioName}"

STARTUP CONCEPT CONTEXT:
${masterPlan?.conceptName ? `Name: ${masterPlan.conceptName}` : ''}
Market Audience: ${masterPlan?.marketAnalysis?.targetAudience || 'N/A'}
Key JTBD: ${JSON.stringify(masterPlan?.jtbdFramework?.slice(0, 2) || {})}
Top Assumptions to test: ${JSON.stringify(masterPlan?.prioritizedAssumptions?.slice(0, 3) || {})}

REQUIRED ROLES TO GENERATE:
${rolesToSpawn.map((role: string, i: number) => `${i + 1}. ${role}`).join('\n')}

For each role, generate a highly specific persona. Give them a realistic name, age, and a set of internal traits, goals, and pain points that will govern their behavior during the simulation. Ensure their traits fit their role (e.g., a skeptical CISO should have low risk tolerance and high conscientiousness).
`,
      system: `You are an expert game designer and behavioral psychologist. You create deep, believable, and varied characters for social simulations. You ensure each character has distinct motivations that will cause friction, alignment, or interesting emergent behaviors when interacting with a new startup product. Provide realistic names and very specific pain points.`,
    });

    // Provide default IDs for the generated personas
    const personasWithIds = result.object.personas.map((p, i) => ({
      ...p,
      id: `agent-${i}-${crypto.randomUUID().slice(0, 8)}`,
    }));

    return new Response(JSON.stringify({ personas: personasWithIds }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating personas:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate personas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
