import { Redis } from "@upstash/redis";

// Modelo de datos simplificado:
// Una "Invitación" tiene un array de personas (1 o 2 nombres).
// personas.length = cantidad de pases de esa invitación.
// No hay duplicados. Una pareja es UN registro con 2 nombres.

export interface InvitationData {
  id: number;
  slug: string;
  personas: string[]; // ["Luis Navarro"] o ["Luis Navarro", "Jennifer Garcia"]
  categoria: "luis" | "cesia" | "ambos";
  confirmado: boolean;
  cantidadConfirmada: number | null; // cuántos de las personas asisten
  mensaje: string;
  fechaConfirmacion: string | null;
  activo: boolean;
}

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: import.meta.env.UPSTASH_REDIS_REST_URL,
      token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function getGuest(slug: string): Promise<InvitationData | null> {
  const db = getRedis();
  const data = await db.get<InvitationData>(`guest:${slug}`);
  return data;
}

export async function getAllGuests(): Promise<InvitationData[]> {
  const db = getRedis();
  const slugs = await db.smembers("guests:index");
  if (!slugs || slugs.length === 0) return [];

  const pipeline = db.pipeline();
  for (const slug of slugs) {
    pipeline.get(`guest:${slug}`);
  }
  const results = await pipeline.exec<(InvitationData | null)[]>();
  return results.filter((g): g is InvitationData => g !== null);
}

export async function confirmGuest(
  slug: string,
  cantidad: number,
  mensaje: string
): Promise<{ success: boolean; error?: string }> {
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

  const updated: InvitationData = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: cantidad,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: new Date().toISOString(),
  };

  await db.set(`guest:${slug}`, updated);
  return { success: true };
}

export async function declineGuest(
  slug: string,
  mensaje: string
): Promise<{ success: boolean; error?: string }> {
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

  const updated: InvitationData = {
    ...guest,
    confirmado: true,
    cantidadConfirmada: 0,
    mensaje: mensaje.trim().slice(0, 500),
    fechaConfirmacion: new Date().toISOString(),
  };

  await db.set(`guest:${slug}`, updated);
  return { success: true };
}

// Admin functions
export async function updateGuest(
  slug: string,
  updates: Partial<Pick<InvitationData, "personas" | "categoria" | "activo" | "confirmado" | "cantidadConfirmada" | "mensaje">>
): Promise<{ success: boolean; error?: string }> {
  const db = getRedis();
  const guest = await getGuest(slug);

  if (!guest) {
    return { success: false, error: "Invitado no encontrado." };
  }

  const updated: InvitationData = { ...guest, ...updates };

  // Si se des-confirma, resetear campos
  if (updates.confirmado === false) {
    updated.cantidadConfirmada = null;
    updated.fechaConfirmacion = null;
  }

  await db.set(`guest:${slug}`, updated);
  return { success: true };
}

export async function createGuest(data: Omit<InvitationData, "id">): Promise<{ success: boolean; error?: string }> {
  const db = getRedis();
  const existing = await getGuest(data.slug);

  if (existing) {
    return { success: false, error: "Ya existe una invitación con ese slug." };
  }

  const allGuests = await getAllGuests();
  const maxId = allGuests.reduce((max, g) => Math.max(max, g.id), 0);

  const guest: InvitationData = {
    ...data,
    id: maxId + 1,
  };

  await db.set(`guest:${guest.slug}`, guest);
  await db.sadd("guests:index", guest.slug);
  return { success: true };
}

export async function deleteGuest(slug: string): Promise<{ success: boolean }> {
  const db = getRedis();
  await db.del(`guest:${slug}`);
  await db.srem("guests:index", slug);
  return { success: true };
}
