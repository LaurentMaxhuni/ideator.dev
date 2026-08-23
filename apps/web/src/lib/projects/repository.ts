import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import {
  generationRuns,
  projectArtifacts,
  projectBriefs,
  projects,
  requireDb,
} from "@ideator.dev/db";
import {
  artifactSectionNames,
  explorationInputSchema,
  explorationOutputSchema,
  ideaArtifactSchema,
  playgroundConstraints,
  type ArtifactSectionName,
  type DirectionPreview,
  type ExplorationInput,
  type ForkMode,
  type GenerationAttempt,
  type IdeaArtifact,
  type IdeaBriefInput,
} from "@ideator.dev/ai";

const sectionPositions: Record<ArtifactSectionName, number> = {
  northStar: 0,
  whoItsFor: 1,
  whyItMatters: 2,
  mvpScope: 3,
  experience: 4,
  technicalBlueprint: 5,
  milestones: 6,
  immediateNextStep: 7,
};

export type GenerationRunKind = "brief" | "exploration" | "fork-expansion";

export type ProjectWithArtifacts = {
  project: typeof projects.$inferSelect;
  brief: typeof projectBriefs.$inferSelect | null;
  artifact: IdeaArtifact | null;
  sections: Record<string, unknown>;
};

export type StoredExploration = {
  runId: string;
  input: ExplorationInput;
  exploration: ReturnType<typeof explorationOutputSchema.parse>;
  completedAt: Date;
};

export async function listProjectsForUser(userId: string) {
  const db = requireDb();

  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

export async function getProjectForUser(userId: string, projectId: string): Promise<ProjectWithArtifacts | null> {
  const db = requireDb();
  const projectRows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
    .limit(1);
  const project = projectRows[0];

  if (!project) {
    return null;
  }

  const [briefRows, artifactRows] = await Promise.all([
    db.select().from(projectBriefs).where(eq(projectBriefs.projectId, project.id)).limit(1),
    db
      .select()
      .from(projectArtifacts)
      .where(eq(projectArtifacts.projectId, project.id))
      .orderBy(projectArtifacts.position),
  ]);
  const sections: Record<string, unknown> = {};

  for (const row of artifactRows) {
    sections[row.section] = row.content;
  }

  const artifactResult = ideaArtifactSchema.safeParse({
    projectName: project.title,
    ...sections,
  });

  return {
    project,
    brief: briefRows[0] ?? null,
    artifact: artifactResult.success ? artifactResult.data : null,
    sections,
  };
}

export async function listForksForProject(userId: string, parentProjectId: string) {
  const db = requireDb();

  return db
    .select({
      id: projects.id,
      title: projects.title,
      mode: projects.forkMode,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.parentProjectId, parentProjectId)))
    .orderBy(desc(projects.updatedAt));
}

export async function getParentProjectForUser(userId: string, parentProjectId: string | null) {
  if (!parentProjectId) {
    return null;
  }

  const db = requireDb();
  const rows = await db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.id, parentProjectId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function createProjectShell(userId: string, input: IdeaBriefInput) {
  const db = requireDb();
  const projectRows = await db
    .insert(projects)
    .values({
      userId,
      title: "Shaping a new idea",
      status: "shaping",
      domain: input.domain,
    })
    .returning();
  const project = projectRows[0];

  if (!project) {
    throw new Error("The project could not be created.");
  }

  await db.insert(projectBriefs).values({
    projectId: project.id,
    initialIdea: input.initialIdea,
    intendedUsers: input.intendedUsers,
    ambition: input.ambition,
    platform: input.platform,
    constraints: input.constraints,
    nonGoals: input.nonGoals,
  });

  return project;
}

export async function saveArtifact(userId: string, projectId: string, artifact: IdeaArtifact) {
  const db = requireDb();
  const project = await getProjectForUser(userId, projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  await db
    .update(projects)
    .set({ title: artifact.projectName, status: "ready", updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  for (const section of artifactSectionNames) {
    await db
      .insert(projectArtifacts)
      .values({
        projectId,
        section,
        content: artifact[section],
        position: sectionPositions[section],
      })
      .onConflictDoUpdate({
        target: [projectArtifacts.projectId, projectArtifacts.section],
        set: {
          content: artifact[section],
          position: sectionPositions[section],
          updatedAt: new Date(),
        },
      });
  }
}

export async function updateArtifactSection(
  userId: string,
  projectId: string,
  section: ArtifactSectionName,
  content: unknown,
) {
  const db = requireDb();
  const project = await getProjectForUser(userId, projectId);

  if (!project) {
    return false;
  }

  await db
    .insert(projectArtifacts)
    .values({ projectId, section, content, position: sectionPositions[section] })
    .onConflictDoUpdate({
      target: [projectArtifacts.projectId, projectArtifacts.section],
      set: { content, updatedAt: new Date() },
    });

  await db
    .update(projects)
    .set({ updatedAt: new Date(), status: "shaping" })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  return true;
}

export async function beginGenerationRun(
  userId: string,
  projectId: string,
  input: unknown,
  kind: GenerationRunKind = "brief",
) {
  const db = requireDb();
  const projectRows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
    .limit(1);

  if (!projectRows[0]) {
    throw new Error("Project not found.");
  }

  const rows = await db
    .insert(generationRuns)
    .values({
      projectId,
      provider: "pending",
      model: "pending",
      kind,
      status: "running",
      input,
    })
    .returning();

  const run = rows[0];

  if (!run) {
    throw new Error("The generation run could not be created.");
  }

  return run;
}

export async function completeGenerationRun(
  runId: string,
  result: { provider: string; model: string; output: unknown },
) {
  const db = requireDb();

  await db
    .update(generationRuns)
    .set({
      provider: result.provider,
      model: result.model,
      status: "completed",
      output: result.output,
      error: null,
      completedAt: new Date(),
    })
    .where(eq(generationRuns.id, runId));
}

export async function failGenerationRun(
  runId: string,
  error: string,
  details: { provider?: string; model?: string; output?: unknown } = {},
) {
  const db = requireDb();

  await db
    .update(generationRuns)
    .set({
      provider: details.provider ?? "failed",
      model: details.model ?? "unavailable",
      status: "failed",
      output: details.output,
      error: error.slice(0, 1_000),
      completedAt: new Date(),
    })
    .where(eq(generationRuns.id, runId));
}

export async function generationCountForUserSince(userId: string, since: Date) {
  const db = requireDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(generationRuns)
    .innerJoin(projects, eq(generationRuns.projectId, projects.id))
    .where(and(eq(projects.userId, userId), gt(generationRuns.startedAt, since)));

  return Number(rows[0]?.count ?? 0);
}

export async function playgroundGenerationCountForUserSince(userId: string, since: Date) {
  const db = requireDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(generationRuns)
    .innerJoin(projects, eq(generationRuns.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        gt(generationRuns.startedAt, since),
        inArray(generationRuns.kind, ["exploration", "fork-expansion"]),
      ),
    );

  return Number(rows[0]?.count ?? 0);
}

function parseStoredExploration(run: typeof generationRuns.$inferSelect): StoredExploration | null {
  const inputResult = explorationInputSchema.safeParse(run.input);
  const outputRecord = run.output && typeof run.output === "object" ? run.output as Record<string, unknown> : null;
  const explorationResult = explorationOutputSchema.safeParse(outputRecord?.exploration);

  if (!inputResult.success || !explorationResult.success || !run.completedAt) {
    return null;
  }

  return {
    runId: run.id,
    input: inputResult.data,
    exploration: explorationResult.data,
    completedAt: run.completedAt,
  };
}

export async function getLatestCompletedExploration(userId: string, projectId: string) {
  const db = requireDb();
  const rows = await db
    .select({ run: generationRuns })
    .from(generationRuns)
    .innerJoin(projects, eq(generationRuns.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.id, projectId),
        eq(generationRuns.kind, "exploration"),
        eq(generationRuns.status, "completed"),
      ),
    )
    .orderBy(desc(generationRuns.completedAt))
    .limit(1);

  return rows[0] ? parseStoredExploration(rows[0].run) : null;
}

export async function getCompletedExplorationForUser(
  userId: string,
  projectId: string,
  runId: string,
) {
  const db = requireDb();
  const rows = await db
    .select({ run: generationRuns })
    .from(generationRuns)
    .innerJoin(projects, eq(generationRuns.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.id, projectId),
        eq(generationRuns.id, runId),
        eq(generationRuns.kind, "exploration"),
        eq(generationRuns.status, "completed"),
      ),
    )
    .limit(1);

  return rows[0] ? parseStoredExploration(rows[0].run) : null;
}

export async function findSavedFork(
  userId: string,
  sourceRunId: string,
  mode: ForkMode,
) {
  const db = requireDb();
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.forkSourceRunId, sourceRunId),
        eq(projects.forkMode, mode),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

function mergedConstraints(original: string, input: ExplorationInput) {
  const additions: string[] = input.constraintIds.map(
    (id) => playgroundConstraints.find((constraint) => constraint.id === id)?.label ?? id,
  );

  if (input.customConstraint) {
    additions.push(input.customConstraint);
  }

  return [original.trim(), ...additions].filter(Boolean).join("; ");
}

export async function createForkAtomically(args: {
  userId: string;
  parent: typeof projects.$inferSelect;
  parentBrief: typeof projectBriefs.$inferSelect;
  sourceRunId: string;
  expansionRunId: string;
  mode: ForkMode;
  input: ExplorationInput;
  preview: DirectionPreview;
  artifact: IdeaArtifact;
  generation: {
    provider: string;
    model: string;
    attempts: GenerationAttempt[];
  };
}) {
  const db = requireDb();
  const childId = crypto.randomUUID();
  const now = new Date();
  const artifactRows = artifactSectionNames.map((section) => ({
    projectId: childId,
    section,
    content: args.artifact[section],
    position: sectionPositions[section],
  }));

  const [childRows] = await db.batch([
    db
      .insert(projects)
      .values({
        id: childId,
        userId: args.userId,
        title: args.artifact.projectName,
        status: "ready",
        domain: args.parent.domain,
        parentProjectId: args.parent.id,
        forkMode: args.mode,
        forkSourceRunId: args.sourceRunId,
        updatedAt: now,
      })
      .returning(),
    db.insert(projectBriefs).values({
      projectId: childId,
      initialIdea: args.preview.thesis,
      intendedUsers: args.preview.primaryUser,
      ambition: args.parentBrief.ambition,
      platform: args.parentBrief.platform,
      constraints: mergedConstraints(args.parentBrief.constraints, args.input),
      nonGoals: args.parentBrief.nonGoals,
    }),
    db.insert(projectArtifacts).values(artifactRows),
    db
      .update(generationRuns)
      .set({
        projectId: childId,
        provider: args.generation.provider,
        model: args.generation.model,
        status: "completed",
        output: {
          artifact: args.artifact,
          attempts: args.generation.attempts,
          sourceRunId: args.sourceRunId,
          mode: args.mode,
        },
        error: null,
        completedAt: now,
      })
      .where(eq(generationRuns.id, args.expansionRunId)),
    db
      .update(projects)
      .set({ updatedAt: now })
      .where(and(eq(projects.id, args.parent.id), eq(projects.userId, args.userId))),
  ]);

  const child = childRows[0];

  if (!child) {
    throw new Error("The fork could not be created.");
  }

  return child;
}
