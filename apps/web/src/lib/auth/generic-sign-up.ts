type SignUpForwarder = (request: Request) => Promise<Response>;

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

function unavailable() {
  return Response.json(
    { error: "Authentication is temporarily unavailable." },
    { status: 503, headers: responseHeaders },
  );
}

export async function handleGenericSignUp(request: Request, forward: SignUpForwarder) {
  let upstream: Response;

  try {
    upstream = await forward(request);
  } catch {
    return unavailable();
  }

  if (upstream.status >= 500) {
    return unavailable();
  }

  return Response.json({ accepted: true }, { status: 202, headers: responseHeaders });
}
