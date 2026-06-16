import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// Ensure DATABASE_URL is set in the environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

/**
 * Executes a callback within a database transaction that sets the
 * PostgreSQL local variable `app.user_id` for Row-Level Security (RLS).
 *
 * This ensures that tenant isolation is enforced directly at the
 * database engine layer.
 *
 * @param userId - The UUID of the authenticated user
 * @param cb - The callback containing the database queries to execute
 */
export async function withUserContext<T>(
  userId: string,
  cb: (tx: any) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    // Set the local variable for the current transaction
    await tx.execute(sql`SET LOCAL app.user_id = ${userId}`);
    // Execute the queries within this transaction context
    return cb(tx);
  });
}
