/* ============================================================
   Portada — resaltado de la sección visible.

   El año, el menú móvil y el tema están en comun.js, que se carga antes.
   ============================================================ */

(function () {
    "use strict";

    var secciones = document.querySelectorAll("main section[id]");
    /* Solo anclas internas: un enlace a otra página nunca es "la sección
       que estoy viendo". */
    var enlaces = document.querySelectorAll('.nav__list a[href^="#"]');

    if (!("IntersectionObserver" in window) || !secciones.length) return;

    var observador = new IntersectionObserver(function (entradas) {
        Array.prototype.forEach.call(entradas, function (entrada) {
            if (!entrada.isIntersecting) return;

            var id = entrada.target.getAttribute("id");
            Array.prototype.forEach.call(enlaces, function (enlace) {
                enlace.classList.toggle(
                    "is-active",
                    enlace.getAttribute("href") === "#" + id
                );
            });
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    Array.prototype.forEach.call(secciones, function (seccion) {
        observador.observe(seccion);
    });
})();
