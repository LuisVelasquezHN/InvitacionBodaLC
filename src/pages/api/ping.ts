export const prerender = false;

export function GET() {
  return new Response(JSON.stringify({ ok: true, time: Date.now() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
