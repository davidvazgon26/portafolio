/* ============================================================
   Portafolio — David Vázquez
   ============================================================ */

(function () {
    "use strict";

    // Año del footer, para no volver a dejarlo desactualizado.
    var year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Cerrar el menú móvil al elegir un destino.
    var toggle = document.getElementById("nav-toggle");
    var links = document.querySelectorAll('.nav__list a[href^="#"]');

    if (toggle) {
        Array.prototype.forEach.call(links, function (link) {
            link.addEventListener("click", function () {
                toggle.checked = false;
            });
        });

        // Cerrarlo también al hacer clic fuera.
        document.addEventListener("click", function (e) {
            if (!toggle.checked) return;
            if (e.target.closest(".nav")) return;
            toggle.checked = false;
        });

        // ...y con Escape.
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && toggle.checked) {
                toggle.checked = false;
            }
        });
    }

    // Resaltar en el menú la sección visible.
    var sections = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window && sections.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var id = entry.target.getAttribute("id");
                Array.prototype.forEach.call(links, function (link) {
                    var active = link.getAttribute("href") === "#" + id;
                    link.style.color = active ? "var(--text)" : "";
                    link.style.borderBottomColor = active ? "var(--accent)" : "";
                });
            });
        }, { rootMargin: "-40% 0px -55% 0px" });

        Array.prototype.forEach.call(sections, function (section) {
            observer.observe(section);
        });
    }
})();
