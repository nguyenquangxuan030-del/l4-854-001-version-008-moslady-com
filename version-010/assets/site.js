(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const previous = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function scheduleHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showHero(0);
    scheduleHero();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showHero(heroIndex - 1);
      scheduleHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      scheduleHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
      scheduleHero();
    });
  });

  const filterForms = document.querySelectorAll('[data-filter-form]');

  function runFilter(scope) {
    const keywordInput = scope.querySelector('[data-filter-keyword]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const categorySelect = scope.querySelector('[data-filter-category]');
    const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const category = categorySelect ? categorySelect.value : '';
    const listId = scope.getAttribute('data-filter-target');
    const container = listId ? document.getElementById(listId) : document;
    const cards = Array.from(container.querySelectorAll('[data-movie-card]'));
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = card.getAttribute('data-search') || '';
      const cardYear = card.getAttribute('data-year') || '';
      const cardCategory = card.getAttribute('data-category') || '';
      const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchedYear = !year || cardYear === year;
      const matchedCategory = !category || cardCategory === category;
      const matched = matchedKeyword && matchedYear && matchedCategory;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    const empty = container.parentElement ? container.parentElement.querySelector('[data-filter-empty]') : null;
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  filterForms.forEach(function (form) {
    const keywordInput = form.querySelector('[data-filter-keyword]');
    const yearSelect = form.querySelector('[data-filter-year]');
    const categorySelect = form.querySelector('[data-filter-category]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter(form);
    });

    [keywordInput, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          runFilter(form);
        });
        control.addEventListener('change', function () {
          runFilter(form);
        });
      }
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && keywordInput && !keywordInput.value) {
      keywordInput.value = q;
    }
    runFilter(form);
  });

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      const existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function beginPlayback(shell) {
    const video = shell.querySelector('video');
    const stream = shell.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }

    shell.classList.add('is-ready');

    if (shell.getAttribute('data-ready') === 'true') {
      video.play().catch(function () {});
      return;
    }

    shell.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.load();
      video.play().catch(function () {});
      return;
    }

    loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        video.src = stream;
        video.load();
        video.play().catch(function () {});
        return;
      }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    }).catch(function () {
      video.src = stream;
      video.load();
      video.play().catch(function () {});
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    const cover = shell.querySelector('[data-play-button]');
    if (cover) {
      cover.addEventListener('click', function () {
        beginPlayback(shell);
      });
    }
  });
})();
