const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_pf6TuU4CaRkG@ep-royal-cell-ah4ssedb.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  await client.connect();
  console.log('Connected to Neon DB');

  try {
    await client.query(`ALTER TABLE "user" ADD COLUMN "chat_count" integer NOT NULL DEFAULT 0;`);
    console.log('Added chat_count');
  } catch(e) { console.error(e.message); }

  try {
    await client.query(`ALTER TABLE "user" ADD COLUMN "workspace_init_count" integer NOT NULL DEFAULT 0;`);
    console.log('Added workspace_init_count');
  } catch(e) { console.error(e.message); }

  try {
    await client.query(`ALTER TABLE "user" ADD COLUMN "simulation_count" integer NOT NULL DEFAULT 0;`);
    console.log('Added simulation_count');
  } catch(e) { console.error(e.message); }

  try {
    await client.query(`ALTER TABLE "user" ADD COLUMN "is_exclusive" boolean NOT NULL DEFAULT false;`);
    console.log('Added is_exclusive');
  } catch(e) { console.error(e.message); }

  await client.end();
}

run();
