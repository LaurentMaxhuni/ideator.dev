"use client";

import { ArrowRight, Blend, Check, Shuffle } from "lucide-react";
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
  onUseSeed: (seed: IdeaSeed) => void;
};

const audiences = [
  {
    id: "solo-builders",
    label: "Solo builders",
    users: "Independent builders with limited time who need to decide what is worth making before they commit a weekend",
    short: "solo builders",
    domain: "developer-tool" as const,
    platform: "Responsive web app",
  },
  {
    id: "small-teams",
    label: "Small teams",
    users: "Small product teams that move quickly but lose decisions and context between conversations",
    short: "small product teams",
    domain: "saas" as const,
    platform: "Responsive web app",
  },
  {
    id: "local-groups",
    label: "Local groups",
    users: "Volunteer-run local groups coordinating useful work with little time, budget, or technical support",
    short: "volunteer groups",
    domain: "mobile-app" as const,
    platform: "Mobile-first web app",
  },
  {
    id: "learners",
    label: "Active learners",
    users: "People teaching themselves a difficult practical skill outside a formal course",
    short: "self-directed learners",
    domain: "software" as const,
    platform: "Responsive web app",
  },
  {
    id: "caregivers",
    label: "Caregivers",
    users: "Family caregivers coordinating changing routines, appointments, and small but important observations",
    short: "family caregivers",
    domain: "mobile-app" as const,
    platform: "Private mobile app",
  },
  {
    id: "creative-people",
    label: "Creative people",
    users: "Independent creative people who collect more fragments and references than they can turn into finished work",
    short: "independent creators",
    domain: "software" as const,
    platform: "Desktop-friendly web app",
  },
] as const;

const frictions = [
  {
    id: "lost-context",
    label: "Context gets lost",
    titleSubject: "lost context",
    problem: "reconstruct what happened, why it mattered, and what should happen next every time they return to the work",
    outcome: "compress scattered context into one useful artifact that is easy to resume",
  },
  {
    id: "invisible-progress",
    label: "Progress is invisible",
    titleSubject: "invisible progress",
    problem: "do meaningful work without being able to see momentum until a large outcome is finished",
    outcome: "turn small signs of progress into a visible path without adding busywork",
  },
  {
    id: "setup-tax",
    label: "Setup blocks action",
    titleSubject: "setup friction",
    problem: "abandon useful tools because organizing the system takes longer than getting the first result",
    outcome: "start with the real task and let structure emerge from use",
  },
  {
    id: "decisions-drift",
    label: "Decisions drift",
    titleSubject: "drifting decisions",
    problem: "leave conversations with different interpretations of what changed and who owns the next move",
    outcome: "make the decision and its consequence visible while the conversation is still fresh",
  },
  {
    id: "attention-fragments",
    label: "Attention fragments",
    titleSubject: "fragmented attention",
    problem: "lose focused time to small interruptions that arrive without urgency or a good moment to handle them",
    outcome: "route small demands into a calm, deliberate rhythm",
  },
  {
    id: "access-breaks",
    label: "Access breaks",
    titleSubject: "unreliable access",
    problem: "need a useful tool precisely when connectivity, accounts, or integrations are unavailable",
    outcome: "keep the core action usable under weak or absent infrastructure",
  },
] as const;

const twists = [
  {
    id: "one-action",
    label: "One core action",
    mechanism: "one repeatable action that produces one visible result",
    constraint: "Organize the entire product around one core action",
  },
  {
    id: "sixty-seconds",
    label: "Value in 60 seconds",
    mechanism: "an immediate result that becomes more useful with repeated use",
    constraint: "Show the first useful result within 60 seconds",
  },
  {
    id: "offline-first",
    label: "Offline first",
    mechanism: "a local-first flow that synchronizes only when it has to",
    constraint: "The essential workflow must work without a live connection",
  },
  {
    id: "no-dashboard",
    label: "No dashboard",
    mechanism: "one changing object instead of a collection of charts and menus",
    constraint: "Do not use a dashboard; center the experience on one evolving artifact",
  },
  {
    id: "playful",
    label: "Make it playful",
    mechanism: "a small ritual with tactile feedback, curiosity, and no points economy",
    constraint: "Use playfulness to clarify progress, not to add rewards or streak pressure",
  },
  {
    id: "weekend",
    label: "Weekend-sized",
    mechanism: "a deliberately tiny workflow that can be built and tested in two focused days",
    constraint: "The first credible version must fit into a focused weekend build",
  },
] as const;

const angles = [
  {
    id: "instrument",
    label: "Practical instrument",
    title: (_audience: (typeof audiences)[number], friction: (typeof frictions)[number]) => `A practical tool for ${friction.titleSubject}`,
    idea: (audience: (typeof audiences)[number], friction: (typeof frictions)[number], twist: (typeof twists)[number]) =>
      `${audience.users} often ${friction.problem}. Build a focused tool that helps them ${friction.outcome} through ${twist.mechanism}. Keep the first version centered on a real task, not content about the task.`,
    test: (audience: (typeof audiences)[number]) => `Give a rough prototype to three ${audience.short} and see whether they can reach the useful result without explanation.`,
  },
  {
    id: "map",
    label: "Visual map",
    title: (_audience: (typeof audiences)[number], friction: (typeof frictions)[number]) => `A visual map for ${friction.titleSubject}`,
    idea: (audience: (typeof audiences)[number], friction: (typeof frictions)[number], twist: (typeof twists)[number]) =>
      `${audience.users} often ${friction.problem}. Build a visual workspace that makes the hidden shape of this problem manipulable, using ${twist.mechanism}. The user should leave with a changed map or object, not a generated essay.`,
    test: (audience: (typeof audiences)[number]) => `Show ${audience.short} the map with no onboarding and ask them to point to the next action in under one minute.`,
  },
  {
    id: "ritual",
    label: "Behavioral ritual",
    title: (audience: (typeof audiences)[number], _friction: (typeof frictions)[number]) => `A recurring ritual for ${audience.label.toLocaleLowerCase()}`,
    idea: (audience: (typeof audiences)[number], friction: (typeof frictions)[number], twist: (typeof twists)[number]) =>
      `${audience.users} often ${friction.problem}. Build a lightweight recurring ritual that helps them ${friction.outcome}, shaped around ${twist.mechanism}. The product should create a useful behavior even if the user never reads a long explanation.`,
    test: (audience: (typeof audiences)[number]) => `Ask four ${audience.short} to repeat the ritual three times and check whether the third attempt feels easier and more useful than the first.`,
  },
] as const;

function ChoiceDeck({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-muted-foreground">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === selected;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={active}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-[background-color,border-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px ${active ? "border-primary/55 bg-primary/[0.09] text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-accent/45 hover:text-foreground"}`}
            >
              {active ? <Check className="size-3.5" aria-hidden="true" /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function IdeaLab({ onUseSeed }: IdeaLabProps) {
  const [audienceId, setAudienceId] = useState(audiences[0].id);
  const [frictionId, setFrictionId] = useState(frictions[0].id);
  const [twistId, setTwistId] = useState(twists[0].id);
  const [rotation, setRotation] = useState(0);

  const seeds = useMemo(() => {
    const audience = audiences.find((item) => item.id === audienceId) ?? audiences[0];
    const friction = frictions.find((item) => item.id === frictionId) ?? frictions[0];
    const twist = twists.find((item) => item.id === twistId) ?? twists[0];

    return angles.map((_, index) => angles[(index + rotation) % angles.length]).map((angle) => ({
      title: angle.title(audience, friction),
      angle: angle.label,
      initialIdea: angle.idea(audience, friction, twist),
      domain: audience.domain,
      intendedUsers: audience.users,
      platform: audience.platform,
      constraints: `${twist.constraint}. Avoid a long setup flow.`,
      firstTest: angle.test(audience),
      ingredients: [audience.label, friction.label, twist.label],
    }) satisfies IdeaSeed);
  }, [audienceId, frictionId, twistId, rotation]);

  return (
    <section className="panel overflow-hidden rounded-xl" aria-labelledby="idea-lab-heading">
      <div className="border-b border-border/70 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Blend className="size-4" aria-hidden="true" />
              <p className="eyebrow">idea lab / combine signals</p>
            </div>
            <h2 id="idea-lab-heading" className="display-type mt-4 max-w-[650px] text-3xl font-normal leading-tight text-foreground sm:text-4xl">
              Start with a person and a tension, not a prompt.
            </h2>
            <p className="mt-4 max-w-[620px] text-sm leading-6 text-muted-foreground">
              Pick three ingredients. The lab assembles distinct product shapes locally, so exploring does not spend an AI action.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRotation((current) => (current + 1) % angles.length)}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background/35 px-3 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-accent/45 active:translate-y-px"
          >
            <Shuffle className="size-3.5" aria-hidden="true" /> Rotate angles
          </button>
        </div>

        <div className="mt-8 grid gap-6">
          <ChoiceDeck label="01 / who do you notice?" options={audiences} selected={audienceId} onSelect={(id) => { setAudienceId(id as typeof audienceId); setRotation(0); }} />
          <ChoiceDeck label="02 / what keeps happening?" options={frictions} selected={frictionId} onSelect={(id) => { setFrictionId(id as typeof frictionId); setRotation(0); }} />
          <ChoiceDeck label="03 / what sharpens the idea?" options={twists} selected={twistId} onSelect={(id) => { setTwistId(id as typeof twistId); setRotation(0); }} />
        </div>
      </div>

      <div className="bg-background/20 p-5 sm:p-8 lg:p-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted-foreground">three product shapes</p>
            <p className="mt-2 text-sm text-foreground">Choose one to make it yours in the full brief.</p>
          </div>
          <span className="hidden tabular-nums text-[0.65rem] text-muted-foreground sm:block">local / instant / editable</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {seeds.map((seed, index) => (
            <article key={`${seed.angle}-${seed.title}`} className={`group rounded-xl border border-border/80 bg-card/70 p-5 transition-[background-color,border-color,transform] duration-200 ease-spring hover:-translate-y-1 hover:border-accent/40 ${index === 0 ? "lg:col-span-2 lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-8" : ""}`}>
              <div>
                <p className="eyebrow text-accent">{String(index + 1).padStart(2, "0")} / {seed.angle}</p>
                <h3 className="display-type mt-4 text-2xl leading-tight text-foreground">{seed.title}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {seed.ingredients.map((ingredient) => <span key={ingredient} className="rounded-sm border border-border bg-background/35 px-2 py-1 text-[0.62rem] text-muted-foreground">{ingredient}</span>)}
                </div>
              </div>
              <div className={index === 0 ? "mt-5 lg:mt-0" : "mt-5"}>
                <p className="text-sm leading-6 text-foreground/90">{seed.initialIdea}</p>
                <div className="mt-5 rounded-lg border border-primary/25 bg-primary/[0.06] p-3.5">
                  <p className="eyebrow text-primary">first reality check</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{seed.firstTest}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUseSeed(seed)}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-px"
                >
                  Use this seed <ArrowRight className="size-4 transition-transform duration-180 ease-spring group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
