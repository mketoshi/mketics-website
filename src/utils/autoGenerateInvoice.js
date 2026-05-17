import { supabase } from "../lib/supabaseClient";

export async function autoGenerateInvoiceFromProposal(proposal) {
  try {
    if (!proposal) return null;

    const randomNumber = Math.floor(Math.random() * 99999);

    const invoiceNumber = `MKI-${new Date().getFullYear()}-${randomNumber}`;

    let amount = 8500;

    const lower =
      `${proposal.service_type || ""} ${proposal.requirements || ""}`.toLowerCase();

    if (lower.includes("website")) amount += 4500;
    if (lower.includes("dashboard")) amount += 6500;
    if (lower.includes("crm")) amount += 8500;
    if (lower.includes("hosting")) amount += 1500;
    if (lower.includes("cctv")) amount += 7000;
    if (lower.includes("network")) amount += 5000;
    if (lower.includes("cloud")) amount += 6500;

    const tax = amount * 0.15;
    const total = amount + tax;
    const paymentLink = createPaymentLink(
        {
                invoice_number: invoiceNumber,
                invoice_title:
                proposal.proposal_title || "MKETICS Invoice",
                total_amount: total,
            },
            "PayFast"
        );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          proposal_id: proposal.id,
          client_email: proposal.client_email,
          invoice_number: invoiceNumber,
          invoice_title:
            proposal.proposal_title || "MKETICS Invoice",
          amount,
          tax,
          total_amount: total,
          payment_status: "Pending",
          due_date: dueDate.toISOString(),
          payment_reference: invoiceNumber,
          invoice_pdf_url: paymentLink,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    await supabase.from("admin_notifications").insert([
      {
        title: "Invoice Auto Generated",
        message: `${invoiceNumber} created for ${proposal.client_email}`,
        type: "finance",
        is_read: false,
      },
    ]);

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}