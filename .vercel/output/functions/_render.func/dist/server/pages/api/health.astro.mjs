export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async () => {
  return new Response(JSON.stringify({
    status: "ok",
    env: {
      UPSTASH_REDIS_REST_URL: "✓ configurada" ,
      UPSTASH_REDIS_REST_TOKEN: "✓ configurada" ,
      ADMIN_PASSWORD: "✓ configurada" 
    }
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
