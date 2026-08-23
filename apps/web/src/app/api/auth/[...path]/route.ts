import { auth } from "@/lib/auth/server";

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

type AuthHandler = NonNullable<typeof auth> extends infer T
  ? T extends { handler: () => infer H }
    ? H
    : never
  : never;

const handlers: AuthHandler | null = auth?.handler() ?? null;

function unavailable() {
  return Response.json(
    { error: "Neon Auth is not configured. Add NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET." },
    { status: 503 },
  );
}

export async function GET(request: Request, context: AuthRouteContext) {
  return handlers ? handlers.GET(request, context) : unavailable();
}

export async function POST(request: Request, context: AuthRouteContext) {
  return handlers ? handlers.POST(request, context) : unavailable();
}

export async function PUT(request: Request, context: AuthRouteContext) {
  return handlers ? handlers.PUT(request, context) : unavailable();
}

export async function DELETE(request: Request, context: AuthRouteContext) {
  return handlers ? handlers.DELETE(request, context) : unavailable();
}

export async function PATCH(request: Request, context: AuthRouteContext) {
  return handlers ? handlers.PATCH(request, context) : unavailable();
}
