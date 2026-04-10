/**
 * Seed script — populates the DB with real POIs for Île Maurice & Madagascar,
 * their beacons, content blocks, and nearby services.
 *
 * Run: npm run seed
 */

import { v4 as uuidv4 } from 'uuid';
import db from './db';

// ─── Shared beacon UUID per country ─────────────────────────────────────────
const UUID_MU = 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825'; // Île Maurice
const UUID_MG = 'B9407F30-F5F8-466E-AFF9-25556B57FE6D'; // Madagascar

function beaconId(uuid: string, major: number, minor: number): string {
  return `${uuid}-${String(major).padStart(4, '0')}-${String(minor).padStart(4, '0')}`;
}

// ─── POI definitions ─────────────────────────────────────────────────────────
const pois = [
  // ── ÎLE MAURICE ─────────────────────────────────────────────────────────
  {
    id: 'mu-chamarel-7couleurs',
    name: 'Chamarel – Terre des 7 Couleurs',
    description:
      "Phénomène géologique unique au monde : des dunes de sable volcaniques formant sept couleurs distinctes sans jamais se mélanger. Site incontournable du patrimoine naturel mauricien.",
    category: 'nature',
    country: 'MU',
    latitude: -20.4275,
    longitude: 57.3650,
    address: 'Chamarel, Rivière Noire District, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Dim 8h30–17h30',
    entry_fee: '375 MUR adulte / 175 MUR enfant',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-chamarel-waterfall',
    name: 'Chutes de Chamarel',
    description:
      "Les plus hautes chutes d'eau de l'île Maurice avec une chute de 100 m dans un cadre tropical luxuriant. Souvent accompagnées d'arcs-en-ciel en matinée.",
    category: 'nature',
    country: 'MU',
    latitude: -20.4244,
    longitude: 57.3581,
    address: 'Chamarel, Rivière Noire District, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Dim 8h30–17h30',
    entry_fee: 'Inclus avec Terre des 7 Couleurs',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-black-river-gorges',
    name: 'Parc National de la Rivière Noire',
    description:
      "Le plus grand parc national de Maurice (6 574 ha) protège la dernière forêt indigène de l'île. Abrite des espèces endémiques comme le Merle de Maurice.",
    category: 'park',
    country: 'MU',
    latitude: -20.3833,
    longitude: 57.3833,
    address: 'Black River Gorges, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Dim 6h00–17h00',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-blue-penny-museum',
    name: 'Blue Penny Museum, Port Louis',
    description:
      "Abrite les deux timbres les plus précieux au monde : le Blue Penny et le Red Penny de 1847. Retrace l'histoire maritime et culturelle de l'île Maurice.",
    category: 'museum',
    country: 'MU',
    latitude: -20.1622,
    longitude: 57.4989,
    address: 'Caudan Waterfront, Port Louis, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Ven 10h–17h / Sam 10h–16h',
    entry_fee: '200 MUR adulte / 100 MUR enfant',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-central-market',
    name: 'Marché Central de Port Louis',
    description:
      "Le plus grand marché en plein air de l'île. Épices, légumes exotiques, artisanat local et street food se côtoient dans une atmosphère créole authentique.",
    category: 'market',
    country: 'MU',
    latitude: -20.1633,
    longitude: 57.4994,
    address: 'Rue Queen Victoria, Port Louis, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Sam 6h–17h / Dim 6h–12h',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'en', 'cr']),
  },
  {
    id: 'mu-grand-baie',
    name: 'Grand Baie',
    description:
      "Station balnéaire animée du nord de l'île. Plages de sable blanc, lagons turquoise, sports nautiques, restaurants et vie nocturne font de Grand Baie le cœur touristique de Maurice.",
    category: 'beach',
    country: 'MU',
    latitude: -20.0133,
    longitude: 57.5853,
    address: 'Grand Baie, Rivière du Rempart District, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Accès libre',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-le-morne',
    name: 'Le Morne Brabant (UNESCO)',
    description:
      "Péninsule avec un piton basaltique classé au patrimoine mondial de l'UNESCO. Site symbole de la résistance des esclaves marrons au XVIIIe siècle.",
    category: 'culture',
    country: 'MU',
    latitude: -20.4508,
    longitude: 57.3181,
    address: 'Le Morne, Rivière Noire District, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: 'https://lemoyne.mu',
    opening_hours: 'Accès libre (randonnée sur réservation)',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-pamplemousses',
    name: 'Jardin Botanique de Pamplemousses',
    description:
      "L'un des plus anciens jardins botaniques de l'hémisphère sud (1736). Célèbre pour ses nénuphars géants Victoria amazonica et ses palmiers talipot.",
    category: 'nature',
    country: 'MU',
    latitude: -20.0996,
    longitude: 57.5862,
    address: 'Pamplemousses, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Dim 6h–18h',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'en']),
  },
  {
    id: 'mu-flic-en-flac',
    name: 'Flic en Flac',
    description:
      "Longue plage de 8 km sur la côte ouest avec des eaux calmes idéales pour la plongée. Célèbre pour ses plongées nocturnes avec les raies manta.",
    category: 'beach',
    country: 'MU',
    latitude: -20.2933,
    longitude: 57.3631,
    address: 'Flic en Flac, Rivière Noire District, Île Maurice',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Accès libre',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'en']),
  },

  // ── MADAGASCAR ──────────────────────────────────────────────────────────
  {
    id: 'mg-avenue-baobabs',
    name: "Avenue des Baobabs, Morondava",
    description:
      "Allée majestueuse de baobabs Adansonia grandidieri vieux de 800 ans. Classée monument naturel protégé, elle est l'image iconique de Madagascar.",
    category: 'nature',
    country: 'MG',
    latitude: -20.2531,
    longitude: 44.4147,
    address: 'RN8, Morondava, Menabe, Madagascar',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lever au coucher du soleil (golden hour recommandée)',
    entry_fee: '10 000 Ar (accès site)',
    languages: JSON.stringify(['fr', 'mg', 'en']),
  },
  {
    id: 'mg-isalo-park',
    name: 'Parc National de l\'Isalo',
    description:
      "Massif de grès jurassique aux gorges profondes, piscines naturelles et forêts-galeries. Surnommé le \"Colorado malgache\", il abrite plusieurs espèces de lémuriens.",
    category: 'park',
    country: 'MG',
    latitude: -22.5167,
    longitude: 45.3833,
    address: 'Ranohira, Ihorombe, Madagascar',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Dim 6h–17h (guide obligatoire)',
    entry_fee: '55 000 Ar adulte',
    languages: JSON.stringify(['fr', 'mg', 'en']),
  },
  {
    id: 'mg-nosy-be',
    name: 'Nosy Be — Île aux Parfums',
    description:
      "Principale île touristique de Madagascar, surnommée l'Île aux Parfums pour ses plantations d'ylang-ylang. Plages de rêve, tortues marines et plongée d'exception.",
    category: 'beach',
    country: 'MG',
    latitude: -13.3325,
    longitude: 48.2764,
    address: 'Nosy Be, Diana, Madagascar',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Accès libre',
    entry_fee: 'Gratuit',
    languages: JSON.stringify(['fr', 'mg', 'en']),
  },
  {
    id: 'mg-tsingy-bemaraha',
    name: 'Tsingy de Bemaraha (UNESCO)',
    description:
      "Forêt de pics calcaires acérés classée au patrimoine mondial de l'UNESCO. Écosystème unique abritant des lémuriens et espèces végétales endémiques.",
    category: 'nature',
    country: 'MG',
    latitude: -18.2667,
    longitude: 44.7167,
    address: 'Bekopaka, Melaky, Madagascar',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Avr–Nov uniquement (saison sèche)',
    entry_fee: '55 000 Ar adulte',
    languages: JSON.stringify(['fr', 'mg', 'en']),
  },
  {
    id: 'mg-ranomafana',
    name: 'Parc National de Ranomafana',
    description:
      "Forêt tropicale d'altitude abritant le propithèque de Milne-Edwards et le hapalémur doré, deux espèces critiquement menacées découvertes ici.",
    category: 'park',
    country: 'MG',
    latitude: -21.2667,
    longitude: 47.4333,
    address: 'Ranomafana, Haute Matsiatra, Madagascar',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Lun–Dim 6h–17h (guide obligatoire)',
    entry_fee: '55 000 Ar adulte',
    languages: JSON.stringify(['fr', 'mg', 'en']),
  },
  {
    id: 'mg-rova-antananarivo',
    name: "Rova d'Antananarivo",
    description:
      "Ancien palais royal de la reine Ranavalona sur les hauteurs d'Antananarivo. Symbole de la royauté Merina, reconstruit après l'incendie de 1995.",
    category: 'culture',
    country: 'MG',
    latitude: -18.9167,
    longitude: 47.5333,
    address: 'Haute-Ville, Antananarivo, Madagascar',
    image_url: null,
    audio_guide_url: null,
    website_url: null,
    opening_hours: 'Mar–Dim 9h–17h',
    entry_fee: '20 000 Ar adulte',
    languages: JSON.stringify(['fr', 'mg', 'en']),
  },
];

// ─── Content blocks ──────────────────────────────────────────────────────────
const contentBlocks = [
  // Chamarel 7 couleurs
  {
    id: uuidv4(), poi_id: 'mu-chamarel-7couleurs', lang: 'fr', type: 'history',
    title: 'Comment se forment les 7 couleurs ?',
    body: "La coloration provient de l'oxydation différente des minéraux volcaniques (fer, aluminium) selon leur température de refroidissement. Les oxydes de fer donnent les teintes rouges et marrons, tandis que l'aluminium produit les nuances violettes et grises.",
  },
  {
    id: uuidv4(), poi_id: 'mu-chamarel-7couleurs', lang: 'en', type: 'history',
    title: 'How are the 7 colours formed?',
    body: "The colouration comes from the differential oxidation of volcanic minerals (iron, aluminium) according to their cooling temperature. Iron oxides give the red and brown shades, while aluminium produces the violet and grey hues.",
  },
  {
    id: uuidv4(), poi_id: 'mu-chamarel-7couleurs', lang: 'fr', type: 'tip',
    title: 'Conseil visite',
    body: "Venez tôt le matin (avant 9h) pour éviter les groupes et profiter de la lumière dorée. Combinez avec les Chutes de Chamarel à 1 km — le ticket est groupé.",
  },

  // Baobabs
  {
    id: uuidv4(), poi_id: 'mg-avenue-baobabs', lang: 'fr', type: 'history',
    title: "L'arbre de vie malgache",
    body: "Les baobabs Adansonia grandidieri peuvent vivre plus de 800 ans et stocker jusqu'à 120 000 litres d'eau dans leur tronc creux. Les habitants malgaches utilisent leurs feuilles, fruits et écorce pour la nourriture et la médecine traditionnelle.",
  },
  {
    id: uuidv4(), poi_id: 'mg-avenue-baobabs', lang: 'en', type: 'history',
    title: 'The Malagasy tree of life',
    body: "Adansonia grandidieri baobabs can live more than 800 years and store up to 120,000 litres of water in their hollow trunks. Malagasy people use their leaves, fruit and bark for food and traditional medicine.",
  },
  {
    id: uuidv4(), poi_id: 'mg-avenue-baobabs', lang: 'fr', type: 'tip',
    title: 'Meilleur moment',
    body: "La golden hour au coucher du soleil (vers 17h30) est le moment idéal pour la photographie. Le ciel vire à l'orange derrière les silhouettes des baobabs. Arrivez au moins 30 min avant.",
  },
  {
    id: uuidv4(), poi_id: 'mg-avenue-baobabs', lang: 'mg', type: 'tip',
    title: 'Fotoana tsara indrindra',
    body: "Ny fotoana tsara indrindra ho an'ny sary dia ny fotoana milentika ny masoandro (tokony ho 17h30). Mihazakazaka 30 minitra alohan'izany.",
  },

  // Tsingy
  {
    id: uuidv4(), poi_id: 'mg-tsingy-bemaraha', lang: 'fr', type: 'history',
    title: "Qu'est-ce que le Tsingy ?",
    body: "\"Tsingy\" signifie en malgache \"là où l'on ne peut marcher pieds nus\". Ces aiguilles calcaires se sont formées il y a 200 millions d'années, sculp­tées par la pluie tropicale. Des passerelles suspendues permettent d'explorer ce labyrinthe unique.",
  },
  {
    id: uuidv4(), poi_id: 'mg-tsingy-bemaraha', lang: 'en', type: 'history',
    title: 'What is Tsingy?',
    body: "\"Tsingy\" means in Malagasy \"where one cannot walk barefoot\". These limestone needles formed 200 million years ago, sculpted by tropical rain. Suspension bridges allow you to explore this unique labyrinth.",
  },

  // Le Morne
  {
    id: uuidv4(), poi_id: 'mu-le-morne', lang: 'fr', type: 'history',
    title: "Le refuge des esclaves marrons",
    body: "Au XVIIIe siècle, des esclaves fugitifs (marrons) trouvèrent refuge dans les grottes du Morne Brabant. Selon la légende, lors de l'abolition de l'esclavage en 1835, ignorant la bonne nouvelle, ils se jetèrent dans le vide plutôt que de se rendre.",
  },

  // Blue Penny
  {
    id: uuidv4(), poi_id: 'mu-blue-penny-museum', lang: 'fr', type: 'history',
    title: "Les timbres les plus rares du monde",
    body: "En 1847, Maurice fut la première colonie britannique à émettre des timbres-poste. Une erreur d'impression fit inscrire \"Post Office\" au lieu de \"Post Paid\" sur seulement 27 exemplaires connus. Le Blue Penny (1 penny) et le Red Penny (2 pence) valent aujourd'hui plusieurs millions d'euros.",
  },

  // Isalo
  {
    id: uuidv4(), poi_id: 'mg-isalo-park', lang: 'fr', type: 'tip',
    title: 'Randonnées incontournables',
    body: "Circuit des Piscines Naturelles (3h) : baignade dans des bassins d'eau claire entourés de palmiers. Circuit de la Fenêtre de l'Isalo : lever/coucher de soleil spectaculaire encadré par un arche naturelle.",
  },
  {
    id: uuidv4(), poi_id: 'mg-isalo-park', lang: 'fr', type: 'history',
    title: "Tombes sakalava",
    body: "Le massif de l'Isalo est un site funéraire ancestral pour le peuple Bara. Des tombes peintes de rouge et blanc sont creusées dans les falaises, entourées de zébus sculptés symbolisant la richesse du défunt.",
  },
];

// ─── Nearby services ─────────────────────────────────────────────────────────
const nearbyServices = [
  {
    id: uuidv4(), poi_id: 'mu-chamarel-7couleurs', type: 'restaurant',
    name: "Chez Gustave – Cuisine Créole",
    description: "Grillades et carry locaux sur la terrasse avec vue sur la forêt.",
    phone: '+230 483 4130', distance_meters: 200, price_range: '$$',
  },
  {
    id: uuidv4(), poi_id: 'mu-chamarel-7couleurs', type: 'taxi',
    name: "Taxi Chamarel Express",
    description: "Navette depuis/vers Tamarin et Case Noyale.",
    phone: '+230 5251 8800', distance_meters: 50, price_range: null,
  },
  {
    id: uuidv4(), poi_id: 'mu-grand-baie', type: 'wifi',
    name: "Grand Baie Free WiFi",
    description: "Zone WiFi publique sur la place principale.",
    phone: null, distance_meters: 30, price_range: 'Gratuit',
  },
  {
    id: uuidv4(), poi_id: 'mu-grand-baie', type: 'restaurant',
    name: "La Plage Beach Bar",
    description: "Cocktails et poissons grillés les pieds dans le sable.",
    phone: '+230 263 8811', distance_meters: 80, price_range: '$$$',
  },
  {
    id: uuidv4(), poi_id: 'mg-avenue-baobabs', type: 'hotel',
    name: "Chez Maggie Guesthouse",
    description: "Bungalows locaux face aux baobabs, petit-déjeuner inclus.",
    phone: '+261 34 05 111 22', distance_meters: 500, price_range: '$',
  },
  {
    id: uuidv4(), poi_id: 'mg-avenue-baobabs', type: 'taxi',
    name: "Taxi-Brousse Morondava",
    description: "Transport collectif vers Morondava (30 min) et Belo-sur-Tsiribihina.",
    phone: null, distance_meters: 2000, price_range: null,
  },
  {
    id: uuidv4(), poi_id: 'mg-nosy-be', type: 'restaurant',
    name: "Le Jardin Vanille",
    description: "Cuisine française-malgache, langoustes et poissons du lagon.",
    phone: '+261 32 40 600 00', distance_meters: 300, price_range: '$$$',
  },
  {
    id: uuidv4(), poi_id: 'mg-isalo-park', type: 'hotel',
    name: "Isalo Rock Lodge",
    description: "Lodges de luxe en pierre intégrés au massif avec piscine face au panorama.",
    phone: '+261 20 22 349 49', distance_meters: 1200, price_range: '$$$$',
  },
  {
    id: uuidv4(), poi_id: 'mu-blue-penny-museum', type: 'atm',
    name: "MCB ATM Caudan",
    description: "Distributeur Mauritius Commercial Bank, accepte Visa/Mastercard.",
    phone: null, distance_meters: 50, price_range: null,
  },
];

// ─── Beacons ─────────────────────────────────────────────────────────────────
const beacons = [
  // Île Maurice (UUID_MU, major = site ID, minor = spot)
  { uuid: UUID_MU, major: 1, minor: 1, poi_id: 'mu-chamarel-7couleurs',   label: 'Entrée principale',   tx_power: -65 },
  { uuid: UUID_MU, major: 1, minor: 2, poi_id: 'mu-chamarel-waterfall',   label: 'Belvédère chutes',    tx_power: -65 },
  { uuid: UUID_MU, major: 2, minor: 1, poi_id: 'mu-black-river-gorges',   label: 'Visitor centre',      tx_power: -65 },
  { uuid: UUID_MU, major: 3, minor: 1, poi_id: 'mu-blue-penny-museum',    label: 'Hall d\'entrée',      tx_power: -65 },
  { uuid: UUID_MU, major: 3, minor: 2, poi_id: 'mu-blue-penny-museum',    label: 'Galerie timbre rare', tx_power: -68 },
  { uuid: UUID_MU, major: 4, minor: 1, poi_id: 'mu-central-market',       label: 'Porte nord',          tx_power: -65 },
  { uuid: UUID_MU, major: 5, minor: 1, poi_id: 'mu-grand-baie',           label: 'Place principale',    tx_power: -65 },
  { uuid: UUID_MU, major: 6, minor: 1, poi_id: 'mu-le-morne',             label: 'Parking / accueil',   tx_power: -65 },
  { uuid: UUID_MU, major: 7, minor: 1, poi_id: 'mu-pamplemousses',        label: 'Entrée jardin',       tx_power: -65 },
  { uuid: UUID_MU, major: 8, minor: 1, poi_id: 'mu-flic-en-flac',         label: 'Kiosque plage',       tx_power: -65 },
  // Madagascar (UUID_MG)
  { uuid: UUID_MG, major: 1, minor: 1, poi_id: 'mg-avenue-baobabs',       label: 'Début allée',         tx_power: -65 },
  { uuid: UUID_MG, major: 1, minor: 2, poi_id: 'mg-avenue-baobabs',       label: 'Point photo coucher', tx_power: -65 },
  { uuid: UUID_MG, major: 2, minor: 1, poi_id: 'mg-isalo-park',           label: 'Poste de garde',      tx_power: -65 },
  { uuid: UUID_MG, major: 3, minor: 1, poi_id: 'mg-nosy-be',              label: 'Port Hellville',      tx_power: -65 },
  { uuid: UUID_MG, major: 4, minor: 1, poi_id: 'mg-tsingy-bemaraha',      label: 'Accueil parc',        tx_power: -65 },
  { uuid: UUID_MG, major: 5, minor: 1, poi_id: 'mg-ranomafana',           label: 'Station biologique',  tx_power: -65 },
  { uuid: UUID_MG, major: 6, minor: 1, poi_id: 'mg-rova-antananarivo',    label: 'Cour d\'honneur',     tx_power: -65 },
].map(b => ({
  ...b,
  id: beaconId(b.uuid, b.major, b.minor),
  active: 1,
  installed_at: new Date().toISOString(),
  battery_level: 100,
}));

// ─── Run seed ────────────────────────────────────────────────────────────────
const insertPOI = db.prepare(`
  INSERT OR REPLACE INTO pois
    (id, name, description, category, country, latitude, longitude,
     address, image_url, audio_guide_url, website_url, opening_hours, entry_fee, languages)
  VALUES
    (@id, @name, @description, @category, @country, @latitude, @longitude,
     @address, @image_url, @audio_guide_url, @website_url, @opening_hours, @entry_fee, @languages)
`);

const insertBeacon = db.prepare(`
  INSERT OR REPLACE INTO beacons
    (id, uuid, major, minor, poi_id, label, tx_power, active, installed_at, battery_level)
  VALUES
    (@id, @uuid, @major, @minor, @poi_id, @label, @tx_power, @active, @installed_at, @battery_level)
`);

const insertContent = db.prepare(`
  INSERT OR REPLACE INTO content_blocks (id, poi_id, lang, title, body, type)
  VALUES (@id, @poi_id, @lang, @title, @body, @type)
`);

const insertService = db.prepare(`
  INSERT OR REPLACE INTO nearby_services
    (id, poi_id, type, name, description, phone, distance_meters, price_range)
  VALUES
    (@id, @poi_id, @type, @name, @description, @phone, @distance_meters, @price_range)
`);

const seedAll = db.transaction(() => {
  for (const p of pois)            insertPOI.run(p);
  for (const b of beacons)         insertBeacon.run(b);
  for (const c of contentBlocks)   insertContent.run(c);
  for (const s of nearbyServices)  insertService.run(s);
});

seedAll();
console.log(`✅ Seeded ${pois.length} POIs, ${beacons.length} beacons, ${contentBlocks.length} content blocks, ${nearbyServices.length} services.`);
