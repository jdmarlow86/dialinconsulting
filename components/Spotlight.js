<script>
// Spotlight.js (safe version)

document.addEventListener("DOMContentLoaded", () => {
  const spotlightKey = "dic:spotlight";
    const commentsKey = "dic:spotlightComments";

    // --- DOM refs (guard every one) ---
    const el = {
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

    // If the spotlight tab isn’t on this page, bail quietly
    if (!el.display || !el.admin) return;

  // --- Storage helpers ---
  const loadSpotlight = () => {
    try { return JSON.parse(localStorage.getItem(spotlightKey) || "null"); } catch { return null; }
  };
  const saveSpotlight = (data) => localStorage.setItem(spotlightKey, JSON.stringify(data));
  const loadComments = () => {
    try { return JSON.parse(localStorage.getItem(commentsKey) || "[]"); } catch { return []; }
  };
  const saveComments = (list) => localStorage.setItem(commentsKey, JSON.stringify(list));

    // --- Renderers ---
    function renderComments(list) {
    if (!el.cList) return;
    if (!list.length) {
        el.cList.innerHTML = `<p class="text-neutral-400">No comments yet.</p>`;
    return;
    }
    el.cList.innerHTML = list.map(c => `
    <div class="p-3 rounded-lg border border-neutral-800 bg-neutral-900/60">
        <p class="text-neutral-300 whitespace-pre-wrap">${c.text}</p>
        <p class="text-xs text-neutral-500 mt-1">— ${c.name || "Anonymous"}, ${new Date(c.ts).toLocaleString()}</p>
    </div>
    `).join("");
  }

    function renderSpotlight() {
    const s = loadSpotlight();
    const comments = loadComments();

    if (!s) {
        el.display.classList.add("hidden");
    return;
    }
    el.display.classList.remove("hidden");
    if (el.photo) el.photo.src = s.photo || "https://via.placeholder.com/120";
    if (el.name) el.name.textContent = s.name || "";
    if (el.email) el.email.textContent = s.email || "";
    if (el.specialty) el.specialty.textContent = s.specialty || "";
    if (el.quote) el.quote.textContent = s.quote || "";

    renderComments(comments);
  }

    // --- Events (all guarded) ---
    if (el.cForm && el.cText) {
        el.cForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = el.cText.value.trim();
            if (!text) return;
            const name = (el.cName?.value.trim()) || "Anonymous";
            const list = loadComments();
            list.push({ name, text, ts: Date.now() });
            saveComments(list);
            renderComments(list);
            el.cForm.reset();
        });
  }

    if (el.clearBtn) {
        el.clearBtn.addEventListener("click", () => {
            if (!confirm("Clear the current spotlight and all comments?")) return;
            localStorage.removeItem(spotlightKey);
            localStorage.removeItem(commentsKey);
            renderSpotlight();
            alert("Spotlight and comments cleared.");
        });
  }

    if (el.addForm) {
        el.addForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = {
                name: el.sName?.value.trim() || "",
                email: el.sEmail?.value.trim() || "",
                specialty: el.sSpecialty?.value.trim() || "",
                photo: el.sPhoto?.value.trim() || "",
                quote: el.sQuote?.value.trim() || "",
                created: Date.now(),
            };
            if (!data.name || !data.email) {
                alert("Name and Email are required.");
                return;
            }
            saveSpotlight(data);
            el.addForm.reset();
            renderSpotlight();
            alert("New spotlight added!");
        });
  }

    // --- Admin visibility (simple switch so you can see the form now) ---
    // If you want to gate this, hide the div in HTML and flip it with a passcode later.
    el.admin.classList.remove("hidden");

    // --- Optional: seed helper for testing (open DevTools and run seedSpotlight()) ---
    window.seedSpotlight = function() {
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

    // Initial render
    renderSpotlight();
});
</script>
