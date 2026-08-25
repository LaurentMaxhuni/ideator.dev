import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { emailsMatch } from "./email.ts";
import { handleGenericSignUp } from "./generic-sign-up.ts";

const webRoot = fileURLToPath(new URL("../../../", import.meta.url));
const accountStatusRoute = resolve(webRoot, "src/app/api/auth/account-status/route.ts");
const accountStatusClient = resolve(webRoot, "src/lib/auth/account-status.ts");

test("does not expose an unauthenticated account-status endpoint", () => {
  assert.equal(existsSync(accountStatusRoute), false);
  assert.equal(existsSync(accountStatusClient), false);
});

test("browser auth flows do not preflight account state or surface provider errors", () => {
  const authSources = [
    resolve(webRoot, "src/components/login-form.tsx"),
    resolve(webRoot, "src/components/verify-email-form.tsx"),
  ].map((path) => readFileSync(path, "utf8")).join("\n");

  assert.doesNotMatch(authSources, /account-status|getAccountStatus|DATABASE_URL/);
  assert.doesNotMatch(authSources, /result\.error\.message|authError\.message/);
  assert.doesNotMatch(authSources, /No account found|account already exists|uses Google sign-in|already verified/);
});

test("Neon Auth remains independent of the optional project database", () => {
  const serverAuthSources = [
    resolve(webRoot, "src/lib/auth/server.ts"),
    resolve(webRoot, "src/app/api/auth/[...path]/route.ts"),
  ].map((path) => readFileSync(path, "utf8")).join("\n");

  assert.match(serverAuthSources, /NEON_AUTH_BASE_URL/);
  assert.match(serverAuthSources, /NEON_AUTH_COOKIE_SECRET/);
  assert.doesNotMatch(serverAuthSources, /DATABASE_URL/);
});

test("registration returns the same public response for new and existing accounts", async () => {
  const request = new Request("http://localhost/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ email: "person@example.com", password: "password123" }),
  });

  const accepted = await handleGenericSignUp(request.clone(), async () =>
    Response.json({ user: { email: "person@example.com" } }, { status: 200 }),
  );
  const duplicate = await handleGenericSignUp(request.clone(), async () =>
    Response.json({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" }, { status: 422 }),
  );

  assert.equal(accepted.status, 202);
  assert.equal(duplicate.status, 202);
  assert.equal(await accepted.text(), await duplicate.text());
  assert.equal(accepted.headers.get("Cache-Control"), "no-store");
});

test("registration returns a generic operational failure for upstream 5xx responses", async () => {
  const request = new Request("http://localhost/api/auth/sign-up/email", { method: "POST" });
  const upstream500 = await handleGenericSignUp(request.clone(), async () =>
    Response.json({ error: "upstream database timeout" }, { status: 500 }),
  );
  const upstream503 = await handleGenericSignUp(request.clone(), async () =>
    Response.json({ error: "upstream unavailable" }, { status: 503 }),
  );
  const thrown = await handleGenericSignUp(request.clone(), async () => {
    throw new Error("connection refused");
  });

  assert.equal(upstream500.status, 503);
  assert.equal(upstream503.status, 503);
  assert.equal(thrown.status, 503);
  const [upstream500Body, upstream503Body, thrownBody] = await Promise.all([
    upstream500.text(),
    upstream503.text(),
    thrown.text(),
  ]);
  assert.equal(upstream500Body, upstream503Body);
  assert.equal(upstream503Body, thrownBody);
  assert.equal(upstream500.headers.get("Cache-Control"), "no-store");
});

test("a session must belong to the verified email before continuing", () => {
  assert.equal(emailsMatch(" Person@Example.com ", "person@example.com"), true);
  assert.equal(emailsMatch("other@example.com", "person@example.com"), false);
  assert.equal(emailsMatch(undefined, "person@example.com"), false);
});

test("the auth shell keeps overflowed form controls in an internal scroll region", () => {
  const authShellSource = readFileSync(resolve(webRoot, "src/components/auth-shell.tsx"), "utf8");

  assert.match(authShellSource, /auth-layout[^\"]*overflow-y-auto[^\"]*overscroll-contain/);
  assert.match(authShellSource, /auth-panel my-auto/);
});
