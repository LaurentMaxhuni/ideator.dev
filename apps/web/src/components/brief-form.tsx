"use client";

import { ArrowLeft, ArrowRight, Check, Lightbulb, LoaderCircle, PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { IdeaLab, type IdeaSeed } from "@/components/idea-lab";

const DRAFT_KEY = "ideator:brief-draft:/app/new";
const PENDING_SEED_KEY = "ideator:pending-seed";

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

const stepLabels = ["Core", "Boundaries", "Guardrails"] as const;

type BriefPath = "choose" | "shape" | "discover";
type BriefStep = 1 | 2 | 3;

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

function isBriefPath(value: unknown): value is BriefPath {
  return value === "choose" || value === "shape" || value === "discover";
}

function isBriefStep(value: unknown): value is BriefStep {
  return value === 1 || value === 2 || value === 3;
}

export function BriefForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const initialIdeaRef = useRef<HTMLTextAreaElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const [form, setForm] = useState<BriefFormState>(initialState);
  const [path, setPath] = useState<BriefPath>("choose");
  const [step, setStep] = useState<BriefStep>(1);
  const [loadedSeed, setLoadedSeed] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const pendingSeed = window.sessionStorage.getItem(PENDING_SEED_KEY);

      if (pendingSeed) {
        window.sessionStorage.removeItem(PENDING_SEED_KEY);
        const seed = JSON.parse(pendingSeed) as IdeaSeed;

        if (seed.initialIdea && seed.intendedUsers && seed.domain) {
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
          setStep(1);
        }
      } else {
        const draft = window.sessionStorage.getItem(DRAFT_KEY);

        if (draft) {
          const parsed = JSON.parse(draft) as {
            form?: Partial<BriefFormState>;
            path?: unknown;
            step?: unknown;
            loadedSeed?: unknown;
          };

          if (parsed.form) {
            setForm({ ...initialState, ...parsed.form });
          }

          if (isBriefPath(parsed.path)) {
            setPath(parsed.path);
          }

          if (isBriefStep(parsed.step)) {
            setStep(parsed.step);
          }

          if (typeof parsed.loadedSeed === "string") {
            setLoadedSeed(parsed.loadedSeed);
          }
        }
      }
    } catch {
      /* a broken draft is worse than nothing; start clean */
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, path, step, loadedSeed }));
    } catch {
      /* storage unavailable; the draft still lives in state */
    }
  }, [form, path, step, loadedSeed, hydrated]);

  useEffect(() => {
    if (!hydrated || path !== "shape") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (step === 1) {
        initialIdeaRef.current?.focus();
      } else {
        stepHeadingRef.current?.focus();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hydrated, path, step]);

  function selectPath(nextPath: Exclude<BriefPath, "choose">) {
    setError("");
    setPath(nextPath);

    if (nextPath === "shape") {
      setStep(1);
    }
  }

  function applySeed(seed: IdeaSeed, skipScroll = false) {
    setForm((current) => ({
      ...current,
      initialIdea: seed.initialIdea,
      domain: seed.domain,
      intendedUsers: seed.intendedUsers,
      platform: seed.platform,
      constraints: seed.constraints,
    }));
    setLoadedSeed(seed.title);
    setError("");
    setPath("shape");
    setStep(1);

    if (!skipScroll) {
      requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function update<K extends keyof BriefFormState>(key: K, value: BriefFormState[K]) {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateCore() {
    if (form.initialIdea.trim().length < 12) {
      setError("Give the idea a little more shape before continuing. A rough sentence is enough.");
      return false;
    }

    if (form.intendedUsers.trim().length < 5) {
      setError("Name the first person or group this is for. It does not need to be everyone.");
      return false;
    }

    return true;
  }

  function goBack() {
    setError("");

    if (step === 1) {
      setPath("choose");
      return;
    }

    setStep((current) => (current === 3 ? 2 : 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step !== 3) {
      if (step === 1 && !validateCore()) {
        return;
      }

      setError("");
      setStep((current) => (current === 1 ? 2 : 3));
      return;
    }

    if (!validateCore()) {
      setStep(1);
      return;
    }

    setPending(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null) as { project?: { project?: { id?: string } }; error?: string } | null;

      if (response.status === 401) {
        router.replace("/login?next=/app/new");
        return;
      }

      if (!response.ok || !payload?.project?.project?.id) {
        throw new Error(payload?.error || "We could not generate the project brief. Your draft is still here - try again.");
      }

      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/app/projects/${payload.project.project.id}`);
    } catch (submitError) {
      const submitMessage = submitError instanceof Error ? submitError.message : "";
      const submitName = submitError instanceof Error ? submitError.name : "";
      setError(
        submitName === "AbortError"
          ? "This is taking longer than expected. Your draft is still here - try again."
          : submitMessage === "Failed to fetch" || submitMessage === "NetworkError when attempting to fetch resource."
            ? "We could not reach the project service. Your draft is still here - try again."
            : submitMessage
              ? submitMessage
              : "We could not generate the project brief. Your draft is still here - try again.",
      );
    } finally {
      window.clearTimeout(timeout);
      setPending(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl" aria-busy="true" aria-label="Restoring your brief">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-28 rounded-sm bg-muted" />
          <div className="h-16 w-full max-w-2xl rounded-lg bg-card" />
          <div className="h-5 w-full max-w-xl rounded-lg bg-muted" />
          <div className="h-64 rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  const selectedDomain = domains.find((domain) => domain.value === form.domain)?.label ?? form.domain;
  const selectedAmbition = ambitions.find((ambition) => ambition.value === form.ambition)?.label ?? form.ambition;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/app" className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-x-1 hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to projects
      </Link>

      <header className="mt-10 max-w-3xl">
        <h1 className="display-type text-4xl font-normal leading-[0.98] text-foreground sm:text-6xl">Find a useful idea, then give it shape.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">Start with a rough thought or let the idea lab make three starting points. We will turn the one you like into a private brief.</p>
      </header>

      {path === "choose" ? (
        <section className="panel mt-10 max-w-4xl rounded-xl p-5 sm:p-8" aria-labelledby="starting-point-heading">
          <div className="max-w-2xl">
            <h2 id="starting-point-heading" className="text-2xl font-medium tracking-[-0.03em] text-foreground">Where should we begin?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Choose the route that feels easiest. You can switch between them without losing anything you write.</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => selectPath("shape")} className="group flex min-h-36 items-start gap-4 rounded-lg border border-border bg-background/25 p-5 text-left transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><PencilLine className="size-4" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-base font-semibold text-foreground">I have a rough idea</span><span className="mt-2 block text-sm leading-5 text-muted-foreground">Bring the problem, audience, or half-sentence already in your head.</span><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">Shape it <ArrowRight className="size-3.5 transition-transform duration-180 ease-spring group-hover:translate-x-1" aria-hidden="true" /></span></span>
            </button>
            <button type="button" onClick={() => selectPath("discover")} className="group flex min-h-36 items-start gap-4 rounded-lg border border-border bg-background/25 p-5 text-left transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-1 hover:border-accent/50 hover:bg-accent/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-accent/40 bg-accent/10 text-accent"><Lightbulb className="size-4" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-base font-semibold text-foreground">Give me a starting idea</span><span className="mt-2 block text-sm leading-5 text-muted-foreground">Choose who it is for, what they might need or enjoy, and what kind of thing to make.</span><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-accent">Get starting ideas <ArrowRight className="size-3.5 transition-transform duration-180 ease-spring group-hover:translate-x-1" aria-hidden="true" /></span></span>
            </button>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-accent" aria-hidden="true" /> Nothing is generated or saved until you choose to create the brief.</p>
        </section>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Starting point</p>
              <p className="mt-1 text-xs text-muted-foreground">Switch routes any time. Your answers stay here.</p>
            </div>
            <div className="inline-flex w-full rounded-lg border border-border bg-background/25 p-1 sm:w-auto">
              <button type="button" onClick={() => selectPath("shape")} aria-pressed={path === "shape"} className={`min-h-11 flex-1 rounded-md px-3 text-xs font-semibold transition-[background-color,color] duration-180 ease-spring sm:min-w-36 ${path === "shape" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>I have an idea</button>
              <button type="button" onClick={() => selectPath("discover")} aria-pressed={path === "discover"} className={`min-h-11 flex-1 rounded-md px-3 text-xs font-semibold transition-[background-color,color] duration-180 ease-spring sm:min-w-36 ${path === "discover" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>Get ideas</button>
            </div>
          </div>

          {path === "discover" ? (
            <div className="mt-6">
              <IdeaLab onUseSeed={applySeed} />
            </div>
          ) : (
            <section className="mt-8" aria-labelledby="brief-heading">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-foreground">Build your brief</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Three short passes. Start with what matters, then add useful limits.</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-accent">Step {step} of 3</span>
              </div>

              <nav className="mt-6" aria-label="Brief steps">
                <ol className="flex items-center gap-2 sm:gap-3">
                  {stepLabels.map((label, index) => {
                    const itemStep = (index + 1) as BriefStep;
                    const completed = itemStep < step;
                    const active = itemStep === step;

                    return (
                      <li key={label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <button type="button" disabled={!completed} onClick={() => { setError(""); setStep(itemStep); }} className={`flex min-w-0 items-center gap-2 text-left text-xs transition-colors duration-180 ease-spring ${active ? "font-semibold text-foreground" : completed ? "text-accent hover:text-foreground" : "text-muted-foreground"}`}>
                          <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-[0.65rem] ${active ? "border-primary bg-primary text-primary-foreground" : completed ? "border-accent/50 bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>{completed ? <Check className="size-3.5" aria-hidden="true" /> : itemStep}</span>
                          <span className="hidden truncate sm:inline">{label}</span>
                        </button>
                        {index < stepLabels.length - 1 ? <span className={`h-px min-w-3 flex-1 ${itemStep < step ? "bg-accent/50" : "bg-border"}`} aria-hidden="true" /> : null}
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <form ref={formRef} onSubmit={handleSubmit} className="panel mt-5 rounded-xl p-5 sm:p-8 lg:p-10" aria-busy={pending}>
                <div className="flex items-start justify-between gap-5 border-b border-border/70 pb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">Step {step}</p>
                    <h2 id="brief-heading" ref={stepHeadingRef} tabIndex={-1} className="mt-3 text-2xl font-medium tracking-[-0.035em] text-foreground focus:outline-none">{step === 1 ? "Start with the core" : step === 2 ? "Add useful boundaries" : "Keep the first version honest"}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{step === 1 ? "What is the rough problem, and who should feel the first benefit?" : step === 2 ? "Choose the size of the bet. The optional details help the brief stay realistic." : "Say what belongs outside the first version, then check the shape before you create it."}</p>
                  </div>
                  {loadedSeed && step === 1 ? <p className="hidden max-w-52 text-right text-xs leading-5 text-accent sm:block">Started from {loadedSeed}. Every answer is yours to change.</p> : null}
                </div>

                {step === 1 ? (
                  <div className="space-y-8 pt-8">
                    <label className="block">
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground"><span>What are you thinking about?</span><span className="text-xs font-normal text-muted-foreground">required</span></span>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground">A rough sentence is enough. Describe what feels broken, slow, confusing, or worth making.</span>
                      <textarea ref={initialIdeaRef} required minLength={12} value={form.initialIdea} onChange={(event) => update("initialIdea", event.target.value)} rows={5} className="mt-3 w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-base leading-6 text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60 sm:text-sm" placeholder="I want to make it easier for…" />
                    </label>

                    <label className="block">
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground"><span>Who is it for first?</span><span className="text-xs font-normal text-muted-foreground">required</span></span>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground">Choose a specific person, role, player, or small group - not everyone.</span>
                      <textarea required minLength={5} value={form.intendedUsers} onChange={(event) => update("intendedUsers", event.target.value)} rows={3} className="mt-3 w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-base leading-6 text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60 sm:text-sm" placeholder="A volunteer coordinator with one evening to spare" />
                    </label>

                    <fieldset>
                      <legend className="text-sm font-semibold text-foreground">What kind of thing is it?</legend>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {domains.map((domain) => (
                          <label key={domain.value} className={`cursor-pointer rounded-lg border px-4 py-3 text-sm transition-[background-color,border-color,color] duration-180 ease-spring focus-within:ring-2 focus-within:ring-ring/60 ${form.domain === domain.value ? "border-accent/60 bg-accent/10 text-foreground" : "border-border/80 bg-background/30 text-muted-foreground hover:border-border hover:text-foreground"}`}>
                            <input type="radio" name="domain" value={domain.value} checked={form.domain === domain.value} onChange={() => update("domain", domain.value)} className="sr-only" />
                            {domain.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-8 pt-8">
                    <fieldset>
                      <legend className="text-sm font-semibold text-foreground">How much are you willing to take on?</legend>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">This sets the scale of the first useful version, not a permanent commitment.</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {ambitions.map((ambition) => (
                          <label key={ambition.value} className={`cursor-pointer rounded-lg border px-4 py-4 transition-[background-color,border-color] duration-180 ease-spring focus-within:ring-2 focus-within:ring-ring/60 ${form.ambition === ambition.value ? "border-primary/60 bg-primary/[0.08]" : "border-border/80 bg-background/30 hover:border-border"}`}>
                            <input type="radio" name="ambition" value={ambition.value} checked={form.ambition === ambition.value} onChange={() => update("ambition", ambition.value)} className="sr-only" />
                            <span className="block text-sm font-semibold text-foreground">{ambition.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{ambition.hint}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className="block"><span className="text-sm font-semibold text-foreground">Platform or technology</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Optional. Name what you can actually build with today.</span><input value={form.platform} onChange={(event) => update("platform", event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-input bg-background/45 px-3 text-base text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60 sm:text-sm" placeholder="Web, Godot, iOS, TypeScript" /></label>
                      <label className="block"><span className="text-sm font-semibold text-foreground">Constraints</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Optional. Time, budget, access, or skills that shape the bet.</span><input value={form.constraints} onChange={(event) => update("constraints", event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-input bg-background/45 px-3 text-base text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60 sm:text-sm" placeholder="Evenings only, no budget, must work offline" /></label>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-8 pt-8">
                    <label className="block">
                      <span className="text-sm font-semibold text-foreground">What should this first version deliberately avoid?</span>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground">Optional. Naming what you will not build keeps the first version honest.</span>
                      <textarea value={form.nonGoals} onChange={(event) => update("nonGoals", event.target.value)} rows={4} className="mt-3 w-full resize-y rounded-lg border border-input bg-background/45 px-4 py-3 text-base leading-6 text-foreground outline-none transition-colors duration-180 ease-spring placeholder:text-muted-foreground/55 focus:border-primary/60 sm:text-sm" placeholder="No accounts, no payments, no second platform…" />
                    </label>

                    <div className="border-t border-border/70 pt-6">
                      <h3 className="text-sm font-semibold text-foreground">Quick check</h3>
                      <dl className="mt-4 grid gap-5 sm:grid-cols-3">
                        <div><dt className="text-xs text-muted-foreground">For</dt><dd className="mt-1 line-clamp-3 text-sm leading-5 text-foreground">{form.intendedUsers || "Not set yet"}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">Shape</dt><dd className="mt-1 text-sm leading-5 text-foreground">{selectedDomain} · {selectedAmbition}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">First boundary</dt><dd className="mt-1 line-clamp-3 text-sm leading-5 text-foreground">{form.constraints || form.nonGoals || "No extra constraint yet"}</dd></div>
                      </dl>
                    </div>
                  </div>
                ) : null}

                <p className="sr-only" aria-live="polite" aria-atomic="true">{pending ? "Generating your private brief." : error || `Step ${step} of 3.`}</p>
                {error ? <p className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive" role="alert">{error}</p> : null}

                <div className="mt-10 flex flex-col-reverse gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-x-1 hover:text-foreground"><ArrowLeft className="size-3.5" aria-hidden="true" /> {step === 1 ? "Change starting point" : "Back"}</button>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <span className="text-center text-xs text-muted-foreground sm:text-right">{step === 3 ? "Your answers stay private." : "You can edit every answer later."}</span>
                    <button type="submit" disabled={pending} className="button-lift inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70">
                      {pending ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Generating brief</> : step === 3 ? <>Create my brief <ArrowRight className="size-4" aria-hidden="true" /></> : <>Continue <ArrowRight className="size-4" aria-hidden="true" /></>}
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}
        </>
      )}
    </div>
  );
}
