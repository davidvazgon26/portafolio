# Cómo publicar una herramienta

> Este archivo no se publica en el sitio; es la guía de trabajo.

## Dónde vive cada herramienta

Es la decisión que hay que tomar primero, y solo tiene dos respuestas.

**Si corre 100% en el navegador → vive aquí**, en `herramientas/<slug>/index.html`. Sin backend,
sin base de datos, sin build. Se despliega con el mismo push que el resto del sitio. Conversores,
formateadores, calculadoras, validadores.

**Si necesita backend, base de datos o compilación → repositorio propio**, con su propio
despliegue. Aquí solo queda la **ficha** que enlaza a la demo y al código.

**La prueba:** ¿puedo abrir su `index.html` con doble clic y que funcione? Si sí, vive aquí.

**El índice es uno solo.** Da igual dónde esté la implementación: si no aparece en
`herramientas/index.html`, no existe. La ficha es el único punto de entrada.

> Por qué así: una herramienta que se puede probar en el momento vale mucho más que un enlace a un
> repositorio. Pero meter algo con backend dentro del portafolio obligaría a mantener un
> despliegue que este sitio no tiene ni quiere.

---

## Publicar una herramienta que vive aquí

1. Crear `herramientas/<slug>/index.html` — autocontenido.
2. Copiar la cabecera de subpágina desde `herramientas/index.html`, ajustando las rutas a
   `../../` (está un nivel más abajo).
3. Cargar `../../CSS/index.css` y `../../js/comun.js`. Si necesita estilos propios, un CSS suyo
   dentro de su carpeta.
4. Incluir el script anti-parpadeo del tema en el `<head>` — está en todas las páginas, cópialo.
5. Añadir la ficha al índice (plantilla A abajo).
6. Commit y push. Vercel publica solo.

## Publicar una ficha de herramienta externa

Solo se toca `herramientas/index.html`: se añade la ficha con la plantilla B. No hay nada más que
hacer aquí; el código vive en su repo.

---

## Plantillas

### A — vive aquí

```html
<article class="card herramienta" data-categoria="texto">
    <div class="card__tag">Aquí mismo</div>
    <h2 class="card__title">Nombre de la herramienta</h2>
    <p class="card__desc">Qué problema resuelve, en una o dos frases.</p>
    <ul class="card__stack">
        <li>JavaScript</li>
        <li>Sin dependencias</li>
    </ul>
    <div class="card__links">
        <a href="./slug/index.html">Abrir →</a>
    </div>
</article>
```

### B — repositorio aparte

```html
<article class="card herramienta" data-categoria="desarrollo">
    <div class="card__tag card__tag--alt">Repo aparte</div>
    <h2 class="card__title">Nombre de la herramienta</h2>
    <p class="card__desc">Qué problema resuelve, en una o dos frases.</p>
    <ul class="card__stack">
        <li>C#</li>
        <li>.NET</li>
    </ul>
    <div class="card__links">
        <a href="https://…" target="_blank" rel="noopener">Ver demo →</a>
        <a href="https://github.com/…" target="_blank" rel="noopener">Código →</a>
    </div>
</article>
```

Las dos plantillas están comentadas dentro de `index.html`, listas para copiar.

**La diferencia visual** la marca el `card__tag`: azul (`Aquí mismo`) contra gris
(`card__tag--alt`, `Repo aparte`). Los enlaces lo refuerzan: interna abre en la misma pestaña,
externa en otra.

⚠️ **`class="card herramienta"`, las dos.** `card` da el estilo; `herramienta` es el gancho del
filtro. Sin la segunda, la ficha se ve bien pero el filtrado la ignora.

---

## Categorías

| `data-categoria` | Botón |
|---|---|
| `datos` | Datos |
| `texto` | Texto |
| `desarrollo` | Desarrollo |
| `calculo` | Cálculo |

⚠️ **Son provisionales.** Se inventaron sin ninguna herramienta construida, así que es
prácticamente seguro que no son las correctas. **Revisarlas al llegar a la tercera herramienta**,
cuando ya haya con qué decidir. Cambiar una categoría es editar los botones de `index.html` y los
`data-categoria` de las fichas.

---

## Activar la sección

**La sección está oculta a propósito.** Existe la estructura, pero no hay enlace desde el
portafolio: una sección vacía se ve peor que no tenerla.

Cuando exista la primera herramienta real:

1. **`index.html`** — quitar los comentarios del `<li>` de Herramientas en el nav (busca
   `TODO: descomentar`).
2. **`index.html`** — quitar los comentarios de la sección teaser (busca
   `======= HERRAMIENTAS =======`).
3. **`index.html`** — ajustar el ritmo de fondos, que hoy alterna claro/oscuro:
   - `habilidades` → **quitar** `section--alt`
   - `notas` → **añadir** `section--alt`
   - `contacto` → **quitar** `section--alt`
4. **`notas/index.html`** — quitar los comentarios del `<li>` de Herramientas en el nav.
5. **`herramientas/index.html`** — sustituir la plantilla comentada por la ficha real.
6. **`Personal/README.md`** — actualizar el estado de la fila Herramientas.
7. Verificar en local antes del push (ver abajo).

> **Si pasan tres meses sin ninguna herramienta, mejor borrar la estructura que dejarla ahí.**
> Código muerto que nadie recuerda es peor que no tener nada.

---

## 🔒 Antes de publicar — los dos filtros

Los de siempre (`../../CLAUDE.md`), más uno propio de esta sección.

**Privacidad:** sin nombres de servidores, bases de datos, endpoints, personas, clientes ni
proyectos internos. La empresa no se nombra.

**Seguridad:** no describir debilidades vigentes del sistema.

**⚠️ El riesgo específico de las herramientas: el código fuente es público.** Una nota se revisa
párrafo a párrafo; una herramienta se publica entera, con sus constantes, sus validaciones y sus
casos borde. Si nació de un problema del trabajo, **puede llevar dentro lógica de negocio real**:
formatos de folio, reglas de cálculo, estructuras de datos, nombres de campos.

Antes de publicarla: leer el código como si fuera de otro y preguntarse *¿esto le dice a alguien
cómo funciona por dentro la empresa?* Si sí, reescribir el dominio en genérico antes del push.

---

## Verificar antes del push

Servir en local (`python -m http.server 8000` desde `Portafolio/`) y comprobar:

- La ficha aparece en el índice.
- **Filtrar por otra categoría la hace desaparecer.** Si no desaparece, falta la clase
  `herramienta` en el `<article>`.
- Si es interna: el enlace abre y la herramienta funciona.
- Si es externa: los dos enlaces abren en pestaña nueva.
- A 375 px de ancho: el burger se ve y el menú despliega.
- El botón de tema sigue funcionando en la página nueva.
