"use client";

import { ArrowLeft, ArrowRight, CircleHelp, Lightbulb, LoaderCircle, PencilLine } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { IdeaLab, type IdeaSeed } from "@/components/idea-lab";

const domains = [
  { value: "software", label: "Software" },
  { value: "saas", label: "SaaS" },
  { value: "developer-tool", label: "Developer tool" },
  { value: "mobile-app", label: "Mobile app" },
  { value: "game", label: "Game" },
] as const;

const ambitions = [
  { value: "weekend", label: "Weekend experiment", hint: "A narrow proof or playable slice" },
  { value: "small-product", label: "Small product", hint: "A focused v1 for real users" },
  { value: "serious-build", label: "Serious build", hint: "A product with a durable core" },
  { value: "studio-scale", label: "Studio scale", hint: "A larger bet with staged risk" },
] as const;

type BriefFormState = {
  initialIdea: string;
  domain: (typeof domains)[number]["value"];
  intendedUsers: string;
  ambition: (typeof ambitions)[number]["value"];
  platform: string;
  constraints: string;
  nonGoals: string;
};

const initialState: BriefFormState = {
  initialIdea: "",
  domain: "software",
  intendedUsers: "",
  ambition: "small-product",
  platform: "",
  constraints: "",
  nonGoals: "",
};

export function BriefForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<BriefFormState>(initialState);
  const [path, setPath] = useState<"shape" | "discover">("discover");
  const [loadedSeed, setLoadedSeed] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);
  const answeredCount = 1 + [form.initialIdea, form.intendedUsers, form.platform, form.constraints, form.nonGoals].filter((value) => value.trim().length > 0).length;

  function update<K extends keyof BriefFormState>(key: K, value: BriefFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function useSeed(seed: IdeaSeed) {
    setForm((current) => ({
      ...current,
      initialIdea: seed.initialIdea,
      domain: seed.domain,
      intendedUsers: seed.intendedUsers,
      platform: seed.platform,
      constraints: seed.constraints,
    }));
    setLoadedSeed(seed.title);
    setPath("shape");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setStage(1);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { project?: { project?: { id?: string } }; error?: string };

      if (!response.ok || !payload.project?.project?.id) {
        throw new Error(payload.error || "We could not generate the project brief.");
      }

      setStage(3);
      router.push(`/app/projects/${payload.project.project.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not generate the project brief.");
      setStage(0);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
      <div className="lg:sticky lg:top-10 lg:self-start">
        <Link href="/app" className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-x-1 hover:text-foreground"><ArrowLeft className="size-3.5" /> Back to projects</Link>
        <p className="eyebrow mt-14">new project / choose a starting point</p>
        <h1 className="display-type mt-5 max-w-[500px] text-4xl font-normal leading-[0.98] text-foreground sm:text-6xl">Find a useful idea, then give it shape.</h1>
        <p className="mt-6 max-w-[430px] text-base leading-7 text-muted-foreground">Begin with a rough spark or combine real-world signals in the idea lab. Nothing needs to sound polished.</p>

        <div className="mt-8 grid gap-2 rounded-xl border border-border/70 bg-background/25 p-2">
          <button type="button" onClick={() => setPath("discover")} aria-pressed={path === "discover"} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-sm transition-[background-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 active:translate-y-px ${path === "discover" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background/45 hover:text-foreground"}`}><Lightbulb className="size-4 shrink-0" aria-hidden="true" /><span><span className="block font-semibold">Help me find an idea</span><span className={`mt-0.5 block text-xs ${path === "discover" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Mix a person, tension, and constraint</span></span></button>
          <button type="button" onClick={() => setPath("shape")} aria-pressed={path === "shape"} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-sm transition-[background-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 active:translate-y-px ${path === "shape" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background/45 hover:text-foreground"}`}><PencilLine className="size-4 shrink-0" aria-hidden="true" /><span><span className="block font-semibold">I have a spark</span><span className={`mt-0.5 block text-xs ${path === "shape" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Write it down and make it concrete</span></span></button>
        </div>

        <div className="mt-10 hidden border-t border-border/70 pt-5 text-xs text-muted-foreground lg:block">
          <div className="flex items-center justify-between"><span>Fields answered</span><span className="tabular-nums text-accent">{answeredCount}/6</span></div>
          <div className="mt-3 h-1 overflow-hidden bg-secondary"><div className="h-full bg-primary transition-[width] duration-500 ease-spring" style={{ width: `${Math.round((answeredCount / 6) * 100)}%` }} /></div>
        </div>
      </div>

      {path === "discover" ? <IdeaLab onUseSeed={useSeed} /> : <form ref={formRef} onSubmit={handleSubmit} className="panel rounded-xl p-5 sm:p-8 lg:p-10 scroll-mt-8">
        <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-6">
          <div><p className="eyebrow">the raw material</p><h2 className="display-type mt-3 text-2xl font-normal text-foreground">What are you shaping?</h2>{loadedSeed ? <p className="mt-2 text-xs text-primary">Seed loaded from {loadedSeed}. Every field is yours to change.</p> : null}</div>
        </div>

        <div className="space-y-8 pt-8">
          <label className="block">
            <span className="flex items-center justify-between text-sm font-medium text-foreground"><span>Initial idea or problem</span><span className="font-mono text-[0.65rem] text-muted-foreground">required</span></span>
            <span className="mt-3 block">
              <textarea required minLength={12} value={form.initialIdea} onChange={(event) => update("initialIdea", event.target.value)} rows={5} className="w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60" placeholder="What feels broken, slow, confusing, or worth making? Write it like you would tell a smart friend." />
            </span>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">Do not polish it. The rough edge is useful.</span>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">What kind of thing is it?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <label key={domain.value} className={`cursor-pointer rounded-lg border px-3 py-3 text-sm transition-colors duration-180 ease-spring focus-within:ring-2 focus-within:ring-ring/60 ${form.domain === domain.value ? "border-accent/60 bg-accent/10 text-foreground" : "border-border/80 bg-background/30 text-muted-foreground hover:border-border hover:text-foreground"}`}>
                  <input type="radio" name="domain" value={domain.value} checked={form.domain === domain.value} onChange={() => update("domain", domain.value)} className="sr-only" />
                  {domain.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Who is it for first?</span>
            <textarea required minLength={5} value={form.intendedUsers} onChange={(event) => update("intendedUsers", event.target.value)} rows={3} className="mt-3 w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60" placeholder="A specific person, role, player, or small group—not everyone." />
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">How much are you willing to take on?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ambitions.map((ambition) => (
                <label key={ambition.value} className={`cursor-pointer rounded-lg border px-4 py-3 transition-colors duration-180 ease-spring focus-within:ring-2 focus-within:ring-ring/60 ${form.ambition === ambition.value ? "border-primary/60 bg-primary/[0.08]" : "border-border/80 bg-background/30 hover:border-border"}`}>
                  <input type="radio" name="ambition" value={ambition.value} checked={form.ambition === ambition.value} onChange={() => update("ambition", ambition.value)} className="sr-only" />
                  <span className="block text-sm font-medium text-foreground">{ambition.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{ambition.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-medium text-foreground">Platform or technology</span><input value={form.platform} onChange={(event) => update("platform", event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-input bg-background/45 px-3 text-sm text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60" placeholder="e.g. web, Godot, iOS, TypeScript" /></label>
            <label className="block"><span className="text-sm font-medium text-foreground">Constraints</span><input value={form.constraints} onChange={(event) => update("constraints", event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-input bg-background/45 px-3 text-sm text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60" placeholder="Time, budget, access, skills" /></label>
          </div>

          <label className="block"><span className="flex items-center gap-2 text-sm font-medium text-foreground">Non-goals <CircleHelp className="size-3.5 text-muted-foreground" aria-hidden="true" /></span><textarea value={form.nonGoals} onChange={(event) => update("nonGoals", event.target.value)} rows={3} className="mt-3 w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60" placeholder="What should this first version deliberately avoid?" /></label>
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">{pending ? (stage === 1 ? "Finding the shape of your idea." : "Saving the brief.") : error || "Ready to generate your brief."}</p>
        {error && <p className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-red-200" role="alert">{error}</p>}

        <div className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground"><span className="font-mono text-accent">{pending ? "generating" : "ready"}</span><span className="mx-2">·</span><span>your notes stay private</span></div>
          <button type="submit" disabled={pending} className="button-lift inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70">
            {pending ? <><LoaderCircle className="size-4 animate-spin" /> {stage === 1 ? "Finding the shape" : "Saving the brief"}</> : <>Generate my brief <ArrowRight className="size-4" /></>}
          </button>
        </div>
      </form>}
    </div>
  );
}
