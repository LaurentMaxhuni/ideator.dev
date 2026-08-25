"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { getAccountStatus } from "@/lib/auth/account-status";
import { authClient } from "@/lib/auth/client";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
  initialMode?: AuthMode;
};

const inputClass =
  "mt-1 min-h-10 w-full border-0 bg-transparent px-0 py-1 text-base text-foreground outline-none transition-colors duration-200 ease-spring placeholder:text-muted-foreground/50 lg:min-h-12 lg:py-2 lg:text-[1.05rem]";
const microLabelClass = "text-[0.68rem] font-semibold uppercase tracking-[0.12em]";
const fieldLabelClass = "text-xs font-semibold uppercase tracking-[0.1em]";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

function verificationHref(email: string, nextPath: string) {
  return `/verify-email?${new URLSearchParams({ email, next: nextPath }).toString()}`;
}

export function LoginForm({ initialMode = "sign-in" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const isSignIn = initialMode === "sign-in";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email")?.trim().toLowerCase() ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [suggestRegistration, setSuggestRegistration] = useState(false);

  const nextPath = safeNextPath(searchParams.get("next"));
  const query = new URLSearchParams({ next: nextPath });
  if (email.trim()) query.set("email", email.trim().toLowerCase());
  const alternateHref = `${isSignIn ? "/signup" : "/login"}?${query.toString()}`;
  const verifiedNotice = isSignIn && searchParams.get("verified") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuggestRegistration(false);
    setPending(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const account = await getAccountStatus(normalizedEmail);

      if (isSignIn) {
        if (!account.exists) {
          setSuggestRegistration(true);
          setError("No account exists for this email. Register first, then come back to sign in.");
          return;
        }

        if (!account.hasPassword) {
          setError("This account does not have a password. Continue with Google instead.");
          return;
        }

        if (!account.emailVerified) {
          const sendResult = await authClient.emailOtp.sendVerificationOtp({
            email: normalizedEmail,
            type: "email-verification",
          });

          if (sendResult.error) {
            setError(sendResult.error.message || "We could not send a verification code. Try again in a moment.");
            return;
          }

          router.push(verificationHref(normalizedEmail, nextPath));
          return;
        }

        const result = await authClient.signIn.email({ email: normalizedEmail, password });

        if (result.error) {
          setError(result.error.message || "The password is incorrect. Try again.");
          return;
        }

        if (!result.data?.user) {
          setError("Sign-in did not create a session. Check your details and try again.");
          return;
        }

        const session = await authClient.getSession();

        if (!session.data?.session || session.data.user?.email.toLowerCase() !== normalizedEmail) {
          setError("Sign-in did not create a session. Check your details and try again.");
          return;
        }

        router.replace(nextPath);
        router.refresh();
        return;
      }

      if (account.exists) {
        setError("An account already exists for this email. Sign in instead.");
        return;
      }

      const result = await authClient.signUp.email({
        name: name.trim() || normalizedEmail.split("@")[0] || "Builder",
        email: normalizedEmail,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Account creation failed. Check your details and try again.");
        return;
      }

      if (result.data?.user && !result.data.user.emailVerified) {
        router.push(verificationHref(normalizedEmail, nextPath));
        return;
      }

      if (!result.data?.user) {
        router.push(verificationHref(normalizedEmail, nextPath));
        return;
      }

      const session = await authClient.getSession();

      if (!session.data?.session || session.data.user?.email.toLowerCase() !== normalizedEmail) {
        setError("Your account exists, but a secure session was not created. Sign in to continue.");
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
    setSuggestRegistration(false);
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

  const footer = (
    <p className="mt-3 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground lg:mt-5 lg:pt-4">
      {isSignIn ? "New to ideator.dev?" : "Already have an account?"}{" "}
      <Link
        href={alternateHref}
        className="cursor-pointer font-semibold text-foreground underline decoration-primary/70 underline-offset-4 transition-colors duration-200 ease-spring hover:text-primary"
      >
        {isSignIn ? "Create an account" : "Sign in"}
      </Link>
    </p>
  );

  return (
    <AuthShell
      eyebrow={isSignIn ? "returning builder" : "new builder"}
      title={isSignIn ? "Welcome back." : "Create your account."}
      step={isSignIn ? "01" : "02"}
      description={isSignIn ? "Use the verified email attached to your account." : "One rough thought is enough to begin. You can shape the rest inside."}
      footer={footer}
    >
      {verifiedNotice && (
        <p className="mt-4 border-l-2 border-accent bg-accent/10 px-4 py-3 text-xs leading-5 text-accent" role="status">
          Email verified. Sign in to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 lg:mt-7 lg:space-y-5" aria-busy={pending}>
        {!isSignIn && (
          <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="name" className={`${fieldLabelClass} text-muted-foreground`}>
                Name
              </label>
              <span className="text-[0.68rem] text-muted-foreground/80">optional</span>
            </div>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className={inputClass}
              placeholder="How should we greet you?"
            />
          </div>
        )}

        <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
          <label htmlFor="email" className={`${fieldLabelClass} block text-muted-foreground`}>
            Email
          </label>
          <input
            id="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
          <label htmlFor="password" className={`${fieldLabelClass} block text-muted-foreground`}>
            Password
          </label>
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
            <motion.div
              key={error}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ type: "tween", duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-xs leading-5 text-destructive"
              role="alert"
              aria-live="polite"
            >
              <p>{error}</p>
              {suggestRegistration && (
                <Link href={alternateHref} className="mt-2 inline-flex font-semibold underline underline-offset-4 hover:text-foreground">
                  Register this email
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={pending}
          className="button-lift inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-180 ease-spring hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60 lg:min-h-14"
        >
          {pending ? (isSignIn ? "Checking account..." : "Creating account...") : isSignIn ? "Sign in" : "Create account"}
          {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <div className={`my-3 flex items-center gap-4 ${microLabelClass} text-muted-foreground lg:my-4`}>
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={pending}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors duration-180 ease-spring hover:border-foreground/40 hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-60 lg:min-h-14"
      >
        <FcGoogle className="size-5" aria-hidden="true" />
        Continue with Google
      </button>
    </AuthShell>
  );
}
