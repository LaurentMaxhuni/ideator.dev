"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import type { IdeaArtifact } from "@ideator.dev/ai";

import {
  createBrandDirections,
  type BrandDirection,
  type LogoVariant,
} from "@/lib/brand-directions";

type BrandDirectionsProps = {
  artifact: IdeaArtifact;
  domain: string;
};

function projectInitial(projectName: string) {
  return projectName.trim().charAt(0).toLocaleUpperCase() || "I";
}

function LogoMark({
  variant,
  initial,
  foreground,
  accent,
  secondary,
}: {
  variant: LogoVariant;
  initial: string;
  foreground: string;
  accent: string;
  secondary: string;
}) {
  if (variant === "frame") {
    return (
      <svg viewBox="0 0 96 96" className="size-full" role="img" aria-label="Framed path logo sketch">
        <rect x="13" y="13" width="70" height="70" rx="19" fill="none" stroke={foreground} strokeWidth="8" />
        <path d="M28 60 L45 43 L57 55 L72 31" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="72" cy="31" r="7" fill={secondary} />
      </svg>
    );
  }

  if (variant === "cut") {
    return (
      <svg viewBox="0 0 96 96" className="size-full" role="img" aria-label="Cut initial logo sketch">
        <rect x="13" y="13" width="70" height="70" rx="22" fill={foreground} />
        <text x="48" y="65" textAnchor="middle" fill={accent} fontSize="50" fontWeight="700" fontFamily="Arial, sans-serif">{initial}</text>
        <path d="M17 68 L76 25" stroke={secondary} strokeWidth="9" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === "modules") {
    return (
      <svg viewBox="0 0 96 96" className="size-full" role="img" aria-label="Modular steps logo sketch">
        <rect x="12" y="48" width="26" height="34" rx="9" fill={foreground} />
        <rect x="35" y="28" width="26" height="54" rx="9" fill={accent} />
        <rect x="58" y="12" width="26" height="70" rx="9" fill={secondary} />
        <circle cx="48" cy="55" r="8" fill={foreground} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" className="size-full" role="img" aria-label="Open threshold logo sketch">
      <path d="M73 69 A34 34 0 1 1 73 27" fill="none" stroke={foreground} strokeWidth="11" strokeLinecap="round" />
      <path d="M71 27 L83 27 L83 39" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="48" r="10" fill={secondary} />
    </svg>
  );
}

function DirectionPreview({
  direction,
  projectName,
  selected,
  onSelect,
}: {
  direction: BrandDirection;
  projectName: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const [base, paper, accent, secondary] = direction.palette.colors;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group overflow-hidden rounded-xl border text-left transition-[border-color,box-shadow,transform] duration-200 ease-spring hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px ${selected ? "border-primary/60 shadow-[0_14px_34px_color-mix(in_srgb,var(--background)_42%,transparent)]" : "border-border/80 hover:border-accent/45"}`}
    >
      <span className="block aspect-[4/3] p-5" style={{ backgroundColor: base.value, color: paper.value }}>
        <span className="flex h-full flex-col justify-between">
          <span className="flex items-start justify-between gap-4">
            <span className="block size-20">
              <LogoMark variant={direction.id} initial={projectInitial(projectName)} foreground={paper.value} accent={accent.value} secondary={secondary.value} />
            </span>
            <span className="block text-right text-[0.58rem] uppercase tracking-[0.16em] opacity-60">logo study<br />not final art</span>
          </span>
          <span className="block">
            <span className="block max-w-[300px] text-xl leading-tight" style={{ fontFamily: direction.font.displayStack, fontWeight: 600 }}>{projectName}</span>
            <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.14em] opacity-60">{direction.method}</span>
          </span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-3 bg-card px-4 py-3">
        <span>
          <span className="block text-xs font-semibold text-foreground">{direction.label}</span>
          <span className="mt-1 block text-[0.65rem] text-muted-foreground">{direction.palette.name}</span>
        </span>
        <span className={`grid size-6 place-items-center rounded-sm border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"}`}>
          <Check className="size-3.5" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

export function BrandDirections({ artifact, domain }: BrandDirectionsProps) {
  const [iteration, setIteration] = useState(0);
  const directions = useMemo(
    () => createBrandDirections(artifact.projectName, domain, artifact.mvpScope.include[0], iteration),
    [artifact.projectName, artifact.mvpScope.include, domain, iteration],
  );
  const [selectedId, setSelectedId] = useState<LogoVariant>("frame");
  const [copied, setCopied] = useState(false);
  const selected = directions.find((direction) => direction.id === selectedId) ?? directions[0];
  const [base, paper, accent] = selected.palette.colors;

  async function copyPalette() {
    const paletteText = selected.palette.colors.map((color) => `${color.name}: ${color.value}`).join("\n");

    try {
      await navigator.clipboard.writeText(paletteText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="visual-directions" className="panel scroll-mt-8 overflow-hidden rounded-xl" aria-labelledby="visual-directions-heading">
      <div className="grid gap-5 border-b border-border/70 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow text-accent">visual directions / identity studies</p>
          <h2 id="visual-directions-heading" className="display-type mt-3 max-w-[720px] text-2xl font-normal text-foreground sm:text-3xl">
            Four ways the idea could look before anyone calls it a brand.
          </h2>
          <p className="mt-3 max-w-[680px] text-sm leading-6 text-muted-foreground">
            These are reduced SVG sketches for inspiration. Judge the symbol at a small size, then use the palette and type pairing as a visual hypothesis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIteration((current) => current + 1)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background/35 px-3 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-accent/45 active:translate-y-px"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" /> Remix color and type
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {directions.map((direction) => (
            <DirectionPreview key={direction.id} direction={direction} projectName={artifact.projectName} selected={selected.id === direction.id} onSelect={() => setSelectedId(direction.id)} />
          ))}
        </div>

        <div className="mt-6 grid gap-5 rounded-xl border border-border/70 bg-background/25 p-5 lg:grid-cols-[1fr_1.15fr_1fr]">
          <div>
            <p className="eyebrow text-primary">concept logic</p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{selected.label}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.rationale}</p>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Method: {selected.method}. Keep it if the metaphor helps explain the product; discard it if it only looks polished.</p>
          </div>

          <div className="border-t border-border/70 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">color palette</p>
                <p className="mt-2 text-sm font-medium text-foreground">{selected.palette.name}</p>
              </div>
              <button type="button" onClick={() => void copyPalette()} className="inline-flex min-h-9 items-center gap-2 rounded-md px-2.5 text-xs text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:text-foreground active:translate-y-px">
                {copied ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />} {copied ? "Copied" : "Copy values"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {selected.palette.colors.map((color) => (
                <div key={color.name} className="overflow-hidden rounded-lg border border-border/70 bg-card">
                  <div className="h-12" style={{ backgroundColor: color.value }} />
                  <div className="px-2.5 py-2">
                    <p className="text-[0.65rem] font-medium text-foreground">{color.name}</p>
                    <p className="mt-0.5 font-mono text-[0.6rem] uppercase text-muted-foreground">{color.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/70 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <p className="eyebrow">type pairing</p>
            <p className="mt-2 text-sm font-medium text-foreground">{selected.font.name}</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-border/70" style={{ backgroundColor: paper.value, color: base.value }}>
              <div className="p-4">
                <p className="text-3xl leading-none" style={{ fontFamily: selected.font.displayStack, fontWeight: 600 }}>Shape the next move.</p>
                <p className="mt-4 text-xs leading-5" style={{ fontFamily: selected.font.bodyStack }}>A useful identity should make the product feel clearer before it makes it feel bigger.</p>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-2 text-[0.6rem]" style={{ backgroundColor: accent.value }}>
                <span>{selected.font.display}</span>
                <span>{selected.font.body}</span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{selected.font.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
