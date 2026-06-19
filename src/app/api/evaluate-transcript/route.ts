import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { transcript } = await req.json();

  const result = await generateObject({
    model: google('gemini-2.5-flash'),
    system: `You are an expert Mom Test Interview Evaluator.
Your job is to read a customer interview transcript or raw notes and act as a "Truth Filter".
You must separate "Empirical Facts" from "Polite Fluff & Hypotheticals".

RULES:
1. "Empirical Facts" are specific statements about past behavior, current workflows, or money already spent. (e.g. "I paid $50 for this last week", "I spend 2 hours a day doing X").
2. "Polite Fluff & Hypotheticals" are compliments, future predictions, generalizations, or generic ideas. (e.g. "I would definitely buy that", "That sounds like a great idea", "I usually try to do X").
3. Calculate the Interview Quality Score (Q) based on the formula:
   Q = Count(Facts) / (Count(Facts) + Count(Hypotheticals) + 2 * Count(Fluff))
   Provide Q as a float between 0.0 and 1.0.`,
    prompt: `Evaluate this transcript:\n\n${transcript}`,
    schema: z.object({
      facts: z.array(z.string()).describe('List of exact quotes or statements that are empirical facts of past behavior.'),
      fluff: z.array(z.string()).describe('List of exact quotes or statements that are polite fluff, compliments, or hypotheticals.'),
      qScore: z.number().min(0).max(1).describe('The calculated Interview Quality Score Q.'),
    }),
  });

  return new Response(JSON.stringify(result.object), {
    headers: { 'Content-Type': 'application/json' },
  });
}
