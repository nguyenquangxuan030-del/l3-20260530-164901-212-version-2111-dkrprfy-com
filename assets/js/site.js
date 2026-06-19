
(function () {
  const state = {
    heroIndex: 0,
    heroTimer: null,
    catalog: null,
  };

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function join(prefix, suffix) {
    if (!prefix) return suffix;
    if (prefix.endsWith('/')) return prefix + suffix.replace(/^\//, '');
    return prefix + suffix.replace(/^\//, '');
  }

  function assetsPrefix() {
    return document.body?.dataset.assetsPrefix || './';
  }

  function initHeader() {
    const header = qs('[data-site-header]');
    if (!header) return;

    const menuBtn = qs('[data-menu-toggle]');
    const mobileNav = qs('[data-mobile-nav]');

    function setScrollClass() {
      if (window.scrollY > 10) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }

    setScrollClass();
    window.addEventListener('scroll', setScrollClass, { passive: true });

    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        const open = mobileNav.classList.contains('open');
        menuBtn.setAttribute('aria-expanded', String(open));
      });
    }
  }

  function initFloatingTop() {
    const btn = qs('[data-back-to-top]');
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle('show', window.scrollY > 280);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initHero() {
    const hero = qs('[data-hero]');
    if (!hero) return;
    const slides = qsa('[data-hero-slide]', hero);
    const thumbs = qsa('[data-hero-thumb]', hero);
    const prev = qs('[data-hero-prev]', hero);
    const next = qs('[data-hero-next]', hero);

    if (!slides.length) return;

    function show(idx) {
      state.heroIndex = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === state.heroIndex));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === state.heroIndex));
    }

    function step(delta) {
      show(state.heroIndex + delta);
      restart();
    }

    function restart() {
      if (state.heroTimer) clearInterval(state.heroTimer);
      state.heroTimer = setInterval(() => show(state.heroIndex + 1), 5200);
    }

    show(0);
    restart();
    prev?.addEventListener('click', () => step(-1));
    next?.addEventListener('click', () => step(1));
    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => {
      show(i);
      restart();
    }));

    hero.addEventListener('mouseenter', () => state.heroTimer && clearInterval(state.heroTimer));
    hero.addEventListener('mouseleave', restart);
  }

  function applyCardFilter(container, query) {
    const cards = qsa('[data-movie-card]', container);
    const needle = (query || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.tags, card.dataset.year]
        .join(' ')
        .toLowerCase();
      const visible = !needle || hay.includes(needle);
      card.style.display = visible ? '' : 'none';
      if (visible) shown += 1;
    });
    return shown;
  }

  function sortCards(container, mode) {
    const cards = qsa('[data-movie-card]', container).filter(card => card.style.display !== 'none');
    const ordered = [...cards].sort((a, b) => {
      if (mode === 'year-asc') return Number(a.dataset.year) - Number(b.dataset.year);
      if (mode === 'title') return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
      return Number(b.dataset.year) - Number(a.dataset.year);
    });
    ordered.forEach(card => container.appendChild(card));
  }

  function initListTools() {
    const container = qs('[data-movie-grid]');
    if (!container) return;

    const input = qs('[data-filter-input]');
    const select = qs('[data-sort-select]');
    const status = qs('[data-filter-status]');

    function refresh() {
      const query = input ? input.value : '';
      const shown = applyCardFilter(container, query);
      sortCards(container, select ? select.value : 'year-desc');
      if (status) {
        status.textContent = shown ? `已显示 ${shown} 部影片` : '没有找到匹配的影片';
      }
    }

    input?.addEventListener('input', refresh);
    select?.addEventListener('change', refresh);
    refresh();
  }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root) return;
    const input = qs('[data-search-input]', root);
    const select = qs('[data-search-sort]', root);
    const results = qs('[data-search-results]', root);
    const status = qs('[data-search-status]', root);
    const chips = qsa('[data-search-chip]', root);
    const prefix = assetsPrefix();
    const catalogUrl = join(prefix, 'assets/catalog.json');

    async function loadCatalog() {
      if (state.catalog) return state.catalog;
      const res = await fetch(catalogUrl, { cache: 'force-cache' });
      state.catalog = await res.json();
      return state.catalog;
    }

    function render(list, q) {
      results.innerHTML = list.map(item => `
        <a class="movie-card list-card" href="${item.url}">
          <div class="poster"><img src="${item.poster}" alt="${item.title}"><div class="poster-badges"><span class="badge primary">${item.year}</span><span class="badge accent">${item.type}</span></div></div>
          <div class="movie-body">
            <h3>${item.title}</h3>
            <p>${item.region} · ${item.category}</p>
            <p>${item.oneLine}</p>
          </div>
        </a>`).join('');
      status.textContent = q ? `“${q}” 共找到 ${list.length} 条结果` : `共找到 ${list.length} 条结果`;
    }

    function run() {
      const q = (input.value || '').trim().toLowerCase();
      const mode = select.value;
      let list = [...state.catalog];
      if (q) {
        list = list.filter(item => [item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.category, item.year]
          .join(' ')
          .toLowerCase()
          .includes(q));
      }
      if (mode === 'year-asc') list.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'zh-Hans-CN'));
      else if (mode === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
      else list.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'zh-Hans-CN'));
      render(list.slice(0, 120), q);
    }

    loadCatalog().then(() => {
      input.addEventListener('input', run);
      select.addEventListener('change', run);
      chips.forEach(chip => chip.addEventListener('click', () => {
        input.value = chip.dataset.q || '';
        run();
      }));
      const url = new URL(window.location.href);
      const q = url.searchParams.get('q');
      if (q) input.value = q;
      run();
    });
  }

  function initPlayer() {
    const shells = qsa('[data-player-shell]');
    if (!shells.length) return;

    const ensureHls = () => new Promise((resolve, reject) => {
      if (window.Hls) return resolve(window.Hls);
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = () => resolve(window.Hls);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    shells.forEach(shell => {
      const video = qs('video', shell);
      const overlay = qs('[data-player-overlay]', shell);
      const playBtn = qs('[data-player-play]', shell);
      const src = video.dataset.hlsSrc;
      const poster = video.dataset.poster;
      if (poster) video.poster = poster;

      let hlsInstance = null;
      const hideOverlay = () => overlay?.classList.add('hidden');
      const showOverlay = () => overlay?.classList.remove('hidden');

      const initNative = () => {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return true;
        }
        return false;
      };

      const initHls = (Hls) => {
        if (!Hls || !Hls.isSupported()) {
          return false;
        }
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          hideOverlay();
        });
        hlsInstance.on(Hls.Events.ERROR, (_e, data) => {
          if (data && data.fatal) {
            overlay && (overlay.querySelector('.video-note').textContent = '视频加载失败，请稍后重试');
            showOverlay();
          }
        });
        return true;
      };

      const setup = async () => {
        try {
          if (!initNative()) {
            const Hls = await ensureHls();
            initHls(Hls);
          }
        } catch (err) {
          overlay && (overlay.querySelector('.video-note').textContent = '播放器初始化失败');
        }
      };

      setup();

      playBtn?.addEventListener('click', async () => {
        try {
          if (video.paused) {
            await video.play();
            hideOverlay();
          } else {
            video.pause();
            showOverlay();
          }
        } catch (err) {
          overlay && (overlay.querySelector('.video-note').textContent = '当前浏览器未能直接播放该流');
          showOverlay();
        }
      });

      video.addEventListener('play', hideOverlay);
      video.addEventListener('pause', () => {
        if (video.currentTime > 0) showOverlay();
      });
      video.addEventListener('ended', showOverlay);
    });
  }

  function initMisc() {
    const q = new URL(window.location.href).searchParams.get('q');
    const quick = qs('[data-search-q]');
    if (quick && q) quick.value = q;
    quick?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const prefix = assetsPrefix();
        const searchUrl = join(prefix, 'search.html');
        const url = new URL(searchUrl, window.location.href);
        url.searchParams.set('q', quick.value.trim());
        window.location.href = url.toString();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initFloatingTop();
    initHero();
    initListTools();
    initSearchPage();
    initPlayer();
    initMisc();
  });
})();
