// components/main.js

// ======= CONFIG YOU CAN EDIT =======
const APPOINTMENT_URL = "https://calendly.com/jonmarlow"; // your scheduler URL
const FORMSPREE_ENDPOINT = ""; // optional: e.g. "https://formspree.io/f/xxxxxx"

// ======= APPOINTMENTS =======
(function setupAppointments() {
    const bookNow = document.getElementById("bookNow");
    const schedulerFrame = document.getElementById("schedulerFrame");

    if (APPOINTMENT_URL) {
        if (bookNow) {
            bookNow.href = APPOINTMENT_URL;
        }
        if (schedulerFrame) {
            schedulerFrame.src = APPOINTMENT_URL;
        }
    } else {
        if (bookNow) {
            bookNow.classList.add("pointer-events-none", "opacity-60");
        }
    }
})();

// ======= IDEA INCUBATOR (localStorage) =======
(function setupIdeas() {
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
            .map((it, idx) => `
                <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-900/60">
                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-medium">${it.title}</h4>
                            <p class="text-xs text-neutral-400">
                                Priority: ${it.priority} • Tags: ${it.tags || "—"}
                            </p>
                        </div>
                        <button data-del="${idx}" class="text-sm px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700">
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
            `)
            .join("");

        // wire delete buttons
        ideasList.querySelectorAll("button[data-del]").forEach(btn => {
            btn.addEventListener("click", () => {
                const arr = loadIdeas();
                arr.splice(Number(btn.dataset.del), 1);
                saveIdeas(arr);
                renderIdeas();
            });
        });
    }

    if (ideaForm) {
        ideaForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const item = {
                title: (ideaTitle?.value || "").trim(),
                priority: ideaPriority?.value || "",
                tags: (ideaTags?.value || "").trim(),
                notes: (ideaNotes?.value || "").trim(),
                created: Date.now(),
            };

            const arr = loadIdeas();
            arr.unshift(item);
            saveIdeas(arr);

            ideaForm.reset();
            renderIdeas();
        });
    }

    if (exportIdeasBtn) {
        exportIdeasBtn.addEventListener("click", () => {
            const blob = new Blob(
                [JSON.stringify(loadIdeas(), null, 2)],
                { type: "application/json" }
            );
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "ideas.json";
            a.click();
        });
    }

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
                // swallow
            }
            importIdeasInput.value = "";
        });
    }

    if (clearIdeasBtn) {
        clearIdeasBtn.addEventListener("click", () => {
            if (!confirm("Clear all ideas?")) return;
            localStorage.removeItem(ideaKey);
            renderIdeas();
        });
    }

    // initial render
    renderIdeas();
})();

// ======= FREE SUBSCRIPTION (localStorage + optional email post) =======
(function setupSubs() {
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

        if (!items.length) {
            subsList.innerHTML = '<li class="text-neutral-400">No subscribers yet.</li>';
            return;
        }

        subsList.innerHTML = items
            .map(s => `• ${s.name || "(no name)"} – ${s.email}`)
            .join("<br/>");
    }

    // store locally on submit
    if (subForm) {
        subForm.addEventListener("submit", async () => {
            // don't preventDefault so form can still POST to FormSubmit.co etc
            const entry = {
                name: (subName?.value || "").trim(),
                email: (subEmail?.value || "").trim(),
                ts: Date.now(),
            };

            const arr = loadSubs();
            arr.unshift(entry);
            saveSubs(arr);

            // OPTIONAL: if you want to also POST to Formspree via fetch,
            // you could do that here if FORMSPREE_ENDPOINT is set.
            if (FORMSPREE_ENDPOINT) {
                try {
                    await fetch(FORMSPREE_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(entry),
                    });
                } catch {
                    // ignore network errors so UX still continues
                }
            }
        });
    }

    if (exportSubsBtn) {
        exportSubsBtn.addEventListener("click", () => {
            const rows = [
                ["Name", "Email", "Timestamp"],
                ...loadSubs().map(s => [
                    s.name,
                    s.email,
                    new Date(s.ts).toISOString()
                ])
            ];

            const csv = rows
                .map(r => r
                    .map(v => `"${String(v).replace(/"/g, '""')}"`)
                    .join(","))
                .join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "subscribers.csv";
            a.click();
        });
    }

    if (clearSubsBtn) {
        clearSubsBtn.addEventListener("click", () => {
            if (!confirm("Clear all subscribers?")) return;
            localStorage.removeItem(subKey);
            renderSubs();
        });
    }

    renderSubs();
})();
