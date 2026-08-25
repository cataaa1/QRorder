/**
 * Backfill de `menu_items.image_url` con imagenes de Unsplash segun el nombre del item.
 * Script de uso puntual, no forma parte del runtime de la app.
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-menu-images.mjs
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.
 * Nunca hardcodear la service_role key en este archivo: bypassea RLS por completo.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Corre: node --env-file=.env.local scripts/seed-menu-images.mjs",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const UNSPLASH = (id) => `https://images.unsplash.com/photo-${id}?w=600&h=400&fit=crop`;

// Primer match gana; el ultimo es el fallback generico.
const IMAGE_RULES = [
  { match: ["gaseosa"], photo: "1622483767028-3f66f32aef97" },
  { match: ["vermú"], photo: "1560512823-829485b8bf24" },
  { match: ["gin tonic"], photo: "1551538827-9c037cb4f32a" },
  { match: ["aperitivo"], photo: "1514361892605-0f00bb90c125" },
  { match: ["cheesecake"], photo: "1533134242443-d4fd215305ad" },
  { match: ["brownie"], photo: "1606313564200-e75d5e30476c" },
  { match: ["flan"], photo: "1616428781449-361c4bb7c406" },
  { match: ["rabas"], photo: "1599487405445-56041ec1a9ad" },
  { match: ["provoleta"], photo: "1619894982635-430b8dced490" },
  { match: ["croquetas"], photo: "1534422298391-e4f8c97104d0" },
  { match: ["scottish", "roja"], photo: "1535958636474-b021ee887b13" },
  { match: ["ipa", "pinta"], photo: "1625860555365-d053eb813ec7" },
  { match: ["sorrentinos"], photo: "1551183053-ec9cf4315357" },
  { match: ["bondiola"], photo: "1550547660-d33e11f040f6" },
  { match: ["milanesa"], photo: "1600891964092-4316c288032e" },
  { match: ["pomelada", "limonada"], photo: "1513558161293-cdaf765ed2fd" },
  { match: ["agua"], photo: "1548839140-29a749e1bc4e" },
];

const FALLBACK_PHOTO = "1568901346375-23c9450c58cd";

function pickImageUrl(name) {
  const normalized = name.toLowerCase();
  const rule = IMAGE_RULES.find((candidate) =>
    candidate.match.some((keyword) => normalized.includes(keyword)),
  );

  return UNSPLASH(rule?.photo ?? FALLBACK_PHOTO);
}

async function run() {
  const { data: menuItems, error } = await supabase.from("menu_items").select("id, name");

  if (error) {
    console.error(error);
    process.exitCode = 1;
    return;
  }

  for (const item of menuItems) {
    const url = pickImageUrl(item.name);
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ image_url: url })
      .eq("id", item.id);

    if (updateError) {
      console.error("Error actualizando", item.name, updateError);
      process.exitCode = 1;
    } else {
      console.log(`OK ${item.name} -> ${url}`);
    }
  }

  console.log("Listo.");
}

run();
