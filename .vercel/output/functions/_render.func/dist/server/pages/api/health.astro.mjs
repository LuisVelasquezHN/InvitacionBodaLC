export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async () => {
  process.env.UPSTASH_REDIS_REST_URL || "https://precious-mite-78226.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAATGSAAIgcDJmMzRjMjczN2I3YWY0ZWI3ODk0ODVjY2NlM2UxMzEwMw";
  process.env.ADMIN_PASSWORD || "a123456b";
  return new Response(JSON.stringify({
    status: "ok",
    env: {
      UPSTASH_REDIS_REST_URL: "✓" ,
      UPSTASH_REDIS_REST_TOKEN: "✓" ,
      ADMIN_PASSWORD: "✓" 
    },
    source: process.env.UPSTASH_REDIS_REST_URL ? "process.env" : "import.meta.env"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
