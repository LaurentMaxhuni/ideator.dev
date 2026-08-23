"use client";

import { ArrowRight, Check, Layers3, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Hero6 } from "@/components/ui/hero-6";

const navItems = [
  { label: "Idea lab", href: "#lab" },
  { label: "The workspace", href: "#workspace" },
  { label: "Privacy", href: "#private" },
];

export function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-sky-950 text-white">
      <Hero6
        logo={<BrandMark href="/" tone="light" />}
        navItems={navItems}
        headerCtaText="Open the idea lab"
        headerCtaHref="/login?next=/app/new"
        eyebrow="idea discovery workbench"
        title="Find an idea."
        titleAccent="Then make it survive reality."
        description="Combine a person, a recurring tension, and a sharp constraint. Compare product shapes, inspect the behavior chain, and leave with a test—not a wall of generated copy."
        primaryCtaText="Find an idea"
        primaryCtaHref="/login?next=/app/new"
        secondaryCtaText="See how it works"
        secondaryCtaHref="#lab"
      />

      <section id="lab" className="relative scroll-mt-8 border-t border-white/10 bg-sky-950 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">01 / the idea lab</p>
            <h2 className="mt-5 max-w-[420px] text-3xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Ideas from useful collisions, not a blank prompt.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Notice", "Choose a specific person and a tension that keeps showing up in their real work."],
              ["Combine", "Add a constraint such as offline-first, one core action, or a weekend-sized build."],
              ["Pressure-test", "Compare an instrument, a visual map, and a behavioral ritual before choosing a direction."],
            ].map(([title, body], index) => (
              <article key={title} className={`rounded-2xl border border-white/15 bg-white/[0.08] p-5 ${index === 0 ? "sm:col-span-2 sm:grid sm:grid-cols-[auto_1fr] sm:gap-8" : ""}`}>
                <span className="font-mono text-xs text-amber-200">0{index + 1}</span>
                <div><h3 className={index === 0 ? "mt-4 text-lg font-medium sm:mt-0" : "mt-8 text-lg font-medium"}>{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{body}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workspace" className="relative scroll-mt-8 border-t border-white/10 bg-sky-950 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
          <div className="order-2 rounded-2xl border border-white/15 bg-white/[0.08] p-5 sm:p-7 lg:order-1">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">artifact / north star</span>
              <Layers3 className="size-4 text-cyan-200" aria-hidden="true" />
            </div>
            <div className="grid gap-7 py-8 sm:grid-cols-[1.05fr_0.95fr] sm:items-end">
              <div>
                <p className="font-serif text-3xl leading-tight italic sm:text-4xl">A small product can still have a point of view.</p>
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">The idea becomes an editable behavior map and working sections, not a sealed AI answer.</p>
              </div>
              <div className="grid gap-2">
                {["Who it is for", "Why it matters", "MVP scope", "Technical blueprint", "Milestones", "Immediate next step"].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-sky-950/50 px-3 py-3">
                    <span>{item}</span><span className="font-mono text-cyan-200">0{index + 2}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/60">
              <span>plain-language fields / behavior map / scope board</span>
              <Link href="/login?next=/app/new" className="inline-flex cursor-pointer items-center gap-1 font-semibold text-amber-200 transition-[color,transform] duration-180 ease-spring hover:translate-x-1 hover:text-amber-100">keep shaping <ArrowRight className="size-3" /></Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">02 / the workspace</p>
            <h2 className="mt-5 max-w-[500px] text-3xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">A project workbench for decisions, not a scroll of generated text.</h2>
            <p className="mt-6 max-w-[510px] text-base leading-7 text-white/70">Follow the person-to-proof chain, move scope in and out, and edit named fields without touching JSON. The workspace should expose weak thinking, not decorate it.</p>
            <Link href="/login?next=/app/new" className="mt-8 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-amber-200 transition-[color,transform] duration-180 ease-spring hover:translate-x-1 hover:text-amber-100">Open your workbench <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section id="private" className="relative scroll-mt-8 border-t border-white/10 bg-sky-950 px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-28">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 overflow-hidden rounded-2xl border border-cyan-200/25 bg-cyan-200/[0.08] px-6 py-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">03 / private by default</p>
            <h2 className="mt-5 max-w-[650px] text-3xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Your half-formed ideas do not need an audience yet.</h2>
            <p className="mt-5 max-w-[600px] text-sm leading-6 text-white/70">Neon Auth keeps the workbench behind your account. Sharing, teams, and public discovery can wait until the idea earns them.</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-2"><LockKeyhole className="size-3.5 text-cyan-200" /> private workspaces</span>
              <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-amber-200" /> structured output</span>
            </div>
          </div>
          <Link href="/login?next=/app/new" className="button-lift inline-flex min-h-12 shrink-0 items-center gap-3 rounded-xl bg-amber-300 px-5 text-sm font-semibold text-sky-950 shadow-[0_14px_30px_rgba(250,204,21,0.18)] hover:bg-amber-200">Start shaping <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-8 text-xs text-white/55">
          <BrandMark href="/" tone="light" />
          <span>Built for the first useful version.</span>
        </div>
      </section>
    </main>
  );
}
