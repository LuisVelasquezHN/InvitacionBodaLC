import { Redis } from '@upstash/redis';

let redis = null;
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: "https://precious-mite-78226.upstash.io",
      token: "gQAAAAAAATGSAAIgcDJmMzRjMjczN2I3YWY0ZWI3ODk0ODVjY2NlM2UxMzEwMw"
    });
  }
  return redis;
}
async function getGuest(slug) {
  const db = getRedis();
  const data = await db.get(`guest:${slug}`);
  return data;
}
async function getAllGuests() {
  const db = getRedis();
  const slugs = await db.smembers("guests:index");
  if (!slugs || slugs.length === 0) return [];
  const pipeline = db.pipeline();
  for (const slug of slugs) {
    pipeline.get(`guest:${slug}`);
  }
  const results = await pipeline.exec();
  return results.filter((g) => g !== null);
}
async function confirmGuest(slug, cantidad, mensaje) {
  const db = getRedis();
  const guest = await getGuest(slug);
  if (!guest) {
    return { success: false, error: "Invitación no encontrada." };
  }
  if (!guest.activo) {
    return { success: false, error: "Esta invitación ya no está activa." };
  }
  if (guest.confirmado) {
    return { success: false, error: "Ya has confirmado tu asistencia previamente." };
  }
  if (cantidad > guest.personas.length || cantidad < 1) {
    return { success: false, error: `Solo puedes confirmar entre 1 y ${guest.personas.length} personas.` };
  }
  const updated = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: cantidad,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: (/* @__PURE__ */ new Date()).toISOString()
  };
  await db.set(`guest:${slug}`, updated);
  return { success: true };
}
async function declineGuest(slug, mensaje) {
  const db = getRedis();
  const guest = await getGuest(slug);
  if (!guest) {
    return { success: false, error: "Invitación no encontrada." };
  }
  if (!guest.activo) {
    return { success: false, error: "Esta invitación ya no está activa." };
  }
  if (guest.confirmado) {
    return { success: false, error: "Ya has confirmado tu asistencia previamente." };
  }
  const updated = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: 0,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: (/* @__PURE__ */ new Date()).toISOString()
  };
  await db.set(`guest:${slug}`, updated);
  return { success: true };
}
async function updateGuest(slug, updates) {
  const db = getRedis();
  const guest = await getGuest(slug);
  if (!guest) {
    return { success: false, error: "Invitado no encontrado." };
  }
  const updated = { ...guest, ...updates };
  if (updates.confirmado === false) {
    updated.cantidadConfirmada = null;
    updated.fechaConfirmacion = null;
  }
  await db.set(`guest:${slug}`, updated);
  return { success: true };
}
async function createGuest(data) {
  const db = getRedis();
  const existing = await getGuest(data.slug);
  if (existing) {
    return { success: false, error: "Ya existe una invitación con ese slug." };
  }
  const allGuests = await getAllGuests();
  const maxId = allGuests.reduce((max, g) => Math.max(max, g.id), 0);
  const guest = {
    ...data,
    id: maxId + 1
  };
  await db.set(`guest:${guest.slug}`, guest);
  await db.sadd("guests:index", guest.slug);
  return { success: true };
}
async function deleteGuest(slug) {
  const db = getRedis();
  await db.del(`guest:${slug}`);
  await db.srem("guests:index", slug);
  return { success: true };
}

export { declineGuest as a, confirmGuest as b, createGuest as c, deleteGuest as d, getGuest as e, getAllGuests as g, updateGuest as u };
