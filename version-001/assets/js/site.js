(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function() {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initSearch() {
        var input = document.querySelector("[data-movie-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }

        function apply() {
            var keyword = normalize(input.value);
            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                card.classList.toggle("is-hidden", Boolean(keyword) && haystack.indexOf(keyword) === -1);
            });
        }

        input.addEventListener("input", apply);
        apply();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function(player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-overlay");
            var stream = player.getAttribute("data-stream");
            var initialized = false;
            var hlsInstance = null;

            if (!video || !button || !stream) {
                return;
            }

            function attemptPlay() {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function() {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            function start() {
                button.classList.add("is-hidden");
                if (!initialized) {
                    initialized = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                        video.addEventListener("loadedmetadata", attemptPlay, { once: true });
                        attemptPlay();
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ maxBufferLength: 40 });
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
                        player.hlsInstance = hlsInstance;
                    } else {
                        video.src = stream;
                        video.addEventListener("canplay", attemptPlay, { once: true });
                        attemptPlay();
                    }
                } else {
                    attemptPlay();
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function() {
                if (video.paused) {
                    start();
                }
            });
        });
    }

    ready(function() {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });
})();
