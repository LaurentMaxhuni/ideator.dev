import {
  expandExplorationDirection,
  forkRequestSchema,
  getGenerationAttempts,
  ideaBriefInputSchema,
  isProviderCapacityError,
} from "@ideator.dev/ai";

import { getCurrentUser } from "@/lib/auth/server";
import {
  beginGenerationRun,
  createForkAtomically,
  failGenerationRun,
  findSavedFork,
  getCompletedExplorationForUser,
  getProjectForUser,
  playgroundGenerationCountForUserSince,
} from "@/lib/projects/repository";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type ForkRouteContext = {
  params: Promise<{ id: string; runId: string }>;
};

const PLAYGROUND_LIMIT = 6;

function providerError(error: unknown) {
  if (isProviderCapacityError(error)) {
    return Response.json(
      { error: "Free AI capacity is busy; try again later." },
      { status: 503, headers: { "Retry-After": "60" } },
    );
  }

  return Response.json(
    { error: "We could not expand that direction. The preview is still here when you retry." },
    { status: 502 },
  );
}

export async function POST(request: Request, context: ForkRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Sign in to save a direction." }, { status: 401 });
  }

  let rawInput: unknown;

  try {
    rawInput = (await request.json()) as unknown;
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const modeResult = forkRequestSchema.safeParse(rawInput);

  if (!modeResult.success) {
    return Response.json({ error: "Choose a valid exploration direction." }, { status: 422 });
  }

  const { id, runId } = await context.params;
  let project;
  let exploration;

  try {
    [project, exploration] = await Promise.all([
      getProjectForUser(user.id, id),
      getCompletedExplorationForUser(user.id, id, runId),
    ]);
  } catch (error) {
    console.error("fork_source_load_failed", error);
    return Response.json({ error: "We could not load that exploration." }, { status: 503 });
  }

  if (!project || !exploration) {
    return Response.json({ error: "Exploration not found." }, { status: 404 });
  }

  if (!project.brief || !project.artifact) {
    return Response.json({ error: "The source project no longer has a complete brief." }, { status: 409 });
  }

  const preview = exploration.exploration.directions.find(
    (direction) => direction.mode === modeResult.data.mode,
  );

  if (!preview) {
    return Response.json({ error: "That direction is not stored in this exploration." }, { status: 409 });
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
    return Response.json({ error: "The source brief cannot be expanded in its current shape." }, { status: 409 });
  }

  try {
    const existing = await findSavedFork(user.id, runId, modeResult.data.mode);

    if (existing) {
      return Response.json(
        { project: { id: existing.id, title: existing.title }, reused: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (error) {
    console.error("fork_idempotency_lookup_failed", error);
    return Response.json({ error: "We could not check that saved direction." }, { status: 503 });
  }

  let expansionRun;

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

    expansionRun = await beginGenerationRun(
      user.id,
      id,
      { sourceRunId: runId, mode: modeResult.data.mode },
      "fork-expansion",
    );
  } catch (error) {
    console.error("fork_run_start_failed", error);
    return Response.json({ error: "We could not start expanding that direction." }, { status: 503 });
  }

  let result;

  try {
    result = await expandExplorationDirection({
      brief: briefResult.data,
      artifact: project.artifact,
      input: exploration.input,
      preview,
    });
  } catch (error) {
    const attempts = getGenerationAttempts(error);
    const lastAttempt = attempts.at(-1);

    try {
      await failGenerationRun(
        expansionRun.id,
        error instanceof Error ? error.message : "Fork expansion failed.",
        {
          provider: lastAttempt?.provider,
          model: lastAttempt?.model,
          output: { attempts, sourceRunId: runId, mode: modeResult.data.mode },
        },
      );
    } catch (recordError) {
      console.error("fork_failure_record_failed", recordError);
    }

    console.error("fork_expansion_failed", error);
    return providerError(error);
  }

  try {
    const child = await createForkAtomically({
      userId: user.id,
      parent: project.project,
      parentBrief: project.brief,
      sourceRunId: runId,
      expansionRunId: expansionRun.id,
      mode: modeResult.data.mode,
      input: exploration.input,
      preview,
      artifact: result.artifact,
      generation: {
        provider: result.provider,
        model: result.model,
        attempts: result.attempts,
      },
    });

    return Response.json(
      { project: { id: child.id, title: child.title }, reused: false },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    try {
      const existing = await findSavedFork(user.id, runId, modeResult.data.mode);

      if (existing) {
        await failGenerationRun(expansionRun.id, "A concurrent request already saved this direction.", {
          provider: result.provider,
          model: result.model,
          output: { attempts: result.attempts, sourceRunId: runId, mode: modeResult.data.mode },
        });

        return Response.json(
          { project: { id: existing.id, title: existing.title }, reused: true },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      await failGenerationRun(expansionRun.id, error instanceof Error ? error.message : "Fork save failed.", {
        provider: result.provider,
        model: result.model,
        output: { attempts: result.attempts, sourceRunId: runId, mode: modeResult.data.mode },
      });
    } catch (recordError) {
      console.error("fork_save_failure_record_failed", recordError);
    }

    console.error("fork_atomic_save_failed", error);
    return Response.json(
      { error: "The direction was expanded, but could not be saved. No partial project was created." },
      { status: 503 },
    );
  }
}
