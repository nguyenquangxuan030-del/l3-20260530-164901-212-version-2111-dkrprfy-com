(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || '0'));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function initFilters() {
    var list = qs('[data-filter-list]');
    if (!list) {
      return;
    }
    var search = qs('[data-filter-search]');
    var year = qs('[data-filter-year]');
    var type = qs('[data-filter-type]');
    var empty = qs('[data-filter-empty]');
    var cards = qsa('.movie-card', list);

    function apply() {
      var query = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var matchType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
        var matched = matchQuery && matchYear && matchType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function cardHtml(movie) {
    return [
      '<article class="movie-card poster-card" data-title="', escapeHtml(movie.title), '" data-year="', escapeHtml(movie.year), '" data-region="', escapeHtml(movie.region), '" data-type="', escapeHtml(movie.type), '" data-genre="', escapeHtml(movie.genre), '">',
      '<a class="poster-link" href="./movies/', escapeHtml(movie.filename), '">',
      '<img src="./', escapeHtml(movie.image), '.jpg" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '<span class="duration-badge">', escapeHtml(movie.duration), '</span>',
      '<span class="play-mark">▶</span>',
      '</a>',
      '<div class="poster-body">',
      '<div class="card-meta"><span>', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span></div>',
      '<h3><a href="./movies/', escapeHtml(movie.filename), '">', escapeHtml(movie.title), '</a></h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="card-foot"><span><span class="rating-star">★</span>', escapeHtml(movie.rating), '</span><a href="./movies/', escapeHtml(movie.filename), '">立即观看</a></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || !window.MovieSearchData) {
      return;
    }
    var input = qs('#search-page-input');
    var empty = qs('#search-empty');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    if (!query.trim()) {
      return;
    }
    var words = normalize(query).split(/\s+/).filter(Boolean);
    var matches = window.MovieSearchData.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    results.innerHTML = matches.map(cardHtml).join('');
    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  window.initMoviePlayer = function (options) {
    var video = qs('#' + options.videoId);
    var button = qs('#' + options.buttonId);
    var overlay = qs('#' + options.overlayId);
    var prepared = false;
    var hls = null;

    if (!video) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
      } else {
        video.src = options.source;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function play() {
      prepare();
      hideOverlay();
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
}());
