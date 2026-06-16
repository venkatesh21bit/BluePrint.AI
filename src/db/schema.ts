import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  real,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)

export const concepts = pgTable("concepts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rawInput: text("raw_input").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ostNodes = pgTable("ost_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'outcome', 'opportunity', 'solution', 'test'
  title: text("title").notNull(),
  parentId: uuid("parent_id"), // self-referential
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assumptions = pgTable("assumptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'desirability', 'viability', 'feasibility', 'usability'
  statement: text("statement").notNull(),
  importance: real("importance").notNull(),
  evidence: real("evidence").notNull(),
  validationScore: real("validation_score").notNull(),
  recommendedExperiment: text("recommended_experiment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
  phase: text("phase").notNull(),
  objective: text("objective").notNull(),
  tasks: jsonb("tasks").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
  stepsExecuted: integer("steps_executed").notNull(),
  toolCalls: jsonb("tool_calls").notNull(),
  finalStatus: text("final_status").notNull(),
  governanceFlag: boolean("governance_flag").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
