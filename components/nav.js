// components/nav.js

(function () {
    // grab all tab panes
    const panes = Array.from(document.querySelectorAll(".tab-pane"));

    function showTab(name) {
        panes.forEach(pane => {
            if (pane.id === `tab-${name}`) {
                pane.classList.remove("hidden");
            } else {
                pane.classList.add("hidden");
            }
        });
    }

    // nav bar buttons (desktop + mobile)
    document.querySelectorAll("[data-tab]").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-tab");
            showTab(target);
        });
    });

    // dashboard tiles & quick jumps
    document.querySelectorAll("[data-tab-jump]").forEach(el => {
        el.addEventListener("click", () => {
            const target = el.getAttribute("data-tab-jump");
            showTab(target);
        });
    });

    // footer year
    const y = document.getElementById("year");
    if (y) {
        y.textContent = new Date().getFullYear();
    }

    // default view on load
    showTab("home");
})();
