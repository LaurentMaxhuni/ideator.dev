import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const MAX_BODY_BYTES = 1_024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccountRow = {
  emailVerified: boolean;
  hasPassword: boolean;
};

export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return Response.json({ error: "Account lookup is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();

  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: "The request is too large." }, { status: 413 });
  }

  let email = "";

  try {
    const body = JSON.parse(rawBody) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql`
      SELECT
        u."emailVerified" AS "emailVerified",
        EXISTS (
          SELECT 1
          FROM neon_auth.account a
          WHERE a."userId" = u.id
            AND a."providerId" = 'credential'
        ) AS "hasPassword"
      FROM neon_auth."user" u
      WHERE lower(u.email) = ${email}
      LIMIT 1
    `) as AccountRow[];
    const account = rows[0];

    return Response.json(
      {
        exists: Boolean(account),
        emailVerified: account?.emailVerified === true,
        hasPassword: account?.hasPassword === true,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("auth_account_status_failed", error);
    return Response.json({ error: "We could not check this account. Try again in a moment." }, { status: 503 });
  }
}
