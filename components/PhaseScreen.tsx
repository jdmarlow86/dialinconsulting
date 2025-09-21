import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

/** ----- Types ----- */
type FieldType = "text" | "textarea" | "date" | "url" | "number";

type FieldDef = {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
};

type PhaseKey =
    | "idea"
    | "planning"
    | "marketing"
    | "postmortem"
    | "refine";

type PhaseConfig = {
    key: PhaseKey;
    title: string;
    fields: FieldDef[];
    resources?: { label: string; href: string }[];
};

/** ----- Phase Config (edit as you like) ----- */
const PHASES: PhaseConfig[] = [
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

/** ----- Storage helpers ----- */
const STORAGE_KEY = "phaseScreenData.v1";

type PhaseState = {
    mvp: boolean;
    values: Record<string, string>;
};

type AppState = Record<PhaseKey, PhaseState>;

const defaultPhaseState = (): PhaseState => ({ mvp: false, values: {} });

const defaultAppState = (): AppState =>
({
    idea: defaultPhaseState(),
    planning: defaultPhaseState(),
    marketing: defaultPhaseState(),
    postmortem: defaultPhaseState(),
    refine: defaultPhaseState(),
} as AppState);

/** ----- Component ----- */
const PhaseScreen: React.FC = () => {
    const [currentKey, setCurrentKey] = useState<PhaseKey>("idea");
    const [state, setState] = useState<AppState>(defaultAppState);

    // Load from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as AppState;
                setState({ ...defaultAppState(), ...parsed });
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const currentPhase = useMemo(
        () => PHASES.find((p) => p.key === currentKey)!,
        [currentKey]
    );

    const setField = (key: string, value: string) => {
        setState((prev) => ({
            ...prev,
            [currentKey]: {
                ...prev[currentKey],
                values: { ...prev[currentKey].values, [key]: value },
            },
        }));
    };

    const toggleMvp = () => {
        setState((prev) => ({
            ...prev,
            [currentKey]: { ...prev[currentKey], mvp: !prev[currentKey].mvp },
        }));
    };

    const clearCurrent = () => {
        setState((prev) => ({ ...prev, [currentKey]: defaultPhaseState() }));
    };

    /** ----- PDF generator for all phases ----- */
    const generatePdf = () => {
        const doc = new jsPDF({ unit: "pt", format: "letter" });
        const marginX = 56;
        const marginTop = 64;
        const lineGap = 18;
        const sectionGap = 26;
        const titleGap = 10;
        let y = marginTop;

        const addHeader = (text: string) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text(text, marginX, y);
            y += sectionGap;
        };

        const addSub = (text: string) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.text(text, marginX, y);
            y += titleGap;
        };

        const addText = (label: string, value?: string) => {
            // label
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(`${label}`, marginX, y);
            y += 14;

            // value (wrap)
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            const pageWidth = doc.internal.pageSize.getWidth();
            const maxWidth = pageWidth - marginX * 2;
            const lines = doc.splitTextToSize(value || "—", maxWidth);
            lines.forEach((ln: string) => {
                doc.text(ln, marginX, y);
                y += lineGap;
            });
            y += 6;
        };

        const addMvpBadge = (isMvp: boolean) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(`MVP? ${isMvp ? "Yes" : "No"}`, marginX, y);
            y += sectionGap - 6;
        };

        const ensureSpace = (needed = 120) => {
            const pageHeight = doc.internal.pageSize.getHeight();
            if (y + needed > pageHeight - marginTop) {
                doc.addPage();
                y = marginTop;
            }
        };

        // Cover
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("Project Phases — Draft", marginX, y);
        y += 28;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const now = new Date();
        doc.text(`Generated: ${now.toLocaleString()}`, marginX, y);
        y += 40;

        // Each phase
        PHASES.forEach((phase, idx) => {
            ensureSpace();
            addHeader(`${idx + 1}. ${phase.title}`);
            addMvpBadge(state[phase.key]?.mvp || false);

            phase.fields.forEach((f) => {
                ensureSpace(90);
                const val = state[phase.key]?.values?.[f.key];
                addText(f.label, val);
            });

            if (phase.resources?.length) {
                ensureSpace(80);
                addSub("Resources");
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                phase.resources.forEach((r) => {
                    ensureSpace(30);
                    doc.text(`• ${r.label}: ${r.href}`, marginX, y);
                    y += lineGap;
                });
                y += 8;
            }
        });

        doc.save("Project-Phases-Draft.pdf");
    };

    /** ----- UI ----- */
    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <section className="glass rounded-2xl p-5 sm:p-6 border border-neutral-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold">Phase Manager</h1>

                    {/* Phase Selector */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm opacity-80">Phase</label>
                        <select
                            className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm"
                            value={currentKey}
                            onChange={(e) => setCurrentKey(e.target.value as PhaseKey)}
                        >
                            <option value="idea">1. Idea and POC</option>
                            <option value="planning">2. Planning and Funding</option>
                            <option value="marketing">3. Marketing and Launch</option>
                            <option value="postmortem">4. Post Mortem and Improve</option>
                            <option value="refine">5. Refine and Dial In</option>
                        </select>
                    </div>
                </div>

                {/* MVP Toggle & actions */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-600"
                            checked={state[currentKey]?.mvp || false}
                            onChange={toggleMvp}
                        />
                        <span className="text-sm">MVP?</span>
                    </label>

                    <button
                        onClick={clearCurrent}
                        className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800"
                    >
                        Clear This Phase
                    </button>

                    {currentKey === "refine" && (
                        <button
                            onClick={generatePdf}
                            className="ml-auto text-sm px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                            title="Generate a PDF including all phases"
                        >
                            Finalize Draft (PDF)
                        </button>
                    )}
                </div>

                {/* Fields */}
                <div className="mt-6 grid gap-4">
                    <h2 className="text-lg font-medium">{currentPhase.title}</h2>

                    <div className="grid gap-4">
                        {currentPhase.fields.map((f) => {
                            const val = state[currentKey]?.values?.[f.key] || "";
                            return (
                                <div key={f.key} className="grid gap-2">
                                    <label className="text-sm opacity-80">{f.label}</label>

                                    {f.type === "textarea" ? (
                                        <textarea
                                            className="w-full min-h-[120px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm"
                                            placeholder={f.placeholder}
                                            value={val}
                                            onChange={(e) => setField(f.key, e.target.value)}
                                        />
                                    ) : (
                                        <input
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm"
                                            placeholder={f.placeholder}
                                            type={f.type === "number" ? "number" : f.type}
                                            value={val}
                                            onChange={(e) => setField(f.key, e.target.value)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Marketing resources */}
                    {currentPhase.resources?.length ? (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-2">Helpful Resources</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                {currentPhase.resources.map((r) => (
                                    <li key={r.href}>
                                        <a
                                            className="text-indigo-400 hover:underline"
                                            href={r.href}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {r.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </section>

            {/* Subtle style for glass (works with Tailwind CDN or build) */}
            <style>{`
        .glass {
          background: rgba(30,30,30,.6);
          backdrop-filter: blur(8px);
        }
      `}</style>
        </div>
    );
};

export default PhaseScreen;
