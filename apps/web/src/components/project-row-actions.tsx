"use client";

import { LoaderCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function ProjectRowActions({ projectId, title }: { projectId: string; title: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"closed" | "menu" | "rename" | "delete">("closed");
  const [titleDraft, setTitleDraft] = useState(title);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "closed") {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMode("closed");
        setDeleteArmed(false);
        setError("");
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMode("closed");
        setDeleteArmed(false);
        setError("");
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mode]);

  function closePanel() {
    setMode("closed");
    setDeleteArmed(false);
    setError("");
  }

  async function saveRename() {
    const nextTitle = titleDraft.trim();

    if (nextTitle.length < 3 || nextTitle.length > 120) {
      setError("Titles are 3–120 characters.");
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "We could not rename that project.");
      }

      closePanel();
      router.refresh();
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : "We could not rename that project.");
    } finally {
      setPending(false);
    }
  }

  async function removeProject() {
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "We could not delete that project.");
      }

      try {
        const prefix = `ideator:section-draft:${projectId}:`;

        for (const key of Object.keys(window.sessionStorage)) {
          if (key.startsWith(prefix)) {
            window.sessionStorage.removeItem(key);
          }
        }
      } catch {
        /* ignore */
      }

      closePanel();
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "We could not delete that project.");
      setPending(false);
    }
  }

  return (
    <div ref={containerRef} className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
      <button
        type="button"
        onClick={() => (mode === "closed" ? setMode("menu") : closePanel())}
        aria-haspopup="menu"
        aria-expanded={mode !== "closed"}
        aria-controls={mode === "menu" ? `project-actions-menu-${projectId}` : undefined}
        aria-label={`Actions for ${title}`}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[background-color,color,transform] duration-180 ease-spring hover:bg-background/60 hover:text-foreground active:translate-y-px"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>

      {mode === "menu" ? (
        <div id={`project-actions-menu-${projectId}`} role="menu" aria-label={`Actions for ${title}`} className="absolute right-0 top-12 w-60 rounded-xl border border-border bg-popover p-2 shadow-[0_16px_36px_rgb(4_18_24/0.25)]">
          <button
            type="button"
            onClick={() => {
              setTitleDraft(title);
              setMode("rename");
              setError("");
            }}
            role="menuitem"
            className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-foreground transition-colors duration-180 ease-spring hover:bg-background/50"
          >
            <Pencil className="size-3.5 text-muted-foreground" aria-hidden="true" /> Rename
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteArmed(false);
              setMode("delete");
              setError("");
            }}
            role="menuitem"
            className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-destructive transition-colors duration-180 ease-spring hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" aria-hidden="true" /> Delete
          </button>
        </div>
      ) : null}

      {mode === "rename" ? (
        <form
          className="absolute right-0 top-12 w-72 rounded-xl border border-border bg-popover p-3 shadow-[0_16px_36px_rgb(4_18_24/0.25)]"
          onSubmit={(event) => {
            event.preventDefault();
            void saveRename();
          }}
        >
          <label htmlFor={`rename-${projectId}`} className="block text-xs font-medium text-foreground">
            Project title
          </label>
          <input
            id={`rename-${projectId}`}
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            autoFocus
            minLength={3}
            maxLength={120}
            className="mt-2 min-h-11 w-full rounded-md border border-input bg-background/45 px-3 text-sm text-foreground outline-none transition-colors duration-180 ease-spring focus:border-primary/60"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button type="button" onClick={closePanel} className="inline-flex min-h-10 items-center rounded-md px-3 text-xs text-muted-foreground transition-colors duration-180 ease-spring hover:text-foreground">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">
              {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : null} Save
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-destructive" role="alert">{error}</p> : null}
        </form>
      ) : null}

      {mode === "delete" ? (
        <div className="absolute right-0 top-12 w-72 rounded-xl border border-destructive/40 bg-popover p-3 shadow-[0_16px_36px_rgb(4_18_24/0.25)]">
          <p className="text-xs leading-5 text-foreground">
            {deleteArmed ? "This permanently removes the project, its brief, and its artifacts. Click again to confirm." : `Delete “${title}”? This cannot be undone.`}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button type="button" onClick={closePanel} className="inline-flex min-h-10 items-center rounded-md px-3 text-xs text-muted-foreground transition-colors duration-180 ease-spring hover:text-foreground">
              Keep it
            </button>
            <button
              type="button"
              onClick={() => void removeProject()}
              disabled={pending}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-semibold transition-colors duration-180 ease-spring disabled:cursor-wait disabled:opacity-60 ${deleteArmed ? "bg-destructive text-foreground hover:bg-destructive/85" : "border border-destructive/40 text-destructive hover:bg-destructive/10"}`}
            >
              {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : null} {deleteArmed ? "Confirm delete" : "Delete"}
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-destructive" role="alert">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
