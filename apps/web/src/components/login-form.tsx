"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth/client";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
  initialMode?: AuthMode;
};

const inputClass =
  "auth-input mt-1 min-h-11 w-full rounded-md border border-input bg-card/40 px-3 text-base text-foreground outline-none transition-[border-color,background-color] duration-200 ease-spring placeholder:text-muted-foreground/60 hover:bg-card/60 focus:border-primary focus:bg-card/60";
const fieldLabelClass = "auth-field-label text-sm font-medium text-foreground/85";
const SIGN_IN_FAILURE = "We could not sign you in. Check your details and try again.";
const SIGN_UP_FAILURE = "We could not create your account. Try again.";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

function verificationHref(email: string, nextPath: string) {
  return `/verify-email?${new URLSearchParams({ email, next: nextPath }).toString()}`;
}

export function LoginForm({ initialMode = "sign-in" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignIn = initialMode === "sign-in";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email")?.trim().toLowerCase() ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const nextPath = safeNextPath(searchParams.get("next"));
  const query = new URLSearchParams({ next: nextPath });
  if (email.trim()) query.set("email", email.trim().toLowerCase());
  const alternateHref = `${isSignIn ? "/signup" : "/login"}?${query.toString()}`;
  const verifyHref = verificationHref(email.trim().toLowerCase(), nextPath);
  const verifiedNotice = isSignIn && searchParams.get("verified") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isSignIn) {
        const result = await authClient.signIn.email({ email: normalizedEmail, password });

        if (result.error) {
          setError(SIGN_IN_FAILURE);
          return;
        }

        if (!result.data?.user) {
          setError(SIGN_IN_FAILURE);
          return;
        }

        const session = await authClient.getSession();

        if (!session.data?.session || session.data.user?.email.toLowerCase() !== normalizedEmail) {
          setError(SIGN_IN_FAILURE);
          return;
        }

        router.replace(nextPath);
        router.refresh();
        return;
      }

      const result = await authClient.signUp.email({
        name: name.trim() || normalizedEmail.split("@")[0] || "Builder",
        email: normalizedEmail,
        password,
      });

      if (result.error) {
        setError(SIGN_UP_FAILURE);
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
        setError("Your account was created. Sign in to continue.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError(isSignIn ? SIGN_IN_FAILURE : SIGN_UP_FAILURE);
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
        setError("Google sign-in is unavailable. Try again.");
      }
    } catch {
      setError("Google sign-in is unavailable. Try again.");
    } finally {
      setPending(false);
    }
  }

  const footer = (
    <div className={`auth-footer mt-3 flex min-h-11 items-center gap-3 text-sm text-muted-foreground ${isSignIn ? "justify-between" : "justify-center"}`}>
      <p className="flex items-center gap-1">
        {isSignIn ? "Need an account?" : "Have an account?"}
        <Link href={alternateHref} className="inline-flex min-h-11 items-center font-semibold text-foreground underline decoration-primary/70 underline-offset-4 hover:text-primary">
          {isSignIn ? "Register" : "Sign in"}
        </Link>
      </p>
      {isSignIn && (
        <Link href={verifyHref} className="inline-flex min-h-11 items-center font-semibold text-foreground underline decoration-primary/70 underline-offset-4 hover:text-primary">
          Verify email
        </Link>
      )}
    </div>
  );

  return (
    <AuthShell
      title={isSignIn ? "Sign in" : "Create account"}
      description={isSignIn ? "Use your account email and password." : "Create an account to save and revisit your work."}
      footer={footer}
    >
      {verifiedNotice && (
        <p className="auth-message mb-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent" role="status">
          Email verified. You can sign in now.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={`auth-form grid gap-3 ${isSignIn ? "" : "auth-form-signup"}`}
        aria-busy={pending}
      >
        {!isSignIn && (
          <div className="auth-form-field">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="name" className={fieldLabelClass}>
                Name
              </label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className={inputClass}
              placeholder="Your name"
            />
          </div>
        )}

        <div className="auth-form-field">
          <label htmlFor="email" className={fieldLabelClass}>
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

        <div className="auth-form-field auth-form-field-password">
          <label htmlFor="password" className={fieldLabelClass}>
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
              placeholder="8 characters minimum"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground focus-visible:bg-secondary/50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-message rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm leading-5 text-destructive" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="auth-button inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (isSignIn ? "Signing in..." : "Creating account...") : isSignIn ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="auth-divider my-3 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={pending}
        className="auth-button inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-input bg-card/30 px-5 text-sm font-semibold text-foreground hover:border-foreground/40 hover:bg-card/60 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
      >
        <FcGoogle className="size-5" aria-hidden="true" />
        {isSignIn ? "Sign in with Google" : "Sign up with Google"}
      </button>
    </AuthShell>
  );
}
