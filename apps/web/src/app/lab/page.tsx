import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { IdeaLab } from "@/components/idea-lab";

export const metadata = {
  title: "The idea lab — ideator.dev",
  description: "Combine a person, a situation, and a product shape to find a starting idea. Runs in your browser — no account needed to explore.",
};

export default function LabPage() {
  return (
    <div className="non-landing-ui cockpit-grid min-h-dvh text-foreground">
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <BrandMark href="/" tone="light" />
          <Link
            href="/login?next=/app/new"
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-background/35 px-4 text-xs font-semibold text-foreground transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-accent/45"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-12">
          <p className="eyebrow">try it before you sign up</p>
          <h1 className="display-type mt-4 max-w-[680px] text-4xl font-normal leading-[0.98] text-foreground sm:text-5xl">
            The idea lab, open to everyone.
          </h1>
          <p className="mt-5 max-w-[560px] text-base leading-7 text-muted-foreground">
            Combine a person, a situation, and a product shape. Everything below runs locally in your browser — pick a starting idea when one feels worth making.
          </p>

          <div className="mt-10">
            <IdeaLab anonymous />
          </div>
        </main>

        <footer className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Runs locally · nothing is saved until you choose an idea</span>
          <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-180 ease-spring hover:text-foreground">
            Back to ideator.dev
          </Link>
        </footer>
      </div>
    </div>
  );
}
