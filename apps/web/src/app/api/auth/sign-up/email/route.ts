import { auth } from "@/lib/auth/server";
import { handleGenericSignUp } from "@/lib/auth/generic-sign-up";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!auth) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const handlers = auth.handler();

  return handleGenericSignUp(request, (forwardedRequest) =>
    handlers.POST(forwardedRequest, {
      params: Promise.resolve({ path: ["sign-up", "email"] }),
    }),
  );
}
