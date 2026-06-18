(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide-to") || 0));
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    var empty = document.querySelector("[data-empty-state]");

    if (panel && grid) {
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function textOf(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();
      }

      function filterCards() {
        var query = (keyword && keyword.value ? keyword.value : "").trim().toLowerCase();
        var selectedYear = year && year.value ? year.value : "";
        var selectedType = type && type.value ? type.value : "";
        var selectedRegion = region && region.value ? region.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var matchesKeyword = !query || textOf(card).indexOf(query) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
          var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
          var visible = matchesKeyword && matchesYear && matchesType && matchesRegion;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [keyword, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });
    }
  });
})();
