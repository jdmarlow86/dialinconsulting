/* ===== Affiliates (4x4 card grid) ===== */

// EDIT this list or swap to fetch('data/affiliates.json')

const AFFILIATES = [
    {
        name: "PawNamics",
        tagline: "Pet-sitting marketplace and tools",
        site: "https://example.com/pawnamics",
        email: "hello@pawnamics.com",
        phone: "555-123-4567",
        image: "https://via.placeholder.com/300x180?text=PawNamics",
    },
    {
        name: "East Tennessee Hub",
        tagline: "Local agentic services and community",
        site: "https://example.com/ethub",
        email: "team@ethub.local",
        phone: "555-555-0101",
        image: "https://via.placeholder.com/300x180?text=ETHub",
    },

    // ?? Add as many as you like:
    {
        name: "Dial-In Media",
        tagline: "Content & brand development for small businesses",
        site: "https://example.com/dialin-media",
        email: "info@dialinmedia.com",
        phone: "423-555-2025",
        image: "assets/affiliates/dialin-media.jpg",
    },
    {
        name: "FaithCoin",
        tagline: "Community-based blockchain token for charitable giving",
        site: "https://example.com/faithcoin",
        email: "hello@faithcoin.org",
        phone: "555-432-8765",
        image: "https://via.placeholder.com/300x180?text=FaithCoin",
    },
];


const affGrid = document.getElementById("affGrid");
const affSearch = document.getElementById("affSearch");
const affPrev = document.getElementById("affPrev");
const affNext = document.getElementById("affNext");
const affPageInfo = document.getElementById("affPageInfo");
const affPageSize = document.getElementById("affPageSize");

if (affGrid) {
    const STORAGE_KEY = 'dic:affiliates.override';
    function getData() {
        // allow optional local overrides saved earlier
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch { }
        return AFFILIATES;
    }

    let page = 1;
    let pageSize = Number(affPageSize?.value || 16);
    let q = "";

    function filterData() {
        const data = getData();
        if (!q) return data;
        const s = q.toLowerCase();
        return data.filter(a =>
            (a.name || "").toLowerCase().includes(s) ||
            (a.tagline || "").toLowerCase().includes(s) ||
            (a.email || "").toLowerCase().includes(s) ||
            (a.phone || "").toLowerCase().includes(s)
        );
    }

    function cardHTML(a) {
        const site = a.site ? `<a class="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm" href="${a.site}" target="_blank" rel="noreferrer">Visit</a>` : "";
        const email = a.email ? `<a class="hover:underline" href="mailto:${a.email}">${a.email}</a>` : "";
        const phone = a.phone ? `<a class="hover:underline" href="tel:${a.phone.replace(/[^0-9+]/g, '')}">${a.phone}</a>` : "";
        return `
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden flex flex-col">
        <img src="${a.image || 'https://via.placeholder.com/600x360?text=Affiliate'}" alt="${a.name}" class="w-full h-40 object-cover border-b border-neutral-800">
        <div class="p-4 flex-1 flex flex-col">
          <h3 class="font-medium leading-tight">${a.name || 'Untitled'}</h3>
          ${a.tagline ? `<p class="text-sm text-neutral-400 mt-1">${a.tagline}</p>` : ""}
          <div class="mt-3 text-sm text-neutral-400 space-y-1">
            ${email ? `<p>Email: ${email}</p>` : ""}
            ${phone ? `<p>Phone: ${phone}</p>` : ""}
          </div>
          <div class="mt-4">${site}</div>
        </div>
      </div>
    `;
    }

    function render() {
        const items = filterData();
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        page = Math.min(page, pages);

        const start = (page - 1) * pageSize;
        const slice = items.slice(start, start + pageSize);

        affGrid.innerHTML = slice.map(cardHTML).join("");

        if (affPrev) affPrev.disabled = page <= 1;
        if (affNext) affNext.disabled = page >= pages;
        if (affPageInfo) affPageInfo.textContent = total
            ? `Page ${page} of ${pages} • ${total} total`
            : `No results`;
    }

    // events
    if (affSearch) affSearch.addEventListener("input", () => { q = affSearch.value.trim(); page = 1; render(); });
    if (affPrev) affPrev.addEventListener("click", () => { page = Math.max(1, page - 1); render(); });
    if (affNext) affNext.addEventListener("click", () => { page += 1; render(); });
    if (affPageSize) affPageSize.addEventListener("change", () => { pageSize = Number(affPageSize.value || 16); page = 1; render(); });

    // initial
    render();

    // OPTIONAL: expose helpers to console for quick updates
    window.affiliates = {
        list: () => getData(),
        override: (arr) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); render(); },
        clearOverride: () => { localStorage.removeItem(STORAGE_KEY); render(); }
    };
}