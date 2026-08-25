type SignUpForwarder = (request: Request) => Promise<Response>;

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

export async function handleGenericSignUp(request: Request, forward: SignUpForwarder) {
  try {
    await forward(request);
  } catch {
    return Response.json(
      { error: "Authentication is temporarily unavailable." },
      { status: 503, headers: responseHeaders },
    );
  }

  return Response.json({ accepted: true }, { status: 202, headers: responseHeaders });
}
