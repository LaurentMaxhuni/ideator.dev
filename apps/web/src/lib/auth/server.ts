import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

const authConfig = baseUrl && cookieSecret && cookieSecret.length >= 32
  ? {
      baseUrl,
      cookies: { secret: cookieSecret },
    }
  : null;

export const neonAuthConfigured = Boolean(authConfig);

export const auth: NeonAuth | null = authConfig ? createNeonAuth(authConfig) : null;

export async function getAuthSession() {
  if (!auth) {
    return null;
  }

  try {
    const result = await auth.getSession();
    return result.data?.user ? result.data : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/app");
  }

  return user;
}
