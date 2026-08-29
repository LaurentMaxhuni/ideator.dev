"use client";

import { ArrowLeft, Check, ChevronRight, Code2, Compass, GitFork, Layers3, LoaderCircle, Palette, Pencil, Save, Sparkles, Target, Trash2, UsersRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ArtifactSectionName, ForkMode, IdeaArtifact } from "@ideator.dev/ai";

import { ArtifactSectionEditor } from "@/components/artifact-section-editor";
import { BrandDirections } from "@/components/brand-directions";
import { ConceptMap } from "@/components/concept-map";

type ProjectSummary = {
  id: string;
  title: string;
  status: string;
  domain: string;
};

type ProjectLineage = {
  parent: { id: string; title: string; mode: string | null } | null;
  forks: Array<{ id: string; title: string; mode: ForkMode }>;
};

const sectionMeta: Array<{ key: ArtifactSectionName; label: string; eyebrow: string; icon: typeof Target; hint: string }> = [
  { key: "northStar", label: "North star", eyebrow: "01 / concept", icon: Target, hint: "The sentence the whole build should keep answering to." },
  { key: "whoItsFor", label: "Who it is for", eyebrow: "02 / audience", icon: UsersRound, hint: "The first person and moment this should serve." },
  { key: "whyItMatters", label: "Why it matters", eyebrow: "03 / problem", icon: Compass, hint: "The tension worth resolving." },
  { key: "mvpScope", label: "MVP scope", eyebrow: "04 / boundary", icon: Layers3, hint: "What belongs in the first version—and what does not." },
  { key: "experience", label: "Experience direction", eyebrow: "05 / feel", icon: ChevronRight, hint: "How the product should feel in a user's hands." },
  { key: "technicalBlueprint", label: "Technical blueprint", eyebrow: "06 / shape", icon: Code2, hint: "A credible starting architecture, not a forever decision." },
  { key: "milestones", label: "Milestones", eyebrow: "07 / sequence", icon: ChevronRight, hint: "The smallest useful path from idea to signal." },
  { key: "immediateNextStep", label: "Immediate next step", eyebrow: "08 / now", icon: ArrowLeft, hint: "The action that turns thinking into motion." },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asTextList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function displaySection(section: ArtifactSectionName, value: unknown) {
  if (section === "whyItMatters" && typeof value === "string") {
    return <p className="max-w-[720px] text-lg leading-8 text-foreground/90">{value}</p>;
  }

  if (section === "northStar" && isRecord(value)) {
    return <div><p className="display-type max-w-[680px] text-3xl leading-tight text-foreground sm:text-4xl">{asText(value.headline)}</p><p className="mt-5 max-w-[680px] text-sm leading-6 text-muted-foreground">{asText(value.summary)}</p></div>;
  }

  if (section === "whoItsFor" && isRecord(value)) {
    const fields: Array<[string, unknown]> = [["primary user", value.primaryUser], ["situation", value.situation], ["promise", value.promise]];
    return <div className="grid gap-5 sm:grid-cols-3">{fields.map(([label, content]) => <div key={label}><p className="eyebrow">{label}</p><p className="mt-3 text-sm leading-6 text-foreground/90">{asText(content)}</p></div>)}</div>;
  }

  if (section === "mvpScope" && isRecord(value)) {
    return <div className="grid gap-6 sm:grid-cols-2"><div><p className="eyebrow text-primary">in scope</p><ul className="mt-4 space-y-3">{asTextList(value.include).map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-foreground/90"><Check className="mt-1 size-3.5 shrink-0 text-primary" />{item}</li>)}</ul></div><div><p className="eyebrow text-muted-foreground">out of scope</p><ul className="mt-4 space-y-3">{asTextList(value.exclude).map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />{item}</li>)}</ul></div></div>;
  }

  if (section === "experience" && isRecord(value)) {
    return <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr]"><div><p className="text-sm leading-7 text-foreground/90">{asText(value.direction)}</p><p className="eyebrow mt-7">principles</p><ul className="mt-3 space-y-2">{asTextList(value.principles).map((item) => <li key={item} className="text-sm text-muted-foreground">{item}</li>)}</ul></div><div><p className="eyebrow">first run</p><ol className="mt-3 space-y-3">{asTextList(value.firstRun).map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="tabular-nums text-accent">0{index + 1}</span>{item}</li>)}</ol></div></div>;
  }

  if (section === "technicalBlueprint" && isRecord(value)) {
    return <div><p className="max-w-[720px] text-sm leading-7 text-foreground/90">{asText(value.shape)}</p><div className="mt-7 grid gap-6 sm:grid-cols-3"><div><p className="eyebrow">stack</p><ul className="mt-3 space-y-2">{asTextList(value.stack).map((item) => <li key={item} className="text-sm text-muted-foreground">{item}</li>)}</ul></div><div><p className="eyebrow">data model</p><ul className="mt-3 space-y-2">{asTextList(value.dataModel).map((item) => <li key={item} className="text-sm text-muted-foreground">{item}</li>)}</ul></div><div><p className="eyebrow">risks</p><ul className="mt-3 space-y-2">{asTextList(value.risks).map((item) => <li key={item} className="text-sm leading-5 text-muted-foreground">{item}</li>)}</ul></div></div></div>;
  }

  if (section === "milestones" && Array.isArray(value)) {
    return <div className="grid gap-3">{value.filter(isRecord).map((item, index) => <div key={asText(item.id) || String(index)} className="grid gap-4 rounded-lg border border-border/70 bg-background/30 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start"><span className="tabular-nums text-xs text-accent">{asText(item.id) || `m${index + 1}`}</span><div><p className="text-sm font-medium text-foreground">{asText(item.name)}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{asText(item.outcome)}</p><ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{asTextList(item.steps).map((step) => <li key={step} className="text-xs text-muted-foreground/80">{step}</li>)}</ul></div><span className="tabular-nums text-[0.65rem] text-muted-foreground">{asText(item.shipWindow)}</span></div>)}</div>;
  }

  if (section === "immediateNextStep" && isRecord(value)) {
    return <div className="grid gap-6 sm:grid-cols-[1fr_1.2fr]"><div><p className="display-type text-3xl leading-tight text-foreground">{asText(value.title)}</p><p className="mt-4 text-sm leading-6 text-foreground/85">{asText(value.action)}</p></div><div className="rounded-lg border border-primary/30 bg-primary/[0.07] p-4"><p className="eyebrow text-primary">done when</p><p className="mt-3 text-sm leading-6 text-foreground/90">{asText(value.doneWhen)}</p></div></div>;
  }

  return <p className="text-sm leading-6 text-muted-foreground">This section could not be displayed in its expected shape.</p>;
}

function SectionCard({ section, value, projectId, onSaved }: { section: (typeof sectionMeta)[number]; value: unknown; projectId: string; onSaved: (section: ArtifactSectionName, value: unknown) => void }) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<unknown>(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [cancelArmed, setCancelArmed] = useState(false);
  const Icon = section.icon;
  const draftKey = `ideator:section-draft:${projectId}:${section.key}`;

  function readStoredDraft(): unknown | null {
    try {
      const stored = window.sessionStorage.getItem(draftKey);
      return stored === null ? null : JSON.parse(stored) as unknown;
    } catch {
      return null;
    }
  }

  function storeDraft(next: unknown) {
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify(next));
    } catch {
      /* storage unavailable; the draft still lives in state */
    }
  }

  function clearStoredDraft() {
    try {
      window.sessionStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
  }

  function startEditing() {
    const stored = readStoredDraft();
    setDraft(stored ?? structuredClone(value));
    setRestoredNotice(stored !== null);
    setCancelArmed(false);
    setError("");
    setEditing(true);
  }

  function updateDraft(next: unknown) {
    setDraft(next);
    storeDraft(next);
    setRestoredNotice(false);
    setCancelArmed(false);
  }

  function cancelEditing() {
    if (!cancelArmed) {
      setCancelArmed(true);
      return;
    }

    clearStoredDraft();
    setCancelArmed(false);
    setRestoredNotice(false);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    setCancelArmed(false);

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: section.key, content: draft }) });
      const payload = (await response.json()) as { error?: string; project?: { artifact?: IdeaArtifact | null } };

      if (!response.ok || !payload.project?.artifact) {
        throw new Error(payload.error || "That section could not be saved.");
      }

      clearStoredDraft();
      onSaved(section.key, payload.project.artifact);
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "That section could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", duration: reduceMotion ? 0 : 0.45, bounce: 0.08 }} className="panel rounded-xl p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3"><div className="mt-0.5 rounded-md border border-accent/30 bg-accent/10 p-2 text-accent"><Icon className="size-4" aria-hidden="true" /></div><div><p className="eyebrow">{section.eyebrow}</p><h2 className="mt-2 text-xl font-medium tracking-[-0.04em] text-foreground">{section.label}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{section.hint}</p></div></div>
        <button type="button" onClick={startEditing} disabled={editing} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 text-xs text-muted-foreground transition-[background-color,border-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground active:translate-y-px disabled:cursor-default disabled:border-primary/30 disabled:text-primary"><Pencil className="size-3.5" /> {editing ? "Editing" : "Edit"}</button>
      </div>
      <div className="mt-7 border-t border-border/70 pt-6">
        {editing ? <form onSubmit={(event) => { event.preventDefault(); void save(); }}><ArtifactSectionEditor section={section.key} value={draft} onChange={updateDraft} /><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4"><span className="text-xs text-muted-foreground">{cancelArmed ? "Discard these edits? Click again to confirm." : restoredNotice ? "Restored your unsaved edits from this session." : "Edit the fields directly. Drafts survive a refresh. Required shapes stay protected."}</span><div className="flex items-center gap-2"><button type="button" onClick={cancelEditing} className={`min-h-10 cursor-pointer rounded-md px-3 text-xs transition-[color,transform] duration-180 ease-spring hover:-translate-y-0.5 active:translate-y-px ${cancelArmed ? "font-semibold text-destructive hover:text-destructive" : "text-muted-foreground hover:text-foreground"}`}>{cancelArmed ? "Discard changes" : "Cancel"}</button><button type="submit" disabled={saving} className="button-lift inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-semibold text-primary-foreground disabled:cursor-wait disabled:opacity-60">{saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} {saving ? "Saving" : "Save section"}</button></div></div>{error && <p id={`edit-${section.key}-error`} className="mt-3 text-xs text-destructive" role="alert">{error}</p>}</form> : displaySection(section.key, value)}
      </div>
    </motion.article>
  );
}

export function WorkspaceClient({
  project,
  initialArtifact,
  lineage,
}: {
  project: ProjectSummary;
  initialArtifact: IdeaArtifact;
  lineage: ProjectLineage;
}) {
  const router = useRouter();
  const [artifact, setArtifact] = useState(initialArtifact);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const deleteConfirmed = deleteConfirmText.trim().toLowerCase() === artifact.projectName.trim().toLowerCase();

  function handleSaved(_section: ArtifactSectionName, value: unknown) {
    if (isRecord(value) && typeof value.projectName === "string" && isRecord(value.northStar)) {
      setArtifact(value as IdeaArtifact);
    }
  }

  function startRenaming() {
    setTitleDraft(artifact.projectName);
    setTitleError("");
    setRenaming(true);
  }

  async function saveTitle() {
    const nextTitle = titleDraft.trim();

    if (nextTitle.length < 3 || nextTitle.length > 120) {
      setTitleError("Titles are 3–120 characters.");
      return;
    }

    setSavingTitle(true);
    setTitleError("");

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "We could not rename that project.");
      }

      setArtifact((current) => ({ ...current, projectName: nextTitle }));
      setRenaming(false);
      router.refresh();
    } catch (renameError) {
      setTitleError(renameError instanceof Error ? renameError.message : "We could not rename that project.");
    } finally {
      setSavingTitle(false);
    }
  }

  function clearProjectDrafts() {
    try {
      const prefix = `ideator:section-draft:${project.id}:`;

      for (const key of Object.keys(window.sessionStorage)) {
        if (key.startsWith(prefix)) {
          window.sessionStorage.removeItem(key);
        }
      }
    } catch {
      /* ignore */
    }
  }

  async function deleteThisProject() {
    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "We could not delete that project.");
      }

      clearProjectDrafts();
      router.push("/app");
      router.refresh();
    } catch (deleteFailure) {
      setDeleteError(deleteFailure instanceof Error ? deleteFailure.message : "We could not delete that project.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <Link href="/app" className="inline-flex cursor-pointer items-center gap-2 rounded-sm text-xs text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-x-1 hover:text-foreground"><ArrowLeft className="size-3.5" /> Back to projects</Link>
        <div className="mt-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">project workspace / {project.domain}</p>
            {renaming ? (
              <form
                className="mt-4 flex max-w-[800px] flex-wrap items-center gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveTitle();
                }}
              >
                <label className="sr-only" htmlFor="project-title-input">Project title</label>
                <input
                  id="project-title-input"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  autoFocus
                  minLength={3}
                  maxLength={120}
                  className="min-h-12 w-full max-w-[560px] rounded-lg border border-input bg-background/45 px-4 text-2xl leading-tight text-foreground outline-none transition-colors duration-180 ease-spring focus:border-primary/60 sm:text-3xl"
                />
                <button type="submit" disabled={savingTitle} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">
                  {savingTitle ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Save title
                </button>
                <button type="button" onClick={() => { setRenaming(false); setTitleError(""); }} className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:text-foreground active:translate-y-px">Cancel</button>
                {titleError ? <p className="w-full text-xs text-destructive" role="alert">{titleError}</p> : null}
              </form>
            ) : (
              <div className="mt-4 flex flex-wrap items-start gap-x-4 gap-y-3">
                <h1 className="display-type max-w-[800px] text-4xl font-normal leading-[0.98] text-foreground sm:text-6xl">{artifact.projectName}</h1>
                <button type="button" onClick={startRenaming} aria-label="Rename this project" className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 text-xs text-muted-foreground transition-[background-color,border-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground active:translate-y-px">
                  <Pencil className="size-3.5" /> Rename
                </button>
              </div>
            )}
            <p className="mt-5 max-w-[620px] text-base leading-7 text-muted-foreground">The brief is raw material, not an answer. Inspect the behavior chain, challenge weak links, and edit every field in plain language.</p>
            {lineage.parent ? (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <GitFork className="size-3.5 text-accent" aria-hidden="true" />
                <span>{lineage.parent.mode ? `${lineage.parent.mode} fork from` : "Forked from"}</span>
                <Link href={`/app/projects/${lineage.parent.id}`} className="rounded-sm font-medium text-accent hover:text-foreground">
                  {lineage.parent.title}
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/app/projects/${project.id}/explore`}
              className="button-lift inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="size-4" aria-hidden="true" /> Explore directions
            </Link>
            <a
              href="#visual-directions"
              className="button-lift inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background/35 px-4 text-sm font-semibold text-foreground hover:border-accent/45 hover:bg-background/50"
            >
              <Palette className="size-4 text-accent" aria-hidden="true" /> Logo ideas
            </a>
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(true);
                setDeleteError("");
                setDeleteConfirmText("");
              }}
              aria-expanded={confirmingDelete}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-destructive/40 px-3 text-xs font-semibold text-destructive transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-destructive hover:bg-destructive/10 active:translate-y-px"
            >
              <Trash2 className="size-3.5" aria-hidden="true" /> Delete
            </button>
            <span className="rounded-sm border border-primary/35 bg-primary/10 px-3 py-2 tabular-nums text-[0.65rem] uppercase tracking-[0.13em] text-primary">{project.status}</span>
          </div>
        </div>

        {confirmingDelete ? (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/[0.06] p-5" role="alertdialog" aria-labelledby="delete-project-heading">
            <h2 id="delete-project-heading" className="text-sm font-semibold text-foreground">Delete this project?</h2>
            <p className="mt-2 max-w-[560px] text-xs leading-5 text-muted-foreground">This permanently removes the project, its brief, its artifact sections, and its generation history. Forks survive, but they lose their link back to this project. This cannot be undone.</p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block" htmlFor="delete-confirm-input">
                <span className="block text-xs font-medium text-foreground">Type “{artifact.projectName}” to confirm</span>
                <input
                  id="delete-confirm-input"
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  autoComplete="off"
                  className="mt-2 min-h-11 w-full max-w-[360px] rounded-md border border-input bg-background/45 px-3 text-sm text-foreground outline-none transition-colors duration-180 ease-spring focus:border-destructive/60"
                  placeholder="Project title"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void deleteThisProject()}
                  disabled={!deleteConfirmed || deleting}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-destructive px-4 text-sm font-semibold text-foreground transition-[background-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:bg-destructive/85 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" aria-hidden="true" />} {deleting ? "Deleting" : "Delete this project"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:text-foreground active:translate-y-px"
                >
                  Keep it
                </button>
              </div>
            </div>
            {deleteError ? <p className="mt-3 text-xs text-destructive" role="alert">{deleteError}</p> : null}
          </div>
        ) : null}
      </div>

      {lineage.forks.length > 0 ? (
        <section className="panel-quiet rounded-xl p-5 sm:p-6" aria-labelledby="saved-forks-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">saved directions</p>
              <h2 id="saved-forks-heading" className="mt-2 text-lg font-medium text-foreground">Forks from this project</h2>
            </div>
            <span className="tabular-nums text-xs text-muted-foreground">{lineage.forks.length} saved</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lineage.forks.map((fork) => (
              <Link
                key={fork.id}
                href={`/app/projects/${fork.id}`}
                className="group flex min-h-20 items-center justify-between gap-4 rounded-lg border border-border bg-background/30 px-4 py-3 transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-accent/40 hover:bg-background/45"
              >
                <span className="min-w-0">
                  <span className="eyebrow block">{fork.mode}</span>
                  <span className="mt-2 block truncate text-sm font-medium text-foreground">{fork.title}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-180 ease-spring group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <ConceptMap artifact={artifact} />

      <BrandDirections artifact={artifact} domain={project.domain} />

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="panel-quiet rounded-xl p-5 lg:sticky lg:top-8">
          <p className="eyebrow">signal</p>
          <p className="display-type mt-5 text-2xl leading-tight text-foreground">{artifact.northStar.headline}</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{artifact.northStar.summary}</p>
          <div className="mt-7 border-t border-border/70 pt-5"><p className="eyebrow">milestone path</p><div className="mt-4 space-y-3">{artifact.milestones.map((milestone, index) => <div key={milestone.id} className="flex gap-3"><span className="tabular-nums text-[0.65rem] text-accent">0{index + 1}</span><span className="text-xs leading-5 text-muted-foreground">{milestone.name}</span></div>)}</div></div>
          <Link href="/app/new" className="mt-7 flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background/35 text-xs font-semibold text-foreground transition-[background-color,border-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-accent/45"><span>Shape another idea</span><ChevronRight className="size-3.5" /></Link>
        </aside>
        <div className="space-y-4">
          {sectionMeta.map((section) => <SectionCard key={section.key} section={section} value={artifact[section.key]} projectId={project.id} onSaved={handleSaved} />)}
        </div>
      </div>
    </div>
  );
}
