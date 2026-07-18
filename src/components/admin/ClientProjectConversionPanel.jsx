import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const projectStatusOptions = [
  "new",
  "planning",
  "in_design",
  "in_development",
  "review",
  "awaiting_client",
  "completed",
  "support",
];

export default function ClientProjectConversionPanel({ quote, lead, onConverted }) {
  const [form, setForm] = useState(() => buildDefaultForm(quote, lead));
  const [conversionState, setConversionState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const alreadyConverted = Boolean(quote?.client_id && quote?.project_id);
  const canConvert = quote?.status === "accepted" && !alreadyConverted;

  const helperMessage = useMemo(() => {
    if (alreadyConverted) {
      return "This quote is already linked to a client and project record.";
    }

    if (quote?.status !== "accepted") {
      return "Mark the quote as Accepted before converting it into a client and project.";
    }

    return "Create a client record and project record from this accepted quote.";
  }, [alreadyConverted, quote?.status]);

  useEffect(() => {
    setForm(buildDefaultForm(quote, lead));
    setConversionState({
      loading: false,
      error: "",
      success: "",
    });
  }, [quote?.id, lead?.id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (conversionState.error || conversionState.success) {
      setConversionState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  async function handleConvert(event) {
    event.preventDefault();

    if (!quote?.id || !lead?.id || !supabase) return;

    if (alreadyConverted) {
      setConversionState({
        loading: false,
        error: "",
        success: "This quote has already been converted.",
      });
      return;
    }

    if (quote.status !== "accepted") {
      setConversionState({
        loading: false,
        error: "Only accepted quotes can be converted into clients and projects.",
        success: "",
      });
      return;
    }

    if (!form.projectTitle.trim()) {
      setConversionState({
        loading: false,
        error: "Project title is required.",
        success: "",
      });
      return;
    }

    if (!projectStatusOptions.includes(form.projectStatus)) {
      setConversionState({
        loading: false,
        error: "Choose a valid project status.",
        success: "",
      });
      return;
    }

    try {
      setConversionState({
        loading: true,
        error: "",
        success: "",
      });

      const client = await findOrCreateClient(lead, form.clientNotes);
      const project = await createProjectFromQuote({
        quote,
        lead,
        client,
        form,
      });

      const { data: updatedQuote, error: quoteError } = await supabase
        .from("quotes")
        .update({
          client_id: client.id,
          project_id: project.id,
        })
        .eq("id", quote.id)
        .select(
          "id, lead_id, client_id, project_id, quote_number, title, scope_summary, exclusions, amount, currency, status, valid_until, sent_at, accepted_at, rejected_at, created_at, updated_at"
        )
        .single();

      if (quoteError) throw quoteError;

      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "won" })
        .eq("id", lead.id);

      if (leadError) throw leadError;

      await supabase.from("lead_notes").insert({
        lead_id: lead.id,
        note: `Accepted quote converted into client and project. Client: ${client.full_name}. Project: ${project.title}.`,
      });

      setConversionState({
        loading: false,
        error: "",
        success: "Accepted quote converted into a client and project successfully.",
      });

      onConverted?.({
        client,
        project,
        quote: updatedQuote,
        leadStatus: "won",
      });
    } catch (error) {
      setConversionState({
        loading: false,
        error:
          error?.message ||
          "Unable to convert this quote. Check Supabase client/project permissions.",
        success: "",
      });
    }
  }

  return (
    <form
      onSubmit={handleConvert}
      className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <BriefcaseBusiness size={22} />
      </div>

      <h4 className="mt-4 text-xl font-black text-[#020B1F]">
        Client / Project Conversion
      </h4>

      <p className="mt-2 text-sm leading-7 text-slate-600">{helperMessage}</p>

      {conversionState.error && (
        <StatusMessage type="error" message={conversionState.error} />
      )}

      {conversionState.success && (
        <StatusMessage type="success" message={conversionState.success} />
      )}

      {alreadyConverted && (
        <div className="mt-5 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <ConversionLine icon={UserRound} label="Client ID" value={quote.client_id} />
          <ConversionLine icon={Building2} label="Project ID" value={quote.project_id} />
        </div>
      )}

      <label className="mt-5 block">
        <span className="text-sm font-black text-[#061A33]">Project Title</span>

        <input
          name="projectTitle"
          value={form.projectTitle}
          onChange={handleChange}
          disabled={!canConvert}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-black text-[#061A33]">Project Status</span>

        <select
          name="projectStatus"
          value={form.projectStatus}
          onChange={handleChange}
          disabled={!canConvert}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        >
          {projectStatusOptions.map((status) => (
            <option key={status} value={status}>
              {toReadableLabel(status)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-black text-[#061A33]">Start Date</span>

          <input
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            disabled={!canConvert}
            type="date"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#061A33]">Due Date</span>

          <input
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            disabled={!canConvert}
            type="date"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-black text-[#061A33]">Client Notes</span>

        <textarea
          name="clientNotes"
          value={form.clientNotes}
          onChange={handleChange}
          disabled={!canConvert}
          rows={5}
          className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <button
        type="submit"
        disabled={!canConvert || conversionState.loading}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {conversionState.loading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Converting Quote
          </>
        ) : alreadyConverted ? (
          <>
            <CheckCircle2 size={18} className="mr-2" />
            Already Converted
          </>
        ) : (
          <>
            <RefreshCw size={18} className="mr-2" />
            Convert to Client & Project
          </>
        )}
      </button>
    </form>
  );
}

async function findOrCreateClient(lead, clientNotes) {
  const email = cleanOptionalText(lead?.email);

  if (email) {
    const { data: existingClient, error: lookupError } = await supabase
      .from("clients")
      .select("id, full_name, email, phone, organisation, notes, created_at, updated_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingClient) return existingClient;
  }

  const clientPayload = {
    full_name: cleanRequiredText(lead?.full_name, "MKETICS Client"),
    email,
    phone: cleanOptionalText(lead?.phone),
    organisation: cleanOptionalText(lead?.organisation),
    notes: cleanOptionalText(clientNotes) || buildDefaultClientNotes(lead),
  };

  const { data: client, error } = await supabase
    .from("clients")
    .insert(clientPayload)
    .select("id, full_name, email, phone, organisation, notes, created_at, updated_at")
    .single();

  if (error) throw error;

  return client;
}

async function createProjectFromQuote({ quote, lead, client, form }) {
  const projectPayload = {
    client_id: client.id,
    lead_id: lead.id,
    title: cleanRequiredText(form.projectTitle, quote.title || lead.service_needed),
    description: buildProjectDescription(quote, lead),
    service_type: cleanOptionalText(lead.service_needed) || cleanOptionalText(quote.title),
    status: form.projectStatus || "planning",
    start_date: form.startDate || null,
    due_date: form.dueDate || null,
  };

  const { data: project, error } = await supabase
    .from("projects")
    .insert(projectPayload)
    .select(
      "id, client_id, lead_id, title, description, service_type, status, start_date, due_date, created_at, updated_at"
    )
    .single();

  if (error) throw error;

  return project;
}

function buildDefaultForm(quote, lead) {
  return {
    projectTitle: `${quote?.title || lead?.service_needed || "MKETICS Project"}`,
    projectStatus: "planning",
    startDate: getTodayDate(),
    dueDate: getDefaultDueDate(),
    clientNotes: buildDefaultClientNotes(lead),
  };
}

function buildDefaultClientNotes(lead) {
  return [
    "Converted from accepted MKETICS quote.",
    lead?.service_needed && `Original service enquiry: ${lead.service_needed}`,
    lead?.budget && `Budget direction: ${lead.budget}`,
    lead?.timeline && `Timeline: ${lead.timeline}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildProjectDescription(quote, lead) {
  return [
    quote?.scope_summary || "Project created from accepted MKETICS quote.",
    "",
    "Original client request:",
    lead?.project_details || "No original project details provided.",
    "",
    quote?.exclusions && "Quote exclusions / notes:",
    quote?.exclusions,
  ]
    .filter(Boolean)
    .join("\n");
}

function ConversionLine({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-emerald-700">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
          {label}
        </p>
        <p className="mt-1 break-all text-sm font-bold leading-6 text-emerald-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function cleanRequiredText(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback || "Not provided";
}

function cleanOptionalText(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
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
