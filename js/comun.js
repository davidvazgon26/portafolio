/* ============================================================
   Común a todas las páginas.
   Se carga ANTES que el JS específico de cada página.

   Contiene lo que se repetía en index.js y notas.js, más el filtro
   genérico que usan la bitácora y las herramientas.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Año del footer ---------- */
    /* Para no volver a dejarlo desactualizado a mano. */
    var year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    /* ---------- Menú móvil ---------- */
    /* Abrir/cerrar es CSS puro (el checkbox). Aquí solo se cierra: al
       navegar, al hacer clic fuera y con Escape. */
    var toggle = document.getElementById("nav-toggle");

    if (toggle) {
        /* Todos los enlaces, no solo las anclas: los que van a otra página
           también deben cerrar el menú. Si no, al volver atrás el navegador
           puede restaurarlo abierto. */
        var enlaces = document.querySelectorAll(".nav__list a");

        Array.prototype.forEach.call(enlaces, function (enlace) {
            enlace.addEventListener("click", function () {
                toggle.checked = false;
            });
        });

        document.addEventListener("click", function (e) {
            if (!toggle.checked) return;
            if (e.target.closest(".nav")) return;
            toggle.checked = false;
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && toggle.checked) {
                toggle.checked = false;
            }
        });
    }

    /* ---------- Tema ---------- */
    /* El atributo data-theme en <html> lo aplica el script del <head> antes
       de pintar; aquí solo se gestiona el cambio manual.
       Sin preferencia guardada manda el sistema (prefers-color-scheme). */
    var botonTema = document.querySelector(".nav__tema");

    if (botonTema) {
        botonTema.addEventListener("click", function () {
            var raiz = document.documentElement;
            var actual = raiz.getAttribute("data-theme");

            /* Sin elección previa, se parte de lo que muestra el sistema. */
            if (!actual) {
                actual = window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
            }

            var nuevo = actual === "dark" ? "light" : "dark";
            raiz.setAttribute("data-theme", nuevo);

            try {
                localStorage.setItem("tema", nuevo);
            } catch (e) {
                /* Modo privado o almacenamiento bloqueado: el tema cambia
                   igual, solo que no se recuerda al recargar. */
            }
        });
    }

    /* ---------- Filtro genérico ---------- */
    /* Lo usan notas.js y herramientas.js. Se expone porque necesita
       parámetros; el resto de este archivo se auto-ejecuta.

       opciones.items      selector de los elementos filtrables
       opciones.atributo   atributo que se compara con data-filter
       opciones.vacio      id del mensaje de "sin resultados"
       opciones.parametro  nombre del parámetro en la URL */
    function filtrar(opciones) {
        var filtros = document.querySelectorAll(".filter");
        var items = document.querySelectorAll(opciones.items);
        var vacio = document.getElementById(opciones.vacio);

        /* Sin botones no hay nada que hacer. Con cero items SÍ hay que
           seguir: es el caso de un índice todavía vacío, donde el mensaje
           debe mostrarse en lugar de dejar los botones sin efecto. */
        if (!filtros.length) return;

        function aplicar(valor) {
            var visibles = 0;

            Array.prototype.forEach.call(items, function (item) {
                var coincide = valor === "todas" ||
                    item.getAttribute(opciones.atributo) === valor;
                item.hidden = !coincide;
                if (coincide) visibles++;
            });

            if (vacio) vacio.hidden = visibles > 0;
        }

        Array.prototype.forEach.call(filtros, function (boton) {
            boton.addEventListener("click", function () {
                Array.prototype.forEach.call(filtros, function (b) {
                    b.classList.remove("is-active");
                });
                boton.classList.add("is-active");

                var valor = boton.getAttribute("data-filter");
                aplicar(valor);

                /* Refleja el filtro en la URL: se puede compartir y
                   sobrevive a una recarga. */
                var url = valor === "todas"
                    ? window.location.pathname
                    : window.location.pathname + "?" + opciones.parametro + "=" + valor;
                history.replaceState(null, "", url);
            });
        });

        /* Estado inicial desde la URL (?tipo=problema). */
        var inicial = new URLSearchParams(window.location.search).get(opciones.parametro);
        if (inicial) {
            var boton = document.querySelector('.filter[data-filter="' + inicial + '"]');
            if (boton) boton.click();
        } else {
            /* Un índice vacío debe mostrar su mensaje desde el principio. */
            aplicar("todas");
        }
    }

    window.PORTAFOLIO = { filtrar: filtrar };
})();
