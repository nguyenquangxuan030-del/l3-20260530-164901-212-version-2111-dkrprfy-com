const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');
const quickSearch = document.querySelector('.quick-search');

if (navToggle && mainNav && quickSearch) {
  navToggle.addEventListener('click', function () {
    mainNav.classList.toggle('is-open');
    quickSearch.classList.toggle('is-open');
  });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let activeSlide = 0;
let heroTimer = null;

function showSlide(index) {
  if (!slides.length) {
    return;
  }
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach(function (slide, slideIndex) {
    slide.classList.toggle('is-active', slideIndex === activeSlide);
  });
  dots.forEach(function (dot, dotIndex) {
    dot.classList.toggle('is-active', dotIndex === activeSlide);
  });
}

function startHero() {
  if (slides.length < 2) {
    return;
  }
  heroTimer = window.setInterval(function () {
    showSlide(activeSlide + 1);
  }, 5200);
}

dots.forEach(function (dot, index) {
  dot.addEventListener('click', function () {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    showSlide(index);
    startHero();
  });
});

showSlide(0);
startHero();

const filterInput = document.querySelector('[data-filter-input]');
const yearSelect = document.querySelector('[data-year-filter]');
const regionSelect = document.querySelector('[data-region-filter]');
const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
const emptyState = document.querySelector('[data-empty-state]');

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function applyFilter() {
  if (!cards.length) {
    return;
  }
  const query = normalize(filterInput ? filterInput.value : '');
  const year = yearSelect ? yearSelect.value : '';
  const region = regionSelect ? regionSelect.value : '';
  let visible = 0;

  cards.forEach(function (card) {
    const haystack = normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags
    ].join(' '));
    const matchQuery = !query || haystack.includes(query);
    const matchYear = !year || card.dataset.year === year;
    const matchRegion = !region || card.dataset.region === region;
    const shouldShow = matchQuery && matchYear && matchRegion;
    card.style.display = shouldShow ? '' : 'none';
    if (shouldShow) {
      visible += 1;
    }
  });

  if (emptyState) {
    emptyState.classList.toggle('is-visible', visible === 0);
  }
}

if (filterInput) {
  filterInput.addEventListener('input', applyFilter);
}
if (yearSelect) {
  yearSelect.addEventListener('change', applyFilter);
}
if (regionSelect) {
  regionSelect.addEventListener('change', applyFilter);
}

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q');
if (filterInput && initialQuery) {
  filterInput.value = initialQuery;
  applyFilter();
}
