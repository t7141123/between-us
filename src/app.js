/* Between Us — multi-language SPA app logic */
const LOCALES = ["zh-TW", "zh-CN", "en"];
const CATS = ["vision", "soul", "finance", "intimacy", "fun", "growth", "faith"];
function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
let bundle = window.__ALL_LANGS__ || {};
let currentLocale = localStorage.getItem("betweenus.lang") || "zh-TW";
let state = {
  currentCat: "all",
  favorites: JSON.parse(localStorage.getItem("betweenus.fav") || "{}"),
  muted: localStorage.getItem("betweenus.muted") === "1",
  currentIndex: 0,
  deck: [],
};

// ---- audio ----
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audio = new AudioCtx();
function tone(freq, dur, type = "sine") {
  if (state.muted) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, audio.currentTime);
  g.gain.setValueAtTime(0.08, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
  o.connect(g); g.connect(audio.destination);
  o.start(); o.stop(audio.currentTime + dur);
}
function playFlip() { tone(800, 0.06); }
function playClick() { tone(600, 0.04); }
function playEnd() {
  if (state.muted) return;
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15), i * 120));
}

// ---- i18n ----
function t(key) {
  const ui = (bundle[currentLocale] && bundle[currentLocale].ui) || {};
  return ui[key] || key;
}
function setLang(locale) {
  currentLocale = locale;
  localStorage.setItem("betweenus.lang", locale);
  document.documentElement.lang = locale;
  render();
}

// ---- data ----
function getBank() {
  const b = bundle[currentLocale];
  if (!b) return [];
  const cat = state.currentCat === "all" ? null : state.currentCat;
  if (cat) return b.categories.find(c => c.key === cat)?.questions || [];
  return b.categories.flatMap(c => c.questions);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function newDeck() {
  const bank = getBank();
  state.deck = shuffle(bank);
  state.currentIndex = 0;
}
function currentQuestion() {
  return state.deck[state.currentIndex];
}
function isFav(q) { return !!state.favorites[q]; }
function toggleFav(q) {
  if (state.favorites[q]) delete state.favorites[q];
  else state.favorites[q] = true;
  localStorage.setItem("betweenus.fav", JSON.stringify(state.favorites));
  renderCard();
  renderDrawer();
}

// ---- render ----
function renderChips() {
  const bar = document.getElementById("chip-bar");
  const b = bundle[currentLocale];
  const labels = (b && b.categories) ? Object.fromEntries(b.categories.map(c => [c.key, c.label])) : {};
  bar.innerHTML = `
    <button class="chip ${state.currentCat === 'all' ? 'active' : ''}" data-cat="all">${t('all')}</button>
    ${CATS.map(k => `<button class="chip ${state.currentCat === k ? 'active' : ''}" data-cat="${k}">${labels[k] || k}</button>`).join('')}
  `;
  bar.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      playClick();
      state.currentCat = btn.dataset.cat;
      newDeck();
      renderChips();
      renderCard();
    });
  });
}

function renderCard() {
  const q = currentQuestion();
  const front = document.getElementById("card-front");
  const back = document.getElementById("card-back");
  const card = document.getElementById("card");
  const noEl = document.getElementById("card-no");
  const tagEl = document.getElementById("card-tag");
  const qEl = document.getElementById("card-q");
  const hintEl = document.getElementById("card-hint");
  const bm = document.getElementById("btn-bookmark");

  if (!q) {
    qEl.textContent = t("deck_empty");
    hintEl.textContent = t("load_from_drawer");
    noEl.textContent = "";
    tagEl.textContent = "";
    card.classList.remove("flipped");
    bm.style.display = "none";
    return;
  }

  card.classList.remove("flipped");
  const catKey = state.currentCat === "all" ? findCatKey(q) : state.currentCat;
  const label = (bundle[currentLocale] && bundle[currentLocale].categories.find(c => c.key === catKey)?.label) || "";
  tagEl.textContent = label;
  noEl.textContent = `NO. ${state.currentIndex + 1} / ${state.deck.length}`;
  qEl.textContent = q;
  hintEl.textContent = q;
  bm.style.display = "block";
  bm.setAttribute("aria-pressed", isFav(q) ? "true" : "false");
  bm.innerHTML = `<i data-lucide="${isFav(q) ? 'bookmark' : 'bookmark-off'}" class="w-4 h-4 ${isFav(q) ? 'text-clay' : 'text-muted'}"></i>`;
  lucide.createIcons();
}

function findCatKey(q) {
  const b = bundle[currentLocale];
  if (!b) return null;
  for (const c of b.categories) {
    if (c.questions.includes(q)) return c.key;
  }
  return null;
}

document.getElementById("card").addEventListener("click", (e) => {
  if (e.target.closest("#btn-bookmark") || e.target.closest("#btn-flipback")) return;
  playFlip();
  document.getElementById("card").classList.toggle("flipped");
});
document.getElementById("btn-bookmark").addEventListener("click", (e) => {
  e.stopPropagation();
  const q = currentQuestion();
  if (q) { playClick(); toggleFav(q); }
});
document.getElementById("btn-next").addEventListener("click", () => {
  playClick();
  const card = document.getElementById("card");
  card.classList.remove("flipped");
  state.currentIndex = (state.currentIndex + 1) % state.deck.length;
  renderCard();
});
document.getElementById("btn-flipback").addEventListener("click", (e) => {
  e.stopPropagation();
  playFlip();
  document.getElementById("card").classList.remove("flipped");
});

// keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === " ") { e.preventDefault(); const card = document.getElementById("card"); if (card.classList.contains("flipped")) card.classList.remove("flipped"); else card.classList.add("flipped"); }
  if (e.key === "ArrowRight") document.getElementById("btn-next").click();
  if (e.key.toLowerCase() === "f") { const q = currentQuestion(); if (q) toggleFav(q); }
  if (e.key.toLowerCase() === "t") openTimer();
});

// ---- drawer ----
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("drawer-overlay");
function openDrawer() { playClick(); drawer.style.display = "block"; overlay.style.display = "block"; setTimeout(() => drawer.classList.remove("translate-x-full"), 50); renderDrawer(); }
function closeDrawer() { drawer.classList.add("translate-x-full"); setTimeout(() => { drawer.style.display = "none"; overlay.style.display = "none"; }, 420); }
overlay.addEventListener("click", closeDrawer);
document.getElementById("btn-close-drawer").addEventListener("click", closeDrawer);

function renderDrawer() {
  const list = document.getElementById("drawer-list");
  const b = bundle[currentLocale];
  const search = document.getElementById("drawer-search").value.toLowerCase();
  const favOnly = document.getElementById("btn-drawer-fav").classList.contains("active");
  let rows = [];
  for (const c of b.categories) {
    for (const q of c.questions) {
      if (favOnly && !isFav(q)) continue;
      if (search && !q.toLowerCase().includes(search)) continue;
      rows.push({ q, cat: c.key, label: c.label });
    }
  }
  list.innerHTML = rows.map(r => `
    <div class="drawer-row p-3 rounded-xl border border-muted/20 hover:bg-clay/5 cursor-pointer group" data-q="${escapeHtml(r.q)}">
      <div class="flex justify-between items-start">
        <span class="serif text-sm text-ink">${escapeHtml(r.q)}</span>
        <span class="serif text-xs text-muted bg-muted/10 px-2 py-0.5 rounded">${r.label}</span>
      </div>
      ${isFav(r.q) ? '<span class="text-clay"><i data-lucide="bookmark" class="w-3 h-3 fill-current"></i></span>' : ''}
    </div>
  `).join('');
  lucide.createIcons();
  list.querySelectorAll(".drawer-row").forEach(el => {
    el.addEventListener("click", () => {
      const q = el.dataset.q;
      closeDrawer();
      state.currentCat = findCatKey(q);
      newDeck();
      state.currentIndex = state.deck.findIndex(x => x === q);
      if (state.currentIndex < 0) state.currentIndex = 0;
      renderChips();
      renderCard();
    });
  });
}
document.getElementById("btn-drawer-all").addEventListener("click", () => {
  document.getElementById("btn-drawer-all").classList.add("active");
  document.getElementById("btn-drawer-all").classList.add("btn-clay");
  document.getElementById("btn-drawer-all").classList.remove("border","bg-transparent");
  document.getElementById("btn-drawer-fav").classList.remove("active","btn-clay");
  document.getElementById("btn-drawer-fav").classList.add("border","bg-transparent");
  renderDrawer();
});
document.getElementById("btn-drawer-fav").addEventListener("click", () => {
  document.getElementById("btn-drawer-fav").classList.add("active","btn-clay");
  document.getElementById("btn-drawer-fav").classList.remove("border","bg-transparent");
  document.getElementById("btn-drawer-all").classList.remove("active","btn-clay");
  document.getElementById("btn-drawer-all").classList.add("border","bg-transparent");
  renderDrawer();
});
document.getElementById("drawer-search").addEventListener("input", renderDrawer);

// ---- timer ----
const timerModal = document.getElementById("timer-modal");
let timer = null, timeLeft = 300;
function openTimer() { playClick(); timerModal.style.display = "flex"; renderTimer(); }
function closeTimer() { timerModal.style.display = "none"; stopTimer(); }
function renderTimer() {
  document.getElementById("timer-display").textContent = formatTime(timeLeft);
}
function formatTime(s) { const m = Math.floor(s / 60); const r = s % 60; return `${m}:${r.toString().padStart(2,'0')}`; }
function stopTimer() { if (timer) clearInterval(timer); timer = null; }
function startTimer() {
  stopTimer();
  timer = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft <= 0) { stopTimer(); playEnd(); confetti(); }
  }, 1000);
}
function resetTimer() { stopTimer(); timeLeft = 300; renderTimer(); }
document.getElementById("btn-close-timer").addEventListener("click", closeTimer);
document.getElementById("btn-timer-start").addEventListener("click", () => { if (!timer) startTimer(); });
document.getElementById("btn-timer-reset").addEventListener("click", resetTimer);
timerModal.addEventListener("click", (e) => { if (e.target === timerModal) closeTimer(); });

function confetti() {
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#C87D65", "#F2EDE4", "#D4AF37", "#78726D"] });
}

// ---- lang selector ----
document.getElementById("lang-select").addEventListener("change", (e) => setLang(e.target.value));

// ---- boot ----
function boot() {
  document.getElementById("lang-select").value = currentLocale;
  document.documentElement.lang = currentLocale;
  renderChips();
  newDeck();
  renderCard();
}
boot();
