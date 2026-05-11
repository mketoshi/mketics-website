export default function generatePayfastLink(invoice) {
  const merchantId =
    import.meta.env.VITE_PAYFAST_MERCHANT_ID;

  const merchantKey =
    import.meta.env.VITE_PAYFAST_MERCHANT_KEY;

  const amount = Number(invoice.amount || 0).toFixed(2);

  const params = new URLSearchParams({
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: "http://localhost:5173/client-portal",
    cancel_url: "http://localhost:5173/client-portal",
    notify_url: "http://localhost:5173",
    name_first: "MKETICS",
    email_address: invoice.client_email || "",
    m_payment_id: invoice.invoice_number || "",
    amount,
    item_name: invoice.service || "MKETICS Invoice",
    item_description:
      invoice.notes || "MKETICS service invoice",
  });

  return `https://www.payfast.co.za/eng/process?${params.toString()}`;
}