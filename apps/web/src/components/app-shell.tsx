import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/components/sign-out-button";

type ShellUser = {
  name?: string | null;
  email?: string | null;
};

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "builder";

  return (
    <div className="non-landing-ui cockpit-grid min-h-dvh text-white">
      <header className="relative z-10 border-b border-border bg-background">
        <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <BrandMark href="/app" tone="light" />
            <nav className="hidden items-center gap-5 text-xs text-muted-foreground md:flex" aria-label="Workspace navigation">
              <Link href="/app" className="cursor-pointer transition-[color,transform] duration-180 ease-spring hover:-translate-y-px hover:text-foreground">Projects</Link>
              <Link href="/app/new" className="cursor-pointer transition-[color,transform] duration-180 ease-spring hover:-translate-y-px hover:text-foreground">New brief</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 border-r border-border/70 pr-4 text-right sm:flex">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">{displayName}</span>
            </div>
            <Link
              href="/app/new"
              className="button-lift inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New idea
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">{children}</main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 pb-8 text-[0.68rem] text-muted-foreground/70 sm:px-8 lg:px-12">
        <span className="inline-flex items-center gap-3"><BrandMark href="/app" tone="light" /><span>Private by default</span></span>
        <Link href="/" className="inline-flex cursor-pointer items-center gap-1 transition-[color,transform] duration-180 ease-spring hover:-translate-y-px hover:text-foreground">
          Product home <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
