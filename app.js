// ===== Состояние =====
const STORAGE_KEY = "fut-packs-v1";

const defaultState = {
  coins: 5000,
  inventory: [],   // { uid, playerId, openedAt }
  selectedUids: [], // выбранные для продажи (только в market)
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed, selectedUids: [] };
  } catch {
    return structuredClone(defaultState);
  }
}
function saveState() {
  const toSave = { coins: state.coins, inventory: state.inventory };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// ===== Утилиты =====
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function fmt(n) {
  return n.toLocaleString("ru-RU");
}

function toast(msg, kind = "info") {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.style.borderColor = kind === "error" ? "rgba(255,93,93,.6)"
                       : kind === "success" ? "rgba(92,240,138,.55)"
                       : "var(--line)";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), 1800);
}

function pickWeighted(table) {
  // table: { key: weight, ... }
  const entries = Object.entries(table);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    if ((r -= w) <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

function pickPlayerOfRarity(rarity) {
  const pool = PLAYERS.filter(p => p.rarity === rarity);
  if (pool.length === 0) {
    // если нет точно такой редкости, вернём ближайшую по уровню вниз
    const fallbackOrder = ["icon", "hero", "totw", "raregold", "gold", "silver", "bronze"];
    for (const r of fallbackOrder) {
      const alt = PLAYERS.filter(p => p.rarity === r);
      if (alt.length) return alt[Math.floor(Math.random() * alt.length)];
    }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function openPack(packId) {
  const pack = PACKS[packId];
  if (!pack) return [];
  const drops = [];

  // Гарантии
  const guarantees = pack.guarantees || [];
  const guaranteed = [];
  for (const g of guarantees) {
    for (let i = 0; i < g.count; i++) guaranteed.push(g.rarity);
  }
  for (const rar of guaranteed) drops.push(pickPlayerOfRarity(rar));

  // Остальные случайные по таблице
  const rest = Math.max(0, pack.cards - drops.length);
  for (let i = 0; i < rest; i++) {
    const rarity = pickWeighted(pack.table);
    drops.push(pickPlayerOfRarity(rarity));
  }

  // Перемешаем
  for (let i = drops.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [drops[i], drops[j]] = [drops[j], drops[i]];
  }
  return drops;
}

// ===== Карточка (DOM) =====
function cardEl(player, opts = {}) {
  const el = document.createElement("div");
  el.className = `card r-${player.rarity}`;
  el.dataset.uid = opts.uid ?? "";
  el.dataset.playerId = player.id;
  el.innerHTML = `
    <div class="rarity-tag">${RARITIES[player.rarity].name}</div>
    <div class="top">
      <div class="ovr">${player.ovr}</div>
      <div class="pos">${player.pos}</div>
    </div>
    <div class="photo">${playerInitials(player.name)}</div>
    <div class="name">${player.name}</div>
    <div class="meta">
      <span>${player.club}</span>
      <span>·</span>
      <span>${player.nation}</span>
    </div>
    ${opts.showSell ? `<div class="sell-tag">${fmt(sellPrice(player))} монет</div>` : ""}
    ${opts.quickSell ? `<button class="quick-sell" title="Быстрая продажа">Продать</button>` : ""}
  `;
  return el;
}

// ===== Рендер: магазин =====
function renderPacks() {
  const root = $("#packs");
  root.innerHTML = "";
  Object.values(PACKS).forEach(p => {
    const el = document.createElement("div");
    el.className = `pack ${p.id}`;
    const chips = Object.entries(p.table)
      .sort((a, b) => b[1] - a[1])
      .map(([r, w]) => `<span class="stat-chip"><span class="dot" style="background:${RARITIES[r].color2}"></span>${RARITIES[r].name} ${w}%</span>`)
      .join("");
    const guarantees = (p.guarantees || []).map(g =>
      `<span class="stat-chip" title="Гарантировано"><b>★ ${g.count}×</b> ${RARITIES[g.rarity].name}</span>`
    ).join("");
    el.innerHTML = `
      <h2 class="pack-title">${p.title}</h2>
      <p class="pack-desc">${p.description}</p>
      <div class="pack-stats">${guarantees}${chips}</div>
      <div class="pack-foot">
        <div class="pack-price"><span class="coin-icon" aria-hidden="true">●</span> ${fmt(p.price)} <span class="muted">· ${p.cards} карт</span></div>
        <button class="btn primary buy-pack" data-id="${p.id}">Открыть</button>
      </div>
    `;
    root.appendChild(el);
  });
}

// ===== Рендер: инвентарь / маркет =====
function renderCoins() {
  $("#coins").textContent = fmt(state.coins);
}

function getPlayerById(id) {
  return PLAYERS.find(p => p.id === id);
}

function inventoryWithPlayers() {
  return state.inventory.map(item => ({
    ...item,
    player: getPlayerById(item.playerId)
  })).filter(x => x.player);
}

function filteredInventory() {
  const r = $("#filter-rarity").value;
  const s = $("#filter-sort").value;
  let list = inventoryWithPlayers();
  if (r) list = list.filter(x => x.player.rarity === r);
  const rarityOrder = ["bronze","silver","gold","raregold","totw","hero","icon"];
  switch (s) {
    case "ovr-asc":     list.sort((a,b) => a.player.ovr - b.player.ovr); break;
    case "new-desc":    list.sort((a,b) => b.openedAt - a.openedAt); break;
    case "rarity-desc": list.sort((a,b) => rarityOrder.indexOf(b.player.rarity) - rarityOrder.indexOf(a.player.rarity) || b.player.ovr - a.player.ovr); break;
    case "ovr-desc":
    default:            list.sort((a,b) => b.player.ovr - a.player.ovr);
  }
  return list;
}

function renderInventoryStats() {
  const list = inventoryWithPlayers();
  const root = $("#inventory-stats");
  if (!list.length) { root.innerHTML = ""; return; }
  const byR = {};
  for (const it of list) byR[it.player.rarity] = (byR[it.player.rarity] || 0) + 1;
  const order = ["icon","hero","totw","raregold","gold","silver","bronze"];
  root.innerHTML = `
    <span class="stat-chip">Карт: <b>${list.length}</b></span>
    ${order.filter(r => byR[r]).map(r =>
      `<span class="stat-chip"><span class="dot" style="background:${RARITIES[r].color2}"></span>${RARITIES[r].name}: <b>${byR[r]}</b></span>`
    ).join("")}
  `;
}

function renderInventory() {
  const root = $("#inventory");
  const empty = $("#inventory-empty");
  root.innerHTML = "";
  const list = filteredInventory();
  if (!list.length) {
    empty.classList.add("show");
  } else {
    empty.classList.remove("show");
  }
  list.forEach(it => {
    const c = cardEl(it.player, { uid: it.uid, showSell: true, quickSell: true });
    c.querySelector(".quick-sell").addEventListener("click", (e) => {
      e.stopPropagation();
      sellByUids([it.uid]);
    });
    root.appendChild(c);
  });
  renderInventoryStats();
}

function renderMarket() {
  const root = $("#market-grid");
  const empty = $("#market-empty");
  root.innerHTML = "";
  const list = inventoryWithPlayers().sort((a,b) => b.player.ovr - a.player.ovr);
  if (!list.length) {
    empty.classList.add("show");
  } else {
    empty.classList.remove("show");
  }
  list.forEach(it => {
    const c = cardEl(it.player, { uid: it.uid, showSell: true });
    if (state.selectedUids.includes(it.uid)) c.classList.add("selected");
    c.addEventListener("click", () => toggleSelect(it.uid));
    root.appendChild(c);
  });
  updateMarketSummary();
}

function toggleSelect(uid) {
  const i = state.selectedUids.indexOf(uid);
  if (i >= 0) state.selectedUids.splice(i, 1);
  else state.selectedUids.push(uid);
  renderMarket();
}

function updateMarketSummary() {
  const sel = state.selectedUids;
  const list = inventoryWithPlayers().filter(it => sel.includes(it.uid));
  const total = list.reduce((s, it) => s + sellPrice(it.player), 0);
  $("#market-summary").innerHTML = `Выбрано: <b>${sel.length}</b> · Получите: <b>${fmt(total)}</b> монет`;
  $("#sell-selected").disabled = sel.length === 0;
}

function sellByUids(uids) {
  if (!uids.length) return;
  const toSell = state.inventory.filter(it => uids.includes(it.uid));
  let earned = 0;
  for (const it of toSell) {
    const p = getPlayerById(it.playerId);
    if (p) earned += sellPrice(p);
  }
  state.inventory = state.inventory.filter(it => !uids.includes(it.uid));
  state.selectedUids = state.selectedUids.filter(u => !uids.includes(u));
  state.coins += earned;
  saveState();
  renderCoins();
  renderInventory();
  renderMarket();
  toast(`Продано: ${uids.length}. +${fmt(earned)} монет`, "success");
}

// ===== Анимация открытия =====
let opening = {
  queue: [],
  shown: [],
  index: 0
};

function showOpening(drops) {
  opening.queue = drops.slice();
  opening.shown = [];
  opening.index = 0;
  $("#opening-summary").classList.add("hidden");
  $("#opening-summary").innerHTML = "";
  $("#close-opening").classList.add("hidden");
  $("#reveal-next").classList.remove("hidden");
  $("#reveal-all").classList.remove("hidden");
  $("#opening-overlay").classList.remove("hidden");
  prepareStage(drops[0]);
  updateOpeningProgress();
}

function prepareStage(player) {
  const stage = $("#card-stage");
  stage.innerHTML = "";
  const flipper = document.createElement("div");
  flipper.className = "flipper";
  flipper.innerHTML = `
    <div class="face back">FUT</div>
    <div class="face front"></div>
  `;
  const front = flipper.querySelector(".front");
  front.appendChild(cardEl(player));
  // карточка внутри front растягивается
  const inner = front.querySelector(".card");
  inner.style.width = "100%";
  inner.style.height = "100%";
  inner.style.aspectRatio = "auto";
  inner.style.cursor = "default";
  stage.appendChild(flipper);
}

function revealCurrent() {
  const flipper = $("#card-stage .flipper");
  if (!flipper || flipper.classList.contains("revealed")) return;

  const player = opening.queue[opening.index];
  // Вспышка для редких
  if (["totw","icon","hero","raregold"].includes(player.rarity)) {
    const flash = $(".flash");
    flash.classList.remove("fire");
    void flash.offsetWidth;
    flash.classList.add("fire");
  }
  flipper.classList.add("revealed");

  // в инвентарь
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  state.inventory.push({ uid, playerId: player.id, openedAt: Date.now() });
  saveState();
  renderCoins();

  opening.shown.push(player);
  updateOpeningProgress();
}

function nextOrSummary() {
  const flipper = $("#card-stage .flipper");
  if (flipper && !flipper.classList.contains("revealed")) {
    revealCurrent();
    return;
  }
  opening.index++;
  if (opening.index >= opening.queue.length) {
    showSummary();
  } else {
    prepareStage(opening.queue[opening.index]);
    updateOpeningProgress();
  }
}

function updateOpeningProgress() {
  $("#opening-progress").textContent = `${Math.min(opening.index + 1, opening.queue.length)} / ${opening.queue.length}`;
}

function showSummary() {
  $("#card-stage").innerHTML = "";
  $("#reveal-next").classList.add("hidden");
  $("#reveal-all").classList.add("hidden");
  $("#close-opening").classList.remove("hidden");
  const root = $("#opening-summary");
  root.classList.remove("hidden");
  root.innerHTML = "";
  // Сортируем по редкости и рейтингу
  const rarityOrder = ["icon","hero","totw","raregold","gold","silver","bronze"];
  const sorted = opening.shown.slice().sort((a,b) =>
    rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity) || b.ovr - a.ovr
  );
  sorted.forEach(p => root.appendChild(cardEl(p, { showSell: true })));
  renderInventory();
  renderMarket();
}

function revealAll() {
  // Раскрываем оставшихся без анимации поштучно
  // Сначала текущая
  const flipper = $("#card-stage .flipper");
  if (flipper && !flipper.classList.contains("revealed")) revealCurrent();
  while (opening.index + 1 < opening.queue.length) {
    opening.index++;
    const player = opening.queue[opening.index];
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    state.inventory.push({ uid, playerId: player.id, openedAt: Date.now() });
    opening.shown.push(player);
  }
  saveState();
  renderCoins();
  // в конец и показываем итог
  opening.index = opening.queue.length;
  showSummary();
}

function closeOpening() {
  $("#opening-overlay").classList.add("hidden");
  renderInventory();
  renderMarket();
}

// ===== Покупка пака =====
function buyPack(packId) {
  const pack = PACKS[packId];
  if (!pack) return;
  if (state.coins < pack.price) {
    toast("Недостаточно монет. Продайте лишних игроков.", "error");
    switchView("market");
    return;
  }
  state.coins -= pack.price;
  saveState();
  renderCoins();
  const drops = openPack(packId);
  showOpening(drops);
}

// ===== Навигация =====
function switchView(name) {
  $$(".tab").forEach(t => {
    const active = t.dataset.view === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  if (name === "inventory") renderInventory();
  if (name === "market") renderMarket();
}

// ===== Инициализация =====
function init() {
  renderCoins();
  renderPacks();
  renderInventory();
  renderMarket();

  // Делегирование клика "Открыть"
  $("#packs").addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-pack");
    if (!btn) return;
    buyPack(btn.dataset.id);
  });

  // Табы
  $$(".tab").forEach(t => t.addEventListener("click", () => switchView(t.dataset.view)));

  // Фильтры
  $("#filter-rarity").addEventListener("change", renderInventory);
  $("#filter-sort").addEventListener("change", renderInventory);

  // Маркет действия
  $("#sell-selected").addEventListener("click", () => sellByUids(state.selectedUids.slice()));
  $("#sell-duplicates").addEventListener("click", () => {
    // Оставляем по одной копии каждого playerId (с максимальным ovr — но он один), продаём остальные
    const seen = new Set();
    const dupUids = [];
    const sorted = inventoryWithPlayers().sort((a,b) => b.player.ovr - a.player.ovr);
    for (const it of sorted) {
      if (seen.has(it.playerId)) dupUids.push(it.uid);
      else seen.add(it.playerId);
    }
    if (!dupUids.length) {
      toast("Дубликатов не найдено.", "info");
      return;
    }
    sellByUids(dupUids);
  });
  $("#select-all").addEventListener("click", () => {
    state.selectedUids = inventoryWithPlayers().map(x => x.uid);
    renderMarket();
  });
  $("#clear-selection").addEventListener("click", () => {
    state.selectedUids = [];
    renderMarket();
  });

  // Opening modal controls
  $("#reveal-next").addEventListener("click", nextOrSummary);
  $("#reveal-all").addEventListener("click", revealAll);
  $("#close-opening").addEventListener("click", closeOpening);
  // Клик по карточке = раскрыть
  $("#card-stage").addEventListener("click", () => {
    const f = $("#card-stage .flipper");
    if (f && !f.classList.contains("revealed")) revealCurrent();
  });

  // Сброс
  $("#reset").addEventListener("click", () => {
    if (!confirm("Сбросить прогресс? Это удалит инвентарь и монеты.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    renderCoins();
    renderInventory();
    renderMarket();
    toast("Прогресс сброшен.", "info");
  });

  // На случай первого запуска
  if (!localStorage.getItem(STORAGE_KEY)) saveState();
}

document.addEventListener("DOMContentLoaded", init);
