import { g as getAllGuests, c as createGuest, u as updateGuest, d as deleteGuest } from '../../../chunks/db_a4tckmNf.mjs';
import { v as verifyAdmin, u as unauthorizedResponse } from '../../../chunks/auth_rkdQyNb2.mjs';
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
    const { nombre, maxPases, slug, pareja, categoria } = body;
    if (!nombre || !slug) {
      return new Response(
        JSON.stringify({ error: "Nombre y slug son requeridos." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await createGuest({
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      nombre,
      pareja: pareja || "",
      categoria: categoria || "ambos",
      maxPases: maxPases || 1,
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
      JSON.stringify({ message: "Invitado creado correctamente." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Error al crear invitado." }),
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
      JSON.stringify({ message: "Invitado actualizado." }),
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
      JSON.stringify({ message: "Invitado eliminado." }),
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
