(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function togglePanel(buttonSelector, panelSelector) {
    var button = qs(buttonSelector);
    var panel = qs(panelSelector);
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }
    var input = qs('[data-filter-input]', panel);
    var year = qs('[data-year-filter]', panel);
    var category = qs('[data-category-filter]', panel);
    var pageInput = qs('[data-search-page-input]');
    var cards = qsa('[data-card]', grid);
    var initialQuery = getQuery().trim();

    if (pageInput && initialQuery) {
      pageInput.value = initialQuery;
    }
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedCategory = category ? category.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || cardYear === selectedYear;
        var matchCategory = !selectedCategory || cardCategory === selectedCategory;
        card.style.display = matchKeyword && matchYear && matchCategory ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    togglePanel('[data-toggle-search]', '[data-search-panel]');
    togglePanel('[data-toggle-menu]', '[data-mobile-menu]');
    setupHero();
    setupFilters();
  });
})();
