/* ============================================================
   Notas — filtrado por tipo.
   ============================================================ */

(function () {
    "use strict";

    var year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    var filtros = document.querySelectorAll(".filter");
    var notas = document.querySelectorAll(".nota");
    var vacio = document.getElementById("sin-resultados");

    if (!filtros.length || !notas.length) return;

    function aplicar(tipo) {
        var visibles = 0;

        Array.prototype.forEach.call(notas, function (nota) {
            var coincide = tipo === "todas" || nota.getAttribute("data-tipo") === tipo;
            nota.hidden = !coincide;
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

            aplicar(boton.getAttribute("data-filter"));

            // Refleja el filtro en la URL para poder compartirlo o recargar sin perderlo.
            var tipo = boton.getAttribute("data-filter");
            var url = tipo === "todas"
                ? window.location.pathname
                : window.location.pathname + "?tipo=" + tipo;
            history.replaceState(null, "", url);
        });
    });

    // Filtro inicial desde la URL (?tipo=problema).
    var inicial = new URLSearchParams(window.location.search).get("tipo");
    if (inicial) {
        var boton = document.querySelector('.filter[data-filter="' + inicial + '"]');
        if (boton) boton.click();
    }
})();
