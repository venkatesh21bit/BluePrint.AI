import { NextResponse } from "next/server"
import { db } from "@/db"
import { passkeys } from "@/db/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"

const challenges = new Map<string, { challenge: string; expires: Date }>()

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const challenge = crypto.randomBytes(32).toString("base64url")
    const challengeId = crypto.randomUUID()

    // Find user's passkeys
    const userPasskeys = await db
      .select()
      .from(passkeys)
      .where(eq(passkeys.deviceName, email))

    if (userPasskeys.length === 0) {
      // No passkeys found, but don't reveal this - let the browser try
    }

    challenges.set(challengeId, {
      challenge,
      expires: new Date(Date.now() + 300000),
    })

    return NextResponse.json({
      challengeId,
      publicKey: {
        challenge: Buffer.from(challenge, "base64url").buffer,
        timeout: 300000,
        userVerification: "required",
        rpId: req.headers.get("host")?.split(":")[0] || "localhost",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}

export { challenges }
