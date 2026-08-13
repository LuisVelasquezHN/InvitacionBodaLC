import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  const admin = process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD;

  return new Response(JSON.stringify({
    status: "ok",
    env: {
      UPSTASH_REDIS_REST_URL: url ? "✓" : "✗ FALTA",
      UPSTASH_REDIS_REST_TOKEN: token ? "✓" : "✗ FALTA",
      ADMIN_PASSWORD: admin ? "✓" : "✗ FALTA",
    },
    source: process.env.UPSTASH_REDIS_REST_URL ? "process.env" : "import.meta.env"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
