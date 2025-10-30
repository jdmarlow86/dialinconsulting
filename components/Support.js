// ======= SUPPORT OVERLAY =======
document.addEventListener("DOMContentLoaded", () => {
    const supportCard = document.getElementById("supportCard");
    if (supportCard) {
        supportCard.innerHTML = `
            <div class="max-w-lg w-full glass rounded-2xl border border-neutral-800 p-5 sm:p-6 relative">
                <button id="supportClose" class="absolute top-3 right-3 text-neutral-400 hover:text-neutral-200" aria-label="Close support dialog">
                    &times;
                </button>
                <h2 class="text-lg font-semibold mb-3">Need a hand?</h2>
                <p class="text-neutral-300 text-sm mb-4">
                    Quick links and resources to get help from Dial in Consulting.
                </p>
                <div class="grid gap-3">
                    <a data-support-link href="mailto:dial.in.consulting@gmail.com" class="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800">
                        Email Support
                    </a>
                    <a data-support-link href="tel:14239121038" class="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800">
                        Call 423-912-1038
                    </a>
                    <button data-support-link data-support-schedule type="button" class="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800">
                        Schedule a Call
                    </button>
                </div>
            </div>
        `;
    }

    const supportBtn = document.getElementById("supportBtn");
    const supportClose = document.getElementById("supportClose");

    supportBtn?.addEventListener("click", () => {
        supportCard?.classList.remove("hidden");
    });

    supportClose?.addEventListener("click", () => {
        supportCard?.classList.add("hidden");
    });

    supportCard?.addEventListener("click", (event) => {
        if (event.target === supportCard) {
            supportCard.classList.add("hidden");
        }
    });

    supportCard?.querySelectorAll("[data-support-link]")?.forEach(link => {
        link.addEventListener("click", () => {
            if (link.hasAttribute("data-support-schedule")) {
                window.open("https://calendly.com/jonmarlow", "_blank");
            }
            window.showTab?.("home");
            supportCard.classList.add("hidden");
        });
    });
});
