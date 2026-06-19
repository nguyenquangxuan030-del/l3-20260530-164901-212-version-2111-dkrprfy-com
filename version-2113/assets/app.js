
(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('is-open');
    });
  }

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const results = document.getElementById('searchResults');
  const stats = document.getElementById('searchStats');
  const chips = Array.from(document.querySelectorAll('[data-filter]'));

  if (searchInput && searchBtn && results && stats && window.SITE_DATA) {
    let active = 'all';

    function matches(item, query) {
      if (!query) return true;
      const needle = query.toLowerCase();
      return [item.title, item.year, item.type, item.region, item.genre, item.one_line, item.summary, item.tags].join(' ').toLowerCase().includes(needle);
    }

    function render() {
      const query = searchInput.value.trim();
      const list = window.SITE_DATA.filter(item => active === 'all' ? true : item.category_slug === active)
        .filter(item => matches(item, query));
      stats.textContent = `共找到 ${list.length} 部影片`;
      results.innerHTML = list.slice(0, 120).map(item => `
        <a class="movie-card movie-card--grid" href="${item.url}">
          <div class="movie-poster" style="--poster-a:${item.poster_a};--poster-b:${item.poster_b};">
            <span class="movie-badge">${item.type}</span>
            <span class="movie-id">${item.id}</span>
            <strong>${item.title[0] || '影'}</strong>
          </div>
          <div class="movie-body">
            <div class="movie-meta-row"><span>${item.year}</span><span>${item.region}</span></div>
            <h3>${item.title}</h3>
            <p>${item.one_line}</p>
            <div class="movie-tags"><span>${item.genre_short}</span><span>${item.primary_category_cn}</span></div>
          </div>
        </a>
      `).join('');
    }

    searchBtn.addEventListener('click', render);
    searchInput.addEventListener('input', render);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        active = chip.dataset.filter || 'all';
        render();
      });
    });
    render();
  }
})();
