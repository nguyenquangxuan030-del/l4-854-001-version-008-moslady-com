import { H as Hls } from "./hls-vendor.js";

const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    const showSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === index);
        });
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(index + 1), 5200);
    }
}

const normalize = (value) => String(value || "").toLowerCase().trim();

const filterScopes = document.querySelectorAll("[data-filter-scope]");

filterScopes.forEach((scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const year = scope.querySelector("[data-year-filter]");
    const region = scope.querySelector("[data-region-filter]");
    const reset = scope.querySelector("[data-filter-reset]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const empty = scope.querySelector("[data-empty-state]");

    const applyFilter = () => {
        const q = normalize(input ? input.value : "");
        const y = year ? year.value : "";
        const r = region ? region.value : "";
        let visible = 0;

        cards.forEach((card) => {
            const text = normalize(card.dataset.title);
            const matchesText = !q || text.includes(q);
            const matchesYear = !y || card.dataset.year === y;
            const matchesRegion = !r || card.dataset.region.includes(r);
            const show = matchesText && matchesYear && matchesRegion;
            card.style.display = show ? "" : "none";
            if (show) visible += 1;
        });

        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    };

    if (input) {
        input.addEventListener("input", applyFilter);
    }
    if (year) {
        year.addEventListener("change", applyFilter);
    }
    if (region) {
        region.addEventListener("change", applyFilter);
    }
    if (reset) {
        reset.addEventListener("click", () => {
            if (input) input.value = "";
            if (year) year.value = "";
            if (region) region.value = "";
            applyFilter();
        });
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && input) {
        input.value = query;
    }
    applyFilter();
});

const startPlayer = (shell) => {
    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-player-button]");
    if (!video) return;

    const src = video.getAttribute("data-stream");
    if (!src) return;

    if (video.dataset.ready !== "1") {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video.hls = hls;
        } else {
            video.src = src;
        }
        video.dataset.ready = "1";
    }

    if (button) {
        button.classList.add("hidden");
    }

    const play = video.play();
    if (play && typeof play.catch === "function") {
        play.catch(() => {});
    }
};

document.querySelectorAll(".player-shell").forEach((shell) => {
    const button = shell.querySelector("[data-player-button]");
    const video = shell.querySelector("video");

    if (button) {
        button.addEventListener("click", () => startPlayer(shell));
    }

    if (video) {
        video.addEventListener("click", () => {
            if (video.dataset.ready !== "1") {
                startPlayer(shell);
            }
        });
    }
});
