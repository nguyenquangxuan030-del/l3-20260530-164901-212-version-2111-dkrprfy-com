document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5000);
    }
  }

  var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));

  filterBars.forEach(function (bar) {
    var searchInput = bar.querySelector('[data-search-input]');
    var yearFilter = bar.querySelector('[data-year-filter]');
    var regionFilter = bar.querySelector('[data-region-filter]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var items = Array.prototype.slice.call(grid.children);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function applyFilter() {
      var term = normalize(searchInput ? searchInput.value : '');
      var year = yearFilter ? yearFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';

      items.forEach(function (item) {
        var text = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.year,
          item.dataset.genre,
          item.dataset.category,
          item.textContent
        ].join(' '));
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchYear = !year || item.dataset.year === year;
        var matchRegion = !region || item.dataset.region === region;

        item.classList.toggle('is-hidden', !(matchTerm && matchYear && matchRegion));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
    if (regionFilter) {
      regionFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
});
