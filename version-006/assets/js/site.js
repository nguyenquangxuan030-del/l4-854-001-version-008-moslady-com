(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        var root = form.getAttribute("data-search-root") || "";
        window.location.href = root + "search.html?q=" + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }
          card.classList.toggle("is-hidden-card", !matched);
        });
      }

      [input, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    var meta = [movie.year, movie.region, movie.type].filter(Boolean).join(" · ");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHTML(movie.href) + "\">" +
      "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-chip\">播放</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"" + escapeHTML(movie.href) + "\">" + escapeHTML(movie.title) + "</a>" +
      "<p class=\"movie-meta\">" + escapeHTML(meta) + "</p>" +
      "<p class=\"movie-desc\">" + escapeHTML(movie.description) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    if (!document.body.hasAttribute("data-search-page")) {
      return;
    }
    var form = document.querySelector("[data-search-page-form]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var results = document.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      if (!results) {
        return;
      }
      var keyword = query.trim().toLowerCase();
      var source = Array.isArray(SEARCH_MOVIES) ? SEARCH_MOVIES : [];
      var matched = keyword ? source.filter(function (movie) {
        return movie.search.indexOf(keyword) !== -1;
      }) : source.slice(0, 48);
      if (!matched.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片</div>";
        return;
      }
      results.innerHTML = matched.slice(0, 120).map(movieCard).join("");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
        window.history.replaceState({}, "", url);
        render(query);
      });
    }

    render(initialQuery);
  }

  ready(function () {
    initMenu();
    bindSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();