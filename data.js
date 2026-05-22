// ===== Редкости =====
// Чем выше index — тем реже выпадает
const RARITIES = {
  bronze:    { name: "Bronze",      color1: "#7a4a1f", color2: "#b07028", text: "#fff3d6", weight: 50,  minOvr: 60, maxOvr: 69 },
  silver:    { name: "Silver",      color1: "#7a7d85", color2: "#c8ccd4", text: "#1b1b1b", weight: 30,  minOvr: 70, maxOvr: 78 },
  gold:      { name: "Gold",        color1: "#a37a17", color2: "#f3d27a", text: "#2b1d00", weight: 18,  minOvr: 75, maxOvr: 83 },
  raregold:  { name: "Rare Gold",   color1: "#b88a1a", color2: "#ffe28a", text: "#2b1d00", weight: 10,  minOvr: 82, maxOvr: 87 },
  totw:      { name: "Team of the Week", color1: "#0c0c0c", color2: "#3a3a3a", text: "#f5d23a", weight: 5, minOvr: 84, maxOvr: 90 },
  icon:      { name: "Icon",        color1: "#a17a2a", color2: "#fff2b3", text: "#3a2700", weight: 1.2, minOvr: 88, maxOvr: 94 },
  hero:      { name: "Hero",        color1: "#5a187f", color2: "#d36cff", text: "#fff",     weight: 1.5, minOvr: 85, maxOvr: 91 }
};

// ===== Паки =====
const PACKS = {
  bronze: {
    id: "bronze",
    title: "Бронзовый пак",
    price: 500,
    cards: 3,
    description: "3 игрока. Гарантированно бронза и серебро, мизерный шанс на золото.",
    table: { bronze: 70, silver: 25, gold: 5 }
  },
  silver: {
    id: "silver",
    title: "Серебряный пак",
    price: 1500,
    cards: 5,
    description: "5 игроков. Серебро и золото, иногда редкое золото.",
    table: { silver: 75, gold: 20, raregold: 4.5 }
  },
  gold: {
    id: "gold",
    title: "Золотой пак",
    price: 3000,
    cards: 7,
    description: "7 игроков. Минимум золото, шанс на редкое золото и TOTW.",
    table: { gold: 75, raregold: 23, totw: 2 }
  },
  premium: {
    id: "premium",
    title: "Премиум пак",
    price: 7500,
    cards: 10,
    description: "10 игроков. Гарантирован минимум один Rare Gold, повышенный шанс на TOTW, Hero и Icon.",
    guarantees: [{ rarity: "raregold", count: 1 }],
    table: { raregold: 88, totw: 10, hero: 1.5, icon: 0.5 }
  },
  ultimate: {
    id: "ultimate",
    title: "Ultimate пак",
    price: 25000,
    cards: 12,
    description: "12 игроков. Гарантирован TOTW, серьёзный шанс на Hero и Icon.",
    guarantees: [{ rarity: "totw", count: 1 }],
    table: { raregold: 70, totw: 25, hero: 4, icon: 1 }
  }
};

// ===== Игроки =====
// id, name, club, nation, position, base rarity, base ovr
// Имена/клубы — общие, не привязаны к реальным правам
const PLAYERS = [
  // Bronze
  { id: 1,  name: "T. Novak",     club: "FC Praha",      nation: "CZ", pos: "GK", rarity: "bronze", ovr: 64 },
  { id: 2,  name: "L. Carter",    club: "Brighton Bay",  nation: "EN", pos: "CB", rarity: "bronze", ovr: 66 },
  { id: 3,  name: "M. Ortega",    club: "Cadiz Star",    nation: "ES", pos: "RB", rarity: "bronze", ovr: 63 },
  { id: 4,  name: "P. Janssen",   club: "Utrecht United",nation: "NL", pos: "CM", rarity: "bronze", ovr: 65 },
  { id: 5,  name: "K. Saito",     club: "Osaka Wave",    nation: "JP", pos: "LM", rarity: "bronze", ovr: 67 },
  { id: 6,  name: "D. Olsson",    club: "Malmo Nord",    nation: "SE", pos: "ST", rarity: "bronze", ovr: 68 },

  // Silver
  { id: 10, name: "R. Almeida",   club: "Porto Atletico", nation: "PT", pos: "GK", rarity: "silver", ovr: 74 },
  { id: 11, name: "G. Fischer",   club: "Berliner SV",    nation: "DE", pos: "CB", rarity: "silver", ovr: 76 },
  { id: 12, name: "J. Wallace",   club: "Glasgow City",   nation: "SC", pos: "LB", rarity: "silver", ovr: 73 },
  { id: 13, name: "S. Ben Ali",   club: "Tunis FC",       nation: "TN", pos: "CM", rarity: "silver", ovr: 75 },
  { id: 14, name: "A. Petrov",    club: "Sofia Stars",    nation: "BG", pos: "CAM",rarity: "silver", ovr: 77 },
  { id: 15, name: "L. Hansen",    club: "Copenhagen U",   nation: "DK", pos: "RW", rarity: "silver", ovr: 78 },
  { id: 16, name: "F. Costa",     club: "Lisboa Mar",     nation: "PT", pos: "ST", rarity: "silver", ovr: 76 },

  // Gold
  { id: 20, name: "M. Becker",    club: "München 04",    nation: "DE", pos: "GK", rarity: "gold",   ovr: 81 },
  { id: 21, name: "J. Romero",    club: "Buenos Estrellas",nation:"AR", pos: "CB", rarity: "gold",   ovr: 82 },
  { id: 22, name: "K. Dembele",   club: "Paris Etoile",  nation: "FR", pos: "CB", rarity: "gold",   ovr: 83 },
  { id: 23, name: "E. Visser",    club: "Amsterdam Ajax-like",nation:"NL",pos:"LB",rarity:"gold",   ovr: 80 },
  { id: 24, name: "Y. Tanaka",    club: "Tokyo Blue",    nation: "JP", pos: "CDM",rarity: "gold",   ovr: 81 },
  { id: 25, name: "I. Marchenko", club: "Kyiv Dynamic",  nation: "UA", pos: "CM", rarity: "gold",   ovr: 82 },
  { id: 26, name: "P. Bianchi",   club: "Milano Rossi",  nation: "IT", pos: "CAM",rarity: "gold",   ovr: 83 },
  { id: 27, name: "C. Andersen",  club: "Oslo Vikings",  nation: "NO", pos: "RW", rarity: "gold",   ovr: 82 },
  { id: 28, name: "B. Mensah",    club: "Accra Lions",   nation: "GH", pos: "LW", rarity: "gold",   ovr: 81 },
  { id: 29, name: "V. Silva",     club: "Rio Sul",       nation: "BR", pos: "ST", rarity: "gold",   ovr: 83 },

  // Rare Gold
  { id: 40, name: "H. Nakamura",  club: "Yokohama Wings", nation: "JP", pos: "GK", rarity: "raregold", ovr: 85 },
  { id: 41, name: "T. van Dijk",  club: "Rotterdam Stad", nation: "NL", pos: "CB", rarity: "raregold", ovr: 86 },
  { id: 42, name: "R. Mendes",    club: "Lisboa Mar",     nation: "PT", pos: "CM", rarity: "raregold", ovr: 86 },
  { id: 43, name: "A. Toure",     club: "Dakar United",   nation: "SN", pos: "CDM",rarity: "raregold", ovr: 85 },
  { id: 44, name: "N. Ricci",     club: "Milano Rossi",   nation: "IT", pos: "CAM",rarity: "raregold", ovr: 87 },
  { id: 45, name: "L. Moreno",    club: "Madrid Real-like",nation: "ES",pos: "LW", rarity: "raregold", ovr: 87 },
  { id: 46, name: "K. Park",      club: "Seoul Tigers",   nation: "KR", pos: "RW", rarity: "raregold", ovr: 85 },
  { id: 47, name: "J. Okafor",    club: "Lagos Eagles",   nation: "NG", pos: "ST", rarity: "raregold", ovr: 86 },

  // TOTW
  { id: 60, name: "M. Lindgren",  club: "Stockholm SK",   nation: "SE", pos: "CB", rarity: "totw", ovr: 88 },
  { id: 61, name: "G. Russo",     club: "Roma Centro",    nation: "IT", pos: "CM", rarity: "totw", ovr: 89 },
  { id: 62, name: "D. Owens",     club: "Manchester Red-like", nation: "EN", pos: "CAM", rarity: "totw", ovr: 89 },
  { id: 63, name: "S. El Amrani", club: "Casablanca FC",  nation: "MA", pos: "LW", rarity: "totw", ovr: 88 },
  { id: 64, name: "B. Larsson",   club: "Gothenburg",     nation: "SE", pos: "ST", rarity: "totw", ovr: 90 },

  // Hero
  { id: 80, name: "E. Volkov",    club: "Hero Edition",   nation: "RU", pos: "CDM",rarity: "hero", ovr: 88 },
  { id: 81, name: "M. Adebayo",   club: "Hero Edition",   nation: "NG", pos: "ST", rarity: "hero", ovr: 90 },
  { id: 82, name: "L. Petit",     club: "Hero Edition",   nation: "FR", pos: "RB", rarity: "hero", ovr: 87 },

  // Icon
  { id: 90, name: "R. Baggio",club: "Icons",          nation: "IT", pos: "CAM", rarity: "icon", ovr: 92 },
  { id: 91, name: "Zinedine Z.",  club: "Icons",          nation: "FR", pos: "CM",  rarity: "icon", ovr: 93 },
  { id: 92, name: "Ronaldinho",club: "Icons",          nation: "BR", pos: "CAM", rarity: "icon", ovr: 94 },
  { id: 93, name: "T. Henry",club: "Icons",         nation: "FR", pos: "LW",  rarity: "icon", ovr: 93 },
  { id: 94, name: "P. Maldini",club: "Icons",         nation: "IT", pos: "CB",  rarity: "icon", ovr: 91 }
];

// Цены продажи в зависимости от редкости и рейтинга
function sellPrice(player) {
  const rarityMult = {
    bronze: 1, silver: 2, gold: 5, raregold: 12, totw: 40, hero: 60, icon: 120
  }[player.rarity] || 1;
  const ovrBoost = Math.max(0, player.ovr - 60);
  return Math.round(50 * rarityMult + ovrBoost * 25 * (rarityMult / 5 + 1));
}

// Простая «фотография» — инициалы на цветном фоне (генерируется в рантайме)
function playerInitials(name) {
  return name
    .replace(/[^A-Za-zА-Яа-я. ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map(p => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
