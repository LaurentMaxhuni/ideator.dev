"use client";

import { ArrowLeft, ArrowRight, MailCheck, RotateCw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { getAccountStatus } from "@/lib/auth/account-status";
import { authClient } from "@/lib/auth/client";

const inputClass =
  "mt-1 min-h-12 w-full border-0 bg-transparent px-0 py-2 text-base text-foreground outline-none transition-colors duration-200 ease-spring placeholder:text-muted-foreground/50 lg:text-[1.05rem]";
const fieldLabelClass = "text-xs font-semibold uppercase tracking-[0.1em]";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState(searchParams.get("email")?.trim().toLowerCase() ?? "");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const nextPath = safeNextPath(searchParams.get("next"));
  const loginHref = `/login?${new URLSearchParams({ email, next: nextPath }).toString()}`;
  const signupHref = `/signup?${new URLSearchParams({ email, next: nextPath }).toString()}`;

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const account = await getAccountStatus(normalizedEmail);

      if (!account.exists) {
        setError("No account exists for this email. Register before requesting a verification code.");
        return;
      }

      if (account.emailVerified) {
        router.replace(`/login?${new URLSearchParams({ verified: "1", email: normalizedEmail, next: nextPath }).toString()}`);
        return;
      }

      const result = await authClient.emailOtp.verifyEmail({ email: normalizedEmail, otp: code });

      if (result.error) {
        setError(result.error.message || "That code is invalid or expired. Request a new code and try again.");
        return;
      }

      const session = await authClient.getSession();

      if (session.data?.session && session.data.user) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      router.replace(`/login?${new URLSearchParams({ verified: "1", email: normalizedEmail, next: nextPath }).toString()}`);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Email verification failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleResend() {
    setError("");
    setNotice("");
    setResending(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const account = await getAccountStatus(normalizedEmail);

      if (!account.exists) {
        setError("No account exists for this email. Register before requesting a verification code.");
        return;
      }

      if (account.emailVerified) {
        setNotice("This email is already verified. You can sign in now.");
        return;
      }

      const result = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "email-verification",
      });

      if (result.error) {
        setError(result.error.message || "We could not send a new code. Try again in a moment.");
        return;
      }

      setNotice("A new verification code is on its way. It expires in 15 minutes.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "We could not send a new code. Try again.");
    } finally {
      setResending(false);
    }
  }

  const footer = (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground lg:mt-5">
      <Link href={loginHref} className="inline-flex min-h-10 items-center gap-2 font-semibold text-foreground underline decoration-primary/70 underline-offset-4 hover:text-primary">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Sign in
      </Link>
      <Link href={signupHref} className="inline-flex min-h-10 items-center font-semibold text-foreground underline decoration-primary/70 underline-offset-4 hover:text-primary">
        Register instead
      </Link>
    </div>
  );

  return (
    <AuthShell
      eyebrow="email verification"
      title="Check your inbox."
      step="03"
      description="Enter the verification code sent to your email. Codes expire after 15 minutes."
      footer={footer}
    >
      <div className="mt-5 flex items-start gap-3 border border-border bg-card/45 px-4 py-3 text-sm leading-6 text-muted-foreground lg:mt-6">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        <p>Verification keeps private workspaces tied to an email you control.</p>
      </div>

      <form onSubmit={handleVerify} className="mt-5 space-y-5 lg:mt-6 lg:space-y-5" aria-busy={pending}>
        <div className="border-b border-border pb-1 transition-colors duration-200 ease-spring focus-within:border-primary">
          <label htmlFor="verification-email" className={`${fieldLabelClass} block text-muted-foreground`}>
            Email
          </label>
          <input
            id="verification-email"
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
          <label htmlFor="verification-code" className={`${fieldLabelClass} block text-muted-foreground`}>
            Verification code
          </label>
          <input
            id="verification-code"
            required
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            minLength={6}
            maxLength={6}
            className={`${inputClass} font-mono text-2xl tracking-[0.32em] tabular-nums sm:text-3xl`}
            placeholder="000000"
            aria-describedby="verification-code-help"
          />
          <p id="verification-code-help" className="pb-2 text-xs leading-5 text-muted-foreground">
            Enter the six-digit code exactly as shown in the email.
          </p>
        </div>

        <AnimatePresence initial={false}>
          {(error || notice) && (
            <motion.p
              key={error || notice}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ type: "tween", duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`border-l-2 px-4 py-3 text-xs leading-5 ${error ? "border-destructive bg-destructive/10 text-destructive" : "border-accent bg-accent/10 text-accent"}`}
              role={error ? "alert" : "status"}
              aria-live="polite"
            >
              {error || notice}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={pending || resending || code.length !== 6}
          className="button-lift inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-180 ease-spring hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-14"
        >
          {pending ? "Verifying..." : "Verify email"}
          {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={pending || resending || !email.trim()}
        className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors duration-180 ease-spring hover:border-foreground/40 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RotateCw className={`size-4 ${resending ? "animate-spin" : ""}`} aria-hidden="true" />
        {resending ? "Sending a new code..." : "Resend code"}
      </button>
    </AuthShell>
  );
}
