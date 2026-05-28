// Game constants: maps, monsters, items, formulas

export const MAPS = [
  {
    id: 0,
    name: "Floresta Inicial",
    minLevel: 1,
    xpMult: 1,
    goldMult: 1,
    monsters: [
      { name: "Lobo Selvagem", level: 1, hp: 50, damage: 6, defense: 2, xp: 12, gold: 8, dropChance: 0.12 },
      { name: "Goblin Ladrao", level: 2, hp: 70, damage: 9, defense: 3, xp: 18, gold: 14, dropChance: 0.15 },
      { name: "Aranha Venenosa", level: 3, hp: 85, damage: 12, defense: 4, xp: 25, gold: 18, dropChance: 0.18 },
      { name: "Esqueleto Guerreiro", level: 4, hp: 110, damage: 14, defense: 6, xp: 35, gold: 24, dropChance: 0.2 },
      { name: "Ursinho Rabioso", level: 5, hp: 140, damage: 18, defense: 7, xp: 45, gold: 30, dropChance: 0.22 },
    ],
    boss: { name: "Troll da Floresta", level: 8, hp: 600, damage: 30, defense: 12, xp: 250, gold: 180, dropChance: 0.85 },
  },
  {
    id: 1,
    name: "Caverna Sombria",
    minLevel: 10,
    xpMult: 1.8,
    goldMult: 1.6,
    monsters: [
      { name: "Morcego Gigante", level: 10, hp: 220, damage: 28, defense: 10, xp: 85, gold: 55, dropChance: 0.2 },
      { name: "Golem de Pedra", level: 12, hp: 300, damage: 32, defense: 18, xp: 110, gold: 70, dropChance: 0.22 },
      { name: "Cobra das Trevas", level: 14, hp: 260, damage: 38, defense: 12, xp: 130, gold: 85, dropChance: 0.25 },
      { name: "Zumbi Guerreiro", level: 16, hp: 340, damage: 42, defense: 16, xp: 155, gold: 100, dropChance: 0.27 },
      { name: "Ogro das Pedras", level: 18, hp: 420, damage: 48, defense: 22, xp: 185, gold: 120, dropChance: 0.3 },
    ],
    boss: { name: "Senhor das Cavernas", level: 22, hp: 2500, damage: 90, defense: 40, xp: 1200, gold: 800, dropChance: 0.9 },
  },
  {
    id: 2,
    name: "Deserto Perdido",
    minLevel: 25,
    xpMult: 3,
    goldMult: 2.5,
    monsters: [
      { name: "Escorpiao Imperial", level: 25, hp: 580, damage: 75, defense: 28, xp: 320, gold: 200, dropChance: 0.25 },
      { name: "Mumia Amaldicoada", level: 28, hp: 680, damage: 88, defense: 32, xp: 390, gold: 240, dropChance: 0.28 },
      { name: "Djinn do Deserto", level: 31, hp: 750, damage: 100, defense: 38, xp: 460, gold: 280, dropChance: 0.3 },
      { name: "Guerreiro Anubis", level: 34, hp: 860, damage: 115, defense: 44, xp: 540, gold: 330, dropChance: 0.32 },
      { name: "Farao Morto-Vivo", level: 37, hp: 980, damage: 130, defense: 52, xp: 630, gold: 380, dropChance: 0.35 },
    ],
    boss: { name: "Senhor das Areias", level: 42, hp: 8000, damage: 280, defense: 100, xp: 5000, gold: 3000, dropChance: 0.92 },
  },
  {
    id: 3,
    name: "Torre Demoniaca",
    minLevel: 50,
    xpMult: 5,
    goldMult: 4,
    monsters: [
      { name: "Demonio Menor", level: 50, hp: 1400, damage: 200, defense: 70, xp: 1200, gold: 700, dropChance: 0.3 },
      { name: "Succubus", level: 54, hp: 1600, damage: 240, defense: 80, xp: 1500, gold: 880, dropChance: 0.33 },
      { name: "Incubus Mago", level: 58, hp: 1800, damage: 285, defense: 90, xp: 1850, gold: 1050, dropChance: 0.36 },
      { name: "Guardiao Infernal", level: 62, hp: 2100, damage: 330, defense: 105, xp: 2200, gold: 1250, dropChance: 0.39 },
      { name: "Lorde Demonio", level: 66, hp: 2500, damage: 380, defense: 125, xp: 2700, gold: 1500, dropChance: 0.42 },
    ],
    boss: { name: "Arquidemonio", level: 72, hp: 28000, damage: 900, defense: 280, xp: 22000, gold: 12000, dropChance: 0.95 },
  },
  {
    id: 4,
    name: "Vale dos Dragoes",
    minLevel: 75,
    xpMult: 8,
    goldMult: 6.5,
    monsters: [
      { name: "Dragao Jovem", level: 75, hp: 3800, damage: 580, defense: 180, xp: 5500, gold: 3200, dropChance: 0.35 },
      { name: "Drake de Fogo", level: 80, hp: 4400, damage: 680, defense: 210, xp: 7000, gold: 4000, dropChance: 0.38 },
      { name: "Dragao de Gelo", level: 84, hp: 5100, damage: 780, defense: 245, xp: 8800, gold: 5000, dropChance: 0.41 },
      { name: "Dragao das Sombras", level: 88, hp: 5900, damage: 890, defense: 285, xp: 11000, gold: 6200, dropChance: 0.44 },
      { name: "Dragao Anciao", level: 92, hp: 6900, damage: 1020, defense: 330, xp: 14000, gold: 7800, dropChance: 0.47 },
    ],
    boss: { name: "Dragao Lendario Kalthorax", level: 97, hp: 100000, damage: 2500, defense: 700, xp: 80000, gold: 45000, dropChance: 0.97 },
  },
  {
    id: 5,
    name: "Reino Infernal",
    minLevel: 100,
    xpMult: 14,
    goldMult: 11,
    monsters: [
      { name: "Serafim Corrompido", level: 100, hp: 12000, damage: 1800, defense: 560, xp: 28000, gold: 16000, dropChance: 0.4 },
      { name: "Anjo da Morte", level: 105, hp: 14000, damage: 2100, defense: 650, xp: 36000, gold: 20000, dropChance: 0.43 },
      { name: "Titan das Trevas", level: 110, hp: 16500, damage: 2450, defense: 760, xp: 46000, gold: 25000, dropChance: 0.46 },
      { name: "Deus Menor Corrompido", level: 115, hp: 19000, damage: 2850, defense: 880, xp: 58000, gold: 31000, dropChance: 0.49 },
      { name: "Guardiao do Abismo", level: 120, hp: 22000, damage: 3300, defense: 1020, xp: 72000, gold: 38000, dropChance: 0.52 },
    ],
    boss: { name: "O Senhor das Trevas Eternais", level: 130, hp: 500000, damage: 8000, defense: 2500, xp: 400000, gold: 200000, dropChance: 0.99 },
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
