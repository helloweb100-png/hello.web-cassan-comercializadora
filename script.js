/* ═══════════════════════════════════════════════════════════════════
   CASSAN COMERCIALIZADORA — Interacciones y animaciones
   Vanilla JS, sin dependencias. Respeta prefers-reduced-motion.
   Índice:
   01 Utilidades · 02 Loader · 03 Motor de scroll · 04 Navegación y menú
   05 Revelado y titulares · 06 Contadores · 07 Hero (parallax, partículas, palabras)
   08 Scrollytelling · 09 Catálogo · 10 Calculadora · 11 Extras de UI · 12 FAQ · 13 Formulario
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ───────────── 01 · UTILIDADES ───────────── */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var fmt = function (n) { return Number(n).toLocaleString('es-MX'); };

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 1024px)');

  var WA_NUMBER = '529512282339';
  var waUrl = function (text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); };

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3600);
  }

  /* ───────────── 02 · LOADER ───────────── */
  var readyFired = false;
  function onReady() {
    if (readyFired) return;
    readyFired = true;
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    initCounters();
    initSwap();
    setTimeout(function () {
      var wa = $('.wa');
      if (!wa) return;
      wa.classList.add('is-visible');
      setTimeout(function () { wa.classList.add('is-tip'); }, 4200);
      setTimeout(function () { wa.classList.remove('is-tip'); }, 9800);
    }, 1800);
  }

  (function initLoader() {
    var loader = $('#loader');
    if (!loader || !root.classList.contains('js')) { onReady(); return; }
    if (reduce) {                                          /* movimiento reducido: sin animación, solo un respiro breve */
      var done = function () { loader.style.display = 'none'; onReady(); };
      if (document.readyState === 'complete') { setTimeout(done, 250); } else { window.addEventListener('load', function () { setTimeout(done, 250); }); setTimeout(done, 3000); }
      return;
    }

    var pctEl = $('#ldPct'), bar = $('#ldBar'), msg = $('#ldMsg'), water = $('.loader__water', loader);
    var MIN = reduce ? 500 : 2400;           /* tiempo mínimo para que se aprecie la animación */
    var t0 = performance.now();
    var loaded = document.readyState === 'complete';
    var p = 0, finished = false, lastMsg = -1;
    var msgs = [[0, 'Preparando el agua…'], [30, 'Llenando el tinaco…'], [66, 'Purificando cada gota…'], [93, '¡Listo!']];

    window.addEventListener('load', function () { loaded = true; });
    setTimeout(function () { loaded = true; }, 5500);

    function finish() {
      loader.classList.add('is-done');                       /* cortinas se abren */
      setTimeout(onReady, 620);                               /* el hero entra mientras abre */
      setTimeout(function () { loader.style.display = 'none'; }, 1700);
    }

    function frame(now) {
      var t = now - t0;
      var target = (loaded && t > MIN) ? 100 : Math.min(90, (t / MIN) * 90);
      p += (target - p) * (target === 100 ? 0.12 : 0.06);
      if (target === 100 && p > 99.3) p = 100;

      pctEl.textContent = Math.round(p);
      bar.style.transform = 'scaleX(' + (p / 100).toFixed(4) + ')';
      if (water) water.style.setProperty('--lvl', (p / 100).toFixed(4));

      for (var i = msgs.length - 1; i >= 0; i--) {
        if (p >= msgs[i][0]) { if (lastMsg !== i) { lastMsg = i; msg.textContent = msgs[i][1]; } break; }
      }
      if (p >= 100) {
        if (!finished) { finished = true; setTimeout(finish, 420); }
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }());

  /* ───────────── 03 · MOTOR DE SCROLL (un solo rAF) ───────────── */
  var nav = $('#nav');
  var navProg = $('.nav__progress i');
  var gaugeFill = $('.gauge__tube i');
  var gaugeTxt = $('.gauge span');
  var hero = $('#inicio');
  var heroCopy = $('[data-hero-copy]');
  var heroVisual = $('[data-hero-visual]');
  var marqueeTrack = $('[data-marquee]');
  var ticking = false;
  var lastY = window.scrollY, vel = 0, decaying = false;
  var scrollFns = [];

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function setMarqueeRate(rate) {
    if (!marqueeTrack || !marqueeTrack.getAnimations) return;
    try { marqueeTrack.getAnimations().forEach(function (a) { a.playbackRate = rate; }); } catch (e) { /* noop */ }
  }
  function decay() {
    vel *= 0.9;
    setMarqueeRate(1 + vel * 0.07);
    if (vel > 0.05) { requestAnimationFrame(decay); } else { decaying = false; setMarqueeRate(1); }
  }

  function update() {
    ticking = false;
    var y = window.scrollY;
    var max = root.scrollHeight - window.innerHeight;
    var prog = max > 0 ? clamp(y / max, 0, 1) : 0;

    if (navProg) navProg.style.setProperty('--p', prog.toFixed(4));
    if (gaugeFill) { gaugeFill.style.setProperty('--p', prog.toFixed(4)); gaugeTxt.textContent = Math.round(prog * 100) + '%'; }
    if (nav) nav.classList.toggle('is-stuck', y > 24);

    /* El hero se desvanece y se aleja con suavidad al bajar */
    if (!reduce && hero && y < hero.offsetHeight) {
      var k = clamp(y / hero.offsetHeight, 0, 1);
      if (heroCopy) { heroCopy.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(1) + 'px,0)'; heroCopy.style.opacity = (1 - k * 1.15).toFixed(3); }
      if (heroVisual) heroVisual.style.transform = 'translate3d(0,' + (y * 0.05).toFixed(1) + 'px,0) scale(' + (1 - k * 0.08).toFixed(4) + ')';
    }

    /* El marquee se acelera con la velocidad del scroll */
    if (!reduce) {
      vel = clamp(Math.abs(y - lastY), 0, 70) * 0.5 + vel * 0.5;
      if (!decaying && vel > 0.5) { decaying = true; requestAnimationFrame(decay); }
    }
    lastY = y;

    for (var i = 0; i < scrollFns.length; i++) scrollFns[i](y);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ───────────── 04 · NAVEGACIÓN Y MENÚ ───────────── */
  var burger = $('#burger');
  var menu = $('#menu');
  if (menu) menu.inert = true;

  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-menu', open);
    root.style.overflow = open ? 'hidden' : '';
    if (open) { var first = $('a', menu); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350); }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  desktop.addEventListener ? desktop.addEventListener('change', function (e) { if (e.matches) setMenu(false); }) : null;

  /* Scrollspy: resalta el enlace de la sección visible (y lo apaga en secciones sin enlace) */
  (function initSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav__links a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); });
        var a = map[e.target.id];
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(function (s) { io.observe(s); });
  }());

  /* ───────────── 05 · REVELADO Y TITULARES ───────────── */
  function splitText(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            var wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i++); wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) { walk(ch); }
      });
    }(el));
  }
  $$('[data-split]').forEach(splitText);

  (function initReveal() {
    var els = $$('.rv, [data-split]');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }());

  /* ───────────── 06 · CONTADORES ───────────── */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = prefix + fmt(target) + suffix; return; }
    var dur = 1900, start = null;
    requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);        /* easeOutExpo */
      el.textContent = prefix + fmt(Math.round(target * ease)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    });
  }
  function initCounters() {
    var els = $$('[data-count]');
    /* El HTML trae el valor final (útil sin JS); aquí se reinicia a 0 para animarlo al entrar en pantalla */
    if (!reduce) els.forEach(function (el) { el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || ''); });
    if (!('IntersectionObserver' in window)) { els.forEach(countUp); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ───────────── 07 · HERO ───────────── */

  /* Palabra que rota: "hogar · negocio · familia · tranquilidad" */
  function initSwap() {
    var sw = $('[data-swap]');
    if (!sw || reduce) return;
    var words = sw.dataset.words.split(','), i = 0, b = $('b', sw);
    setInterval(function () {
      i = (i + 1) % words.length;
      b.classList.add('is-out');
      setTimeout(function () {
        b.textContent = words[i];
        b.classList.remove('is-out');
        b.classList.add('is-pre');
        void b.offsetWidth;                                   /* reflow: reinicia la transición */
        b.classList.remove('is-pre');
      }, 520);
    }, 2900);
  }

  /* Parallax por puntero + reflector de luz */
  var pointer = { x: -9999, y: -9999, active: false };
  (function initHeroPointer() {
    if (!hero || !finePointer || reduce) return;
    var layers = $$('[data-depth]', hero);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    function step() {
      cx = lerp(cx, tx, 0.07); cy = lerp(cy, ty, 0.07);
      layers.forEach(function (l) {
        var d = parseFloat(l.dataset.depth);
        l.style.transform = 'translate3d(' + (cx * d * -22).toFixed(2) + 'px,' + (cy * d * -18).toFixed(2) + 'px,0)';
      });
      raf = 0;
      if (Math.abs(cx - tx) > 0.001 || Math.abs(cy - ty) > 0.001) raf = requestAnimationFrame(step);
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx; ty = ny;
      hero.style.setProperty('--mx', ((nx + 0.5) * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((ny + 0.5) * 100).toFixed(1) + '%');
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
      if (!raf) raf = requestAnimationFrame(step);
    });
    hero.addEventListener('pointerleave', function () {
      tx = 0; ty = 0; pointer.active = false;
      if (!raf) raf = requestAnimationFrame(step);
    });
  }());

  /* Partículas: burbujas que suben + red de puntos que reacciona al cursor */
  (function initFx() {
    var c = $('#fx');
    if (!c || !hero) return;
    var ctx = c.getContext('2d');
    var W = 0, H = 0, parts = [], raf = 0, visible = true;
    var small = window.innerWidth < 768;

    function make(initial) {
      var bubble = Math.random() < 0.42;
      return {
        x: rand(0, W), y: initial ? rand(0, H) : H + 20,
        r: bubble ? rand(2, 7) : rand(0.8, 2.1),
        vx: rand(-0.12, 0.12), vy: bubble ? -rand(0.25, 0.75) : rand(-0.12, 0.12),
        a: rand(0.28, 0.8), bubble: bubble, ph: rand(0, 6.28)
      };
    }
    function build() {
      var n = Math.round(clamp((W * H) / 15000, 18, small ? 34 : 72));
      parts = [];
      for (var i = 0; i < n; i++) parts.push(make(true));
    }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var r = c.getBoundingClientRect();
      W = r.width; H = r.height;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduce) draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      var maxD = small ? 90 : 120;

      /* líneas entre puntos cercanos */
      ctx.lineWidth = 1;
      for (i = 0; i < parts.length; i++) {
        a = parts[i]; if (a.bubble) continue;
        for (j = i + 1; j < parts.length; j++) {
          b = parts[j]; if (b.bubble) continue;
          dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          if (d < maxD * maxD) {
            ctx.strokeStyle = 'rgba(95,240,208,' + (0.2 * (1 - Math.sqrt(d) / maxD)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (pointer.active) {                                 /* hilos hacia el cursor */
          dx = a.x - pointer.x; dy = a.y - pointer.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 170) {
            ctx.strokeStyle = 'rgba(57,185,242,' + (0.32 * (1 - d / 170)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
          }
        }
      }

      for (i = 0; i < parts.length; i++) {
        a = parts[i];
        if (!reduce) {
          a.ph += 0.02;
          a.x += a.vx + (a.bubble ? Math.sin(a.ph) * 0.28 : 0);
          a.y += a.vy;
          if (pointer.active) {                               /* repulsión suave */
            dx = a.x - pointer.x; dy = a.y - pointer.y; d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110 && d > 0.1) { a.x += (dx / d) * (110 - d) * 0.025; a.y += (dy / d) * (110 - d) * 0.025; }
          }
          if (a.bubble && a.y < -20) { parts[i] = make(false); continue; }
          if (a.x < -10) a.x = W + 10; else if (a.x > W + 10) a.x = -10;
          if (!a.bubble) { if (a.y < -10) a.y = H + 10; else if (a.y > H + 10) a.y = -10; }
        }
        if (a.bubble) {
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832);
          ctx.strokeStyle = 'rgba(179,222,208,' + a.a.toFixed(2) + ')'; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(a.x - a.r * 0.3, a.y - a.r * 0.3, a.r * 0.28, 0, 6.2832);
          ctx.fillStyle = 'rgba(255,255,255,' + (a.a * 0.7).toFixed(2) + ')'; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832);
          ctx.fillStyle = 'rgba(95,240,208,' + a.a.toFixed(2) + ')'; ctx.fill();
        }
      }
    }

    function loop(t) {
      draw(t);
      raf = (visible && !document.hidden) ? requestAnimationFrame(loop) : 0;
    }
    function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

    resize();
    window.addEventListener('resize', function () { small = window.innerWidth < 768; resize(); }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    start();
  }());

  /* ───────────── 08 · SCROLLYTELLING ───────────── */
  (function initStory() {
    var track = $('[data-story]');
    if (!track) return;
    var panels = $$('[data-story-panel]', track);
    var scenes = $$('.stage__scene', track);
    var dots = $$('.story__dots li', track);
    var cap = $('[data-stage-cap]', track);
    var caps = ['01 · ALMACENAMIENTO · 200–10,000 L', '02 · ENERGÍA SOLAR · 8–15 TUBOS', '03 · SANEAMIENTO Y TRANSPORTE', '04 · BASES · BAÑO · COCINA'];
    var cur = 0;

    function set(i) {
      if (i === cur) return;
      cur = i;
      panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
      scenes.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
      if (cap) cap.textContent = caps[i];
    }
    scrollFns.push(function () {
      if (!desktop.matches) return;
      var r = track.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      if (total <= 0) return;
      var p = clamp(-r.top / total, 0, 1);
      set(Math.min(panels.length - 1, Math.floor(p * panels.length)));
    });
  }());

  /* ───────────── 09 · CATÁLOGO ───────────── */
  (function initCatalog() {
    var grid = $('[data-pgrid]');
    if (!grid) return;
    var cards = $$('.pcard', grid);
    var tabs = $$('.tab');
    var countEl = $('[data-cat-count]');

    /* Filtros por categoría */
    function applyFilter(cat) {
      var n = 0;
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.cat === cat)); });
      cards.forEach(function (c) {
        var show = cat === 'all' || c.dataset.cat === cat;
        c.classList.toggle('is-hidden', !show);
        c.classList.remove('is-in');
        if (show) { c.style.setProperty('--d', n % 3); n++; }
      });
      if (countEl) countEl.textContent = n;
      void grid.offsetWidth;
      requestAnimationFrame(function () {
        cards.forEach(function (c) { if (!c.classList.contains('is-hidden')) c.classList.add('is-in'); });
      });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { applyFilter(t.dataset.cat); }); });

    $$('[data-filter-link]').forEach(function (el) {
      el.addEventListener('click', function () {
        applyFilter(el.dataset.filterLink);
        if (el.tagName === 'BUTTON') {
          var sec = document.getElementById('catalogo');
          if (sec) sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });

    /* Tarjetas: selector de medida + inclinación 3D */
    var preloaded = {};
    function preload(src) { if (!preloaded[src]) { var im = new Image(); im.src = src; preloaded[src] = im; } return preloaded[src]; }

    cards.forEach(function (card) {
      var chips = $$('.vchip', card);
      /* Selectores por clase: los chips comparten data-img / data-big / data-specs / data-colors con estos nodos */
      var img = $('.pcard__img', card), big = $('.pcard__big', card), specs = $('.specs', card);
      var colors = $('.pcolors__list', card), brand = $('.pcard__brand', card), quote = $('a[data-quote]', card);
      var stage = $('.pcard__stage', card);

      function select(chip) {
        if (chip.getAttribute('aria-pressed') === 'true') return;
        var d = chip.dataset;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        img.classList.add('is-swap'); big.classList.add('is-swap'); specs.classList.add('is-swap');
        var pre = preload(d.img);
        var ready = pre.decode ? pre.decode().catch(function () {}) : Promise.resolve();
        var wait = new Promise(function (r) { setTimeout(r, 230); });
        Promise.all([ready, wait]).then(function () {
          img.src = d.img; img.alt = d.alt; img.width = +d.w; img.height = +d.h;
          img.style.setProperty('--sc', d.sc);
          big.textContent = d.big;
          specs.replaceChildren.apply(specs, JSON.parse(d.specs).map(function (kv) {
            var div = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
            dt.textContent = kv[0]; dd.textContent = kv[1]; div.appendChild(dt); div.appendChild(dd); return div;
          }));
          colors.replaceChildren.apply(colors, JSON.parse(d.colors).map(function (c) {
            var i = document.createElement('i'); i.style.setProperty('--c', c[0]); i.title = c[1]; return i;
          }));
          if (brand) brand.textContent = d.brand;
          img.classList.remove('is-swap'); big.classList.remove('is-swap'); specs.classList.remove('is-swap');
        });
        if (quote) quote.href = waUrl('Hola Cassan Comercializadora, estoy listo para cotizar: ' + d.name + '. ¿Me comparten precio y disponibilidad?');
      }
      chips.forEach(function (chip) {
        chip.addEventListener('pointerenter', function () { preload(chip.dataset.img); });
        chip.addEventListener('focus', function () { preload(chip.dataset.img); });
        chip.addEventListener('click', function () { select(chip); });
      });

      if (finePointer && !reduce && stage) {
        stage.addEventListener('pointermove', function (e) {
          var r = stage.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          stage.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 9).toFixed(2) + 'deg)';
          stage.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
          stage.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
          stage.classList.add('is-tilt');
        });
        stage.addEventListener('pointerleave', function () { stage.style.transform = ''; stage.classList.remove('is-tilt'); });
      }
    });
  }());

  /* ───────────── 10 · CALCULADORA DE CAPACIDAD ───────────── */
  (function initCalc() {
    var form = $('#calcForm');
    if (!form) return;
    var people = $('#people'), peopleOut = $('#peopleOut'), needOut = $('#needOut');
    var water = $('#calcWater'), pctOut = $('#pctOut');
    var title = $('#recTitle'), dims = $('#recDims'), img = $('#recImg'), note = $('#recNote'), cta = $('#recCta');
    var ctaLabel = $('span', cta);

    /* La lista de equipos sale del propio catálogo: una sola fuente de verdad */
    function collect(family, filter) {
      var card = $('.pcard[data-family="' + family + '"]');
      if (!card) return [];
      return $$('.vchip', card).filter(filter || function () { return true; }).map(function (ch) {
        var specs = JSON.parse(ch.dataset.specs), s = {};
        specs.forEach(function (kv) { s[kv[0]] = kv[1]; });
        return {
          cap: parseInt(ch.dataset.big.replace(/\D/g, ''), 10), name: ch.dataset.name, img: ch.dataset.img,
          w: +ch.dataset.w, h: +ch.dataset.h, alt: ch.dataset.alt, alto: s['Altura'], diam: s['Diámetro']
        };
      });
    }
    var list = collect('tambos')
      .concat(collect('tricapa', function (ch) { return !/negro/i.test(ch.textContent); }))
      .concat(collect('cisternas', function (ch) { return /10,000/.test(ch.dataset.big); }))
      .sort(function (a, b) { return a.cap - b.cap; });
    if (!list.length) return;

    var shownPct = 0, pctRaf = 0;
    function animatePct(to) {
      cancelAnimationFrame(pctRaf);
      var from = shownPct, t0 = null;
      pctRaf = requestAnimationFrame(function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 700, 1), e = 1 - Math.pow(1 - p, 3);
        shownPct = Math.round(from + (to - from) * e);
        pctOut.textContent = shownPct;
        if (p < 1) pctRaf = requestAnimationFrame(step);
      });
    }

    function update() {
      var n = parseInt(people.value, 10);
      var days = parseInt($('input[name="days"]:checked', form).value, 10);
      var need = n * 150 * days;
      peopleOut.textContent = n;
      needOut.textContent = fmt(need) + ' L';
      people.style.setProperty('--fill', (((n - 1) / (people.max - 1)) * 100).toFixed(1) + '%');

      var rec = null, qty = 1;
      /* Recomienda el primer equipo que cubra el consumo con al menos 5 % de holgura */
      for (var i = 0; i < list.length; i++) { if (list[i].cap >= need * 1.05) { rec = list[i]; break; } }
      if (!rec) { rec = list[list.length - 1]; qty = Math.ceil((need * 1.05) / rec.cap); }
      var total = rec.cap * qty;
      var occ = clamp(need / total, 0, 1);

      water.style.setProperty('--lvl', occ.toFixed(3));
      animatePct(Math.round(occ * 100));

      var kind = /^Cisterna/.test(rec.name) ? 'esta cisterna' : (/^Tambo/.test(rec.name) ? 'este tambo' : 'este tinaco');
      var recName = qty > 1 ? qty + ' × ' + rec.name : rec.name;
      title.textContent = recName;
      dims.textContent = (rec.alto && rec.alto !== 'Consultar') ? 'Altura ' + rec.alto + ' · Diámetro ' + rec.diam : 'Medidas: consúltalas con un asesor';
      note.textContent = qty > 1
        ? 'Tu consumo supera una sola unidad: te sugerimos ' + qty + ' equipos para cubrir ' + fmt(need) + ' L. Un asesor te ayuda a combinarlos.'
        : 'Cubre ' + n + (n === 1 ? ' persona' : ' personas') + ' con ' + days + (days === 1 ? ' día' : ' días') + ' de reserva' +
          (total / need <= 1.4 ? ' y te deja un margen de ' + Math.round((total - need) / need * 100) + '%.'
                               : ': es el equipo más cercano a tu consumo y te deja espacio de sobra por si tu familia o negocio crece.');
      ctaLabel.textContent = 'Sí, quiero ' + kind;
      cta.href = waUrl('Hola Cassan Comercializadora, estoy listo: somos ' + n + (n === 1 ? ' persona' : ' personas') + ' y quiero ' + days + (days === 1 ? ' día' : ' días') + ' de reserva (≈ ' + fmt(need) + ' L). Me interesa: ' + recName + '. ¿Me ayudan a cotizarlo?');

      if (img.getAttribute('src') !== rec.img) {
        img.classList.add('is-swap');
        setTimeout(function () {
          img.src = rec.img; img.alt = rec.alt; img.width = rec.w; img.height = rec.h;
          img.classList.remove('is-swap');
        }, 220);
      }
    }
    people.addEventListener('input', update);
    $$('input[name="days"]', form).forEach(function (r) { r.addEventListener('change', update); });

    /* La primera vez que se ve, el tanque se llena desde cero */
    update();
    if ('IntersectionObserver' in window && !reduce) {
      water.style.setProperty('--lvl', '0'); shownPct = 0; pctOut.textContent = '0';
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { update(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe($('.calc__result'));
    }
  }());

  /* ───────────── 11 · EXTRAS DE UI ───────────── */

  /* Proceso: línea que se llena con el scroll y enciende cada paso */
  (function initSteps() {
    var wrap = $('[data-steps]');
    if (!wrap) return;
    var fill = $('[data-steps-fill]', wrap);
    var steps = $$('.step', wrap);
    scrollFns.push(function () {
      var r = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var horizontal = window.innerWidth >= 900;
      var p = horizontal ? clamp((vh * 0.78 - r.top) / (r.height * 0.9), 0, 1) : clamp((vh * 0.6 - r.top - 28) / (r.height - 56), 0, 1);
      fill.style.setProperty('--p', p.toFixed(4));
      steps.forEach(function (s, i) { s.classList.toggle('is-lit', p >= i / (steps.length - 1) - 0.02); });
    });
  }());

  /* Parallax suave en las mascotas */
  (function initParallax() {
    if (reduce) return;
    var els = $$('[data-parallax]');
    if (!els.length) return;
    scrollFns.push(function () {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
    });
  }());

  /* Tarjetas bento: reflector que sigue al cursor */
  (function initSpot() {
    if (!finePointer) return;
    $$('[data-spot]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }());

  /* Botones magnéticos */
  (function initMagnetic() {
    if (!finePointer || reduce) return;
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = clamp((e.clientX - (r.left + r.width / 2)) * 0.22, -9, 9);
        var y = clamp((e.clientY - (r.top + r.height / 2)) * 0.32, -7, 7);
        el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }());

  /* ───────────── 12 · FAQ ───────────── */
  (function initFaq() {
    var wrap = $('[data-faq]');
    if (!wrap) return;
    var items = $$('.faq__item', wrap);
    items.forEach(function (item) {
      var btn = $('button', item);
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        items.forEach(function (i) { i.classList.remove('is-open'); $('button', i).setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
  }());

  /* ───────────── 13 · FORMULARIO → WHATSAPP ───────────── */
  (function initForm() {
    var form = $('#leadForm');
    if (!form) return;
    var btn = $('#formBtn');
    var label = $('span', btn);
    var original = label.textContent;

    function setErr(id, msg) {
      var input = document.getElementById(id);
      var group = input.closest('.fgroup');
      var err = $('.ferr', group);
      err.textContent = msg;
      group.classList.toggle('is-invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    ['f-name', 'f-phone', 'f-need'].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('input', function () { if (el.closest('.fgroup').classList.contains('is-invalid')) setErr(id, ''); });
      el.addEventListener('change', function () { if (el.closest('.fgroup').classList.contains('is-invalid')) setErr(id, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.nombre.value.trim();
      var phoneRaw = form.telefono.value.trim();
      var phone = phoneRaw.replace(/\D/g, '');
      var need = form.interes.value;
      var msg = form.mensaje.value.trim();

      var ok1 = setErr('f-name', name.length < 2 ? 'Escribe tu nombre para saber cómo llamarte.' : '');
      var ok2 = setErr('f-phone', phone.length < 10 ? 'Escribe un número de 10 dígitos para poder responderte.' : '');
      var ok3 = setErr('f-need', !need ? 'Elige qué necesitas para orientarte mejor.' : '');
      if (!(ok1 && ok2 && ok3)) {
        var firstBad = $('.fgroup.is-invalid input, .fgroup.is-invalid select', form);
        if (firstBad) firstBad.focus();
        return;
      }

      var text = 'Hola Cassan Comercializadora, estoy listo para cotizar.\n\n' +
        '• Nombre: ' + name + '\n' +
        '• WhatsApp / teléfono: ' + phoneRaw + '\n' +
        '• Necesito: ' + need + '\n' +
        (msg ? '• Detalles: ' + msg + '\n' : '') +
        '\n¿Me pueden ayudar? Gracias.';

      btn.classList.add('is-sent');
      label.textContent = '¡Listo! Abriendo WhatsApp…';
      toast('Tu mensaje ya está listo en WhatsApp 💬');
      window.open(waUrl(text), '_blank', 'noopener,noreferrer');
      setTimeout(function () { btn.classList.remove('is-sent'); label.textContent = original; }, 4500);
    });
  }());

  /* Primer cálculo del scroll al cargar */
  update();
}());
