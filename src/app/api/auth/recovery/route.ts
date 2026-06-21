import { NextResponse } from "next/server"
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { issue, email, hasPasskey, hasRecoveryEmail } = await req.json()

    const userContext = [
      `Issue: "${issue || "Unable to sign in"}"`,
      `Email: ${email || "Not provided"}`,
      `Passkey available: ${hasPasskey ? "Yes" : "No"}`,
      `Recovery email: ${hasRecoveryEmail ? "Yes" : "No"}`,
    ].join("\n")

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an expert authentication recovery assistant for the BluePrint.AI platform.

You help users recover access to their accounts through:
1. Email/password sign-in with forgot-password reset
2. Passkey/WebAuthn authentication (device-based biometrics or security key)
3. Recovery email verification
4. Google OAuth fallback guidance

Give clear, numbered step-by-step instructions. Be concise and actionable.
If they have a passkey, guide them through using it.
If they have a recovery email, guide them through that flow.
If neither, guide them through the forgot-password flow.
Always encourage them to set up a passkey for future ease.`,
      prompt: `Generate a step-by-step account recovery plan for the following user scenario:\n\n${userContext}\n\nProvide specific instructions they can follow right now.`,
    })

    return result.toTextStreamResponse()
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to generate recovery plan' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
