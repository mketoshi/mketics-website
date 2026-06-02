import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const money = (value) =>
  `R${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const niceDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function generateInvoicePdf(invoice) {
  const doc = new jsPDF("p", "mm", "a4");

  const dark = [3, 7, 18];
  const blue = [24, 102, 229];
  const softBlue = [37, 99, 235];
  const slate = [71, 85, 105];
  const lightBox = [241, 245, 249];
  const line = [203, 213, 225];
  const green = [22, 163, 74];
  const red = [220, 38, 38];

  const amount = Number(invoice.amount || 0);
  const vat = 0;
  const total = amount + vat;
  const invoiceNumber = invoice.invoice_number || "INV-0000";
  const status = invoice.status === "Paid" ? "Paid" : "Unpaid";
  const statusColor = status === "Paid" ? green : red;
  const invoiceDate = niceDate(invoice.created_at || Date.now());
  const dueDate = niceDate(invoice.due_date || invoice.created_at || Date.now());

  // HEADER
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 56, "F");

  try {
    doc.addImage("/images/logo-clean.png", "PNG", 18, 8, 58, 32);
  } catch {
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.setFontSize(24);
    doc.text("MKETICS", 20, 28);
  }

  doc.setDrawColor(...blue);
  doc.setLineWidth(0.8);
  doc.line(98, 9, 98, 42);

  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(24);
  doc.text("INVOICE", 112, 20);

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoiceNumber}`, 112, 32);
  doc.text(`Invoice Date: ${invoiceDate}`, 112, 40);
  doc.text(`Due Date: ${dueDate}`, 112, 48);

  doc.setFillColor(...statusColor);
  doc.roundedRect(158, 33, 34, 10, 5, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(10.5);
  doc.text(status.toUpperCase(), 175, 39.5, { align: "center" });

  // BILLING AREA
  doc.setTextColor(...blue);
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("BILLED TO", 18, 76);
  doc.text("FROM", 104, 76);

  doc.setDrawColor(...line);
  doc.line(93, 73, 93, 122);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.text(invoice.client_name || "Client", 18, 90);
  doc.setFont(undefined, "normal");
  doc.text(invoice.client_email || "client@example.com", 18, 102);

  doc.setFont(undefined, "bold");
  doc.text("MKETICS (PTY) LTD", 104, 90);
  doc.setFont(undefined, "normal");
  doc.text("info@mketics.co.za", 104, 102);
  doc.text("+27 72 286 4367", 104, 114);
  doc.text("www.mketics.co.za", 104, 126);

  // ITEM TABLE
  autoTable(doc, {
    startY: 135,
    head: [["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]],
    body: [[
      `${invoice.service || "MKETICS Service"}\n${invoice.notes || "Professional digital service."}`,
      "1",
      money(amount),
      money(amount),
    ]],
    margin: { left: 16, right: 16 },
    styles: {
      fontSize: 9,
      cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
      lineColor: blue,
      lineWidth: 0.18,
      valign: "middle",
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: blue,
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 98 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 32, halign: "center" },
      3: { cellWidth: 32, halign: "center" },
    },
  });

  const tableEnd = doc.lastAutoTable.finalY;

  // TOTALS BOX
  const totalsX = 116;
  const totalsY = tableEnd + 4;
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.45);
  doc.roundedRect(totalsX, totalsY, 68, 27, 4, 4);

  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.text("Subtotal", totalsX + 6, totalsY + 8);
  doc.text(money(amount), totalsX + 62, totalsY + 8, { align: "right" });
  doc.text("VAT", totalsX + 6, totalsY + 16);
  doc.text(money(vat), totalsX + 62, totalsY + 16, { align: "right" });

  doc.setFillColor(...blue);
  doc.rect(totalsX, totalsY + 20, 68, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(10.5);
  doc.text("TOTAL", totalsX + 6, totalsY + 25);
  doc.text(money(total), totalsX + 62, totalsY + 25, { align: "right" });

  // NOTES
  const notesY = tableEnd + 17;
  doc.setTextColor(...blue);
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("NOTES", 16, notesY);
  doc.setDrawColor(...line);
  doc.line(35, notesY - 1, 50, notesY - 1);

  doc.setTextColor(...slate);
  doc.setFont(undefined, "normal");
  doc.setFontSize(8.5);
  doc.text("Thank you for trusting MKETICS with your project.", 16, notesY + 8);
  doc.text("We appreciate your business.", 16, notesY + 15);

  doc.setTextColor(...blue);
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text("VISIBLE BANKING DETAILS", 16, notesY + 24);

  // PAYMENT BOX - fixed spacing below BOTH the totals box and notes.
  // This keeps the invoice on one page without overlapping like the uploaded sample.
  const visibleBankingY = notesY + 24;
  const payY = Math.max(totalsY + 34, visibleBankingY + 6);
  const payH = 58;

  doc.setFillColor(...lightBox);
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.45);
  doc.roundedRect(16, payY, 178, payH, 5, 5, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, "bold");
  doc.setFontSize(9.2);
  doc.text("PAYMENT METHODS - PRIMARY BUSINESS ACCOUNT", 23, payY + 9);

  doc.setTextColor(...slate);
  doc.setFont(undefined, "normal");
  doc.setFontSize(8);
  doc.text("Please use the invoice number as your payment reference.", 23, payY + 15.5);

  const leftLabelX = 23;
  const leftValueX = 57;
  const rightLabelX = 103;
  const rightValueX = 137;
  const r1 = payY + 24;
  const r2 = payY + 31;
  const r3 = payY + 38;
  const r4 = payY + 46;

  doc.setFontSize(8.2);
  doc.setTextColor(...slate);
  doc.setFont(undefined, "bold");
  doc.text("BANK:", leftLabelX, r1);
  doc.text("ACCOUNT HOLDER:", leftLabelX, r2);
  doc.text("ACCOUNT TYPE:", leftLabelX, r3);
  doc.text("ACCOUNT NUMBER:", leftLabelX, r4);
  doc.text("BRANCH:", rightLabelX, r1);
  doc.text("BRANCH CODE:", rightLabelX, r2);
  doc.text("SWIFT CODE:", rightLabelX, r3);
  doc.text("PAYMENT REFERENCE:", rightLabelX, r4);

  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, "bold");
  doc.text("Standard Bank", leftValueX, r1);
  doc.setFont(undefined, "normal");
  doc.text("MKETICS (PTY) LTD", leftValueX, r2);
  doc.text("Current Account", leftValueX, r3);
  doc.setFont(undefined, "bold");
  doc.text("10274150083", leftValueX, r4);

  doc.setFont(undefined, "normal");
  doc.text("BALLITO", rightValueX, r1);
  doc.text("051001", rightValueX, r2);
  doc.text("SBZA ZA JJ", rightValueX, r3);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...blue);
  doc.text(invoiceNumber, rightValueX, r4);

  doc.setTextColor(...blue);
  doc.setFont(undefined, "bold");
  doc.text("10274150083", leftValueX, r4);

  doc.setFillColor(...statusColor);
  doc.roundedRect(23, payY + 50, 56, 6.8, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(8.5);
  doc.text(`STATUS: ${status.toUpperCase()}`, 51, payY + 54.8, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, "normal");
  doc.setFontSize(7.5);
  doc.text(
    status === "Paid"
      ? "Payment received by MKETICS."
      : "Use the account number and reference above for payment.",
    86,
    payY + 54.6,
    { maxWidth: 98 }
  );

  // FOOTER
  doc.setFillColor(...dark);
  doc.roundedRect(16, 265, 178, 13, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.8);
  doc.setFont(undefined, "bold");
  doc.text("THANK YOU!", 24, 270.5);
  doc.setFont(undefined, "normal");
  doc.text("We look forward to building the future with you.", 24, 275);

  doc.setTextColor(...softBlue);
  doc.setFont(undefined, "bold");
  doc.text("NETWORK", 104, 270.5);
  doc.text("CLOUD", 130, 270.5);
  doc.text("SOFTWARE", 156, 270.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "normal");
  doc.text("Connect.", 104, 275);
  doc.text("Scale.", 130, 275);
  doc.text("Engineer.", 156, 275);

  doc.setFillColor(...dark);
  doc.roundedRect(16, 282, 178, 7, 2, 2, "F");
  doc.setFontSize(7.2);
  doc.text("+27 72 286 4367", 24, 286.8);
  doc.text("info@mketics.co.za", 96, 286.8, { align: "center" });
  doc.text("www.mketics.co.za", 184, 286.8, { align: "right" });

  doc.save(`${invoiceNumber}.pdf`);
}
