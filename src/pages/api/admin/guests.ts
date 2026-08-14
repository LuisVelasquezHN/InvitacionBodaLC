import type { APIRoute } from "astro";
import { getAllGuests, updateGuest, createGuest, deleteGuest, renameGuestSlug } from "../../../lib/db";
import { verifyAdmin, unauthorizedResponse } from "../../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const guests = await getAllGuests();
  const sorted = guests.sort((a, b) => a.id - b.id);

  return new Response(JSON.stringify(sorted), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
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
      personas: personas.filter((p: string) => p.trim()).map((p: string) => p.trim()),
      categoria: categoria || "ambos",
      confirmado: false,
      cantidadConfirmada: null,
      mensaje: "",
      fechaConfirmacion: null,
      activo: true,
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

export const PUT: APIRoute = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { slug, newSlug, updates } = body;

    if (!slug || !updates) {
      return new Response(
        JSON.stringify({ error: "Slug y updates son requeridos." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si se cambió el slug, renombrar primero
    if (newSlug && newSlug !== slug) {
      const renameResult = await renameGuestSlug(slug, newSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""));
      if (!renameResult.success) {
        return new Response(
          JSON.stringify({ error: renameResult.error }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      // Actualizar con el nuevo slug
      const result = await updateGuest(newSlug.toLowerCase().replace(/[^a-z0-9-]/g, ""), updates);
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      const result = await updateGuest(slug, updates);
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
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

export const DELETE: APIRoute = async ({ request }) => {
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
