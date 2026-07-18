import {
  Building2,
  Download,
  FileText,
  Mail,
  Phone,
  Printer,
  X,
} from "lucide-react";

const companyDetails = {
  name: "MKETICS (PTY) LTD",
  tagline: "Speak Innovation. Deliver Value.",
  registrationNumber: "2026/290708/07",
  email: "services@mketics.co.za",
  phone: "+27 72 286 4367",
  website: "mketics.co.za",
  logo: "/assets/mketics-logo.webp",
};

export default function QuotePreviewPanel({ quote, lead, onClose }) {
  if (!quote) return null;

  function handleExportPdf() {
    openQuotePdfExport(quote, lead);
  }

  return (
    <section className="mt-6 rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            Quote Detail Preview
          </p>

          <h3 className="mt-2 text-2xl font-black text-[#020B1F]">
            {quote.quote_number || "Draft Quote"}
          </h3>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            Preview the quotation before sharing it with the client.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.22)] transition hover:-translate-y-0.5"
          >
            <Download size={17} className="mr-2" />
            Export PDF
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F8FCFF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
          >
            <X size={17} className="mr-2" />
            Close Preview
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="bg-[#061A33] p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <img
                src={companyDetails.logo}
                alt="MKETICS logo"
                className="h-14 w-auto object-contain"
              />

              <h4 className="mt-4 text-2xl font-black">
                {companyDetails.name}
              </h4>

              <p className="mt-1 text-sm font-semibold text-cyan-200">
                {companyDetails.tagline}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold leading-7 text-slate-200 md:text-right">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                Quotation
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {quote.quote_number || "Draft Quote"}
              </p>
              <p>{formatDate(quote.created_at)}</p>
              {quote.valid_until && <p>Valid until {formatDate(quote.valid_until)}</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-2">
          <PreviewCard title="Prepared For" icon={Building2}>
            <PreviewLine label="Client" value={lead?.full_name} />
            <PreviewLine label="Organisation" value={lead?.organisation} />
            <PreviewLine label="Email" value={lead?.email} />
            <PreviewLine label="Phone" value={lead?.phone} />
          </PreviewCard>

          <PreviewCard title="Quote Summary" icon={FileText}>
            <PreviewLine label="Title" value={quote.title} />
            <PreviewLine label="Status" value={toReadableLabel(quote.status)} />
            <PreviewLine
              label="Amount"
              value={formatCurrency(quote.amount, quote.currency)}
            />
            <PreviewLine label="Currency" value={quote.currency || "ZAR"} />
          </PreviewCard>
        </div>

        <div className="border-t border-slate-200 p-6">
          <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
            Scope Summary
          </h4>

          <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
            {quote.scope_summary || "No scope summary provided."}
          </p>
        </div>

        {quote.exclusions && (
          <div className="border-t border-slate-200 bg-[#F8FCFF] p-6">
            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
              Exclusions / Notes
            </h4>

            <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
              {quote.exclusions}
            </p>
          </div>
        )}

        <div className="grid gap-0 border-t border-slate-200 lg:grid-cols-3">
          <ContactBlock icon={Mail} label="Email" value={companyDetails.email} />
          <ContactBlock icon={Phone} label="Phone" value={companyDetails.phone} />
          <ContactBlock icon={Printer} label="Website" value={companyDetails.website} />
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold leading-6 text-slate-500">
        The Export PDF button opens the browser print window. Choose Save as PDF
        as the destination to download the quotation.
      </p>
    </section>
  );
}

function PreviewCard({ title, icon: Icon, children }) {
  return (
    <article className="border-t border-slate-200 p-6 lg:border-t-0 lg:[&:not(:first-child)]:border-l">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={19} />
        </div>

        <h4 className="text-lg font-black text-[#020B1F]">{title}</h4>
      </div>

      <div className="mt-5 grid gap-3">{children}</div>
    </article>
  );
}

function PreviewLine({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ContactBlock({ icon: Icon, label, value }) {
  return (
    <div className="border-t border-slate-200 p-5 lg:border-t-0 lg:[&:not(:first-child)]:border-l">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#EAF6FF] text-[#0B7CFF]">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function openQuotePdfExport(quote, lead) {
  const popup = window.open("", "_blank", "width=950,height=800");

  if (!popup) {
    window.alert(
      "The quote preview window was blocked. Please allow pop-ups for this site and try again."
    );
    return;
  }

  popup.document.open();
  popup.document.write(buildPrintableQuoteHtml(quote, lead));
  popup.document.close();

  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

function buildPrintableQuoteHtml(quote, lead) {
  const logoUrl = `${window.location.origin}${companyDetails.logo}`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(quote.quote_number || "MKETICS Quote")}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eaf6ff;
      color: #061a33;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.55;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 18px 70px rgba(2, 11, 31, 0.15);
    }
    .header {
      background: #061a33;
      color: #ffffff;
      padding: 28px 34px;
      display: flex;
      justify-content: space-between;
      gap: 28px;
      align-items: flex-start;
    }
    .logo { height: 58px; width: auto; object-fit: contain; }
    .company h1 { margin: 16px 0 0; font-size: 26px; }
    .company p { margin: 3px 0 0; color: #a5f3fc; font-weight: 700; }
    .quote-box {
      min-width: 230px;
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 18px;
      padding: 16px;
      text-align: right;
      background: rgba(255,255,255,0.06);
    }
    .eyebrow {
      margin: 0;
      color: #22d3ee;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .quote-number { margin: 8px 0 0; font-size: 18px; font-weight: 900; }
    .quote-meta { margin: 5px 0 0; color: #dbeafe; font-size: 13px; font-weight: 700; }
    .content { padding: 30px 34px 34px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .card {
      border: 1px solid #dbe8f4;
      border-radius: 18px;
      padding: 20px;
      background: #ffffff;
    }
    h2 { margin: 0; font-size: 18px; color: #020b1f; }
    .line { margin-top: 14px; }
    .label {
      margin: 0;
      color: #0b7cff;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .value { margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #334155; }
    .section {
      margin-top: 22px;
      border: 1px solid #dbe8f4;
      border-radius: 18px;
      padding: 22px;
      background: #ffffff;
      page-break-inside: avoid;
    }
    .section.light { background: #f8fcff; }
    .prewrap {
      margin: 12px 0 0;
      white-space: pre-wrap;
      font-size: 14px;
      font-weight: 700;
      color: #334155;
    }
    .amount {
      margin-top: 18px;
      border-radius: 18px;
      background: #eaf6ff;
      padding: 18px;
      text-align: right;
      font-size: 24px;
      font-weight: 900;
      color: #0b7cff;
    }
    .footer {
      margin-top: 28px;
      border-top: 1px solid #dbe8f4;
      padding-top: 18px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }
    @page { size: A4; margin: 0; }
    @media print {
      body { background: #ffffff; }
      .page { width: 100%; min-height: auto; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="company">
        <img class="logo" src="${escapeHtml(logoUrl)}" alt="MKETICS logo" />
        <h1>${escapeHtml(companyDetails.name)}</h1>
        <p>${escapeHtml(companyDetails.tagline)}</p>
      </div>
      <div class="quote-box">
        <p class="eyebrow">Quotation</p>
        <p class="quote-number">${escapeHtml(quote.quote_number || "Draft Quote")}</p>
        <p class="quote-meta">Issued: ${escapeHtml(formatDate(quote.created_at))}</p>
        ${
          quote.valid_until
            ? `<p class="quote-meta">Valid until: ${escapeHtml(formatDate(quote.valid_until))}</p>`
            : ""
        }
      </div>
    </header>

    <main class="content">
      <div class="grid">
        <section class="card">
          <h2>Prepared For</h2>
          ${printLine("Client", lead?.full_name)}
          ${printLine("Organisation", lead?.organisation)}
          ${printLine("Email", lead?.email)}
          ${printLine("Phone", lead?.phone)}
        </section>

        <section class="card">
          <h2>Quote Summary</h2>
          ${printLine("Title", quote.title)}
          ${printLine("Status", toReadableLabel(quote.status))}
          ${printLine("Currency", quote.currency || "ZAR")}
          <div class="amount">${escapeHtml(formatCurrency(quote.amount, quote.currency))}</div>
        </section>
      </div>

      <section class="section">
        <p class="eyebrow">Scope Summary</p>
        <div class="prewrap">${escapeHtml(quote.scope_summary || "No scope summary provided.")}</div>
      </section>

      ${
        quote.exclusions
          ? `<section class="section light">
              <p class="eyebrow">Exclusions / Notes</p>
              <div class="prewrap">${escapeHtml(quote.exclusions)}</div>
            </section>`
          : ""
      }

      <footer class="footer">
        <div>Email: ${escapeHtml(companyDetails.email)}</div>
        <div>Phone: ${escapeHtml(companyDetails.phone)}</div>
        <div>Website: ${escapeHtml(companyDetails.website)}</div>
      </footer>
    </main>
  </div>
</body>
</html>`;
}

function printLine(label, value) {
  if (!value) return "";

  return `<div class="line"><p class="label">${escapeHtml(label)}</p><p class="value">${escapeHtml(value)}</p></div>`;
}

function formatCurrency(amount, currency = "ZAR") {
  if (amount === null || amount === undefined || amount === "") {
    return "Amount not set";
  }

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
