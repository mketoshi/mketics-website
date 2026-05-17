export function createPaymentLink(invoice, provider = "PayFast") {
  if (!invoice) return "";

  const amount =
    invoice.total_amount ||
    invoice.amount ||
    0;

  const description = encodeURIComponent(
    invoice.invoice_title || "MKETICS Invoice"
  );

  if (provider === "Yoco") {
    return `https://pay.yoco.com/r/${invoice.invoice_number}`;
  }

  return `https://www.payfast.co.za/eng/process?amount=${amount}&item_name=${description}`;
}