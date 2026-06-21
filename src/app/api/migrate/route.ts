import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const results = [];
    
    try {
      await db.execute(sql`ALTER TABLE "user" ADD COLUMN "chat_count" integer NOT NULL DEFAULT 0;`);
      results.push('Added chat_count');
    } catch (e: any) { results.push('chat_count error: ' + e.message); }

    try {
      await db.execute(sql`ALTER TABLE "user" ADD COLUMN "workspace_init_count" integer NOT NULL DEFAULT 0;`);
      results.push('Added workspace_init_count');
    } catch (e: any) { results.push('workspace_init_count error: ' + e.message); }

    try {
      await db.execute(sql`ALTER TABLE "user" ADD COLUMN "simulation_count" integer NOT NULL DEFAULT 0;`);
      results.push('Added simulation_count');
    } catch (e: any) { results.push('simulation_count error: ' + e.message); }

    try {
      await db.execute(sql`ALTER TABLE "user" ADD COLUMN "is_exclusive" boolean NOT NULL DEFAULT false;`);
      results.push('Added is_exclusive');
    } catch (e: any) { results.push('is_exclusive error: ' + e.message); }

    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
