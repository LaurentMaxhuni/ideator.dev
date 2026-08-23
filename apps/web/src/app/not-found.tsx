import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="non-landing-ui cockpit-grid grid min-h-dvh place-items-center px-5 py-12">
      <div className="panel max-w-lg rounded-xl p-8 text-center sm:p-12">
        <div className="mx-auto grid size-12 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent"><Compass className="size-5" /></div>
        <p className="eyebrow mt-7">signal lost / 404</p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.06em] text-foreground">That page does not exist.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">The project may have moved, or the link may belong to another private workspace.</p>
        <Link href="/app" className="button-lift mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><ArrowLeft className="size-4" /> Back to projects</Link>
      </div>
    </main>
  );
}
