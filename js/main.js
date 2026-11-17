/* =========================================================
   Основной скрипт: ссылки из config.js, шапка, меню, липкая кнопка
   ========================================================= */
(function () {
  'use strict';
  const SITE = window.SITE || {};
  const root = document.documentElement;
  root.classList.add('js');

  /* --- Ссылки из config.js: data-link="telegram.chat" и т.п. --- */
  const get = (path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), SITE);
  document.querySelectorAll('[data-link]').forEach((el) => {
    const url = get(el.dataset.link);
    if (!url) { el.hidden = true; return; }
    el.href = url;
    if (/^https?:/.test(url)) { el.target = '_blank'; el.rel = 'noopener'; }
  });
  document.querySelectorAll('[data-text]').forEach((el) => {
    const v = get(el.dataset.text);
    if (v) el.textContent = v;
  });

  /* --- Шапка: фон после прокрутки, прячется при скролле вниз --- */
  const header = document.querySelector('.header');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = root.classList.contains('is-locked');
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 320);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Полноэкранное меню --- */
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  if (burger && menu) {
    const focusables = () => [burger, ...menu.querySelectorAll('a, button')];
    const open = () => {
      burger.setAttribute('aria-expanded', 'true');
      burger.querySelector('.visually-hidden').textContent = 'Закрыть меню';
      menu.classList.add('is-open');
      menu.removeAttribute('inert');
      root.classList.add('is-locked');
      document.dispatchEvent(new CustomEvent('site:lock', { detail: true }));
      header.classList.remove('is-hidden');
    };
    const close = (returnFocus = true) => {
      burger.setAttribute('aria-expanded', 'false');
      burger.querySelector('.visually-hidden').textContent = 'Открыть меню';
      menu.classList.remove('is-open');
      menu.setAttribute('inert', '');
      root.classList.remove('is-locked');
      document.dispatchEvent(new CustomEvent('site:lock', { detail: false }));
      if (returnFocus) burger.focus();
    };
    menu.setAttribute('inert', '');
    burger.addEventListener('click', () => (menu.classList.contains('is-open') ? close() : open()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {               // фокус не выходит из меню
        const f = focusables();
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 1200px)').addEventListener('change', (m) => { if (m.matches) close(false); });
  }

  /* --- Год в подвале --- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* --- Работы: сетка из js/works.js + фильтр по стилям --- */
  const WORKS = window.WORKS || [];
  const STYLES = window.STYLES || {};
  const grid = document.querySelector('[data-works-grid]');
  const filterBox = document.querySelector('[data-filter]');
  const countEl = document.querySelector('[data-works-count]');
  const pad = (n) => String(n).padStart(3, '0');

  const workHTML = (w, i) => `
    <li class="work" data-style="${w.style}">
      <button class="work__btn" type="button" data-work="${i}" aria-label="${pad(i + 1)} ${STYLES[w.style] || ''} — открыть: ${w.alt}">
        <span class="work__img">
          <img src="assets/img/${w.id}-640.webp"
               srcset="assets/img/${w.id}-320.webp 320w, assets/img/${w.id}-640.webp 640w, assets/img/${w.id}-960.webp 960w, assets/img/${w.id}-${w.max}.webp ${w.max}w"
               sizes="(min-width: 1200px) 30vw, (min-width: 768px) 45vw, 50vw"
               width="${w.w}" height="${w.h}" loading="lazy" decoding="async" alt="${w.alt}">
        </span>
        <span class="work__cap mono"><span class="bracket">${pad(i + 1)}</span><span>${STYLES[w.style] || ''}</span></span>
      </button>
    </li>`;

  if (grid && WORKS.length) {
    grid.innerHTML = WORKS.map(workHTML).join('');
    const items = [...grid.children];

    const layout = (animate) => {
      let k = 0;
      items.forEach((li) => {
        if (li.hidden) return;
        li.dataset.m = k % 5;          // раскладка телефона/планшета
        li.dataset.d = k % 6;          // раскладка десктопа
        // ширина картинки по месту в сетке — чтобы браузер не грузил лишние пиксели
        const img = li.querySelector('img');
        const mW = [92, 46, 46, 56, 40][k % 5], tW = [56, 33, 42, 33, 42][k % 5], dW = [38, 23, 23, 23, 31, 23][k % 6];
        img.sizes = `(min-width: 1200px) ${dW}vw, (min-width: 768px) ${tW}vw, ${mW}vw`;
        if (animate) {
          li.classList.remove('is-entering'); void li.offsetWidth; li.classList.add('is-entering');
        }
        k++;
      });
      if (countEl) countEl.textContent = `[ ${k} ]`;
    };

    if (filterBox) {
      const counts = WORKS.reduce((a, w) => ((a[w.style] = (a[w.style] || 0) + 1), a), {});
      const filters = [['all', 'Все', WORKS.length], ...Object.keys(STYLES).filter((s) => counts[s]).map((s) => [s, STYLES[s], counts[s]])];
      filterBox.innerHTML = filters.map(([key, label, n], i) =>
        `<button class="chip" type="button" data-f="${key}" aria-pressed="${i === 0}">${label}<sup>${n}</sup></button>`).join('');
      filterBox.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-f]');
        if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
        filterBox.querySelectorAll('[data-f]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const f = btn.dataset.f;
        items.forEach((li) => { li.hidden = f !== 'all' && li.dataset.style !== f; });
        layout(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      });
    }
    layout(false);
  }

  /* --- Липкая кнопка «Записаться» — появляется после первого экрана --- */
  const sticky = document.querySelector('.sticky-book');
  const hero = document.querySelector('.hero, .cw-hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting;
      sticky.classList.toggle('is-visible', show);
      sticky.toggleAttribute('inert', !show);
    }, { threshold: 0, rootMargin: '-35% 0px 0px 0px' }).observe(hero);
    sticky.setAttribute('inert', '');
  }
})();

/* =========================================================
   Окна: запись (шторка) и лайтбокс работ. Нативный <dialog>:
   фокус внутри, Esc и клик по фону закрывают, прокрутка страницы блокируется.
   ========================================================= */
(function () {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLOSE_MS = reduce ? 0 : 420;

  function openDialog(dlg, opener) {
    if (dlg.open) return;
    dlg._opener = opener || document.activeElement;
    dlg.showModal();
    root.classList.add('is-locked');
    document.dispatchEvent(new CustomEvent('site:lock', { detail: true }));
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('is-open')));
  }
  function closeDialog(dlg) {
    if (!dlg.open || dlg._closing) return;
    dlg._closing = true;
    dlg.classList.remove('is-open');
    setTimeout(() => {
      dlg.close();
      dlg._closing = false;
      if (!document.querySelector('dialog[open]')) {
        root.classList.remove('is-locked');
        document.dispatchEvent(new CustomEvent('site:lock', { detail: false }));
      }
      if (dlg._opener && document.contains(dlg._opener)) dlg._opener.focus({ preventScroll: true });
    }, CLOSE_MS);
  }
  function wireDialog(dlg, isBackdrop) {
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dlg); });   // Esc
    dlg.addEventListener('keydown', (e) => {                                             // Tab не выходит из окна
      if (e.key !== 'Tab') return;
      const f = [...dlg.querySelectorAll('a[href], button:not([disabled])')].filter((el) => !el.hidden && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dlg.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !dlg.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    });
    dlg.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]') || isBackdrop(e.target)) closeDialog(dlg);
    });
  }

  /* ---------- Окно записи ---------- */
  const book = document.getElementById('book');
  if (book && typeof book.showModal === 'function') {
    const MODES = {
      tattoo: {
        label: '[ Вероника · тату-мастер ]',
        title: 'Запись на&nbsp;<em>тату</em>',
        lead: 'Напишите идею, примерный размер и место на теле — обсудим детали и подберём удобную дату.'
      },
      rent: {
        label: '[ Ink tattoo studio · коворкинг ]',
        title: 'Аренда <em>студии</em>',
        lead: 'Напишите, на какую дату и какой тариф хотите забронировать рабочее место.'
      }
    };
    const $ = (sel) => book.querySelector(sel);
    wireDialog(book, (t) => t === book);

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-book]');
      if (!trigger || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      const mode = MODES[trigger.dataset.book] ? trigger.dataset.book : 'tattoo';
      const m = MODES[mode];
      book.dataset.mode = mode;
      $('[data-book-label]').textContent = m.label;
      $('#book-title').innerHTML = m.title;
      $('[data-book-lead]').textContent = m.lead;
      openDialog(book, trigger);
      // фокус на главную кнопку (Telegram)
      setTimeout(() => $('.contact--main').focus({ preventScroll: true }), 50);
    });
  }

  /* ---------- Лайтбокс работ ---------- */
  const lb = document.getElementById('lightbox');
  const grid = document.querySelector('[data-works-grid]');
  const WORKS = window.WORKS || [];
  const STYLES = window.STYLES || {};
  if (lb && grid && WORKS.length && typeof lb.showModal === 'function') {
    const img = lb.querySelector('[data-lb-img]');
    const stage = lb.querySelector('[data-lb-stage]');
    const countEl = lb.querySelector('[data-lb-count]');
    const styleEl = lb.querySelector('[data-lb-style]');
    const capEl = lb.querySelector('[data-lb-cap]');
    const pad = (n) => String(n).padStart(3, '0');
    let list = [];      // индексы работ, видимых с текущим фильтром
    let pos = 0;

    const src = (w) => `assets/img/${w.id}-${w.max}.webp`;
    const setImage = (w) => {
      img.src = `assets/img/${w.id}-640.webp`;
      img.srcset = `assets/img/${w.id}-640.webp 640w, ${src(w)} ${w.max}w`;
      img.sizes = '(min-width: 1200px) 60vw, 100vw';
      img.width = w.w; img.height = w.h;
      img.alt = w.alt;
    };
    const preload = (i) => { const w = WORKS[list[(i + list.length) % list.length]]; if (w) { const p = new Image(); p.src = src(w); } };

    const render = (dir) => {
      const idx = list[pos];
      const w = WORKS[idx];
      countEl.textContent = `${pad(idx + 1)} / ${pad(WORKS.length)}`;
      styleEl.textContent = STYLES[w.style] || '';
      capEl.textContent = w.alt;
      if (!dir || reduce) { setImage(w); }
      else {
        img.style.setProperty('--dir', dir);
        img.classList.add('is-leaving');
        setTimeout(() => {
          setImage(w);
          img.classList.remove('is-leaving');
          img.classList.add('is-coming');
          void img.offsetWidth;
          img.classList.remove('is-coming');
        }, 220);
      }
      preload(pos + 1); preload(pos - 1);
    };
    const go = (dir) => { if (list.length < 2) return; pos = (pos + dir + list.length) % list.length; render(dir); };

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-work]');
      if (!btn) return;
      list = [...grid.querySelectorAll('.work:not([hidden]) [data-work]')].map((b) => Number(b.dataset.work));
      pos = Math.max(0, list.indexOf(Number(btn.dataset.work)));
      render(0);
      openDialog(lb, btn);
    });
    wireDialog(lb, (t) => t === stage);
    lb.querySelector('[data-lb-prev]').addEventListener('click', () => go(-1));
    lb.querySelector('[data-lb-next]').addEventListener('click', () => go(1));
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    // свайп
    let sx = 0, sy = 0, tracking = false;
    stage.addEventListener('pointerdown', (e) => { tracking = true; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        go(dx < 0 ? 1 : -1);
        stage._swiped = true; setTimeout(() => { stage._swiped = false; }, 50);
      }
    });
    stage.addEventListener('pointercancel', () => { tracking = false; });
    // клик по фону после свайпа не должен закрывать
    stage.addEventListener('click', (e) => { if (stage._swiped) e.stopPropagation(); }, true);
  }
})();

/* =========================================================
   АНИМАЦИИ: GSAP + ScrollTrigger + плавный скролл Lenis.
   Сдержанно: первый экран ≤ 1.5 с, мягкое всплытие блоков, лёгкий параллакс.
   При prefers-reduced-motion всё выключено, контент виден сразу.
   ========================================================= */
(function () {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const isDesktop = window.matchMedia('(min-width: 1200px)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ease = 'power3.out';

  /* ---------- Плавный скролл ---------- */
  let lenis = null;
  if (window.Lenis) {
    const headerH = () => document.querySelector('.header')?.offsetHeight || 0;
    lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('site:lock', (e) => (e.detail ? lenis.stop() : lenis.start()));
    // плавный переход по якорям (#works, #faq…) с отступом под шапку
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.hasAttribute('data-book') || e.defaultPrevented) return;
      const id = a.getAttribute('href');
      const target = id === '#main' ? document.body : (id.length > 1 && document.querySelector(id));
      if (!target) return;
      e.preventDefault();
      lenis.start();
      lenis.scrollTo(target, { offset: id === '#main' ? 0 : -headerH() + 1, duration: 1.2 });
      history.replaceState(null, '', id);
    });
  }

  /* Вступительная анимация первого экрана — в CSS (класс .intro). Здесь только параллакс при скролле. */
  const hero = document.querySelector('.hero');
  if (hero) {
    gsap.to('.hero__photo img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }
  const cw = document.querySelector('.cw-hero');
  if (cw) {
    gsap.to('.cw-hero__circle', { yPercent: -12, rotate: 8, ease: 'none', scrollTrigger: { trigger: cw, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Мягкое всплытие блоков ---------- */
  const revealSel = [
    '.section__label', '.about__title', '.about__text', '.works__title', '.filter', '.link-big',
    '.session__title', '.step', '.care__title', '.care__hint', '.note', '.teaser__title', '.teaser__info',
    '.faq__title', '.qa', '.final__title', '.final__grid > *',
    '.prices__title', '.price-card', '.prices__included', '.space__title', '.spread__text', '.spread__ring',
    '.mood__cap', '.supplies__title', '.supplies__all', '.extra', '.rules__title', '.rule', '.cw-final__title', '.cw-final__back'
  ].join(',');
  const items = gsap.utils.toArray(revealSel).filter((el) => !el.closest('.hero, .cw-hero'));
  gsap.set(items, { opacity: 0, y: 40 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease, stagger: 0.08, overwrite: true })
  });

  /* ---------- Фото: раскрытие + лёгкий параллакс ---------- */
  const photos = gsap.utils.toArray('.about__photo, .teaser__ph, .spread__big, .spread__small, .mood__ph, .supplies__photo, .final__photo, .session__photo');
  photos.forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(12% 0% 0% 0%)', opacity: 0 }, {
      clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.1, ease,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
    const amp = isDesktop ? 50 : 20;
    gsap.fromTo(el, { y: amp }, { y: -amp, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Работы: всплытие карточек ---------- */
  const works = gsap.utils.toArray('.work');
  if (works.length) gsap.set(works, { opacity: 0, y: 50 });
  const workTriggers = !works.length ? [] : ScrollTrigger.batch(works, {
    start: 'top 92%',
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease, stagger: 0.1, overwrite: true }),
    once: true
  });
  let filtered = false;
  document.addEventListener('click', (e) => {   // после фильтра: показать всё сразу (у фильтра своя CSS-анимация) и пересчитать позиции
    if (!e.target.closest('[data-f]')) return;
    if (!filtered) { filtered = true; workTriggers.forEach((t) => t.kill()); gsap.set(works, { clearProps: 'opacity,visibility,transform' }); }
    setTimeout(() => ScrollTrigger.refresh(), 50);
  });

  /* ---------- Тизер коворкинга: переход тушь → янтарь → индиго по скроллу ---------- */
  const teaser = document.querySelector('.teaser');
  if (teaser) {
    gsap.fromTo('.teaser__glow', { scale: 0.55, opacity: 0.2 }, {
      scale: 1.15, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: teaser, start: 'top bottom', end: 'center center', scrub: true }
    });
    gsap.fromTo(teaser, { '--ink-veil': 1 }, {
      '--ink-veil': 0, ease: 'none',
      scrollTrigger: { trigger: teaser, start: 'top 90%', end: 'top 10%', scrub: true }
    });
  }

  /* ---------- Кольцо стерилизации: надпись медленно вращается ---------- */
  const ringTxt = document.querySelector('.steril__txt');
  if (ringTxt) {
    gsap.to(ringTxt, { rotate: 90, svgOrigin: '200 200', ease: 'none', scrollTrigger: { trigger: '.spread--text', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- Курсор «смотреть» над работами ---------- */
  const grid = document.querySelector('[data-works-grid]');
  if (grid && fine) {
    root.classList.add('has-cursor');
    const cur = document.createElement('div');
    cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true'); cur.textContent = 'смотреть';
    document.body.appendChild(cur);
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    grid.addEventListener('pointerover', (e) => { if (e.target.closest('.work__btn')) gsap.to(cur, { scale: 1, duration: 0.35, ease }); });
    grid.addEventListener('pointerout', (e) => {
      const to = e.relatedTarget;
      if (!to || !to.closest || !to.closest('.work__btn')) gsap.to(cur, { scale: 0, duration: 0.3, ease });
    });
    document.addEventListener('site:lock', () => gsap.to(cur, { scale: 0, duration: 0.2 }));
  }

  // фокус с клавиатуры на ещё не проявившийся блок — показать сразу
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest('.work, .qa, .rule, .step, .note, .price-card, .final__grid > *, .supplies__all, .link-big');
    if (el && getComputedStyle(el).opacity !== '1') gsap.to(el, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
