import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { concepts } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * GET /api/concepts
 * Returns all concepts belonging to the authenticated user.
 * Requires a valid session (handled by middleware.ts).
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userConcepts = await db
    .select()
    .from(concepts)
    .where(eq(concepts.userId, session.user.id))
    .orderBy(concepts.createdAt)

  return NextResponse.json(userConcepts)
}

/**
 * POST /api/concepts
 * Creates a new concept blueprint for the authenticated user.
 * Expects: { name: string, rawInput: string }
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, rawInput } = await req.json()

  if (!name || !rawInput) {
    return NextResponse.json(
      { error: "name and rawInput are required" },
      { status: 400 }
    )
  }

  const [newConcept] = await db
    .insert(concepts)
    .values({
      userId: session.user.id,
      name,
      rawInput,
    })
    .returning()

  return NextResponse.json(newConcept, { status: 201 })
}
