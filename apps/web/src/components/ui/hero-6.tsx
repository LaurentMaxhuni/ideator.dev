"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Menu, X } from "lucide-react";

export interface Hero6NavItem {
  label: string;
  href: string;
}

export interface Hero6TrustedBrand {
  name: string;
  logo?: ReactNode;
}

export interface Hero6Props {
  logo?: ReactNode;
  logoText?: string;
  navItems?: Hero6NavItem[];
  headerCtaText?: string;
  headerCtaHref?: string;
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  trustedTitle?: string;
  trustedBrands?: Hero6TrustedBrand[];
}

const navItemsDefault: Hero6NavItem[] = [
  { label: "Product", href: "#" },
  { label: "Features", href: "#" },
  { label: "Pages", href: "#" },
  { label: "Use Cases", href: "#" },
  { label: "Contact", href: "#" },
];

const trustedBrandsDefault: Hero6TrustedBrand[] = [
  { name: "Forbes" },
  { name: "healthline" },
  { name: "Bloomberg" },
  { name: "The Times" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

function FallbackLogo({ logoText }: { logoText: string }) {
  return (
    <span className="inline-flex min-h-10 items-center text-xl font-light tracking-[-0.04em] text-white">
      {logoText}
      <span className="mx-1 inline-block size-1.5 rounded-full bg-amber-300 align-middle" aria-hidden="true" />
      dev
    </span>
  );
}

function DottedButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-white/75 bg-white/[0.04] px-6 text-xs font-semibold leading-none text-white transition-[border-color,background-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-white hover:bg-white/10 active:translate-y-0.5 active:scale-[0.985] ${className}`}
    >
      {children}
    </a>
  );
}

export function Hero6({
  logo,
  logoText = "ideator",
  navItems = navItemsDefault,
  headerCtaText = "Learn More",
  headerCtaHref = "#",
  eyebrow,
  title = "Don't have an idea?",
  titleAccent = "We have one for you.",
  description = "Generate a new idea in seconds with our AI-powered idea generator. Get inspired and start creating today.",
  primaryCtaText = "Get Inspired",
  primaryCtaHref = "#",
  secondaryCtaText = "Learn More",
  secondaryCtaHref = "#",
  backgroundImage = "/hero-6-bg.avif",
}: Hero6Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const motionInitial = reduceMotion ? false : { opacity: 0, y: -14 };
  const motionAnimate = reduceMotion ? undefined : { opacity: 1, y: 0 };

  return (
    <section className="relative flex min-h-dvh w-full overflow-hidden bg-sky-950 text-white antialiased">
      <div className="absolute inset-0">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-sky-950/55" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 sm:px-8">
        <motion.header
          initial={motionInitial}
          animate={motionAnimate}
          transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between gap-4 py-5"
        >
          <div className="flex items-center gap-8">
            {logo ?? (
              <a href="/" aria-label="ideator.dev home" className="inline-flex">
                <FallbackLogo logoText={logoText} />
              </a>
            )}
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
              {navItems.map((navItem) => (
                <a
                  key={navItem.label}
                  href={navItem.href}
                  className="cursor-pointer text-xs font-medium text-white/80 transition-colors duration-180 ease-spring hover:text-white"
                >
                  {navItem.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <DottedButton href={headerCtaHref} className="hidden md:inline-flex">
              {headerCtaText}
            </DottedButton>
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-white transition-colors duration-180 ease-spring hover:bg-white/10 md:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </motion.header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "tween", duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-40 flex flex-col bg-sky-950/95 px-5 py-5 backdrop-blur-sm sm:px-8"
            >
              <div className="flex items-center justify-between gap-4">
                {logo ?? (
                  <a href="/" aria-label="ideator.dev home" className="inline-flex">
                    <FallbackLogo logoText={logoText} />
                  </a>
                )}
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl text-white transition-[background-color,transform] duration-180 ease-spring hover:bg-white/10 active:scale-[0.96]"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="mt-6 grid gap-1" aria-label="Mobile navigation">
                {navItems.map((navItem) => (
                  <a
                    key={navItem.label}
                    href={navItem.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer rounded-xl px-3 py-3 text-base font-semibold text-white transition-[background-color,color,transform] duration-180 ease-spring hover:translate-x-1 hover:bg-white/10 hover:text-amber-200"
                  >
                    {navItem.label}
                  </a>
                ))}
              </nav>

              <DottedButton href={headerCtaHref} className="mt-5 w-full">
                {headerCtaText}
              </DottedButton>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={container}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center pb-12 pt-24 text-center sm:pt-20 lg:pt-24"
        >
          {eyebrow && (
            <motion.p variants={item} className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-amber-200">
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            variants={item}
            className="max-w-[820px] text-balance text-[clamp(3rem,8vw,4.8rem)] font-light leading-[0.94] tracking-[-0.035em] text-white"
          >
            <span className="block">{title}</span>
            <span className="mt-2 block font-serif text-[0.9em] font-normal italic tracking-[-0.02em]">
              {titleAccent}
            </span>
          </motion.h1>

          {description && (
            <motion.p
              variants={item}
              className="mt-8 max-w-[480px] text-pretty text-sm leading-6 text-white/90 sm:text-[15px]"
            >
              {description}
            </motion.p>
          )}

          <motion.div variants={item} className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <a
              href={primaryCtaHref}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-amber-300 px-6 text-sm font-medium text-sky-950 transition-[background-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-0.5 active:scale-[0.985]"
            >
              {primaryCtaText}
            </a>

            <DottedButton href={secondaryCtaHref} className="bg-amber-100/10 text-sm font-medium">
              {secondaryCtaText}
            </DottedButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}