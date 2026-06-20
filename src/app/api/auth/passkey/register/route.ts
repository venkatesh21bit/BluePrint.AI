import { NextResponse } from "next/server"
import crypto from "crypto"

// In-memory challenge store (in production, use Redis or DB with expiry)
const challenges = new Map<string, { challenge: string; userId: string; expires: Date }>()

export async function POST(req: Request) {
  try {
    const { userId, deviceName } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const challenge = crypto.randomBytes(32).toString("base64url")
    const challengeId = crypto.randomUUID()

    challenges.set(challengeId, {
      challenge,
      userId,
      expires: new Date(Date.now() + 300000), // 5 min
    })

    return NextResponse.json({
      challengeId,
      publicKey: {
        challenge: Buffer.from(challenge, "base64url").buffer,
        rp: { name: "BluePrint.AI", id: req.headers.get("host")?.split(":")[0] || "localhost" },
        user: {
          id: Buffer.from(userId).buffer,
          name: userId,
          displayName: deviceName || "Device",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },   // ES256
          { type: "public-key", alg: -257 },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 300000,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to start registration" }, { status: 500 })
  }
}

export { challenges }
