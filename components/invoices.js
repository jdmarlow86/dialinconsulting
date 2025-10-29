document.getElementById("downloadInvoiceBtn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Collect data
    const clientName = document.getElementById("clientName").value || "Client Name";
    const invoiceNumber = document.getElementById("invoiceNumber").value || "0001";
    const serviceDesc = document.getElementById("serviceDesc").value || "Consulting Service";
    const invoiceDate = document.getElementById("invoiceDate").value || new Date().toISOString().split("T")[0];
    const amount = document.getElementById("amount").value || "0.00";

    // Header
    doc.setFontSize(20);
    doc.text("Dial in Consulting", 20, 20);
    doc.setFontSize(10);
    doc.text("Email: dial.in.consulting@gmail.com", 20, 27);
    doc.text("Phone: (423) 912-1038", 20, 32);
    doc.line(20, 35, 190, 35);

    // Invoice Info
    doc.setFontSize(14);
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 45);
    doc.text(`Date: ${invoiceDate}`, 150, 45);

    // Client
    doc.setFontSize(12);
    doc.text(`Bill To:`, 20, 60);
    doc.text(clientName, 40, 60);

    // Service Details
    doc.text("Description:", 20, 80);
    doc.text(serviceDesc, 50, 80);

    // Amount
    doc.setFontSize(14);
    doc.text(`Total: $${parseFloat(amount).toFixed(2)}`, 20, 100);

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for choosing Dial in Consulting.", 20, 280);

    // Save PDF
    doc.save(`Invoice_${invoiceNumber}.pdf`);
});
