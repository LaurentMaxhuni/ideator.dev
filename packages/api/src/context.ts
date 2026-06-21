type ClerkContextAuth = {
  userId: string | null;
};

type ClerkRequestContext = {
  auth: ClerkContextAuth | null;
  session: null;
};

function toClerkContextAuth(auth: { userId: string | null } | null): ClerkContextAuth | null {
  return auth ? { userId: auth.userId } : null;
}

import { createClerkClient } from "@clerk/backend";
import { env } from "@ideator.dev/env/server";

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
});

async function authenticateClerkRequest(request: Request): Promise<ClerkContextAuth | null> {
  const requestState = await clerkClient.authenticateRequest(request, {
    authorizedParties: [env.CORS_ORIGIN],
  });
  return toClerkContextAuth(requestState.toAuth());
}

import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest): Promise<ClerkRequestContext> {
  const clerkAuth = await authenticateClerkRequest(req);
  return {
    auth: clerkAuth,
    session: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
