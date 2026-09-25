/* ============================================================
   Lector y dictado.

   Todo ocurre en el navegador. Las dos librerías (pdf.js y mammoth)
   viven en ./vendor/ y NO se cargan hasta que alguien abre un PDF o un
   Word: son 2 MB que nadie debe pagar por escribir cuatro líneas.

   Por qué están en vendor/ y no en un CDN: la cabecera
   Content-Security-Policy del sitio declara script-src 'self', así que
   un script externo se bloquea. Es deliberado — es lo que sostiene que
   nada sale de tu equipo.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Constantes ---------- */

    /* Chrome corta los enunciados largos: por encima de unos cientos de
       caracteres la voz se detiene a media frase sin lanzar error. Se habla
       por trozos y cada uno es su propio enunciado. El tope es holgado
       respecto del límite real para no depender de una cifra exacta que
       cambia entre versiones. */
    var MAX_TROZO = 220;

    var CLAVE_BORRADOR = "lector-texto:borrador";
    var CLAVE_PREFS = "lector-texto:prefs";
    var ESPERA_GUARDADO = 700;

    /* Los archivos que se leen como texto plano sin más ceremonia. */
    var EXT_TEXTO = ["txt", "md", "markdown", "csv", "log", "json", "xml", "srt", "vtt"];

    /* ---------- Elementos ---------- */
    var $ = function (id) { return document.getElementById(id); };

    var elTexto = $("texto");
    var elVista = $("vista");
    var elZona = $("zona");
    var elArchivo = $("archivo");
    var elContador = $("contador");
    var elEstado = $("estado");

    var elIdioma = $("idioma");
    var elVoz = $("voz");
    var elVelocidad = $("velocidad");
    var elVelocidadValor = $("velocidad-valor");
    var elTono = $("tono");
    var elTonoValor = $("tono-valor");

    var btnLeer = $("btn-leer");
    var btnPausa = $("btn-pausa");
    var btnDetener = $("btn-detener");
    var btnDictar = $("btn-dictar");
    var btnLimpiar = $("btn-limpiar");
    var btnCopiar = $("btn-copiar");
    var btnTxt = $("btn-txt");
    var btnPdf = $("btn-pdf");

    var elProgreso = $("progreso");
    var elProgresoRelleno = $("progreso-relleno");
    var elProgresoTexto = $("progreso-texto");
    var elGrabando = $("grabando");
    var elParcial = $("parcial");
    var elImpresion = $("impresion");

    /* Sin el textarea no hay herramienta: la página se cargó a medias. */
    if (!elTexto) return;

    /* ---------- Estado ---------- */
    var vocesDisponibles = [];
    var frases = [];
    var indiceActual = 0;

    /* Generación de lectura. cancel() dispara onend del enunciado en curso,
       que sin este contador haría avanzar al siguiente trozo justo después
       de haber pulsado Detener. */
    var generacion = 0;

    /* Chrome recoge el enunciado con el recolector de basura a mitad de
       frase si nadie lo referencia. Vive aquí para que no pase. */
    var enunciadoVivo = null;

    var reconocedor = null;
    var queremosDictar = false;
    var reintentosDictado = 0;

    var temporizadorGuardado = null;
    var cargando = {};

    /* ============================================================
       ESTADO VISIBLE
       ============================================================ */
    function decir(mensaje, tipo) {
        elEstado.textContent = mensaje || "";
        elEstado.className = "estado" + (tipo ? " es-" + tipo : "");
    }

    /* ============================================================
       CONTADOR
       ============================================================ */
    function actualizarContador() {
        var texto = elTexto.value;
        var palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
        elContador.textContent = palabras.toLocaleString("es-MX") + " palabras · " +
            texto.length.toLocaleString("es-MX") + " caracteres";
    }

    /* ============================================================
       BORRADOR Y PREFERENCIAS
       ============================================================ */
    function guardarBorrador() {
        try {
            localStorage.setItem(CLAVE_BORRADOR, elTexto.value);
        } catch (e) {
            /* Modo privado, almacenamiento lleno o bloqueado. El texto sigue
               en la pantalla; solo no sobrevive a un cierre de pestaña. */
        }
    }

    function guardarBorradorDiferido() {
        clearTimeout(temporizadorGuardado);
        temporizadorGuardado = setTimeout(guardarBorrador, ESPERA_GUARDADO);
    }

    function recuperarBorrador() {
        try {
            var guardado = localStorage.getItem(CLAVE_BORRADOR);
            if (guardado) {
                elTexto.value = guardado;
                decir("Se recuperó el texto de la última vez.");
            }
        } catch (e) { }
    }

    function guardarPrefs() {
        try {
            localStorage.setItem(CLAVE_PREFS, JSON.stringify({
                idioma: elIdioma.value,
                voz: elVoz.value,
                velocidad: elVelocidad.value,
                tono: elTono.value
            }));
        } catch (e) { }
    }

    function leerPrefs() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE_PREFS)) || {};
        } catch (e) {
            return {};
        }
    }

    /* ============================================================
       DIVIDIR EN FRASES

       Devuelve rangos contiguos que cubren TODO el texto, para que la vista
       de lectura pueda reconstruirlo carácter por carácter, saltos de línea
       incluidos. Los que solo tienen espacios se pintan pero no se hablan.
       ============================================================ */
    function dividirEnFrases(texto) {
        var salida = [];
        var inicio = 0;
        var i = 0;
        var largo = texto.length;

        function cerrar(fin) {
            if (fin <= inicio) return;
            var trozo = texto.slice(inicio, fin);
            salida.push({
                inicio: inicio,
                fin: fin,
                texto: trozo.trim(),
                hablable: /\S/.test(trozo)
            });
            inicio = fin;
        }

        while (i < largo) {
            var c = texto.charAt(i);

            /* Fin de párrafo: corta siempre. Mantiene la estructura y evita
               que dos ideas se peguen en una sola respiración. */
            if (c === "\n") {
                cerrar(i + 1);
                i++;
                continue;
            }

            /* Fin de oración: el signo puede venir seguido de cierres de
               comilla o paréntesis antes del espacio. */
            if (c === "." || c === "!" || c === "?" || c === "…") {
                var j = i + 1;
                while (j < largo && /["'»”)\]]/.test(texto.charAt(j))) j++;

                /* Solo cuenta como final si después hay espacio o se acabó el
                   texto. Así "3.5" o "archivo.txt" no se parten. */
                if (j >= largo || /\s/.test(texto.charAt(j))) {
                    while (j < largo && texto.charAt(j) === " ") j++;
                    cerrar(j);
                    i = j;
                    continue;
                }
                i = j;
                continue;
            }

            /* Frase kilométrica sin puntuación: se corta en el último espacio
               antes del tope, porque si llega entera Chrome la trunca. */
            if (i - inicio >= MAX_TROZO) {
                var corte = texto.lastIndexOf(" ", i);
                if (corte <= inicio) corte = i;
                cerrar(corte + 1);
                i = Math.max(inicio, i);
                continue;
            }

            i++;
        }

        cerrar(largo);
        return salida;
    }

    /* ============================================================
       VISTA DE LECTURA
       ============================================================ */
    function pintarVista() {
        elVista.textContent = "";
        var texto = elTexto.value;

        frases.forEach(function (frase, indice) {
            var span = document.createElement("span");
            span.textContent = texto.slice(frase.inicio, frase.fin);

            if (frase.hablable) {
                span.className = "frase";
                span.dataset.indice = String(indice);
                span.setAttribute("role", "button");
                span.setAttribute("tabindex", "0");
                span.title = "Leer desde aquí";
            }

            elVista.appendChild(span);
        });
    }

    function marcarFrase(indice) {
        var spans = elVista.querySelectorAll(".frase");
        Array.prototype.forEach.call(spans, function (span) {
            var i = Number(span.dataset.indice);
            span.classList.toggle("activa", i === indice);
            span.classList.toggle("leida", i < indice);
        });

        seguirFrase(elVista.querySelector(".frase.activa"));
    }

    /* Mueve SOLO el interior de la vista, nunca la página.
       scrollIntoView() arrastra a todos los ancestros, así que al pulsar Leer
       daba un tirón a la página entera aunque la frase ya estuviera a la
       vista. Y solo se mueve si de verdad se salió del área visible: seguir
       recolocando algo que ya se ve es mareante. */
    function seguirFrase(activa) {
        if (!activa) return;

        var arriba = activa.offsetTop - elVista.offsetTop;
        var abajo = arriba + activa.offsetHeight;
        var visibleArriba = elVista.scrollTop;
        var visibleAbajo = visibleArriba + elVista.clientHeight;

        if (arriba >= visibleArriba && abajo <= visibleAbajo) return;

        elVista.scrollTop = Math.max(
            0,
            arriba - (elVista.clientHeight / 2) + (activa.offsetHeight / 2)
        );
    }

    function modoLectura(activo) {
        elTexto.hidden = activo;
        elVista.hidden = !activo;
        elProgreso.hidden = !activo;
    }

    /* ============================================================
       VOCES

       getVoices() suele devolver un array vacío en la primera llamada: el
       navegador las carga de forma asíncrona y avisa con voiceschanged.
       ============================================================ */
    function cargarVoces() {
        if (!("speechSynthesis" in window)) return;

        vocesDisponibles = window.speechSynthesis.getVoices() || [];
        if (!vocesDisponibles.length) return;

        pintarVoces();
    }

    function pintarVoces() {
        var idioma = elIdioma.value;
        var prefs = leerPrefs();
        var deseada = elVoz.value || prefs.voz || "";

        var filtradas = vocesDisponibles.filter(function (voz) {
            if (idioma === "todas") return true;
            /* Coincide por prefijo de idioma: "es-MX" acepta "es-MX" y "es-US"
               no, pero "es" sí trae todas las variantes cuando la exacta no
               existe. Se resuelve más abajo. */
            return voz.lang.replace("_", "-").toLowerCase() === idioma.toLowerCase();
        });

        /* Windows rara vez tiene la variante exacta instalada. Antes de
           dejar el selector vacío, se cae al idioma base. */
        if (!filtradas.length && idioma !== "todas") {
            var base = idioma.split("-")[0].toLowerCase();
            filtradas = vocesDisponibles.filter(function (voz) {
                return voz.lang.toLowerCase().indexOf(base) === 0;
            });
        }

        if (!filtradas.length) filtradas = vocesDisponibles;

        elVoz.textContent = "";
        filtradas.forEach(function (voz) {
            var opcion = document.createElement("option");
            opcion.value = voz.name;
            opcion.textContent = voz.name + " (" + voz.lang + ")";
            elVoz.appendChild(opcion);
        });

        /* Conserva la voz elegida si sigue en la lista. */
        var existe = filtradas.some(function (voz) { return voz.name === deseada; });
        if (existe) elVoz.value = deseada;
    }

    function vozElegida() {
        var nombre = elVoz.value;
        for (var i = 0; i < vocesDisponibles.length; i++) {
            if (vocesDisponibles[i].name === nombre) return vocesDisponibles[i];
        }
        return null;
    }

    /* ============================================================
       LEER EN VOZ ALTA
       ============================================================ */
    function hablar(desde) {
        if (!("speechSynthesis" in window)) {
            decir("Este navegador no tiene síntesis de voz.", "error");
            return;
        }

        var texto = elTexto.value;
        if (!texto.trim()) {
            decir("No hay texto que leer.", "error");
            elTexto.focus();
            return;
        }

        window.speechSynthesis.cancel();
        generacion++;

        frases = dividirEnFrases(texto);
        pintarVista();
        modoLectura(true);

        indiceActual = typeof desde === "number" ? desde : 0;
        siguienteTrozo(generacion);

        btnLeer.textContent = "Reiniciar";
        btnPausa.disabled = false;
        btnPausa.textContent = "Pausar";
        btnDetener.disabled = false;
        decir("");
    }

    function siguienteTrozo(gen) {
        if (gen !== generacion) return;

        /* Salta los rangos que solo tienen espacios o saltos de línea. */
        while (indiceActual < frases.length && !frases[indiceActual].hablable) {
            indiceActual++;
        }

        if (indiceActual >= frases.length) {
            terminarLectura();
            return;
        }

        marcarFrase(indiceActual);
        actualizarProgreso();

        var enunciado = new SpeechSynthesisUtterance(frases[indiceActual].texto);
        var voz = vozElegida();

        if (voz) {
            enunciado.voice = voz;
            enunciado.lang = voz.lang;
        } else if (elIdioma.value !== "todas") {
            enunciado.lang = elIdioma.value;
        }

        enunciado.rate = parseFloat(elVelocidad.value);
        enunciado.pitch = parseFloat(elTono.value);

        enunciado.onend = function () {
            if (gen !== generacion) return;
            indiceActual++;
            siguienteTrozo(gen);
        };

        enunciado.onerror = function (evento) {
            if (gen !== generacion) return;

            /* "interrupted" y "canceled" son la consecuencia normal de pulsar
               Detener o Reiniciar: no son fallos que haya que anunciar. */
            if (evento.error === "interrupted" || evento.error === "canceled") return;

            decir("La lectura se interrumpió (" + evento.error + ").", "error");
            terminarLectura();
        };

        enunciadoVivo = enunciado;
        window.speechSynthesis.speak(enunciado);
    }

    function actualizarProgreso() {
        var hablables = frases.filter(function (f) { return f.hablable; }).length;
        var hechas = frases.slice(0, indiceActual).filter(function (f) { return f.hablable; }).length;
        var porcentaje = hablables ? Math.round((hechas / hablables) * 100) : 0;

        elProgresoRelleno.style.width = porcentaje + "%";
        elProgresoTexto.textContent = "Frase " + Math.min(hechas + 1, hablables) + " de " +
            hablables + " · " + porcentaje + "%";
    }

    function terminarLectura() {
        generacion++;
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        enunciadoVivo = null;

        modoLectura(false);
        btnLeer.textContent = "Leer";
        btnPausa.disabled = true;
        btnPausa.textContent = "Pausar";
        btnDetener.disabled = true;
    }

    /* ============================================================
       DICTAR
       ============================================================ */
    function claseReconocedor() {
        return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }

    function crearReconocedor() {
        var Clase = claseReconocedor();
        if (!Clase) return null;

        var rec = new Clase();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.lang = elIdioma.value === "todas" ? "es-MX" : elIdioma.value;

        rec.onresult = function (evento) {
            var parcial = "";
            var definitivo = "";

            for (var i = evento.resultIndex; i < evento.results.length; i++) {
                var trozo = evento.results[i][0].transcript;
                if (evento.results[i].isFinal) {
                    definitivo += trozo;
                } else {
                    parcial += trozo;
                }
            }

            elParcial.textContent = parcial;

            if (definitivo) {
                insertarDictado(definitivo);
                reintentosDictado = 0;
            }
        };

        rec.onerror = function (evento) {
            if (evento.error === "no-speech") {
                /* Silencio prolongado. No es un fallo: onend lo reengancha. */
                return;
            }

            if (evento.error === "not-allowed" || evento.error === "service-not-allowed") {
                queremosDictar = false;
                decir("El navegador negó el micrófono. Revisa el permiso del sitio, " +
                    "y que la página se sirva por HTTPS o desde localhost.", "error");
                return;
            }

            if (evento.error === "audio-capture") {
                queremosDictar = false;
                decir("No se encontró ningún micrófono.", "error");
                return;
            }

            if (evento.error === "network") {
                decir("El reconocimiento de voz perdió la conexión. Necesita internet.", "error");
                return;
            }

            decir("Error de dictado: " + evento.error, "error");
        };

        /* Chrome cierra la sesión solo tras unos segundos de silencio, aunque
           continuous sea true. Sin este reenganche el dictado largo muere sin
           avisar y el usuario sigue hablándole a nada. */
        rec.onend = function () {
            elParcial.textContent = "";

            if (!queremosDictar) {
                pintarDictado(false);
                return;
            }

            /* Freno: si se cierra una y otra vez sin transcribir nada, algo va
               mal de verdad y reintentar sería un bucle. */
            reintentosDictado++;
            if (reintentosDictado > 40) {
                queremosDictar = false;
                pintarDictado(false);
                decir("El dictado se detuvo: el navegador cerró la sesión demasiadas veces.", "error");
                return;
            }

            try {
                rec.start();
            } catch (e) {
                queremosDictar = false;
                pintarDictado(false);
            }
        };

        return rec;
    }

    function insertarDictado(fragmento) {
        var limpio = fragmento.replace(/^\s+/, "");
        if (!limpio) return;

        var actual = elTexto.value;
        var separador = "";

        if (actual && !/\s$/.test(actual)) {
            /* Si lo último es un cierre de oración, se empieza otra. */
            separador = /[.!?…]$/.test(actual) ? " " : " ";
        }

        elTexto.value = actual + separador + limpio;
        elTexto.scrollTop = elTexto.scrollHeight;

        actualizarContador();
        guardarBorradorDiferido();
    }

    function pintarDictado(activo) {
        elGrabando.hidden = !activo;
        btnDictar.textContent = activo ? "Detener dictado" : "Empezar a dictar";
        btnDictar.classList.toggle("btn--primary", !activo);
        if (!activo) elParcial.textContent = "";
    }

    function alternarDictado() {
        if (queremosDictar) {
            queremosDictar = false;
            if (reconocedor) {
                try { reconocedor.stop(); } catch (e) { }
            }
            pintarDictado(false);
            decir("Dictado detenido.");
            return;
        }

        if (!claseReconocedor()) {
            decir("Este navegador no tiene reconocimiento de voz. Funciona en Chrome y Edge.", "error");
            return;
        }

        if (!window.isSecureContext) {
            decir("El micrófono exige una conexión segura: HTTPS o localhost.", "error");
            return;
        }

        /* Hablar y escuchar a la vez haría que el reconocedor transcriba la
           propia voz del lector. */
        if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
            terminarLectura();
        }

        reconocedor = crearReconocedor();
        if (!reconocedor) return;

        queremosDictar = true;
        reintentosDictado = 0;

        try {
            reconocedor.start();
            pintarDictado(true);
            decir("Escuchando. Habla con normalidad; el texto se va agregando al final.");
        } catch (e) {
            queremosDictar = false;
            pintarDictado(false);
            decir("No se pudo iniciar el dictado: " + e.message, "error");
        }
    }

    /* ============================================================
       ARCHIVOS
       ============================================================ */
    function cargarScript(ruta) {
        if (cargando[ruta]) return cargando[ruta];

        cargando[ruta] = new Promise(function (resolver, rechazar) {
            var etiqueta = document.createElement("script");
            etiqueta.src = ruta;
            etiqueta.onload = function () { resolver(); };
            etiqueta.onerror = function () {
                delete cargando[ruta];
                rechazar(new Error("No se pudo cargar " + ruta));
            };
            document.head.appendChild(etiqueta);
        });

        return cargando[ruta];
    }

    function extension(nombre) {
        var partes = nombre.toLowerCase().split(".");
        return partes.length > 1 ? partes.pop() : "";
    }

    function leerArchivo(archivo) {
        if (!archivo) return;

        var ext = extension(archivo.name);
        decir("Leyendo " + archivo.name + "…");

        if (EXT_TEXTO.indexOf(ext) !== -1 || archivo.type.indexOf("text/") === 0) {
            leerComoTexto(archivo);
        } else if (ext === "pdf" || archivo.type === "application/pdf") {
            leerPdf(archivo);
        } else if (ext === "docx") {
            leerDocx(archivo);
        } else if (ext === "doc") {
            decir("El formato .doc antiguo no se puede leer en el navegador. " +
                "Ábrelo en Word y guárdalo como .docx.", "error");
        } else {
            /* Un archivo desconocido se intenta como texto: peor caso, sale
               ilegible y no pasa nada. */
            leerComoTexto(archivo);
        }
    }

    function leerComoTexto(archivo) {
        var lector = new FileReader();

        lector.onload = function () {
            volcar(String(lector.result), archivo.name);
        };
        lector.onerror = function () {
            decir("No se pudo leer el archivo.", "error");
        };

        lector.readAsText(archivo, "UTF-8");
    }

    function leerPdf(archivo) {
        cargarScript("./vendor/pdf.min.js")
            .then(function () {
                var pdfjs = window.pdfjsLib;
                if (!pdfjs) throw new Error("pdf.js no quedó disponible.");

                pdfjs.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.min.js";
                return archivo.arrayBuffer();
            })
            .then(function (buffer) {
                return window.pdfjsLib.getDocument({
                    data: new Uint8Array(buffer),
                    /* La cabecera de seguridad del sitio no permite eval, y
                       pdf.js lo usa en rutas que aquí no hacen falta: solo se
                       extrae texto, no se dibuja la página. */
                    isEvalSupported: false
                }).promise;
            })
            .then(function (documento) {
                var paginas = [];

                function siguiente(numero) {
                    if (numero > documento.numPages) {
                        return Promise.resolve();
                    }

                    decir("Leyendo página " + numero + " de " + documento.numPages + "…");

                    return documento.getPage(numero)
                        .then(function (pagina) { return pagina.getTextContent(); })
                        .then(function (contenido) {
                            var linea = "";
                            contenido.items.forEach(function (item) {
                                linea += item.str;
                                /* hasEOL marca donde el PDF termina un renglón.
                                   Sin esto todo el texto sale en un párrafo
                                   único e ilegible. */
                                if (item.hasEOL) linea += "\n";
                            });
                            paginas.push(linea.replace(/[ \t]+\n/g, "\n").trim());
                            return siguiente(numero + 1);
                        });
                }

                return siguiente(1).then(function () {
                    var texto = paginas.join("\n\n");

                    if (!texto.trim()) {
                        decir("Ese PDF no tiene capa de texto: son imágenes escaneadas. " +
                            "Haría falta reconocimiento óptico, que esta herramienta no hace.", "error");
                        return;
                    }

                    volcar(texto, archivo.name, documento.numPages + " páginas");
                });
            })
            .catch(function (error) {
                decir("No se pudo leer el PDF: " + error.message, "error");
            });
    }

    function leerDocx(archivo) {
        cargarScript("./vendor/mammoth.browser.min.js")
            .then(function () {
                if (!window.mammoth) throw new Error("mammoth no quedó disponible.");
                return archivo.arrayBuffer();
            })
            .then(function (buffer) {
                return window.mammoth.extractRawText({ arrayBuffer: buffer });
            })
            .then(function (resultado) {
                if (!resultado.value.trim()) {
                    decir("El documento no tiene texto.", "error");
                    return;
                }
                volcar(resultado.value, archivo.name);
            })
            .catch(function (error) {
                decir("No se pudo leer el documento: " + error.message, "error");
            });
    }

    /* Deja el contenido en el editor. Si ya había algo, se agrega al final en
       vez de reemplazarlo: perder lo escrito por abrir un archivo sería una
       sorpresa desagradable. */
    function volcar(texto, nombre, extra) {
        var previo = elTexto.value;
        var nota = nombre + (extra ? " · " + extra : "");

        if (previo.trim()) {
            elTexto.value = previo.replace(/\s+$/, "") + "\n\n" + texto;
            decir("Se agregó " + nota + " al final del texto que ya había.", "ok");
        } else {
            elTexto.value = texto;
            decir("Listo: " + nota + ".", "ok");
        }

        actualizarContador();
        guardarBorrador();
    }

    /* ============================================================
       SALIDA
       ============================================================ */
    function copiar() {
        var texto = elTexto.value;
        if (!texto) {
            decir("No hay nada que copiar.", "error");
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(function () {
                decir("Texto copiado al portapapeles.", "ok");
            }).catch(function () {
                copiarALaAntigua(texto);
            });
        } else {
            copiarALaAntigua(texto);
        }
    }

    function copiarALaAntigua(texto) {
        /* Sin permiso de portapapeles o sin HTTPS queda execCommand, que
           depende de que haya una selección real en un campo visible. */
        var estabaOculto = elTexto.hidden;
        elTexto.hidden = false;
        elTexto.select();

        var bien = false;
        try {
            bien = document.execCommand("copy");
        } catch (e) { }

        elTexto.hidden = estabaOculto;
        window.getSelection().removeAllRanges();

        decir(bien ? "Texto copiado al portapapeles." : "El navegador no dejó copiar. Selecciona y usa Ctrl+C.",
            bien ? "ok" : "error");
        void texto;
    }

    function nombreArchivo(ext) {
        var f = new Date();
        function dos(n) { return String(n).padStart(2, "0"); }
        return "texto-" + f.getFullYear() + "-" + dos(f.getMonth() + 1) + "-" + dos(f.getDate()) +
            "-" + dos(f.getHours()) + dos(f.getMinutes()) + "." + ext;
    }

    function descargarTxt() {
        var texto = elTexto.value;
        if (!texto) {
            decir("No hay nada que descargar.", "error");
            return;
        }

        /* El BOM es lo que hace que el Bloc de notas y Excel abran los
           acentos bien en Windows. Sin él, "canción" sale "canciÃ³n". */
        var contenido = new Blob(["﻿" + texto], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(contenido);
        var enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = nombreArchivo("txt");
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        decir("Archivo descargado.", "ok");
    }

    function imprimir() {
        var texto = elTexto.value;
        if (!texto) {
            decir("No hay nada que imprimir.", "error");
            return;
        }

        /* textContent y no innerHTML: el texto puede venir de un PDF ajeno y
           no hay razón para interpretarlo como marcado. */
        elImpresion.textContent = texto;
        window.print();
    }

    /* ============================================================
       SOPORTE DEL NAVEGADOR
       ============================================================ */
    function pintarSoporte() {
        var lista = $("soporte-lista");
        if (!lista) return;

        var haySintesis = "speechSynthesis" in window;
        var hayDictado = !!claseReconocedor();
        var seguro = !!window.isSecureContext;

        var filas = [
            {
                ok: haySintesis,
                texto: haySintesis
                    ? "Lectura en voz alta disponible, con las voces instaladas en el sistema."
                    : "Lectura en voz alta no disponible en este navegador."
            },
            {
                ok: hayDictado && seguro,
                texto: !hayDictado
                    ? "Dictado no disponible: solo lo traen Chrome y Edge."
                    : (seguro
                        ? "Dictado disponible. El audio se transcribe en los servidores del navegador."
                        : "Dictado no disponible: la página no se sirve por HTTPS ni desde localhost.")
            },
            { ok: true, texto: "Archivos de texto, PDF y Word se procesan aquí mismo, sin subirlos a ningún sitio." },
            {
                ok: true,
                texto: "Lo que escribes se guarda en este navegador y no viaja a ningún servidor."
            }
        ];

        filas.forEach(function (fila) {
            var li = document.createElement("li");
            var marca = document.createElement("span");
            marca.className = "soporte__marca soporte__marca--" + (fila.ok ? "si" : "no");
            marca.textContent = fila.ok ? "✓" : "✗";
            marca.setAttribute("aria-hidden", "true");

            var span = document.createElement("span");
            span.textContent = fila.texto;

            li.appendChild(marca);
            li.appendChild(span);
            lista.appendChild(li);
        });

        if (!haySintesis) $("panel-leer").classList.add("no-soportado");
        if (!hayDictado || !seguro) $("panel-dictar").classList.add("no-soportado");
    }

    /* ============================================================
       ENLACES DE EVENTOS
       ============================================================ */
    elTexto.addEventListener("input", function () {
        actualizarContador();
        guardarBorradorDiferido();
    });

    elArchivo.addEventListener("change", function () {
        leerArchivo(elArchivo.files[0]);
        /* Se limpia para que abrir el mismo archivo dos veces seguidas
           vuelva a disparar el evento. */
        elArchivo.value = "";
    });

    /* Arrastrar y soltar. dragover necesita preventDefault o el navegador
       abre el archivo en lugar de entregárnoslo. */
    ["dragenter", "dragover"].forEach(function (evento) {
        elZona.addEventListener(evento, function (e) {
            e.preventDefault();
            elZona.classList.add("esta-encima");
        });
    });

    ["dragleave", "drop"].forEach(function (evento) {
        elZona.addEventListener(evento, function (e) {
            e.preventDefault();
            /* dragleave también salta al pasar sobre un hijo: solo cuenta si
               el puntero salió de la zona de verdad. */
            if (evento === "dragleave" && elZona.contains(e.relatedTarget)) return;
            elZona.classList.remove("esta-encima");
        });
    });

    elZona.addEventListener("drop", function (e) {
        if (e.dataTransfer && e.dataTransfer.files.length) {
            leerArchivo(e.dataTransfer.files[0]);
        }
    });

    btnLimpiar.addEventListener("click", function () {
        if (!elTexto.value) return;
        if (!window.confirm("¿Borrar todo el texto? No se puede deshacer.")) return;

        terminarLectura();
        elTexto.value = "";
        actualizarContador();
        guardarBorrador();
        decir("Texto borrado.");
        elTexto.focus();
    });

    btnLeer.addEventListener("click", function () { hablar(0); });

    btnPausa.addEventListener("click", function () {
        if (!("speechSynthesis" in window)) return;

        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            btnPausa.textContent = "Pausar";
        } else {
            window.speechSynthesis.pause();
            btnPausa.textContent = "Continuar";
        }
    });

    btnDetener.addEventListener("click", function () {
        terminarLectura();
        decir("Lectura detenida.");
    });

    btnDictar.addEventListener("click", alternarDictado);
    btnCopiar.addEventListener("click", copiar);
    btnTxt.addEventListener("click", descargarTxt);
    btnPdf.addEventListener("click", imprimir);

    /* Clic o Enter sobre una frase: leer desde ahí. */
    elVista.addEventListener("click", function (e) {
        var frase = e.target.closest(".frase");
        if (frase) hablar(Number(frase.dataset.indice));
    });

    elVista.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var frase = e.target.closest(".frase");
        if (!frase) return;
        e.preventDefault();
        hablar(Number(frase.dataset.indice));
    });

    elIdioma.addEventListener("change", function () {
        pintarVoces();
        guardarPrefs();
        /* El reconocedor fija su idioma al crearse: si está dictando, hay que
           rehacerlo para que el cambio surta efecto. */
        if (queremosDictar) {
            alternarDictado();
            alternarDictado();
        }
    });

    elVoz.addEventListener("change", guardarPrefs);

    elVelocidad.addEventListener("input", function () {
        elVelocidadValor.textContent = parseFloat(elVelocidad.value).toFixed(1) + "×";
        guardarPrefs();
    });

    elTono.addEventListener("input", function () {
        elTonoValor.textContent = parseFloat(elTono.value).toFixed(1);
        guardarPrefs();
    });

    /* Salir de la página con la voz hablando la deja sonando en algunos
       navegadores, porque speechSynthesis vive en el nivel del navegador y no
       en el de la pestaña. */
    window.addEventListener("beforeunload", function () {
        clearTimeout(temporizadorGuardado);
        guardarBorrador();
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        queremosDictar = false;
        if (reconocedor) {
            try { reconocedor.abort(); } catch (e) { }
        }
    });

    /* ============================================================
       ARRANQUE
       ============================================================ */
    (function iniciar() {
        var prefs = leerPrefs();

        if (prefs.idioma) elIdioma.value = prefs.idioma;
        if (prefs.velocidad) elVelocidad.value = prefs.velocidad;
        if (prefs.tono) elTono.value = prefs.tono;

        elVelocidadValor.textContent = parseFloat(elVelocidad.value).toFixed(1) + "×";
        elTonoValor.textContent = parseFloat(elTono.value).toFixed(1);

        recuperarBorrador();
        actualizarContador();
        pintarSoporte();

        if ("speechSynthesis" in window) {
            cargarVoces();
            window.speechSynthesis.onvoiceschanged = cargarVoces;

            /* Safari no siempre dispara voiceschanged. Un reintento tardío
               evita quedarse con el selector en "Cargando voces…". */
            setTimeout(cargarVoces, 600);
            setTimeout(function () {
                if (!vocesDisponibles.length) {
                    elVoz.textContent = "";
                    var opcion = document.createElement("option");
                    opcion.value = "";
                    opcion.textContent = "Voz predeterminada del sistema";
                    elVoz.appendChild(opcion);
                }
            }, 2000);
        } else {
            elVoz.textContent = "";
            var opcion = document.createElement("option");
            opcion.textContent = "Sin voces disponibles";
            elVoz.appendChild(opcion);
        }
    })();

})();
