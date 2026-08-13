/**
 * Script de seed para poblar Upstash Redis con las invitaciones.
 * 
 * Uso:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/seed.mjs
 *   O con .env: npm run seed
 *   Para sobreescribir: npm run seed -- --force
 */

import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { resolve } from "path";

// Cargar .env
try {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) {
      process.env[key.trim()] = val.join("=").trim();
    }
  });
} catch { /* no .env */ }

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error("❌ Faltan UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
}

const redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });

function generateSlug(name) {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

// ============================================================
// INVITACIONES
// Cada entrada es UNA invitación con 1 o 2 personas.
// El slug se genera del primer nombre.
// categoria: quién los invita
// ============================================================
const invitaciones = [
  // === AMBOS (novios/familia directa) ===
  { personas: ["Luis Velásquez"], categoria: "ambos" },
  { personas: ["Cesia Mejía"], categoria: "ambos" },

  // === CESIA ===
  { personas: ["Jesica Guerrero", "Oscar Bonilla"], categoria: "cesia" },
  { personas: ["Wendy Bonilla"], categoria: "cesia" },
  { personas: ["Jorge Mejía"], categoria: "cesia" },
  { personas: ["Valeria Bonilla"], categoria: "cesia" },
  { personas: ["Abuelo Rubén"], categoria: "cesia" },
  { personas: ["Eda Elvir"], categoria: "cesia" },
  { personas: ["Pamela"], categoria: "cesia" },
  { personas: ["Claudia Bernardez"], categoria: "cesia" },
  { personas: ["Valerie"], categoria: "cesia" },
  { personas: ["Jacobo Bonilla"], categoria: "cesia" },
  { personas: ["Gabriela"], categoria: "cesia" },
  { personas: ["Gabriela Mendoza"], categoria: "cesia" },
  { personas: ["Katherine Elvir"], categoria: "cesia" },
  { personas: ["Gabriel Bonilla"], categoria: "cesia" },
  { personas: ["Julissa"], categoria: "cesia" },
  { personas: ["Magda"], categoria: "cesia" },
  { personas: ["Lesly"], categoria: "cesia" },
  { personas: ["Juan primo"], categoria: "cesia" },
  { personas: ["Yesenia Munguia"], categoria: "cesia" },
  { personas: ["Emerita Elvir"], categoria: "cesia" },
  { personas: ["Kathia"], categoria: "cesia" },
  { personas: ["Genesis"], categoria: "cesia" },
  { personas: ["Sara"], categoria: "cesia" },
  { personas: ["Sindy Proudinat"], categoria: "cesia" },
  { personas: ["Josman Proudinat"], categoria: "cesia" },

  // === LUIS ===
  { personas: ["Alexis"], categoria: "luis" },
  { personas: ["Martha Osortho"], categoria: "luis" },
  { personas: ["Hilda"], categoria: "luis" },
  { personas: ["Martha Alvarez"], categoria: "luis" },
  { personas: ["Irene"], categoria: "luis" },
  { personas: ["Norman"], categoria: "luis" },
  { personas: ["Hector Estrada"], categoria: "luis" },
  { personas: ["Rigo"], categoria: "luis" },
  { personas: ["Luis Navarro", "Jennifer Garcia"], categoria: "luis" },
  { personas: ["Suyapa"], categoria: "luis" },
  { personas: ["Javier"], categoria: "luis" },
  { personas: ["Juan"], categoria: "luis" },
  { personas: ["Emerson Banegas"], categoria: "luis" },
  { personas: ["Rubén"], categoria: "luis" },
  { personas: ["Osman"], categoria: "luis" },
  { personas: ["Samuel Castejon"], categoria: "luis" },
  { personas: ["Norma"], categoria: "luis" },
  { personas: ["José Lagos"], categoria: "luis" },
  { personas: ["Mario Cardona"], categoria: "luis" },
  { personas: ["Juan Carballo"], categoria: "luis" },
  { personas: ["Javiersito"], categoria: "luis" },
  { personas: ["Fabricio"], categoria: "luis" },
  { personas: ["Javier Pacheco"], categoria: "luis" },
  { personas: ["Andrea", "Esposo Andrea"], categoria: "luis" },
  { personas: ["Lizeth Pacheco", "Jorge Esposo Lizeth"], categoria: "luis" },
  { personas: ["Tío Edgardo"], categoria: "luis" },
  { personas: ["Tía Rumilda"], categoria: "luis" },
  { personas: ["Fernando Lopez"], categoria: "luis" },
  { personas: ["Daniel"], categoria: "luis" },
];

async function seed() {
  console.log("🌱 Iniciando seed de invitaciones...\n");

  // Check existing
  const existingSlugs = await redis.smembers("guests:index");
  if (existingSlugs && existingSlugs.length > 0) {
    if (!process.argv.includes("--force")) {
      console.log(`⚠️  Ya existen ${existingSlugs.length} invitaciones.`);
      console.log("   Usa --force para sobreescribir.\n");
      process.exit(0);
    }
    console.log("🗑️  Limpiando datos existentes...");
    const pipeline = redis.pipeline();
    for (const slug of existingSlugs) pipeline.del(`guest:${slug}`);
    pipeline.del("guests:index");
    await pipeline.exec();
    console.log("   ✓ Limpio.\n");
  }

  // Generate slugs and build data
  const slugMap = new Map();
  const guests = invitaciones.map((inv, index) => {
    let slug = generateSlug(inv.personas[0]);
    if (slugMap.has(slug)) slug = `${slug}-${index}`;
    slugMap.set(slug, true);

    return {
      id: index + 1,
      slug,
      personas: inv.personas,
      categoria: inv.categoria,
      confirmado: false,
      cantidadConfirmada: null,
      mensaje: "",
      fechaConfirmacion: null,
      activo: true,
    };
  });

  // Upload
  console.log(`📤 Subiendo ${guests.length} invitaciones...\n`);
  const pipeline = redis.pipeline();
  for (const guest of guests) {
    pipeline.set(`guest:${guest.slug}`, JSON.stringify(guest));
    pipeline.sadd("guests:index", guest.slug);
  }
  await pipeline.exec();

  // Summary
  const totalPersonas = guests.reduce((s, g) => s + g.personas.length, 0);
  const parejas = guests.filter(g => g.personas.length === 2).length;
  const individuales = guests.filter(g => g.personas.length === 1).length;
  const deLuis = guests.filter(g => g.categoria === "luis");
  const deCesia = guests.filter(g => g.categoria === "cesia");

  console.log("✅ Seed completado!\n");
  console.log("📊 Resumen:");
  console.log(`   • Total invitaciones: ${guests.length}`);
  console.log(`   • Total personas: ${totalPersonas}`);
  console.log(`   • Individuales: ${individuales}`);
  console.log(`   • Parejas: ${parejas}`);
  console.log(`   • Invitados Luis: ${deLuis.reduce((s,g)=>s+g.personas.length,0)} personas (${deLuis.length} invitaciones)`);
  console.log(`   • Invitados Cesia: ${deCesia.reduce((s,g)=>s+g.personas.length,0)} personas (${deCesia.length} invitaciones)`);
  console.log("\n📋 Links:");
  guests.forEach((g) => {
    const names = g.personas.join(" & ");
    console.log(`   ${names.padEnd(35)} → /invitacion/${g.slug}  [${g.personas.length}p]`);
  });
}

seed().catch((err) => { console.error("❌ Error:", err); process.exit(1); });
