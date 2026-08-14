// Cliente Redis via REST API directo (sin SDK, sin dependencias)
// Upstash REST API: https://docs.upstash.com/redis/features/restapi

export interface InvitationData {
  id: number;
  slug: string;
  personas: string[];
  categoria: "luis" | "cesia" | "ambos";
  confirmado: boolean;
  cantidadConfirmada: number | null;
  mensaje: string;
  fechaConfirmacion: string | null;
  activo: boolean;
}

function getConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Missing Redis config");
  return { url, token };
}

async function redis(command: string[]): Promise<any> {
  const { url, token } = getConfig();
  const res = await fetch(`${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export async function getGuest(slug: string): Promise<InvitationData | null> {
  const raw = await redis(["GET", `guest:${slug}`]);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function getAllGuests(): Promise<InvitationData[]> {
  const slugs = await redis(["SMEMBERS", "guests:index"]);
  if (!slugs || slugs.length === 0) return [];

  // Pipeline via multi-command
  const pipeline = slugs.map((s: string) => ["GET", `guest:${s}`]);
  const { url, token } = getConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pipeline),
  });
  const results = await res.json();
  return results
    .map((r: any) => {
      if (!r.result) return null;
      return typeof r.result === "string" ? JSON.parse(r.result) : r.result;
    })
    .filter((g: any): g is InvitationData => g !== null);
}

export async function confirmGuest(
  slug: string,
  cantidad: number,
  mensaje: string
): Promise<{ success: boolean; error?: string }> {
  const guest = await getGuest(slug);
  if (!guest) return { success: false, error: "Invitación no encontrada." };
  if (!guest.activo) return { success: false, error: "Esta invitación ya no está activa." };
  if (guest.confirmado) return { success: false, error: "Ya has confirmado tu asistencia previamente." };
  if (cantidad > guest.personas.length || cantidad < 1) {
    return { success: false, error: `Solo puedes confirmar entre 1 y ${guest.personas.length} personas.` };
  }

  const updated: InvitationData = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: cantidad,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: new Date().toISOString(),
  };
  await redis(["SET", `guest:${slug}`, JSON.stringify(updated)]);
  return { success: true };
}

export async function declineGuest(
  slug: string,
  mensaje: string
): Promise<{ success: boolean; error?: string }> {
  const guest = await getGuest(slug);
  if (!guest) return { success: false, error: "Invitación no encontrada." };
  if (!guest.activo) return { success: false, error: "Esta invitación ya no está activa." };
  if (guest.confirmado) return { success: false, error: "Ya has confirmado tu asistencia previamente." };

  const updated: InvitationData = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: 0,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: new Date().toISOString(),
  };
  await redis(["SET", `guest:${slug}`, JSON.stringify(updated)]);
  return { success: true };
}

export async function updateGuest(
  slug: string,
  updates: Partial<Pick<InvitationData, "personas" | "categoria" | "activo" | "confirmado" | "cantidadConfirmada" | "mensaje">>
): Promise<{ success: boolean; error?: string }> {
  const guest = await getGuest(slug);
  if (!guest) return { success: false, error: "Invitado no encontrado." };

  const updated: InvitationData = { ...guest, ...updates };
  if (updates.confirmado === false) {
    updated.cantidadConfirmada = null;
    updated.fechaConfirmacion = null;
  }
  await redis(["SET", `guest:${slug}`, JSON.stringify(updated)]);
  return { success: true };
}

export async function createGuest(data: Omit<InvitationData, "id">): Promise<{ success: boolean; error?: string }> {
  const existing = await getGuest(data.slug);
  if (existing) return { success: false, error: "Ya existe una invitación con ese slug." };

  const allGuests = await getAllGuests();
  const maxId = allGuests.reduce((max, g) => Math.max(max, g.id), 0);

  const guest: InvitationData = { ...data, id: maxId + 1 };
  await redis(["SET", `guest:${guest.slug}`, JSON.stringify(guest)]);
  await redis(["SADD", "guests:index", guest.slug]);
  return { success: true };
}

export async function deleteGuest(slug: string): Promise<{ success: boolean }> {
  await redis(["DEL", `guest:${slug}`]);
  await redis(["SREM", "guests:index", slug]);
  return { success: true };
}

export async function renameGuestSlug(oldSlug: string, newSlug: string): Promise<{ success: boolean; error?: string }> {
  if (oldSlug === newSlug) return { success: true };
  
  const guest = await getGuest(oldSlug);
  if (!guest) return { success: false, error: "Invitación no encontrada." };
  
  const existing = await getGuest(newSlug);
  if (existing) return { success: false, error: "Ya existe una invitación con ese slug." };
  
  const updated = { ...guest, slug: newSlug };
  await redis(["SET", `guest:${newSlug}`, JSON.stringify(updated)]);
  await redis(["DEL", `guest:${oldSlug}`]);
  await redis(["SREM", "guests:index", oldSlug]);
  await redis(["SADD", "guests:index", newSlug]);
  return { success: true };
}
