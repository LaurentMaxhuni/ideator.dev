import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    status: text("status").notNull().default("shaping"),
    domain: text("domain").notNull(),
    parentProjectId: uuid("parent_project_id").references((): AnyPgColumn => projects.id, {
      onDelete: "set null",
    }),
    forkMode: text("fork_mode"),
    forkSourceRunId: uuid("fork_source_run_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_user_id_idx").on(table.userId),
    index("projects_parent_project_id_idx").on(table.parentProjectId),
    uniqueIndex("projects_fork_source_run_mode_idx")
      .on(table.forkSourceRunId, table.forkMode)
      .where(sql`${table.forkSourceRunId} is not null`),
    check(
      "projects_fork_mode_check",
      sql`${table.forkMode} is null or ${table.forkMode} in ('safer', 'bolder', 'stranger')`,
    ),
  ],
);

export const projectBriefs = pgTable(
  "project_briefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    initialIdea: text("initial_idea").notNull(),
    intendedUsers: text("intended_users").notNull(),
    ambition: text("ambition").notNull(),
    platform: text("platform").notNull().default(""),
    constraints: text("constraints").notNull().default(""),
    nonGoals: text("non_goals").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("project_briefs_project_id_idx").on(table.projectId)],
);

export const projectArtifacts = pgTable(
  "project_artifacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    section: text("section").notNull(),
    content: jsonb("content").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("project_artifacts_project_section_idx").on(table.projectId, table.section)],
);

export const generationRuns = pgTable(
  "generation_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    kind: text("kind").notNull().default("brief"),
    status: text("status").notNull().default("running"),
    input: jsonb("input").notNull(),
    output: jsonb("output"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("generation_runs_project_id_idx").on(table.projectId),
    check(
      "generation_runs_kind_check",
      sql`${table.kind} in ('brief', 'exploration', 'fork-expansion')`,
    ),
  ],
);
