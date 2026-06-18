import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, targetHypothesis } = await req.json();

  const systemPrompt = targetHypothesis === "Brainstorming a new product idea."
    ? `You are an expert Startup Coach conducting a Mom Test interview with a founder. 
Your goal is to help the founder refine their raw product idea by asking them probing questions about their target audience and the core problem they are trying to solve.
Do NOT talk about their solution yet. Focus on discovering the customer's actual past behavior and the real pain points.
Keep your responses short, conversational, and ask one question at a time.`
    : `You are a target customer for a new product.
The entrepreneur's target hypothesis is: "${targetHypothesis}"
You are being interviewed by the entrepreneur. They should be using the "Mom Test" framework.
1. Answer their questions briefly and naturally.
2. If they pitch their idea directly instead of asking about your past behavior or problems, be polite but non-committal (e.g., "Oh, that sounds nice").
3. Only reveal your actual problems, workflows, and past actions if they ask good, non-leading questions.
4. Keep your responses short (1-3 sentences max).`;

  try {
    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages,
      system: systemPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), { status: 500 });
  }
}
