(() => {
  const normalize = value => (value || '').toString().trim().toLowerCase();
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton && header) {
    menuButton.addEventListener('click', () => {
      header.classList.toggle('menu-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = slides.findIndex(slide => slide.classList.contains('active'));
    let timer = null;

    if (index < 0) {
      index = 0;
    }

    const show = target => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('active', itemIndex === index);
      });
    };

    const start = () => {
      if (slides.length > 1) {
        timer = window.setInterval(() => show(index + 1), 5200);
      }
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, itemIndex) => {
      dot.addEventListener('click', () => {
        show(itemIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        restart();
      });
    }

    show(index);
    start();
  }

  const queryParam = new URLSearchParams(window.location.search).get('q') || '';

  document.querySelectorAll('[data-filter]').forEach(section => {
    const input = section.querySelector('[data-filter-input]');
    const year = section.querySelector('[data-filter-year]');
    const type = section.querySelector('[data-filter-type]');
    const region = section.querySelector('[data-filter-region]');
    const cards = Array.from(section.querySelectorAll('.movie-card'));
    const empty = section.querySelector('.empty-result');

    if (section.hasAttribute('data-global-search') && input && queryParam) {
      input.value = queryParam;
    }

    const apply = () => {
      const q = normalize(input ? input.value : '');
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      const r = region ? region.value : '';
      let visible = 0;

      cards.forEach(card => {
        const search = normalize(card.dataset.search);
        const ok = (!q || search.includes(q)) && (!y || card.dataset.year === y) && (!t || card.dataset.type === t) && (!r || card.dataset.region === r);
        card.hidden = !ok;

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible > 0;
      }
    };

    [input, year, type, region].forEach(control => {
      if (control) {
        control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply);
      }
    });

    apply();
  });
})();
