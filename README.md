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
├── index.html          Todo el contenido
├── CSS/index.css       Estilos, con variables y tema claro/oscuro
├── js/index.js         Menú móvil, sección activa y año del footer
└── resources/          Foto, CV y favicon
```

## Decisiones técnicas

- **Sin framework.** El sitio es esencialmente estático; uno añadiría build, dependencias y
  mantenimiento sin aportar nada a cambio.
- **Tema claro/oscuro automático** vía `prefers-color-scheme`, con variables CSS.
- **Responsive con `clamp()` y grid**, sin unidades de viewport en la tipografía — así el texto
  sigue siendo legible al hacer zoom.
- **Accesibilidad:** enlace para saltar al contenido, HTML semántico, foco visible y respeto a
  `prefers-reduced-motion`.
- **Menú móvil en CSS puro** (patrón checkbox); el JS solo lo cierra al navegar.

## Herramientas de apoyo

- [Formsubmit](https://formsubmit.co/) — envío del formulario de contacto sin backend propio.

## Despliegue

Automático en Vercel con cada push a la rama principal.
