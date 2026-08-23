"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="button-lift inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background/50 px-3 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut className="size-3.5" aria-hidden="true" />
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
