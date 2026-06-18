(function () {
  function initMoviePlayer(source) {
    var video = document.querySelector("[data-video-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var hls = null;
    var attached = false;

    if (!video || !overlay || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hls = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  globalThis.initMoviePlayer = initMoviePlayer;
})();