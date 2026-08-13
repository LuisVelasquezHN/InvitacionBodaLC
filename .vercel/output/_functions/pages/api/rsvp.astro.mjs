import { a as declineGuest, b as confirmGuest } from '../../chunks/db_DxjkZYFF.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, asistencia, cantidad, mensaje } = body;
    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "Invitación inválida." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (asistencia === "no") {
      const result = await declineGuest(slug, mensaje || "");
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ message: "Lamentamos que no puedas asistir. ¡Gracias por avisarnos!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (asistencia === "si") {
      const cantidadNum = parseInt(cantidad, 10);
      if (isNaN(cantidadNum) || cantidadNum < 1) {
        return new Response(
          JSON.stringify({ error: "Cantidad inválida." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const result = await confirmGuest(slug, cantidadNum, mensaje || "");
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ message: "¡Confirmación exitosa! Nos vemos el 20 de Febrero. 🎉" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Selecciona si asistirás o no." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al procesar tu confirmación." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
