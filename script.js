/* ============================================================
   AVIA — interacciones
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Carga única de Three.js
     ------------------------------------------------------------
     Los dos visores 3D la pedían por su cuenta y la librería se
     descargaba dos veces ("Multiple instances of Three.js").
     Ahora comparten una sola promesa: el primero que la pide la
     dispara, el segundo se cuelga de la misma.
     ============================================================ */
  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var threePromise = null;

  window.aviaThree = function () {
    if (threePromise) return threePromise;
    threePromise = new Promise(function (resolve, reject) {
      if (typeof window.THREE !== 'undefined') return resolve(window.THREE);
      var s = document.createElement('script');
      s.src = THREE_URL;
      s.async = true;
      s.onload = function () {
        if (typeof window.THREE === 'undefined') reject(new Error('THREE ausente'));
        else resolve(window.THREE);
      };
      s.onerror = function () { reject(new Error('No se pudo cargar Three.js')); };
      document.head.appendChild(s);
    });
    return threePromise;
  };

  /* ============================================================
     Tema claro / oscuro
     ------------------------------------------------------------
     Por defecto oscuro: es el look principal de la marca, no una
     preferencia del sistema. La elección del visitante se recuerda.
     ============================================================ */
  var THEME_KEY = 'avia-theme';
  var themeBtns = document.querySelectorAll('[data-set-theme]');

  function readTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    themeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setTheme === mode));
    });
    document.dispatchEvent(new CustomEvent('avia:theme', { detail: { mode: mode } }));
  }
  function setTheme(mode) {
    applyTheme(mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }

  applyTheme(readTheme() === 'light' ? 'light' : 'dark');
  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () { setTheme(b.dataset.setTheme); });
  });

  /* ---------- Año footer ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Nav sticky ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobilemenu');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      burger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  });

  /* ---------- Reveal al hacer scroll ---------- */
  var revealables = document.querySelectorAll('.reveal, .step');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Contadores KPI ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var dur = 1200, t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCounter(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Nav activo por sección ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* El catálogo de formatos vive en boxdata.js, compartido con el visor 3D */
  var BOXES = window.AVIA_BOXES || {};

  var tabs = document.querySelectorAll('.boxtab');

  function setBox(key) {
    var b = BOXES[key];
    if (!b) return;
    document.getElementById('boxKicker').textContent = b.kicker;
    document.getElementById('boxTitle').textContent = b.title;
    document.getElementById('boxDesc').textContent = b.desc;
    document.getElementById('boxUse').textContent = b.use;
    document.getElementById('boxStruct').textContent = b.struct;
    document.getElementById('boxEq').textContent = (window.AVIA_MACHINE || {}).name || '—';
    document.getElementById('boxRate').textContent = b.rate;
    document.getElementById('boxDims').textContent = b.dims;

    // El visor 3D escucha este evento (box3d.js)
    document.dispatchEvent(new CustomEvent('avia:box', { detail: { key: key } }));
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      setBox(tab.dataset.box);
    });
  });
  setBox('c1');

  /* ============================================================
     Formulario de contacto (demo — falta conectar al backend)
     ============================================================ */
  var form = document.getElementById('contactForm');
  var ok = document.getElementById('formOk');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    form.querySelectorAll('[required]').forEach(function (input) {
      var field = input.closest('.field');
      var good = input.checkValidity() && input.value.trim() !== '';
      field.classList.toggle('is-error', !good);
      if (!good && valid) { input.focus(); valid = false; }
    });

    if (!valid) return;

    // TODO: conectar a backend / servicio de envío (Formspree, API propia, etc.)
    ok.hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
    form.querySelector('button[type="submit"]').textContent = 'Solicitud enviada';
  });

  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field');
    if (field) field.classList.remove('is-error');
  });
})();
