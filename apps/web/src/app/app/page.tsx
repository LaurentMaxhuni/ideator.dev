import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";

import { ProjectRowActions } from "@/components/project-row-actions";
import { getCurrentUser } from "@/lib/auth/server";
import { listProjectsForUser } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const projects = user ? await listProjectsForUser(user.id).catch(() => []) : [];
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "builder";
  const latestUpdate = projects.length ? projects.map((project) => project.updatedAt).sort().at(-1) : null;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">your workbench</p>
          <h1 className="display-type mt-5 max-w-[700px] text-4xl font-normal leading-[0.98] text-foreground sm:text-6xl">{projects.length === 0 ? "Your workbench is open." : `Good to see you, ${firstName}.`}</h1>
          <p className="mt-5 max-w-[580px] text-base leading-7 text-muted-foreground">Find a new direction in the idea lab or keep pressure-testing one that already earned your attention.</p>
          {projects.length > 0 && latestUpdate ? (
            <p className="mt-4 text-xs tabular-nums text-muted-foreground">{projects.length} saved · last touched {formatDate(new Date(latestUpdate))}</p>
          ) : null}
        </div>
        <Link href="/app/new" className="button-lift inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" /> Find or shape an idea</Link>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between border-b border-border/70 pb-4"><div><p className="eyebrow">recent projects</p><h2 className="mt-3 text-xl font-medium text-foreground">Projects in motion</h2></div>{projects.length > 0 && <span className="tabular-nums text-[0.68rem] text-muted-foreground">{projects.length} saved</span>}</div>

        {projects.length === 0 ? (
          <div className="panel px-6 py-14 text-center sm:px-10">
            <div className="mx-auto grid size-12 place-items-center rounded-md border border-accent/30 bg-accent/10 text-accent"><FolderKanban className="size-5" /></div>
            <h3 className="display-type mt-6 text-2xl font-normal text-foreground">The workbench is open.</h3>
            <p className="mx-auto mt-3 max-w-[440px] text-sm leading-6 text-muted-foreground">You do not need to arrive with an idea. Choose who it is for, what it could help with, and what kind of thing to make.</p>
            <Link href="/app/new" className="button-lift mt-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 text-sm font-semibold text-primary hover:bg-primary/15">Open the idea lab <ArrowRight className="size-4" /></Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project, index) => (
              <div key={project.id} className="relative">
                <Link href={`/app/projects/${project.id}`} className="group panel-quiet grid cursor-pointer gap-4 rounded-xl p-5 transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-1 hover:border-accent/35 hover:bg-card/80 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <span className="tabular-nums text-[0.68rem] text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <div><div className="flex flex-wrap items-center gap-3"><h3 className="text-base font-medium text-foreground">{project.title}</h3><span className="rounded-sm border border-border px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">{project.status}</span></div><p className="mt-2 text-xs text-muted-foreground">{project.domain} · updated {formatDate(project.updatedAt)}</p></div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary sm:justify-self-end sm:pr-10">Continue shaping <ArrowRight className="size-3.5 transition-transform duration-180 ease-spring group-hover:translate-x-1" /></span>
                </Link>
                <ProjectRowActions projectId={project.id} title={project.title} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
