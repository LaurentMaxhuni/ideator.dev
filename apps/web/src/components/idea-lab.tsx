"use client";

import { ArrowRight, Blend, Check, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type IdeaDomain = "software" | "saas" | "developer-tool" | "mobile-app" | "game";

export type IdeaSeed = {
  title: string;
  angle: string;
  initialIdea: string;
  domain: IdeaDomain;
  intendedUsers: string;
  platform: string;
  constraints: string;
  firstTest: string;
  ingredients: [string, string, string];
};

type IdeaLabProps = {
  onUseSeed?: (seed: IdeaSeed) => void;
  anonymous?: boolean;
};

type RecipeStep = 0 | 1 | 2;

const audiences = [
  {
    id: "solo-builders",
    label: "Someone building alone",
    users: "Independent builders with limited time who need to decide what is worth making before they commit a weekend",
    short: "people building alone",
    domain: "developer-tool" as const,
    platform: "Responsive web app",
  },
  {
    id: "small-teams",
    label: "A small product team",
    users: "Small product teams that move quickly but lose decisions and context between conversations",
    short: "small product teams",
    domain: "saas" as const,
    platform: "Responsive web app",
  },
  {
    id: "local-groups",
    label: "A local volunteer group",
    users: "Volunteer-run local groups coordinating useful work with little time, budget, or technical support",
    short: "volunteer groups",
    domain: "mobile-app" as const,
    platform: "Mobile-first web app",
  },
  {
    id: "learners",
    label: "Someone learning by doing",
    users: "People teaching themselves a difficult practical skill outside a formal course",
    short: "people learning by doing",
    domain: "software" as const,
    platform: "Responsive web app",
  },
  {
    id: "caregivers",
    label: "A family caregiver",
    users: "Family caregivers coordinating changing routines, appointments, and small but important observations",
    short: "family caregivers",
    domain: "mobile-app" as const,
    platform: "Private mobile app",
  },
  {
    id: "creative-people",
    label: "An independent creator",
    users: "Independent creative people who collect more fragments and references than they can turn into finished work",
    short: "independent creators",
    domain: "software" as const,
    platform: "Desktop-friendly web app",
  },
] as const;

const situations = [
  {
    id: "plan",
    label: "Plan a week or project",
    direction: "planning a week or project",
    outcome: "turn a loose plan into a clear next action",
  },
  {
    id: "learn",
    label: "Learn and practice a skill",
    direction: "learning and practicing a skill",
    outcome: "turn practice into a clear next attempt",
  },
  {
    id: "make",
    label: "Finish a personal project",
    direction: "finishing a personal project",
    outcome: "move a personal project from idea to a first version",
  },
  {
    id: "together",
    label: "Work with other people",
    direction: "working with other people",
    outcome: "make a shared plan and keep the next contribution clear",
  },
  {
    id: "everyday",
    label: "Keep up with everyday life",
    direction: "keeping up with everyday life",
    outcome: "make everyday responsibilities easier to see and finish",
  },
  {
    id: "create",
    label: "Make and share creative work",
    direction: "making and sharing creative work",
    outcome: "turn scattered ideas into something they can finish and share",
  },
] as const;

const twists = [
  {
    id: "one-action",
    label: "A small focused tool",
    mechanism: "one focused action that produces one useful result",
    constraint: "Keep the first version focused on one action and one result",
  },
  {
    id: "sixty-seconds",
    label: "Useful in one minute",
    mechanism: "an immediate result that becomes more useful with repeated use",
    constraint: "Show the first useful result within one minute",
  },
  {
    id: "offline-first",
    label: "Works without internet",
    mechanism: "a local-first flow that keeps the important action available without a connection",
    constraint: "The important action must work without internet",
  },
  {
    id: "no-dashboard",
    label: "A visual workspace",
    mechanism: "a visual workspace that makes the work easy to see and change",
    constraint: "Center the experience on one thing the user can see and change",
  },
  {
    id: "playful",
    label: "A simple repeatable routine",
    mechanism: "a simple routine that gets easier and more useful with use",
    constraint: "Make the core action easy to repeat without adding rewards or streak pressure",
  },
  {
    id: "weekend",
    label: "Fits in a weekend",
    mechanism: "a deliberately tiny workflow that can be built and tested in one weekend",
    constraint: "The first version must fit into one focused weekend",
  },
] as const;

const angles = [
  {
    id: "instrument",
    label: "Focused tool",
    title: (_audience: (typeof audiences)[number], situation: (typeof situations)[number]) => `A small tool for ${situation.direction}`,
    idea: (audience: (typeof audiences)[number], situation: (typeof situations)[number], twist: (typeof twists)[number]) =>
      `${audience.users} could use a focused product to ${situation.outcome}. Build ${twist.mechanism} that gives them a useful result in one sitting.`,
    test: (audience: (typeof audiences)[number]) => `Give a rough prototype to three ${audience.short} and see whether they can reach the useful result without explanation.`,
  },
  {
    id: "map",
    label: "Visual workspace",
    title: (_audience: (typeof audiences)[number], situation: (typeof situations)[number]) => `A visual workspace for ${situation.direction}`,
    idea: (audience: (typeof audiences)[number], situation: (typeof situations)[number], twist: (typeof twists)[number]) =>
      `Give ${audience.users.toLocaleLowerCase()} a visual way to ${situation.outcome}, using ${twist.mechanism}. They should leave with something they can see, change, or take with them.`,
    test: (audience: (typeof audiences)[number]) => `Show ${audience.short} the map with no onboarding and ask them to point to the next action in under one minute.`,
  },
  {
    id: "ritual",
    label: "Simple routine",
    title: (audience: (typeof audiences)[number], _situation: (typeof situations)[number]) => `A simple routine for ${audience.label.toLocaleLowerCase()}`,
    idea: (audience: (typeof audiences)[number], situation: (typeof situations)[number], twist: (typeof twists)[number]) =>
      `Design a simple routine for ${audience.users.toLocaleLowerCase()} that helps them ${situation.outcome}, shaped around ${twist.mechanism}. It should create a useful result before it asks for more commitment.`,
    test: (audience: (typeof audiences)[number]) => `Ask four ${audience.short} to repeat the ritual three times and check whether the third attempt feels easier and more useful than the first.`,
  },
] as const;

function RecipeOptions({
  options,
  selected,
  onSelect,
}: {
  options: ReadonlyArray<{ id: string; label: string }>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Idea recipe choices">
      {options.map((option) => {
        const active = option.id === selected;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={active}
            className={`flex min-h-14 items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-[background-color,border-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px ${active ? "border-primary/60 bg-primary/[0.09] text-foreground" : "border-border bg-background/30 text-muted-foreground hover:border-accent/45 hover:text-foreground"}`}
          >
            <span>{option.label}</span>
            {active ? <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function previewText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}...` : value;
}

export function IdeaLab({ onUseSeed, anonymous = false }: IdeaLabProps) {
  const router = useRouter();
  const [audienceId, setAudienceId] = useState<(typeof audiences)[number]["id"]>(audiences[0].id);
  const [situationId, setSituationId] = useState<(typeof situations)[number]["id"]>(situations[0].id);
  const [twistId, setTwistId] = useState<(typeof twists)[number]["id"]>(twists[0].id);
  const [activeStep, setActiveStep] = useState<RecipeStep>(0);
  const [rotation, setRotation] = useState(0);

  function useSeedAnonymously(seed: IdeaSeed) {
    try {
      window.sessionStorage.setItem("ideator:pending-seed", JSON.stringify(seed));
    } catch {
      /* storage unavailable; the visitor can still pick a seed after signing up */
    }

    router.push("/signup?next=/app/new");
  }

  function surpriseMe() {
    setAudienceId(audiences[Math.floor(Math.random() * audiences.length)].id);
    setSituationId(situations[Math.floor(Math.random() * situations.length)].id);
    setTwistId(twists[Math.floor(Math.random() * twists.length)].id);
    setActiveStep(0);
    setRotation(Math.floor(Math.random() * angles.length));
  }

  function chooseAudience(id: string) {
    const option = audiences.find((item) => item.id === id);
    if (!option) return;

    setAudienceId(option.id);
    setRotation(0);
  }

  function chooseSituation(id: string) {
    const option = situations.find((item) => item.id === id);
    if (!option) return;

    setSituationId(option.id);
    setRotation(0);
  }

  function chooseTwist(id: string) {
    const option = twists.find((item) => item.id === id);
    if (!option) return;

    setTwistId(option.id);
    setRotation(0);
  }

  function continueRecipe() {
    if (activeStep === 2) {
      document.getElementById("idea-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setActiveStep((current) => (current + 1) as RecipeStep);
  }

  const seeds = useMemo(() => {
    const audience = audiences.find((item) => item.id === audienceId) ?? audiences[0];
    const situation = situations.find((item) => item.id === situationId) ?? situations[0];
    const twist = twists.find((item) => item.id === twistId) ?? twists[0];

    return angles.map((_, index) => angles[(index + rotation) % angles.length]).map((angle) => ({
      title: angle.title(audience, situation),
      angle: angle.label,
      initialIdea: angle.idea(audience, situation, twist),
      domain: audience.domain,
      intendedUsers: audience.users,
      platform: audience.platform,
      constraints: `${twist.constraint}. Avoid a long setup flow.`,
      firstTest: angle.test(audience),
      ingredients: [audience.label, situation.label, twist.label],
    }) satisfies IdeaSeed);
  }, [audienceId, situationId, twistId, rotation]);

  return (
    <section className="panel overflow-hidden rounded-xl" aria-labelledby="idea-lab-heading">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 gap-3">
            <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-md border border-accent/40 bg-accent/10 text-accent">
              <Blend className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 id="idea-lab-heading" className="display-type max-w-[650px] text-3xl font-normal leading-tight text-foreground sm:text-4xl">
                Find an idea by combining three simple choices.
              </h2>
              <p className="mt-4 max-w-[620px] text-sm leading-6 text-muted-foreground">
                Choose who it is for, what it could help with, and what kind of thing to make. You will get three starting ideas immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={surpriseMe}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background/35 px-3 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-accent/45 active:translate-y-px"
          >
            <Shuffle className="size-3.5" aria-hidden="true" /> Surprise me
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-border/80 bg-background/20">
          <div className="border-b border-border/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">Your idea recipe</p>
              <span className="text-xs tabular-nums text-muted-foreground">Step {activeStep + 1} of 3</span>
            </div>

            <ol className="mt-4 flex items-center gap-2 sm:gap-3" aria-label="Idea recipe steps">
              {[
                { label: "Who is it for?", value: audiences.find((item) => item.id === audienceId)?.label ?? "Choose a person or group" },
                { label: "What could it help with?", value: situations.find((item) => item.id === situationId)?.label ?? "Choose an activity" },
                { label: "What kind of thing?", value: twists.find((item) => item.id === twistId)?.label ?? "Choose a format" },
              ].map((step, index) => {
                const stepIndex = index as RecipeStep;
                const active = stepIndex === activeStep;
                const complete = stepIndex < activeStep;

                return (
                  <li key={step.label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveStep(stepIndex)}
                      aria-current={active ? "step" : undefined}
                      className={`flex min-w-0 items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : complete ? "border-primary/50 bg-primary/[0.1] text-primary" : "border-border bg-background/40"}`}>
                        {complete ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                      </span>
                      <span className="hidden min-w-0 sm:block">
                        <span className="block truncate text-xs font-semibold">{step.label}</span>
                        <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">{step.value}</span>
                      </span>
                    </button>
                    {index < 2 ? <span className="h-px min-w-3 flex-1 bg-border/80" aria-hidden="true" /> : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="p-4 sm:p-6">
            {activeStep === 0 ? (
              <div>
                <h3 className="text-base font-semibold text-foreground">Who is it for?</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Pick a person or group you would like to help.</p>
                <div className="mt-4">
                  <RecipeOptions options={audiences} selected={audienceId} onSelect={chooseAudience} />
                </div>
              </div>
            ) : null}

            {activeStep === 1 ? (
              <div>
                <h3 className="text-base font-semibold text-foreground">What could it help with?</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Pick something they might want to do, make, learn, or organize.</p>
                <div className="mt-4">
                  <RecipeOptions options={situations} selected={situationId} onSelect={chooseSituation} />
                </div>
              </div>
            ) : null}

            {activeStep === 2 ? (
              <div>
                <h3 className="text-base font-semibold text-foreground">What kind of thing should it be?</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Choose a form that sounds fun or realistic to make.</p>
                <div className="mt-4">
                  <RecipeOptions options={twists} selected={twistId} onSelect={chooseTwist} />
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <button
                type="button"
                onClick={() => setActiveStep((current) => (current === 0 ? 0 : (current - 1) as RecipeStep))}
                disabled={activeStep === 0}
                className="inline-flex min-h-10 items-center rounded-md border border-border bg-background/30 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/45 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={continueRecipe}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-[background-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-px"
              >
                {activeStep === 2 ? "See my ideas" : activeStep === 0 ? "Next: choose an activity" : "Next: choose a format"}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <p><span className="font-semibold text-accent">Local and instant.</span> Change any choice or let the lab surprise you.</p>
          {anonymous ? <p>The lab is free to explore; sign in only when you want to save an idea.</p> : <p>Nothing is saved until you choose an idea.</p>}
        </div>
      </div>

      <div id="idea-results" className="scroll-mt-6 border-t border-border/70 bg-background/20 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium tracking-[-0.03em] text-foreground">Three starting ideas</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Start with the one that makes you curious. You can edit the full brief next.</p>
            {anonymous ? <p className="mt-1 text-xs text-muted-foreground">Sign in when you are ready to save an idea.</p> : null}
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">3 options / editable</span>
        </div>

        <div className="mt-6 grid overflow-hidden rounded-lg border border-border/80 bg-background/15 lg:grid-cols-3">
          {seeds.map((seed, index) => (
            <article key={`${seed.angle}-${seed.title}`} className="group flex min-w-0 flex-col border-b border-border/80 p-5 transition-[background-color,transform] duration-200 ease-spring hover:-translate-y-0.5 hover:bg-card/50 last:border-b-0 lg:min-h-[25rem] lg:border-b-0 lg:border-r lg:last:border-r-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tabular-nums text-accent">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-xs text-muted-foreground">{seed.angle}</span>
              </div>
              <h4 className="mt-4 text-xl font-medium leading-tight tracking-[-0.03em] text-foreground">{seed.title}</h4>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {seed.ingredients.map((ingredient) => <span key={ingredient} className="rounded-sm border border-border bg-background/35 px-2 py-1 text-[0.65rem] text-muted-foreground">{ingredient}</span>)}
              </div>
              <p className="mt-5 text-sm leading-6 text-foreground/90">{previewText(seed.initialIdea, 220)}</p>
              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="text-xs font-semibold text-primary">First test</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{previewText(seed.firstTest, 150)}</p>
              </div>
              <button
                type="button"
                onClick={() => (anonymous ? useSeedAnonymously(seed) : onUseSeed?.(seed))}
                className="button-lift mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {anonymous ? "Save this idea" : "Use this idea"} <ArrowRight className="size-4 transition-transform duration-180 ease-spring group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
