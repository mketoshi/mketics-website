import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  Eye,
  FileText,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const settingKeys = {
  quoteResponses: "client_portal_quote_responses_v1",
  paymentRequests: "client_portal_invoice_payment_requests_v1",
  projectApprovals: "client_portal_project_approvals_v1",
};

const inboxStatuses = ["new", "reviewed", "in_progress", "completed", "archived"];
const inboxTypes = ["all", "quote_response", "payment_request", "project_feedback"];

export default function ClientPortalResponseInbox({ isActive }) {
  const [state, setState] = useState({
    loading: false,
    error: "",
    quoteResponses: [],
    paymentRequests: [],
    projectApprovals: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [detailForm, setDetailForm] = useState({
    status: "reviewed",
    adminNote: "",
  });
  const [saveState, setSaveState] = useState({ loading: false, error: "", success: "" });
  const [copyState, setCopyState] = useState("");

  const inboxItems = useMemo(() => {
    return [
      ...state.quoteResponses.map((item) => normaliseInboxItem("quote_response", item)),
      ...state.paymentRequests.map((item) => normaliseInboxItem("payment_request", item)),
      ...state.projectApprovals.map((item) => normaliseInboxItem("project_feedback", item)),
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [state.quoteResponses, state.paymentRequests, state.projectApprovals]);

  const selectedItem = useMemo(
    () => inboxItems.find((item) => item.id === selectedItemId) || null,
    [inboxItems, selectedItemId]
  );

  const filteredItems = useMemo(() => {
    return inboxItems.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const haystack = [
        item.title,
        item.subtitle,
        item.clientName,
        item.clientEmail,
        item.status,
        item.typeLabel,
        item.message,
        item.reference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchTerm.trim() || haystack.includes(searchTerm.trim().toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [inboxItems, typeFilter, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = inboxItems.length;
    const newItems = inboxItems.filter((item) => item.status === "new").length;
    const quoteResponses = inboxItems.filter((item) => item.type === "quote_response").length;
    const paymentRequests = inboxItems.filter((item) => item.type === "payment_request").length;
    const projectFeedback = inboxItems.filter((item) => item.type === "project_feedback").length;
    const completed = inboxItems.filter((item) => item.status === "completed").length;

    return { total, newItems, quoteResponses, paymentRequests, projectFeedback, completed };
  }, [inboxItems]);

  useEffect(() => {
    if (isActive) fetchInboxRecords();
  }, [isActive]);

  useEffect(() => {
    if (!selectedItem) return;

    setDetailForm({
      status: selectedItem.status === "new" ? "reviewed" : selectedItem.status,
      adminNote: selectedItem.adminNote || "",
    });

    setSaveState({ loading: false, error: "", success: "" });
  }, [selectedItemId, selectedItem?.status, selectedItem?.adminNote]);

  async function fetchInboxRecords() {
    if (!supabase) return;

    try {
      setState((current) => ({ ...current, loading: true, error: "" }));

      const { data, error } = await supabase
        .from("settings")
        .select("setting_key, setting_value")
        .in("setting_key", Object.values(settingKeys));

      if (error) throw error;

      const settings = new Map((data || []).map((item) => [item.setting_key, item.setting_value]));

      setState({
        loading: false,
        error: "",
        quoteResponses: normaliseArray(settings.get(settingKeys.quoteResponses)),
        paymentRequests: normaliseArray(settings.get(settingKeys.paymentRequests)),
        projectApprovals: normaliseArray(settings.get(settingKeys.projectApprovals)),
      });
    } catch (error) {
      setState({
        loading: false,
        error: error?.message || "Unable to load client portal responses. Check Supabase settings permissions.",
        quoteResponses: [],
        paymentRequests: [],
        projectApprovals: [],
      });
    }
  }

  async function handleSaveResponse(event) {
    event.preventDefault();

    if (!selectedItem || !supabase) return;

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const sourceKey = getSourceSettingKey(selectedItem.type);
      const sourceItems = getSourceItems(selectedItem.type, state);
      const now = new Date().toISOString();

      const updatedItems = sourceItems.map((item) => {
        if (item.id !== selectedItem.sourceId) return item;

        const nextItem = {
          ...item,
          inboxStatus: detailForm.status,
          adminNote: detailForm.adminNote.trim(),
          adminReviewedAt: now,
          updatedAt: now,
        };

        if (detailForm.status === "completed") nextItem.completedAt = now;
        if (detailForm.status !== "completed") delete nextItem.completedAt;

        return nextItem;
      });

      await upsertSettingsValue(sourceKey, updatedItems);

      setState((current) => ({
        ...current,
        quoteResponses: selectedItem.type === "quote_response" ? updatedItems : current.quoteResponses,
        paymentRequests: selectedItem.type === "payment_request" ? updatedItems : current.paymentRequests,
        projectApprovals: selectedItem.type === "project_feedback" ? updatedItems : current.projectApprovals,
      }));

      setSaveState({ loading: false, error: "", success: "Portal response updated." });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to update portal response. Check Supabase settings permissions.",
        success: "",
      });
    }
  }

  async function upsertSettingsValue(settingKey, value) {
    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: settingKey,
        setting_value: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;
  }

  async function copyInboxSummary() {
    const summary = buildInboxSummary(filteredItems, stats);
    await navigator.clipboard.writeText(summary);
    setCopyState("Inbox summary copied.");
    window.setTimeout(() => setCopyState(""), 2000);
  }

  function openItem(item) {
    setSelectedItemId(item.id);
  }

  function closeItem() {
    setSelectedItemId("");
    setSaveState({ loading: false, error: "", success: "" });
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Client Portal Response Inbox
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#020B1F]">
              Client responses and requests.
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Review quote acceptances, invoice payment messages and project approval feedback sent from the client portal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyInboxSummary}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy Summary
            </button>
            <button
              type="button"
              onClick={fetchInboxRecords}
              disabled={state.loading}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
            >
              {state.loading ? <Loader2 size={17} className="mr-2 animate-spin" /> : <RefreshCw size={17} className="mr-2" />}
              Refresh Inbox
            </button>
          </div>
        </div>

        {copyState && <StatusMessage type="success" message={copyState} />}
        {state.error && <StatusMessage type="error" message={state.error} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="New" value={stats.newItems} />
        <StatCard label="Quote Responses" value={stats.quoteResponses} />
        <StatCard label="Payment Requests" value={stats.paymentRequests} />
        <StatCard label="Project Feedback" value={stats.projectFeedback} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      {selectedItem && (
        <ResponseDetailPanel
          item={selectedItem}
          form={detailForm}
          saveState={saveState}
          onChange={(event) => {
            const { name, value } = event.target;
            setDetailForm((current) => ({ ...current, [name]: value }));
            if (saveState.error || saveState.success) setSaveState({ loading: false, error: "", success: "" });
          }}
          onClose={closeItem}
          onSave={handleSaveResponse}
        />
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative block">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search client responses, quote numbers, invoices or notes..."
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            {inboxTypes.map((type) => (
              <option key={type} value={type}>{type === "all" ? "All types" : toReadableLabel(type)}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            <option value="all">All statuses</option>
            {inboxStatuses.map((status) => (
              <option key={status} value={status}>{toReadableLabel(status)}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full border-collapse bg-white text-left">
              <thead className="bg-[#F8FCFF]">
                <tr>
                  <Th>Date</Th>
                  <Th>Client</Th>
                  <Th>Type</Th>
                  <Th>Reference</Th>
                  <Th>Message</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {state.loading && (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center">
                      <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                      <p className="mt-3 text-sm font-black text-slate-500">Loading portal responses...</p>
                    </td>
                  </tr>
                )}

                {!state.loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center">
                      <Inbox className="mx-auto text-slate-400" size={28} />
                      <p className="mt-3 text-sm font-black text-slate-500">No client portal responses found.</p>
                    </td>
                  </tr>
                )}

                {!state.loading && filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]">
                    <Td>
                      <p className="font-black text-[#061A33]">{formatDate(item.createdAt)}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatTime(item.createdAt)}</p>
                    </Td>
                    <Td>
                      <p className="font-black text-[#020B1F]">{item.clientName}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.clientEmail || "No email"}</p>
                    </Td>
                    <Td>
                      <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
                        {item.typeLabel}
                      </span>
                    </Td>
                    <Td>
                      <p className="font-black text-[#061A33]">{item.title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.subtitle}</p>
                    </Td>
                    <Td>
                      <p className="line-clamp-3 max-w-[320px] text-sm font-semibold leading-6 text-slate-700">
                        {item.message || "No message provided."}
                      </p>
                    </Td>
                    <Td><StatusBadge status={item.status} /></Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                      >
                        <Eye size={14} className="mr-2" />
                        Review
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResponseDetailPanel({ item, form, saveState, onChange, onClose, onSave }) {
  return (
    <section className="rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">Response Detail</p>
          <h3 className="mt-2 text-2xl font-black text-[#020B1F]">{item.title}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-600">{item.typeLabel} from {item.clientName} • {formatFullDate(item.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F8FCFF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <X size={17} className="mr-2" />
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-5">
          <DetailCard title="Client Message" icon={MessageCircle}>
            <DetailLine label="Client" value={item.clientName} />
            <DetailLine label="Email" value={item.clientEmail} />
            <DetailLine label="Phone" value={item.clientPhone} />
            <DetailLine label="Reference" value={item.subtitle} />
            <DetailLine label="Request Type" value={toReadableLabel(item.reference)} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Message</p>
              <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
                {item.message || "No message provided."}
              </p>
            </div>
          </DetailCard>

          {item.requestInvoice && (
            <DetailCard title="Invoice Request" icon={FileText}>
              <p className="text-sm font-bold leading-7 text-slate-700">
                The client requested invoice or payment details with this quote response.
              </p>
            </DetailCard>
          )}
        </div>

        <form onSubmit={onSave} className="rounded-[1.5rem] border border-cyan-200 bg-[#F8FCFF] p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Inbox size={22} />
          </div>
          <h3 className="mt-4 text-xl font-black text-[#020B1F]">Manage response</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Update the inbox status and keep an internal note for MKETICS follow-up.
          </p>

          {saveState.error && <StatusMessage type="error" message={saveState.error} />}
          {saveState.success && <StatusMessage type="success" message={saveState.success} />}

          <label className="mt-5 block">
            <span className="text-sm font-black text-[#061A33]">Inbox Status</span>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              {inboxStatuses.map((status) => <option key={status} value={status}>{toReadableLabel(status)}</option>)}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-[#061A33]">Admin Note</span>
            <textarea
              name="adminNote"
              value={form.adminNote}
              onChange={onChange}
              rows={7}
              placeholder="Example: Invoice requested. Prepare invoice and send banking details."
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ActionLink href={item.whatsAppLink} disabled={!item.whatsAppLink} label="WhatsApp" icon={MessageCircle} external />
            <ActionLink href={item.emailLink} disabled={!item.emailLink} label="Email" icon={Mail} />
            <ActionLink href={item.phoneLink} disabled={!item.phoneLink} label="Call" icon={Phone} />
          </div>

          <button
            type="submit"
            disabled={saveState.loading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveState.loading ? <><Loader2 size={18} className="mr-2 animate-spin" />Saving</> : <><Save size={18} className="mr-2" />Save Response Update</>}
          </button>
        </form>
      </div>
    </section>
  );
}

function getSourceSettingKey(type) {
  if (type === "quote_response") return settingKeys.quoteResponses;
  if (type === "payment_request") return settingKeys.paymentRequests;
  return settingKeys.projectApprovals;
}

function getSourceItems(type, state) {
  if (type === "quote_response") return state.quoteResponses;
  if (type === "payment_request") return state.paymentRequests;
  return state.projectApprovals;
}

function normaliseInboxItem(type, source) {
  if (!source?.id) return null;

  const base = {
    id: `${type}:${source.id}`,
    sourceId: source.id,
    type,
    status: source.inboxStatus || source.adminStatus || "new",
    adminNote: source.adminNote || "",
    clientId: source.clientId || "",
    clientName: source.clientName || "Client",
    clientEmail: source.clientEmail || "",
    clientPhone: source.clientPhone || source.phone || "",
    createdAt: source.createdAt || source.created_at || new Date().toISOString(),
    updatedAt: source.updatedAt || source.updated_at || source.createdAt || new Date().toISOString(),
  };

  if (type === "quote_response") {
    return {
      ...base,
      typeLabel: "Quote Response",
      title: source.quoteNumber || "Quote",
      subtitle: source.quoteTitle || "MKETICS Quote",
      reference: source.responseType || "accepted",
      message: source.feedback || (source.responseType === "accepted" ? "Client accepted the quote." : "No message provided."),
      requestInvoice: Boolean(source.requestInvoice),
      emailLink: buildEmailLink(source.clientEmail, `MKETICS quote response - ${source.quoteNumber || "Quote"}`, buildEmailBody(base.clientName, source.feedback || "Thank you for your quote response. MKETICS will follow up shortly.")),
      whatsAppLink: buildWhatsAppLink(source.clientPhone, buildWhatsAppMessage(base.clientName, source.quoteNumber || "your quote")),
      phoneLink: source.clientPhone ? `tel:${sanitizePhone(source.clientPhone)}` : "",
    };
  }

  if (type === "payment_request") {
    return {
      ...base,
      typeLabel: "Payment Request",
      title: source.invoiceNumber || "Invoice",
      subtitle: source.invoiceTitle || "MKETICS Invoice",
      reference: source.requestType || "payment_made",
      message: [
        source.note,
        source.reference && `Reference: ${source.reference}`,
        source.amount ? `Amount: ${formatCurrency(source.amount)}` : "",
      ].filter(Boolean).join("\n"),
      emailLink: buildEmailLink(source.clientEmail, `MKETICS payment request - ${source.invoiceNumber || "Invoice"}`, buildEmailBody(base.clientName, "Thank you for your payment message. MKETICS will verify and update your invoice record.")),
      whatsAppLink: buildWhatsAppLink(source.clientPhone, buildWhatsAppMessage(base.clientName, source.invoiceNumber || "your invoice")),
      phoneLink: source.clientPhone ? `tel:${sanitizePhone(source.clientPhone)}` : "",
    };
  }

  return {
    ...base,
    typeLabel: "Project Feedback",
    title: source.projectTitle || "Project",
    subtitle: toReadableLabel(source.decision || "Client response"),
    reference: source.decision || "project_feedback",
    message: source.feedback || "No project feedback provided.",
    emailLink: buildEmailLink(source.clientEmail, `MKETICS project feedback - ${source.projectTitle || "Project"}`, buildEmailBody(base.clientName, "Thank you for your project feedback. MKETICS will review it and respond.")),
    whatsAppLink: buildWhatsAppLink(source.clientPhone, buildWhatsAppMessage(base.clientName, source.projectTitle || "your project")),
    phoneLink: source.clientPhone ? `tel:${sanitizePhone(source.clientPhone)}` : "",
  };
}

function normaliseArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildInboxSummary(items, stats) {
  return [
    "MKETICS Client Portal Response Inbox",
    "",
    `Total responses: ${stats.total}`,
    `New responses: ${stats.newItems}`,
    `Quote responses: ${stats.quoteResponses}`,
    `Payment requests: ${stats.paymentRequests}`,
    `Project feedback: ${stats.projectFeedback}`,
    "",
    "Visible responses:",
    ...items.slice(0, 20).map((item, index) => `${index + 1}. ${item.typeLabel} - ${item.clientName} - ${item.title} - ${toReadableLabel(item.status)}`),
  ].join("\n");
}

function buildEmailBody(clientName, message) {
  return [
    `Hello ${clientName || ""},`,
    "",
    message,
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function buildEmailLink(email, subject, body) {
  if (!email) return "";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildWhatsAppMessage(clientName, reference) {
  return [
    `Hello ${clientName || ""},`,
    "",
    `Thank you for your response about ${reference}. MKETICS has received it and will follow up shortly.`,
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function buildWhatsAppLink(phone, message) {
  const number = normalisePhoneForWhatsApp(phone);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function normalisePhoneForWhatsApp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

function sanitizePhone(phone) {
  return String(phone || "").replace(/\s/g, "");
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{label}</p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
  );
}

function DetailCard({ title, icon: Icon, children }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={19} />
        </div>
        <h3 className="text-lg font-black text-[#020B1F]">{title}</h3>
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </article>
  );
}

function DetailLine({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function ActionLink({ href, disabled, label, icon: Icon, external = false }) {
  if (disabled) {
    return (
      <button type="button" disabled className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-400">
        <Icon size={16} className="mr-2" />{label}
      </button>
    );
  }

  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-4 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300">
      <Icon size={16} className="mr-2" />{label}
    </a>
  );
}

function StatusBadge({ status }) {
  return <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">{toReadableLabel(status)}</span>;
}

function StatusMessage({ type, message }) {
  const isError = type === "error";
  return (
    <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${isError ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
      {isError ? <AlertCircle size={20} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={20} className="mt-0.5 shrink-0" />}
      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{children}</th>;
}

function Td({ children }) {
  return <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700">{children}</td>;
}

function formatDate(value) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-ZA", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatFullDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-ZA", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(Number(amount) || 0);
}

function toReadableLabel(value) {
  if (!value) return "Not provided";
  return String(value).replace(/[_-]/g, " ").replace(/\s+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
