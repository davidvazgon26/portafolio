# Lector y dictado — notas de mantenimiento

> Este archivo no se publica como página; es la guía para cuando haya que volver aquí.

Herramienta que vive dentro del portafolio (`herramientas/lector-texto/index.html`). No tiene
build ni dependencias que instalar: se abre el HTML y funciona.

```
lector-texto/
├── index.html      la página
├── lector.css      estilos propios (las variables vienen de ../../CSS/index.css)
├── lector.js       toda la lógica
├── LEEME.md        este archivo
└── vendor/         pdf.js y mammoth.js, copiados a mano
```

---

## Las dos decisiones que no se ven en el código

### 1. Las librerías están copiadas, no enlazadas a un CDN

`vendor/` pesa unos 2 MB. La tentación obvia es cargarlas desde un CDN y quitarlas del
repositorio. **No se puede**, y no por gusto: el `vercel.json` del sitio declara

```
script-src 'self'
```

Un `<script src="https://cdn…">` queda bloqueado por el navegador, y **falla en silencio**: la
página carga, el botón responde y el archivo simplemente no se abre. Solo se ve en la consola.

Son dos, con su versión:

| Archivo | Qué es | Versión |
|---|---|---|
| `pdf.min.js` + `pdf.worker.min.js` | Extrae el texto de un PDF. De Mozilla, Apache 2.0 | 3.11.174 |
| `mammoth.browser.min.js` | Extrae el texto de un `.docx`. BSD-2 | 1.8.0 |

**No se cargan al abrir la página.** `cargarScript()` las inyecta la primera vez que alguien abre
un PDF o un Word. Quien solo escribe o pega texto no descarga ni un byte de ellas — que es lo que
hace tolerable el tamaño.

Para actualizarlas, descargar el archivo nuevo encima y **volver a correr la verificación**: un
cambio de versión mayor de pdf.js suele mover la API de `getTextContent()`.

### 2. El micrófono se abrió en `vercel.json`

El sitio traía `microphone=()` en `Permissions-Policy`, que lo apaga para todo el mundo. El
dictado no arrancaba ni concediendo el permiso en el navegador, porque la cabecera manda antes.

Se cambió a `microphone=(self)`: **solo este sitio puede pedirlo**, ningún iframe incrustado, y el
usuario sigue teniendo que aceptar el diálogo del navegador. `camera`, `geolocation`, `payment` y
`usb` siguen en `()`.

`vercel.json` es JSON y no admite comentarios, así que la razón vive aquí. **Si alguien ve esa
línea y la "corrige" a `()`, rompe el dictado sin ningún error visible.**

---

## Lo que hay que saber del código

**Se lee por trozos, no de una vez.** Chrome corta los enunciados largos a media frase sin lanzar
ningún error. `dividirEnFrases()` parte el texto en oraciones y cada una se habla por separado,
encolándose en `onend`. De ahí sale gratis lo mejor de la pantalla: se puede hacer clic en
cualquier oración para leer desde ahí.

Esa función devuelve **rangos contiguos que cubren todo el texto**, espacios incluidos, para que la
vista de lectura lo reconstruya carácter por carácter. Si se toca, la prueba que lo vigila es *"la
vista de lectura reconstruye el texto sin perder nada"*.

**El dictado se reengancha solo.** Chrome cierra la sesión tras unos segundos de silencio aunque
`continuous` sea `true`. Sin el `onend` que vuelve a llamar a `start()`, un dictado largo muere y
el usuario sigue hablándole a nada. Hay un tope de 40 reenganches para que un fallo real no se
convierta en un bucle.

**`speechSynthesis.getVoices()` devuelve vacío la primera vez.** Las voces cargan de forma
asíncrona; se escucha `voiceschanged` y además hay dos reintentos por si el navegador no lo lanza.

**Cuidado con `[hidden]` y `display`.** Cualquier regla que declare un `display` le gana al
`display:none` implícito del atributo. Ya pasó con `.grabando`, que mostraba *"Escuchando…"* de
forma permanente. Si se añade un elemento que se oculta con `hidden`, o no se le pone `display`, o
se añade su `[hidden] { display: none; }`.

---

## Qué NO hace

- **No lee PDFs escaneados.** Solo extrae la capa de texto. Un PDF que son fotos de páginas sale
  vacío, y la herramienta lo dice. Haría falta reconocimiento óptico, que es otra herramienta.
- **No lee `.doc`** (el binario viejo de Word), solo `.docx`.
- **No genera PDF por su cuenta.** El botón abre el diálogo de impresión y el usuario elige
  *Guardar como PDF*. Añadir jsPDF serían otros 300 KB para ahorrar un clic.

---

## Probarla

`python -m http.server` **no sirve para esta página**: no manda las cabeceras de `vercel.json`, así
que la Content-Security-Policy no se ejerce y un bloqueo no aparecería hasta producción. Usar el
servidor del repositorio, que las lee del propio `vercel.json`:

```bash
node servidor-local.mjs 8000      # desde Portafolio/, con Node 18+
```

Y después, en el navegador, lo que ninguna prueba automática puede comprobar:

- [ ] **Que se oiga.** Elegir voz e idioma, pulsar Leer y escuchar. Probar pausar y continuar.
- [ ] **Que el resaltado siga a la voz**, y que al hacer clic en otra oración empiece por ahí.
- [ ] **Dictar un par de frases** en Chrome o Edge y ver que el texto se agrega al final.
- [ ] **Dictar más de un minuto seguido**, con silencios, para comprobar el reenganche.
- [ ] **Imprimir**: que salga solo el texto, sin cabecera, menús ni paneles.
