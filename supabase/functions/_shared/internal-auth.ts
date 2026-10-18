const encoder = new TextEncoder();

// Compares without exiting early, so response timing does not leak
// how many leading characters of a guess were correct.
function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

// Returns a Response to send back if the caller is not allowed,
// or null if the caller may continue.
export function requireInternalSecret(req: Request): Response | null {
  const expected = Deno.env.get("INTERNAL_SECRET");

  // Fail closed: a missing secret must never mean "allow everyone"
  if (!expected) {
    console.error("INTERNAL_SECRET is not set on this project");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!safeEqual(provided, expected)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}