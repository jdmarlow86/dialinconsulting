// ======= Affiliate Directory =======
const PLACEHOLDER_IMAGE = "assets/affiliate-placeholder.svg";

const AFFILIATES = [
    {
        name: "My Bible Belt",
        tagline: "Bible themed multitool",
        site: "https://mybiblebelt.org",
        email: "dial.in.consulting@gmail.com",
        phone: "423-912-1038",
        image: "assets/mybiblebelt-icon.png",
    },
    {
        name: "East Tennessee Hub",
        tagline: "Local agentic services and community",
        site: "https://example.com/ethub",
        email: "team@ethub.local",
        phone: "555-555-0101",
        image: PLACEHOLDER_IMAGE,
    },
    {
        name: "Dial-In Media",
        tagline: "Content & brand development for small businesses",
        site: "https://example.com/dialin-media",
        email: "info@dialinmedia.com",
        phone: "423-555-2025",
        image: PLACEHOLDER_IMAGE,
    },
    {
        name: "FaithCoin",
        tagline: "Community-based blockchain token for charitable giving",
        site: "https://example.com/faithcoin",
        email: "hello@faithcoin.org",
        phone: "555-432-8765",
        image: PLACEHOLDER_IMAGE,
    },
];

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("tab-affiliates");
    if (!root) return;

    const escapeHtml = (value = "") =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    root.innerHTML = `
        <div class="grid gap-5">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 class="text-lg font-semibold">Partner directory</h3>
                    <p class="text-sm text-neutral-400">Save this list locally or override it for demos.</p>
                </div>
                <label class="flex items-center gap-2 text-sm text-neutral-300">
                    <span>Per page</span>
                    <select id="affPageSize" class="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1">
                        <option value="8">8</option>
                        <option value="12">12</option>
                        <option value="16" selected>16</option>
                        <option value="24">24</option>
                    </select>
                </label>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <input id="affSearch" class="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm" placeholder="Search by name, tagline, email, or phone" />
                <div class="flex items-center gap-2">
                    <button id="affPrev" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm" type="button">Prev</button>
                    <button id="affNext" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm" type="button">Next</button>
                </div>
                <span id="affPageInfo" class="text-xs text-neutral-400">Page 1</span>
            </div>

            <div id="affGrid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"></div>
        </div>
    `;

    const STORAGE_KEY = "dic:affiliates.override";

    const affGrid = document.getElementById("affGrid");
    const affSearch = document.getElementById("affSearch");
    const affPrev = document.getElementById("affPrev");
    const affNext = document.getElementById("affNext");
    const affPageInfo = document.getElementById("affPageInfo");
    const affPageSize = document.getElementById("affPageSize");

    if (!affGrid || !affPageSize) return;

    const getData = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {
            // ignore parse errors and fall back to defaults
        }
        return AFFILIATES;
    };

    let page = 1;
    let pageSize = Number(affPageSize.value) || 16;
    let query = "";

    const filterData = () => {
        const list = getData();
        if (!query) return list;
        const needle = query.toLowerCase();
        return list.filter((item) =>
            [item.name, item.tagline, item.email, item.phone]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(needle))
        );
    };

    const cardHTML = (item) => {
        const safeName = escapeHtml(item.name || "Untitled");
        const safeTagline = escapeHtml(item.tagline || "");
        const safeEmail = escapeHtml(item.email || "");
        const safePhone = escapeHtml(item.phone || "");
        const safeSite = item.site ? escapeHtml(item.site) : "";
        const safeImage = escapeHtml(item.image || PLACEHOLDER_IMAGE);
        const telHref = item.phone ? `tel:${item.phone.replace(/[^0-9+]/g, "")}` : "";
        const hasSite = Boolean(safeSite);
        return `
            <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden flex flex-col">
                <img src="${safeImage}" alt="${safeName}" class="w-full h-40 object-cover border-b border-neutral-800" />
                <div class="p-4 flex-1 flex flex-col">
                    <h4 class="font-medium leading-tight">${safeName}</h4>
                    ${safeTagline ? `<p class="text-sm text-neutral-400 mt-1">${safeTagline}</p>` : ""}
                    <div class="mt-3 text-sm text-neutral-400 space-y-1">
                        ${safeEmail ? `<p>Email: <a class="hover:underline" href="mailto:${safeEmail}">${safeEmail}</a></p>` : ""}
                        ${safePhone ? `<p>Phone: <a class="hover:underline" href="${telHref}">${safePhone}</a></p>` : ""}
                    </div>
                    ${hasSite ? `<div class="mt-4"><a class="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm" href="${safeSite}" target="_blank" rel="noreferrer">Visit</a></div>` : ""}
                </div>
            </div>
        `;
    };

    const render = () => {
        const items = filterData();
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        page = Math.min(Math.max(page, 1), pages);

        const start = (page - 1) * pageSize;
        const slice = items.slice(start, start + pageSize);
        affGrid.innerHTML = slice.map(cardHTML).join("");

        if (affPrev) affPrev.disabled = page <= 1;
        if (affNext) affNext.disabled = page >= pages;
        if (affPageInfo) {
            affPageInfo.textContent = total
                ? `Page ${page} of ${pages} · ${total} total`
                : "No partners match your search";
        }
    };

    affSearch?.addEventListener("input", () => {
        query = affSearch.value.trim();
        page = 1;
        render();
    });

    affPrev?.addEventListener("click", () => {
        if (page > 1) {
            page -= 1;
            render();
        }
    });

    affNext?.addEventListener("click", () => {
        page += 1;
        render();
    });

    affPageSize.addEventListener("change", () => {
        pageSize = Number(affPageSize.value) || 16;
        page = 1;
        render();
    });

    render();

    window.affiliates = {
        list: () => getData(),
        override: (list) => {
            if (!Array.isArray(list)) return;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            page = 1;
            render();
        },
        clearOverride: () => {
            localStorage.removeItem(STORAGE_KEY);
            page = 1;
            render();
        },
    };
});
