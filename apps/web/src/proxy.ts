import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";

const neonAuthMiddleware = auth?.middleware({ loginUrl: "/login" });

function fallbackMiddleware(request: NextRequest) {
  const next = request.nextUrl.clone();
  next.pathname = "/login";
  next.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(next);
}

export default function proxy(request: NextRequest) {
  if (neonAuthMiddleware) {
    return neonAuthMiddleware(request);
  }

  return fallbackMiddleware(request);
}

export const config = {
  matcher: ["/app/:path*"],
};
