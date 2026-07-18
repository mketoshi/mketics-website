import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const assistantModes = [
  {
    id: "proposal",
    label: "Proposal Draft",
    description: "Create a professional proposal outline from a lead.",
  },
  {
    id: "quote",
    label: "Quote Support",
    description: "Prepare quote wording, pricing direction and exclusions.",
  },
  {
    id: "follow_up",
    label: "Client Follow-up",
    description: "Generate email and WhatsApp follow-up text.",
  },
];

const defaultValidDays = 14;

export default function AIProposalAssistant({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    leads: [],
    quotes: [],
  });

  const [form, setForm] = useState({
    leadId: "",
    quoteId: "",
    mode: "proposal",
    amount: "",
    tone: "professional",
    extraInstruction: "",
  });

  const [assistantState, setAssistantState] = useState({
    loading: false,
    error: "",
    success: "",
    output: null,
  });

  const [quoteSaveState, setQuoteSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchAssistantData();
    }
  }, [isActive]);

  const selectedLead = useMemo(() => {
    return dataState.leads.find((lead) => lead.id === form.leadId) || null;
  }, [dataState.leads, form.leadId]);

  const leadQuotes = useMemo(() => {
    if (!form.leadId) return [];

    return dataState.quotes.filter((quote) => quote.lead_id === form.leadId);
  }, [dataState.quotes, form.leadId]);

  const selectedQuote = useMemo(() => {
    return dataState.quotes.find((quote) => quote.id === form.quoteId) || null;
  }, [dataState.quotes, form.quoteId]);

  async function fetchAssistantData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));

      const [leadsResponse, quotesResponse] = await Promise.all([
        supabase
          .from("leads")
          .select(
            `
            id,
            created_at,
            updated_at,
            full_name,
            email,
            phone,
            organisation,
            service_needed,
            budget,
            timeline,
            preferred_contact,
            project_details,
            lead_source,
            status,
            recommended_service,
            service_pillar,
            readiness_level,
            supporting_services,
            selected_answers,
            internal_notes
          `
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("quotes")
          .select(
            `
            id,
            lead_id,
            quote_number,
            title,
            scope_summary,
            exclusions,
            amount,
            currency,
            status,
            valid_until,
            created_at,
            updated_at
          `
          )
          .order("created_at", { ascending: false }),
      ]);

      if (leadsResponse.error) throw leadsResponse.error;
      if (quotesResponse.error) throw quotesResponse.error;

      const leads = leadsResponse.data || [];
      const quotes = quotesResponse.data || [];

      setDataState({
        loading: false,
        error: "",
        leads,
        quotes,
      });

      setForm((current) => ({
        ...current,
        leadId: current.leadId || leads[0]?.id || "",
      }));
    } catch (error) {
      setDataState({
        loading: false,
        error:
          error?.message ||
          "Unable to load assistant data. Check Supabase admin permissions.",
        leads: [],
        quotes: [],
      });
    }
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "leadId") {
        next.quoteId = "";
      }

      return next;
    });

    clearMessages();
  }

  function clearMessages() {
    if (assistantState.error || assistantState.success || quoteSaveState.error || quoteSaveState.success) {
      setAssistantState((current) => ({
        ...current,
        error: "",
        success: "",
      }));

      setQuoteSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  async function handleGenerate() {
    if (!selectedLead) {
      setAssistantState({
        loading: false,
        error: "Choose a lead before generating AI support.",
        success: "",
        output: null,
      });
      return;
    }

    setAssistantState({
      loading: true,
      error: "",
      success: "",
      output: null,
    });

    try {
      const output = buildAssistantOutput({
        lead: selectedLead,
        quote: selectedQuote,
        mode: form.mode,
        amount: form.amount,
        tone: form.tone,
        extraInstruction: form.extraInstruction,
      });

      await saveAiLog({
        taskType: `ai_${form.mode}_assistant`,
        lead: selectedLead,
        quote: selectedQuote,
        input: form,
        output,
      });

      setAssistantState({
        loading: false,
        error: "",
        success: "AI proposal support generated and logged.",
        output,
      });
    } catch (error) {
      setAssistantState({
        loading: false,
        error:
          error?.message ||
          "Unable to generate assistant output. Check Supabase AI log permissions.",
        success: "",
        output: null,
      });
    }
  }

  async function saveAiLog({ taskType, lead, quote, input, output }) {
    if (!supabase) return;

    const { error } = await supabase.from("ai_logs").insert({
      related_table: quote?.id ? "quotes" : "leads",
      related_id: quote?.id || lead?.id || null,
      task_type: taskType,
      prompt_summary: buildPromptSummary(lead, quote, input),
      input_snapshot: {
        lead,
        quote,
        form: input,
      },
      output_snapshot: output,
      reviewed_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  async function handleCreateQuoteFromAssistant() {
    const output = assistantState.output;

    if (!selectedLead || !output || !supabase) return;

    try {
      setQuoteSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const quoteRow = {
        lead_id: selectedLead.id,
        quote_number: output.quoteNumber,
        title: output.quoteTitle,
        scope_summary: output.scopeSummary,
        exclusions: output.exclusions,
        amount: output.recommendedAmount,
        currency: "ZAR",
        status: "draft",
        valid_until: output.validUntil,
      };

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert(quoteRow)
        .select(
          "id, lead_id, quote_number, title, scope_summary, exclusions, amount, currency, status, valid_until, created_at, updated_at"
        )
        .single();

      if (quoteError) throw quoteError;

      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "quoted" })
        .eq("id", selectedLead.id);

      if (leadError) throw leadError;

      await saveAiLog({
        taskType: "ai_quote_draft_created",
        lead: selectedLead,
        quote,
        input: form,
        output,
      });

      setDataState((current) => ({
        ...current,
        leads: current.leads.map((lead) =>
          lead.id === selectedLead.id ? { ...lead, status: "quoted" } : lead
        ),
        quotes: [quote, ...current.quotes],
      }));

      setForm((current) => ({
        ...current,
        quoteId: quote.id,
      }));

      setQuoteSaveState({
        loading: false,
        error: "",
        success: "AI-assisted quote draft created successfully.",
      });
    } catch (error) {
      setQuoteSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to create quote from assistant output. Check Supabase quote permissions.",
        success: "",
      });
    }
  }

  async function copyText(text, successMessage) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setAssistantState((current) => ({
        ...current,
        error: "",
        success: successMessage,
      }));
    } catch (error) {
      setAssistantState((current) => ({
        ...current,
        error: "Copy failed. Select the text manually and copy it.",
        success: "",
      }));
    }
  }

  const output = assistantState.output;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            <Sparkles size={16} />
            MKETICS AI Assistant
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#020B1F]">
            Proposal and quote assistant.
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
            Generate client-ready proposal wording, quote scope, follow-up text
            and pricing direction from MKETICS lead information. Outputs are
            saved to AI logs for review and future improvement.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAssistantData}
          disabled={dataState.loading}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
        >
          {dataState.loading ? (
            <Loader2 size={17} className="mr-2 animate-spin" />
          ) : (
            <RefreshCw size={17} className="mr-2" />
          )}
          Refresh Data
        </button>
      </div>

      {dataState.error && <StatusMessage type="error" message={dataState.error} />}
      {assistantState.error && <StatusMessage type="error" message={assistantState.error} />}
      {assistantState.success && <StatusMessage type="success" message={assistantState.success} />}
      {quoteSaveState.error && <StatusMessage type="error" message={quoteSaveState.error} />}
      {quoteSaveState.success && <StatusMessage type="success" message={quoteSaveState.success} />}

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5">
          <h3 className="text-xl font-black text-[#020B1F]">
            Assistant Input
          </h3>

          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            Choose a lead, select an assistant mode and generate a professional
            draft for MKETICS follow-up.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Lead</span>
              <select
                name="leadId"
                value={form.leadId}
                onChange={updateForm}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">Choose a lead</option>
                {dataState.leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.full_name} — {lead.service_needed}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Related Quote Optional
              </span>
              <select
                name="quoteId"
                value={form.quoteId}
                onChange={updateForm}
                disabled={!leadQuotes.length}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">No quote selected</option>
                {leadQuotes.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quote_number || quote.title} — {formatCurrency(quote.amount)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3">
              {assistantModes.map((mode) => (
                <label
                  key={mode.id}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    form.mode === mode.id
                      ? "border-cyan-300 bg-white ring-4 ring-cyan-100"
                      : "border-slate-200 bg-white hover:border-cyan-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={mode.id}
                    checked={form.mode === mode.id}
                    onChange={updateForm}
                    className="sr-only"
                  />
                  <span className="text-sm font-black text-[#020B1F]">
                    {mode.label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">
                    {mode.description}
                  </span>
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Suggested Amount
                </span>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={updateForm}
                  placeholder="Example: 2500"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Tone</span>
                <select
                  name="tone"
                  value={form.tone}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="corporate">Corporate</option>
                  <option value="simple">Simple and clear</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Extra Instruction Optional
              </span>
              <textarea
                name="extraInstruction"
                value={form.extraInstruction}
                onChange={updateForm}
                rows={4}
                placeholder="Example: Make the proposal suitable for a small business owner and include training handover."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={assistantState.loading || dataState.loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {assistantState.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate AI Draft
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-5 content-start">
          {selectedLead && (
            <LeadContextCard lead={selectedLead} quote={selectedQuote} />
          )}

          {!output ? (
            <div className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <Sparkles size={22} />
              </div>
              <h3 className="mt-4 text-xl font-black text-[#020B1F]">
                Ready to generate.
              </h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                The assistant will produce a structured proposal, quote wording,
                pricing direction, client email and WhatsApp text from the
                selected lead.
              </p>
            </div>
          ) : (
            <AssistantOutputPanel
              output={output}
              quoteSaveState={quoteSaveState}
              onCopy={copyText}
              onCreateQuote={handleCreateQuoteFromAssistant}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function LeadContextCard({ lead, quote }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-[#020B1F]">Selected Context</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailLine label="Client" value={lead.full_name} />
        <DetailLine label="Service" value={lead.service_needed} />
        <DetailLine label="Budget" value={lead.budget} />
        <DetailLine label="Timeline" value={lead.timeline} />
        <DetailLine label="Lead Status" value={toReadableLabel(lead.status)} />
        <DetailLine label="Selected Quote" value={quote?.quote_number || quote?.title} />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
          Client Request
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
          {lead.project_details || "No project details provided."}
        </p>
      </div>
    </article>
  );
}

function AssistantOutputPanel({ output, quoteSaveState, onCopy, onCreateQuote }) {
  const combinedText = buildCombinedOutputText(output);

  return (
    <article className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            Generated Output
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#020B1F]">
            {output.quoteTitle}
          </h3>
          <p className="mt-2 text-sm font-bold text-slate-600">
            Recommended amount: {formatCurrency(output.recommendedAmount)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(combinedText, "Full assistant output copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <Clipboard size={17} className="mr-2" />
          Copy All
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <OutputBlock title="Proposal Summary" icon={FileText} text={output.proposalSummary} />
        <OutputBlock title="Scope Summary" icon={WalletCards} text={output.scopeSummary} />
        <OutputBlock title="Client Email" icon={Mail} text={output.emailDraft} />
        <OutputBlock title="WhatsApp Message" icon={MessageCircle} text={output.whatsappMessage} />
        <OutputBlock title="Exclusions and Notes" icon={FileText} text={output.exclusions} />
        <OutputBlock title="Questions / Risks" icon={AlertCircle} text={output.questionsAndRisks} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onCopy(output.emailDraft, "Client email copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <Mail size={17} className="mr-2" />
          Copy Email
        </button>

        <button
          type="button"
          onClick={() => onCopy(output.whatsappMessage, "WhatsApp message copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <MessageCircle size={17} className="mr-2" />
          Copy WhatsApp
        </button>
      </div>

      <button
        type="button"
        onClick={onCreateQuote}
        disabled={quoteSaveState.loading}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-6 py-3 font-black text-white transition hover:bg-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {quoteSaveState.loading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Creating Quote
          </>
        ) : (
          <>
            <Save size={18} className="mr-2" />
            Create Quote Draft From AI Output
          </>
        )}
      </button>
    </article>
  );
}

function OutputBlock({ title, icon: Icon, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#061A33] text-cyan-300">
          <Icon size={17} />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
          {title}
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
        {text}
      </p>
    </div>
  );
}

function buildAssistantOutput({ lead, quote, mode, amount, tone, extraInstruction }) {
  const service = lead.service_needed || lead.recommended_service || "MKETICS service";
  const proposedAmount = parseAmount(amount) || parseAmount(quote?.amount) || estimateAmountFromLead(lead);
  const quoteNumber = generateQuoteNumber();
  const validUntil = getDefaultValidUntil();
  const toneLine = buildToneLine(tone);
  const deliverables = buildDeliverables(service);
  const phases = buildProjectPhases(service);
  const exclusions = buildExclusions(service);
  const risks = buildQuestionsAndRisks(lead, extraInstruction);

  const proposalSummary = [
    `MKETICS proposes to assist ${lead.full_name || "the client"} with ${service}.`,
    toneLine,
    "",
    "Recommended delivery approach:",
    phases,
    "",
    "Core deliverables:",
    deliverables,
    "",
    `Estimated quotation direction: ${formatCurrency(proposedAmount)}.`,
    `Quotation validity: ${formatDate(validUntil)}.`,
    extraInstruction && `Additional instruction considered: ${extraInstruction}`,
  ]
    .filter(Boolean)
    .join("\n");

  const scopeSummary = [
    `Client: ${lead.full_name || "Client"}`,
    lead.organisation && `Organisation: ${lead.organisation}`,
    `Service: ${service}`,
    lead.budget && `Budget direction: ${lead.budget}`,
    lead.timeline && `Preferred timeline: ${lead.timeline}`,
    "",
    "Scope summary:",
    deliverables,
    "",
    "Project request summary:",
    lead.project_details || "No project details were provided. Requirements must be confirmed before work starts.",
  ]
    .filter(Boolean)
    .join("\n");

  const emailDraft = buildEmailDraft({ lead, service, proposedAmount, tone, mode });
  const whatsappMessage = buildWhatsAppDraft({ lead, service, proposedAmount });

  return {
    mode,
    quoteNumber,
    quoteTitle: `${service} quotation`,
    recommendedAmount: proposedAmount,
    validUntil,
    proposalSummary,
    scopeSummary,
    exclusions,
    questionsAndRisks: risks,
    emailDraft,
    whatsappMessage,
  };
}

function buildToneLine(tone) {
  const toneMap = {
    professional:
      "The response is structured in a professional and clear business tone.",
    friendly:
      "The response is warm and friendly while remaining business-ready.",
    corporate:
      "The response is suitable for a formal corporate or institutional client.",
    simple:
      "The response is simplified so the client can understand the next step quickly.",
  };

  return toneMap[tone] || toneMap.professional;
}

function buildDeliverables(service) {
  const lower = String(service).toLowerCase();

  if (lower.includes("website") || lower.includes("store") || lower.includes("e-commerce")) {
    return [
      "- Confirm website/store objectives, pages, products and content requirements.",
      "- Design and build a professional responsive website or online store.",
      "- Configure contact, enquiry or order flow based on the agreed scope.",
      "- Apply MKETICS quality checks before handover.",
      "- Provide basic handover guidance after completion.",
    ].join("\n");
  }

  if (lower.includes("system") || lower.includes("software") || lower.includes("app")) {
    return [
      "- Confirm business process, user roles and required system workflows.",
      "- Prepare a structured system scope and development plan.",
      "- Build the agreed modules and database-backed functionality.",
      "- Test core workflows before handover.",
      "- Provide implementation guidance and improvement recommendations.",
    ].join("\n");
  }

  if (lower.includes("network") || lower.includes("wifi") || lower.includes("it")) {
    return [
      "- Review the current IT or network requirement.",
      "- Prepare a recommended solution and implementation plan.",
      "- Configure or support agreed devices, services or network components.",
      "- Test connectivity, access and service readiness.",
      "- Provide handover notes and support recommendations.",
    ].join("\n");
  }

  return [
    "- Confirm the client requirement and expected outcome.",
    "- Prepare a clear scope of work and delivery approach.",
    "- Deliver the agreed MKETICS service professionally.",
    "- Review output with the client before final handover.",
    "- Provide next-step support recommendations.",
  ].join("\n");
}

function buildProjectPhases(service) {
  const lower = String(service).toLowerCase();

  if (lower.includes("website") || lower.includes("store")) {
    return [
      "1. Content and requirements confirmation.",
      "2. Design and structure setup.",
      "3. Website/store build and testing.",
      "4. Review, changes and launch handover.",
    ].join("\n");
  }

  return [
    "1. Requirement confirmation.",
    "2. Scope and solution planning.",
    "3. Implementation and testing.",
    "4. Review, handover and support guidance.",
  ].join("\n");
}

function buildExclusions(service) {
  const base = [
    "Domain, hosting, paid plugins, third-party subscriptions and external platform fees are excluded unless stated in writing.",
    "Major scope changes, additional integrations and urgent turnaround work may require a revised quote.",
    "Client content, branding assets and access credentials must be provided on time to avoid delays.",
  ];

  if (String(service).toLowerCase().includes("store")) {
    base.push("Product photography, product descriptions and payment gateway fees are excluded unless added to the scope.");
  }

  return base.map((item) => `- ${item}`).join("\n");
}

function buildQuestionsAndRisks(lead, extraInstruction) {
  const questions = [
    "- What exact deliverables must be included before work starts?",
    "- Does the client already have logo, content, images and access credentials ready?",
    "- What deadline is expected and is it realistic for the agreed scope?",
    "- Are there any third-party accounts, domains, hosting services or licences required?",
  ];

  if (!lead.email && !lead.phone) {
    questions.push("- Contact details are incomplete. Confirm client contact method before quoting.");
  }

  if (!lead.budget) {
    questions.push("- Budget was not provided. Confirm pricing direction before final quote.");
  }

  if (extraInstruction) {
    questions.push(`- Extra instruction to confirm: ${extraInstruction}`);
  }

  return questions.join("\n");
}

function buildEmailDraft({ lead, service, proposedAmount, tone, mode }) {
  const greeting = `Hello ${lead.full_name || ""},`.trim();
  const leadIn = tone === "friendly"
    ? "Thank you for reaching out to MKETICS. We appreciate the opportunity to assist you."
    : "Thank you for contacting MKETICS (PTY) LTD regarding your project request.";

  const body = [
    greeting,
    "",
    leadIn,
    "",
    `We reviewed your request for ${service}. Based on the information provided, the recommended quotation direction is ${formatCurrency(proposedAmount)}.`,
    "",
    mode === "follow_up"
      ? "Before finalising the quote, please confirm any remaining project details, preferred deadline and the content/assets available."
      : "The proposed scope includes requirement confirmation, implementation of the agreed solution, review and handover guidance.",
    "",
    "Please confirm whether you would like MKETICS to proceed with a formal quotation or consultation for the next step.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
    "Speak Innovation. Deliver Value.",
  ];

  return body.join("\n");
}

function buildWhatsAppDraft({ lead, service, proposedAmount }) {
  return [
    `Hello ${lead.full_name || ""},`,
    "",
    `Thank you for contacting MKETICS. We reviewed your request for ${service}.`,
    "",
    `The recommended quote direction is ${formatCurrency(proposedAmount)} based on the current details.`,
    "",
    "Please confirm your content, deadline and any extra requirements so we can finalise the next step.",
    "",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function buildCombinedOutputText(output) {
  return [
    `Quote: ${output.quoteTitle}`,
    `Quote Number: ${output.quoteNumber}`,
    `Amount: ${formatCurrency(output.recommendedAmount)}`,
    `Valid Until: ${formatDate(output.validUntil)}`,
    "",
    "PROPOSAL SUMMARY",
    output.proposalSummary,
    "",
    "SCOPE SUMMARY",
    output.scopeSummary,
    "",
    "EXCLUSIONS",
    output.exclusions,
    "",
    "QUESTIONS / RISKS",
    output.questionsAndRisks,
    "",
    "CLIENT EMAIL",
    output.emailDraft,
    "",
    "WHATSAPP MESSAGE",
    output.whatsappMessage,
  ].join("\n");
}

function buildPromptSummary(lead, quote, input) {
  return [
    `Mode: ${input.mode}`,
    `Lead: ${lead?.full_name || "Unknown"}`,
    `Service: ${lead?.service_needed || "Unknown"}`,
    quote?.quote_number && `Quote: ${quote.quote_number}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

function estimateAmountFromLead(lead) {
  const source = `${lead?.service_needed || ""} ${lead?.recommended_service || ""}`.toLowerCase();

  if (source.includes("e-commerce") || source.includes("online store")) return 5000;
  if (source.includes("website")) return 2500;
  if (source.includes("system") || source.includes("software") || source.includes("app")) return 12000;
  if (source.includes("network") || source.includes("wifi")) return 3500;
  if (source.includes("marketing")) return 1500;
  if (source.includes("registration") || source.includes("compliance")) return 750;

  return 2500;
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

  return `MKQ-AI-${datePart}-${timePart}${randomPart}`;
}

function getDefaultValidUntil() {
  const date = new Date();
  date.setDate(date.getDate() + defaultValidDays);

  return date.toISOString().slice(0, 10);
}

function parseAmount(value) {
  if (value === null || value === undefined || value === "") return null;

  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

function pad(value) {
  return String(value).padStart(2, "0");
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

function DetailLine({ label, value }) {
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
