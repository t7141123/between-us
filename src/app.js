/* Between Us — Multi-language Single-Page Application */

(() => {
  'use strict';

  // Available locales and category keys
  const LOCALES = ['zh-TW', 'zh-CN', 'en'];
  const CATS = ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith'];

  // Global bundle injected by build script
  const bundle = window.__ALL_LANGS__ || {};

  // Application state
  let currentLocale = localStorage.getItem('betweenus.lang') || 'zh-TW';
  if (!bundle[currentLocale]) {
    currentLocale = 'zh-TW';
  }

  const state = {
    currentCat: 'all',
    favorites: JSON.parse(localStorage.getItem('betweenus.fav') || '{}'),
    muted: localStorage.getItem('betweenus.muted') === '1',
    darkMode: localStorage.getItem('betweenus.dark') === '1',
    currentIndex: 0,
    deck: [],
    timerRunning: false,
    timeLeft: 300,
    timerId: null,
    drawerFavOnly: false,
  };

  // Safe HTML escape helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Toast notification helper
  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
    }, 2000);
  }

  // Safe Web Audio engine with lazy initialization
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, dur, type = 'sine', gainVal = 0.08) {
    if (state.muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(gainVal, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch (e) {
      // Audio autoplay policy or hardware error
    }
  }

  function playFlipSound() { playTone(680, 0.08, 'sine', 0.06); }
  function playClickSound() { playTone(540, 0.05, 'sine', 0.04); }
  function playSuccessSound() {
    if (state.muted) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.07), i * 140);
    });
  }

  // Internationalization translation getter
  function t(key) {
    const ui = (bundle[currentLocale] && bundle[currentLocale].ui) || {};
    return ui[key] || key;
  }

  // Data helpers
  function getBank() {
    const b = bundle[currentLocale];
    if (!b || !b.categories) return [];
    if (state.currentCat === 'all') {
      return b.categories.flatMap(c => c.questions);
    }
    const target = b.categories.find(c => c.key === state.currentCat);
    return target ? target.questions : [];
  }

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function newDeck() {
    const bank = getBank();
    state.deck = shuffle(bank);
    state.currentIndex = 0;
  }

  function currentQuestion() {
    if (!state.deck || state.deck.length === 0) return null;
    return state.deck[state.currentIndex];
  }

  function isFav(q) {
    return Boolean(state.favorites[q]);
  }

  function toggleFav(q) {
    if (!q) return;
    if (state.favorites[q]) {
      delete state.favorites[q];
      showToast(t('fav_removed'));
    } else {
      state.favorites[q] = true;
      showToast(t('fav_added'));
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.65 },
          colors: ['#C87D65', '#D4AF37', '#78726D'],
          disableForReducedMotion: true,
        });
      }
    }
    localStorage.setItem('betweenus.fav', JSON.stringify(state.favorites));
    renderCard();
    renderDrawer();
  }

  function findCatKey(questionText) {
    const b = bundle[currentLocale];
    if (!b || !b.categories) return null;
    for (const c of b.categories) {
      if (c.questions.includes(questionText)) {
        return c.key;
      }
    }
    return null;
  }

  function getCategoryLabel(catKey) {
    const b = bundle[currentLocale];
    if (!b || !b.categories) return '';
    const found = b.categories.find(c => c.key === catKey);
    return found ? found.label : '';
  }

  // Render Category Chips
  function renderChips() {
    const bar = document.getElementById('chip-bar');
    if (!bar) return;
    const b = bundle[currentLocale];
    const catMap = (b && b.categories)
      ? Object.fromEntries(b.categories.map(c => [c.key, c.label]))
      : {};

    bar.innerHTML = `
      <button class="chip ${state.currentCat === 'all' ? 'active' : ''}" data-cat="all">${t('all')}</button>
      ${CATS.map(key => `
        <button class="chip ${state.currentCat === key ? 'active' : ''}" data-cat="${key}">
          ${catMap[key] || key}
        </button>
      `).join('')}
    `;

    bar.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        playClickSound();
        state.currentCat = btn.dataset.cat;
        newDeck();
        renderChips();
        renderCard();
      });
    });
  }

  // Render Question Card
  function renderCard() {
    const q = currentQuestion();
    const card = document.getElementById('card');
    const tagEl = document.getElementById('card-tag');
    const noEl = document.getElementById('card-no');
    const qEl = document.getElementById('card-q');
    const progEl = document.getElementById('card-progress');
    const bmBtn = document.getElementById('btn-bookmark');
    const bmIcon = document.getElementById('icon-bookmark');

    if (!card || !qEl) return;

    // Reset flip status when question changes
    card.classList.remove('flipped');

    if (!q) {
      tagEl.textContent = '';
      noEl.textContent = '';
      qEl.textContent = t('deck_empty');
      progEl.textContent = '';
      if (bmBtn) bmBtn.style.visibility = 'hidden';
      return;
    }

    if (bmBtn) bmBtn.style.visibility = 'visible';

    const catKey = state.currentCat === 'all' ? findCatKey(q) : state.currentCat;
    tagEl.textContent = getCategoryLabel(catKey);

    const padIdx = String(state.currentIndex + 1).padStart(3, '0');
    noEl.textContent = `NO. ${padIdx}`;
    qEl.textContent = q;

    const total = state.deck.length;
    progEl.textContent = `${state.currentIndex + 1} / ${total}`;

    const fav = isFav(q);
    bmBtn.setAttribute('aria-pressed', fav ? 'true' : 'false');
    if (fav) {
      bmBtn.classList.add('text-[var(--clay)]');
      bmBtn.classList.remove('text-[var(--muted)]');
      bmIcon.setAttribute('fill', 'currentColor');
    } else {
      bmBtn.classList.remove('text-[var(--clay)]');
      bmBtn.classList.add('text-[var(--muted)]');
      bmIcon.removeAttribute('fill');
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Next question action
  function nextQuestion() {
    playClickSound();
    if (state.deck.length === 0) return;
    const card = document.getElementById('card');
    if (card) card.classList.remove('flipped');
    state.currentIndex = (state.currentIndex + 1) % state.deck.length;
    renderCard();
  }

  // Apply language switch
  function setLang(locale) {
    if (!LOCALES.includes(locale)) return;
    currentLocale = locale;
    localStorage.setItem('betweenus.lang', locale);
    document.documentElement.lang = locale;

    // Update text content of localized elements
    const elementsToUpdate = [
      ['ui-title', 'title'],
      ['ui-subtitle', 'subtitle'],
      ['ui-flip-hint', 'card_front_hint'],
      ['ui-back-title', 'back_title'],
      ['ui-back-quote', 'back_quote'],
      ['ui-back-hint', 'card_back_hint'],
      ['ui-next', 'next_question'],
      ['ui-drawer-btn', 'drawer_btn'],
      ['ui-drawer-title', 'drawer_title'],
      ['ui-drawer-all', 'drawer_all'],
      ['ui-drawer-fav', 'drawer_fav'],
      ['ui-timer-title', 'timer_title'],
      ['ui-timer-prompt', 'timer_prompt'],
      ['ui-timer-reset', 'timer_reset'],
      ['ui-keyboard-hint', 'keyboard_hint'],
    ];

    elementsToUpdate.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    });

    const searchInput = document.getElementById('drawer-search');
    if (searchInput) {
      searchInput.placeholder = t('search_placeholder');
    }

    const timerStartText = document.getElementById('ui-timer-start');
    if (timerStartText) {
      timerStartText.textContent = state.timerRunning ? t('timer_pause') : t('timer_start');
    }

    renderChips();
    newDeck();
    renderCard();
    if (isDrawerOpen()) {
      renderDrawer();
    }
  }

  // Drawer modal functionality
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');

  function isDrawerOpen() {
    return drawer && !drawer.classList.contains('translate-x-full');
  }

  function openDrawer() {
    playClickSound();
    if (!drawer || !overlay) return;
    drawer.classList.remove('translate-x-full');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
    renderDrawer();
    const searchInput = document.getElementById('drawer-search');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 150);
    }
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.add('translate-x-full');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }

  function renderDrawer() {
    const list = document.getElementById('drawer-list');
    const countInfo = document.getElementById('drawer-count-info');
    if (!list) return;

    const b = bundle[currentLocale];
    if (!b || !b.categories) return;

    const searchInput = document.getElementById('drawer-search');
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    const items = [];
    for (const c of b.categories) {
      for (const q of c.questions) {
        if (state.drawerFavOnly && !isFav(q)) continue;
        if (query && !q.toLowerCase().includes(query)) continue;
        items.push({ q, catKey: c.key, catLabel: c.label });
      }
    }

    if (countInfo) {
      countInfo.textContent = `${items.length} / 700`;
    }

    if (items.length === 0) {
      list.innerHTML = `
        <div class="text-center py-12 text-[var(--muted)] text-xs serif">
          ${escapeHtml(t('deck_empty'))}
        </div>
      `;
      return;
    }

    list.innerHTML = items.map(item => {
      const fav = isFav(item.q);
      return `
        <div class="drawer-item p-3 rounded-2xl border border-[var(--line)] hover:border-[var(--clay)] hover:bg-[var(--clay)]/5 cursor-pointer transition flex items-start justify-between gap-3" data-q="${escapeHtml(item.q)}" data-cat="${item.catKey}">
          <div class="flex-1">
            <span class="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--line)] text-[var(--muted)] mb-1">
              ${escapeHtml(item.catLabel)}
            </span>
            <p class="serif text-sm text-[var(--ink)] leading-relaxed select-none">
              ${escapeHtml(item.q)}
            </p>
          </div>
          ${fav ? '<i data-lucide="bookmark" class="w-3.5 h-3.5 text-[var(--clay)] fill-current shrink-0 mt-1"></i>' : ''}
        </div>
      `;
    }).join('');

    if (window.lucide) {
      lucide.createIcons();
    }

    list.querySelectorAll('.drawer-item').forEach(el => {
      el.addEventListener('click', () => {
        const q = el.dataset.q;
        const cat = el.dataset.cat;
        playClickSound();
        state.currentCat = cat;
        renderChips();
        newDeck();
        const foundIdx = state.deck.indexOf(q);
        state.currentIndex = foundIdx >= 0 ? foundIdx : 0;
        renderCard();
        closeDrawer();
      });
    });
  }

  // 5-Minute Timer functionality
  const timerModal = document.getElementById('timer-modal');
  const timerDisplay = document.getElementById('timer-display');
  const timerStartBtn = document.getElementById('btn-timer-start');
  const timerPlayIcon = document.getElementById('icon-timer-play');
  const timerStartText = document.getElementById('ui-timer-start');

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(state.timeLeft);
    }
  }

  function openTimer() {
    playClickSound();
    if (!timerModal) return;
    timerModal.classList.remove('opacity-0', 'pointer-events-none');
    const dialog = document.getElementById('timer-dialog');
    if (dialog) dialog.classList.remove('scale-95');
    updateTimerDisplay();
  }

  function closeTimer() {
    if (!timerModal) return;
    timerModal.classList.add('opacity-0', 'pointer-events-none');
    const dialog = document.getElementById('timer-dialog');
    if (dialog) dialog.classList.add('scale-95');
  }

  function startTimer() {
    if (state.timerRunning) {
      // Pause timer
      clearInterval(state.timerId);
      state.timerRunning = false;
      if (timerStartText) timerStartText.textContent = t('timer_start');
      if (timerPlayIcon) timerPlayIcon.setAttribute('data-lucide', 'play');
    } else {
      // Start or resume timer
      state.timerRunning = true;
      if (timerStartText) timerStartText.textContent = t('timer_pause');
      if (timerPlayIcon) timerPlayIcon.setAttribute('data-lucide', 'pause');

      state.timerId = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        if (state.timeLeft <= 0) {
          clearInterval(state.timerId);
          state.timerRunning = false;
          state.timeLeft = 300;
          updateTimerDisplay();
          if (timerStartText) timerStartText.textContent = t('timer_start');
          if (timerPlayIcon) timerPlayIcon.setAttribute('data-lucide', 'play');
          playSuccessSound();
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#C87D65', '#D4AF37', '#78726D'],
            });
          }
        }
      }, 1000);
    }
    if (window.lucide) lucide.createIcons();
  }

  function resetTimer() {
    playClickSound();
    clearInterval(state.timerId);
    state.timerRunning = false;
    state.timeLeft = 300;
    updateTimerDisplay();
    if (timerStartText) timerStartText.textContent = t('timer_start');
    if (timerPlayIcon) timerPlayIcon.setAttribute('data-lucide', 'play');
    if (window.lucide) lucide.createIcons();
  }

  // Theme switch (Dark / Light)
  function applyTheme(isDark) {
    state.darkMode = isDark;
    localStorage.setItem('betweenus.dark', isDark ? '1' : '0');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    if (window.lucide) lucide.createIcons();
  }

  // Audio sound toggle
  function applySound(isMuted) {
    state.muted = isMuted;
    localStorage.setItem('betweenus.muted', isMuted ? '1' : '0');
    const icon = document.getElementById('icon-volume');
    if (icon) {
      icon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
    }
    if (window.lucide) lucide.createIcons();
  }

  // Event Listeners registration
  function bindEvents() {
    // 3D Card flip on click
    const card = document.getElementById('card');
    if (card) {
      card.addEventListener('click', (e) => {
        // Prevent flip if clicking bookmark, timer or flipback button
        if (
          e.target.closest('#btn-bookmark') ||
          e.target.closest('#btn-timer-trigger') ||
          e.target.closest('#btn-flipback')
        ) {
          return;
        }
        playFlipSound();
        card.classList.toggle('flipped');
      });
    }

    // Flipback button on card back
    const flipbackBtn = document.getElementById('btn-flipback');
    if (flipbackBtn) {
      flipbackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playFlipSound();
        if (card) card.classList.remove('flipped');
      });
    }

    // Bookmark toggle button
    const bmBtn = document.getElementById('btn-bookmark');
    if (bmBtn) {
      bmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playClickSound();
        toggleFav(currentQuestion());
      });
    }

    // Timer trigger button on card
    const timerTrigger = document.getElementById('btn-timer-trigger');
    if (timerTrigger) {
      timerTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        openTimer();
      });
    }

    // Next question button
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', nextQuestion);
    }

    // Open drawer button
    const openDrawerBtn = document.getElementById('btn-open-drawer');
    if (openDrawerBtn) {
      openDrawerBtn.addEventListener('click', openDrawer);
    }

    // Close drawer button and overlay click
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }

    // Drawer tab buttons (All / Favorites)
    const drawerAllBtn = document.getElementById('btn-drawer-all');
    const drawerFavBtn = document.getElementById('btn-drawer-fav');
    if (drawerAllBtn && drawerFavBtn) {
      drawerAllBtn.addEventListener('click', () => {
        playClickSound();
        state.drawerFavOnly = false;
        drawerAllBtn.classList.add('bg-[var(--clay)]', 'text-white');
        drawerAllBtn.classList.remove('border', 'text-[var(--muted)]');
        drawerFavBtn.classList.remove('bg-[var(--clay)]', 'text-white');
        drawerFavBtn.classList.add('border', 'text-[var(--muted)]');
        renderDrawer();
      });

      drawerFavBtn.addEventListener('click', () => {
        playClickSound();
        state.drawerFavOnly = true;
        drawerFavBtn.classList.add('bg-[var(--clay)]', 'text-white');
        drawerFavBtn.classList.remove('border', 'text-[var(--muted)]');
        drawerAllBtn.classList.remove('bg-[var(--clay)]', 'text-white');
        drawerAllBtn.classList.add('border', 'text-[var(--muted)]');
        renderDrawer();
      });
    }

    // Drawer search input
    const searchInput = document.getElementById('drawer-search');
    if (searchInput) {
      searchInput.addEventListener('input', renderDrawer);
    }

    // Timer modal buttons
    if (timerStartBtn) {
      timerStartBtn.addEventListener('click', startTimer);
    }
    const timerResetBtn = document.getElementById('btn-timer-reset');
    if (timerResetBtn) {
      timerResetBtn.addEventListener('click', resetTimer);
    }
    const timerCloseBtn = document.getElementById('btn-close-timer');
    if (timerCloseBtn) {
      timerCloseBtn.addEventListener('click', closeTimer);
    }
    if (timerModal) {
      timerModal.addEventListener('click', (e) => {
        if (e.target === timerModal) closeTimer();
      });
    }

    // Sound toggle button
    const soundBtn = document.getElementById('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        applySound(!state.muted);
      });
    }

    // Dark / Light Theme toggle button
    const themeBtn = document.getElementById('btn-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        applyTheme(!state.darkMode);
      });
    }

    // Language dropdown
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        setLang(e.target.value);
      });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ignore shortcuts if focusing an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') {
          closeDrawer();
          closeTimer();
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        playFlipSound();
        if (card) card.classList.toggle('flipped');
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextQuestion();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        playClickSound();
        toggleFav(currentQuestion());
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        openTimer();
      } else if (e.key === 'Escape') {
        closeDrawer();
        closeTimer();
      }
    });
  }

  // Application bootstrap
  function init() {
    // Initialize sound state
    applySound(state.muted);

    // Initialize theme state (detect user system preference if not set)
    if (localStorage.getItem('betweenus.dark') === null) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
    } else {
      applyTheme(state.darkMode);
    }

    // Set dropdown to stored locale
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = currentLocale;
    }

    // Bind event handlers
    bindEvents();

    // Load initial localized content
    setLang(currentLocale);

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
