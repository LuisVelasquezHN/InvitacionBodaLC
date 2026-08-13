/**
 * Script de seed para poblar Upstash Redis con los invitados.
 * 
 * Uso:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/seed.mjs
 * 
 * O con archivo .env:
 *   npm run seed (requiere dotenv instalado o cargar .env manualmente)
 */

import { Redis } from "@upstash/redis";

// Cargar .env si existe
import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) {
      process.env[key.trim()] = val.join("=").trim();
    }
  });
} catch {
  // .env file not found, use existing env vars
}

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error("❌ Faltan las variables UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN");
  console.error("   Configúralas en .env o como variables de entorno.");
  process.exit(1);
}

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

function generateSlug(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Lista de invitados original
// maxPases: 2 = invitación de pareja, 1 = individual
// categoria: "luis" | "cesia" | "ambos" (familia compartida / novios)
// pareja: nombre de la persona con quien comparte invitación (vacío si individual)
const invitados = [
  { nombre: "Luis Velásquez", maxPases: 1, categoria: "ambos", pareja: "" },
  { nombre: "Cesia Mejía", maxPases: 1, categoria: "ambos", pareja: "" },
  { nombre: "Jesica Guerrero", maxPases: 2, categoria: "cesia", pareja: "Oscar Bonilla" },
  { nombre: "Wendy Bonilla", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Oscar Bonilla", maxPases: 2, categoria: "cesia", pareja: "Jesica Guerrero" },
  { nombre: "Jorge Mejía", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Valeria Bonilla", maxPases: 1, categoria: "cesia", pareja: "" },
  { nombre: "Abuelo Rubén", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Eda Elvir", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Alexis", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Martha Osortho", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Hilda", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Martha Alvarez", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Pamela", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Claudia Bernardez", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Valerie", maxPases: 1, categoria: "cesia", pareja: "" },
  { nombre: "Jacobo Bonilla", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Irene", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Gabriela", maxPases: 1, categoria: "cesia", pareja: "" },
  { nombre: "Gabriela Mendoza", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Katherine Elvir", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Norman", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Hector Estrada", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Rigo", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Luis Navarro", maxPases: 2, categoria: "luis", pareja: "Jennifer Garcia" },
  { nombre: "Suyapa", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Jennifer Garcia", maxPases: 2, categoria: "luis", pareja: "Luis Navarro" },
  { nombre: "Javier", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Gabriel Bonilla", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Juan", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Julissa", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Magda", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Emerson Banegas", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Rubén", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Osman", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Lesly", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Samuel Castejon", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Juan primo", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Yesenia Munguia", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Norma", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "José Lagos", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Mario Cardona", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Juan Carballo", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Javiersito", maxPases: 1, categoria: "luis", pareja: "" },
  { nombre: "Emerita Elvir", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Fabricio", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Javier Pacheco", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Andrea", maxPases: 2, categoria: "luis", pareja: "Esposo Andrea" },
  { nombre: "Kathia", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Esposo Andrea", maxPases: 1, categoria: "luis", pareja: "Andrea" },
  { nombre: "Lizeth Pacheco", maxPases: 2, categoria: "luis", pareja: "Jorge Esposo Lizeth" },
  { nombre: "Tío Edgardo", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Genesis", maxPases: 1, categoria: "cesia", pareja: "" },
  { nombre: "Tía Rumilda", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Fernando Lopez", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Sara", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Sindy Proudinat", maxPases: 2, categoria: "cesia", pareja: "" },
  { nombre: "Daniel", maxPases: 2, categoria: "luis", pareja: "" },
  { nombre: "Jorge Esposo Lizeth", maxPases: 1, categoria: "luis", pareja: "Lizeth Pacheco" },
  { nombre: "Josman Proudinat", maxPases: 2, categoria: "cesia", pareja: "" },
];

async function seed() {
  console.log("🌱 Iniciando seed de invitados...\n");

  // Verificar si ya hay datos
  const existingSlugs = await redis.smembers("guests:index");
  if (existingSlugs && existingSlugs.length > 0) {
    const answer = process.argv.includes("--force");
    if (!answer) {
      console.log(`⚠️  Ya existen ${existingSlugs.length} invitados en la base de datos.`);
      console.log("   Usa --force para sobreescribir.\n");
      
      console.log("Invitados existentes:");
      existingSlugs.forEach(s => console.log(`  • ${s}`));
      process.exit(0);
    }

    // Limpiar datos existentes
    console.log("🗑️  Limpiando datos existentes...");
    const pipeline = redis.pipeline();
    for (const slug of existingSlugs) {
      pipeline.del(`guest:${slug}`);
    }
    pipeline.del("guests:index");
    await pipeline.exec();
    console.log("   ✓ Datos anteriores eliminados.\n");
  }

  // Generar slugs únicos
  const slugMap = new Map();
  const guests = invitados.map((inv, index) => {
    let slug = generateSlug(inv.nombre);
    
    // Manejar duplicados de slug
    if (slugMap.has(slug)) {
      slug = `${slug}-${index}`;
    }
    slugMap.set(slug, true);

    return {
      id: index + 1,
      slug,
      nombre: inv.nombre,
      pareja: inv.pareja || "",
      categoria: inv.categoria || "ambos",
      maxPases: inv.maxPases,
      confirmado: false,
      cantidadConfirmada: null,
      mensaje: "",
      fechaConfirmacion: null,
      activo: true,
    };
  });

  // Subir a Redis
  console.log(`📤 Subiendo ${guests.length} invitados a Redis...\n`);
  
  const pipeline = redis.pipeline();
  for (const guest of guests) {
    pipeline.set(`guest:${guest.slug}`, JSON.stringify(guest));
    pipeline.sadd("guests:index", guest.slug);
  }
  await pipeline.exec();

  // Resumen
  console.log("✅ Seed completado exitosamente!\n");
  console.log("📊 Resumen:");
  console.log(`   • Total invitaciones: ${guests.length}`);
  console.log(`   • Individuales (1 pase): ${guests.filter(g => g.maxPases === 1).length}`);
  console.log(`   • Parejas (2 pases): ${guests.filter(g => g.maxPases === 2).length}`);
  console.log(`   • Capacidad máxima: ${guests.reduce((sum, g) => sum + g.maxPases, 0)} personas`);
  console.log(`   • Invitados de Luis: ${guests.filter(g => g.categoria === "luis").length}`);
  console.log(`   • Invitados de Cesia: ${guests.filter(g => g.categoria === "cesia").length}`);
  console.log(`   • Compartidos (ambos): ${guests.filter(g => g.categoria === "ambos").length}`);
  console.log(`   • Parejas vinculadas: ${guests.filter(g => g.pareja).length / 2}`);
  console.log("\n📋 Links generados:");
  guests.forEach((g) => {
    console.log(`   ${g.nombre.padEnd(25)} → /invitacion/${g.slug}  [${g.maxPases} pases]`);
  });
}

seed().catch((err) => {
  console.error("❌ Error durante el seed:", err);
  process.exit(1);
});
