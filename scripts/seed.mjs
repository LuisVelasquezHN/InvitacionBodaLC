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
  // ==============================
  // LUIS (26 invitaciones - slots 1-26, faltan 14, 15 por definir)
  // ==============================
  { personas: ["Jessica", "Oscar"], categoria: "luis" },           // 1-2: pareja
  { personas: ["Valeria"], categoria: "luis" },                     // 3
  { personas: ["Eda"], categoria: "luis" },                         // 4
  { personas: ["Martha"], categoria: "luis" },                      // 5
  { personas: ["Martita"], categoria: "luis" },                     // 6
  { personas: ["Claudia"], categoria: "luis" },                     // 7
  { personas: ["Jacobo"], categoria: "luis" },                      // 8
  { personas: ["Gabriela"], categoria: "luis" },                    // 9
  { personas: ["Katherine"], categoria: "luis" },                   // 10
  { personas: ["Hector"], categoria: "luis" },                      // 11
  { personas: ["Luis Navarro", "Jennifer Garcia"], categoria: "luis" }, // 12-13: pareja
  { personas: ["Gabriel"], categoria: "luis" },                     // 14
  // 15: vacío (por definir)
  { personas: ["Emerson"], categoria: "luis" },                     // 16
  { personas: ["Osman"], categoria: "luis" },                       // 17
  { personas: ["Doña Dalila"], categoria: "luis" },                 // 18
  { personas: ["Daysi"], categoria: "luis" },                       // 19
  { personas: ["Manuel"], categoria: "luis" },                      // 20
  { personas: ["Juan Carballo"], categoria: "luis" },               // 21
  { personas: ["Emerita"], categoria: "luis" },                     // 22
  { personas: ["Javier"], categoria: "luis" },                      // 23
  { personas: ["Kathia"], categoria: "luis" },                      // 24
  { personas: ["Lizeth"], categoria: "luis" },                      // 25
  { personas: ["Genesis"], categoria: "luis" },                     // 26

  // ==============================
  // CESIA (26 invitaciones - slots 1-26)
  // ==============================
  { personas: ["Wendy"], categoria: "cesia" },                     // 1
  { personas: ["Jorge"], categoria: "cesia" },                     // 2
  { personas: ["Abuelo Rubén"], categoria: "cesia" },              // 3
  { personas: ["Alexis"], categoria: "cesia" },                    // 4
  { personas: ["Hilda"], categoria: "cesia" },                     // 5
  { personas: ["Pamela"], categoria: "cesia" },                    // 6
  { personas: ["Valerie"], categoria: "cesia" },                   // 7
  { personas: ["Irene"], categoria: "cesia" },                     // 8
  { personas: ["Gabby"], categoria: "cesia" },                     // 9
  { personas: ["Norman"], categoria: "cesia" },                    // 10
  { personas: ["Rigo"], categoria: "cesia" },                      // 11
  { personas: ["Suyapa"], categoria: "cesia" },                    // 12
  { personas: ["Javier C"], categoria: "cesia" },                  // 13
  // 14-15: vacíos (por definir)
  { personas: ["Rubén"], categoria: "cesia" },                     // 16
  { personas: ["Lesly"], categoria: "cesia" },                     // 17
  { personas: ["Juan primo"], categoria: "cesia" },                // 18
  { personas: ["Norma"], categoria: "cesia" },                     // 19
  { personas: ["Mario Cardona"], categoria: "cesia" },             // 20
  { personas: ["Javiersito"], categoria: "cesia" },                // 21
  { personas: ["Fabricio"], categoria: "cesia" },                  // 22
  { personas: ["Andrea", "Esposo Andrea"], categoria: "cesia" },   // 23-24: pareja
  { personas: ["Sara Bonilla"], categoria: "cesia" },              // 25
  { personas: ["Nancy"], categoria: "cesia" },                     // 26

  // ==============================
  // COMPARTIDOS (27-34, invitados de ambos)
  // ==============================
  { personas: ["Yessenia", "Heberth"], categoria: "ambos" },       // 27: pareja
  { personas: ["José", "Memo"], categoria: "ambos" },              // 28: pareja
  { personas: ["Sindy", "Rebeca"], categoria: "ambos" },           // 29: pareja
  { personas: ["Josman"], categoria: "ambos" },                    // 30
  { personas: ["Edgardo"], categoria: "ambos" },                   // 31
  { personas: ["+1 de Edgardo"], categoria: "ambos" },             // 32
  { personas: ["Ecker primo"], categoria: "ambos" },               // 33
  // 34: vacío (por definir)
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
