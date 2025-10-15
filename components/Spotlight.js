// ======= SPOTLIGHT DATA (placeholder) =======
// If you already set a real spotlight person elsewhere, reuse that.
// This fallback mirrors your visible Spotlight card.
const spotlightStorageKey = 'dic:spotlight:current';
const spotlightHistoryKey = 'dic:spotlight:history';

function getCurrentSpotlight() {
    try { return JSON.parse(localStorage.getItem(spotlightStorageKey) || 'null'); } catch { return null; }
}
function setCurrentSpotlight(p) {
    localStorage.setItem(spotlightStorageKey, JSON.stringify(p));
}
function clearCurrentSpotlight() {
    localStorage.removeItem(spotlightStorageKey);
}

let spotlightPerson = getCurrentSpotlight() || {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: 'tel:+15551234567',
    phoneDisplay: '(555) 123-4567',
    specialty: 'Small Business Strategy',
    // slug used for per-person comment storage
    id: 'alex.johnson@example.com'
};

// ======= OWNER TOOLS VISIBILITY TOGGLE =======
const ownerTools = document.getElementById('spotlightOwnerTools');
function setOwnerVisible(v) {
    sessionStorage.setItem('dic:owner', v ? '1' : '0');
    ownerTools?.classList.toggle('hidden', !v);
}
function getOwnerVisible() {
    return sessionStorage.getItem('dic:owner') === '1';
}
// toggle with Ctrl+Shift+O
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        setOwnerVisible(!getOwnerVisible());
    }
});
setOwnerVisible(getOwnerVisible());

// ======= RENDER CONTACT HEADER =======
const spName = document.getElementById('spName');
const spEmail = document.getElementById('spEmail');
const spPhone = document.getElementById('spPhone');
const spSpecialty = document.getElementById('spSpecialty');

function renderSpotlightContact() {
    spName.textContent = spotlightPerson.name || '—';
    spEmail.textContent = spotlightPerson.email || '—';
    spEmail.href = spotlightPerson.email ? `mailto:${spotlightPerson.email}` : '#';
    const phoneHref = (spotlightPerson.phone || '').startsWith('tel:') ? spotlightPerson.phone : (spotlightPerson.phone ? `tel:${spotlightPerson.phone}` : '');
    spPhone.textContent = spotlightPerson.phoneDisplay || (spotlightPerson.phone || '—');
    spPhone.href = phoneHref || '#';
    spSpecialty.textContent = spotlightPerson.specialty || '—';
}
renderSpotlightContact();

// ======= OWNER ACTIONS (log + clear) =======
const spLogBtn = document.getElementById('spLogBtn');
const spClearBtn = document.getElementById('spClearBtn');
const spOwnerMsg = document.getElementById('spOwnerMsg');

spLogBtn?.addEventListener('click', () => {
    const entry = { ...spotlightPerson, ts: Date.now() };
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem(spotlightHistoryKey) || '[]'); } catch { }
    hist.unshift(entry);
    localStorage.setItem(spotlightHistoryKey, JSON.stringify(hist));
    console.log('[Spotlight Log]', entry);
    spOwnerMsg.textContent = `Logged ${spotlightPerson.name} at ${new Date(entry.ts).toLocaleString()}`;
    spOwnerMsg.classList.remove('hidden');
});

spClearBtn?.addEventListener('click', () => {
    if (!confirm('Clear the current spotlight person (local only)?')) return;
    clearCurrentSpotlight();
    spotlightPerson = { name: '', email: '', phone: '', phoneDisplay: '', specialty: '', id: 'none' };
    renderSpotlightContact();
    // Clear comments for this session’s person (optional: keep history)
    renderComments(); // will show empty state
    spOwnerMsg.textContent = `Spotlight cleared locally.`;
    spOwnerMsg.classList.remove('hidden');
});

// ======= COMMENTS (threaded, per spotlight person) =======
function commentsKeyFor(personId) {
    return `dic:spotlight:comments:${(personId || '').toLowerCase()}`;
}
function loadComments(personId) {
    try { return JSON.parse(localStorage.getItem(commentsKeyFor(personId)) || '[]'); } catch { return []; }
}
function saveComments(personId, list) {
    localStorage.setItem(commentsKeyFor(personId), JSON.stringify(list));
}

const commentsList = document.getElementById('commentsList');
const commentForm = document.getElementById('commentForm');
const cmtAuthor = document.getElementById('cmtAuthor');
const cmtEmail = document.getElementById('cmtEmail');
const cmtText = document.getElementById('cmtText');
const cmtParentId = document.getElementById('cmtParentId');
const cmtCancelReply = document.getElementById('cmtCancelReply');
const cmtReplyInfo = document.getElementById('cmtReplyInfo');

function uid() { return Math.random().toString(36).slice(2, 10); }

function buildTree(list) {
    const byId = new Map(list.map(c => [c.id, { ...c, children: [] }]));
    const roots = [];
    for (const c of byId.values()) {
        if (c.parentId && byId.has(c.parentId)) {
            byId.get(c.parentId).children.push(c);
        } else {
            roots.push(c);
        }
    }
    // sort newest first at root; oldest first in threads for readability
    roots.sort((a, b) => b.ts - a.ts);
    function sortChildren(node) {
        node.children.sort((a, b) => a.ts - b.ts);
        node.children.forEach(sortChildren);
    }
    roots.forEach(sortChildren);
    return roots;
}

function escapeHTML(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

function renderNode(node, depth = 0) {
    const pad = Math.min(depth, 6) * 14;
    const when = new Date(node.ts).toLocaleString();
    return `
  <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3" style="margin-left:${pad}px">
    <div class="text-sm text-neutral-300">
      <strong>${escapeHTML(node.author || 'Anon')}</strong>
      ${node.email ? `<span class="text-neutral-500"> • ${escapeHTML(node.email)}</span>` : ''}
      <span class="text-neutral-500"> • ${when}</span>
    </div>
    <div class="mt-2 whitespace-pre-wrap text-neutral-200">${escapeHTML(node.text)}</div>
    <div class="mt-2">
      <button class="reply-btn text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700" data-id="${node.id}">
        Reply
      </button>
    </div>
  </div>
  ${node.children.map(ch => renderNode(ch, depth + 1)).join('')}
  `;
}

function renderComments() {
    const list = loadComments(spotlightPerson.id);
    if (!list.length) {
        commentsList.innerHTML = `<p class="text-neutral-400">No comments yet. Be the first to share a thought!</p>`;
        return;
    }
    const tree = buildTree(list);
    commentsList.innerHTML = tree.map(n => renderNode(n)).join('');
    // wire reply buttons
    commentsList.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cmtParentId.value = btn.dataset.id;
            cmtReplyInfo.textContent = `Replying to comment ${btn.dataset.id}`;
            cmtReplyInfo.classList.remove('hidden');
            cmtCancelReply.classList.remove('hidden');
            cmtText.focus();
        });
    });
}
renderComments();

cmtCancelReply.addEventListener('click', () => {
    cmtParentId.value = '';
    cmtReplyInfo.textContent = '';
    cmtReplyInfo.classList.add('hidden');
    cmtCancelReply.classList.add('hidden');
});

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const list = loadComments(spotlightPerson.id);
    const item = {
        id: uid(),
        parentId: cmtParentId.value || null,
        author: cmtAuthor.value.trim(),
        email: cmtEmail.value.trim(),
        text: cmtText.value.trim(),
        ts: Date.now()
    };
    if (!item.author || !item.text) return;

    list.push(item);
    saveComments(spotlightPerson.id, list);
    commentForm.reset();
    cmtParentId.value = '';
    cmtReplyInfo.classList.add('hidden');
    cmtCancelReply.classList.add('hidden');
    renderComments();
});


/* ===== Spotlight Manager ===== */
    const spotlightKey = "dic:spotlight";
    const commentsKey = "dic:spotlightComments";

    // --- DOM Refs ---
    const spotlightDisplay = document.getElementById("spotlightDisplay");
    const spotlightAdmin = document.getElementById("spotlightAdmin");
    const spotlightPhoto = document.getElementById("spotlightPhoto");
    const spotlightName = document.getElementById("spotlightName");
    const spotlightEmail = document.getElementById("spotlightEmail");
    const spotlightSpecialty = document.getElementById("spotlightSpecialty");
    const spotlightQuote = document.getElementById("spotlightQuote");

    const clearSpotlightBtn = document.getElementById("clearSpotlightBtn");
    const addSpotlightForm = document.getElementById("addSpotlightForm");

    const commentForm = document.getElementById("commentForm");
    const commentName = document.getElementById("commentName");
    const commentText = document.getElementById("commentText");
    const commentsList = document.getElementById("commentsList");

    // --- Storage helpers ---
    function loadSpotlight() {
  try { return JSON.parse(localStorage.getItem(spotlightKey) || "null"); } catch { return null; }
}
    function saveSpotlight(data) {
        localStorage.setItem(spotlightKey, JSON.stringify(data));
}
    function loadComments() {
  try { return JSON.parse(localStorage.getItem(commentsKey) || "[]"); } catch { return []; }
}
    function saveComments(list) {
        localStorage.setItem(commentsKey, JSON.stringify(list));
}

    // --- Rendering ---
    function renderSpotlight() {
  const s = loadSpotlight();
    const comments = loadComments();

    if (!s) {
        spotlightDisplay.classList.add("hidden");
    return;
  }
    spotlightDisplay.classList.remove("hidden");
    spotlightPhoto.src = s.photo || "https://via.placeholder.com/120";
    spotlightName.textContent = s.name;
    spotlightEmail.textContent = s.email;
    spotlightSpecialty.textContent = s.specialty || "";
    spotlightQuote.textContent = s.quote || "";

    renderComments(comments);
}

    function renderComments(comments) {
  if (!comments.length) {
        commentsList.innerHTML = `<p class="text-neutral-400">No comments yet.</p>`;
    return;
  }
  commentsList.innerHTML = comments.map(c => `
    <div class="p-3 rounded-lg border border-neutral-800 bg-neutral-900/60">
        <p class="text-neutral-300 whitespace-pre-wrap">${c.text}</p>
        <p class="text-xs text-neutral-500 mt-1">— ${c.name || "Anonymous"}, ${new Date(c.ts).toLocaleString()}</p>
    </div>
    `).join("");
}

// --- Comments ---
commentForm.addEventListener("submit", e => {
        e.preventDefault();
    const text = commentText.value.trim();
    if (!text) return;
    const name = commentName.value.trim() || "Anonymous";
    const comments = loadComments();
    comments.push({name, text, ts: Date.now() });
    saveComments(comments);
    renderComments(comments);
    commentForm.reset();
});

// --- Clear spotlight & comments ---
clearSpotlightBtn.addEventListener("click", () => {
  if (confirm("Clear the current spotlight and all comments?")) {
        localStorage.removeItem(spotlightKey);
    localStorage.removeItem(commentsKey);
    renderSpotlight();
    alert("Spotlight and comments cleared.");
  }
});

// --- Add new spotlight ---
addSpotlightForm.addEventListener("submit", e => {
        e.preventDefault();
    const data = {
        name: sName.value.trim(),
    email: sEmail.value.trim(),
    specialty: sSpecialty.value.trim(),
    photo: sPhoto.value.trim(),
    quote: sQuote.value.trim(),
    created: Date.now(),
  };
    saveSpotlight(data);
    addSpotlightForm.reset();
    renderSpotlight();
    alert("New spotlight added!");
});

    // --- Access control (admin-only visibility) ---
    const ADMIN_EMAIL = "jonmarlow@gmail.com"; // ? your email here
    const userEmail = localStorage.getItem("dic:adminEmail"); // optional future auth
    if (!ADMIN_EMAIL || ADMIN_EMAIL === "jonmarlow@gmail.com") {
        // always show for you (customize if needed)
        spotlightAdmin.classList.remove("hidden");
}

    // --- Init ---
    renderSpotlight();

