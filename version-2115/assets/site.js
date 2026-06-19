(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var sliders = document.querySelectorAll(".hero-slider");
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  });

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var input = scope.querySelector(".site-search-input");
    var activeChip = scope.querySelector(".filter-chip.active");
    var query = normalize(input ? input.value : "");
    var filter = activeChip ? normalize(activeChip.getAttribute("data-filter")) : "all";
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var genre = normalize(card.getAttribute("data-genre"));
      var tagMatch = filter === "all" || genre.indexOf(filter) !== -1 || text.indexOf(filter) !== -1;
      var queryMatch = !query || text.indexOf(query) !== -1;
      var ok = tagMatch && queryMatch;
      card.style.display = ok ? "flex" : "none";
      if (ok) {
        visible += 1;
      }
    });
    var empty = scope.querySelector(".empty-result");
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  document.querySelectorAll(".filter-scope").forEach(function (scope) {
    var input = scope.querySelector(".site-search-input");
    if (input) {
      input.addEventListener("input", function () {
        filterCards(scope);
      });
    }
    scope.querySelectorAll(".filter-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        scope.querySelectorAll(".filter-chip").forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        filterCards(scope);
      });
    });
    filterCards(scope);
  });

  document.querySelectorAll(".search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      }
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");
  if (q) {
    document.querySelectorAll(".site-search-input").forEach(function (input) {
      input.value = q;
      var scope = input.closest(".filter-scope");
      if (scope) {
        filterCards(scope);
      }
    });
  }
})();

function initMoviePlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }
  var playerBox = video.closest(".player-box");
  var cover = playerBox ? playerBox.querySelector(".player-cover") : null;
  var loaded = false;
  function loadAndPlay() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (!loaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute("controls", "controls");
      loaded = true;
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }
  if (cover) {
    cover.addEventListener("click", loadAndPlay);
  }
  video.addEventListener("click", function () {
    if (!loaded) {
      loadAndPlay();
    }
  });
}
