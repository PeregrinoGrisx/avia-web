/* ============================================================
   AVIA — armado de caja guiado por scroll
   ------------------------------------------------------------
   Se forma una bandeja C-1 desde la plancha troquelada: suben las
   cuatro paredes y las orejas de esquina giran sobre el vértice para
   encolarse contra la pared contigua. El avance lo manda el scroll,
   así que subir deshace el armado y bajar lo completa.

   Cada panel cuelga de un grupo colocado en su línea de plegado,
   de modo que rota sobre el pliegue y no sobre su centro. Las
   solapas son hijas de su pared, así que acompañan el movimiento
   sin cálculos extra.

   La C-1 es el formato base de la Boix Quality Q-1530 que opera AVIA,
   y el propio fabricante la describe como la estructura más básica,
   así que es la que mejor explica el proceso. Ver boxdata.js.
   ============================================================ */
(function () {
  'use strict';


  var mount = document.getElementById('foldbox');
  var section = document.getElementById('armado');
  if (!mount || !section) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Etapas ---------- */
  /* Los cortes van alineados con los tramos de applyFold(): el rótulo
     tiene que cambiar cuando empieza el movimiento, no cuando termina. */
  var STAGES = [
    { at: 0.00, title: 'Plancha troquelada',
      text: 'El cartón llega plano y troquelado. En bodega ocupa una fracción del volumen de una bandeja armada, y así se almacena y se transporta.' },
    { at: 0.12, title: 'Levante de paredes',
      text: 'La formadora pliega las cuatro caras sobre sus líneas de corte. Aquí la precisión del equipo define la escuadra, y la escuadra define si el pallet se sostiene.' },
    { at: 0.42, title: 'Encolado de esquinas',
      text: 'Las orejas giran sobre el vértice y se pegan contra la pared contigua con hot melt por inyección. Es el punto donde la bandeja gana su resistencia.' },
    { at: 0.62, title: 'Bandeja formada',
      text: 'Sale lista para recibir el producto. Es el momento en que se integra con tu línea: llenado, pesaje y control de calidad.' },
    { at: 0.85, title: 'Lista para paletizar',
      text: 'Cada bandeja se suma a la carga. Repetir esto hasta 1.800 veces por hora, sin detenciones y con la misma escuadra, es exactamente el trabajo del que nos hacemos cargo.' }
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
    window.aviaThree().then(start, function () { section.classList.add('is-failed'); });
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
      card.color.setHex(light ? 0x6E767C : 0x8C9195);
    }
    document.addEventListener('avia:theme', function (e) { syncTheme(e.detail.mode); });

    var card = new THREE.MeshStandardMaterial({
      color: 0x8C9195, roughness: 0.90, metalness: 0.0, side: THREE.DoubleSide
    });

    /* ---------- Medidas de la bandeja ----------
       Proporciones de bandeja hortofrutícola: ancha, poco profunda.
       Una caja alta no representaría lo que AVIA realmente monta.   */
    var BW = 1.00, BD = 0.70, BH = 0.23, T = 0.022, TAB = 0.16;
    var MATE_H = BH;

    function panel(w, h, d) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), card); }

    var box = new THREE.Group();

    // Fondo, fijo en el plano
    var bottom = panel(BW, T, BD);
    box.add(bottom);

    var walls = [];

    // Paredes largas: pliegan sobre el eje X
    [1, -1].forEach(function (s) {
      var hinge = new THREE.Group();
      hinge.position.set(0, 0, s * BD / 2);
      var w = panel(BW, T, BH);
      w.position.z = s * BH / 2;
      hinge.add(w);
      walls.push({ hinge: hinge, axis: 'x', dir: -s, tabs: [] });
      box.add(hinge);
    });

    // Paredes cortas: pliegan sobre el eje Z y llevan las orejas
    [1, -1].forEach(function (s) {
      var hinge = new THREE.Group();
      hinge.position.set(s * BW / 2, 0, 0);
      var w = panel(BH, T, BD);
      w.position.x = s * BH / 2;
      hinge.add(w);

      // Dos orejas, una por vértice. Cuelgan de un grupo situado en el
      // canto de la pared, que una vez levantada queda vertical: girar
      // ese grupo sobre su eje local X es girar sobre la arista de la
      // esquina, que es exactamente lo que hace la máquina.
      var tabs = [];
      [1, -1].forEach(function (z) {
        var th = new THREE.Group();
        th.position.z = z * BD / 2;
        var t = panel(BH, T, TAB);
        t.position.set(s * BH / 2, 0, z * TAB / 2);
        th.add(t);
        th.userData.sign = s * z;
        hinge.add(th);
        tabs.push(th);
      });

      walls[walls.length] = { hinge: hinge, axis: 'z', dir: s, tabs: tabs };
      box.add(hinge);
    });

    /* ---------- Cajas de acompañamiento para el paletizado ----------
       En el último tramo la caja deja de estar sola: aparecen otras
       cinco y se arma una capa de pallet. Son cajas cerradas simples,
       no necesitan el aparejo de pliegues.                            */
    // Aristas dibujadas: sin ellas las caras coplanares de cajas vecinas
    // se funden y el pallet se ve como un bloque sin forma.
    var edgeMat = new THREE.LineBasicMaterial({ color: 0x3C464D, transparent: true, opacity: 0.85 });

    var mates = [];
    var GAP = 0.055;
    var HX = (BW + GAP) / 2, HZ = (BD + GAP) / 2, LY = BH + GAP;

    // Bloque 2×2 en la base y dos cajas encima. Una disposición en cruz
    // se lee como un racimo suelto; un bloque compacto se lee como carga.
    // La caja recién armada ocupa la esquina (-HX,-HZ): durante este tramo
    // se desplaza hasta ahí para que el conjunto quede centrado en cuadro.
    // El primero de la lista ocupa la esquina de la caja recién armada:
    // en el paletizado la reemplaza, para que las seis sean idénticas y
    // todas lleven aristas. El cambio es invisible porque ambas son la
    // misma caja cerrada en la misma posición.
    var LAYOUT = [
      [-HX, 0,  -HZ],
      [ HX, 0,  -HZ], [-HX, 0,   HZ], [ HX, 0,  HZ],
      [-HX, LY, -HZ], [ HX, LY,  HZ]
    ];
    // La caja principal tiene su base en y=0 dentro del grupo, así que su
    // centro queda medio alto más arriba. Las copias son cubos centrados:
    // hay que subirlas ese medio alto o se hunden bajo el resto.
    var BASE_Y = BH / 2;

    var mateGeo = new THREE.BoxGeometry(BW, BH, BD);
    var mateEdges = new THREE.EdgesGeometry(mateGeo);

    LAYOUT.forEach(function (pos, i) {
      var m = new THREE.Mesh(mateGeo, card);
      m.add(new THREE.LineSegments(mateEdges, edgeMat));
      m.userData.home = new THREE.Vector3(pos[0], BASE_Y + pos[1], pos[2]);
      // La que sustituye a la caja armada entra sin retardo y sin caída
      m.userData.swap = (i === 0);
      m.userData.delay = i === 0 ? 0 : (i - 1) * 0.09;
      m.visible = false;
      mates.push(m);
    });

    var pivot = new THREE.Group();
    pivot.add(box);
    mates.forEach(function (m) { pivot.add(m); });
    box.position.y = -BH / 2 + 0.06; // centra la caja armada en cuadro
    scene.add(pivot);

    /* ---------- Encuadre ----------
       La plancha extendida mide más del doble que la caja armada, así que
       la cámara parte lejos y se acerca a medida que se pliega. Con una
       distancia fija, o se corta la plancha o la caja queda diminuta.     */
    /* La distancia de cámara es su propia coreografía, independiente de
       los pliegues: la plancha necesita aire, la caja abierta llena el
       cuadro, el cierre se mira a tamaño normal y el pallet pide alejarse.
       Claves en (avance, distancia), interpoladas suave.                */
    var DOLLY = [
      [0.00, 5.20],   // plancha: cabe entera
      [0.18, 4.40],   // paredes subiendo
      [0.38, 2.40],   // bandeja abierta: domina la pantalla
      [0.66, 2.40],   // se mantiene durante el encolado
      [0.80, 3.10],   // retrocede para mostrarla formada
      [1.00, 5.40]    // pallet
    ];

    function dolly(p) {
      for (var i = 1; i < DOLLY.length; i++) {
        if (p > DOLLY[i][0] && i < DOLLY.length - 1) continue;
        var a = DOLLY[i - 1], b = DOLLY[i];
        var t = (p - a[0]) / (b[0] - a[0]);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        t = t * t * (3 - 2 * t);
        return a[1] + (b[1] - a[1]) * t;
      }
      return DOLLY[0][1];
    }

    function frameCamera(p) {
      var d = dolly(p);
      d *= Math.max(1, 1.05 / camera.aspect); // margen extra si es angosto
      camera.position.set(d * 0.50, d * 0.44, d * 0.75);
      camera.lookAt(0, 0, 0);
    }
    frameCamera(0);

    function resize() {
      var w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;

      // El lienzo cubre toda la sección, pero el texto vive en la mitad
      // derecha. setViewOffset corre la ventana de render hacia la
      // derecha, con lo que la caja aparece desplazada a la izquierda,
      // sin tocar el ángulo de cámara ni deformar la perspectiva.
      if (w >= 960) camera.setViewOffset(w, h, w * 0.15, 0, w, h);
      else camera.clearViewOffset();

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
      var up   = seg(p, 0.04, 0.34); // levante de paredes
      var glue = seg(p, 0.44, 0.62); // giro y encolado de las orejas
      var pile = seg(p, 0.84, 1.00); // paletizado

      walls.forEach(function (w) {
        var a = w.dir * HALF * up;
        if (w.axis === 'x') w.hinge.rotation.x = a;
        else w.hinge.rotation.z = a;

        // Las orejas giran sobre la arista vertical de la esquina.
        // El signo sale del cruce entre el lado de la pared y el
        // extremo donde está la oreja, para que las cuatro cierren
        // hacia dentro y no dos hacia fuera.
        w.tabs.forEach(function (t) {
          t.rotation.x = -HALF * t.userData.sign * glue;
        });
      });

      // La caja armada cede el centro y toma su esquina del bloque
      box.position.x = -HX * pile;
      box.position.z = -HZ * pile;

      // Una vez iniciado el paletizado, la caja armada se releva por su
      // gemela con aristas para que las seis se lean igual
      var swapped = pile > 0.015;
      box.visible = !swapped;

      mates.forEach(function (m) {
        if (m.userData.swap) {
          m.visible = swapped;
          if (swapped) {
            m.position.set(-HX * pile, box.position.y + m.userData.home.y, -HZ * pile);
            m.scale.setScalar(1);
          }
          return;
        }
        // Las demás entran desde abajo, con retardo escalonado
        var t = seg(pile, m.userData.delay, m.userData.delay + 0.5);
        m.visible = t > 0.001;
        if (!m.visible) return;
        var h = m.userData.home;
        m.position.set(h.x * t, box.position.y + h.y - (1 - t) * 1.1, h.z * t);
        m.scale.setScalar(0.6 + 0.4 * t);
      });

      // Giro de presentación, lento y continuo
      pivot.rotation.y = -0.45 + p * 0.95;
      pivot.rotation.x = 0.14 + (1 - up) * 0.20 + pile * 0.10;

      frameCamera(p);
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
