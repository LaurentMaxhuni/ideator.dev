import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-background" aria-busy="true" />}>
      <LoginForm initialMode="sign-up" />
    </Suspense>
  );
}
