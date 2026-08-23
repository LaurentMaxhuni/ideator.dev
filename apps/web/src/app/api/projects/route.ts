import { generateIdeaBrief, ideaBriefInputSchema } from "@ideator.dev/ai";

import { getCurrentUser } from "@/lib/auth/server";
import {
  beginGenerationRun,
  completeGenerationRun,
  createProjectShell,
  failGenerationRun,
  generationCountForUserSince,
  getProjectForUser,
  listProjectsForUser,
  saveArtifact,
} from "@/lib/projects/repository";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;

function unauthenticated() {
  return Response.json({ error: "Sign in to access private projects." }, { status: 401 });
}

function unavailable(error: unknown) {
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

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthenticated();
  }

  try {
    const projects = await listProjectsForUser(user.id);
    return Response.json({ projects }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("project_list_failed", error);
    return unavailable(error);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthenticated();
  }

  const body = await request.text();

  if (body.length > MAX_BODY_BYTES) {
    return Response.json({ error: "This brief is too large. Keep the notes under 32 KB." }, { status: 413 });
  }

  let rawInput: unknown;

  try {
    rawInput = JSON.parse(body) as unknown;
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const inputResult = ideaBriefInputSchema.safeParse(rawInput);

  if (!inputResult.success) {
    return Response.json(
      { error: "Complete the required brief fields before generating.", issues: inputResult.error.issues },
      { status: 422 },
    );
  }

  try {
    const recentGenerations = await generationCountForUserSince(user.id, new Date(Date.now() - 60 * 60 * 1_000));

    if (recentGenerations >= 20) {
      return Response.json(
        { error: "Generation limit reached for this hour. Try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    const project = await createProjectShell(user.id, inputResult.data);
    const run = await beginGenerationRun(user.id, project.id, inputResult.data);

    try {
      const result = await generateIdeaBrief(inputResult.data);
      await completeGenerationRun(run.id, {
        provider: result.provider,
        model: result.model,
        output: { artifact: result.artifact, attempts: result.attempts },
      });
      await saveArtifact(user.id, project.id, result.artifact);

      const savedProject = await getProjectForUser(user.id, project.id);
      return Response.json({ project: savedProject }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      await failGenerationRun(run.id, error instanceof Error ? error.message : "Generation failed.");
      throw error;
    }
  } catch (error) {
    console.error("project_generation_failed", error);
    return unavailable(error);
  }
}
