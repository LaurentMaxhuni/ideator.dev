"use client";

import { ArrowDown, ArrowRight, Crosshair, MousePointer2, ScanLine, UsersRound } from "lucide-react";
import { useState } from "react";

import type { IdeaArtifact } from "@ideator.dev/ai";

type ConceptMapProps = {
  artifact: IdeaArtifact;
};

export function ConceptMap({ artifact }: ConceptMapProps) {
  const nodes = [
    {
      id: "person",
      index: "01",
      label: "Person",
      icon: UsersRound,
      value: artifact.whoItsFor.primaryUser,
      question: "Can you point to three real people who match this, without broadening the description?",
    },
    {
      id: "moment",
      index: "02",
      label: "Tense moment",
      icon: Crosshair,
      value: artifact.whoItsFor.situation,
      question: "What happens immediately before this tension appears, and what do they use today?",
    },
    {
      id: "move",
      index: "03",
      label: "Core move",
      icon: MousePointer2,
      value: artifact.mvpScope.include[0],
      question: "Could this be completed once, end to end, without the rest of the planned scope?",
    },
    {
      id: "signal",
      index: "04",
      label: "Proof",
      icon: ScanLine,
      value: artifact.immediateNextStep.doneWhen,
      question: "Would this evidence change what you build next, or is it only a completion check?",
    },
  ] as const;
  const [activeId, setActiveId] = useState<(typeof nodes)[number]["id"]>("person");
  const active = nodes.find((node) => node.id === activeId) ?? nodes[0];
  const ActiveIcon = active.icon;

  return (
    <section className="panel overflow-hidden rounded-xl" aria-labelledby="concept-map-heading">
      <div className="grid gap-5 border-b border-border/70 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow text-accent">idea map / behavior chain</p>
          <h2 id="concept-map-heading" className="display-type mt-3 text-2xl font-normal text-foreground sm:text-3xl">
            Does the idea survive the path from person to proof?
          </h2>
          <p className="mt-3 max-w-[650px] text-sm leading-6 text-muted-foreground">
            Inspect the four links. A weak link is more useful than another page of generated copy because it tells you what to test.
          </p>
        </div>
        <span className="rounded-sm border border-border bg-background/35 px-2.5 py-1.5 text-[0.65rem] text-muted-foreground">
          click each node
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const activeNode = node.id === activeId;

            return (
              <div key={node.id} className="contents">
                <button
                  type="button"
                  onClick={() => setActiveId(node.id)}
                  aria-pressed={activeNode}
                  className={`group min-h-28 rounded-xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ease-spring hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px ${activeNode ? "border-primary/55 bg-primary/[0.08] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_15%,transparent)]" : "border-border/80 bg-background/30 hover:border-accent/45"}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className={`grid size-8 place-items-center rounded-md border ${activeNode ? "border-primary/35 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="tabular-nums text-[0.65rem] text-muted-foreground">{node.index}</span>
                  </span>
                  <span className="mt-4 block text-sm font-semibold text-foreground">{node.label}</span>
                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">{node.value}</span>
                </button>
                {index < nodes.length - 1 ? (
                  <span className="grid place-items-center text-border" aria-hidden="true">
                    <ArrowDown className="size-4 lg:hidden" />
                    <ArrowRight className="hidden size-4 lg:block" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 rounded-xl border border-primary/25 bg-primary/[0.05] p-5 sm:grid-cols-[auto_1fr_0.85fr] sm:items-start">
          <span className="grid size-10 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <ActiveIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow text-primary">{active.label} / current claim</p>
            <p className="mt-3 text-sm leading-6 text-foreground/90">{active.value}</p>
          </div>
          <div className="border-t border-primary/20 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="eyebrow text-muted-foreground">pressure question</p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{active.question}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
