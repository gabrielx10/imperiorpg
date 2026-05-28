// Game constants: maps, monsters, items, formulas

export const MAPS = [
  {
    id: 0,
    name: "Floresta Inicial",
    minLevel: 1,
    xpMult: 1,
    goldMult: 1,
    monsters: [
      { name: "Lobo Selvagem", level: 1, hp: 45, damage: 7, defense: 2, xp: 15, gold: 10, dropChance: 0.14 },
      { name: "Goblin Ladrão", level: 2, hp: 65, damage: 11, defense: 3, xp: 22, gold: 16, dropChance: 0.16 },
      { name: "Aranha Venenosa", level: 3, hp: 80, damage: 14, defense: 4, xp: 30, gold: 20, dropChance: 0.18 },
      { name: "Esqueleto Guerreiro", level: 4, hp: 100, damage: 16, defense: 5, xp: 40, gold: 28, dropChance: 0.2 },
      { name: "Ursinho Rabioso", level: 5, hp: 130, damage: 20, defense: 7, xp: 52, gold: 35, dropChance: 0.23 },
      { name: "Elfo das Sombras", level: 6, hp: 95, damage: 18, defense: 6, xp: 48, gold: 32, dropChance: 0.21 },
    ],
    boss: { name: "Troll da Floresta", level: 8, hp: 800, damage: 38, defense: 15, xp: 320, gold: 220, dropChance: 0.9 },
  },
  {
    id: 1,
    name: "Caverna Sombria",
    minLevel: 10,
    xpMult: 1.8,
    goldMult: 1.6,
    monsters: [
      { name: "Morcego Gigante", level: 10, hp: 240, damage: 32, defense: 11, xp: 100, gold: 65, dropChance: 0.22 },
      { name: "Golem de Pedra", level: 12, hp: 320, damage: 36, defense: 20, xp: 130, gold: 85, dropChance: 0.24 },
      { name: "Cobra das Trevas", level: 14, hp: 280, damage: 42, defense: 14, xp: 155, gold: 100, dropChance: 0.27 },
      { name: "Zumbi Guerreiro", level: 16, hp: 360, damage: 48, defense: 18, xp: 180, gold: 115, dropChance: 0.29 },
      { name: "Ogro das Pedras", level: 18, hp: 440, damage: 54, defense: 25, xp: 215, gold: 138, dropChance: 0.32 },
      { name: "Espectro Antigo", level: 20, hp: 320, damage: 50, defense: 16, xp: 200, gold: 130, dropChance: 0.28 },
    ],
    boss: { name: "Senhor das Cavernas", level: 22, hp: 3200, damage: 110, defense: 50, xp: 1600, gold: 1000, dropChance: 0.95 },
  },
  {
    id: 2,
    name: "Deserto Perdido",
    minLevel: 25,
    xpMult: 3,
    goldMult: 2.5,
    monsters: [
      { name: "Escorpião Imperial", level: 25, hp: 620, damage: 85, defense: 32, xp: 380, gold: 240, dropChance: 0.27 },
      { name: "Múmia Amaldiçoada", level: 28, hp: 720, damage: 100, defense: 36, xp: 460, gold: 290, dropChance: 0.30 },
      { name: "Djinn do Deserto", level: 31, hp: 800, damage: 115, defense: 42, xp: 540, gold: 340, dropChance: 0.33 },
      { name: "Guerreiro Anúbis", level: 34, hp: 920, damage: 130, defense: 48, xp: 630, gold: 395, dropChance: 0.35 },
      { name: "Faraó Morto-Vivo", level: 37, hp: 1050, damage: 150, defense: 58, xp: 740, gold: 460, dropChance: 0.38 },
      { name: "Basilisco do Deserto", level: 40, hp: 900, damage: 135, defense: 50, xp: 680, gold: 425, dropChance: 0.36 },
    ],
    boss: { name: "Senhor das Areias", level: 42, hp: 10000, damage: 320, defense: 120, xp: 6500, gold: 4000, dropChance: 0.97 },
  },
  {
    id: 3,
    name: "Torre Demoníaca",
    minLevel: 50,
    xpMult: 5,
    goldMult: 4,
    monsters: [
      { name: "Demônio Menor", level: 50, hp: 1500, damage: 225, defense: 75, xp: 1400, gold: 850, dropChance: 0.32 },
      { name: "Súcubo", level: 54, hp: 1700, damage: 270, defense: 85, xp: 1750, gold: 1050, dropChance: 0.35 },
      { name: "Incubo Mago", level: 58, hp: 1950, damage: 320, defense: 100, xp: 2150, gold: 1280, dropChance: 0.38 },
      { name: "Guardião Infernal", level: 62, hp: 2250, damage: 370, defense: 115, xp: 2550, gold: 1520, dropChance: 0.41 },
      { name: "Lorde Demônio", level: 66, hp: 2700, damage: 420, defense: 140, xp: 3150, gold: 1850, dropChance: 0.44 },
      { name: "Príncipe do Abismo", level: 70, hp: 2400, damage: 380, defense: 125, xp: 2900, gold: 1700, dropChance: 0.42 },
    ],
    boss: { name: "Arquidemônio", level: 72, hp: 35000, damage: 1050, defense: 320, xp: 28000, gold: 16000, dropChance: 0.98 },
  },
  {
    id: 4,
    name: "Vale dos Dragões",
    minLevel: 75,
    xpMult: 8,
    goldMult: 6.5,
    monsters: [
      { name: "Dragão Jovem", level: 75, hp: 4200, damage: 650, defense: 200, xp: 6500, gold: 3800, dropChance: 0.37 },
      { name: "Drake de Fogo", level: 80, hp: 4800, damage: 750, defense: 235, xp: 8200, gold: 4700, dropChance: 0.40 },
      { name: "Dragão de Gelo", level: 84, hp: 5500, damage: 860, defense: 270, xp: 10200, gold: 5850, dropChance: 0.43 },
      { name: "Dragão das Sombras", level: 88, hp: 6300, damage: 980, defense: 310, xp: 12800, gold: 7200, dropChance: 0.46 },
      { name: "Dragão Ancião", level: 92, hp: 7400, damage: 1120, defense: 360, xp: 16300, gold: 9000, dropChance: 0.49 },
      { name: "Wyvern Tempestade", level: 95, hp: 6800, damage: 1000, defense: 330, xp: 14500, gold: 8200, dropChance: 0.47 },
    ],
    boss: { name: "Dragão Lendário Kalthorax", level: 97, hp: 120000, damage: 2850, defense: 800, xp: 95000, gold: 55000, dropChance: 0.99 },
  },
  {
    id: 5,
    name: "Reino Infernal",
    minLevel: 100,
    xpMult: 14,
    goldMult: 11,
    monsters: [
      { name: "Serafim Corrompido", level: 100, hp: 13500, damage: 2000, defense: 620, xp: 32000, gold: 18500, dropChance: 0.42 },
      { name: "Anjo da Morte", level: 105, hp: 15500, damage: 2350, defense: 720, xp: 41000, gold: 23000, dropChance: 0.45 },
      { name: "Titã das Trevas", level: 110, hp: 18000, damage: 2700, defense: 840, xp: 52000, gold: 29000, dropChance: 0.48 },
      { name: "Deus Menor Corrompido", level: 115, hp: 20500, damage: 3150, defense: 960, xp: 65000, gold: 36000, dropChance: 0.51 },
      { name: "Guardião do Abismo", level: 120, hp: 23500, damage: 3600, defense: 1100, xp: 80000, gold: 44000, dropChance: 0.54 },
      { name: "Rei do Caos", level: 125, hp: 22000, damage: 3400, defense: 1050, xp: 75000, gold: 42000, dropChance: 0.52 },
    ],
    boss: { name: "O Senhor das Trevas Eternais", level: 130, hp: 600000, damage: 9000, defense: 2800, xp: 500000, gold: 250000, dropChance: 1.0 },
  },
];

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "divine"] as const;
export type Rarity = typeof RARITIES[number];

export const RARITY_WEIGHTS = [600, 250, 100, 35, 10, 4, 1];
export const RARITY_TOTAL = RARITY_WEIGHTS.reduce((a, b) => a + b, 0);

export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.6,
  rare: 2.8,
  epic: 5,
  legendary: 9,
  mythic: 16,
  divine: 28,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
  mythic: "#f44336",
  divine: "#ffd700",
};

export const ITEM_TYPES = ["sword", "axe", "staff", "bow", "helmet", "chest", "pants", "boots", "ring", "necklace"] as const;
export type ItemType = typeof ITEM_TYPES[number];

export const WEAPON_TYPES: ItemType[] = ["sword", "axe", "staff", "bow"];
export const ARMOR_TYPES: ItemType[] = ["helmet", "chest", "pants", "boots"];
export const ACCESSORY_TYPES: ItemType[] = ["ring", "necklace"];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  sword: "Espada",
  axe: "Machado",
  staff: "Cajado",
  bow: "Arco",
  helmet: "Capacete",
  chest: "Peitoral",
  pants: "Calca",
  boots: "Botas",
  ring: "Anel",
  necklace: "Colar",
};

export const ITEM_SLOT_MAP: Record<ItemType, string> = {
  sword: "weapon",
  axe: "weapon",
  staff: "weapon",
  bow: "weapon",
  helmet: "helmet",
  chest: "chest",
  pants: "pants",
  boots: "boots",
  ring: "ring1",
  necklace: "necklace",
};

const WEAPON_PREFIXES = ["Cruel", "Devastador", "Letal", "Furioso", "Sombrio", "Sagrado", "Maldito", "Celeste", "Infernal", "Eterno"];
const ARMOR_PREFIXES = ["Resistente", "Impenetravel", "Sagrado", "Sombrio", "Lendario", "Celeste", "Infernal", "Eterno", "Divino", "Abissal"];
const ACCESSORY_PREFIXES = ["Mistico", "Encantado", "Amaldicoado", "Bencao", "Maldito", "Celeste", "Infernal", "Eterno", "Divino", "Sagrado"];

const WEAPON_NAMES: Record<ItemType, string[]> = {
  sword: ["Espada do Caos", "Lamina Negra", "Corte Eterno", "Fio da Morte", "Gelo Eterno"],
  axe: ["Machado da Ira", "Corte Brutal", "Ruina Dupla", "Golpe Fatal", "Furia Suprema"],
  staff: ["Cajado Arcano", "Baculo das Sombras", "Varita do Caos", "Baculo Celeste", "Orbe da Morte"],
  bow: ["Arco do Vento", "Arco das Sombras", "Flechador Eterno", "Arco Celestial", "Corda da Morte"],
  helmet: [],
  chest: [],
  pants: [],
  boots: [],
  ring: [],
  necklace: [],
};

const ARMOR_NAMES: Record<ItemType, string[]> = {
  sword: [],
  axe: [],
  staff: [],
  bow: [],
  helmet: ["Elmo do Guerreiro", "Capacete das Sombras", "Coroa do Dragao", "Mascara Infernal", "Elmo Celestial"],
  chest: ["Peitoral de Ferro", "Armadura das Sombras", "Coraca do Dragao", "Manto Infernal", "Peitoral Celestial"],
  pants: ["Calca de Couro", "Grevas das Sombras", "Calca do Dragao", "Grevas Infernais", "Calca Celestial"],
  boots: ["Botas do Aventureiro", "Grevas Sombrias", "Botas do Dragao", "Grevas Infernais", "Botas Celestiais"],
  ring: [],
  necklace: [],
};

const ACCESSORY_NAMES: Record<ItemType, string[]> = {
  sword: [],
  axe: [],
  staff: [],
  bow: [],
  helmet: [],
  chest: [],
  pants: [],
  boots: [],
  ring: ["Anel do Poder", "Anel das Sombras", "Anel do Dragao", "Anel Infernal", "Anel Celestial"],
  necklace: ["Colar do Destino", "Colar das Sombras", "Colar do Dragao", "Colar Infernal", "Colar Celestial"],
};

export interface GameItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  level: number;
  damage: number;
  defense: number;
  hp: number;
  crit: number;
  luck: number;
  sellValue: number;
}

export function rollRarity(): Rarity {
  let roll = Math.floor(Math.random() * RARITY_TOTAL);
  for (let i = 0; i < RARITIES.length; i++) {
    roll -= RARITY_WEIGHTS[i];
    if (roll < 0) return RARITIES[i];
  }
  return "common";
}

export function generateItem(level: number, forcedRarity?: Rarity): GameItem {
  const rarity = forcedRarity ?? rollRarity();
  const mult = RARITY_MULTIPLIERS[rarity];
  const typeIndex = Math.floor(Math.random() * ITEM_TYPES.length);
  const type = ITEM_TYPES[typeIndex];

  let baseName = "";
  let prefix = "";

  if (WEAPON_TYPES.includes(type)) {
    const names = WEAPON_NAMES[type];
    baseName = names[Math.floor(Math.random() * names.length)];
    prefix = WEAPON_PREFIXES[Math.floor(Math.random() * WEAPON_PREFIXES.length)];
  } else if (ARMOR_TYPES.includes(type)) {
    const names = ARMOR_NAMES[type];
    baseName = names[Math.floor(Math.random() * names.length)];
    prefix = ARMOR_PREFIXES[Math.floor(Math.random() * ARMOR_PREFIXES.length)];
  } else {
    const names = ACCESSORY_NAMES[type];
    baseName = names[Math.floor(Math.random() * names.length)];
    prefix = ACCESSORY_PREFIXES[Math.floor(Math.random() * ACCESSORY_PREFIXES.length)];
  }

  const name = `${prefix} ${baseName}`;
  const base = level * 2;

  let damage = 0, defense = 0, hp = 0, crit = 0, luck = 0;

  if (WEAPON_TYPES.includes(type)) {
    damage = Math.floor(base * mult * (0.8 + Math.random() * 0.4));
    crit = Math.floor(mult * (1 + Math.random() * 3));
  } else if (ARMOR_TYPES.includes(type)) {
    defense = Math.floor(base * 0.5 * mult * (0.8 + Math.random() * 0.4));
    hp = Math.floor(base * 3 * mult * (0.8 + Math.random() * 0.4));
  } else {
    luck = Math.floor(mult * (1 + Math.random() * 4));
    crit = Math.floor(mult * (0.5 + Math.random() * 2));
    damage = Math.floor(base * 0.15 * mult * (0.8 + Math.random() * 0.4));
    defense = Math.floor(base * 0.1 * mult * (0.8 + Math.random() * 0.4));
  }

  const sellValue = Math.floor(level * mult * 10 * (0.5 + Math.random() * 0.5));

  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    type,
    rarity,
    level,
    damage,
    defense,
    hp,
    crit,
    luck,
    sellValue,
  };
}

export function xpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.18, level - 1));
}

export function getPlayerPower(
  level: number,
  resetCount: number,
  totalDamage: number,
  totalDefense: number,
  totalHp: number
): number {
  return Math.floor((totalDamage * 3 + totalDefense * 2 + totalHp * 0.5) * (1 + resetCount * 0.15) * level * 0.1);
}

export const CLASSES = {
  warrior: { label: "Guerreiro", dmgMult: 1.2, defMult: 1.3, hpMult: 1.4, speedMult: 1.0, critMult: 1.0, luckMult: 1.0 },
  mage: { label: "Mago", dmgMult: 1.5, defMult: 0.9, hpMult: 0.9, speedMult: 1.2, critMult: 1.3, luckMult: 1.1 },
  archer: { label: "Arqueiro", dmgMult: 1.3, defMult: 1.0, hpMult: 1.0, speedMult: 1.4, critMult: 1.5, luckMult: 1.3 },
} as const;

export const MAX_LEVEL = 100;
export const INVENTORY_MAX = 80;
export const OFFLINE_MAX_SECONDS = 7200;
export const BATTLE_INTERVAL_SECONDS = 3;

export const SHOP_ITEMS = [
  { id: "potion_small", name: "Pocao Pequena", description: "Restaura 30% do HP", price: 50, type: "potion", value: 30 },
  { id: "potion_medium", name: "Pocao Media", description: "Restaura 60% do HP", price: 120, type: "potion", value: 60 },
  { id: "potion_large", name: "Pocao Grande", description: "Restaura 100% do HP", price: 280, type: "potion", value: 100 },
  { id: "chest_common", name: "Bau Comum", description: "Contem 1 item comum", price: 200, type: "chest", rarity: "common" },
  { id: "chest_rare", name: "Bau Raro", description: "Contem 1 item raro", price: 800, type: "chest", rarity: "rare" },
  { id: "chest_epic", name: "Bau Epico", description: "Contem 1 item epico", price: 2500, type: "chest", rarity: "epic" },
  { id: "chest_legendary", name: "Bau Lendario", description: "Contem 1 item lendario", price: 8000, type: "chest", rarity: "legendary" },
  { id: "chest_divine", name: "Bau Divino", description: "Contem 1 item divino", price: 50000, type: "chest", rarity: "divine" },
  { id: "inv_expand", name: "Expansao de Inventario", description: "+20 espacos no inventario", price: 5000, type: "expansion", value: 20 },
];
