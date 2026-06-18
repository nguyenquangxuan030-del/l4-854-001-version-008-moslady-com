(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (slides.length) {
    var current = 0;
    var showSlide = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5600);
  }

  var filterWrap = document.querySelector("[data-filter-wrap]");
  if (filterWrap) {
    var input = filterWrap.querySelector("[data-filter-input]");
    var region = filterWrap.querySelector("[data-filter-region]");
    var type = filterWrap.querySelector("[data-filter-type]");
    var year = filterWrap.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (region && region.options.length <= 1) {
      var regions = [];
      cards.forEach(function(card) {
        var value = card.getAttribute("data-region") || "";
        if (value && regions.indexOf(value) === -1) {
          regions.push(value);
        }
      });
      regions.sort().forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        region.appendChild(option);
      });
    }

    if (type && type.options.length <= 1) {
      var types = [];
      cards.forEach(function(card) {
        var value = card.getAttribute("data-type") || "";
        if (value && types.indexOf(value) === -1) {
          types.push(value);
        }
      });
      types.sort().forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        type.appendChild(option);
      });
    }

    if (year && year.options.length <= 1) {
      var years = [];
      cards.forEach(function(card) {
        var value = card.getAttribute("data-year") || "";
        if (value && years.indexOf(value) === -1) {
          years.push(value);
        }
      });
      years.sort().reverse().forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    var applyFilter = function() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      cards.forEach(function(card) {
        var text = card.getAttribute("data-search") || "";
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.getAttribute("data-region") !== r) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        card.classList.toggle("is-hidden", !ok);
      });
    };

    [input, region, type, year].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
    applyFilter();
  }
}());
