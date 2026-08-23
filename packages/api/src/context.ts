type AuthContextAuth = {
  userId: string | null;
};

type AuthRequestContext = {
  auth: AuthContextAuth | null;
  session: null;
};

import type { NextRequest } from "next/server";

export async function createContext(_req: NextRequest): Promise<AuthRequestContext> {
  return {
    auth: null,
    session: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
