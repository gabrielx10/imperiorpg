import {
  MAPS,
  CLASSES,
  generateItem,
  xpToNextLevel,
  MAX_LEVEL,
  type GameItem,
  type Rarity,
} from "./gameData.js";

export interface EquippedStats {
  damage: number;
  defense: number;
  hp: number;
  crit: number;
  luck: number;
}

export interface CharacterCombatStats {
  totalDamage: number;
  totalDefense: number;
  totalHp: number;
  totalMaxHp: number;
  critChance: number;
  critDamage: number;
  luck: number;
}

export function calcStats(char: {
  level: number;
  class: string;
  resetCount: number;
  statDamage: number;
  statDefense: number;
  statHp: number;
  statSpeed: number;
  statCrit: number;
  statLuck: number;
  currentHp: number;
  maxHp: number;
}, equipped: EquippedStats): CharacterCombatStats {
  const cls = CLASSES[char.class as keyof typeof CLASSES] ?? CLASSES.warrior;
  const resetBonus = 1 + char.resetCount * 0.1;

  const baseDmg = (10 + char.level * 3 + char.statDamage * 2) * cls.dmgMult * resetBonus;
  const baseDef = (5 + char.level * 1.5 + char.statDefense * 2) * cls.defMult * resetBonus;
  const baseHp = (100 + char.level * 10 + char.statHp * 5) * cls.hpMult * resetBonus;

  const critChance = Math.min(75, (5 + char.statCrit * 1.5 + equipped.crit) * cls.critMult);
  const critDamage = 150 + char.statCrit * 2;
  const luck = (char.statLuck + equipped.luck) * cls.luckMult;

  const totalDamage = Math.floor(baseDmg + equipped.damage);
  const totalDefense = Math.floor(baseDef + equipped.defense);
  const totalMaxHp = Math.floor(baseHp + equipped.hp);

  return {
    totalDamage,
    totalDefense,
    totalMaxHp,
    totalHp: Math.min(char.currentHp, totalMaxHp),
    critChance,
    critDamage,
    luck,
  };
}

export interface BattleResult {
  monsterName: string;
  win: boolean;
  playerDamageDealt: number;
  playerDamageReceived: number;
  xpGained: number;
  goldGained: number;
  droppedItem: GameItem | null;
  newLevel: number;
  newXp: number;
  newGold: number;
  newCurrentHp: number;
  leveledUp: boolean;
  bonusPoints: number;
  xpForNextLevel: number;
}

export function simulateBattle(
  char: {
    level: number;
    xp: number;
    gold: number;
    mapId: number;
    resetCount: number;
    currentHp: number;
    maxHp: number;
    bonusPoints: number;
    statDamage: number;
    statDefense: number;
    statHp: number;
    statSpeed: number;
    statCrit: number;
    statLuck: number;
    class: string;
  },
  equippedStats: EquippedStats,
  xpMultiplier: number,
  goldMultiplier: number
): BattleResult {
  const mapData = MAPS[char.mapId] ?? MAPS[0];
  const stats = calcStats(char, equippedStats);

  // Select monster appropriate for level
  const eligible = mapData.monsters.filter(m => m.level <= char.level + 5);
  const monsterPool = eligible.length > 0 ? eligible : mapData.monsters;
  const monster = monsterPool[Math.floor(Math.random() * monsterPool.length)];

  // Player attacks monster
  const isCrit = Math.random() * 100 < stats.critChance;
  let playerDmg = Math.max(1, stats.totalDamage - monster.defense);
  if (isCrit) playerDmg = Math.floor(playerDmg * (stats.critDamage / 100));

  // Monster attacks player
  const monsterDmg = Math.max(1, monster.damage - stats.totalDefense);
  const battlesNeeded = Math.ceil(monster.hp / playerDmg);
  const damageReceived = monsterDmg * battlesNeeded;

  const win = playerDmg > 0;

  let newCurrentHp = stats.totalHp - (win ? Math.floor(damageReceived * 0.3) : monsterDmg * 3);

  // Regenerate some HP between battles
  const regenAmount = Math.floor(stats.totalMaxHp * 0.05);
  newCurrentHp = Math.min(stats.totalMaxHp, newCurrentHp + regenAmount);

  // If HP too low, auto-heal to 30%
  if (newCurrentHp < stats.totalMaxHp * 0.1) {
    newCurrentHp = Math.floor(stats.totalMaxHp * 0.3);
  }

  const xpGained = win ? Math.floor(monster.xp * xpMultiplier) : Math.floor(monster.xp * 0.1 * xpMultiplier);
  const goldGained = win ? Math.floor(monster.gold * goldMultiplier) : 0;

  // Drop chance boosted by luck
  const dropChance = monster.dropChance * (1 + stats.luck * 0.01);
  const droppedItem = win && Math.random() < dropChance
    ? generateItem(Math.max(1, char.level + Math.floor(Math.random() * 5 - 2)))
    : null;

  // Level up logic
  let newXp = char.xp + xpGained;
  let newLevel = char.level;
  let leveledUp = false;
  let bonusPoints = char.bonusPoints;

  while (newLevel < MAX_LEVEL && newXp >= xpToNextLevel(newLevel)) {
    newXp -= xpToNextLevel(newLevel);
    newLevel++;
    leveledUp = true;
    bonusPoints += 3;
  }

  if (newLevel >= MAX_LEVEL) {
    newLevel = MAX_LEVEL;
    newXp = Math.min(newXp, xpToNextLevel(MAX_LEVEL) - 1);
  }

  const newGold = char.gold + goldGained;

  return {
    monsterName: monster.name,
    win,
    playerDamageDealt: playerDmg,
    playerDamageReceived: Math.floor(damageReceived * 0.3),
    xpGained,
    goldGained,
    droppedItem,
    newLevel,
    newXp,
    newGold,
    newCurrentHp,
    leveledUp,
    bonusPoints,
    xpForNextLevel: xpToNextLevel(newLevel),
  };
}
