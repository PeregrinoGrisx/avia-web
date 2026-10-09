/* ============================================================
   AVIA — armado de caja guiado por scroll
   ------------------------------------------------------------
   La caja se construye desde la plancha plana: se levantan las
   cuatro paredes, se pliegan las solapas menores y después las
   mayores. El avance lo manda el scroll, así que subir deshace
   el armado y bajar lo completa.

   Cada panel cuelga de un grupo colocado en su línea de plegado,
   de modo que rota sobre el pliegue y no sobre su centro. Las
   solapas son hijas de su pared, así que acompañan el movimiento
   sin cálculos extra.

   ⚠️ Geometría provisional: formato RSC genérico. Reemplazar por
   el troquel real de AVIA cuando el cliente lo confirme.
   ============================================================ */
(function () {
  'use strict';

  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  var mount = document.getElementById('foldbox');
  var section = document.getElementById('armado');
  if (!mount || !section) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Etapas ---------- */
  /* Los cortes van alineados con los tramos de applyFold(): el rótulo
     tiene que cambiar cuando empieza el movimiento, no cuando termina. */
  var STAGES = [
    { at: 0.00, title: 'Plancha troquelada',
      text: 'El cartón llega plano y troquelado. En bodega ocupa una fracción del volumen de una caja armada, y así se almacena y se transporta.' },
    { at: 0.12, title: 'Levante de paredes',
      text: 'La formadora pliega las cuatro caras sobre sus líneas de corte y fija las esquinas. Es el punto donde la precisión del equipo define la escuadra de la caja.' },
    { at: 0.40, title: 'Solapas menores',
      text: 'Las solapas cortas bajan primero, hacia el interior. Quedan de apoyo para las siguientes y dan rigidez al borde superior.' },
    { at: 0.64, title: 'Caja formada',
      text: 'Las solapas mayores cierran sobre las anteriores y se juntan al centro. La caja sale lista para sellado con cinta, cola o grapa.' }
  ];

  var elTitle = document.getElementById('foldTitle');
  var elText  = document.getElementById('foldText');
  var elBar   = document.getElementById('foldBar');
  var dots    = document.querySelectorAll('.fold__dot');

  var lastStage = -1;
  function paintStage(p) {
    var i = 0;
    for (var s = 0; s < STAGES.length; s++) if (p >= STAGES[s].at) i = s;
    if (i !== lastStage) {
      lastStage = i;
      elTitle.textContent = STAGES[i].title;
      elText.textContent = STAGES[i].text;
      dots.forEach(function (d, n) { d.classList.toggle('is-on', n <= i); });
    }
    elBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  /* ---------- Avance según scroll ---------- */
  var target = 0;
  function readProgress() {
    var r = section.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    if (span <= 0) return 0;
    var p = -r.top / span;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  /* ---------- Carga diferida ---------- */
  var io = new IntersectionObserver(function (e) {
    if (!e[0].isIntersecting) return;
    io.disconnect();
    var s = document.createElement('script');
    s.src = THREE_URL;
    s.async = true;
    s.onload = start;
    s.onerror = function () { section.classList.add('is-failed'); };
    document.head.appendChild(s);
  }, { rootMargin: '400px' });
  io.observe(section);

  paintStage(0);

  /* ============================================================ */
  function start() {
    if (typeof THREE === 'undefined') { section.classList.add('is-failed'); return; }

    var W = mount.clientWidth || 480, H = mount.clientHeight || 480;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);

    var hemi = new THREE.HemisphereLight(0xcfe4f7, 0x16222e, 0.30);
    scene.add(hemi);
    // Luz más lateral que cenital: de frente quemaba la cara superior
    // justo cuando la caja queda cerrada, que es el remate de la secuencia.
    var key = new THREE.DirectionalLight(0xffffff, 0.76);
    key.position.set(3.4, 2.5, 2.6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x58A6DE, 0.70);
    rim.position.set(-3.0, 1.2, -2.4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xffffff, 0.16);
    fill.position.set(-1.4, 0.5, 2.4);
    scene.add(fill);

    function syncTheme(mode) {
      var light = mode === 'light';
      hemi.groundColor.setHex(light ? 0xdce6ee : 0x16222e);
      hemi.intensity = light ? 0.62 : 0.30;
      rim.intensity = light ? 0.42 : 0.70;
    }
    document.addEventListener('avia:theme', function (e) { syncTheme(e.detail.mode); });

    var card = new THREE.MeshStandardMaterial({
      color: 0x8C9195, roughness: 0.90, metalness: 0.0, side: THREE.DoubleSide
    });

    /* ---------- Medidas de la caja ---------- */
    var BW = 1.00, BD = 0.74, BH = 0.56, T = 0.026;

    function panel(w, h, d) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), card); }

    var box = new THREE.Group();

    // Fondo, fijo en el plano
    var bottom = panel(BW, T, BD);
    box.add(bottom);

    var walls = [];

    // Paredes que pliegan sobre el eje X (frente y fondo)
    [1, -1].forEach(function (s) {
      var hinge = new THREE.Group();
      hinge.position.set(0, 0, s * BD / 2);
      var w = panel(BW, T, BH);
      w.position.z = s * BH / 2;
      hinge.add(w);

      // Solapa mayor: cubre hasta el centro
      var fh = new THREE.Group();
      fh.position.z = s * BH;
      var f = panel(BW, T, BD / 2 - 0.008);
      f.position.z = s * (BD / 4);
      fh.add(f);
      hinge.add(fh);

      walls.push({ hinge: hinge, flap: fh, axis: 'x', dir: -s, major: true });
      box.add(hinge);
    });

    // Paredes que pliegan sobre el eje Z (laterales)
    [1, -1].forEach(function (s) {
      var hinge = new THREE.Group();
      hinge.position.set(s * BW / 2, 0, 0);
      var w = panel(BH, T, BD);
      w.position.x = s * BH / 2;
      hinge.add(w);

      // Solapa menor: pliega primero y queda por debajo
      var fh = new THREE.Group();
      fh.position.x = s * BH;
      var f = panel(BW / 2 - 0.008, T, BD);
      f.position.x = s * (BW / 4);
      fh.add(f);
      hinge.add(fh);

      walls.push({ hinge: hinge, flap: fh, axis: 'z', dir: s, major: false });
      box.add(hinge);
    });

    // Las mayores cierran un espesor más arriba para apoyarse sobre las menores
    walls.forEach(function (w) { if (w.major) w.flap.position.y = T * 1.1; });

    var pivot = new THREE.Group();
    pivot.add(box);
    box.position.y = -BH / 2 + 0.06; // centra la caja armada en cuadro
    scene.add(pivot);

    /* ---------- Encuadre ----------
       La plancha extendida mide más del doble que la caja armada, así que
       la cámara parte lejos y se acerca a medida que se pliega. Con una
       distancia fija, o se corta la plancha o la caja queda diminuta.     */
    var D_FLAT = 4.5, D_BOX = 3.0;

    function frameCamera(up) {
      var d = D_FLAT + (D_BOX - D_FLAT) * up;
      var k = Math.max(1, 1.05 / camera.aspect); // margen extra si es angosto
      d *= k;
      camera.position.set(d * 0.50, d * 0.44, d * 0.75);
      camera.lookAt(0, 0, 0);
    }
    frameCamera(0);

    function resize() {
      var w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mount);
    else window.addEventListener('resize', resize);

    /* ---------- Tramos del armado ---------- */
    var HALF = Math.PI / 2;

    function seg(p, a, b) {
      if (p <= a) return 0;
      if (p >= b) return 1;
      var t = (p - a) / (b - a);
      return t * t * (3 - 2 * t); // suavizado
    }

    function applyFold(p) {
      var up    = seg(p, 0.04, 0.34); // levante de paredes
      var minor = seg(p, 0.36, 0.58); // solapas menores
      var major = seg(p, 0.60, 0.86); // solapas mayores

      walls.forEach(function (w) {
        var a = w.dir * HALF * up;
        if (w.axis === 'x') w.hinge.rotation.x = a;
        else w.hinge.rotation.z = a;

        var fa = w.dir * HALF * (w.major ? major : minor);
        if (w.axis === 'x') w.flap.rotation.x = fa;
        else w.flap.rotation.z = fa;
      });

      // Giro de presentación, lento y continuo
      pivot.rotation.y = -0.45 + p * 0.95;
      pivot.rotation.x = 0.14 + (1 - up) * 0.20;

      frameCamera(up);
    }

    /* ---------- Bucle ---------- */
    var cur = 0, visible = true;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; })
      .observe(section);

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      target = readProgress();
      cur += (target - cur) * (reduced ? 1 : 0.12);
      applyFold(cur);
      paintStage(cur);
      renderer.render(scene, camera);
    }

    syncTheme(document.documentElement.getAttribute('data-theme'));
    resize();
    frame();
    section.classList.add('is-3d');
  }
})();
