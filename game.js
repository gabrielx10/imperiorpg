/* ═══════════════════════════════════════════════
   IMPÉRIO RPG AUTO — Frontend Game Logic
═══════════════════════════════════════════════ */

// ── State ──
const state = {
  token: localStorage.getItem('irpg_token') || null,
  char: null,
  equippedStats: null,
  battleTimer: null,
  chatTimer: null,
  rankTimer: null,
  eventTimer: null,
  currentTab: 'battle',
  inventory: [],
  activeEvents: [],
  battleLogEntries: [],
};

// ── Game Data (client-side copy) ──
const MAPS = [
  { id: 0, name: "Floresta Inicial", minLevel: 1, icon: "🌲" },
  { id: 1, name: "Caverna Sombria", minLevel: 10, icon: "🕳" },
  { id: 2, name: "Deserto Perdido", minLevel: 25, icon: "🏜" },
  { id: 3, name: "Torre Demoníaca", minLevel: 50, icon: "🏰" },
  { id: 4, name: "Vale dos Dragões", minLevel: 75, icon: "🐉" },
  { id: 5, name: "Reino Infernal", minLevel: 100, icon: "🔥" },
];

const CLASSES = {
  warrior: "Guerreiro", mage: "Mago", archer: "Arqueiro",
};

const CLASS_ICONS = { warrior: "🛡", mage: "🔮", archer: "🏹" };

const RARITY_COLORS = {
  common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3",
  epic: "#9c27b0", legendary: "#ff9800", mythic: "#f44336", divine: "#ffd700",
};

const RARITY_LABELS = {
  common: "Comum", uncommon: "Incomum", rare: "Raro",
  epic: "Épico", legendary: "Lendário", mythic: "Mítico", divine: "Divino",
};

const TYPE_ICONS = {
  sword: "⚔", axe: "🪓", staff: "🔮", bow: "🏹",
  helmet: "⛑", chest: "🥋", pants: "👖", boots: "👢",
  ring: "💍", necklace: "📿",
};

const STAT_LABELS = [
  { key: "statDamage", label: "Dano", icon: "⚔", color: "#e74c3c" },
  { key: "statDefense", label: "Defesa", icon: "🛡", color: "#3498db" },
  { key: "statHp", label: "Vida", icon: "❤", color: "#e74c3c" },
  { key: "statSpeed", label: "Velocidade", icon: "⚡", color: "#f39c12" },
  { key: "statCrit", label: "Crítico", icon: "💥", color: "#e67e22" },
  { key: "statLuck", label: "Sorte", icon: "🍀", color: "#27ae60" },
];

// ── API Helper ──
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (state.token) opts.headers['Authorization'] = `Bearer ${state.token}`;
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(path, opts);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, message: data.error || 'Erro desconhecido' };
    return data;
  } catch (e) {
    if (e.status) throw e;
    throw { status: 0, message: 'Erro de conexão' };
  }
}

// ── Toast Notifications ──
function toast(msg, type = 'info', duration = 3500) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── Screen Management ──
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

// ── Tab Management ──
function switchTab(name) {
  state.currentTab = name;
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  if (name === 'inventory') loadInventory();
  if (name === 'ranking') loadRanking('level');
  if (name === 'shop') renderShop();
  if (name === 'guild') loadGuild();
  if (name === 'events') loadEvents();
  if (name === 'chat') loadChat();
  if (name === 'stats') renderStats();
  if (name === 'equipment') loadEquipment();
}

// ── Modal ──
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').style.display = 'flex';
  const closeBtn = document.getElementById('modal-overlay').querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = closeModal;
  document.getElementById('modal-overlay').onclick = (e) => { if (e.target.id === 'modal-overlay') closeModal(); };
}
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

// ═══════════════════════════════════════════════
//   AUTH
// ═══════════════════════════════════════════════
document.getElementById('go-register').onclick = (e) => { e.preventDefault(); showScreen('register'); };
document.getElementById('go-login').onclick = (e) => { e.preventDefault(); showScreen('login'); };

document.getElementById('form-login').onsubmit = async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  try {
    const data = await api('/api/login', 'POST', {
      username: document.getElementById('login-username').value,
      password: document.getElementById('login-password').value,
    });
    state.token = data.token;
    localStorage.setItem('irpg_token', data.token);
    await initGame();
  } catch (e) { errEl.textContent = e.message; }
};

document.getElementById('form-register').onsubmit = async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('reg-error');
  errEl.textContent = '';
  try {
    const data = await api('/api/register', 'POST', {
      username: document.getElementById('reg-username').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
    });
    state.token = data.token;
    localStorage.setItem('irpg_token', data.token);
    await initGame();
  } catch (e) { errEl.textContent = e.message; }
};

document.getElementById('btn-logout').onclick = async () => {
  try { await api('/api/logout', 'POST'); } catch {}
  state.token = null;
  state.char = null;
  localStorage.removeItem('irpg_token');
  stopBattleLoop();
  showScreen('login');
};

// ═══════════════════════════════════════════════
//   CHARACTER CREATION
// ═══════════════════════════════════════════════
let selectedClass = 'warrior';

document.querySelectorAll('.class-card').forEach(card => {
  card.onclick = () => {
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedClass = card.dataset.class;
  };
});

document.getElementById('form-create-char').onsubmit = async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('create-char-error');
  errEl.textContent = '';
  try {
    const data = await api('/api/create-character', 'POST', {
      name: document.getElementById('char-name').value,
      class: selectedClass,
    });
    state.char = data.character;
    startGameLoop();
    showScreen('game');
    toast('Personagem criado! Bem-vindo ao Império!', 'success', 4000);
  } catch (e) { errEl.textContent = e.message; }
};

// ═══════════════════════════════════════════════
//   GAME INIT
// ═══════════════════════════════════════════════
async function initGame() {
  try {
    const data = await api('/api/get-player');
    if (!data.character) {
      showScreen('create-char');
      return;
    }
    state.char = data.character;
    state.equippedStats = data.equippedStats;

    if (data.offlineProgress && data.offlineProgress.battles > 0) {
      const op = data.offlineProgress;
      showOfflineProgress(op);
    }

    updateHeader();
    updateBattlePanel();
    showScreen('game');
    startBattleLoop();
    startChatPoll();
  } catch (e) {
    if (e.status === 401) {
      state.token = null;
      localStorage.removeItem('irpg_token');
      showScreen('login');
    } else {
      toast('Erro ao conectar: ' + e.message, 'error');
    }
  }
}

function showOfflineProgress(op) {
  const panel = document.getElementById('offline-panel');
  panel.style.display = 'block';
  document.getElementById('offline-info').innerHTML = `
    <div class="off-stat"><span>Batalhas</span><span>${op.battles.toLocaleString()}</span></div>
    <div class="off-stat"><span>XP Ganho</span><span style="color:var(--blue2)">${op.xp.toLocaleString()}</span></div>
    <div class="off-stat"><span>Ouro Ganho</span><span style="color:var(--gold)">${op.gold.toLocaleString()}</span></div>
    ${op.levels > 0 ? `<div class="off-stat"><span>Níveis Ganhos</span><span style="color:var(--gold2)">${op.levels}</span></div>` : ''}
  `;
  addBattleLog(`⏰ Progresso offline: ${op.battles} batalhas, +${op.xp.toLocaleString()} XP, +${op.gold.toLocaleString()} ouro${op.levels > 0 ? `, +${op.levels} níveis!` : ''}`, 'offline');
  setTimeout(() => { panel.style.display = 'none'; }, 10000);
}

// ═══════════════════════════════════════════════
//   BATTLE LOOP
// ═══════════════════════════════════════════════
function startBattleLoop() {
  stopBattleLoop();
  battleTick();
  state.battleTimer = setInterval(battleTick, 3000);
}

function stopBattleLoop() {
  if (state.battleTimer) { clearInterval(state.battleTimer); state.battleTimer = null; }
}

let isBattling = false;
async function battleTick() {
  if (isBattling || !state.char) return;
  isBattling = true;
  try {
    const data = await api('/api/battle-tick', 'POST');
    const r = data.result;
    const c = data.character;

    // Update char state
    Object.assign(state.char, c);
    state.activeEvents = data.activeEvents || [];

    // Animate monster name
    document.getElementById('monster-fighter-name').textContent = r.monsterName;
    document.getElementById('monster-avatar').textContent = getMonsterEmoji(r.monsterName);

    // Log entry
    let logMsg = r.win
      ? `⚔ ${r.monsterName} — DMG: ${r.playerDamageDealt.toLocaleString()} | XP: +${r.xpGained.toLocaleString()} | Gold: +${r.goldGained.toLocaleString()}`
      : `💀 Derrota contra ${r.monsterName} — Recebeu: ${r.playerDamageReceived.toLocaleString()} | XP: +${r.xpGained.toLocaleString()}`;

    addBattleLog(logMsg, r.win ? 'win' : 'lose');

    if (r.droppedItem) {
      const item = r.droppedItem;
      addBattleLog(`✨ DROP: ${item.name} [${RARITY_LABELS[item.rarity]}]`, 'drop');
      toast(`Drop: ${item.name}`, item.rarity === 'common' ? 'info' : item.rarity === 'legendary' || item.rarity === 'mythic' || item.rarity === 'divine' ? 'gold' : 'success');
    }

    if (r.leveledUp) {
      addBattleLog(`🎉 LEVEL UP! Nível ${c.level}! +3 pontos de bônus!`, 'levelup');
      toast(`Level Up! Nível ${c.level}!`, 'levelup', 5000);
    }

    updateHeader();
    updateBattlePanel();
    updateActiveEvents();
  } catch (e) {
    if (e.status === 401) { stopBattleLoop(); showScreen('login'); }
  } finally {
    isBattling = false;
  }
}

function getMonsterEmoji(name) {
  if (name.includes('Lobo')) return '🐺';
  if (name.includes('Goblin')) return '👺';
  if (name.includes('Aranha')) return '🕷';
  if (name.includes('Esqueleto')) return '💀';
  if (name.includes('Ursinho') || name.includes('Urso')) return '🐻';
  if (name.includes('Troll')) return '👹';
  if (name.includes('Morcego')) return '🦇';
  if (name.includes('Golem')) return '🗿';
  if (name.includes('Cobra')) return '🐍';
  if (name.includes('Zumbi')) return '🧟';
  if (name.includes('Ogro')) return '👾';
  if (name.includes('Senhor')) return '💀';
  if (name.includes('Escorpiao')) return '🦂';
  if (name.includes('Mumia')) return '🧟';
  if (name.includes('Djinn')) return '🌀';
  if (name.includes('Farao') || name.includes('Guerreiro')) return '⚔';
  if (name.includes('Demonio') || name.includes('Succubus') || name.includes('Incubus') || name.includes('Lorde')) return '😈';
  if (name.includes('Guardiao')) return '🗡';
  if (name.includes('Dragao') || name.includes('Drake')) return '🐉';
  if (name.includes('Serafim') || name.includes('Anjo')) return '👼';
  if (name.includes('Titan')) return '💀';
  if (name.includes('Deus')) return '⚡';
  return '👾';
}

function addBattleLog(msg, type) {
  const log = document.getElementById('battle-log');
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const el = document.createElement('div');
  el.className = `log-entry log-${type}`;
  el.innerHTML = `<span class="log-time">${time}</span>${msg}`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;

  // Keep last 100 entries
  while (log.children.length > 100) log.removeChild(log.firstChild);
}

// ═══════════════════════════════════════════════
//   UI UPDATES
// ═══════════════════════════════════════════════
function updateHeader() {
  const c = state.char;
  if (!c) return;
  document.getElementById('hdr-name').textContent = c.name;
  document.getElementById('hdr-class').textContent = CLASS_ICONS[c.class] + ' ' + (CLASSES[c.class] || c.class);
  document.getElementById('hdr-level').textContent = `Lv.${c.level}`;
  document.getElementById('hdr-gold').textContent = c.gold.toLocaleString();
  document.getElementById('shop-gold').textContent = c.gold.toLocaleString();
}

function updateBattlePanel() {
  const c = state.char;
  if (!c) return;

  // HP
  const hpPct = Math.max(0, Math.min(100, (c.currentHp / c.maxHp) * 100));
  document.getElementById('hp-bar').style.width = hpPct + '%';
  document.getElementById('hp-text').textContent = `${c.currentHp.toLocaleString()}/${c.maxHp.toLocaleString()}`;

  // XP
  const xpPct = Math.max(0, Math.min(100, (c.xp / (c.xpRequired || 100)) * 100));
  document.getElementById('xp-bar').style.width = xpPct + '%';
  document.getElementById('xp-text').textContent = `${c.xp.toLocaleString()}/${(c.xpRequired || 100).toLocaleString()}`;
  document.getElementById('xp-level').textContent = c.level;

  // Stats mini
  document.getElementById('stat-dmg').textContent = (c.power || 0).toLocaleString();
  document.getElementById('stat-def').textContent = '';
  document.getElementById('stat-crit').textContent = '';
  document.getElementById('stat-power').textContent = (c.power || 0).toLocaleString();
  document.getElementById('stat-resets').textContent = c.resetCount;
  document.getElementById('stat-bonus').textContent = c.bonusPoints + ' pts';

  // Player name in battle
  document.getElementById('player-fighter-name').textContent = c.name;

  // Map
  const map = MAPS[c.mapId] || MAPS[0];
  document.getElementById('map-name').textContent = map.icon + ' ' + map.name;
  document.getElementById('map-level').textContent = `Nível mínimo: ${map.minLevel}`;

  // Reset panel
  const resetPanel = document.getElementById('reset-panel');
  if (resetPanel) resetPanel.style.display = c.level >= 100 ? 'block' : 'none';

  // Bonus points display
  document.getElementById('bonus-points-display').textContent = c.bonusPoints;
}

function updateActiveEvents() {
  const panel = document.getElementById('active-events-panel');
  const list = document.getElementById('active-events-list');
  if (!state.activeEvents || state.activeEvents.length === 0) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = 'block';
  list.innerHTML = state.activeEvents.map(e => `
    <div class="event-mini">
      <span class="event-mini-name">${e.name}</span>
      <span class="event-mini-mult">x${e.multiplier}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════
//   INVENTORY
// ═══════════════════════════════════════════════
async function loadInventory() {
  try {
    const data = await api('/api/inventory');
    state.inventory = data.inventory || [];
    renderInventory();
  } catch (e) { toast('Erro ao carregar inventário: ' + e.message, 'error'); }
}

function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  const items = state.inventory;
  document.getElementById('inv-count').textContent = `${items.length}/80 itens`;

  if (items.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:40px;grid-column:1/-1">Inventário vazio</p>';
    return;
  }

  grid.innerHTML = items.map(entry => {
    const item = entry.item;
    const icon = TYPE_ICONS[item.type] || '📦';
    return `
      <div class="inv-item ${item.rarity} ${entry.equipped ? 'equipped' : ''}"
           onclick="showItemModal(${JSON.stringify(JSON.stringify(entry))})"
           title="${item.name}">
        ${entry.equipped ? '<span class="inv-equipped-badge">EQ</span>' : ''}
        <span class="inv-item-icon">${icon}</span>
        <div class="inv-item-name" style="color:${RARITY_COLORS[item.rarity]}">${item.name}</div>
      </div>
    `;
  }).join('');
}

function showItemModal(entryJson) {
  const entry = JSON.parse(entryJson);
  const item = entry.item;
  const color = RARITY_COLORS[item.rarity];

  const stats = [
    item.damage > 0 ? `<div class="item-stat"><div class="item-stat-name">⚔ DANO</div><div class="item-stat-val" style="color:var(--red2)">+${item.damage}</div></div>` : '',
    item.defense > 0 ? `<div class="item-stat"><div class="item-stat-name">🛡 DEFESA</div><div class="item-stat-val" style="color:var(--blue2)">+${item.defense}</div></div>` : '',
    item.hp > 0 ? `<div class="item-stat"><div class="item-stat-name">❤ VIDA</div><div class="item-stat-val" style="color:var(--green2)">+${item.hp}</div></div>` : '',
    item.crit > 0 ? `<div class="item-stat"><div class="item-stat-name">💥 CRÍTICO</div><div class="item-stat-val" style="color:var(--orange)">+${item.crit}%</div></div>` : '',
    item.luck > 0 ? `<div class="item-stat"><div class="item-stat-name">🍀 SORTE</div><div class="item-stat-val" style="color:var(--green)">+${item.luck}</div></div>` : '',
  ].filter(Boolean).join('');

  const actions = entry.equipped
    ? `<button class="btn btn-outline" onclick="equipItem(${entry.inventoryId},'unequip')">Desequipar</button>`
    : `<button class="btn btn-primary" onclick="equipItem(${entry.inventoryId},'equip')">Equipar</button>
       <button class="btn btn-gold" onclick="sellItem(${entry.inventoryId})">Vender (${item.sellValue} ◈)</button>`;

  openModal(`
    <button class="modal-close">&times;</button>
    <div class="item-detail">
      <div class="item-detail-header">
        <div class="item-detail-icon">${TYPE_ICONS[item.type] || '📦'}</div>
        <div>
          <div class="item-detail-name" style="color:${color}">${item.name}</div>
          <div class="item-detail-rarity" style="color:${color}">${RARITY_LABELS[item.rarity]} — Nível ${item.level}</div>
        </div>
      </div>
      <div class="item-stats-grid">${stats || '<p style="color:var(--text-dim)">Sem bônus especiais</p>'}</div>
      <div class="item-actions">${actions}</div>
    </div>
  `);
}

async function equipItem(invId, action) {
  try {
    const data = await api('/api/equip-item', 'POST', { inventoryId: invId, action });
    toast(data.message, 'success');
    closeModal();
    await loadInventory();
    if (state.currentTab === 'equipment') loadEquipment();
    // Refresh player data
    const pd = await api('/api/get-player');
    if (pd.character) { state.char = pd.character; state.equippedStats = pd.equippedStats; updateBattlePanel(); }
  } catch (e) { toast(e.message, 'error'); }
}

async function sellItem(invId) {
  try {
    const data = await api('/api/sell-item', 'POST', { inventoryId: invId });
    toast(data.message, 'gold');
    state.char.gold += data.goldEarned;
    updateHeader();
    closeModal();
    await loadInventory();
  } catch (e) { toast(e.message, 'error'); }
}

document.getElementById('btn-sell-commons').onclick = async () => {
  if (!confirm('Vender todos os itens Comuns e Incomuns?')) return;
  try {
    const data = await api('/api/sell-item', 'POST', { sellAll: true });
    toast(data.message, 'gold');
    state.char.gold += data.goldEarned;
    updateHeader();
    await loadInventory();
  } catch (e) { toast(e.message, 'error'); }
};

document.getElementById('btn-refresh-inv').onclick = loadInventory;

// ═══════════════════════════════════════════════
//   EQUIPMENT
// ═══════════════════════════════════════════════
async function loadEquipment() {
  try {
    const data = await api('/api/inventory');
    state.inventory = data.inventory || [];
    renderEquipment();
  } catch (e) { toast('Erro ao carregar equipamentos', 'error'); }
}

function renderEquipment() {
  const equipped = state.inventory.filter(e => e.equipped);
  const bySlot = {};
  equipped.forEach(e => { bySlot[e.slot] = e; });

  const SLOTS = [
    { slot: 'weapon', label: 'Arma', icon: '⚔' },
    { slot: 'helmet', label: 'Capacete', icon: '⛑' },
    { slot: 'chest', label: 'Peitoral', icon: '🥋' },
    { slot: 'pants', label: 'Calça', icon: '👖' },
    { slot: 'boots', label: 'Botas', icon: '👢' },
    { slot: 'ring1', label: 'Anel 1', icon: '💍' },
    { slot: 'ring2', label: 'Anel 2', icon: '💍' },
    { slot: 'necklace', label: 'Colar', icon: '📿' },
  ];

  document.getElementById('equipment-slots').innerHTML = SLOTS.map(s => {
    const entry = bySlot[s.slot];
    const item = entry ? entry.item : null;
    const color = item ? RARITY_COLORS[item.rarity] : 'var(--border)';
    return `
      <div class="equip-slot ${item ? 'has-item' : ''}" data-slot="${s.slot}"
           onclick="${item ? `showItemModal(${JSON.stringify(JSON.stringify(entry))})` : ''}">
        <div class="equip-slot-label">${s.label}</div>
        <div class="equip-slot-icon" style="color:${color}">${item ? (TYPE_ICONS[item.type] || s.icon) : s.icon}</div>
        ${item ? `<div class="equip-slot-name" style="color:${color}">${item.name.slice(0, 20)}</div>` : `<div class="equip-slot-name" style="color:var(--text-dim)">Vazio</div>`}
      </div>
    `;
  }).join('');

  // Equipment bonuses
  const stats = state.equippedStats || { damage: 0, defense: 0, hp: 0, crit: 0, luck: 0 };
  document.getElementById('equip-bonuses').innerHTML = `
    <div class="equip-bonus-row"><span class="equip-bonus-name">⚔ Dano</span><span class="equip-bonus-val">+${stats.damage || 0}</span></div>
    <div class="equip-bonus-row"><span class="equip-bonus-name">🛡 Defesa</span><span class="equip-bonus-val">+${stats.defense || 0}</span></div>
    <div class="equip-bonus-row"><span class="equip-bonus-name">❤ Vida</span><span class="equip-bonus-val">+${stats.hp || 0}</span></div>
    <div class="equip-bonus-row"><span class="equip-bonus-name">💥 Crítico</span><span class="equip-bonus-val">+${stats.crit || 0}%</span></div>
    <div class="equip-bonus-row"><span class="equip-bonus-name">🍀 Sorte</span><span class="equip-bonus-val">+${stats.luck || 0}</span></div>
  `;
}

// ═══════════════════════════════════════════════
//   STATS TAB
// ═══════════════════════════════════════════════
function renderStats() {
  const c = state.char;
  if (!c) return;

  document.getElementById('stat-allocate-grid').innerHTML = STAT_LABELS.map(s => `
    <div class="stat-row">
      <span style="color:${s.color}">${s.icon}</span>
      <span class="stat-row-name">${s.label}</span>
      <span class="stat-row-val">${c[s.key] || 0}</span>
      <button class="stat-row-btn" onclick="allocateStat('${s.key}', 1)" title="+1">+</button>
      <button class="stat-row-btn" onclick="allocateStat('${s.key}', 5)" title="+5" style="font-size:12px">+5</button>
    </div>
  `).join('');

  document.getElementById('bonus-points-display').textContent = c.bonusPoints;

  // Combat stats estimate
  const eq = state.equippedStats || {};
  const level = c.level;
  const r = c.resetCount;
  const bonus = 1 + r * 0.1;
  const dmg = Math.floor((10 + level * 3 + (c.statDamage || 0) * 2) * bonus + (eq.damage || 0));
  const def = Math.floor((5 + level * 1.5 + (c.statDefense || 0) * 2) * bonus + (eq.defense || 0));
  const hp = Math.floor((100 + level * 10 + (c.statHp || 0) * 5) * bonus + (eq.hp || 0));
  const crit = Math.min(75, (5 + (c.statCrit || 0) * 1.5 + (eq.crit || 0))).toFixed(1);

  document.getElementById('combat-stats-display').innerHTML = `
    <div class="combat-stat-row"><span class="combat-stat-name">⚔ Dano Total</span><span class="combat-stat-val" style="color:var(--red2)">${dmg.toLocaleString()}</span></div>
    <div class="combat-stat-row"><span class="combat-stat-name">🛡 Defesa Total</span><span class="combat-stat-val" style="color:var(--blue2)">${def.toLocaleString()}</span></div>
    <div class="combat-stat-row"><span class="combat-stat-name">❤ HP Máximo</span><span class="combat-stat-val" style="color:var(--green2)">${hp.toLocaleString()}</span></div>
    <div class="combat-stat-row"><span class="combat-stat-name">💥 Chance Crítica</span><span class="combat-stat-val" style="color:var(--orange)">${crit}%</span></div>
    <div class="combat-stat-row"><span class="combat-stat-name">🍀 Sorte</span><span class="combat-stat-val" style="color:var(--green)">${(c.statLuck || 0) + (eq.luck || 0)}</span></div>
    <div class="combat-stat-row"><span class="combat-stat-name">⚡ Resets</span><span class="combat-stat-val" style="color:var(--gold)">${r} (+${(r * 10).toFixed(0)}% poder)</span></div>
    <div class="combat-stat-row"><span class="combat-stat-name">💎 Poder Total</span><span class="combat-stat-val" style="color:var(--gold)">${(c.power || 0).toLocaleString()}</span></div>
  `;
}

async function allocateStat(stat, amount) {
  try {
    const data = await api('/api/allocate-stats', 'POST', { stat, amount });
    toast(data.message, 'success');
    // Update local state
    state.char[stat] = (state.char[stat] || 0) + amount;
    state.char.bonusPoints = data.bonusPoints;
    renderStats();
    updateBattlePanel();
  } catch (e) { toast(e.message, 'error'); }
}

// Bonus points shortcut
document.getElementById('stat-bonus').onclick = () => switchTab('stats');

// Reset
document.getElementById('btn-reset') && (document.getElementById('btn-reset').onclick = async () => {
  if (!confirm('Tem certeza? Seu nível será resetado para 1, mas você ganhará bônus permanentes!')) return;
  try {
    const data = await api('/api/reset-character', 'POST');
    toast(data.message, 'gold', 6000);
    // Refresh player data
    const pd = await api('/api/get-player');
    if (pd.character) { state.char = pd.character; updateBattlePanel(); renderStats(); }
  } catch (e) { toast(e.message, 'error'); }
});

// ═══════════════════════════════════════════════
//   MAP CHANGE
// ═══════════════════════════════════════════════
document.getElementById('btn-change-map').onclick = () => {
  const c = state.char;
  openModal(`
    <button class="modal-close">&times;</button>
    <h3 class="modal-title">⚔ Trocar Mapa</h3>
    <div class="map-modal">
      ${MAPS.map(map => {
        const unlocked = c.level >= map.minLevel;
        const current = c.mapId === map.id;
        return `
          <div class="map-option ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}"
               onclick="${unlocked && !current ? `changeMap(${map.id})` : ''}">
            <span style="font-size:24px">${map.icon}</span>
            <div>
              <div class="map-option-name">${map.name}${current ? ' ✓' : ''}</div>
              <div class="map-option-level">Nível ${map.minLevel}+${!unlocked ? ' 🔒' : ''}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `);
};

async function changeMap(mapId) {
  try {
    const data = await api('/api/change-map', 'POST', { mapId });
    toast(data.message, 'success');
    state.char.mapId = mapId;
    updateBattlePanel();
    closeModal();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════
//   SHOP
// ═══════════════════════════════════════════════
const SHOP_ITEMS = [
  { id: "potion_small", name: "Poção Pequena", description: "Restaura 30% do HP", price: 50, type: "potion", icon: "🧪" },
  { id: "potion_medium", name: "Poção Média", description: "Restaura 60% do HP", price: 120, type: "potion", icon: "🧪" },
  { id: "potion_large", name: "Poção Grande", description: "Restaura 100% do HP", price: 280, type: "potion", icon: "💊" },
  { id: "chest_common", name: "Baú Comum", description: "Contém 1 item comum", price: 200, type: "chest", rarity: "common", icon: "📦" },
  { id: "chest_rare", name: "Baú Raro", description: "Contém 1 item raro", price: 800, type: "chest", rarity: "rare", icon: "🗃" },
  { id: "chest_epic", name: "Baú Épico", description: "Contém 1 item épico", price: 2500, type: "chest", rarity: "epic", icon: "📫" },
  { id: "chest_legendary", name: "Baú Lendário", description: "Contém 1 item lendário", price: 8000, type: "chest", rarity: "legendary", icon: "🏆" },
  { id: "chest_divine", name: "Baú Divino", description: "Contém 1 item divino", price: 50000, type: "chest", rarity: "divine", icon: "✨" },
  { id: "inv_expand", name: "Expansão Inv.", description: "+20 espaços no inventário", price: 5000, type: "expansion", icon: "🎒" },
];

function renderShop() {
  document.getElementById('shop-grid').innerHTML = SHOP_ITEMS.map(item => {
    const rarityClass = item.rarity ? `chest-${item.rarity}` : '';
    return `
      <div class="shop-item ${rarityClass}">
        <div style="font-size:32px">${item.icon}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.description}</div>
        <div class="shop-item-price">◈ ${item.price.toLocaleString()}</div>
        <button class="btn btn-primary btn-sm" onclick="buyShopItem('${item.id}')">Comprar</button>
      </div>
    `;
  }).join('');
}

async function buyShopItem(itemId) {
  try {
    const data = await api('/api/shop', 'POST', { itemId });
    toast(data.message, 'success', 4500);
    state.char.gold = data.newGold;
    updateHeader();
    if (state.currentTab === 'inventory') await loadInventory();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════
//   GUILD
// ═══════════════════════════════════════════════
async function loadGuild() {
  try {
    const data = await api('/api/guild?action=my');
    const content = document.getElementById('guild-content');

    if (!data.guild) {
      const listData = await api('/api/guild?action=list');
      renderGuildList(listData.guilds || []);
    } else {
      renderMyGuild(data.guild);
    }
  } catch (e) { toast('Erro ao carregar guilda', 'error'); }
}

function renderGuildList(guilds) {
  document.getElementById('guild-content').innerHTML = `
    <div class="guild-no-guild">
      <h3>🏰 Sem Guilda</h3>
      <p>Junte-se a uma guilda ou crie a sua própria!</p>
      <div class="guild-actions">
        <button class="btn btn-primary" onclick="showCreateGuildModal()">Criar Guilda (1000◈)</button>
      </div>
    </div>
    <h3 class="panel-title" style="margin-top:20px">Guildas Existentes</h3>
    ${guilds.length === 0 ? '<p style="color:var(--text-dim);text-align:center;padding:20px">Nenhuma guilda encontrada</p>' : ''}
    ${guilds.map(g => `
      <div class="guild-list-item">
        <div>
          <div class="guild-list-name">🏰 ${g.name}</div>
          <div style="font-size:12px;color:var(--text-dim)">${g.description || ''}</div>
        </div>
        <span class="guild-list-members">👥 ${g.memberCount}</span>
        <span class="guild-list-power">⚡ ${g.power.toLocaleString()}</span>
        <button class="btn btn-sm btn-outline" onclick="joinGuild(${g.id}, '${g.name.replace(/'/g, "\\'")}')">Entrar</button>
      </div>
    `).join('')}
  `;
}

function renderMyGuild(guild) {
  document.getElementById('guild-content').innerHTML = `
    <div class="panel guild-info">
      <div class="guild-header-row">
        <div>
          <div class="guild-name-big">🏰 ${guild.name}</div>
          <div style="font-size:14px;color:var(--text-dim);margin-top:4px">${guild.description || ''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Cinzel',serif;color:var(--gold)">⚡ ${guild.power.toLocaleString()} poder</div>
          <button class="btn btn-sm btn-danger" onclick="leaveGuild()" style="margin-top:8px">Sair da Guilda</button>
        </div>
      </div>
      <h4 class="panel-title" style="margin-top:8px">Membros (${guild.members.length})</h4>
      <div class="guild-members-list">
        ${guild.members.map(m => `
          <div class="guild-member-row">
            <span>${CLASS_ICONS[m.class] || '⚔'}</span>
            <span class="guild-member-name">${m.name}</span>
            <span class="guild-member-level">Lv.${m.level}</span>
            ${m.isLeader ? '<span class="guild-leader-badge">Líder</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function showCreateGuildModal() {
  openModal(`
    <button class="modal-close">&times;</button>
    <h3 class="modal-title">🏰 Criar Guilda</h3>
    <form id="form-create-guild">
      <div class="form-group">
        <label>Nome da Guilda</label>
        <input type="text" id="guild-name-input" placeholder="Nome da guilda" maxlength="30" required />
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="guild-desc-input" placeholder="Descrição (opcional)" maxlength="100" />
      </div>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:12px">Custo: 1000 ◈ ouro</p>
      <button type="submit" class="btn btn-primary btn-full">Criar Guilda</button>
    </form>
  `);
  document.getElementById('form-create-guild').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/guild', 'POST', {
        action: 'create',
        name: document.getElementById('guild-name-input').value,
        description: document.getElementById('guild-desc-input').value,
      });
      toast(data.message, 'success');
      state.char.gold -= 1000;
      updateHeader();
      closeModal();
      loadGuild();
    } catch (e) { toast(e.message, 'error'); }
  };
}

async function joinGuild(guildId, name) {
  if (!confirm(`Entrar na guilda "${name}"?`)) return;
  try {
    const data = await api('/api/guild', 'POST', { action: 'join', guildId });
    toast(data.message, 'success');
    loadGuild();
  } catch (e) { toast(e.message, 'error'); }
}

async function leaveGuild() {
  if (!confirm('Sair da guilda?')) return;
  try {
    const data = await api('/api/guild', 'POST', { action: 'leave' });
    toast(data.message, 'info');
    loadGuild();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════
//   RANKING
// ═══════════════════════════════════════════════
async function loadRanking(type = 'level') {
  try {
    const data = await api(`/api/ranking?type=${type}`);
    renderRanking(data.ranking, type);
  } catch (e) { toast('Erro ao carregar ranking', 'error'); }
}

function renderRanking(ranking, type) {
  const medals = ['🥇', '🥈', '🥉'];
  document.getElementById('ranking-table').innerHTML = ranking.map((r, i) => {
    const pos = i + 1;
    const val = type === 'level' ? `Lv.${r.level} (${r.resetCount} resets)` :
                type === 'power' ? `⚡ ${r.power.toLocaleString()}` :
                type === 'resets' ? `${r.resetCount} resets (Lv.${r.level})` :
                `◈ ${r.gold.toLocaleString()}`;
    return `
      <div class="rank-row rank-${pos}">
        <div class="rank-pos">${medals[i] || pos}</div>
        <div>
          <div class="rank-name">${r.name}</div>
          <div class="rank-class">${CLASS_ICONS[r.class] || ''} ${CLASSES[r.class] || r.class}</div>
        </div>
        <div class="rank-value">${val}</div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-dim);text-align:center;padding:20px">Nenhum dado disponível</p>';
}

document.querySelectorAll('.rank-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadRanking(tab.dataset.rank);
  };
});

// ═══════════════════════════════════════════════
//   EVENTS
// ═══════════════════════════════════════════════
async function loadEvents() {
  try {
    const data = await api('/api/events');
    renderEvents(data.activeEvents || [], data.upcomingEvents || []);
  } catch (e) { toast('Erro ao carregar eventos', 'error'); }
}

function renderEvents(active, upcoming) {
  const EVENT_LABELS = {
    xp_boost: 'XP Dobrado', gold_boost: 'Ouro Dobrado', double_drop: 'Drop Aumentado',
    invasion: 'Invasão de Monstros', world_boss: 'Boss Mundial',
  };

  const formatTime = (t) => new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const allEvents = [
    ...active.map(e => ({ ...e, isActive: true })),
    ...upcoming.map(e => ({ ...e, isActive: false })),
  ];

  if (allEvents.length === 0) {
    document.getElementById('events-content').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-dim)">
        <div style="font-size:48px;margin-bottom:12px">🌟</div>
        <p>Nenhum evento no momento</p>
        <p style="font-size:13px;margin-top:8px">Eventos aparecem periodicamente</p>
      </div>
    `;
    return;
  }

  document.getElementById('events-content').innerHTML = allEvents.map(e => `
    <div class="event-card ${e.isActive ? 'active' : ''} ${e.type}">
      <div class="event-title">${e.name}</div>
      <div class="event-type-badge ${e.type}">${EVENT_LABELS[e.type] || e.type}</div>
      <div class="event-mult">x${e.multiplier}</div>
      <div class="event-time">
        ${e.isActive ? `Termina: ${formatTime(e.endTime)}` : `Começa: ${formatTime(e.startTime)}`}
      </div>
      <div class="event-status ${e.isActive ? 'active' : 'upcoming'}">
        ${e.isActive ? '🟢 Ativo Agora!' : '⏳ Em Breve'}
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════
//   CHAT
// ═══════════════════════════════════════════════
let lastChatId = 0;

async function loadChat() {
  try {
    const data = await api('/api/chat');
    renderChat(data.messages || []);
  } catch (e) { toast('Erro ao carregar chat', 'error'); }
}

function renderChat(messages) {
  const container = document.getElementById('chat-messages');
  container.innerHTML = messages.map(m => `
    <div class="chat-msg">
      <div class="chat-msg-header">
        <span class="chat-msg-name">${escapeHtml(m.characterName)}</span>
        <span class="chat-msg-time">${new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</span>
      </div>
      <div class="chat-msg-text">${escapeHtml(m.message)}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
  if (messages.length > 0) lastChatId = messages[messages.length - 1].id;
}

function startChatPoll() {
  if (state.chatTimer) clearInterval(state.chatTimer);
  state.chatTimer = setInterval(async () => {
    if (state.currentTab === 'chat') await loadChat();
  }, 5000);
}

document.getElementById('form-chat').onsubmit = async (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  try {
    await api('/api/chat', 'POST', { message: msg });
    input.value = '';
    await loadChat();
  } catch (e) { toast(e.message, 'error'); }
};

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════
//   NAV TABS
// ═══════════════════════════════════════════════
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.onclick = () => switchTab(tab.dataset.tab);
});

// ═══════════════════════════════════════════════
//   STARTUP
// ═══════════════════════════════════════════════
(async function init() {
  if (state.token) {
    await initGame();
  } else {
    showScreen('login');
  }
})();
