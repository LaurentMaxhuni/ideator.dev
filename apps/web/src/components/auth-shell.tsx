"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  footer?: ReactNode;
  step: string;
  title: string;
};

const quietLinkClass =
  "inline-flex min-h-10 cursor-pointer items-center gap-2 transition-[color,transform] duration-200 ease-spring hover:-translate-y-0.5 hover:text-foreground";

export function AuthShell({ children, description, eyebrow, footer, step, title }: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="non-landing-ui min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <section className="relative isolate flex min-h-[104px] flex-col overflow-hidden border-b border-border bg-[url('/pattern.svg')] bg-repeat bg-[length:60px_60px] lg:sticky lg:top-0 lg:h-dvh lg:min-h-dvh lg:self-start lg:border-b-0 lg:border-r">
          <div className="relative z-10 flex flex-1 flex-col px-6 py-5 sm:px-10 sm:py-6 lg:px-12 lg:py-10">
            <header className="flex items-center gap-4">
              <BrandMark
                href="/"
                dotClassName="!bg-primary !bg-none !shadow-none"
                className="cursor-pointer text-[1.35rem]"
              />
            </header>
          </div>
        </section>

        <section className="relative flex min-h-[calc(100dvh-104px)] min-w-0 flex-col lg:min-h-dvh" aria-labelledby="auth-title">
          <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-3 sm:px-10 sm:py-6 lg:px-12 lg:py-8">
            <Link href="/" className={`${quietLinkClass} text-xs text-muted-foreground`}>
              Back to product home <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </header>

          <div className="auth-shell-content flex flex-1 items-center px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-8 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "tween",
                duration: reduceMotion ? 0 : 0.75,
                delay: reduceMotion ? 0 : 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-[520px]"
            >
              <div className="flex items-start justify-between gap-6 border-b border-border pb-4 lg:pb-5">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p>
                  <h1 id="auth-title" className="mt-2 text-[clamp(2.35rem,3.4vw,4rem)] font-normal leading-[0.92] tracking-[-0.045em] lg:mt-3">
                    {title}
                  </h1>
                </div>
                <span className="mt-1 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{step}</span>
              </div>

              <p className="mt-3 max-w-[430px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:mt-4">
                {description}
              </p>

              {children}
              {footer}
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
