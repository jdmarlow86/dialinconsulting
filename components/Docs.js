/* ========= Docs (Contracts/NDA/SOW) ========= */

(function () {
    const pane = document.getElementById('tab-docs');
    if (!pane) return;

    // Elements
    const tplSel = pane.querySelector('#docsTemplate');
    const form = pane.querySelector('#docsForm');
    const previewBtn = pane.querySelector('#docsPreview');
    const pdfBtn = pane.querySelector('#docsPdf');
    const mdBtn = pane.querySelector('#docsMd');
    const resetBtn = pane.querySelector('#docsReset');
    const clearDraftBtn = pane.querySelector('#docsClearDraft');
    const previewBox = pane.querySelector('#docsPreviewBox');

    // Quick bail if core UI is missing
    if (!tplSel || !form || !previewBox) {
        console.warn('[Docs] Required elements not found; Docs tab disabled.');
        return;
    }

    // Fields
    const F = (id) => pane.querySelector('#' + id);
    const fields = [
        'orgName', 'clientName', 'projectTitle', 'rate', 'billingCycle',
        'startDate', 'endDate', 'governingLaw', 'noticeDays', 'ipOwner',
        'contactEmail', 'contactPhone', 'scope', 'extras'
    ];

    // Draft persistence
    const KEY = 'DIC_DOCS_DRAFT_v1';
    function saveDraft() {
        const data = Object.fromEntries(fields.map(k => [k, F(k)?.value || '']));
        data.template = tplSel.value;
        try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { }
    }
    function loadDraft() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            fields.forEach(k => { if (F(k) && data[k] != null) F(k).value = data[k]; });
            if (data.template && tplSel) tplSel.value = data.template;
        } catch { }
    }
    function clearDraft() {
        try { localStorage.removeItem(KEY); } catch { }
    }

    // helper fns
    function fmtDate(v) {
        if (!v) return '';
        try { return new Date(v).toLocaleDateString(); } catch { return v; }
    }
    function indent(txt) {
        return (txt || '').split('\n').map(l => '  ' + l).join('\n');
    }
    function ipClause(opt) {
        switch ((opt || '').toLowerCase()) {
            case 'consultant':
                return 'Consultant retains ownership; Client receives a perpetual, worldwide, royalty-free license to use the Work Product for its internal business.';
            case 'workmade':
                return 'Work Product is a “work made for hire,” owned by Client. To the extent not a work made for hire, Consultant assigns all right, title, and interest to Client.';
            default:
                return 'Client owns the Work Product upon full payment; Consultant retains tools, know-how, and pre-existing materials.';
        }
    }

    const templates = {
        consulting: (d) => {
            const today = new Date().toLocaleDateString();
            return `CONSULTING AGREEMENT (SHORT-FORM)
Date: ${today}

Parties:
  Consultant: ${d.orgName || '[Consultant]'}
  Client: ${d.clientName || '[Client]'}

Project:
  Title: ${d.projectTitle || '[Project]'}
  Term: ${fmtDate(d.startDate)} to ${fmtDate(d.endDate) || 'completion'}
  Scope: 
${indent(d.scope || '[Describe deliverables, milestones, exclusions]')}

Fees & Payment:
  Rate: ${d.rate || '[Rate]'}
  Billing: ${d.billingCycle || 'Net 15'}
  Expenses: Pre-approved, reimbursable with receipts.

IP & Work Product:
  Ownership: ${ipClause(d.ipOwner)}
  Tools/Know-How of Consultant remain Consultant’s.

Confidentiality:
  Each party will keep Confidential Information secret and use it only for the Project.

Warranties & Liability:
  Services provided “as-is.” No consequential damages. Liability capped at fees paid.

Termination:
  Either party may terminate with ${d.noticeDays || '14'} days’ written notice; Client to pay for work performed to date.

Independent Contractor:
  Consultant is independent; no employment, partnership, or agency is created.

Governing Law:
  ${d.governingLaw || '[State]'}.

Special Terms:
${indent(d.extras || '[Optional special terms]')}

Signatures:

______________________________      ______________________________
${d.orgName || 'Consultant'}         ${d.clientName || 'Client'}

Name: ________________________      Name: ________________________
Title: _______________________      Title: _______________________
Email: ${d.contactEmail || ''}       Email: ______________________
Phone: ${d.contactPhone || ''}       Phone: ______________________
Date:  _______________________      Date:  _______________________
`;
        },

        nda: (d) => {
            const today = new Date().toLocaleDateString();
            return `MUTUAL NON-DISCLOSURE AGREEMENT
Date: ${today}

Parties:
  ${d.orgName || '[Party A]'} and ${d.clientName || '[Party B]'} agree:

1. Purpose. The parties may exchange certain confidential information in connection with "${d.projectTitle || 'a potential business relationship'}".

2. Confidential Information. Non-public information disclosed in any form and marked or reasonably understood as confidential.

3. Use & Protection. Recipient will:
   (a) use Confidential Information only for the Purpose;
   (b) not disclose it to third parties except to Representatives with need-to-know and subject to similar obligations; and
   (c) protect it with reasonable care.

4. Exclusions. Information that is or becomes public (through no fault of Recipient), already known, independently developed, or rightfully received from a third party without duty of confidentiality.

5. Compelled Disclosure. Recipient may disclose if legally required, providing prompt notice (where lawful) to allow Discloser to seek protection.

6. Term. Confidentiality obligations apply for three (3) years from disclosure; trade secrets survive as long as they remain trade secrets.

7. No License. No rights granted except as expressly set forth.

8. No Warranty. All information is provided “as-is.”

9. Return/Destroy. Upon request, Recipient will return or destroy Confidential Information.

10. Governing Law. ${d.governingLaw || '[State]'}.

Signatures:

______________________________      ______________________________
${d.orgName || 'Party A'}            ${d.clientName || 'Party B'}

Name: ________________________      Name: ________________________
Title: _______________________      Title: _______________________
Email: ${d.contactEmail || ''}       Email: ______________________
Phone: ${d.contactPhone || ''}       Phone: ______________________
Date:  _______________________      Date:  _______________________
`;
        },

        sow: (d) => {
            const today = new Date().toLocaleDateString();
            return `STATEMENT OF WORK (SOW) ADDENDUM
Date: ${today}

This SOW is incorporated into and governed by the Master Agreement between ${d.orgName || '[Consultant]'} and ${d.clientName || '[Client]'}.

Project:
  Title: ${d.projectTitle || '[Project]'}
  Term: ${fmtDate(d.startDate)} to ${fmtDate(d.endDate) || 'completion'}

Scope & Deliverables:
${indent(d.scope || '[Detail deliverables, acceptance criteria, assumptions, out-of-scope items]')}

Schedule & Milestones:
  - [Milestone 1 — date/criteria]
  - [Milestone 2 — date/criteria]

Fees & Payment:
  Rate/Price: ${d.rate || '[Rate]'}
  Billing: ${d.billingCycle || 'Net 15'}
  Expenses: Pre-approved, reimbursable with receipts.

Change Control:
  Changes to scope/schedule/fees require written approval by both parties.

IP & Ownership:
  ${ipClause(d.ipOwner)}

Governing Law: ${d.governingLaw || '[State]'}.

Signatures:

______________________________      ______________________________
${d.orgName || 'Consultant'}         ${d.clientName || 'Client'}

Name: ________________________      Name: ________________________
Title: _______________________      Title: _______________________
Date:  _______________________      Date:  _______________________
`;
        }
    };

    function collect() {
        const d = {};
        fields.forEach(k => d[k] = (F(k)?.value || '').trim());
        d.template = tplSel.value;
        return d;
    }

    function buildText(d) {
        const fn = templates[d.template] || templates.consulting;
        return fn(d);
    }

    function showPreview() {
        const d = collect();
        const text = buildText(d);
        previewBox.textContent = text;
    }

    function downloadMd(filename, text) {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        a.remove(); URL.revokeObjectURL(url);
    }

    function downloadPdf(filename, text) {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert('PDF library not loaded.');
            return;
        }
        const doc = new jsPDF({ unit: 'pt', format: 'letter' });
        const margin = 48;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - margin * 2;
        const lines = doc.splitTextToSize(text, maxWidth);

        let y = margin;
        const lineHeight = 14;
        lines.forEach((ln) => {
            if (y > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(ln, margin, y);
            y += lineHeight;
        });
        doc.save(filename);
    }

    function fileNameFor(d) {
        const base = (d.template || 'consulting')
            + '_' + (d.clientName || 'client').replace(/\s+/g, '-');
        return base.toLowerCase();
    }

    // Wire events ONLY if the element exists
    if (previewBtn) {
        previewBtn.addEventListener('click', showPreview);
    }

    if (mdBtn) {
        mdBtn.addEventListener('click', () => {
            const d = collect();
            const text = buildText(d);
            const fname = fileNameFor(d) + '.md';
            downloadMd(fname, text);
        });
    }

    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            const d = collect();
            const text = buildText(d);
            const fname = fileNameFor(d) + '.pdf';
            downloadPdf(fname, text);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            saveDraft();
            showPreview();
        });
    }

    if (clearDraftBtn) {
        clearDraftBtn.addEventListener('click', () => {
            clearDraft();
            alert('Draft cleared.');
        });
    }

    // auto-save on any input
    pane.addEventListener('input', saveDraft);
    tplSel.addEventListener('change', saveDraft);

    // init
    loadDraft();
    showPreview();
})();
