import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userChats = await db
      .select({
        id: chats.id,
        title: chats.title,
        agentType: chats.agentType,
        updatedAt: chats.updatedAt,
      })
      .from(chats)
      .where(eq(chats.userId, session.user.id))
      .orderBy(desc(chats.updatedAt));

    return NextResponse.json(userChats);
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, messages, agentType } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Determine a title if none provided
    let chatTitle = title;
    if (!chatTitle) {
      const firstUserMessage = messages.find((m: any) => m.role === 'user')?.content;
      if (firstUserMessage) {
        chatTitle = firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '...' : '');
      } else {
        chatTitle = 'New Brainstorm';
      }
    }

    if (id) {
      // Check if chat exists
      const existing = await db.select().from(chats).where(eq(chats.id, id));
      if (existing.length > 0) {
        // Update existing chat
        await db.update(chats)
          .set({
            title: chatTitle,
            messages,
            ...(agentType && { agentType }),
            updatedAt: new Date(),
          })
          .where(eq(chats.id, id));
          
        return NextResponse.json({ id, title: chatTitle, agentType: agentType || existing[0].agentType });
      }
    }

    // Create new chat
    const newChatId = id || crypto.randomUUID();
    const finalAgentType = agentType || 'clarification';
    await db.insert(chats).values({
      id: newChatId,
      userId: session.user.id,
      title: chatTitle,
      agentType: finalAgentType,
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: newChatId, title: chatTitle, agentType: finalAgentType });
  } catch (error: any) {
    console.error('Error saving chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
