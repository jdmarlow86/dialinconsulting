// ======= Spotlight Feature =======
document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("tab-spotlight");
    if (!root) return;

    const escapeHtml = (value = "") =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    root.innerHTML = `
        <div class="grid gap-6">
            <div id="spotlightEmpty" class="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-6 text-sm text-neutral-400">
                No spotlight has been selected yet. Add one below to feature a community member.
            </div>

            <section id="spotlightDisplay" class="hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <img id="spotlightPhoto" src="https://via.placeholder.com/120" alt="Spotlight" class="w-24 h-24 rounded-xl border border-neutral-800 object-cover" />
                    <div class="flex-1">
                        <h3 id="spotlightName" class="text-lg font-semibold"></h3>
                        <p class="text-sm text-neutral-400">
                            <a id="spotlightEmail" class="hover:underline" href="mailto:"></a>
                            <span id="spotlightSpecialty" class="block text-neutral-300"></span>
                        </p>
                        <blockquote id="spotlightQuote" class="mt-3 text-neutral-200 italic"></blockquote>
                    </div>
                </div>

                <div class="mt-6">
                    <h4 class="text-sm font-semibold mb-2">Community shout-outs</h4>
                    <form id="commentForm" class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                        <input id="commentName" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm" placeholder="Your name (optional)" />
                        <textarea id="commentText" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm min-h-[80px] sm:min-h-[48px]" required placeholder="Share a quick comment"></textarea>
                        <button class="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm" type="submit">Post</button>
                    </form>
                    <div id="commentsList" class="mt-4 grid gap-3"></div>
                </div>
            </section>

            <section id="spotlightAdmin" class="hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">Manage Spotlight</h3>
                        <p class="text-sm text-neutral-400">Store entries locally in your browser.</p>
                    </div>
                    <button id="clearSpotlightBtn" class="px-3 py-2 rounded-lg bg-neutral-900 border border-red-900 text-red-300 hover:bg-neutral-900/70 text-sm" type="button">Clear Spotlight</button>
                </div>

                <form id="addSpotlightForm" class="grid gap-3 sm:grid-cols-2">
                    <input id="sName" required class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm" placeholder="Name" />
                    <input id="sEmail" required type="email" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm" placeholder="Email" />
                    <input id="sSpecialty" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm" placeholder="Specialty / Focus" />
                    <input id="sPhoto" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm" placeholder="Photo URL" />
                    <textarea id="sQuote" class="sm:col-span-2 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm min-h-[96px]" placeholder="Quote / story"></textarea>
                    <button class="sm:col-span-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm" type="submit">Save Spotlight</button>
                </form>
            </section>
        </div>
    `;

    const spotlightKey = "dic:spotlight";
    const commentsKey = "dic:spotlightComments";

    const el = {
        empty: document.getElementById("spotlightEmpty"),
        display: document.getElementById("spotlightDisplay"),
        admin: document.getElementById("spotlightAdmin"),
        photo: document.getElementById("spotlightPhoto"),
        name: document.getElementById("spotlightName"),
        email: document.getElementById("spotlightEmail"),
        specialty: document.getElementById("spotlightSpecialty"),
        quote: document.getElementById("spotlightQuote"),
        clearBtn: document.getElementById("clearSpotlightBtn"),
        addForm: document.getElementById("addSpotlightForm"),
        cForm: document.getElementById("commentForm"),
        cName: document.getElementById("commentName"),
        cText: document.getElementById("commentText"),
        cList: document.getElementById("commentsList"),
        sName: document.getElementById("sName"),
        sEmail: document.getElementById("sEmail"),
        sSpecialty: document.getElementById("sSpecialty"),
        sPhoto: document.getElementById("sPhoto"),
        sQuote: document.getElementById("sQuote"),
    };

    if (!el.display || !el.admin) return;

    const loadSpotlight = () => {
        try {
            return JSON.parse(localStorage.getItem(spotlightKey) || "null");
        } catch {
            return null;
        }
    };

    const saveSpotlight = (data) => localStorage.setItem(spotlightKey, JSON.stringify(data));

    const loadComments = () => {
        try {
            return JSON.parse(localStorage.getItem(commentsKey) || "[]");
        } catch {
            return [];
        }
    };

    const saveComments = (list) => localStorage.setItem(commentsKey, JSON.stringify(list));

    const renderComments = (list) => {
        if (!el.cList) return;
        if (!list.length) {
            el.cList.innerHTML = `<p class="text-neutral-400 text-sm">No comments yet. Be the first to share!</p>`;
            return;
        }

        el.cList.innerHTML = list
            .map((comment) => `
                <div class="p-3 rounded-lg border border-neutral-800 bg-neutral-900/60">
                    <p class="text-neutral-200 whitespace-pre-wrap">${escapeHtml(comment.text).replace(/\n/g, "<br>")}</p>
                    <p class="text-xs text-neutral-500 mt-1">${escapeHtml(comment.name || "Anonymous")} · ${new Date(comment.ts).toLocaleString()}</p>
                </div>
            `)
            .join("");
    };

    const renderSpotlight = () => {
        const spotlight = loadSpotlight();
        const comments = loadComments();

        if (!spotlight) {
            el.display.classList.add("hidden");
            el.empty?.classList.remove("hidden");
            renderComments(comments);
            return;
        }

        el.empty?.classList.add("hidden");
        el.display.classList.remove("hidden");

        if (el.photo) el.photo.src = spotlight.photo || "https://via.placeholder.com/120";
        if (el.name) el.name.textContent = spotlight.name || "";
        if (el.email) {
            if (spotlight.email) {
                el.email.textContent = spotlight.email;
                el.email.href = `mailto:${spotlight.email}`;
            } else {
                el.email.textContent = "";
                el.email.removeAttribute("href");
            }
        }
        if (el.specialty) el.specialty.textContent = spotlight.specialty || "";
        if (el.quote) el.quote.textContent = spotlight.quote || "";

        renderComments(comments);
    };

    if (el.cForm && el.cText) {
        el.cForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const text = el.cText.value.trim();
            if (!text) return;
            const name = el.cName?.value.trim() || "Anonymous";
            const list = loadComments();
            list.push({ name, text, ts: Date.now() });
            saveComments(list);
            renderComments(list);
            el.cForm.reset();
        });
    }

    el.clearBtn?.addEventListener("click", () => {
        if (!confirm("Clear the current spotlight and all comments?")) return;
        localStorage.removeItem(spotlightKey);
        localStorage.removeItem(commentsKey);
        renderSpotlight();
        alert("Spotlight and comments cleared.");
    });

    if (el.addForm) {
        el.addForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const data = {
                name: el.sName?.value.trim() || "",
                email: el.sEmail?.value.trim() || "",
                specialty: el.sSpecialty?.value.trim() || "",
                photo: el.sPhoto?.value.trim() || "",
                quote: el.sQuote?.value.trim() || "",
                created: Date.now(),
            };

            if (!data.name || !data.email) {
                alert("Name and email are required.");
                return;
            }

            saveSpotlight(data);
            el.addForm.reset();
            renderSpotlight();
            alert("New spotlight saved.");
        });
    }

    el.admin.classList.remove("hidden");

    window.seedSpotlight = function seedSpotlight() {
        saveSpotlight({
            name: "Alex Johnson",
            email: "alex.johnson@example.com",
            specialty: "Small Business Strategy",
            photo: "https://via.placeholder.com/120",
            quote: "Dial in Consulting helped me refine my business goals.",
            created: Date.now(),
        });
        localStorage.removeItem(commentsKey);
        renderSpotlight();
        console.log("Seeded sample spotlight.");
    };

    renderSpotlight();
});
