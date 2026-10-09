/* ============================================================
   AVIA — interacciones
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ============================================================
     Formatos de caja — selector interactivo
     ============================================================ */
  var BOXES = {
    rsc: {
      kicker: 'Formato estándar',
      title: 'Caja americana (RSC)',
      desc: 'El formato de mayor uso en exportación y distribución. Cuatro solapas superiores e inferiores que se unen al centro, con buen comportamiento de apilado.',
      use: 'Fruta de exportación, alimentos, distribución general',
      eq: 'Armadora de fondo + sellado con cinta o cola',
      close: 'Cinta adhesiva, cola caliente o grapa',
      rate: 'Hasta 15 cajas/min según formato',
      dims: 'Largo × Ancho × Alto · solapas iguales',
      draw: function () {
        return '' +
          '<path d="M70 150 L160 196 L250 150 L160 104 Z"/>' +
          '<path d="M70 150 V88 L160 42 L250 88 V150"/>' +
          '<path d="M160 104 V42"/>' +
          '<path d="M70 88 L160 134 L250 88" stroke-opacity=".45"/>' +
          '<path d="M160 134 V196" stroke-opacity=".45"/>' +
          '<path d="M78 72 L160 30 L242 72" stroke-opacity=".6" stroke-dasharray="5 5"/>';
      }
    },
    tray: {
      kicker: 'Formato bajo',
      title: 'Bandeja / Tray',
      desc: 'Caja de baja altura, abierta o con tapa separada. Muy usada en agroindustria para fruta de calibre y en retail para exhibición directa en góndola.',
      use: 'Fruta fresca, berries, hortalizas, retail ready',
      eq: 'Formadora de bandejas con pegado de esquinas',
      close: 'Esquinas pegadas o grapadas, sin tapa',
      rate: 'Hasta 25 bandejas/min según formato',
      dims: 'Altura baja · esquinas pegadas',
      draw: function () {
        return '' +
          '<path d="M60 160 L160 208 L260 160 L160 112 Z"/>' +
          '<path d="M60 160 V122 L160 74 L260 122 V160"/>' +
          '<path d="M160 112 V74"/>' +
          '<path d="M76 114 L160 72 L244 114" stroke-opacity=".45"/>' +
          '<path d="M86 100 L160 64 L234 100" stroke-opacity=".5" stroke-dasharray="5 5"/>';
      }
    },
    die: {
      kicker: 'Formato especial',
      title: 'Caja troquelada',
      desc: 'Corte a medida para productos con requerimientos específicos de ventilación, encaje o presentación. Permite geometrías que la caja estándar no resuelve.',
      use: 'Productos de alto valor, formatos con ventilación',
      eq: 'Formadora configurada para troquel específico',
      close: 'Autoarmable, encaje o pegado según diseño',
      rate: 'Variable según complejidad del troquel',
      dims: 'Geometría a medida · troquel propio',
      draw: function () {
        return '' +
          '<path d="M70 158 L160 202 L250 158 L160 114 Z"/>' +
          '<path d="M70 158 V96 L160 52 L250 96 V158"/>' +
          '<path d="M160 114 V52"/>' +
          '<path d="M96 124 h26 v-16 h-26 z" stroke-opacity=".7"/>' +
          '<path d="M198 124 h26 v-16 h-26 z" stroke-opacity=".7"/>' +
          '<path d="M120 86 L160 64 L200 86" stroke-opacity=".5" stroke-dasharray="4 4"/>';
      }
    },
    lid: {
      kicker: 'Formato con tapa',
      title: 'Caja con tapa independiente',
      desc: 'Base y tapa separadas, ideal cuando el producto se inspecciona o se repone en destino. Buena resistencia al apilado y presentación cuidada.',
      use: 'Exportación de calibre, productos premium',
      eq: 'Formadora de base + formadora de tapa',
      close: 'Tapa telescópica, sin cinta visible',
      rate: 'Hasta 12 sets/min según formato',
      dims: 'Base + tapa telescópica',
      draw: function () {
        return '' +
          '<path d="M70 170 L160 214 L250 170 L160 126 Z"/>' +
          '<path d="M70 170 V126 L160 82 L250 126 V170"/>' +
          '<path d="M160 126 V82"/>' +
          '<path d="M64 76 L160 30 L256 76 L160 122 Z" stroke-opacity=".6"/>' +
          '<path d="M64 76 V60 M256 76 V60 M160 122 V106" stroke-opacity=".6"/>';
      }
    },
    display: {
      kicker: 'Punto de venta',
      title: 'Caja display',
      desc: 'Caja preparada para abrirse en sala y funcionar como exhibidor. Reduce la manipulación en tienda y mejora la rotación del producto.',
      use: 'Retail, promociones, productos de alta rotación',
      eq: 'Formadora con módulo de pre-corte',
      close: 'Pre-corte perimetral, apertura sin herramienta',
      rate: 'Hasta 18 cajas/min según formato',
      dims: 'Pre-corte de apertura · frente abatible',
      draw: function () {
        return '' +
          '<path d="M70 164 L160 208 L250 164 L160 120 Z"/>' +
          '<path d="M70 164 V102 L160 58 L250 102 V164"/>' +
          '<path d="M160 120 V58"/>' +
          '<path d="M70 132 L160 176 L250 132" stroke-opacity=".8" stroke-dasharray="6 5"/>' +
          '<path d="M100 150 L160 180 L220 150" stroke-opacity=".45"/>';
      }
    }
  };

  var shape = document.getElementById('boxShape');
  var svg = document.getElementById('boxsvg');
  var tabs = document.querySelectorAll('.boxtab');

  function setBox(key) {
    var b = BOXES[key];
    if (!b) return;
    document.getElementById('boxKicker').textContent = b.kicker;
    document.getElementById('boxTitle').textContent = b.title;
    document.getElementById('boxDesc').textContent = b.desc;
    document.getElementById('boxUse').textContent = b.use;
    document.getElementById('boxEq').textContent = b.eq;
    document.getElementById('boxClose').textContent = b.close;
    document.getElementById('boxRate').textContent = b.rate;
    document.getElementById('boxDims').textContent = b.dims;
    shape.innerHTML = b.draw();
    if (!reduced) {
      svg.classList.remove('is-drawing');
      void svg.offsetWidth;
      svg.classList.add('is-drawing');
    }

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
  setBox('rsc');

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
