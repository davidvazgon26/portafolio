/* Vista previa local del README del perfil de GitHub.
 *
 * Extrae el bloque ```markdown de PERFIL-GITHUB.md, lo manda a la API de
 * GitHub para que lo renderice con su propio motor (mismo GFM, mismos
 * emoji, mismas reglas) y escribe un HTML local que se abre en el navegador.
 *
 * No es una aproximación: es el render de GitHub. Lo único que cambia frente
 * al perfil real es el ancho de la caja y que no hay barra lateral.
 *
 * Requiere: gh autenticado (usa su token) y Node 20.
 * Uso, desde Personal/Portafolio/:
 *     node previsualizar-perfil.mjs
 *     start vista-previa-perfil.html
 *
 * El HTML generado NO se versiona (ver .gitignore).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const fuente = readFileSync("PERFIL-GITHUB.md", "utf8");

/* El contenido propuesto vive dentro del primer bloque ```markdown */
const bloque = fuente.match(/```markdown\n([\s\S]*?)```/);

if (!bloque) {
    console.error("No encontré el bloque ```markdown en PERFIL-GITHUB.md.");
    process.exit(1);
}

const markdown = bloque[1];

console.log(`Markdown extraído: ${markdown.split("\n").length} líneas.`);
console.log("Pidiendo el render a GitHub…");

let cuerpo;
try {
    cuerpo = execFileSync(
        "gh",
        ["api", "--method", "POST", "/markdown", "-f", "mode=gfm", "-f", `text=${markdown}`],
        { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
    );
} catch (error) {
    console.error("Falló la llamada a la API. ¿`gh auth status` está en orden?");
    console.error(String(error.stderr || error.message).split("\n")[0]);
    process.exit(1);
}

/* Estilos propios, aproximados a los de GitHub. Se escriben aquí en vez de
   traer su hoja por CDN para que la vista previa funcione sin conexión —
   salvo las insignias, que por definición se piden a img.shields.io. */
const pagina = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vista previa — README del perfil</title>
<style>
  :root { color-scheme: light dark; }
  body {
      margin: 0; padding: 2rem 1rem 4rem;
      background: #f6f8fa; color: #1f2328;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 16px; line-height: 1.5;
  }
  .aviso {
      max-width: 1012px; margin: 0 auto 1rem; padding: .75rem 1rem;
      background: #fff8c5; border: 1px solid #d4a72c66; border-radius: 6px; font-size: 14px;
  }
  .caja {
      max-width: 1012px; margin: 0 auto; padding: 2rem;
      background: #fff; border: 1px solid #d1d9e0; border-radius: 6px;
  }
  .caja h2 { padding-bottom: .3em; border-bottom: 1px solid #d1d9e0; margin-top: 24px; font-size: 1.5em; }
  .caja h3 { margin-top: 24px; font-size: 1.25em; }
  .caja h2:first-child { margin-top: 0; }
  .caja p { margin: 0 0 16px; }
  .caja ul { padding-left: 2em; }
  .caja li { margin-top: .25em; }
  .caja a { color: #0969da; text-decoration: none; }
  .caja a:hover { text-decoration: underline; }
  .caja img { vertical-align: middle; max-width: 100%; }
  .caja code {
      padding: .2em .4em; margin: 0; font-size: 85%;
      background: #eff1f3; border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
      body { background: #0d1117; color: #e6edf3; }
      .caja { background: #0d1117; border-color: #3d444d; }
      .caja h2, .caja h3 { border-color: #3d444d; }
      .caja a { color: #4493f8; }
      .caja code { background: #6a737d33; }
      .aviso { background: #341a00; border-color: #9e6a03; color: #e6edf3; }
  }
</style>
</head>
<body>
<div class="aviso">
  <strong>Vista previa local.</strong> Renderizado por la API de GitHub, así que el formato es
  el real. Diferencias con el perfil publicado: no aparecen la foto, la barra lateral ni los
  repos fijados, y el ancho puede variar. Las insignias se cargan de img.shields.io.
</div>
<div class="caja">
${cuerpo}
</div>
</body>
</html>`;

writeFileSync("vista-previa-perfil.html", pagina);
console.log("\n✓ Escrito: Personal/Portafolio/vista-previa-perfil.html");
console.log("  Ábrelo con:  start vista-previa-perfil.html");
