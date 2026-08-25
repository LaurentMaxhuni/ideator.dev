export type AccountStatus = {
  emailVerified: boolean;
  exists: boolean;
  hasPassword: boolean;
};

export async function getAccountStatus(email: string): Promise<AccountStatus> {
  const response = await fetch("/api/auth/account-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const payload = (await response.json().catch(() => null)) as (AccountStatus & { error?: string }) | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.error || "We could not check this account. Try again in a moment.");
  }

  return payload;
}
