"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth/client";
import { emailsMatch } from "@/lib/auth/email";

const inputClass =
  "auth-input mt-1 min-h-11 w-full rounded-md border border-input bg-card/40 px-3 text-base text-foreground outline-none transition-[border-color,background-color] duration-200 ease-spring placeholder:text-muted-foreground/60 hover:bg-card/60 focus:border-primary focus:bg-card/60";
const fieldLabelClass = "auth-field-label text-sm font-medium text-foreground/85";
const RESEND_NOTICE = "If an account can be verified, a new code will be sent.";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const result = await authClient.emailOtp.verifyEmail({ email: normalizedEmail, otp: code });

      if (result.error) {
        setError("We could not verify that code. Check it and try again.");
        return;
      }

      const session = await authClient.getSession();

      if (session.data?.session && emailsMatch(session.data.user?.email, normalizedEmail)) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      router.replace(`/login?${new URLSearchParams({ verified: "1", email: normalizedEmail, next: nextPath }).toString()}`);
    } catch {
      setError("We could not verify that code. Check it and try again.");
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
      await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "email-verification",
      });
      setNotice(RESEND_NOTICE);
    } catch {
      setNotice(RESEND_NOTICE);
    } finally {
      setResending(false);
    }
  }

  const footer = (
    <div className="auth-footer mt-3 flex min-h-11 items-center justify-between gap-3 text-sm text-muted-foreground">
      <Link href={loginHref} className="inline-flex min-h-11 items-center font-semibold text-foreground underline decoration-primary/70 underline-offset-4 hover:text-primary">
        Back to sign in
      </Link>
      <Link href={signupHref} className="inline-flex min-h-11 items-center font-semibold text-foreground underline decoration-primary/70 underline-offset-4 hover:text-primary">
        Create account
      </Link>
    </div>
  );

  return (
    <AuthShell
      title="Verify your email"
      description="Enter the six-digit code we sent to your email. Codes expire after 15 minutes."
      footer={footer}
    >
      <form onSubmit={handleVerify} className="auth-form grid gap-3" aria-busy={pending}>
        <div className="auth-form-field">
          <label htmlFor="verification-email" className={fieldLabelClass}>
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

        <div className="auth-form-field">
          <label htmlFor="verification-code" className={fieldLabelClass}>
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
            className={`${inputClass} font-mono text-xl tracking-[0.2em] tabular-nums`}
            placeholder="000000"
          />
        </div>

        {(error || notice) && (
          <p
            className={`auth-message rounded-md border px-3 py-2 text-sm leading-5 ${error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-accent/40 bg-accent/10 text-accent"}`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            {error || notice}
          </p>
        )}

        <div className="auth-form-actions grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <button
            type="submit"
            disabled={pending || resending || code.length !== 6}
            className="auth-button inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifying..." : "Verify email"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={pending || resending || !email.trim()}
            className="auth-button inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-input bg-card/30 px-4 text-sm font-semibold text-foreground hover:border-foreground/40 hover:bg-card/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCw className={`size-4 ${resending ? "animate-spin" : ""}`} aria-hidden="true" />
            {resending ? "Sending..." : "Resend"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
