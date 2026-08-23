"use client";

import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useState, type FormEvent } from "react";

import { BrandMark } from "@/components/brand-mark";
import { authClient } from "@/lib/auth/client";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
  initialMode?: AuthMode;
};

const inputClass = "mt-1 min-h-10 w-full border-0 bg-transparent px-0 py-1 text-base text-foreground outline-none transition-colors duration-200 ease-spring placeholder:text-muted-foreground/50 lg:min-h-12 lg:py-2 lg:text-[1.05rem]";
const quietLinkClass = "inline-flex min-h-10 cursor-pointer items-center gap-2 transition-[color,transform] duration-200 ease-spring hover:-translate-y-0.5 hover:text-foreground";
const microLabelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.12em]";
const fieldLabelClass = "text-xs font-semibold uppercase tracking-[0.1em]";

export function LoginForm({ initialMode = "sign-in" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const mode = initialMode;
  const isSignIn = mode === "sign-in";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next") ?? "/app" : "/app";
  const alternateHref = `${isSignIn ? "/signup" : "/login"}?${new URLSearchParams({ next: nextPath }).toString()}`;
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const result = isSignIn
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name: name || email.split("@")[0] || "Builder", email, password });

      if (result.error) {
        setError(result.error.message || "Authentication failed. Check your details and try again.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setPending(true);

    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: nextPath });

      if (result.error) {
        setError(result.error.message || "Google sign-in is not available yet.");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Google sign-in failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="non-landing-ui h-dvh max-h-dvh overflow-hidden bg-background text-foreground">
      <div className="grid h-full min-h-0 lg:grid-cols-2">
        <section className="relative isolate flex h-[112px] min-h-0 flex-col overflow-hidden border-b border-border bg-[url('/pattern.svg')] bg-repeat bg-[length:60px_60px] lg:h-dvh lg:border-b-0 lg:border-r">
          <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col px-6 py-5 sm:px-10 sm:py-6 lg:min-h-dvh lg:px-12 lg:py-10">
            <header className="flex items-center gap-4">
              <BrandMark href="/" dotClassName="!bg-primary !bg-none !shadow-none" className="cursor-pointer text-[1.35rem]" />
            </header>

            <h1 className="sr-only">{isSignIn ? "Sign in to ideator.dev" : "Create your ideator.dev account"}</h1>
          </div>
        </section>
        <section className="relative flex h-[calc(100dvh-112px)] min-h-0 flex-col overflow-hidden lg:h-dvh" aria-labelledby="auth-title">
          <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-3 sm:px-10 sm:py-6 lg:px-12 lg:py-10">
            <Link href="/" className={`${quietLinkClass} text-xs text-muted-foreground`}>
              Back to product home <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </header>

          <div className="flex min-h-0 flex-1 items-center overflow-y-auto px-6 py-2 sm:px-10 sm:py-8 lg:overflow-hidden lg:px-12 lg:py-12 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "tween", duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[520px]"
            >
              <div className="flex items-start justify-between gap-6 border-b border-border pb-4 lg:pb-7">
                <div>
                  <p className={`${microLabelClass} text-muted-foreground`}>{isSignIn ? "returning builder" : "new builder"}</p>
                  <h2 id="auth-title" className="mt-2 text-[clamp(2.35rem,4vw,4.3rem)] font-normal leading-[0.92] tracking-[-0.045em] lg:mt-4">
                    {isSignIn ? "Welcome back." : "Create your account."}
                  </h2>
                </div>
                <span className="mt-1 text-xs font-semibold tabular-nums text-muted-foreground">0{isSignIn ? "1" : "2"}</span>
              </div>

              <p className="mt-3 max-w-[410px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:mt-6">
                {isSignIn ? "Use the email attached to your account." : "One rough thought is enough to begin. You can shape the rest inside."}
              </p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3 lg:mt-10 lg:space-y-6" aria-busy={pending}>
                {!isSignIn && (
                  <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
                    <div className="flex items-baseline justify-between gap-4">
                      <label htmlFor="name" className={`${fieldLabelClass} text-muted-foreground`}>Name</label>
                      <span className="text-[0.68rem] text-muted-foreground/80">optional</span>
                    </div>
                    <input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={inputClass} placeholder="How should we greet you?" />
                  </div>
                )}

                <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
                  <label htmlFor="email" className={`${fieldLabelClass} block text-muted-foreground`}>Email</label>
                  <input id="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={inputClass} placeholder="you@example.com" />
                </div>

                <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
                  <label htmlFor="password" className={`${fieldLabelClass} block text-muted-foreground`}>Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={isSignIn ? "current-password" : "new-password"}
                      className={`${inputClass} pr-12`}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-0 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-180 ease-spring hover:bg-secondary/50 hover:text-foreground focus-visible:bg-secondary/50"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.p
                      key={error}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ type: "tween", duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-xs leading-5 text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={pending}
                  className="button-lift inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-180 ease-spring hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60 lg:min-h-14"
                >
                  {pending ? "Signing in..." : isSignIn ? "Sign in" : "Create account"}
                  {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
                </button>
              </form>

              <div className={`my-3 flex items-center gap-4 ${microLabelClass} text-muted-foreground lg:my-6`}><span className="h-px flex-1 bg-border" /><span>or</span><span className="h-px flex-1 bg-border" /></div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={pending}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors duration-180 ease-spring hover:border-foreground/40 hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-60 lg:min-h-14"
              >
                <FcGoogle className="size-5" aria-hidden="true" />
                Continue with Google
              </button>

              <p className="mt-3 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground lg:mt-7 lg:pt-5">
                {isSignIn ? "New to ideator.dev?" : "Already have an account?"}{" "}
                <Link href={alternateHref} className="cursor-pointer font-semibold text-foreground underline decoration-primary/70 underline-offset-4 transition-colors duration-200 ease-spring hover:text-primary">
                  {isSignIn ? "Create an account" : "Sign in"}
                </Link>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}