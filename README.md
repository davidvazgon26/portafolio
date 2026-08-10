# Portafolio — David Vázquez

Portafolio personal. HTML, CSS y JavaScript sin frameworks ni dependencias: no requiere
instalación ni proceso de compilación.

🔗 **[portafoliodavid-zeta.vercel.app](https://portafoliodavid-zeta.vercel.app)**

## Ejecutar en local

Basta con abrir `index.html` en el navegador. Para servirlo con un servidor local:

```bash
npx serve .
# o la extensión Live Server de VS Code
```

## Estructura

```
├── index.html              Portada
├── CSS/
│   ├── index.css           Base: variables, tema, layout y componentes
│   ├── notas.css           Solo lo propio de la bitácora
│   └── herramientas.css    Solo lo propio del índice de herramientas
├── js/
│   ├── comun.js            Año, menú móvil, tema y filtro genérico
│   ├── index.js            Resaltado de la sección visible
│   ├── notas.js            Configura el filtro de notas
│   └── herramientas.js     Configura el filtro de herramientas
├── notas/                  Bitácora técnica
├── herramientas/           Índice + las que corren en el navegador
└── resources/              Foto, CV y favicon
```

`comun.js` se carga **antes** que el JS específico de cada página; es el único orden que importa.

## Decisiones técnicas

- **Sin framework.** El sitio es esencialmente estático; uno añadiría build, dependencias y
  mantenimiento sin aportar nada a cambio.
- **Tema claro/oscuro** con variables CSS: sigue al sistema por `prefers-color-scheme` y se puede
  forzar con el botón del menú, que guarda la elección en `localStorage`. Un script mínimo en el
  `<head>` aplica el tema antes de pintar, para que no haya destello blanco al recargar en oscuro.
- **Herramientas: dentro o fuera según lo que necesiten.** Si corre en el navegador vive en este
  repo y se puede usar desde el sitio; si necesita backend o build, vive en su repositorio y aquí
  queda una ficha que enlaza a la demo y al código. El índice es uno solo. Detalle en
  [`herramientas/COMO-PUBLICAR.md`](herramientas/COMO-PUBLICAR.md).
- **Responsive con `clamp()` y grid**, sin unidades de viewport en la tipografía — así el texto
  sigue siendo legible al hacer zoom.
- **Accesibilidad:** enlace para saltar al contenido, HTML semántico, foco visible y respeto a
  `prefers-reduced-motion`.
- **Menú móvil en CSS puro** (patrón checkbox); el JS solo lo cierra al navegar.

## Herramientas de apoyo

- [Formsubmit](https://formsubmit.co/) — envío del formulario de contacto sin backend propio.

## Despliegue

Automático en Vercel con cada push a la rama principal.
