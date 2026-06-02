import {
  FileText,
  CalendarDays,
  CreditCard,
} from "lucide-react";

import generateInvoicePdf from "../utils/generateInvoicePdf";

export default function InvoiceCard({ invoice }) {
  const normalizedStatus = invoice.status === "Paid" ? "Paid" : "Unpaid";

  const statusStyles = {
    Paid: "bg-green-500/10 text-green-300",
    Unpaid: "bg-red-500/10 text-red-300",
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        
        {/* LEFT SIDE */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-sky-300" />

            <h3 className="text-2xl font-black">
              {invoice.invoice_number}
            </h3>
          </div>

          <p className="mt-3 text-sm text-sky-300">
            {invoice.service || "MKETICS Service"}
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            {invoice.notes || "No invoice notes."}
          </p>

          {/* DETAILS */}
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
              <CreditCard className="h-4 w-4 text-sky-300" />

              R{Number(invoice.amount || 0).toLocaleString()}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
              <CalendarDays className="h-4 w-4 text-sky-300" />

              Due: {invoice.due_date || "Not set"}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => generateInvoicePdf(invoice)}
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-400"
            >
              Download PDF
            </button>

            {invoice.payment_url && (
              <a
                href={invoice.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
              >
                Pay Now
              </a>
            )}
          </div>
        </div>

        {/* STATUS */}
        <span
          className={`inline-flex h-fit rounded-full px-4 py-2 text-sm font-bold ${
            statusStyles[invoice.status] ||
            "bg-sky-500/10 text-sky-300"
          }`}
        >
          {normalizedStatus}
        </span>
      </div>
    </div>
  );
}