import {
  explorationInputSchema,
  generateExploration,
  getGenerationAttempts,
  ideaBriefInputSchema,
  isProviderCapacityError,
} from "@ideator.dev/ai";

import { getCurrentUser } from "@/lib/auth/server";
import {
  beginGenerationRun,
  completeGenerationRun,
  failGenerationRun,
  getProjectForUser,
  playgroundGenerationCountForUserSince,
} from "@/lib/projects/repository";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type ExplorationRouteContext = {
  params: Promise<{ id: string }>;
};

const MAX_BODY_BYTES = 4 * 1024;
const PLAYGROUND_LIMIT = 6;

function providerError(error: unknown) {
  if (isProviderCapacityError(error)) {
    return Response.json(
      { error: "Free AI capacity is busy; try again later." },
      { status: 503, headers: { "Retry-After": "60" } },
    );
  }

  return Response.json(
    { error: "We could not generate new directions. Your previous exploration is still safe." },
    { status: 502 },
  );
}

export async function POST(request: Request, context: ExplorationRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Sign in to explore private projects." }, { status: 401 });
  }

  const body = await request.text();

  if (body.length > MAX_BODY_BYTES) {
    return Response.json({ error: "The exploration request is too large." }, { status: 413 });
  }

  let rawInput: unknown;

  try {
    rawInput = JSON.parse(body) as unknown;
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const inputResult = explorationInputSchema.safeParse(rawInput);

  if (!inputResult.success) {
    return Response.json(
      { error: "Choose no more than two unique constraints and keep custom notes under 240 characters.", issues: inputResult.error.issues },
      { status: 422 },
    );
  }

  const { id } = await context.params;
  let project;

  try {
    project = await getProjectForUser(user.id, id);
  } catch (error) {
    console.error("exploration_project_load_failed", error);
    const missingDatabaseUrl = error instanceof Error && error.message.includes("DATABASE_URL");

    return Response.json(
      {
        error: missingDatabaseUrl
          ? "Project persistence is not configured. Add DATABASE_URL to the app environment."
          : "Project storage is temporarily unavailable. Try again in a moment.",
      },
      { status: 503 },
    );
  }

  if (!project) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  if (!project.brief || !project.artifact) {
    return Response.json({ error: "This project needs a complete brief before it can be explored." }, { status: 409 });
  }

  const briefResult = ideaBriefInputSchema.safeParse({
    initialIdea: project.brief.initialIdea,
    domain: project.project.domain,
    intendedUsers: project.brief.intendedUsers,
    ambition: project.brief.ambition,
    platform: project.brief.platform,
    constraints: project.brief.constraints,
    nonGoals: project.brief.nonGoals,
  });

  if (!briefResult.success) {
    return Response.json({ error: "This project brief cannot be explored in its current shape." }, { status: 409 });
  }

  let run;

  try {
    const recentActions = await playgroundGenerationCountForUserSince(
      user.id,
      new Date(Date.now() - 60 * 60 * 1_000),
    );

    if (recentActions >= PLAYGROUND_LIMIT) {
      return Response.json(
        { error: "Playground limit reached for this hour. Try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    run = await beginGenerationRun(user.id, id, inputResult.data, "exploration");
  } catch (error) {
    console.error("exploration_run_start_failed", error);
    return Response.json({ error: "We could not start this exploration." }, { status: 503 });
  }

  try {
    const result = await generateExploration({
      brief: briefResult.data,
      artifact: project.artifact,
      input: inputResult.data,
    });
    const completedAt = new Date();

    await completeGenerationRun(run.id, {
      provider: result.provider,
      model: result.model,
      output: { exploration: result.exploration, attempts: result.attempts },
    });

    return Response.json(
      {
        exploration: {
          runId: run.id,
          input: inputResult.data,
          directions: result.exploration.directions,
          completedAt: completedAt.toISOString(),
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const attempts = getGenerationAttempts(error);
    const lastAttempt = attempts.at(-1);

    try {
      await failGenerationRun(run.id, error instanceof Error ? error.message : "Exploration failed.", {
        provider: lastAttempt?.provider,
        model: lastAttempt?.model,
        output: { attempts },
      });
    } catch (recordError) {
      console.error("exploration_failure_record_failed", recordError);
    }

    console.error("exploration_generation_failed", error);
    return providerError(error);
  }
}
