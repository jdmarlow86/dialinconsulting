// Invoices.js — generate a one-line invoice PDF using jsPDF.
// Works with the tab content #tab-invoices and namespaced field IDs.

(function () {
    // Pre-fill today's date when the tab is first revealed
    const setDefaultDate = () => {
        const el = document.getElementById("invInvoiceDate");
        if (el && !el.value) {
            const d = new Date();
            el.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }
    };

    // If your nav system toggles .hidden on tab switches, we can observe clicks:
    document.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.matches("[data-tab-jump='invoices'],[data-tab='invoices']")) {
            setTimeout(setDefaultDate, 0);
        }
    });

    // Also set on DOM ready (if user lands directly on the tab)
    document.addEventListener("DOMContentLoaded", setDefaultDate);

    // Generate PDF
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#invDownloadBtn");
        if (!btn) return;

        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert("PDF engine failed to load. Please check your network and try again.");
            return;
        }

        const doc = new jsPDF({ unit: "pt" });

        // Business identity (static, can be elevated to inputs later)
        const bizName = "Dial in Consulting";
        const bizEmail = "dial.in.consulting@gmail.com";
        const bizPhone = "(423) 912-1038";

        // Read UI values
        const clientName = read("invClientName", "Client Name");
        const invoiceNo = read("invInvoiceNumber", "0001");
        const invoiceDate = read("invInvoiceDate", new Date().toISOString().slice(0, 10));
        const serviceDesc = read("invServiceDesc", "Consulting Service");
        const amount = fixed2(read("invAmount", "0"));
        const notes = read("invNotes", "");

        // Layout constants
        const left = 48;
        const right = 564; // (letter width ~612 minus margins)
        let y = 64;

        // Header
        doc.setFont("helvetica", "bold"); doc.setFontSize(20);
        doc.text(bizName, left, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        y += 18; doc.text(`Email: ${bizEmail}`, left, y);
        y += 14; doc.text(`Phone: ${bizPhone}`, left, y);
        y += 14; doc.line(left, y, right, y);
        y += 24;

        // Invoice meta (right aligned)
        doc.setFont("helvetica", "bold"); doc.setFontSize(14);
        doc.text("INVOICE", right, 64, { align: "right" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        doc.text(`Invoice #: ${invoiceNo}`, right, 80, { align: "right" });
        doc.text(`Date: ${invoiceDate}`, right, 96, { align: "right" });

        // Bill To
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text("Bill To:", left, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        y += 16; doc.text(clientName, left, y);
        y += 16;

        // Table header
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text("Description", left, y);
        doc.text("Amount", right, y, { align: "right" });
        y += 10; doc.line(left, y, right, y); y += 18;

        // Row
        doc.setFont("helvetica", "normal");
        wrapText(doc, serviceDesc, left, y, 430, 12);
        doc.text(`$${amount}`, right, y, { align: "right" });
        // approximate next line
        const descLines = measureLines(doc, serviceDesc, 430);
        y += (descLines * 12) + 8;

        // Total
        doc.line(left, y, right, y); y += 18;
        doc.setFont("helvetica", "bold"); doc.text("Total", right - 80, y, { align: "right" });
        doc.text(`$${amount}`, right, y, { align: "right" });
        y += 28;

        // Notes
        if (notes.trim()) {
            doc.setFont("helvetica", "bold"); doc.text("Notes / Terms", left, y); y += 14;
            doc.setFont("helvetica", "normal"); wrapText(doc, notes, left, y, 520, 12);
        }

        // Footer
        doc.setFontSize(10);
        doc.text("Thank you for choosing Dial in Consulting.", left, 760);

        doc.save(`Invoice_${sanitize(invoiceNo)}.pdf`);
    });

    // helpers
    function read(id, fallback = "") {
        const el = document.getElementById(id);
        return (el && String(el.value).trim()) || fallback;
    }
    function fixed2(v) {
        const n = Number(v || 0);
        return isFinite(n) ? n.toFixed(2) : "0.00";
    }
    function sanitize(s) {
        return String(s).replace(/[^a-z0-9_\-]+/gi, "_").slice(0, 80);
    }
    function wrapText(doc, text, x, y, maxWidth, lineHeight) {
        const words = String(text).split(/\s+/);
        let line = "", cy = y;
        for (let i = 0; i < words.length; i++) {
            const test = line ? line + " " + words[i] : words[i];
            const w = doc.getTextDimensions(test).w;
            if (w > maxWidth && i > 0) {
                doc.text(line, x, cy);
                line = words[i];
                cy += lineHeight;
            } else {
                line = test;
            }
        }
        if (line) doc.text(line, x, cy);
    }
    function measureLines(doc, text, maxWidth) {
        const words = String(text).split(/\s+/);
        let line = "", lines = 1;
        for (let i = 0; i < words.length; i++) {
            const test = line ? line + " " + words[i] : words[i];
            const w = doc.getTextDimensions(test).w;
            if (w > maxWidth && i > 0) { lines++; line = words[i]; }
            else { line = test; }
        }
        return Math.max(1, lines);
    }
})();
