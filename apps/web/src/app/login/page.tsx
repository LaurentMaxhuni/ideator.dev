import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-background" aria-busy="true" />}>
      <LoginForm initialMode="sign-in" />
    </Suspense>
  );
}
