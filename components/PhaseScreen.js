// ======= Phase Planning Screen =======
document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("tab-phase");
    if (!root) return;

    const escapeHtml = (value = "") =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const PHASES = [
        {
            key: "idea",
            title: "Idea and POC",
            fields: [
                { key: "problem", label: "Problem Statement", type: "textarea", placeholder: "What user pain are we solving?" },
                { key: "hypothesis", label: "Hypothesis", type: "textarea", placeholder: "If we do X, users will Y because Z." },
                { key: "successCriteria", label: "Success Criteria", type: "textarea", placeholder: "Measurable outcomes for POC" },
                { key: "risks", label: "Key Risks / Assumptions", type: "textarea", placeholder: "Unknowns, blockers, technical risks" },
                { key: "pocPlan", label: "POC Plan", type: "textarea", placeholder: "Scope, constraints, what to build" },
                { key: "pocResult", label: "POC Result", type: "textarea", placeholder: "Evidence from tests / learnings" },
            ],
        },
        {
            key: "planning",
            title: "Planning and Funding",
            fields: [
                { key: "scope", label: "Project Scope", type: "textarea", placeholder: "What's in vs out" },
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
                { key: "didntGoWell", label: "What Didn't Go Well", type: "textarea" },
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
                { key: "optFocus", label: "Optimization Focus Areas", type: "textarea", placeholder: "Onboarding, activation, revenue, churn" },
                { key: "experiments", label: "Experiments Planned", type: "textarea", placeholder: "A/B tests, pricing, UX tweaks" },
                { key: "nextRelease", label: "Next Release Date", type: "date" },
                { key: "notes", label: "Notes", type: "textarea" },
            ],
        },
    ];

    const STORAGE_KEY = "phaseScreenData.v1";

    const optionMarkup = PHASES
        .map(phase => `<option value="${phase.key}">${escapeHtml(phase.title)}</option>`)
        .join("");

    root.innerHTML = `
        <div class="grid gap-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <label for="phaseSelect" class="text-sm text-neutral-300">Phase</label>
                    <select id="phaseSelect" class="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm">
                        ${optionMarkup}
                    </select>
                </div>
                <div class="flex items-center gap-3">
                    <span id="phaseStepLabel" class="text-xs text-neutral-400"></span>
                    <div class="flex gap-2">
                        <button id="phasePrevBtn" type="button" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm">Prev</button>
                        <button id="phaseNextBtn" type="button" class="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm">Next</button>
                    </div>
                </div>
            </div>

            <label class="flex items-center gap-2 text-sm text-neutral-300">
                <input id="phaseMvp" type="checkbox" class="h-4 w-4 rounded border-neutral-700 bg-neutral-900" />
                Mark this phase as MVP-ready
            </label>

            <div id="phaseFields" class="grid gap-4"></div>

            <div id="phaseResources" class="hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"></div>

            <div class="flex flex-wrap gap-2">
                <button id="phaseClearBtn" type="button" class="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm">Clear Phase</button>
                <button id="phasePdfBtn" type="button" class="hidden px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm">Download PDF</button>
            </div>
        </div>
    `;

    const defaultPhaseState = () => ({ mvp: false, values: {} });
    const defaultAppState = () => ({
        idea: defaultPhaseState(),
        planning: defaultPhaseState(),
        marketing: defaultPhaseState(),
        postmortem: defaultPhaseState(),
        refine: defaultPhaseState(),
    });

    const loadState = () => {
        try {
            return { ...defaultAppState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")) };
        } catch {
            return defaultAppState();
        }
    };

    const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const phaseSelect = document.getElementById("phaseSelect");
    const phaseMvp = document.getElementById("phaseMvp");
    const phaseFields = document.getElementById("phaseFields");
    const phaseResources = document.getElementById("phaseResources");
    const phaseClearBtn = document.getElementById("phaseClearBtn");
    const phasePdfBtn = document.getElementById("phasePdfBtn");
    const phasePrevBtn = document.getElementById("phasePrevBtn");
    const phaseNextBtn = document.getElementById("phaseNextBtn");
    const phaseStepLabel = document.getElementById("phaseStepLabel");

    if (!phaseSelect || !phaseFields || !phaseMvp) return;

    let appState = loadState();
    let currentKey = phaseSelect.value || PHASES[0].key;

    const fieldControlHTML = (field, value) => {
        const baseClass = "w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm";
        const labelText = escapeHtml(field.label);
        const placeholder = escapeHtml(field.placeholder || "");
        if (field.type === "textarea") {
            return `<div class="grid gap-2"><label class="text-sm opacity-80">${labelText}</label><textarea data-field="${field.key}" class="${baseClass} min-h-[120px]" placeholder="${placeholder}">${escapeHtml(value)}</textarea></div>`;
        }

        const inputType = field.type || "text";
        return `<div class="grid gap-2"><label class="text-sm opacity-80">${labelText}</label><input data-field="${field.key}" class="${baseClass}" type="${inputType}" placeholder="${placeholder}" value="${escapeHtml(value)}" /></div>`;
    };

    const renderPhase = () => {
        const phase = PHASES.find((p) => p.key === currentKey) || PHASES[0];
        phaseMvp.checked = !!appState[currentKey].mvp;

        const fieldsMarkup = phase.fields
            .map((field) => fieldControlHTML(field, appState[currentKey].values[field.key] || ""))
            .join("");

        phaseFields.innerHTML = `
            <h3 class="text-lg font-medium">${escapeHtml(phase.title)}</h3>
            ${fieldsMarkup}
        `;

        phaseFields.querySelectorAll("[data-field]").forEach((element) => {
            element.addEventListener("input", (event) => {
                const fieldKey = event.target.getAttribute("data-field");
                appState[currentKey].values[fieldKey] = event.target.value;
                saveState(appState);
            });
        });

        const resources = phase.resources || [];
        if (resources.length && phaseResources) {
            phaseResources.classList.remove("hidden");
            phaseResources.innerHTML = `
                <div>
                    <h4 class="text-sm font-semibold mb-2">Helpful Resources</h4>
                    <ul class="list-disc pl-5 space-y-1 text-sm">
                        ${resources
                            .map((resource) => `<li><a class="text-indigo-400 hover:underline" target="_blank" rel="noreferrer" href="${resource.href}">${escapeHtml(resource.label)}</a></li>`)
                            .join("")}
                    </ul>
                </div>
            `;
        } else if (phaseResources) {
            phaseResources.classList.add("hidden");
            phaseResources.innerHTML = "";
        }

        if (phasePdfBtn) {
            phasePdfBtn.classList.toggle("hidden", currentKey !== "refine");
        }
    };

    const currentIndex = () => PHASES.findIndex((phase) => phase.key === currentKey);

    const updateNavButtons = () => {
        const index = currentIndex();
        if (phasePrevBtn) phasePrevBtn.disabled = index <= 0;
        if (phaseNextBtn) phaseNextBtn.disabled = index >= PHASES.length - 1;
        if (phaseStepLabel) phaseStepLabel.textContent = `Step ${index + 1} of ${PHASES.length}`;
    };

    const setIndex = (index) => {
        const clamped = Math.max(0, Math.min(PHASES.length - 1, index));
        currentKey = PHASES[clamped].key;
        phaseSelect.value = currentKey;
        renderPhase();
        updateNavButtons();
    };

    phaseSelect.addEventListener("change", () => {
        currentKey = phaseSelect.value;
        renderPhase();
        updateNavButtons();
    });

    phaseMvp.addEventListener("change", () => {
        appState[currentKey].mvp = phaseMvp.checked;
        saveState(appState);
    });

    phaseClearBtn?.addEventListener("click", () => {
        if (!confirm("Clear this phase?")) return;
        appState[currentKey] = defaultPhaseState();
        saveState(appState);
        renderPhase();
    });

    phasePrevBtn?.addEventListener("click", () => setIndex(currentIndex() - 1));
    phaseNextBtn?.addEventListener("click", () => setIndex(currentIndex() + 1));

    const generatePdf = () => {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert("PDF library not loaded.");
            return;
        }

        const doc = new jsPDF({ unit: "pt", format: "letter" });
        const marginX = 56;
        const marginTop = 64;
        const lineGap = 18;
        const sectionGap = 26;
        const titleGap = 10;
        let y = marginTop;

        const ensureSpace = (needed = 120) => {
            const pageHeight = doc.internal.pageSize.getHeight();
            if (y + needed > pageHeight - marginTop) {
                doc.addPage();
                y = marginTop;
            }
        };

        const addHeader = (text) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text(text, marginX, y);
            y += sectionGap;
        };

        const addSubheader = (text) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.text(text, marginX, y);
            y += titleGap;
        };

        const addTextBlock = (label, value) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(label, marginX, y);
            y += 14;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
            doc
                .splitTextToSize(value || "", maxWidth)
                .forEach((line) => {
                    doc.text(line, marginX, y);
                    y += lineGap;
                });
            y += 6;
        };

        const addMvpLine = (isMvp) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(`MVP: ${isMvp ? "Yes" : "No"}`, marginX, y);
            y += sectionGap - 6;
        };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("Project Phases Draft", marginX, y);
        y += 28;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
        y += 40;

        PHASES.forEach((phase, index) => {
            ensureSpace();
            addHeader(`${index + 1}. ${phase.title}`);
            addMvpLine(!!appState[phase.key].mvp);
            phase.fields.forEach((field) => {
                ensureSpace(90);
                addTextBlock(field.label, appState[phase.key].values[field.key] || "");
            });
            if (phase.resources?.length) {
                ensureSpace(80);
                addSubheader("Resources");
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                phase.resources.forEach((resource) => {
                    ensureSpace(30);
                    doc.text(`${resource.label}: ${resource.href}`, marginX, y);
                    y += lineGap;
                });
                y += 8;
            }
        });

        doc.save("Project-Phases-Draft.pdf");
    };

    phasePdfBtn?.addEventListener("click", generatePdf);

    renderPhase();
    updateNavButtons();
});
