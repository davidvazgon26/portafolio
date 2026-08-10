/* ============================================================
   Herramientas — filtrado por categoría.
   La lógica está en comun.js, que se carga antes; aquí solo se configura.
   ============================================================ */

(function () {
    "use strict";

    if (!window.PORTAFOLIO) return;

    window.PORTAFOLIO.filtrar({
        items: ".herramienta",
        atributo: "data-categoria",
        vacio: "sin-resultados",
        parametro: "categoria"
    });
})();
