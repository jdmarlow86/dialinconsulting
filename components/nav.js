// components/nav.js
(function () {
    // All tab panes in the DOM
    const panes = Array.from(document.querySelectorAll(".tab-pane"));

    function showTab(name) {
        // Show the requested tab, hide the rest
        panes.forEach(pane => {
            if (pane.id === `tab-${name}`) {
                pane.classList.remove("hidden");
            } else {
                pane.classList.add("hidden");
            }
        });

        // Keep URL hash synced for reload / bookmarking
        window.location.hash = name;
    }

    // Handle clicks from desktop/mobile nav bars
    document.querySelectorAll("[data-tab]").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-tab");
            showTab(target);
        });
    });

    // Handle clicks from dashboard tiles, Schedule button, etc.
    document.querySelectorAll("[data-tab-jump]").forEach(el => {
        el.addEventListener("click", () => {
            const target = el.getAttribute("data-tab-jump");
            showTab(target);
        });
    });

    // Allow deep links like #phase or #invoices
    function initFromHash() {
        const hash = window.location.hash.replace(/^#/, "") || "home";
        showTab(hash);
    }

    window.addEventListener("hashchange", initFromHash);

    // Footer year
    const y = document.getElementById("year");
    if (y) {
        y.textContent = new Date().getFullYear();
    }

    // First load
    initFromHash();
})();
