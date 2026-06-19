
(function () {
  const cards = Array.from(document.querySelectorAll('[data-search-item]'));
  const input = document.querySelector('[data-search-input]');
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const prevBtn = document.querySelector('[data-hero-prev]');
  const nextBtn = document.querySelector('[data-hero-next]');
  let slideIndex = 0;
  let timer = null;

  function setActiveSlide(next) {
    if (!slides.length) return;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === next));
    slideIndex = next;
  }
  function nextSlide() { setActiveSlide((slideIndex + 1) % slides.length); }
  function prevSlide() { setActiveSlide((slideIndex - 1 + slides.length) % slides.length); }
  function startAuto() {
    if (slides.length < 2) return;
    stopAuto();
    timer = setInterval(nextSlide, 5200);
  }
  function stopAuto() { if (timer) clearInterval(timer); timer = null; }
  if (slides.length) {
    setActiveSlide(0);
    startAuto();
    [prevBtn, nextBtn].forEach(btn => btn && btn.addEventListener('click', () => { stopAuto(); btn === prevBtn ? prevSlide() : nextSlide(); startAuto(); }));
    slides.forEach(s => { s.addEventListener('mouseenter', stopAuto); s.addEventListener('mouseleave', startAuto); });
  }

  if (input && cards.length) {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const hay = (card.getAttribute('data-search-key') || '').toLowerCase();
        const show = !q || hay.includes(q);
        card.style.display = show ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('video[data-src], video[data-fallback]').forEach(video => {
    const src = video.dataset.src || '';
    const fallback = video.dataset.fallback || '';
    if (!src) return;
    function useNative(url) {
      if (video.src !== url) video.src = url;
      video.load();
    }
    if (src.endsWith('.m3u8')) {
      if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        useNative(src);
      } else {
        const attachHls = () => {
          if (!window.Hls || !window.Hls.isSupported()) {
            if (fallback) useNative(fallback);
            return;
          }
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && fallback) {
              useNative(fallback);
            }
          });
        };
        if (window.Hls) {
          attachHls();
        } else {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
          script.onload = attachHls;
          script.onerror = () => { if (fallback) useNative(fallback); };
          document.head.appendChild(script);
        }
      }
    } else {
      useNative(src);
    }
  });

  const backtop = document.querySelector('[data-backtop]');
  if (backtop) backtop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
