/* ============================================================
   Notas — filtrado por tipo.
   La lógica está en comun.js, que se carga antes; aquí solo se configura.
   ============================================================ */

(function () {
    "use strict";

    if (!window.PORTAFOLIO) return;

    window.PORTAFOLIO.filtrar({
        items: ".nota",
        atributo: "data-tipo",
        vacio: "sin-resultados",
        parametro: "tipo"
    });
})();
