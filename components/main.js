// components/main.js

// ======= CONFIG (edit these) =======
const APPOINTMENT_URL = "https://calendly.com/jonmarlow"; // your scheduler
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeolbynz"; // (optional external submit endpoint)

// ======= YEAR IN FOOTER (safety duplicate)
// (nav.js also sets this, but this is harmless if nav.js runs later)
const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// ======= APPOINTMENTS EMBED =======
const bookNow = document.getElementById("bookNow");
const schedulerFrame = document.getElementById("schedulerFrame");

if (bookNow && schedulerFrame) {
    if (APPOINTMENT_URL) {
        // "Book Now" should go to your external scheduler
        bookNow.href = APPOINTMENT_URL;
        // iframe should load the same scheduler
        schedulerFrame.src = APPOINTMENT_URL;
    } else {
        // gracefully disable if you haven't set one
        bookNow.classList.add("pointer-events-none", "opacity-60");
    }
}

// ======= INVOICES (legacy lookup mode - only attach if the old elements exist)
// NOTE: Your current Invoices tab is the PDF builder UI, not a "lookup by ID" UI.
// We'll keep this logic guarded so it DOESN'T crash if those elements don't exist.
const invoiceForm = document.getElementById("invoiceForm");
const invoiceIdInput = document.getElementById("invoiceId");
const invoiceResult = document.getElementById("invoiceResult");

if (invoiceForm && invoiceIdInput && invoiceResult) {
    async function fetchInvoices() {
        const res = await fetch("data/invoices.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to load invoices.json");
        return await res.json();
    }

    invoiceForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = invoiceIdInput.value.trim();
        invoiceResult.innerHTML = '<p class="text-neutral-400">Loading…</p>';

        try {
            const data = await fetchInvoices();
            const inv = data.invoices.find(
                (x) => x.id.toLowerCase() === id.toLowerCase()
            );

            if (!inv) {
                invoiceResult.innerHTML =
                    '<p class="text-red-400">No invoice found for that ID.</p>';
                return;
            }

            const badgeClass =
                inv.status === "Paid"
                    ? "bg-green-600"
                    : inv.status === "Due"
                        ? "bg-yellow-600"
                        : "bg-neutral-700";

            invoiceResult.innerHTML = `
                <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
                    <div class="flex items-center justify-between">
                        <h3 class="font-medium">Invoice ${inv.id}</h3>
                        <span class="px-2 py-1 text-xs rounded ${badgeClass}">${inv.status}</span>
                    </div>

                    <dl class="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                            <dt class="text-neutral-400">Client</dt>
                            <dd>${inv.client}</dd>
                        </div>
                        <div>
                            <dt class="text-neutral-400">Date</dt>
                            <dd>${inv.date}</dd>
                        </div>
                        <div>
                            <dt class="text-neutral-400">Amount</dt>
                            <dd>$${Number(inv.amount).toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt class="text-neutral-400">Due</dt>
                            <dd>${inv.dueDate || "?"}</dd>
                        </div>
                    </dl>

                    ${inv.pdf
                    ? `<a target="_blank"
                                   class="inline-block mt-3 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                                   href="${inv.pdf}">Download PDF</a>`
                    : ""
                }
                </div>
            `;
        } catch (err) {
            invoiceResult.innerHTML = `<p class="text-red-400">${err.message}</p>`;
        }
    });
}

// ======= IDEA INCUBATOR (localStorage) =======
const ideaKey = "dic:ideas";

const ideaForm = document.getElementById("ideaForm");
const ideaTitle = document.getElementById("ideaTitle");
const ideaPriority = document.getElementById("ideaPriority");
const ideaTags = document.getElementById("ideaTags");
const ideaNotes = document.getElementById("ideaNotes");
const ideasList = document.getElementById("ideasList");

const exportIdeasBtn = document.getElementById("exportIdeasBtn");
const importIdeasInput = document.getElementById("importIdeasInput");
const clearIdeasBtn = document.getElementById("clearIdeasBtn");

function loadIdeas() {
    try {
        return JSON.parse(localStorage.getItem(ideaKey) || "[]");
    } catch {
        return [];
    }
}

function saveIdeas(items) {
    localStorage.setItem(ideaKey, JSON.stringify(items));
}

function renderIdeas() {
    if (!ideasList) return;

    const items = loadIdeas();
    if (!items.length) {
        ideasList.innerHTML = '<p class="text-neutral-400">No ideas yet.</p>';
        return;
    }

    ideasList.innerHTML = items
        .map(
            (it, idx) => `
        <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
            <div class="flex items-start justify-between">
                <div>
                    <h4 class="font-medium">${it.title}</h4>
                    <p class="text-xs text-neutral-400">
                        Priority: ${it.priority} • Tags: ${it.tags || "—"}
                    </p>
                </div>

                <button data-del="${idx}"
                        class="text-sm px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700">
                    Delete
                </button>
            </div>

            ${it.notes
                    ? `<p class="mt-2 text-neutral-300 whitespace-pre-wrap">${it.notes}</p>`
                    : ""
                }

            <p class="mt-2 text-xs text-neutral-500">
                Created ${new Date(it.created).toLocaleString()}
            </p>
        </div>
    `
        )
        .join("");

    // wire delete buttons
    ideasList.querySelectorAll("button[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.del);
            const items = loadIdeas();
            items.splice(idx, 1);
            saveIdeas(items);
            renderIdeas();
        });
    });
}

// Only attach listeners if the form exists on this page
if (ideaForm && ideaTitle && ideaPriority && ideaTags && ideaNotes) {
    ideaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const item = {
            title: ideaTitle.value.trim(),
            priority: ideaPriority.value,
            tags: ideaTags.value.trim(),
            notes: ideaNotes.value.trim(),
            created: Date.now(),
        };

        const items = loadIdeas();
        items.unshift(item);
        saveIdeas(items);

        ideaForm.reset();
        renderIdeas();
    });
}

// Export ideas JSON
if (exportIdeasBtn) {
    exportIdeasBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(loadIdeas(), null, 2)], {
            type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ideas.json";
        a.click();
    });
}

// Import ideas JSON
if (importIdeasInput) {
    importIdeasInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const txt = await file.text();
        try {
            const arr = JSON.parse(txt);
            if (Array.isArray(arr)) {
                saveIdeas(arr);
                renderIdeas();
            }
        } catch {
            // ignore bad JSON
        }
        importIdeasInput.value = "";
    });
}

// Clear all ideas
if (clearIdeasBtn) {
    clearIdeasBtn.addEventListener("click", () => {
        if (confirm("Clear all ideas?")) {
            localStorage.removeItem(ideaKey);
            renderIdeas();
        }
    });
}

// Initial render of idea list
renderIdeas();

// ======= FREE SUBSCRIPTION LIST (localStorage + optional external form post) =======
const subKey = "dic:subs";

const subForm = document.getElementById("subForm");
const subName = document.getElementById("subName");
const subEmail = document.getElementById("subEmail");
const subsList = document.getElementById("subsList");
const exportSubsBtn = document.getElementById("exportSubsBtn");
const clearSubsBtn = document.getElementById("clearSubsBtn");

function loadSubs() {
    try {
        return JSON.parse(localStorage.getItem(subKey) || "[]");
    } catch {
        return [];
    }
}

function saveSubs(items) {
    localStorage.setItem(subKey, JSON.stringify(items));
}

function renderSubs() {
    if (!subsList) return;

    const items = loadSubs();
    subsList.innerHTML = items.length
        ? items
            .map(
                (s) =>
                    `• ${s.name || "(no name)"} – ${s.email} <span class="text-xs text-neutral-500">&lt;${new Date(
                        s.ts
                    ).toLocaleString()}&gt;</span>`
            )
            .join("<br/>")
        : '<li class="text-neutral-400">No subscribers yet.</li>';
}

// Save to localStorage on submit, then allow normal POST to FormSubmit/etc.
// NOTE: we do NOT preventDefault here on purpose.
if (subForm && subName && subEmail) {
    subForm.addEventListener("submit", () => {
        const entry = {
            name: subName.value.trim(),
            email: subEmail.value.trim(),
            ts: Date.now(),
        };

        const items = loadSubs();
        items.unshift(entry);
        saveSubs(items);
    });
}

// Export subscribers as CSV
if (exportSubsBtn) {
    exportSubsBtn.addEventListener("click", () => {
        const rows = [
            ["Name", "Email", "Timestamp"],
            ...loadSubs().map((s) => [
                s.name,
                s.email,
                new Date(s.ts).toISOString(),
            ]),
        ];

        const csv = rows
            .map((r) =>
                r
                    .map((v) =>
                        `"${String(v ?? "")
                            .replace(/"/g, '""')
                            .trim()}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "subscribers.csv";
        a.click();
    });
}

// Clear all subscribers
if (clearSubsBtn) {
    clearSubsBtn.addEventListener("click", () => {
        if (confirm("Clear all subscribers?")) {
            localStorage.removeItem(subKey);
            renderSubs();
        }
    });
}

// Initial render of subs
renderSubs();
