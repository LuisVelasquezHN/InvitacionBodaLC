import { g as getAllGuests, c as createGuest, u as updateGuest, d as deleteGuest } from '../../../chunks/db_p_rTcPed.mjs';
import { v as verifyAdmin, u as unauthorizedResponse } from '../../../chunks/auth_DRAATzGE.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorizedResponse();
  const guests = await getAllGuests();
  const sorted = guests.sort((a, b) => a.id - b.id);
  return new Response(JSON.stringify(sorted), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    const { personas, slug, categoria } = body;
    if (!personas || !Array.isArray(personas) || personas.length === 0 || !slug) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos una persona y un slug." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (personas.length > 2) {
      return new Response(
        JSON.stringify({ error: "Máximo 2 personas por invitación." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await createGuest({
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      personas: personas.filter((p) => p.trim()).map((p) => p.trim()),
      categoria: categoria || "ambos",
      confirmado: false,
      cantidadConfirmada: null,
      mensaje: "",
      fechaConfirmacion: null,
      activo: true
    });
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ message: "Invitación creada correctamente." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error al crear invitación." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const PUT = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    const { slug, updates } = body;
    if (!slug || !updates) {
      return new Response(
        JSON.stringify({ error: "Slug y updates son requeridos." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await updateGuest(slug, updates);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ message: "Invitación actualizada." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error al actualizar." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const DELETE = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorizedResponse();
  try {
    const body = await request.json();
    const { slug } = body;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Slug es requerido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await deleteGuest(slug);
    return new Response(
      JSON.stringify({ message: "Invitación eliminada." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error al eliminar." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
