import { ArrowRight, Check, Layers3, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Hero6 } from "@/components/ui/hero-6";

const labSteps = [
  ["Choose a person", "Pick someone you would like to help: a builder, a learner, a caregiver, a team, or a creator."],
  ["Choose a situation", "Pick something they might want to plan, learn, make, organize, or do with other people."],
  ["Get starting ideas", "Compare a small tool, a visual workspace, and a simple routine before choosing one."],
] as const;

const artifactSections = [
  "Who it is for",
  "Why it matters",
  "MVP scope",
  "Technical blueprint",
  "Milestones",
  "Immediate next step",
] as const;

export function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <Hero6
        logo={<BrandMark href="/" tone="light" />}
        navItems={[
          { label: "Idea lab", href: "#lab" },
          { label: "The workspace", href: "#workspace" },
          { label: "Privacy", href: "#private" },
        ]}
        headerCtaText="Try the idea lab"
        headerCtaHref="/lab"
        eyebrow="idea discovery workbench"
        title="Need an idea?"
        titleAccent="Start with something useful."
        description="Choose who you want to help, what they might want to do, and what kind of thing to make. Get three starting ideas you can shape into your own."
        primaryCtaText="Get starting ideas"
        primaryCtaHref="/lab"
        secondaryCtaText="See how it works"
        secondaryCtaHref="#lab"
      />

      <section id="lab" className="scroll-mt-8 border-t border-border/70 bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="eyebrow">01 / the idea lab</p>
            <h2 className="display-type mt-5 max-w-[440px] text-3xl font-normal leading-tight text-foreground sm:text-5xl">Ideas from a few useful choices, not a blank prompt.</h2>
            <p className="mt-5 max-w-[420px] text-sm leading-6 text-muted-foreground">The lab combines simple inputs in your browser. Explore freely, then create an account only when a starting idea earns more attention.</p>
            <Link href="/lab" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/45 bg-primary/[0.06] px-4 text-sm font-semibold text-primary transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/[0.1]">
              Open the idea lab <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="divide-y divide-border/70 border-y border-border/70">
            {labSteps.map(([title, body], index) => (
              <li key={title} className="grid gap-4 py-6 sm:grid-cols-[4rem_1fr] sm:gap-7">
                <span className="font-mono text-xs tabular-nums text-accent">0{index + 1}</span>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{title}</h3>
                  <p className="mt-2 max-w-[560px] text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="workspace" className="scroll-mt-8 border-t border-border/70 bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
          <div className="panel order-2 rounded-2xl p-5 sm:p-7 lg:order-1">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <span className="eyebrow">artifact / north star</span>
              <Layers3 className="size-4 text-accent" aria-hidden="true" />
            </div>
            <div className="grid gap-7 py-8 sm:grid-cols-[1.05fr_0.95fr] sm:items-end">
              <div>
                <p className="font-serif text-3xl leading-tight italic text-foreground sm:text-4xl">A small product can still have a point of view.</p>
                <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">The idea becomes an editable behavior map and working sections, not a sealed AI answer.</p>
              </div>
              <div className="divide-y divide-border/70 border-y border-border/70">
                {artifactSections.map((item, index) => (
                  <div key={item} className="flex items-center justify-between gap-3 py-2.5 text-sm text-foreground">
                    <span>{item}</span><span className="font-mono text-xs tabular-nums text-accent">0{index + 2}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
              <span>plain-language fields / behavior map / scope board</span>
              <Link href="/login?next=/app/new" className="inline-flex min-h-11 items-center gap-1 font-semibold text-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-y-px hover:text-primary">
                Keep shaping <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow">02 / the workspace</p>
            <h2 className="display-type mt-5 max-w-[500px] text-3xl font-normal leading-tight text-foreground sm:text-5xl">A project workbench for decisions, not a scroll of generated text.</h2>
            <p className="mt-6 max-w-[510px] text-base leading-7 text-muted-foreground">Follow the person-to-proof chain, move scope in and out, and edit named fields without touching JSON. The workspace should expose weak thinking, not decorate it.</p>
            <Link href="/login?next=/app/new" className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-y-px hover:text-primary">
              Open your workbench <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="private" className="scroll-mt-8 border-t border-border/70 bg-background px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-28">
        <div className="panel mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-2xl px-6 py-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-12">
          <div>
            <p className="eyebrow">03 / private by default</p>
            <h2 className="display-type mt-5 max-w-[650px] text-3xl font-normal leading-tight text-foreground sm:text-5xl">Your half-formed ideas do not need an audience yet.</h2>
            <p className="mt-5 max-w-[600px] text-sm leading-6 text-muted-foreground">Neon Auth keeps the workbench behind your account. Sharing, teams, and public discovery can wait until the idea earns them.</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><LockKeyhole className="size-3.5 text-accent" aria-hidden="true" /> private workspaces</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-accent" aria-hidden="true" /> structured output</span>
            </div>
          </div>
          <Link href="/login?next=/app/new" className="button-lift inline-flex min-h-12 shrink-0 items-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Start shaping <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-8 text-xs text-muted-foreground">
          <BrandMark href="/" />
          <span>Built for the first useful version.</span>
        </div>
      </section>
    </main>
  );
}
