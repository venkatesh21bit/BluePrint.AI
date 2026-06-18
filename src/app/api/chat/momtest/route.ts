import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, targetHypothesis } = await req.json();

  const systemPrompt = `You are a potential customer being interviewed by a founder.
You are roleplaying to help them practice the "Mom Test".
The founder's target hypothesis is: "${targetHypothesis || 'A new product idea'}".

Your persona: You are a regular person. You are busy. You don't care about their solution.
Rules:
1. DO NOT be overly polite or eager.
2. If they ask "Would you use an app that...", answer honestly as a typical consumer (often giving a fake compliment like "Yeah sure sounds great" to be nice and end the conversation).
3. Do not invent elaborate lies, just answer based on normal human behavior.
4. Keep your responses short (1-3 sentences max).
5. If they ask about past behavior ("Tell me about the last time you..."), answer with specific details if relevant.`;

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
