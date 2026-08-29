import { z } from "zod";

import { artifactSectionNames, artifactSectionSchemas } from "@ideator.dev/ai";

import { getCurrentUser } from "@/lib/auth/server";
import {
  deleteProject,
  getProjectForUser,
  renameProject,
  updateArtifactSection,
} from "@/lib/projects/repository";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type ProjectRouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.union([
  z.object({ title: z.string().trim().min(3).max(120) }),
  z.object({
    section: z.enum(artifactSectionNames),
    content: z.unknown(),
  }),
]);

function unauthenticated() {
  return Response.json({ error: "Sign in to access private projects." }, { status: 401 });
}
export async function GET(_request: Request, context: ProjectRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthenticated();
  }

  const { id } = await context.params;
  const project = await getProjectForUser(user.id, id);

  if (!project) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }

  return Response.json({ project }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthenticated();
  }

  const { id } = await context.params;
  let rawInput: unknown;

  try {
    rawInput = (await request.json()) as unknown;
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(rawInput);

  if (!parsed.success) {
    return Response.json({ error: "A valid project update is required." }, { status: 422 });
  }

  if ("title" in parsed.data) {
    try {
      const renamed = await renameProject(user.id, id, parsed.data.title);

      if (!renamed) {
        return Response.json({ error: "Project not found." }, { status: 404 });
      }

      const project = await getProjectForUser(user.id, id);
      return Response.json({ project }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("project_rename_failed", error);
      return Response.json({ error: "We could not rename that project." }, { status: 503 });
    }
  }

  const sectionResult = artifactSectionSchemas[parsed.data.section].safeParse(parsed.data.content);

  if (!sectionResult.success) {
    return Response.json({ error: "That section does not match its editable shape." }, { status: 422 });
  }

  try {
    const updated = await updateArtifactSection(user.id, id, parsed.data.section, sectionResult.data);

    if (!updated) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    const project = await getProjectForUser(user.id, id);
    return Response.json({ project }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("artifact_update_failed", error);
    return Response.json({ error: "We could not save that section." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthenticated();
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteProject(user.id, id);

    if (!deleted) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("project_delete_failed", error);
    return Response.json({ error: "We could not delete that project." }, { status: 503 });
  }
}
