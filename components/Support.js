// ======= SUPPORT OVERLAY =======
document.addEventListener("DOMContentLoaded", () => {
    const supportCard = document.getElementById("supportCard");
    if (supportCard) {
        supportCard.innerHTML = `
            <div class="max-w-lg w-full glass rounded-2xl border border-neutral-800 p-5 sm:p-6 relative">
                <button id="supportClose" class="absolute top-3 right-3 text-neutral-400 hover:text-neutral-200" aria-label="Close support dialog">
                    &times;
                </button>
                <h2 class="text-lg font-semibold mb-3">Support Dial in Consulting</h2>
                <p class="text-neutral-300 text-sm mb-4">
                    Choose a payment option below to contribute directly.
                </p>
                <div class="grid gap-3">
                    <a data-support-link href="https://cash.app/$jdmarlow" target="_blank" rel="noopener noreferrer" class="px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition">
                        <span class="block font-medium">Cash App</span>
                        <span class="block text-xs text-neutral-400">$jdmarlow</span>
                    </a>
                    <a data-support-link href="https://account.venmo.com/u/Jonathan-Marlow-19" target="_blank" rel="noopener noreferrer" class="px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition">
                        <span class="block font-medium">Venmo</span>
                        <span class="block text-xs text-neutral-400">@Jonathan-Marlow-19</span>
                    </a>
                    <a data-support-link href="https://www.paypal.com/paypalme/jdmarlow86" target="_blank" rel="noopener noreferrer" class="px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition">
                        <span class="block font-medium">PayPal</span>
                        <span class="block text-xs text-neutral-400">@jdmarlow86</span>
                    </a>
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
            supportCard.classList.add("hidden");
        });
    });
});
