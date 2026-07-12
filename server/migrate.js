const fs = require("fs");
const path = require("path");
const db = require("./db");

const SEED_PRODUCTS = [
  {
    lot_number: "LOT-014",
    name: "Yirgacheffe Washed",
    slug: "yirgacheffe-washed",
    origin_country: "Ethiopie",
    origin_farm: "Cooperative Konga, Gedeo",
    altitude_m: 1980,
    process: "Lave",
    tasting_notes: "Jasmin, bergamote, the noir",
    description:
      "Un cafe floral et vif, recolte a la main sur les hauts plateaux du Gedeo. Torrefaction claire pour preserver l'acidite citree.",
    price_cents: 1890,
    roast_date: "2026-07-06",
    stock: 42,
    image_url:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
  },
  {
    lot_number: "LOT-021",
    name: "Huila Caturra",
    slug: "huila-caturra",
    origin_country: "Colombie",
    origin_farm: "Finca El Mirador, Huila",
    altitude_m: 1750,
    process: "Lave",
    tasting_notes: "Caramel, pomme rouge, praline",
    description:
      "Cultive en altitude sur des sols volcaniques, ce caturra offre une rondeur sucree et une finale nette.",
    price_cents: 1690,
    roast_date: "2026-07-08",
    stock: 65,
    image_url:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
  },
  {
    lot_number: "LOT-007",
    name: "Sidamo Natural",
    slug: "sidamo-natural",
    origin_country: "Ethiopie",
    origin_farm: "Cooperative Sidama, Bensa",
    altitude_m: 2050,
    process: "Nature",
    tasting_notes: "Fraise, myrtille, vin rouge",
    description:
      "Seche en cerise entiere sur lits africains pendant 21 jours pour un profil fruite intense et une texture sirupeuse.",
    price_cents: 2090,
    roast_date: "2026-07-02",
    stock: 28,
    image_url:
      "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=800&q=80",
  },
  {
    lot_number: "LOT-033",
    name: "Minas Gerais Bourbon",
    slug: "minas-gerais-bourbon",
    origin_country: "Bresil",
    origin_farm: "Fazenda Santa Ines, Carmo de Minas",
    altitude_m: 1250,
    process: "Nature",
    tasting_notes: "Chocolat au lait, noisette, cassonade",
    description:
      "Un pilier d'espresso: rond, sucre et peu acide. Ideal en filtre du matin comme en machine espresso.",
    price_cents: 1590,
    roast_date: "2026-07-09",
    stock: 80,
    image_url:
      "https://images.unsplash.com/photo-1587734195342-cca10b90ce3b?auto=format&fit=crop&w=800&q=80",
  },
  {
    lot_number: "LOT-018",
    name: "Kirinyaga Peaberry",
    slug: "kirinyaga-peaberry",
    origin_country: "Kenya",
    origin_farm: "Station Kiangoi, Kirinyaga",
    altitude_m: 1700,
    process: "Lave",
    tasting_notes: "Cassis, pamplemousse, tomate sechee",
    description:
      "Grains peaberry tries a la main, connus pour leur concentration aromatique et leur acidite structuree caracteristique du Kenya.",
    price_cents: 2190,
    roast_date: "2026-07-05",
    stock: 19,
    image_url:
      "https://images.unsplash.com/photo-1442550528053-c431ecb55509?auto=format&fit=crop&w=800&q=80",
  },
  {
    lot_number: "LOT-026",
    name: "Toraja Honey",
    slug: "toraja-honey",
    origin_country: "Indonesie",
    origin_farm: "Plateau de Tana Toraja, Sulawesi",
    altitude_m: 1500,
    process: "Miel",
    tasting_notes: "Cacao, epices douces, bois humide",
    description:
      "Procede miel qui conserve une partie du mucilage: texture epaisse, notes terreuses et epicees, tres faible acidite.",
    price_cents: 1990,
    roast_date: "2026-06-30",
    stock: 34,
    image_url:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
  },
];

async function runMigrations() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await db.query(schemaSql);
  console.log("[migrate] Schema verifie/cree.");

  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count === 0) {
    console.log("[migrate] Aucun produit trouve, insertion des lots de demonstration...");
    for (const p of SEED_PRODUCTS) {
      await db.query(
        `INSERT INTO products
          (lot_number, name, slug, origin_country, origin_farm, altitude_m, process,
           tasting_notes, description, price_cents, roast_date, stock, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (slug) DO NOTHING`,
        [
          p.lot_number,
          p.name,
          p.slug,
          p.origin_country,
          p.origin_farm,
          p.altitude_m,
          p.process,
          p.tasting_notes,
          p.description,
          p.price_cents,
          p.roast_date,
          p.stock,
          p.image_url,
        ]
      );
    }
    console.log(`[migrate] ${SEED_PRODUCTS.length} lots inseres.`);
  }
}

module.exports = { runMigrations };
