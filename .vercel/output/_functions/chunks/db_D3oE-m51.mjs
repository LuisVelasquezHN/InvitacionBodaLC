function getConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || "https://precious-mite-78226.upstash.io";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAATGSAAIgcDJmMzRjMjczN2I3YWY0ZWI3ODk0ODVjY2NlM2UxMzEwMw";
  return { url, token };
}
async function redis(command) {
  const { url, token } = getConfig();
  const res = await fetch(`${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}
async function getGuest(slug) {
  const raw = await redis(["GET", `guest:${slug}`]);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}
async function getAllGuests() {
  const slugs = await redis(["SMEMBERS", "guests:index"]);
  if (!slugs || slugs.length === 0) return [];
  const pipeline = slugs.map((s) => ["GET", `guest:${s}`]);
  const { url, token } = getConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pipeline)
  });
  const results = await res.json();
  return results.map((r) => {
    if (!r.result) return null;
    return typeof r.result === "string" ? JSON.parse(r.result) : r.result;
  }).filter((g) => g !== null);
}
async function confirmGuest(slug, cantidad, mensaje) {
  const guest = await getGuest(slug);
  if (!guest) return { success: false, error: "Invitación no encontrada." };
  if (!guest.activo) return { success: false, error: "Esta invitación ya no está activa." };
  if (guest.confirmado) return { success: false, error: "Ya has confirmado tu asistencia previamente." };
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
  await redis(["SET", `guest:${slug}`, JSON.stringify(updated)]);
  return { success: true };
}
async function declineGuest(slug, mensaje) {
  const guest = await getGuest(slug);
  if (!guest) return { success: false, error: "Invitación no encontrada." };
  if (!guest.activo) return { success: false, error: "Esta invitación ya no está activa." };
  if (guest.confirmado) return { success: false, error: "Ya has confirmado tu asistencia previamente." };
  const updated = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: 0,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: (/* @__PURE__ */ new Date()).toISOString()
  };
  await redis(["SET", `guest:${slug}`, JSON.stringify(updated)]);
  return { success: true };
}
async function updateGuest(slug, updates) {
  const guest = await getGuest(slug);
  if (!guest) return { success: false, error: "Invitado no encontrado." };
  const updated = { ...guest, ...updates };
  if (updates.confirmado === false) {
    updated.cantidadConfirmada = null;
    updated.fechaConfirmacion = null;
  }
  await redis(["SET", `guest:${slug}`, JSON.stringify(updated)]);
  return { success: true };
}
async function createGuest(data) {
  const existing = await getGuest(data.slug);
  if (existing) return { success: false, error: "Ya existe una invitación con ese slug." };
  const allGuests = await getAllGuests();
  const maxId = allGuests.reduce((max, g) => Math.max(max, g.id), 0);
  const guest = { ...data, id: maxId + 1 };
  await redis(["SET", `guest:${guest.slug}`, JSON.stringify(guest)]);
  await redis(["SADD", "guests:index", guest.slug]);
  return { success: true };
}
async function deleteGuest(slug) {
  await redis(["DEL", `guest:${slug}`]);
  await redis(["SREM", "guests:index", slug]);
  return { success: true };
}

export { declineGuest as a, confirmGuest as b, createGuest as c, deleteGuest as d, getGuest as e, getAllGuests as g, updateGuest as u };
