// components/nav.js
(function () {
    // all tab panes
    const panes = Array.from(document.querySelectorAll(".tab-pane"));

    // showTab: hide all panes, show the selected one
    function showTab(name) {
        panes.forEach(pane => {
            if (pane.id === `tab-${name}`) {
                pane.classList.remove("hidden");
            } else {
                pane.classList.add("hidden");
            }
        });

        // highlight active tab in header nav (desktop + mobile)
        document.querySelectorAll("[data-tab]").forEach(btn => {
            const isActive = btn.getAttribute("data-tab") === name;
            btn.classList.toggle("bg-neutral-800", isActive);
        });

        // update hash so you can deep link like #phase
        window.location.hash = name;
    }

    // wire desktop+mobile nav buttons
    document.querySelectorAll("[data-tab]").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-tab");
            showTab(target);
        });
    });

    // wire dashboard tiles and any [data-tab-jump]
    document.querySelectorAll("[data-tab-jump]").forEach(el => {
        el.addEventListener("click", () => {
            const target = el.getAttribute("data-tab-jump");
            showTab(target);
        });
    });

    // react to manual hash changes
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.replace(/^#/, "") || "home";
        showTab(hash);
    });

    // footer year
    const y = document.getElementById("year");
    if (y) {
        y.textContent = new Date().getFullYear();
    }

    // initial tab on load
    const initial = window.location.hash.replace(/^#/, "") || "home";
    showTab(initial);
})();
