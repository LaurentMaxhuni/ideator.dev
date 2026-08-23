"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlaskConical,
  Gauge,
  LoaderCircle,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  playgroundConstraints,
  type DirectionPreview,
  type ExplorationInput,
  type ForkMode,
  type IdeaArtifact,
  type PlaygroundConstraintId,
} from "@ideator.dev/ai";

type ExplorationSnapshot = {
  runId: string;
  input: ExplorationInput;
  directions: DirectionPreview[];
  completedAt: string;
};

type OriginalDirection = Omit<DirectionPreview, "mode">;

const modeMeta: Record<
  ForkMode,
  { label: string; index: string; description: string; icon: typeof ShieldCheck }
> = {
  safer: {
    label: "Safer",
    index: "01",
    description: "Smallest credible version, minimal risk.",
    icon: ShieldCheck,
  },
  bolder: {
    label: "Bolder",
    index: "02",
    description: "Sharper promise, stronger point of view.",
    icon: Sparkles,
  },
  stranger: {
    label: "Stranger",
    index: "03",
    description: "Unexpected, useful, and still buildable.",
    icon: Orbit,
  },
};

function originalDirection(artifact: IdeaArtifact): OriginalDirection {
  return {
    projectName: artifact.projectName,
    headline: artifact.northStar.headline,
    thesis: artifact.northStar.summary,
    primaryUser: artifact.whoItsFor.primaryUser,
    wedge: artifact.whyItMatters,
    mvpMoves: artifact.mvpScope.include.slice(0, 5),
    experienceHook: artifact.experience.direction,
    biggestRisk: artifact.technicalBlueprint.risks[0] ?? "The core assumption still needs a direct test.",
    firstTest: artifact.immediateNextStep.action,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm leading-6 text-foreground/90">{children}</div>
    </div>
  );
}

function DirectionCard({
  direction,
  original,
  disabled,
  saving,
  onChoose,
}: {
  direction: DirectionPreview | OriginalDirection;
  original?: boolean;
  disabled?: boolean;
  saving?: boolean;
  onChoose?: () => void;
}) {
  const mode = "mode" in direction ? direction.mode : null;
  const meta = mode ? modeMeta[mode] : null;
  const Icon = meta?.icon ?? FlaskConical;

  return (
    <article
      className={`flex min-w-0 flex-col rounded-xl border p-5 sm:p-6 ${
        original
          ? "border-border bg-background/35"
          : "border-accent/30 bg-card shadow-[0_18px_42px_color-mix(in_srgb,var(--background)_45%,transparent)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-md border ${original ? "border-border bg-muted/30 text-muted-foreground" : "border-accent/30 bg-accent/10 text-accent"}`}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">{original ? "00 / baseline" : `${meta?.index} / ${meta?.label}`}</p>
            <h3 className="mt-2 break-words text-xl font-medium tracking-[-0.04em] text-foreground">
              {direction.projectName}
            </h3>
          </div>
        </div>
        <span className={`shrink-0 rounded-sm border px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] ${original ? "border-border text-muted-foreground" : "border-primary/35 bg-primary/10 text-primary"}`}>
          {original ? "original" : meta?.label}
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-6">
        <div>
          <p className="display-type text-2xl leading-tight text-foreground">{direction.headline}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{direction.thesis}</p>
        </div>
        <Field label="primary user">{direction.primaryUser}</Field>
        <Field label="wedge">{direction.wedge}</Field>
        <Field label="MVP moves">
          <ol className="space-y-2">
            {direction.mvpMoves.map((move, index) => (
              <li key={`${index}-${move}`} className="flex gap-3">
                <span className="mt-0.5 tabular-nums text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
                <span>{move}</span>
              </li>
            ))}
          </ol>
        </Field>
        <Field label="experience hook">{direction.experienceHook}</Field>
        <Field label="biggest risk">{direction.biggestRisk}</Field>
        <Field label="first test">{direction.firstTest}</Field>
      </div>

      {onChoose ? (
        <button
          type="button"
          onClick={onChoose}
          disabled={disabled}
          className="button-lift mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Expanding {meta?.label}
            </>
          ) : (
            <>
              Build this direction <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      ) : (
        <div className="mt-7 flex min-h-11 items-center justify-center rounded-md border border-border bg-background/25 px-4 text-xs font-medium text-muted-foreground">
          Your current direction
        </div>
      )}
    </article>
  );
}

export function ExplorationClient({
  projectId,
  artifact,
  initialExploration,
}: {
  projectId: string;
  artifact: IdeaArtifact;
  initialExploration: ExplorationSnapshot | null;
}) {
  const router = useRouter();
  const comparisonHeadingRef = useRef<HTMLHeadingElement>(null);
  const [selected, setSelected] = useState<PlaygroundConstraintId[]>(
    initialExploration?.input.constraintIds ?? [],
  );
  const [customConstraint, setCustomConstraint] = useState(
    initialExploration?.input.customConstraint ?? "",
  );
  const [exploration, setExploration] = useState(initialExploration);
  const [generating, setGenerating] = useState(false);
  const [savingMode, setSavingMode] = useState<ForkMode | null>(null);
  const [error, setError] = useState("");
  const original = originalDirection(artifact);
  const atMaximum = selected.length === 2;

  function toggleConstraint(id: PlaygroundConstraintId) {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((constraintId) => constraintId !== id);
      }

      return current.length < 2 ? [...current, id] : current;
    });
  }

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/explorations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constraintIds: selected, customConstraint }),
      });
      const payload = (await response.json()) as {
        error?: string;
        exploration?: ExplorationSnapshot;
      };

      if (!response.ok || !payload.exploration) {
        throw new Error(payload.error || "The directions could not be generated.");
      }

      setExploration(payload.exploration);
      requestAnimationFrame(() => comparisonHeadingRef.current?.focus());
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "The directions could not be generated.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function chooseDirection(mode: ForkMode) {
    if (!exploration) {
      return;
    }

    setSavingMode(mode);
    setError("");

    try {
      const response = await fetch(
        `/api/projects/${projectId}/explorations/${exploration.runId}/fork`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        },
      );
      const payload = (await response.json()) as {
        error?: string;
        project?: { id: string };
      };

      if (!response.ok || !payload.project) {
        throw new Error(payload.error || "That direction could not be saved.");
      }

      router.push(`/app/projects/${payload.project.id}`);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "That direction could not be saved.",
      );
      setSavingMode(null);
    }
  }

  return (
    <div className="space-y-12">
      <header>
        <Link
          href={`/app/projects/${projectId}`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-sm text-xs text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-x-1 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to workspace
        </Link>
        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="eyebrow">idea playground / multiverse</p>
            <h1 className="display-type mt-4 max-w-[850px] text-4xl font-normal leading-[0.98] text-foreground sm:text-6xl">
              Push {artifact.projectName} sideways.
            </h1>
            <p className="mt-5 max-w-[690px] text-base leading-7 text-muted-foreground">
              Add a little pressure, then compare the current brief with three buildable futures.
            </p>
          </div>
          <div className="panel-quiet rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Gauge className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="eyebrow">playground allowance</p>
                <p className="mt-1 text-sm text-foreground">6 AI actions per hour</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Generating directions and expanding a chosen fork share the same allowance.
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={generate} className="panel rounded-xl p-5 sm:p-7" aria-busy={generating}>
        <fieldset disabled={generating || Boolean(savingMode)}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <legend className="text-xl font-medium tracking-[-0.04em] text-foreground">
                Constraint deck
              </legend>
              <p id="constraint-limit" className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose up to two cards. Zero is valid if you want a clean reroll.
              </p>
            </div>
            <span className={`rounded-sm border px-2.5 py-1.5 tabular-nums text-xs ${atMaximum ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
              {selected.length} / 2 selected
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {playgroundConstraints.map((constraint, index) => {
              const isSelected = selected.includes(constraint.id);
              const selectionDisabled = atMaximum && !isSelected;

              return (
                <button
                  key={constraint.id}
                  type="button"
                  onClick={() => toggleConstraint(constraint.id)}
                  disabled={selectionDisabled || generating || Boolean(savingMode)}
                  aria-pressed={isSelected}
                  aria-describedby="constraint-limit constraint-max-note"
                  className={`group min-h-40 rounded-lg border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ease-spring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45 ${
                    isSelected
                      ? "border-primary/55 bg-primary/[0.09] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                      : "border-border bg-background/30 hover:-translate-y-1 hover:border-accent/40 hover:bg-background/45"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="tabular-nums text-[0.65rem] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`grid size-6 place-items-center rounded-sm border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"}`}>
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="mt-5 block text-sm font-semibold text-foreground">
                    {constraint.label}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    {constraint.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p id="constraint-max-note" className="mt-3 min-h-5 text-xs text-muted-foreground" aria-live="polite">
            {atMaximum
              ? "Two-card maximum reached. Remove one selected card to choose another."
              : "Each card changes all three directions."}
          </p>

          <div className="mt-7 grid gap-4 border-t border-border/70 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="block">
              <span className="flex items-center justify-between gap-4 text-sm font-medium text-foreground">
                Optional custom constraint
                <span className="tabular-nums text-xs font-normal text-muted-foreground">
                  {customConstraint.length} / 240
                </span>
              </span>
              <textarea
                value={customConstraint}
                onChange={(event) => setCustomConstraint(event.target.value)}
                maxLength={240}
                rows={2}
                className="mt-3 w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                placeholder="e.g. It must work for a user wearing gloves"
              />
            </label>
            <button
              type="submit"
              disabled={generating || Boolean(savingMode)}
              className="button-lift inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"
            >
              {generating ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Exploring directions
                </>
              ) : (
                <>
                  {exploration ? "Regenerate directions" : "Explore directions"}
                  <Sparkles className="size-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </fieldset>
      </form>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {generating
          ? "Generating safer, bolder, and stranger directions."
          : savingMode
            ? `Expanding the ${savingMode} direction into a complete brief and saving it.`
            : error || (exploration ? "Directions ready for comparison." : "Choose constraints to begin.")}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-foreground" role="alert">
          {error}
        </div>
      ) : null}

      {savingMode ? (
        <section className="panel rounded-xl p-5 sm:p-6" aria-label="Expansion progress">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-md border border-primary/35 bg-primary/10 text-primary">
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">expanding / {savingMode}</p>
                <p className="mt-2 text-sm text-foreground">
                  Turning the preview into eight complete brief sections.
                </p>
              </div>
            </div>
            <ol className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <li className="rounded-sm border border-primary/35 bg-primary/10 px-2.5 py-1.5 text-primary">01 expand</li>
              <li className="rounded-sm border border-border px-2.5 py-1.5">02 validate</li>
              <li className="rounded-sm border border-border px-2.5 py-1.5">03 save atomically</li>
            </ol>
          </div>
        </section>
      ) : null}

      {exploration ? (
        <section aria-busy={generating}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <p className="eyebrow">four-way comparison</p>
              <h2
                ref={comparisonHeadingRef}
                tabIndex={-1}
                className="mt-3 rounded-sm text-2xl font-medium tracking-[-0.04em] text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                One idea, four trajectories
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {generating
                ? "Keeping these results visible until the new set is ready…"
                : `Generated ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(exploration.completedAt))}`}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <DirectionCard direction={original} original />
            {(["safer", "bolder", "stranger"] as const).map((mode) => {
              const direction = exploration.directions.find((item) => item.mode === mode);

              return direction ? (
                <DirectionCard
                  key={mode}
                  direction={direction}
                  disabled={generating || Boolean(savingMode)}
                  saving={savingMode === mode}
                  onChoose={() => chooseDirection(mode)}
                />
              ) : null;
            })}
          </div>
        </section>
      ) : generating ? (
        <section className="panel rounded-xl px-6 py-14 text-center" aria-label="Generating directions">
          <LoaderCircle className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
          <h2 className="display-type mt-5 text-2xl text-foreground">Opening three useful futures.</h2>
          <p className="mx-auto mt-3 max-w-[500px] text-sm leading-6 text-muted-foreground">
            The first comparison will appear here. Nothing is saved until you choose a direction.
          </p>
        </section>
      ) : (
        <section className="panel-quiet rounded-xl px-6 py-14 text-center">
          <FlaskConical className="mx-auto size-6 text-accent" aria-hidden="true" />
          <h2 className="display-type mt-5 text-2xl text-foreground">The multiverse is still folded.</h2>
          <p className="mx-auto mt-3 max-w-[500px] text-sm leading-6 text-muted-foreground">
            Pick up to two constraints—or none—then generate the first comparison.
          </p>
        </section>
      )}
    </div>
  );
}
