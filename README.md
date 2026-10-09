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

### Datos a confirmar con el cliente
- [ ] **Cifras de los KPIs**: están con valores de referencia (`+12` plantas, `+80` personas, `98%` disponibilidad). Solo `+6 años` sale del brief. Hay que reemplazarlas o quitar el bloque.
- [ ] **Teléfono**: el brief no lo trae. Está como `+56 9 0000 0000` en nav, contacto y footer.
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
