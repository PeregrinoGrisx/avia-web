/* ============================================================
   AVIA — visor 3D de formatos de bandeja
   ------------------------------------------------------------
   Los seis formatos que monta la Boix Quality Q-1530. Todos son
   bandejas: fondo, cuatro paredes bajas y esquinas encoladas.
   Lo que los distingue es cómo resuelven la esquina y el borde
   superior, así que el constructor parte de una bandeja común y
   le suma solo la pieza que corresponde a cada formato.

   Datos y proporciones: ver boxdata.js
   ============================================================ */
(function () {
  'use strict';

  var mount = document.getElementById('box3d');
  if (!mount) return;

  var hint = document.getElementById('box3dHint');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BOXES = window.AVIA_BOXES || {};

  var currentKey = 'c1';
  var app = null;

  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    window.aviaThree().then(start, function () { mount.classList.add('is-failed'); });
  }, { rootMargin: '300px' });
  io.observe(mount);

  document.addEventListener('avia:box', function (e) {
    currentKey = e.detail.key;
    if (app) app.build(currentKey);
  });

  /* ============================================================ */
  function start() {
    if (typeof THREE === 'undefined') { mount.classList.add('is-failed'); return; }

    var W = mount.clientWidth || 360, H = mount.clientHeight || 360;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    camera.position.set(1.75, 1.25, 2.15);
    camera.lookAt(0, 0, 0);

    var hemi = new THREE.HemisphereLight(0xcfe4f7, 0x16222e, 0.30);
    scene.add(hemi);
    var key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(2.6, 4.2, 3.0);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x1DBCB1, 0.70);
    rim.position.set(-3.2, 1.4, -2.6);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xffffff, 0.16);
    fill.position.set(-1.5, 0.6, 2.5);
    scene.add(fill);

    var card = new THREE.MeshStandardMaterial({
      color: 0x8C9195, roughness: 0.90, metalness: 0.0, side: THREE.DoubleSide
    });
    var cardIn = new THREE.MeshStandardMaterial({
      color: 0x6B7175, roughness: 0.93, metalness: 0.0, side: THREE.DoubleSide
    });
    var hole = new THREE.MeshStandardMaterial({ color: 0x101D28, roughness: 1 });
    var edgeMat = new THREE.LineBasicMaterial({ color: 0x3C464D, transparent: true, opacity: 0.8 });

    function syncTheme(mode) {
      var light = mode === 'light';
      hemi.groundColor.setHex(light ? 0xdce6ee : 0x16222e);
      hemi.intensity = light ? 0.62 : 0.30;
      rim.intensity = light ? 0.42 : 0.70;
      card.color.setHex(light ? 0x6E767C : 0x8C9195);
      cardIn.color.setHex(light ? 0x525A60 : 0x6B7175);
    }
    document.addEventListener('avia:theme', function (e) { syncTheme(e.detail.mode); });

    var pivot = new THREE.Group();
    scene.add(pivot);

    var model = null, rawRadius = 1;
    var T = 0.022; // espesor del cartón

    function slab(w, h, d, mat) {
      var g = new THREE.BoxGeometry(w, h, d);
      var m = new THREE.Mesh(g, mat || card);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
      return m;
    }

    /* ---------- Bandeja base + piezas por formato ---------- */
    function buildTray(s) {
      var g = new THREE.Group();
      var w = s.w, d = s.d, h = s.h;

      // Fondo
      var bottom = slab(w, T, d);
      bottom.position.y = T / 2;
      g.add(bottom);

      // Paredes largas (frente y fondo). En columna abierta se acortan
      // para dejar el vértice despejado.
      var longW = s.openColumn ? w - h * 1.2 : w;
      [1, -1].forEach(function (z) {
        var p = slab(longW, h, T);
        p.position.set(0, h / 2, z * (d / 2 - T / 2));
        g.add(p);

        if (s.innerWall) {
          var inner = slab(longW * 0.9, h * 0.78, T, cardIn);
          inner.position.set(0, h * 0.39, z * (d / 2 - T * 2.2));
          g.add(inner);
        }
        if (s.handHoles) {
          var hh = slab(w * 0.13, h * 0.22, T * 3, hole);
          hh.position.set(0, h * 0.62, z * (d / 2 - T / 2));
          g.add(hh);
        }
      });

      // Paredes cortas
      var shortD = s.openColumn ? d - h * 1.2 : d;
      [1, -1].forEach(function (x) {
        var p = slab(T, h, shortD);
        p.position.set(x * (w / 2 - T / 2), h / 2, 0);
        g.add(p);
      });

      // Pestaña perimetral hacia fuera (Plaform)
      if (s.rim) {
        var rw = h * 0.3;
        [1, -1].forEach(function (z) {
          var f = slab(w + rw * 2, T, rw);
          f.position.set(0, h - T / 2, z * (d / 2 + rw / 2));
          g.add(f);
        });
        [1, -1].forEach(function (x) {
          var f = slab(rw, T, d);
          f.position.set(x * (w / 2 + rw / 2), h - T / 2, 0);
          g.add(f);
        });
      }

      // Columnas interiores en las esquinas (P-84)
      if (s.posts) {
        [1, -1].forEach(function (x) {
          [1, -1].forEach(function (z) {
            var post = slab(h * 0.42, h, h * 0.42, cardIn);
            post.position.set(
              x * (w / 2 - h * 0.24),
              h / 2,
              z * (d / 2 - h * 0.24)
            );
            g.add(post);
          });
        });
      }

      // Orejas sobre el borde (Big Ear)
      if (s.ears) {
        var ew = w * 0.17, eh = h * 0.42;
        [1, -1].forEach(function (x) {
          [1, -1].forEach(function (z) {
            var ear = slab(ew, eh, T);
            ear.position.set(x * (w / 2 - ew / 2), h + eh / 2 - T, z * (d / 2 - T / 2));
            g.add(ear);
          });
        });
      }

      return g;
    }

    function fitRadius() {
      var d = camera.position.length();
      var halfH = d * Math.tan((camera.fov / 2) * Math.PI / 180);
      return Math.min(halfH, halfH * camera.aspect) * 0.80;
    }

    function build(k) {
      var box = BOXES[k] || BOXES.c1;
      if (!box) return;

      if (model) pivot.remove(model);
      model = buildTray(box.geo);

      var bb = new THREE.Box3().setFromObject(model);
      var sphere = new THREE.Sphere();
      bb.getBoundingSphere(sphere);
      rawRadius = sphere.radius;
      model.scale.setScalar(fitRadius() / rawRadius);

      bb.setFromObject(model);
      var c = new THREE.Vector3();
      bb.getCenter(c);
      model.position.sub(c);

      pivot.add(model);
      tween = reduced ? 1 : 0;
    }

    /* ---------- Arrastre libre ---------- */
    var rotY = -0.58, rotX = 0.34, targetY = rotY, targetX = rotX;
    var dragging = false, last = null, idle = 0, tween = 1;

    var el = renderer.domElement;
    el.style.touchAction = 'pan-y';
    el.style.cursor = 'grab';

    el.addEventListener('pointerdown', function (e) {
      dragging = true; idle = 0; last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
      mount.closest('.boxes__art').classList.add('is-grabbed');
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      targetY += (e.clientX - last.x) * 0.009;
      targetX += (e.clientY - last.y) * 0.007;
      last = { x: e.clientX, y: e.clientY };
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      el.style.cursor = 'grab';
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    var visible = true;
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(mount);

    function resize() {
      var w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (model) model.scale.setScalar(fitRadius() / rawRadius);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mount);
    else window.addEventListener('resize', resize);

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;

      if (!dragging && !reduced) {
        idle += 1;
        if (idle > 90) targetY += 0.0024;
      }
      rotY += (targetY - rotY) * 0.1;
      rotX += (targetX - rotX) * 0.1;
      pivot.rotation.y = rotY;
      pivot.rotation.x = rotX;

      if (tween < 1) {
        tween = Math.min(1, tween + 0.07);
        var e = 1 - Math.pow(1 - tween, 3);
        pivot.scale.setScalar(0.86 + 0.14 * e);
      } else if (pivot.scale.x !== 1) {
        pivot.scale.setScalar(1);
      }

      renderer.render(scene, camera);
    }

    build(currentKey);
    syncTheme(document.documentElement.getAttribute('data-theme'));
    frame();
    mount.classList.add('is-3d');
    if (hint) hint.classList.add('is-on');

    app = { build: build };
  }
})();
