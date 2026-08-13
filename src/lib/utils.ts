/**
 * Genera un slug URL-friendly a partir de un nombre.
 * Ejemplo: "Luis Velásquez" → "luis-velasquez"
 */
export function generateSlug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Solo alfanuméricos y espacios
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-"); // Guiones múltiples a uno
}
