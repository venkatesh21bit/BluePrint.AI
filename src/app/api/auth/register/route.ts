import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const [user] = await db
      .insert(users)
      .values({ name: name || email.split("@")[0], email, password_hash })
      .returning()

    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch {
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}
