import { MasterExecutionPlanSchema } from '@/schemas/builder';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conceptPrompt = body?.conceptPrompt as string | undefined;

    if (!conceptPrompt) {
      return new Response(JSON.stringify({ error: 'conceptPrompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = streamObject({
      model: google('gemini-2.5-flash'),
      schema: MasterExecutionPlanSchema,
      schemaName: 'MasterExecutionPlan',
      schemaDescription: 'A comprehensive, investor-grade startup execution blueprint with deep market analysis, actionable OST framework, real Mom Test interview questions, prioritized risk assumptions with validation experiments, and phased milestones.',
      prompt: `You are generating a COMPREHENSIVE Zero-to-One Startup Execution Plan for this concept:
"${conceptPrompt}"
`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
