import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json()

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Email, token, and password required" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.resetToken, token),
        )
      )
      .limit(1)

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    await db
      .update(users)
      .set({
        password_hash,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ message: "Password reset successful" })
  } catch {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
