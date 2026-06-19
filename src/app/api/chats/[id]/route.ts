import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { auth } from '@/auth';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const chatData = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)))
      .limit(1);

    if (chatData.length === 0) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chatData[0]);
  } catch (error: any) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db
      .delete(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
