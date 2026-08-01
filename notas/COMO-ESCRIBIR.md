# Cómo publicar una nota

> Este archivo no se publica en el sitio; es la guía de trabajo.

## El procedimiento

1. Abrir `notas/index.html`.
2. Copiar un `<article class="nota">` completo.
3. **Pegarlo arriba de los demás** (las más recientes van primero).
4. Editar fecha, tipo, título y cuerpo.
5. Commit y push. Vercel publica solo.

No hay build, ni generador, ni base de datos. Es HTML a mano — deliberadamente: si publicar
costara trabajo, no escribirías.

## Plantilla

```html
<article class="nota" data-tipo="problema">
    <div class="nota__meta">
        <time datetime="2026-08-15">15 ago 2026</time>
        <span class="nota__tipo nota__tipo--problema">🔧 Problema resuelto</span>
    </div>
    <h2 class="nota__title">Título concreto, no genérico</h2>
    <div class="nota__body">
        <p>Qué pasaba.</p>
        <p>Qué encontré al investigar.</p>
        <pre><code>// código, si aplica</code></pre>
        <p><strong>Lo que me llevo:</strong> la lección transferible.</p>
    </div>
</article>
```

### Los cuatro tipos

Hay que cambiar **dos** cosas: el `data-tipo` del `<article>` y la clase + texto del `<span>`.

| `data-tipo` | Clase del span | Texto | Cuándo |
|---|---|---|---|
| `problema` | `nota__tipo--problema` | 🔧 Problema resuelto | Algo falló y lo arreglaste |
| `decision` | `nota__tipo--decision` | 🧭 Decisión | Elegiste entre alternativas |
| `aprendizaje` | `nota__tipo--aprendizaje` | 📚 Aprendizaje | Entendiste algo nuevo |
| `referencia` | `nota__tipo--referencia` | ⚡ Referencia | Chuleta para consultar |

### Elementos disponibles

`<p>` · `<h3>` · `<ul>`/`<ol>` · `<pre><code>` · `<code>` · `<blockquote>` · `<table>` ·
`<p class="nota__aside">` para el detalle que casi te muerde.

⚠️ Dentro de `<pre><code>`, escapar `<` como `&lt;` y `>` como `&gt;`. Es el error más fácil de
cometer: si el código de ejemplo lleva `=>` o genéricos, el navegador intenta interpretarlos como
etiquetas y la nota se rompe.

---

## 🔒 Antes de publicar — los dos filtros

Las reglas completas están en [`../../CLAUDE.md`](../../CLAUDE.md). Resumen operativo:

### Filtro 1 — privacidad

Sin nombres de servidores, IPs, bases de datos, tablas, endpoints, credenciales, personas,
clientes ni proyectos internos. **La empresa no se nombra.**

El código de ejemplo se reescribe con dominio genérico: `Pedido`, `Producto`, `Cliente`. El
patrón técnico se conserva; el contexto identificable se sustituye.

### Filtro 2 — seguridad

Este es el que se olvida. **No describir debilidades vigentes**, ni siquiera en genérico:

- Componentes que se degradan bajo carga.
- Reinicios periódicos, ventanas de mantenimiento, parches que contienen sin resolver.
- Versiones sin soporte, mecanismos de autenticación, dependencias frágiles.

**La prueba:** ¿esta nota le diría a alguien con malas intenciones *dónde empujar*?

**La regla:** un problema **resuelto y cerrado** se cuenta en pasado. Uno **vigente o contenido
con un parche** no se menciona en ninguna forma.

> Nota bien: el filtro de seguridad **no impide escribir sobre problemas técnicos**. Impide
> describir el *estado* de un sistema vivo. La nota sobre `Dictionary` y complejidad algorítmica
> se publicó completa —con código y números— porque describe una **técnica**, no la salud de una
> infraestructura concreta.

---

## Cómo escribir para que sirva dentro de seis meses

El lector principal eres tú en el futuro, cuando no recuerdes nada del contexto.

- **Título concreto.** «Cuando LINQ esconde un bucle» se encuentra buscando; «Optimizando
  consultas» no.
- **Empezar por el síntoma**, que es lo que vas a recordar: qué se veía mal.
- **Escribir el callejón sin salida.** Lo que probaste y no funcionó vale tanto como la solución:
  te evita repetirlo.
- **Cerrar con la lección transferible**, no con el arreglo puntual. El arreglo sirve una vez; el
  principio sirve siempre.
- **Corto está bien.** Cinco párrafos útiles superan a veinte que nunca escribiste.

## Ideas para las próximas

- Diferencia entre `Where`, `FirstOrDefault` y `Any`, y cuándo usar cada uno.
- `ToDictionary` vs `ToLookup`: qué pasa con las claves duplicadas.
- Resolver en SQL sin funciones de ventana ni CTEs.
- Por qué un `using` importa más de lo que parece.
- Leer un plan de ejecución sin entrar en pánico.
