import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email, recoveryEmail } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await db
      .update(users)
      .set({ resetToken, resetTokenExpiry })
      .where(eq(users.id, user.id))

    const resetUrl = `${req.headers.get("origin") || "http://localhost:3000"}/auth/reset-password?token=${resetToken}&email=${email}`

    // Development mode: return the link in response
    // Production: send via email using nodemailer or Resend
    const useRecovery = recoveryEmail || user.recoveryEmail

    return NextResponse.json({
      message: "If the email exists, a reset link has been sent.",
      ...(process.env.NODE_ENV === "development" && { devResetUrl: resetUrl }),
      recoveryEmail: useRecovery || null,
    })
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
