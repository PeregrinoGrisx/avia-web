/* ============================================================
   AVIA — visor 3D de formatos de caja
   ------------------------------------------------------------
   Three.js r128 (UMD, global THREE), cargado bajo demanda
   cuando la sección entra en pantalla.

   ⚠️ GEOMETRÍAS PROVISIONALES
   Los formatos y sus proporciones son referencias genéricas de
   la industria, NO datos de AVIA. Reemplazar en cuanto el
   cliente confirme su catálogo real. Ver README.
   ============================================================ */
(function () {
  'use strict';

  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  var mount = document.getElementById('box3d');
  if (!mount) return;

  var hint = document.getElementById('box3dHint');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var currentKey = 'rsc';
  var app = null;

  /* ---------- Catálogo de geometrías (provisional) ----------
     x = ancho, y = alto, z = fondo. Unidades relativas.        */
  var GEOM = {
    rsc:     { x: 1.00, y: 0.66, z: 0.72, top: 'flaps' },
    tray:    { x: 1.00, y: 0.26, z: 0.76, top: 'open'  },
    die:     { x: 1.00, y: 0.60, z: 0.70, top: 'flaps', vents: true },
    lid:     { x: 1.00, y: 0.50, z: 0.72, top: 'lid'   },
    display: { x: 1.00, y: 0.62, z: 0.70, top: 'open', frontCut: 0.38 }
  };

  /* ---------- Carga diferida ---------- */
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    var s = document.createElement('script');
    s.src = THREE_URL;
    s.async = true;
    s.onload = start;
    s.onerror = function () { mount.classList.add('is-failed'); };
    document.head.appendChild(s);
  }, { rootMargin: '300px' });
  io.observe(mount);

  /* ---------- Cambio de formato desde las pestañas ---------- */
  document.addEventListener('avia:box', function (e) {
    currentKey = e.detail.key;
    if (app) app.build(currentKey);
  });

  /* ============================================================
     Escena
     ============================================================ */
  function start() {
    if (typeof THREE === 'undefined') { mount.classList.add('is-failed'); return; }

    var W = mount.clientWidth || 360;
    var H = mount.clientHeight || 360;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    camera.position.set(1.75, 1.25, 2.15);
    camera.lookAt(0, 0, 0);

    // Radio que cabe en cuadro con margen, para cualquier giro.
    // Se recalcula al redimensionar porque depende del aspect.
    function fitRadius() {
      var d = camera.position.length();
      var halfH = d * Math.tan((camera.fov / 2) * Math.PI / 180);
      var halfW = halfH * camera.aspect;
      return Math.min(halfH, halfW) * 0.80;
    }

    /* ---------- Luces ---------- */
    scene.add(new THREE.HemisphereLight(0xcfe4f7, 0x16222e, 0.30));

    var key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(2.6, 4.2, 3.0);
    scene.add(key);

    // Luz de contra en azul de marca: da el acento tecnológico
    var rim = new THREE.DirectionalLight(0x58A6DE, 0.70);
    rim.position.set(-3.2, 1.4, -2.6);
    scene.add(rim);

    var fill = new THREE.DirectionalLight(0xffffff, 0.16);
    fill.position.set(-1.5, 0.6, 2.5);
    scene.add(fill);

    /* ---------- Materiales ----------
       Gris neutro, no kraft: el cartón café competía con el azul
       de marca. Para volver al kraft: 0xA87F54 / 0x8A6742.        */
    var cardboard = new THREE.MeshStandardMaterial({
      color: 0x8C9195, roughness: 0.90, metalness: 0.0
    });
    var cardboardIn = new THREE.MeshStandardMaterial({
      color: 0x6B7175, roughness: 0.93, metalness: 0.0
    });
    var cut = new THREE.MeshStandardMaterial({
      color: 0x101D28, roughness: 1.0, metalness: 0.0
    });

    var pivot = new THREE.Group();
    scene.add(pivot);

    var model = null;
    var rawRadius = 1;
    var T = 0.028; // espesor del cartón

    /* ---------- Constructor de cajas ---------- */
    function slab(w, h, d, mat) {
      return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || cardboard);
    }

    function buildBox(spec) {
      var g = new THREE.Group();
      var x = spec.x, y = spec.y, z = spec.z;

      // Fondo
      var bottom = slab(x, T, z);
      bottom.position.y = -y / 2 + T / 2;
      g.add(bottom);

      // Paredes laterales (eje X)
      [-1, 1].forEach(function (s) {
        var w = slab(T, y - T, z);
        w.position.set(s * (x / 2 - T / 2), T / 2, 0);
        g.add(w);
      });

      // Pared trasera
      var back = slab(x - 2 * T, y - T, T);
      back.position.set(0, T / 2, -(z / 2 - T / 2));
      g.add(back);

      // Pared frontal — recortada en el formato display
      var frontH = spec.frontCut ? (y - T) * spec.frontCut : y - T;
      var front = slab(x - 2 * T, frontH, T);
      front.position.set(0, -y / 2 + T + frontH / 2, z / 2 - T / 2);
      g.add(front);

      // Tapa
      if (spec.top === 'flaps') {
        // Dos solapas que se juntan al centro, con la junta visible
        [-1, 1].forEach(function (s) {
          var gap = 0.006;
          var f = slab(x, T, z / 2 - gap);
          f.position.set(0, y / 2 - T / 2, s * (z / 4 + gap / 2));
          g.add(f);
        });
      } else if (spec.top === 'lid') {
        // Tapa telescópica independiente, apoyada sobre la base
        var lid = new THREE.Group();
        var over = 0.022, skirt = y * 0.34;
        var lx = x + over, lz = z + over;

        var cap = slab(lx, T, lz);
        cap.position.y = skirt / 2;
        lid.add(cap);

        [-1, 1].forEach(function (s) {
          var w = slab(T, skirt, lz);
          w.position.set(s * (lx / 2 - T / 2), 0, 0);
          lid.add(w);
        });
        [-1, 1].forEach(function (s) {
          var w = slab(lx - 2 * T, skirt, T);
          w.position.set(0, 0, s * (lz / 2 - T / 2));
          lid.add(w);
        });

        lid.position.y = y / 2 + skirt / 2 - T;
        lid.name = 'lid';
        g.add(lid);
      }

      // Perforaciones de ventilación / asas
      if (spec.vents) {
        var vw = x * 0.17, vh = y * 0.20;
        [-1, 1].forEach(function (sz) {
          [-1, 1].forEach(function (sx) {
            var hole = slab(vw, vh, T * 2.2, cut);
            hole.position.set(sx * x * 0.22, T, sz * (z / 2 - T / 2));
            g.add(hole);
          });
        });
        [-1, 1].forEach(function (sx) {
          var hole = slab(T * 2.2, vh * 0.8, z * 0.22, cut);
          hole.position.set(sx * (x / 2 - T / 2), T, 0);
          g.add(hole);
        });
      }

      // Interior visible en formatos abiertos
      if (spec.top === 'open') {
        var inner = slab(x - 2 * T - 0.004, 0.004, z - 2 * T - 0.004, cardboardIn);
        inner.position.y = -y / 2 + T + 0.003;
        g.add(inner);
      }

      return g;
    }

    /* ---------- Montaje / cambio de formato ---------- */
    var tween = { v: 1 };

    function build(k) {
      var spec = GEOM[k] || GEOM.rsc;

      if (model) pivot.remove(model);
      model = buildBox(spec);

      // Escala contra la ESFERA envolvente, no contra el ancho: así la
      // caja cabe en cuadro en cualquier ángulo de giro y nunca se corta.
      var box = new THREE.Box3().setFromObject(model);
      var sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      rawRadius = sphere.radius;
      model.scale.setScalar(fitRadius() / rawRadius);

      // Centra el modelo para que gire sobre sí mismo
      box.setFromObject(model);
      var center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      pivot.add(model);
      tween.v = reduced ? 1 : 0; // animación de entrada
    }

    /* ---------- Interacción: arrastrar para girar ---------- */
    var rotY = -0.58, rotX = 0.22;
    var targetY = rotY, targetX = rotX;
    var dragging = false, last = null, idle = 0;

    var el = renderer.domElement;
    el.style.touchAction = 'pan-y';

    el.addEventListener('pointerdown', function (e) {
      dragging = true; idle = 0; last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
      mount.classList.add('is-grabbed');
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      // Giro libre en los dos ejes, sin tope: 360° completos
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
    el.style.cursor = 'grab';

    /* ---------- Pausa fuera de pantalla ---------- */
    var visible = true;
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; })
      .observe(mount);

    /* ---------- Resize ---------- */
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

    /* ---------- Bucle ---------- */
    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;

      if (!dragging && !reduced) {
        idle += 1;
        if (idle > 90) targetY += 0.0024; // giro lento al quedar quieto
      }

      rotY += (targetY - rotY) * 0.1;
      rotX += (targetX - rotX) * 0.1;
      pivot.rotation.y = rotY;
      pivot.rotation.x = rotX;

      if (tween.v < 1) {
        tween.v = Math.min(1, tween.v + 0.07);
        var e = 1 - Math.pow(1 - tween.v, 3);
        pivot.scale.setScalar(0.86 + 0.14 * e);
      } else if (pivot.scale.x !== 1) {
        pivot.scale.setScalar(1);
      }

      renderer.render(scene, camera);
    }

    build(currentKey);
    frame();
    mount.classList.add('is-3d');
    if (hint) hint.classList.add('is-on');

    app = { build: build };
  }
})();
