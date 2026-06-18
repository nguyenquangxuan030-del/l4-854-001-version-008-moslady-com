(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      button.textContent = expanded ? '☰' : '×';
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    hero.addEventListener('mouseenter', function () {
      if (timer) {
        clearInterval(timer);
      }
    });
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFiltering() {
    var grid = qs('[data-card-grid]');
    var cards = qsa('.searchable-card');
    if (!grid || !cards.length) {
      return;
    }
    var search = qs('[data-card-search]');
    var year = qs('[data-filter-year]');
    var category = qs('[data-filter-category]');
    var empty = qs('[data-empty-note]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && search) {
      search.value = q;
    }

    function apply() {
      var term = normalize(search && search.value);
      var y = normalize(year && year.value);
      var c = normalize(category && category.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')).indexOf(y) !== -1;
        var matchCategory = !c || normalize(card.getAttribute('data-category')) === c;
        var show = matchTerm && matchYear && matchCategory;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupCards() {
    qsa('.movie-card').forEach(function (card) {
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var link = qs('a', card);
          if (link) {
            link.click();
          }
        }
      });
    });
  }

  window.bindPlayer = function (options) {
    ready(function () {
      var video = qs(options.video);
      var button = qs(options.button);
      var shell = qs(options.shell);
      var src = options.src;
      if (!video || !button || !shell || !src) {
        return;
      }
      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      button.addEventListener('click', play);
      shell.addEventListener('click', function (event) {
        if (event.target === shell || event.target === video) {
          if (!attached || video.paused) {
            play();
          }
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
    setupCards();
  });
})();
