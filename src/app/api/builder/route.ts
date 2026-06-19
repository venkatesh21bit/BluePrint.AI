import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { MasterExecutionPlanSchema } from '@/schemas/builder';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { conceptPrompt, sessionUserId } = await req.json();

    const result = streamObject({
      model: google('gemini-2.5-flash'),
      schema: MasterExecutionPlanSchema,
      schemaName: 'MasterExecutionPlan',
      schemaDescription: 'Decoupled architectural execution and risk mapping blueprint.',
      prompt: `Generate a Zero-to-One execution plan based on this concept description:\n"${conceptPrompt}".\n\nThe plan should include JTBD stories, Mom Test questions, prioritized assumptions, milestone breakdown, and safety governance checks.`,
      system: `You are an expert AI-Native Systems Architect. Deconstruct the concept into structural JTBD statements, identify assumptions, calculate validation scores, phase development tasks logically, and flag governance markers.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process execution stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
