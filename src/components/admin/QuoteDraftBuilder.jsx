import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import QuotePreviewPanel, { openQuotePdfExport } from "./QuotePreviewPanel";

const defaultExclusions = [
  "Domain registration, hosting, third-party subscriptions and paid plugins are excluded unless stated otherwise.",
  "Content writing, product photography and brand identity design are excluded unless added to the scope.",
  "Additional pages, integrations or major revisions may require a revised quotation.",
].join("\n");

export default function QuoteDraftBuilder({
  lead,
  quotesState,
  onRefreshQuotes,
  onQuoteCreated,
}) {
  const [form, setForm] = useState(() => buildDefaultQuoteForm(lead));
  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [markLeadAsQuoted, setMarkLeadAsQuoted] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    setForm(buildDefaultQuoteForm(lead));
    setSaveState({
      loading: false,
      error: "",
      success: "",
    });
    setMarkLeadAsQuoted(true);
    setSelectedQuote(null);
  }, [lead?.id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (saveState.error || saveState.success) {
      setSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!lead?.id || !supabase) return;

    if (!form.title.trim()) {
      setSaveState({
        loading: false,
        error: "Quote title is required.",
        success: "",
      });
      return;
    }

    if (!form.scopeSummary.trim()) {
      setSaveState({
        loading: false,
        error: "Scope summary is required.",
        success: "",
      });
      return;
    }

    try {
      setSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const quoteRow = {
        lead_id: lead.id,
        title: form.title.trim(),
        quote_number: form.quoteNumber.trim() || generateQuoteNumber(),
        scope_summary: form.scopeSummary.trim(),
        exclusions: form.exclusions.trim() || null,
        amount: parseAmount(form.amount),
        currency: "ZAR",
        status: "draft",
        valid_until: form.validUntil || null,
      };

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert(quoteRow)
        .select(
          "id, lead_id, quote_number, title, scope_summary, exclusions, amount, currency, status, valid_until, created_at"
        )
        .single();

      if (quoteError) throw quoteError;

      if (markLeadAsQuoted) {
        const { error: leadError } = await supabase
          .from("leads")
          .update({ status: "quoted" })
          .eq("id", lead.id);

        if (leadError) throw leadError;
      }

      onQuoteCreated?.(quote, markLeadAsQuoted);
      setSelectedQuote(quote);

      setSaveState({
        loading: false,
        error: "",
        success: "Quote draft created successfully.",
      });

      setForm((current) => ({
        ...buildDefaultQuoteForm(lead),
        quoteNumber: generateQuoteNumber(),
        amount: current.amount,
      }));
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to create quote draft. Check Supabase quote permissions.",
        success: "",
      });
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <WalletCards size={22} />
      </div>

      <h3 className="mt-4 text-xl font-black text-[#020B1F]">
        Quote Draft Builder
      </h3>

      <p className="mt-2 text-sm leading-7 text-slate-600">
        Create a draft quote from this lead. It will be saved in Supabase and
        can be improved in the next step.
      </p>

      {saveState.error && (
        <StatusMessage type="error" message={saveState.error} />
      )}

      {saveState.success && (
        <StatusMessage type="success" message={saveState.success} />
      )}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-black text-[#061A33]">
            Quote Number
          </span>

          <input
            name="quoteNumber"
            value={form.quoteNumber}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#061A33]">
            Quote Title
          </span>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Website quotation"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Amount</span>

            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="5000"
              inputMode="decimal"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">
              Valid Until
            </span>

            <input
              name="validUntil"
              value={form.validUntil}
              onChange={handleChange}
              type="date"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-black text-[#061A33]">
            Scope Summary
          </span>

          <textarea
            name="scopeSummary"
            value={form.scopeSummary}
            onChange={handleChange}
            rows={7}
            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#061A33]">
            Exclusions / Notes
          </span>

          <textarea
            name="exclusions"
            value={form.exclusions}
            onChange={handleChange}
            rows={6}
            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
          <input
            type="checkbox"
            checked={markLeadAsQuoted}
            onChange={(event) => setMarkLeadAsQuoted(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#0B7CFF]"
          />

          <span className="text-sm font-bold leading-6 text-slate-700">
            Mark this lead as quoted after creating the draft.
          </span>
        </label>

        <button
          type="submit"
          disabled={saveState.loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveState.loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Creating Draft
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Create Quote Draft
            </>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-[#F8FCFF] p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
            Quote History
          </h4>

          <button
            type="button"
            onClick={onRefreshQuotes}
            disabled={quotesState.loading}
            className="inline-flex items-center rounded-full border border-[#0B7CFF]/25 bg-white px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {quotesState.loading ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={14} className="mr-2" />
            )}
            Refresh
          </button>
        </div>

        {quotesState.error && (
          <StatusMessage type="error" message={quotesState.error} />
        )}

        {quotesState.loading && (
          <p className="mt-4 text-sm font-bold text-slate-600">
            Loading quote history...
          </p>
        )}

        {!quotesState.loading && quotesState.quotes.length === 0 && (
          <p className="mt-4 text-sm font-bold leading-6 text-slate-600">
            No quote drafts have been created for this lead yet.
          </p>
        )}

        {!quotesState.loading &&
          quotesState.quotes.map((quote) => (
            <article
              key={quote.id}
              className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#020B1F]">
                      {quote.quote_number || "Draft Quote"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {quote.title}
                    </p>

                    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                      {formatCurrency(quote.amount, quote.currency)} •{" "}
                      {toReadableLabel(quote.status)} • {formatDate(quote.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(quote)}
                    className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                  >
                    <Eye size={14} className="mr-2" />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => openQuotePdfExport(quote, lead)}
                    className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                  >
                    <Download size={14} className="mr-2" />
                    PDF
                  </button>
                </div>
              </div>
            </article>
          ))}
      </div>

      {selectedQuote && (
        <QuotePreviewPanel
          quote={selectedQuote}
          lead={lead}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </section>
  );
}

function buildDefaultQuoteForm(lead) {
  return {
    quoteNumber: generateQuoteNumber(),
    title: `${lead?.service_needed || "MKETICS"} quotation`,
    amount: "",
    validUntil: getDefaultValidUntil(),
    scopeSummary: buildScopeSummary(lead),
    exclusions: defaultExclusions,
  };
}

function buildScopeSummary(lead) {
  return [
    `Client: ${lead?.full_name || "Client"}`,
    `Service: ${lead?.service_needed || "General MKETICS service"}`,
    lead?.budget && `Budget direction: ${lead.budget}`,
    lead?.timeline && `Timeline: ${lead.timeline}`,
    "",
    "Proposed scope:",
    `- Provide MKETICS service support for ${lead?.service_needed || "the requested project"}.`,
    "- Confirm requirements, scope and deliverables before project start.",
    "- Prepare and deliver the agreed digital solution or support service.",
    "- Provide review and handover guidance after completion.",
    "",
    "Client request summary:",
    lead?.project_details || "No project details provided.",
  ]
    .filter(Boolean)
    .join("\n");
}

function generateQuoteNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("");

  const timePart = [pad(now.getHours()), pad(now.getMinutes())].join("");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `MKQ-${datePart}-${timePart}${randomPart}`;
}

function getDefaultValidUntil() {
  const date = new Date();
  date.setDate(date.getDate() + 14);

  return date.toISOString().slice(0, 10);
}

function parseAmount(value) {
  if (!value) return null;

  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatCurrency(amount, currency = "ZAR") {
  if (!amount) return "Amount not set";

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(Number(amount));
}

function formatDate(value) {
  if (!value) return "Date not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}
