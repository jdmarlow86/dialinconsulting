document.addEventListener("DOMContentLoaded", () => {
        // Tries to find your existing header link for a given tab id
        function findHeaderTrigger(id) {
            // Common patterns — we try several so you don't have to refactor header markup
            return (
                document.querySelector(`[data-tab-target="${id}"]`) ||     // e.g. <a data-tab-target="appointments">
                document.querySelector(`[data-tab="${id}"]`) ||             // e.g. <button data-tab="appointments">
                document.querySelector(`a[href="#${id}"]`)                  // e.g. <a href="#appointments">
            );
        }

  // Fallback in case no header trigger is found
  function setActiveTab(id) {
    // Panels
    const panels = document.querySelectorAll("[data-tab-panel]");
    panels.forEach(p => p.classList.add("hidden"));
    const targetPanel = document.getElementById(id);
    if (targetPanel) targetPanel.classList.remove("hidden");

    // Triggers (optional if you highlight the active tab in header)
    const triggers = document.querySelectorAll("[data-tab-target], [data-tab], a[href^='#']");
    triggers.forEach(t => t.classList.remove("is-active"));
    const headerTrigger = findHeaderTrigger(id);
    if (headerTrigger) headerTrigger.classList.add("is-active");

    // Optional: keep URL hash in sync
    if (history.replaceState) history.replaceState(null, "", `#${id}`);
  }

  // Wire up your home cards (these are the blocks you showed)
  document.querySelectorAll("[data-tab-jump]").forEach(card => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            const id = card.getAttribute("data-tab-jump");
            const headerLink = findHeaderTrigger(id);

            if (headerLink) {
                // Delegate to the header’s own click handler so behavior is identical
                headerLink.click();
            } else {
                // If header doesn’t expose a trigger, use the shared fallback
                setActiveTab(id);
            }
        });
  });
});

