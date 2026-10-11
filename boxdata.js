/* ============================================================
   AVIA — formatos de bandeja que monta la Boix Quality Q-1530
   ------------------------------------------------------------
   Datos tomados de la ficha técnica del equipo y de las fichas
   de cada formato en boix.com (revisado 10-10-2026).

   Las seis son BANDEJAS hortofrutícolas, no cajas americanas:
   fondo rectangular, cuatro paredes bajas y esquinas encoladas
   con hot melt. Lo que cambia entre formatos es cómo se resuelve
   la esquina y el borde superior, que es de donde sale la
   resistencia al apilado.

   `geo` describe la geometría para el visor 3D:
     w,d,h        proporciones de la bandeja
     innerWall    refuerzo interior en las paredes largas
     rim          pestaña horizontal en el borde superior
     ears         orejas redondeadas sobre las esquinas
     openColumn   esquinas recortadas (columna abierta)
     posts        columnas interiores en las esquinas
     handHoles    asas troqueladas en las paredes largas
   ============================================================ */
window.AVIA_BOXES = {
  c1: {
    kicker: 'Estructura base',
    title: 'Caja C-1',
    desc: 'La estructura de bandeja más básica y una de las más usadas del mercado, sobre todo por su aprovechamiento del cartón: la plancha rinde más que en cualquier otro formato.',
    use: 'Fruta y hortaliza de exportación, uso general',
    struct: 'Cuatro paredes con esquinas encoladas',
    rate: '400 a 1.800 cajas/hora',
    dims: 'Bandeja simple · esquinas encoladas',
    geo: { w: 1.00, d: 0.70, h: 0.21 }
  },

  citrus: {
    kicker: 'Hortofrutícola',
    title: 'Caja Citrus Box',
    desc: 'Uno de los diseños más populares del sector hortofrutícola. Admite variantes de apilamiento como Defor®, EasyStack o Traptab, que es donde se define cómo se comporta el pallet.',
    use: 'Cítricos y fruta de calibre',
    struct: 'Doble pared interior y asas troqueladas',
    rate: '400 a 1.800 cajas/hora',
    dims: 'Doble pared · apilamiento reforzado',
    geo: { w: 1.00, d: 0.72, h: 0.28, innerWall: true, handHoles: true }
  },

  columna: {
    kicker: 'Formato estándar',
    title: 'Caja columna abierta',
    desc: 'Diseño muy estándar, con las esquinas recortadas para formar columnas abiertas. Deja pasar aire por los vértices, que es por donde más se calienta un pallet.',
    use: 'Producto que requiere ventilación en pallet',
    struct: 'Esquinas abiertas, borde escalonado',
    rate: '400 a 1.800 cajas/hora',
    dims: 'Columna abierta · ventilación en vértices',
    geo: { w: 1.00, d: 0.66, h: 0.24, openColumn: true }
  },

  plaform: {
    kicker: 'Hortofrutícola',
    title: 'Caja Plaform®',
    desc: 'De los diseños más extendidos en hortofrutícola. Tiene múltiples variantes (doble pared, tejadillos, guarderas partidas) y cada una se resuelve cambiando el kit de la máquina.',
    use: 'Hortaliza y fruta de exportación',
    struct: 'Pestaña perimetral en el borde superior',
    rate: '400 a 1.800 cajas/hora',
    dims: 'Pestaña perimetral · múltiples variantes',
    geo: { w: 1.00, d: 0.68, h: 0.23, rim: true, handHoles: true }
  },

  p84: {
    kicker: 'Hortofrutícola',
    title: 'Caja P-84®',
    desc: 'Otro de los formatos más populares del sector. Como la Citrus Box, su diferencia principal está en el tipo de apilamiento: Defor®, EasyStack, Traptab.',
    use: 'Fruta de exportación, alto apilado',
    struct: 'Columnas interiores en las cuatro esquinas',
    rate: '400 a 1.800 cajas/hora',
    dims: 'Columnas de esquina · alto apilado',
    geo: { w: 1.00, d: 0.76, h: 0.26, posts: true, innerWall: true }
  },

  bigear: {
    kicker: 'Hortofrutícola',
    title: 'Caja Big Ear',
    desc: 'Diseño pensado para el envasado de frutas y verduras. Las orejas sobresalen del borde y encajan con la bandeja de arriba, trabando el pallet sin necesidad de esquineros.',
    use: 'Frutas y verduras, pallet autotrabado',
    struct: 'Orejas de esquina sobre el borde',
    rate: '400 a 1.800 cajas/hora',
    dims: 'Orejas de esquina · pallet autotrabado',
    geo: { w: 1.00, d: 0.74, h: 0.25, ears: true, handHoles: true }
  }
};

/* Ficha del equipo, para no repetirla en cada formato */
window.AVIA_MACHINE = {
  name: 'Boix Quality Q-1530',
  rate: 'De 400 a 1.800 cajas/hora, 6 velocidades',
  glue: 'Hot melt por inyección (Nordson o Melton)',
  power: '6,6 kW sin compresor',
  weight: '1.500 kg sin compresor',
  changeover: 'Cambio de medida manual por husillos, 20 a 40 min'
};
