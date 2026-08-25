import { Suspense } from "react";

import { VerifyEmailForm } from "@/components/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-background" aria-busy="true" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
