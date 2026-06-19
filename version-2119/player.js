function initMoviePlayer(videoId, sourceUrl, triggerSelector, shellSelector) {
  var video = document.getElementById(videoId);
  var trigger = document.querySelector(triggerSelector);
  var shell = document.querySelector(shellSelector);
  var prepared = false;
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function prepare() {
    if (prepared) {
      return Promise.resolve();
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function () {
          resolve();
        });
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  function start() {
    prepare().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  if (trigger) {
    trigger.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', function () {
    if (shell && video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
