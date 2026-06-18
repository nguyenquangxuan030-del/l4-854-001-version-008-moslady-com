(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".js-hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    schedule();
  }

  function normalized(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var grid = document.getElementById("movieGrid");
    if (!grid) {
      return;
    }
    var input = document.getElementById("movieSearch");
    var year = document.getElementById("yearFilter");
    var type = document.getElementById("typeFilter");
    var sort = document.getElementById("sortFilter");
    var empty = document.getElementById("filterEmpty");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (input && q) {
      input.value = q;
    }

    function applySort() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "new") {
          return normalized(b.dataset.year).localeCompare(normalized(a.dataset.year), "zh-Hans-CN", { numeric: true });
        }
        if (mode === "name") {
          return normalized(a.dataset.title).localeCompare(normalized(b.dataset.title), "zh-Hans-CN");
        }
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      });
      sorted.forEach(function (item) {
        grid.appendChild(item);
      });
    }

    function applyFilter() {
      var keyword = normalized(input && input.value);
      var yearValue = normalized(year && year.value);
      var typeValue = normalized(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalized([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(" "));
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !yearValue || normalized(card.dataset.year) === yearValue;
        var okType = !typeValue || normalized(card.dataset.type).indexOf(typeValue) !== -1;
        var ok = okKeyword && okYear && okType;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }

    applySort();
    applyFilter();
  }

  window.initMoviePlayer = function (source) {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var loaded = false;
    var hlsInstance = null;

    function attach() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("canplay", function () {
      if (shell.classList.contains("is-playing") && video.paused) {
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
