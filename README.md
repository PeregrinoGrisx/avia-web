# AVIA Ingeniería y Servicios — Sitio web v1

Propuesta de landing page basada en el brief respondido por Jorge Torres (7 oct 2026).
**Sin branding nuevo**: se usa el logo actual y el azul institucional existente.

---

## Cómo verlo

```bash
npx --yes serve site -l 4321
```

Luego abrir `http://localhost:4321`. También funciona abriendo `index.html` directo,
pero con un server local se ve exactamente como en producción.

## Archivos

```
site/
├── index.html      Estructura y contenido completo
├── styles.css      Sistema de diseño + todos los componentes
├── script.js       Nav, reveals, contadores, selector de cajas, validación del form
└── assets/
    ├── avia-mark.png          Logo azul recortado (fondos claros)
    ├── avia-mark-white.png    Logo blanco (fondos oscuros) — generado desde el original
    ├── avia-lockup.png        Logo + bajada original del cliente
    └── avia-lockup-negro.png  Versión negra original del cliente
```

---

## La paleta

Jorge pidió azul porque es lo del logo y la ropa institucional, pero nunca dijo que fuera
el único color. Un sitio con un solo tono termina correcto y sin carácter, así que se
suman dos acentos — **con rol asignado**, no decorativos:

| Color | Hex | Rol | Por qué |
|---|---|---|---|
| **Azul AVIA** | `#1D78BC` | Identidad | Del logo y del uniforme. Manda en todo |
| **Petróleo** | `#1F6F7A` | Continuidad y operación | Análogo al azul: lo acompaña sin competir. Marca *proceso corriendo* |
| **Arena** | `#C9A227` | Atención | Complementario del azul, el contraste real. Nace del cartón y de la señalética de faena |

**Dónde va cada uno.** Petróleo: barra de avance del armado, indicadores de etapa,
columna "Con AVIA" de la comparativa, barra de progreso del proceso, rombos del marquee.
Arena: numeración de la sección de desafíos, hover de esas tarjetas, y las marcas
negativas de la columna "Sin AVIA" (donde reemplazó un rojo suelto que estaba fuera
de sistema).

**El reparto es lo que sostiene la propuesta: ~90% azules y neutros, ~7% petróleo,
~3% arena.** Si se usan parejo aparecen los "colores fuertes" que Jorge descartó.

La paleta además sigue el relato del sitio: **desafío (arena) → modelo AVIA (azul) →
resultado (petróleo)**. No son dos colores sueltos, son los tres momentos del argumento.

## Modo claro y oscuro

Selector de dos estados en el nav y en el menú móvil, con el modo activo marcado.
Por defecto **oscuro**, porque es el look de marca y no una preferencia del sistema;
la elección se guarda y se aplica antes de pintar para que no parpadee al cargar.

El claro **no es el oscuro invertido**. Mantiene la misma alternancia de bandas usando
tres tonos claros (`--ink` / `--paper` / `--paper-2`) en vez de oscuro contra claro, y las
tarjetas pasan a blanco para destacar igual que en oscuro destacan por ser más claras
que el fondo. Los acentos se oscurecen para conservar contraste sobre fondo claro.

Todo el color está tokenizado en `:root`; el bloque `:root[data-theme="light"]` solo
redefine valores. Para cambiar un tema no hay que tocar componentes.

## El armado por scroll (`foldbox.js`)

Sección entre el marquee y "El desafío". La caja se construye desde la plancha
troquelada — paredes, solapas menores, solapas mayores — y **el avance lo manda el
scroll**, así que bajar la arma y subir la desarma.

Técnicamente: cada panel cuelga de un grupo colocado en su línea de plegado, de modo
que rota sobre el pliegue y no sobre su centro. Las solapas son hijas de su pared, así
que la acompañan sin cálculos extra. La cámara se aleja en la plancha y se acerca en la
caja cerrada, porque la plancha extendida mide más del doble.

⚠️ **La geometría es un RSC genérico.** Reemplazar por el troquel real de AVIA.

## Decisiones de diseño (y de dónde salen)

| Decisión | Origen en el brief |
|---|---|
| Azul `#1D78BC` como único color de marca | "Azul, como el logo, ya que la ropa institucional sigue ese color" |
| Base oscura (azul petróleo `#091521`) + secciones claras alternadas | "Profesional, sobrio, tecnológico" + "nada de colores fuertes" |
| Esquina cortada en 45° en tarjetas, botones y bloques | Eco del corte diagonal del propio logotipo. Es el recurso gráfico que une todo |
| Movimiento sutil: reveals al scroll, contadores, marquee, armado de cajas animado | "Nada tan estático" — pero sin caer en exceso |
| Tipografías: **Archivo** (títulos) + **Inter** (texto) | Grotescas geométricas, industriales y sobrias. Ambas gratuitas en Google Fonts |
| Landing de una sola página con anclas | El brief pide "Landing page", pero imagina Inicio / Nosotros / Servicios / Productos / Contacto. Están todas como secciones ancladas |
| Estructura problema → modelo → servicios → proceso → comparativa | Referencia que le gustó: `samuservice.cl/outsourcing` |
| Selector interactivo de formatos de caja | Referencia que le gustó: `boix.com` — "cómo muestra los tipos de caja que fabrica, la dinámica que tiene" |

### El eje del mensaje

Todo el sitio gira en torno a la frase del brief:

> "Nos hacemos cargo del proceso, no solo de entregar equipos o personal."

Es la respuesta directa a su debilidad declarada (bajo reconocimiento, página genérica)
y a su diferenciación real. El sitio actual habla de seis servicios genéricos; este
ordena todo bajo un modelo integral y deja los demás servicios como complemento.

---

## Secciones

1. **Hero** — propuesta de valor + doble CTA + chips de credibilidad
2. **KPIs** — cifras duras (⚠️ ver "Pendientes")
3. **Marquee de industrias** — cobertura sectorial
4. **El desafío** — 4 dolores concretos del cliente objetivo
5. **El modelo AVIA** — 4 pilares: personal / equipos / operación / mantención
6. **Servicios** — 1 destacado + 5 complementarios
7. **Equipos y formatos** — selector interactivo de 5 tipos de caja con SVG animado
8. **Cómo trabajamos** — proceso de implementación en 4 pasos
9. **Comparativa** — operación interna vs. con AVIA
10. **Nosotros** — historia, valores, cita del cliente
11. **FAQ** — 6 preguntas de objeción comercial
12. **Contacto** — formulario + datos
13. **Footer**

---

## Pendientes antes de publicar

### Hallazgos del sitio actual (aviaing.cl)

Auditoría del sitio vigente, hecha solo para extraer información. WordPress + Yoast,
última actualización de contenido en **diciembre 2024**.

**El sitio actual no menciona el negocio real. Ni una vez.** Conteo sobre el texto
completo de las cuatro páginas:

| Término | Apariciones |
|---|---|
| packing | **0** |
| caja / cajas | **0** |
| armado | **0** |
| embalaje | **0** |
| paletizado | **0** |
| arriendo | **0** |
| agroindustria / fruta / exportación | **0** |

El brief define a AVIA como "soluciones integrales para procesos de packing y armado de
cajas, arriendo de equipos de armado". Nada de eso aparece en su web. Esto explica
exactamente por qué Jorge dice que el sitio "se siente genérico y no comunica qué hace
diferente a AVIA": no es un problema de diseño, es que **nunca llegó a describir el negocio**.

**Datos de contacto encontrados** (no estaban en el brief):
- Teléfono: `+56 9 4356 7890` — enlazado como `tel:` en la página de contacto. **Confirmar con Jorge**, podría ser del tema de WordPress.
- Segundo correo: `administracionac@aviaing.cl`, además del `mantencionac@aviaing.cl` del brief.
- **Cero redes sociales** en todo el sitio. Confirma el "sin responder" del brief.

**Logos de terceros** (los únicos tres del sitio):
- **Agrosuper** — agroindustria de primer nivel en Chile, directamente relevante para packing.
- **Servipag**
- **SEC** (Superintendencia de Electricidad y Combustibles) — probablemente una acreditación,
  no un cliente: en servicios mencionan "servicios eléctricos certificados". **Confirmar cuál de las dos cosas es.**

Si Agrosuper autoriza aparecer, es el activo de credibilidad más fuerte que tiene AVIA
y hoy está enterrado en un carrusel al pie de página.

**Fotografía: toda de stock.** Revisadas las imágenes, son operarios europeos genéricos en
plantas que no son de AVIA. Confirma el "no tengo, habría que conseguirlas" del brief.

**Blog**: existe con tres entradas de muestra ("entrada-de-muestra-1/2/3") nunca
reemplazadas. No se incluye en el sitio nuevo.

### Equipos y formatos: ahora son los reales

Jorge aportó la ficha del equipo que operan, una formadora **Boix Quality Q-1530**.
Con eso la sección dejó de ser inventada. Datos de boix.com, revisados el 10-10-2026:

| Dato | Valor |
|---|---|
| Producción | 400 a 1.800 cajas/hora, 6 velocidades |
| Cajas que monta | Big Ear, C-1, Citrus Box, Columna Abierta, P-84, Plaform |
| Sistema de cola | Hot melt por inyección (Nordson o Melton) |
| Potencia | 6,6 kW sin compresor |
| Peso | 1.500 kg sin compresor |
| Cambio de medida | Manual por husillos, 20 a 40 min |
| Funcionamiento | Mecánico, eléctrico y neumático |

**Las seis son bandejas hortofrutícolas, no cajas americanas.** Fondo, cuatro paredes
bajas y esquinas encoladas. Eso obligó a rehacer los dos visores 3D: el selector de
formatos y la animación de armado, que antes formaba una RSC con solapas.

La animación usa la **C-1** porque el propio fabricante la describe como la estructura
más básica, así que es la que mejor explica el proceso.

El catálogo vive en `boxdata.js`, compartido entre el panel de texto y el visor 3D.

Queda por confirmar con Jorge:
1. ¿Cuántas Q-1530 tienen? ¿Hay otros modelos?
2. De los seis formatos, ¿cuáles montan efectivamente y cuál es el más frecuente?
3. Medidas típicas de bandeja por formato.
4. ¿Trabajan alguna variante de apilamiento (Defor, EasyStack, Traptab)?

### Datos a confirmar con el cliente
- [ ] **Cifras de los KPIs**: están con valores de referencia (`+12` plantas, `+80` personas, `98%` disponibilidad). Solo `+6 años` sale del brief. Hay que reemplazarlas o quitar el bloque.
- [x] ~~Teléfono~~: recuperado del sitio actual (`+56 9 4356 7890`). **Confirmar con Jorge** que sea el correcto y no del tema de WordPress.
- [ ] **Rendimientos de los equipos** (cajas/min por formato): son valores plausibles de la industria, no datos de AVIA. Confirmar o quitar la fila.
- [ ] **Redes sociales**: sin responder en el brief. No hay enlaces en el footer todavía.
- [ ] **Regiones de cobertura** reales (hoy dice "a lo largo de Chile").
- [ ] **Clientes / logos** para la franja de confianza (si pueden mostrarse).

### Fotografía
El cliente no tiene fotos ("habría que conseguirlas"). Hay 2 *slots* marcados en el sitio:
- Hero: operación en planta (vertical 4:5)
- Nosotros: equipo AVIA en terreno (5:4)

Mientras tanto se ven como bloques técnicos con trama diagonal, lo que es coherente con el
estilo. Recomendación: **sesión fotográfica en planta** — es lo que más va a subir el nivel
del sitio y lo que separa a AVIA de la competencia que usa stock.

### Técnico
- [ ] Conectar el formulario a un backend real (hoy solo valida y muestra confirmación). Opciones: Formspree, Web3Forms, o envío a `mantencionac@aviaing.cl` vía función serverless.
- [ ] Agregar reCAPTCHA / honeypot anti-spam.
- [ ] Meta tags Open Graph + imagen para compartir.
- [ ] Favicon en varios tamaños.
- [ ] Analytics (GA4 o Plausible).
- [ ] Montar sobre `aviaing.cl` (el dominio ya es del cliente).

---

## Para las siguientes versiones

Ideas que quedaron fuera de esta v1 y vale la pena probar:

- **Versión clara**: el mismo sitio con base blanca y el oscuro solo en hero y CTA final. Para contrastar con esta.
- **Casos concretos**: el cliente dice que le falta "mostrar experiencia real, casos concretos". Una sección de 2–3 casos (planta, desafío, solución, resultado) sería el mayor aporte comercial, pero necesita que ellos aporten el contenido.
- **Calculadora de dotación** o **configurador de servicio**: un paso más en la "dinámica" que le gustó de Boix.
- **Página interna de Productos/Equipos**: si el catálogo de equipos crece, sacarlo de la landing.
- **Variantes tipográficas**: probar Archivo contra una condensada tipo Oswald/Saira para los títulos.

---

*Punto Gris · puntogris.cl*
