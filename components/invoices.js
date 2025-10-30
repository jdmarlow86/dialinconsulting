// components/Invoices.js
(function () {
    const btn = document.getElementById('invDownloadBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert('PDF library not loaded.');
            return;
        }

        // read values
        const client = document.getElementById('invClientName')?.value || '';
        const num = document.getElementById('invInvoiceNumber')?.value || '';
        const svc = document.getElementById('invServiceDesc')?.value || '';
        const date = document.getElementById('invInvoiceDate')?.value || '';
        const amt = document.getElementById('invAmount')?.value || '';
        const notes = document.getElementById('invNotes')?.value || '';

        // build simple text invoice
        const lines = [
            `Dial in Consulting`,
            `Jonathan Marlow`,
            `Phone: 423-912-1038`,
            `Email: dial.in.consulting@gmail.com`,
            ``,
            `INVOICE #${num}`,
            `Date: ${date}`,
            ``,
            `Bill To: ${client}`,
            ``,
            `Service: ${svc}`,
            `Amount: $${amt}`,
            ``,
            `Notes / Terms:`,
            notes || '(none)',
        ];

        const doc = new jsPDF({ unit: 'pt', format: 'letter' });
        let y = 48;
        const lineHeight = 16;
        lines.forEach(ln => {
            doc.text(ln, 48, y);
            y += lineHeight;
        });

        const fname = `invoice_${(num || 'draft').replace(/\s+/g, '-')}.pdf`.toLowerCase();
        doc.save(fname);
    });
})();
