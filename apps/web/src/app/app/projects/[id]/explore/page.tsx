import { notFound } from "next/navigation";

import { ExplorationClient } from "@/components/exploration-client";
import { requireUser } from "@/lib/auth/server";
import {
  getLatestCompletedExploration,
  getProjectForUser,
} from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

export default async function ExploreProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [project, latestExploration] = await Promise.all([
    getProjectForUser(user.id, id),
    getLatestCompletedExploration(user.id, id),
  ]);

  if (!project?.artifact || !project.brief) {
    notFound();
  }

  return (
    <ExplorationClient
      projectId={project.project.id}
      artifact={project.artifact}
      initialExploration={latestExploration ? {
        runId: latestExploration.runId,
        input: latestExploration.input,
        directions: latestExploration.exploration.directions,
        completedAt: latestExploration.completedAt.toISOString(),
      } : null}
    />
  );
}
