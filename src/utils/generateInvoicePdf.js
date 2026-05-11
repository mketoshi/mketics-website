import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generateInvoicePdf(invoice) {
  const doc = new jsPDF("p", "mm", "a4");

  const primary = [0, 115, 255];
  const sky = [14, 165, 233];
  const dark = [2, 8, 23];
  const slate = [51, 65, 85];

  const amount = Number(invoice.amount || 0);
  const vat = 0;
  const total = amount + vat;

  const invoiceDate = new Date(invoice.created_at || Date.now()).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // HEADER
  doc.setFillColor(...dark);
  doc.roundedRect(0, 0, 210, 58, 0, 0, "F");

  try {
    doc.addImage("/images/logo-clean.png", "PNG", 14, 5, 75, 48);
  } catch {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, "bold");
    doc.text("MKETICS", 14, 26);
  }

  doc.setDrawColor(...sky);
  doc.setLineWidth(0.8);
  doc.line(100, 8, 100, 50);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont(undefined, "bold");
  doc.text("INVOICE", 116, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Invoice No: ${invoice.invoice_number || "INV-0000"}`, 116, 32);
  doc.text(`Invoice Date: ${invoiceDate}`, 116, 39);
  doc.text(`Due Date: ${invoice.due_date || "Not set"}`, 116, 46);

  doc.setFillColor(...primary);
  doc.roundedRect(158, 42, 30, 8, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text((invoice.status || "UNPAID").toUpperCase(), 164, 47.5);

  // BILLING / FROM
  doc.setTextColor(...primary);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("BILLED TO", 14, 78);
  doc.text("FROM", 112, 78);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  doc.setFont(undefined, "bold");
  doc.text(invoice.client_name || "Client", 14, 89);

  doc.setFont(undefined, "normal");
  doc.text(invoice.client_email || "client@example.com", 14, 97);

  doc.setFont(undefined, "bold");
  doc.text("MKETICS (PTY) LTD", 112, 89);

  doc.setFont(undefined, "normal");
  doc.text("info@mketics.co.za", 112, 97);
  doc.text("+27 72 286 4367", 112, 105);
  doc.text("www.mketics.co.za", 112, 113);
  doc.text("South Africa", 112, 121);

  doc.setDrawColor(148, 163, 184);
  doc.line(95, 70, 95, 124);

  // SERVICE TABLE
  autoTable(doc, {
    startY: 137,
    head: [["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]],
    body: [
      [
        `${invoice.service || "MKETICS Service"}\n${invoice.notes || "Professional digital service."}`,
        "1",
        `R${amount.toLocaleString()}`,
        `R${amount.toLocaleString()}`,
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 5,
      valign: "top",
      lineColor: primary,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: primary,
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  const afterTable = doc.lastAutoTable.finalY + 12;

  // NOTES
  doc.setTextColor(...primary);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("NOTES", 14, afterTable);

  doc.setDrawColor(...primary);
  doc.line(32, afterTable - 1, 48, afterTable - 1);

  doc.setTextColor(...slate);
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.text("Thank you for trusting MKETICS with your project.", 14, afterTable + 10);
  doc.text("We appreciate your business.", 14, afterTable + 16);

  // TOTAL BOX
  doc.setDrawColor(...primary);
  doc.roundedRect(122, afterTable - 6, 74, 32, 3, 3);

  doc.setTextColor(...slate);
  doc.setFontSize(9);
  doc.text("Subtotal", 128, afterTable + 2);
  doc.text(`R${amount.toLocaleString()}`, 188, afterTable + 2, {
    align: "right",
  });

  doc.text("VAT", 128, afterTable + 11);
  doc.text(`R${vat.toLocaleString()}`, 188, afterTable + 11, {
    align: "right",
  });

  doc.setFillColor(...primary);
  doc.rect(122, afterTable + 17, 74, 9, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("TOTAL", 128, afterTable + 24);
  doc.text(`R${total.toLocaleString()}`, 188, afterTable + 24, {
    align: "right",
  });

  // PAYMENT METHODS
  const payY = afterTable + 48;

  doc.setTextColor(...primary);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("PAYMENT METHODS", 14, payY);
  doc.line(52, payY - 1, 68, payY - 1);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8.5);

  doc.setFont(undefined, "bold");
  doc.text("Standard Bank", 14, payY + 13);

  doc.setFont(undefined, "normal");
  doc.text("MKETICS (PTY) LTD", 14, payY + 19);
  doc.text("Acc: 10274150083", 14, payY + 25);
  doc.text("Branch: 051001", 14, payY + 31);
  doc.text("SWIFT: SBZA ZA JJ", 14, payY + 37);

  doc.setDrawColor(148, 163, 184);
  doc.line(70, payY + 8, 70, payY + 38);

  doc.setFont(undefined, "bold");
  doc.text("Capitec Bank", 78, payY + 13);

  doc.setFont(undefined, "normal");
  doc.text("Business: MKETICS", 78, payY + 19);
  doc.text("Acc: 2539728517", 78, payY + 25);
  doc.text("Branch: 470010", 78, payY + 31);
  doc.text("Type: Entrepreneur", 78, payY + 37);

  doc.line(136, payY + 8, 136, payY + 38);

  doc.setFont(undefined, "bold");
  doc.text("EFT / Instant EFT", 145, payY + 13);

  doc.setFont(undefined, "normal");
  doc.text("Use invoice number", 145, payY + 19);

  doc.setTextColor(...primary);
  doc.setFont(undefined, "bold");
  doc.text(invoice.invoice_number || "INV-0000", 145, payY + 25);

  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");
  doc.text("as reference.", 145, payY + 31);

  // THANK YOU FOOTER
  doc.setFillColor(...dark);
  doc.roundedRect(10, 255, 190, 18, 3, 3, "F");

  doc.setTextColor(...sky);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("THANK YOU!", 18, 263);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text(
    "We look forward to building the future with you.",
    18,
    268
  );

  // NETWORK COLUMN
  doc.setTextColor(...sky);
  doc.setFont(undefined, "bold");
  doc.text("NETWORK", 105, 263);

  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "normal");
  doc.text("Connect.", 105, 268);

  // CLOUD COLUMN
  doc.setTextColor(...sky);
  doc.setFont(undefined, "bold");
  doc.text("CLOUD", 135, 263);

  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "normal");
  doc.text("Scale.", 135, 268);

  // SOFTWARE COLUMN
  doc.setTextColor(...sky);
  doc.setFont(undefined, "bold");
  doc.text("SOFTWARE", 162, 263);

  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "normal");
  doc.text("Engineer.", 162, 268);

  // CONTACT FOOTER
  doc.setFillColor(...dark);
  doc.roundedRect(10, 280, 190, 10, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);

  doc.text("+27 72 286 4367", 18, 286);
  doc.text("info@mketics.co.za", 72, 286);
  doc.text("www.mketics.co.za", 132, 286);

  doc.save(`${invoice.invoice_number || "MKETICS-INVOICE"}.pdf`);
}