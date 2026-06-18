(function () {
  var mobileToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5500);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || '0'));
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var filterInput = document.querySelector('.movie-search');
  var clearButton = document.querySelector('[data-clear-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var queryInput = document.querySelector('[data-query-input]');

  var filterCards = function (value) {
    var keyword = String(value || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', Boolean(keyword) && text.indexOf(keyword) === -1);
    });
  };

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (queryInput && initial) {
      queryInput.value = initial;
      filterCards(initial);
    }

    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      filterCards('');
      filterInput.focus();
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var stream = player.getAttribute('data-stream');
    var controller = null;
    var loaded = false;

    var loadVideo = function () {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        loaded = true;
      } else if (window.Hls && window.Hls.isSupported()) {
        controller = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        controller.loadSource(stream);
        controller.attachMedia(video);
        loaded = true;
      } else {
        player.classList.add('is-playing');
        return;
      }
    };

    var start = function () {
      loadVideo();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      video.play().catch(function () {
        player.classList.remove('is-playing');
      });
    };

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    player.addEventListener('click', function () {
      if (!player.classList.contains('is-playing')) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (controller) {
        controller.destroy();
      }
    });
  });
})();
