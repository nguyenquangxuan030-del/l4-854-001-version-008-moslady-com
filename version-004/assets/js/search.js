(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"card-meta\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    var movies = window.MovieSearchData || [];

    if (input) {
      input.value = params.get("q") || "";
    }

    function matches(movie, value) {
      if (!value) {
        return true;
      }

      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" ")).indexOf(value) !== -1;
    }

    var filtered = movies.filter(function (movie) {
      return matches(movie, query);
    }).slice(0, 240);

    if (title) {
      title.textContent = query ? "“" + (params.get("q") || "") + "” 的搜索结果" : "热门片库推荐";
    }

    if (results) {
      results.innerHTML = filtered.map(card).join("\n");
    }

    if (empty) {
      empty.hidden = filtered.length !== 0;
    }
  });
})();
