import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { concepts } from "@/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * GET /api/concepts/[id]
 * Returns a single concept blueprint if it belongs to the authenticated user.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [concept] = await db
    .select()
    .from(concepts)
    .where(and(eq(concepts.id, id), eq(concepts.userId, session.user.id)))

  if (!concept) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(concept)
}

/**
 * DELETE /api/concepts/[id]
 * Deletes a concept blueprint (only if it belongs to the authenticated user).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [deleted] = await db
    .delete(concepts)
    .where(and(eq(concepts.id, id), eq(concepts.userId, session.user.id)))
    .returning()

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
