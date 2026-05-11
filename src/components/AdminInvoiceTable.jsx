import generatePayfastLink from "../utils/generatePayfastLink";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import generateInvoicePdf from "../utils/generateInvoicePdf";

const STATUS_OPTIONS = ["Unpaid", "Pending", "Paid", "Overdue", "Cancelled"];

export default function AdminInvoiceTable() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setInvoices(data || []);
    }

    setLoading(false);
  };

  const updateInvoice = async (id, field, value) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, [field]: value } : invoice
      )
    );

    const { error } = await supabase
      .from("invoices")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      alert("Invoice update failed. Check Supabase policy.");
      fetchInvoices();
    }
  };

  const generatePaymentLink = async (invoice) => {
    const paymentUrl = generatePayfastLink(invoice);

    await updateInvoice(invoice.id, "payment_url", paymentUrl);

    alert("Payment link generated successfully.");
  };

  const markPaid = async (invoice) => {
    await updateInvoice(invoice.id, "status", "Paid");
    await updateInvoice(invoice.id, "paid_at", new Date().toISOString());
    await updateInvoice(
      invoice.id,
      "payment_reference",
      invoice.invoice_number
    );

    alert("Invoice marked as paid.");
  };

  const createInvoice = async () => {
    const nextNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`;

    const { error } = await supabase.from("invoices").insert([
      {
        client_email: "client@example.com",
        invoice_number: nextNumber,
        service: "MKETICS Service",
        amount: 0,
        status: "Unpaid",
        due_date: new Date().toISOString().split("T")[0],
        notes: "Invoice notes.",
      },
    ]);

    if (error) {
      alert("Could not create invoice. Check Supabase policy.");
      return;
    }

    fetchInvoices();
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-black">Invoice Management</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create and update client invoices shown in the client portal.
          </p>
        </div>

        <button
          onClick={createInvoice}
          className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-400"
        >
          Create Invoice
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1350px] border-separate border-spacing-y-3 text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-2">Client Email</th>
              <th className="px-4 py-2">Invoice No.</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Notes</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="rounded-2xl bg-white/[0.035] p-8 text-center text-slate-400"
                >
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="rounded-2xl bg-white/[0.035] p-8 text-center text-slate-400"
                >
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="bg-white/[0.035]">
                  <td className="rounded-l-3xl px-4 py-4">
                    <input
                      value={invoice.client_email || ""}
                      onChange={(e) =>
                        updateInvoice(
                          invoice.id,
                          "client_email",
                          e.target.value
                        )
                      }
                      className="w-64 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <input
                      value={invoice.invoice_number || ""}
                      onChange={(e) =>
                        updateInvoice(
                          invoice.id,
                          "invoice_number",
                          e.target.value
                        )
                      }
                      className="w-36 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <input
                      value={invoice.service || ""}
                      onChange={(e) =>
                        updateInvoice(invoice.id, "service", e.target.value)
                      }
                      className="w-56 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      value={invoice.amount || 0}
                      onChange={(e) =>
                        updateInvoice(
                          invoice.id,
                          "amount",
                          Number(e.target.value)
                        )
                      }
                      className="w-28 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <select
                      value={invoice.status || "Unpaid"}
                      onChange={(e) =>
                        updateInvoice(invoice.id, "status", e.target.value)
                      }
                      className="rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-4">
                    <input
                      type="date"
                      value={invoice.due_date || ""}
                      onChange={(e) =>
                        updateInvoice(invoice.id, "due_date", e.target.value)
                      }
                      className="rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <textarea
                      value={invoice.notes || ""}
                      onChange={(e) =>
                        updateInvoice(invoice.id, "notes", e.target.value)
                      }
                      className="min-h-20 w-80 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="rounded-r-3xl px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => generateInvoicePdf(invoice)}
                        className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black text-white hover:bg-sky-400"
                      >
                        Download PDF
                      </button>

                      <button
                        onClick={() => markPaid(invoice)}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600"
                      >
                        Mark Paid
                      </button>

                      <button
                        onClick={() => generatePaymentLink(invoice)}
                        className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white hover:bg-purple-600"
                      >
                        Generate Pay Link
                      </button>

                      {invoice.payment_url && (
                        <a
                          href={invoice.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-white/10 px-4 py-2 text-center text-xs font-black text-white hover:bg-white/20"
                        >
                          Open Pay Link
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}