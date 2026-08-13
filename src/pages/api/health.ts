import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const hasUrl = !!import.meta.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  const hasAdmin = !!import.meta.env.ADMIN_PASSWORD;

  return new Response(JSON.stringify({
    status: "ok",
    env: {
      UPSTASH_REDIS_REST_URL: hasUrl ? "✓ configurada" : "✗ FALTA",
      UPSTASH_REDIS_REST_TOKEN: hasToken ? "✓ configurada" : "✗ FALTA",
      ADMIN_PASSWORD: hasAdmin ? "✓ configurada" : "✗ FALTA",
    }
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
