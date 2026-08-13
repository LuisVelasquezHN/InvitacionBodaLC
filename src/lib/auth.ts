export function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice(6);
  const decoded = atob(encoded);
  const [, password] = decoded.split(":");

  return password === import.meta.env.ADMIN_PASSWORD;
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "No autorizado" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}
