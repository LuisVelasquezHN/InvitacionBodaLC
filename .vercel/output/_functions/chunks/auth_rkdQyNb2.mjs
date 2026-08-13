function verifyAdmin(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }
  const encoded = authHeader.slice(6);
  const decoded = atob(encoded);
  const [, password] = decoded.split(":");
  return password === "a123456b";
}
function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "No autorizado" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'Basic realm="Admin"'
    }
  });
}

export { unauthorizedResponse as u, verifyAdmin as v };
