import { notFound } from "next/navigation";

import { forkModeSchema } from "@ideator.dev/ai";

import { WorkspaceClient } from "@/components/workspace-client";
import { requireUser } from "@/lib/auth/server";
import {
  getParentProjectForUser,
  getProjectForUser,
  listForksForProject,
} from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getProjectForUser(user.id, id);

  if (!project?.artifact) {
    notFound();
  }

  const [parent, forks] = await Promise.all([
    getParentProjectForUser(user.id, project.project.parentProjectId),
    listForksForProject(user.id, project.project.id),
  ]);

  return (
    <WorkspaceClient
      project={{
        id: project.project.id,
        title: project.project.title,
        status: project.project.status,
        domain: project.project.domain,
      }}
      initialArtifact={project.artifact}
      lineage={{
        parent: parent ? {
          ...parent,
          mode: project.project.forkMode,
        } : null,
        forks: forks.flatMap((fork) => {
          const mode = forkModeSchema.safeParse(fork.mode);

          return mode.success ? [{
            id: fork.id,
            title: fork.title,
            mode: mode.data,
          }] : [];
        }),
      }}
    />
  );
}
