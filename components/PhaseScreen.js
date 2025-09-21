/** ========= Phase Screen (Vanilla JS) ========= */

const { jsPDF } = window.jspdf;

const PHASES = [
    {
        key: "idea",
        title: "Idea and POC",
        fields: [
            { key: "problem", label: "Problem Statement", type: "textarea", placeholder: "What user pain are we solving?" },
            { key: "hypothesis", label: "Hypothesis", type: "textarea", placeholder: "If we do X, users will Y because Z." },
            { key: "successCriteria", label: "Success Criteria", type: "textarea", placeholder: "Measurable outcomes for POC" },
            { key: "risks", label: "Key Risks/Assumptions", type: "textarea", placeholder: "Unknowns, blockers, technical risks" },
            { key: "pocPlan", label: "POC Plan", type: "textarea", placeholder: "Scope, constraints, what to build" },
            { key: "pocResult", label: "POC Result", type: "textarea", placeholder: "Evidence from tests / learnings" },
        ],
    },
    {
        key: "planning",
        title: "Planning and Funding",
        fields: [
            { key: "scope", label: "Project Scope", type: "textarea", placeholder: "What’s in vs out" },
            { key: "milestones", label: "Milestones", type: "textarea", placeholder: "Major checkpoints & dates" },
            { key: "budget", label: "Budget (USD)", type: "number", placeholder: "Estimated budget" },
            { key: "fundingSources", label: "Funding Sources", type: "textarea", placeholder: "Bootstrapped, grants, investors" },
            { key: "stakeholders", label: "Stakeholders", type: "textarea", placeholder: "Owners, approvers, contributors" },
            { key: "timelineStart", label: "Timeline Start", type: "date" },
            { key: "timelineEnd", label: "Timeline End", type: "date" },
        ],
    },
    {
        key: "marketing",
        title: "Marketing and Launch",
        fields: [
            { key: "audience", label: "Target Audience", type: "textarea", placeholder: "ICP, personas" },
            { key: "valueProp", label: "Value Proposition", type: "textarea", placeholder: "Why us? Clear, short, punchy" },
            { key: "channels", label: "Channels", type: "textarea", placeholder: "Email, social, communities, PR" },
            { key: "launchDate", label: "Launch Date", type: "date" },
            { key: "landingUrl", label: "Landing Page URL", type: "url", placeholder: "https://..." },
            { key: "pressKitUrl", label: "Press Kit URL", type: "url", placeholder: "https://..." },
            { key: "kpiPlan", label: "Tracking & KPIs", type: "textarea", placeholder: "UTMs, conversions, retention" },
        ],
        resources: [
            { label: "UTM Builder", href: "https://ga-dev-tools.web.app/campaign-url-builder/" },
            { label: "Product Hunt Launch Guide", href: "https://www.producthunt.com/" },
            { label: "Mailchimp", href: "https://mailchimp.com/" },
            { label: "Meta Ads", href: "https://www.facebook.com/business/ads" },
            { label: "Google Ads", href: "https://ads.google.com/" },
            { label: "Press Kit Inspiration", href: "https://presskit.page/" },
        ],
    },
    {
        key: "postmortem",
        title: "Post Mortem and Improve",
        fields: [
            { key: "wentWell", label: "What Went Well", type: "textarea" },
            { key: "didntGoWell", label: "What Didn’t Go Well", type: "textarea" },
            { key: "metricsVsTargets", label: "Metrics vs Targets", type: "textarea", placeholder: "Actuals vs goals, insights" },
            { key: "rootCauses", label: "Root Causes", type: "textarea" },
            { key: "improvements", label: "Improvements", type: "textarea", placeholder: "Concrete changes to make" },
            { key: "ownersDates", label: "Owners & Due Dates", type: "textarea", placeholder: "Who, what, by when" },
        ],
    },
    {
        key: "refine",
        title: "Refine and Dial In",
        fields: [
            { key: "optFocus", label: "Optimization Focus Areas", type: "textarea", placeholder: "Onboarding, activation, rev, churn…" },
            { key: "experiments", label: "Experiments Planned", type: "textarea", placeholder: "A/B tests, pricing, UX tweaks" },
            { key: "nextRelease", label: "Next Release Date", type: "date" },
            { key: "notes", label: "Notes", type: "textarea" },
        ],
    },
];

const STORAGE_KEY = "phaseScreenData.v1";

function defaultPhaseState() { return { mvp: false, values: {} }; }

function defaultAppState() {
    return {
        idea: defaultPhaseState(), planning: defaultPhaseState(), marketing: defaultPhaseState(),
        postmortem: defaultPhaseState(), refine: defaultPhaseState()
    };
}

function loadState() {
    try { return { ...defaultAppState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")) }; }
    catch { return defaultAppState(); }
}
function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* DOM refs */
const phaseSelect = document.getElementById("phaseSelect");
const phaseMvp = document.getElementById("phaseMvp");
const phaseFields = document.getElementById("phaseFields");
const phaseResources = document.getElementById("phaseResources");
const phaseClearBtn = document.getElementById("phaseClearBtn");
const phasePdfBtn = document.getElementById("phasePdfBtn");

/* State */
let appState = loadState();
let currentKey = phaseSelect.value;

/* Render helpers */
function fieldControlHTML(field, value) {
    const base = 'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm';
    if (field.type === "textarea") {
        return `<textarea data-field="${field.key}" class="${base} min-h-[120px]" placeholder="${field.placeholder || ""}">${value || ""}</textarea>`;
    }
    const type = field.type === "number" ? "number" : field.type;
    return `<input data-field="${field.key}" class="${base}" type="${type}" placeholder="${field.placeholder || ""}" value="${value || ""}"/>`;
}

function renderPhase() {
    // Title line
    const phase = PHASES.find(p => p.key === currentKey);
    // MVP toggle
    phaseMvp.checked = !!appState[currentKey].mvp;

    // Fields
    phaseFields.innerHTML = `
        <h3 class="text-lg font-medium">${phase.title}</h3>
        <div class="grid gap-4">
          ${phase.fields.map(f => {
        const val = appState[currentKey].values[f.key] || "";
        return `
              <div class="grid gap-2">
                <label class="text-sm opacity-80">${f.label}</label>
                ${fieldControlHTML(f, val)}
              </div>
            `;
    }).join("")}
        </div>
      `;

    // Wire inputs
    phaseFields.querySelectorAll("[data-field]").forEach(el => {
        el.addEventListener("input", (e) => {
            const k = e.target.getAttribute("data-field");
            appState[currentKey].values[k] = e.target.value;
            saveState(appState);
        });
    });

    // Resources (if any)
    if (phase.resources && phase.resources.length) {
        phaseResources.innerHTML = `
          <div>
            <h4 class="text-sm font-semibold mb-2">Helpful Resources</h4>
            <ul class="list-disc pl-5 space-y-1">
              ${phase.resources.map(r => `
                <li><a class="text-indigo-400 hover:underline" target="_blank" rel="noreferrer" href="${r.href}">${r.label}</a></li>
              `).join("")}
            </ul>
          </div>
        `;
    } else {
        phaseResources.innerHTML = "";
    }

    // Finalize button only on Phase 5
    phasePdfBtn.classList.toggle("hidden", currentKey !== "refine");
}

/* Events */
phaseSelect.addEventListener("change", () => {
    currentKey = phaseSelect.value;
    renderPhase();
});

phaseMvp.addEventListener("change", () => {
    appState[currentKey].mvp = phaseMvp.checked;
    saveState(appState);
});

phaseClearBtn.addEventListener("click", () => {
    if (!confirm("Clear this phase?")) return;
    appState[currentKey] = defaultPhaseState();
    saveState(appState);
    renderPhase();
});

phasePdfBtn.addEventListener("click", () => {
    generatePdf();
});

/* PDF generator (all phases) */
function generatePdf() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 56, marginTop = 64;
    const lineGap = 18, sectionGap = 26, titleGap = 10;
    let y = marginTop;

    const addHeader = (text) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(18);
        doc.text(text, marginX, y); y += sectionGap;
    };
    const addSub = (text) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(13);
        doc.text(text, marginX, y); y += titleGap;
    };
    const addText = (label, value) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text(label, marginX, y); y += 14;

        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - marginX * 2;
        (doc.splitTextToSize(value || "—", maxWidth)).forEach(ln => { doc.text(ln, marginX, y); y += lineGap; });
        y += 6;
    };
    const addMvp = (isMvp) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(`MVP? ${isMvp ? "Yes" : "No"}`, marginX, y); y += sectionGap - 6;
    };
    const ensure = (needed = 120) => {
        const H = doc.internal.pageSize.getHeight();
        if (y + needed > H - marginTop) { doc.addPage(); y = marginTop; }
    };

    // Cover
    doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text("Project Phases — Draft", marginX, y); y += 28;
    doc.setFont("helvetica", "normal"); doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y); y += 40;

    // Each phase
    PHASES.forEach((phase, idx) => {
        ensure();
        addHeader(`${idx + 1}. ${phase.title}`);
        addMvp(!!appState[phase.key].mvp);

        phase.fields.forEach(f => {
            ensure(90);
            const val = appState[phase.key].values[f.key];
            addText(f.label, val);
        });

        if (phase.resources?.length) {
            ensure(80);
            addSub("Resources");
            doc.setFont("helvetica", "normal"); doc.setFontSize(11);
            phase.resources.forEach(r => { ensure(30); doc.text(`• ${r.label}: ${r.href}`, marginX, y); y += lineGap; });
            y += 8;
        }
    });

    doc.save("Project-Phases-Draft.pdf");
}

/* Initial render */
renderPhase();