/* ============================================================
   Servidor local con las cabeceras reales del sitio.

   Por qué existe: `python -m http.server` sirve los archivos pero NO manda
   las cabeceras de vercel.json. La Content-Security-Policy de este sitio es
   restrictiva a propósito, así que una página puede funcionar perfecta en
   local y romperse en producción sin que nadie lo vea venir — un script que
   la política bloquea falla en silencio salvo en la consola.

   Este servidor lee vercel.json y aplica exactamente lo que declara, para
   que lo que se prueba en local sea lo que se publica.

       node servidor-local.mjs
       node servidor-local.mjs 8080

   Necesita Node 18 o superior. Con la versión vieja del PATH (v10) no
   arranca: usar la de nvm.
   ============================================================ */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL(".", import.meta.url));
const PUERTO = Number(process.argv[2]) || 8000;

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".pdf": "application/pdf",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8"
};

/* ---------- Cabeceras desde vercel.json ---------- */
async function leerCabeceras() {
    try {
        const crudo = await readFile(join(RAIZ, "vercel.json"), "utf8");
        const config = JSON.parse(crudo);
        const salida = {};

        for (const regla of config.headers ?? []) {
            /* Solo se aplican las reglas que cubren todo el sitio. Una regla
               por ruta concreta tendría que compararse contra cada petición, y
               hoy no existe ninguna. */
            if (regla.source !== "/(.*)") continue;
            for (const { key, value } of regla.headers ?? []) {
                salida[key] = value;
            }
        }

        return salida;
    } catch (error) {
        console.error("No se pudo leer vercel.json:", error.message);
        console.error("Se sirve SIN cabeceras de seguridad: la prueba no vale.");
        return {};
    }
}

const CABECERAS = await leerCabeceras();

/* ---------- Servidor ---------- */
const servidor = createServer(async (peticion, respuesta) => {
    const url = new URL(peticion.url, "http://localhost");
    let ruta = decodeURIComponent(url.pathname);

    if (ruta.endsWith("/")) ruta += "index.html";

    /* Nadie debe poder salirse de la carpeta del sitio con ../ */
    const destino = normalize(join(RAIZ, ruta));
    if (!destino.startsWith(RAIZ.endsWith(sep) ? RAIZ : RAIZ + sep)) {
        respuesta.writeHead(403).end("Prohibido");
        return;
    }

    try {
        const info = await stat(destino);
        const archivo = info.isDirectory()
            ? join(destino, "index.html")
            : destino;

        const contenido = await readFile(archivo);
        const tipo = TIPOS[extname(archivo).toLowerCase()] ?? "application/octet-stream";

        respuesta.writeHead(200, {
            ...CABECERAS,
            "Content-Type": tipo,
            "Cache-Control": "no-store"
        });
        respuesta.end(contenido);

        console.log("200", ruta);
    } catch {
        respuesta.writeHead(404, { ...CABECERAS, "Content-Type": "text/plain; charset=utf-8" });
        respuesta.end("No encontrado: " + ruta);
        console.log("404", ruta);
    }
});

servidor.listen(PUERTO, () => {
    console.log("");
    console.log("  Sitio en  http://localhost:" + PUERTO + "/");
    console.log("");
    console.log("  Cabeceras aplicadas desde vercel.json:");
    for (const [clave, valor] of Object.entries(CABECERAS)) {
        console.log("   · " + clave + ": " + valor.slice(0, 110) + (valor.length > 110 ? "…" : ""));
    }
    if (!Object.keys(CABECERAS).length) {
        console.log("   (ninguna — revisar vercel.json)");
    }
    console.log("");
    console.log("  localhost cuenta como contexto seguro, así que el micrófono");
    console.log("  y el portapapeles funcionan igual que en producción.");
    console.log("");
    console.log("  Ctrl+C para parar.");
});
