"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";

type AuthShellProps = {
  children: ReactNode;
  description: ReactNode;
  footer?: ReactNode;
  title: string;
};

export function AuthShell({ children, description, footer, title }: AuthShellProps) {
  return (
    <main className="auth-screen non-landing-ui relative isolate h-dvh max-h-dvh overflow-hidden bg-background text-foreground">
      <div
        className="auth-pattern pointer-events-none absolute inset-y-0 left-0 hidden w-[44%] border-r border-border bg-[url('/pattern.svg')] bg-[length:60px_60px] bg-repeat md:block lg:w-1/2"
        aria-hidden="true"
      />

      <div className="auth-frame relative z-10 mx-auto grid h-full max-w-[1120px] grid-rows-[auto_minmax(0,1fr)] px-5 sm:px-8 lg:px-12">
        <header className="auth-header flex h-16 items-center justify-between border-b border-border/70">
          <BrandMark href="/" dotClassName="!bg-primary !bg-none !shadow-none" />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-spring hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
        </header>

        <div className="auth-layout flex min-h-0 items-start justify-center overflow-y-auto overscroll-contain py-4 md:justify-end">
          <section className="auth-panel my-auto w-full max-w-[460px] md:w-[48%]">
            <header className="auth-intro mb-5" aria-labelledby="auth-title">
              <h1 id="auth-title" className="auth-title text-[clamp(1.9rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
                {title}
              </h1>
              <p className="auth-description mt-2 max-w-[42ch] text-sm leading-6 text-muted-foreground">{description}</p>
            </header>

            {children}
            {footer}
          </section>
        </div>
      </div>
    </main>
  );
}
