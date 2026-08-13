import { Redis } from "@upstash/redis";

// Modelo de datos:
// KV Structure:
//   guest:{slug}  → GuestData (hash stored as JSON)
//   guests:index  → Set of all slugs
//   admin:password → hashed admin password

export interface GuestData {
  id: number;
  slug: string;
  nombre: string;
  pareja: string; // nombre de la pareja (vacío si es individual)
  categoria: "luis" | "cesia" | "ambos"; // quién los invita
  maxPases: number; // máximo de personas que puede traer
  confirmado: boolean;
  cantidadConfirmada: number | null; // cuántos confirmaron
  mensaje: string;
  fechaConfirmacion: string | null;
  activo: boolean; // si la invitación está activa (para reasignaciones)
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

export async function getGuest(slug: string): Promise<GuestData | null> {
  const db = getRedis();
  const data = await db.get<GuestData>(`guest:${slug}`);
  return data;
}

export async function getAllGuests(): Promise<GuestData[]> {
  const db = getRedis();
  const slugs = await db.smembers("guests:index");
  if (!slugs || slugs.length === 0) return [];

  const pipeline = db.pipeline();
  for (const slug of slugs) {
    pipeline.get(`guest:${slug}`);
  }
  const results = await pipeline.exec<(GuestData | null)[]>();
  return results.filter((g): g is GuestData => g !== null);
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

  if (cantidad > guest.maxPases || cantidad < 1) {
    return { success: false, error: `Solo puedes confirmar entre 1 y ${guest.maxPases} personas.` };
  }

  const updated: GuestData = {
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

  const updated: GuestData = {
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
  updates: Partial<Pick<GuestData, "nombre" | "pareja" | "categoria" | "maxPases" | "activo" | "confirmado" | "cantidadConfirmada" | "mensaje">>
): Promise<{ success: boolean; error?: string }> {
  const db = getRedis();
  const guest = await getGuest(slug);

  if (!guest) {
    return { success: false, error: "Invitado no encontrado." };
  }

  // Si se reactiva o des-confirma, resetear campos de confirmación
  const updated: GuestData = { ...guest, ...updates };

  if (updates.confirmado === false) {
    updated.cantidadConfirmada = null;
    updated.fechaConfirmacion = null;
  }

  await db.set(`guest:${slug}`, updated);
  return { success: true };
}

export async function createGuest(data: Omit<GuestData, "id">): Promise<{ success: boolean; error?: string }> {
  const db = getRedis();
  const existing = await getGuest(data.slug);

  if (existing) {
    return { success: false, error: "Ya existe un invitado con ese slug." };
  }

  // Get next ID
  const allGuests = await getAllGuests();
  const maxId = allGuests.reduce((max, g) => Math.max(max, g.id), 0);

  const guest: GuestData = {
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
