(function () {
  function init(videoId, url) {
    var video = document.getElementById(videoId);
    if (!video || !url) {
      return;
    }

    var shell = video.closest(".player-shell");
    var overlay = shell ? shell.querySelector(".player-overlay") : null;
    var hasStarted = false;
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function attachStream() {
      if (hasStarted) {
        video.play().catch(function () {});
        return;
      }

      hasStarted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      hideOverlay();
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", attachStream);
    }

    video.addEventListener("click", function () {
      if (!hasStarted) {
        attachStream();
      }
    });

    video.addEventListener("play", hideOverlay);

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
