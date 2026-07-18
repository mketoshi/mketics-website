import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clipboard,
  FileText,
  ListChecks,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const plannerModes = [
  {
    id: "implementation_plan",
    label: "Implementation Plan",
    description: "Generate phases, milestones and delivery tasks for a project.",
  },
  {
    id: "task_breakdown",
    label: "Task Breakdown",
    description: "Create a practical task list with priorities and next actions.",
  },
  {
    id: "recovery_plan",
    label: "Recovery Plan",
    description: "Prepare a plan for delayed, blocked or awaiting-client projects.",
  },
  {
    id: "handover_plan",
    label: "Handover Plan",
    description: "Generate completion, handover and support readiness tasks.",
  },
];

const complexityOptions = [
  { id: "simple", label: "Simple" },
  { id: "standard", label: "Standard" },
  { id: "advanced", label: "Advanced" },
];

export default function AIProjectPlanner({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    projects: [],
    clients: [],
    quotes: [],
    tickets: [],
  });

  const [form, setForm] = useState({
    projectId: "",
    mode: "implementation_plan",
    complexity: "standard",
    targetDays: "14",
    teamSize: "1",
    extraInstruction: "",
  });

  const [plannerState, setPlannerState] = useState({
    loading: false,
    error: "",
    success: "",
    output: null,
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchPlannerData();
    }
  }, [isActive]);

  const selectedProject = useMemo(() => {
    return dataState.projects.find((project) => project.id === form.projectId) || null;
  }, [dataState.projects, form.projectId]);

  const selectedClient = useMemo(() => {
    if (!selectedProject?.client_id) return null;
    return dataState.clients.find((client) => client.id === selectedProject.client_id) || null;
  }, [dataState.clients, selectedProject?.client_id]);

  const selectedQuote = useMemo(() => {
    if (!selectedProject?.id) return null;
    return dataState.quotes.find((quote) => quote.project_id === selectedProject.id) || null;
  }, [dataState.quotes, selectedProject?.id]);

  const projectTickets = useMemo(() => {
    if (!selectedProject?.id) return [];
    return dataState.tickets.filter((ticket) => ticket.project_id === selectedProject.id);
  }, [dataState.tickets, selectedProject?.id]);

  async function fetchPlannerData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));

      const [projectsResponse, clientsResponse, quotesResponse, ticketsResponse] =
        await Promise.all([
          supabase
            .from("projects")
            .select(
              "id, client_id, lead_id, title, description, service_type, status, start_date, due_date, completed_at, created_at, updated_at"
            )
            .order("updated_at", { ascending: false }),
          supabase
            .from("clients")
            .select("id, full_name, email, phone, organisation, notes, created_at, updated_at")
            .order("updated_at", { ascending: false }),
          supabase
            .from("quotes")
            .select(
              "id, lead_id, client_id, project_id, quote_number, title, scope_summary, exclusions, amount, currency, status, valid_until, created_at, updated_at"
            )
            .order("updated_at", { ascending: false }),
          supabase
            .from("support_tickets")
            .select(
              "id, client_id, project_id, ticket_type, priority, subject, description, status, resolution_notes, closed_at, created_at, updated_at"
            )
            .order("updated_at", { ascending: false }),
        ]);

      const firstError = [
        projectsResponse.error,
        clientsResponse.error,
        quotesResponse.error,
        ticketsResponse.error,
      ].find(Boolean);

      if (firstError) throw firstError;

      const projects = projectsResponse.data || [];

      setDataState({
        loading: false,
        error: "",
        projects,
        clients: clientsResponse.data || [],
        quotes: quotesResponse.data || [],
        tickets: ticketsResponse.data || [],
      });

      setForm((current) => ({
        ...current,
        projectId: current.projectId || projects[0]?.id || "",
      }));
    } catch (error) {
      setDataState({
        loading: false,
        error:
          error?.message ||
          "Unable to load project planner data. Check Supabase admin permissions.",
        projects: [],
        clients: [],
        quotes: [],
        tickets: [],
      });
    }
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearMessages();
  }

  function clearMessages() {
    if (plannerState.error || plannerState.success || saveState.error || saveState.success) {
      setPlannerState((current) => ({
        ...current,
        error: "",
        success: "",
      }));

      setSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  async function handleGeneratePlan() {
    if (!selectedProject) {
      setPlannerState({
        loading: false,
        error: "Choose a project before generating a plan.",
        success: "",
        output: null,
      });
      return;
    }

    try {
      setPlannerState({
        loading: true,
        error: "",
        success: "",
        output: null,
      });

      const output = buildProjectPlan({
        project: selectedProject,
        client: selectedClient,
        quote: selectedQuote,
        tickets: projectTickets,
        form,
      });

      await saveAiLog({
        taskType: `ai_project_${form.mode}`,
        project: selectedProject,
        client: selectedClient,
        quote: selectedQuote,
        tickets: projectTickets,
        input: form,
        output,
      });

      setPlannerState({
        loading: false,
        error: "",
        success: "AI-assisted project plan generated and logged.",
        output,
      });
    } catch (error) {
      setPlannerState({
        loading: false,
        error:
          error?.message ||
          "Unable to generate project plan. Check Supabase AI log permissions.",
        success: "",
        output: null,
      });
    }
  }

  async function saveAiLog({ taskType, project, client, quote, tickets, input, output }) {
    if (!supabase) return;

    const { error } = await supabase.from("ai_logs").insert({
      related_table: "projects",
      related_id: project?.id || null,
      task_type: taskType,
      prompt_summary: buildPromptSummary(project, client, input),
      input_snapshot: {
        project,
        client,
        quote,
        tickets,
        form: input,
      },
      output_snapshot: output,
      reviewed_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  async function handleSavePlanDocument() {
    const output = plannerState.output;

    if (!selectedProject || !output || !supabase) return;

    try {
      setSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const documentRow = {
        client_id: selectedProject.client_id || null,
        project_id: selectedProject.id,
        quote_id: selectedQuote?.id || null,
        title: `AI Project Plan - ${selectedProject.title}`,
        document_type: "project_brief",
        notes: buildFullPlanText(output),
      };

      const { error } = await supabase.from("documents").insert(documentRow);

      if (error) throw error;

      setSaveState({
        loading: false,
        error: "",
        success: "Project planning document record saved.",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to save project plan document. Check Supabase document permissions.",
        success: "",
      });
    }
  }

  async function handleApplyPlanToProject() {
    const output = plannerState.output;

    if (!selectedProject || !output || !supabase) return;

    try {
      setSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const nextDescription = buildProjectDescriptionUpdate(selectedProject, output);
      const nextStatus = selectedProject.status === "new" ? "planning" : selectedProject.status;

      const { data, error } = await supabase
        .from("projects")
        .update({
          description: nextDescription,
          status: nextStatus,
        })
        .eq("id", selectedProject.id)
        .select(
          "id, client_id, lead_id, title, description, service_type, status, start_date, due_date, completed_at, created_at, updated_at"
        )
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.id === selectedProject.id ? { ...project, ...data } : project
        ),
      }));

      setSaveState({
        loading: false,
        error: "",
        success: "Project description updated with AI planning summary.",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to apply project plan. Check Supabase project update permissions.",
        success: "",
      });
    }
  }

  async function copyText(text, successMessage) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setPlannerState((current) => ({
        ...current,
        error: "",
        success: successMessage,
      }));
    } catch (error) {
      setPlannerState((current) => ({
        ...current,
        error: "Copy failed. Select the text manually and copy it.",
        success: "",
      }));
    }
  }

  const output = plannerState.output;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            <ListChecks size={16} />
            MKETICS AI Project Planner
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#020B1F]">
            Project planning and task generation.
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
            Generate project phases, task lists, milestones, client checklists,
            risks and client update messages from converted MKETICS projects.
            Plans are saved to AI logs and can be stored as document records.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPlannerData}
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
      {plannerState.error && <StatusMessage type="error" message={plannerState.error} />}
      {plannerState.success && <StatusMessage type="success" message={plannerState.success} />}
      {saveState.error && <StatusMessage type="error" message={saveState.error} />}
      {saveState.success && <StatusMessage type="success" message={saveState.success} />}

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5">
          <h3 className="text-xl font-black text-[#020B1F]">Planning Input</h3>

          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            Choose a project, set the planning direction and generate structured
            MKETICS delivery tasks.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Project</span>
              <select
                name="projectId"
                value={form.projectId}
                onChange={updateForm}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">Choose a project</option>
                {dataState.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title} — {toReadableLabel(project.status)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3">
              {plannerModes.map((mode) => (
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

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Complexity
                </span>
                <select
                  name="complexity"
                  value={form.complexity}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {complexityOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Target Days
                </span>
                <input
                  name="targetDays"
                  value={form.targetDays}
                  onChange={updateForm}
                  inputMode="numeric"
                  placeholder="14"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Team Size
                </span>
                <input
                  name="teamSize"
                  value={form.teamSize}
                  onChange={updateForm}
                  inputMode="numeric"
                  placeholder="1"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
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
                placeholder="Example: Prioritise content collection, homepage first, then service pages and WhatsApp handover."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={plannerState.loading || dataState.loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {plannerState.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Generating Plan
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate Project Plan
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-5 content-start">
          {selectedProject && (
            <ProjectContextCard
              project={selectedProject}
              client={selectedClient}
              quote={selectedQuote}
              tickets={projectTickets}
            />
          )}

          {!output ? (
            <div className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <ListChecks size={22} />
              </div>
              <h3 className="mt-4 text-xl font-black text-[#020B1F]">
                Ready to generate tasks.
              </h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                The planner will create phases, milestones, tasks, client
                checklist items, risks and client communication drafts for the
                selected project.
              </p>
            </div>
          ) : (
            <ProjectPlanOutputPanel
              output={output}
              saveState={saveState}
              onCopy={copyText}
              onSaveDocument={handleSavePlanDocument}
              onApplyToProject={handleApplyPlanToProject}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectContextCard({ project, client, quote, tickets }) {
  const openTickets = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status));

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-[#020B1F]">Selected Project Context</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailLine label="Project" value={project.title} />
        <DetailLine label="Client" value={client?.full_name || client?.organisation} />
        <DetailLine label="Service" value={project.service_type} />
        <DetailLine label="Status" value={toReadableLabel(project.status)} />
        <DetailLine label="Due Date" value={formatDate(project.due_date)} />
        <DetailLine label="Quote" value={quote?.quote_number || quote?.title} />
        <DetailLine label="Quote Value" value={formatCurrency(quote?.amount, quote?.currency)} />
        <DetailLine label="Open Tickets" value={String(openTickets.length)} />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
          Current Description
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
          {project.description || "No project description has been saved yet."}
        </p>
      </div>
    </article>
  );
}

function ProjectPlanOutputPanel({
  output,
  saveState,
  onCopy,
  onSaveDocument,
  onApplyToProject,
}) {
  const fullText = buildFullPlanText(output);

  return (
    <article className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            Generated Plan
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#020B1F]">
            {output.planTitle}
          </h3>
          <p className="mt-2 text-sm font-bold text-slate-600">
            {output.totalTasks} tasks • {output.targetDays} day target • {output.complexityLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(fullText, "Full project plan copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <Clipboard size={17} className="mr-2" />
          Copy All
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <OutputBlock title="Planning Summary" icon={Target} text={output.summary} />
        <ListBlock title="Project Phases" icon={CalendarCheck} items={output.phases} />
        <TaskListBlock tasks={output.tasks} />
        <ListBlock title="Milestones" icon={Target} items={output.milestones} />
        <ListBlock title="Client Checklist" icon={CheckCircle2} items={output.clientChecklist} />
        <ListBlock title="Risks and Controls" icon={AlertCircle} items={output.risks} />
        <OutputBlock title="Client Update Email" icon={Mail} text={output.clientEmail} />
        <OutputBlock title="WhatsApp Update" icon={MessageCircle} text={output.whatsappUpdate} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onCopy(output.clientEmail, "Client update email copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <Mail size={17} className="mr-2" />
          Copy Email
        </button>

        <button
          type="button"
          onClick={() => onCopy(output.whatsappUpdate, "WhatsApp update copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <MessageCircle size={17} className="mr-2" />
          Copy WhatsApp
        </button>

        <button
          type="button"
          onClick={() => onCopy(output.taskText, "Generated task list copied.")}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <ListChecks size={17} className="mr-2" />
          Copy Tasks
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSaveDocument}
          disabled={saveState.loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-6 py-3 font-black text-white transition hover:bg-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveState.loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <FileText size={18} className="mr-2" />
              Save as Document Record
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onApplyToProject}
          disabled={saveState.loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveState.loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Applying
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Apply Plan to Project
            </>
          )}
        </button>
      </div>
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

function ListBlock({ title, icon: Icon, items }) {
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
      <div className="mt-3 grid gap-2">
        {items.map((item, index) => (
          <p
            key={`${title}-${index}`}
            className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold leading-6 text-slate-700"
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function TaskListBlock({ tasks }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#061A33] text-cyan-300">
          <ListChecks size={17} />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
          Generated Tasks
        </p>
      </div>
      <div className="mt-3 grid gap-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#020B1F]">
                  {task.id}. {task.title}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  {task.description}
                </p>
              </div>
              <span className="inline-flex self-start rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
                {task.priority}
              </span>
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              Owner: {task.owner} • Target: {task.target}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function buildProjectPlan({ project, client, quote, tickets, form }) {
  const serviceType = project.service_type || quote?.title || project.title || "MKETICS project";
  const lower = String(serviceType).toLowerCase();
  const targetDays = clampNumber(parseInt(form.targetDays, 10), 3, 120, 14);
  const teamSize = clampNumber(parseInt(form.teamSize, 10), 1, 20, 1);
  const complexityLabel = toReadableLabel(form.complexity);
  const hasOpenTickets = tickets.some((ticket) => !["resolved", "closed"].includes(ticket.status));

  const phases = buildPhases(lower, form.mode, targetDays);
  const tasks = buildTasks({
    project,
    client,
    serviceType,
    mode: form.mode,
    complexity: form.complexity,
    targetDays,
    teamSize,
    hasOpenTickets,
  });
  const milestones = buildMilestones(project, targetDays, form.mode);
  const clientChecklist = buildClientChecklist(lower, project, client);
  const risks = buildRisks(project, tickets, form.extraInstruction);

  const summary = [
    `Project: ${project.title}`,
    client?.full_name && `Client: ${client.full_name}`,
    client?.organisation && `Organisation: ${client.organisation}`,
    `Service type: ${serviceType}`,
    `Recommended planning mode: ${toReadableLabel(form.mode)}`,
    `Complexity: ${complexityLabel}`,
    `Target delivery window: ${targetDays} days`,
    `Team size planned: ${teamSize}`,
    "",
    "Planning direction:",
    buildPlanningDirection(form.mode, lower),
    form.extraInstruction && `Extra instruction considered: ${form.extraInstruction}`,
  ]
    .filter(Boolean)
    .join("\n");

  const clientEmail = buildClientEmail({ project, client, serviceType, milestones, clientChecklist });
  const whatsappUpdate = buildWhatsAppUpdate({ project, client, milestones });
  const taskText = tasks
    .map(
      (task) =>
        `${task.id}. ${task.title}\nPriority: ${task.priority}\nOwner: ${task.owner}\nTarget: ${task.target}\n${task.description}`
    )
    .join("\n\n");

  return {
    planTitle: `${project.title} Project Plan`,
    mode: form.mode,
    targetDays,
    teamSize,
    complexityLabel,
    totalTasks: tasks.length,
    summary,
    phases,
    tasks,
    taskText,
    milestones,
    clientChecklist,
    risks,
    clientEmail,
    whatsappUpdate,
  };
}

function buildPhases(lowerService, mode, targetDays) {
  if (mode === "handover_plan") {
    return [
      "1. Completion check: confirm all agreed deliverables are ready for review.",
      "2. Client review: collect feedback, changes and final sign-off.",
      "3. Handover: share access, documentation, files and support notes.",
      "4. Support readiness: record future support items and maintenance recommendations.",
    ];
  }

  if (mode === "recovery_plan") {
    return [
      "1. Issue review: identify blockers, delays and missing client inputs.",
      "2. Recovery scope: confirm what must be completed first to regain momentum.",
      "3. Focus delivery: complete the highest-impact tasks before secondary improvements.",
      "4. Client confirmation: communicate revised dates, responsibilities and next steps.",
    ];
  }

  if (lowerService.includes("website") || lowerService.includes("store")) {
    return [
      "1. Requirements and content collection.",
      "2. Structure, design and page layout planning.",
      "3. Build, integrations and responsive testing.",
      "4. Client review, corrections and launch handover.",
    ];
  }

  if (lowerService.includes("system") || lowerService.includes("app") || lowerService.includes("software")) {
    return [
      "1. Process mapping and user-role confirmation.",
      "2. Database, module and workflow planning.",
      "3. Development, testing and issue resolution.",
      "4. User review, deployment and handover support.",
    ];
  }

  return [
    "1. Requirement confirmation and scope alignment.",
    "2. Delivery planning and preparation.",
    `3. Implementation and quality checks within the ${targetDays}-day target window.`,
    "4. Review, handover and support recommendations.",
  ];
}

function buildTasks({ project, client, serviceType, mode, complexity, targetDays, teamSize, hasOpenTickets }) {
  const lower = String(serviceType).toLowerCase();
  const owner = teamSize > 1 ? "MKETICS delivery team" : "MKETICS admin";
  const tasks = [
    task(1, "Confirm final scope and success criteria", "High", owner, "Day 1", "Review the quote, project description and client expectation before delivery starts."),
    task(2, "Collect required client assets and access", "High", "Client + MKETICS", "Day 1-2", "Request missing content, logos, access credentials, hosting details or business information."),
    task(3, "Prepare delivery checklist", "Normal", owner, "Day 2", "Break the project into practical checklist items and confirm what must be completed first."),
  ];

  if (lower.includes("website") || lower.includes("store")) {
    tasks.push(
      task(4, "Create page and content structure", "High", owner, "Day 2-3", "Map the pages, sections, CTAs, contact flow and content required for the build."),
      task(5, "Build priority pages or store structure", "High", owner, "Day 4-8", "Complete the homepage, service/product structure and main conversion paths first."),
      task(6, "Configure forms, WhatsApp and contact actions", "Normal", owner, "Day 7-9", "Test enquiry flow, WhatsApp links, email links and any store/contact functions."),
      task(7, "Run mobile and browser quality checks", "High", owner, "Day 9-11", "Check responsiveness, navigation, layout, speed and basic SEO readiness."),
      task(8, "Prepare client review and handover notes", "Normal", owner, `Day ${Math.max(targetDays - 3, 10)}-${targetDays}`, "Prepare final review notes, access guidance and support recommendations.")
    );
  } else if (lower.includes("system") || lower.includes("app") || lower.includes("software")) {
    tasks.push(
      task(4, "Map system modules and user roles", "High", owner, "Day 2-4", "Define user roles, screens, data fields and workflow requirements."),
      task(5, "Prepare database and workflow structure", "High", owner, "Day 4-6", "Plan the tables, relationships, validation and security controls needed."),
      task(6, "Build core module flow", "High", owner, "Day 6-12", "Build the minimum working module before extending secondary features."),
      task(7, "Test core workflow and edge cases", "High", owner, `Day ${Math.max(targetDays - 4, 10)}-${Math.max(targetDays - 2, 12)}`, "Test login, data saving, status changes, access control and error handling."),
      task(8, "Prepare user handover and improvement backlog", "Normal", owner, `Day ${Math.max(targetDays - 2, 12)}-${targetDays}`, "Document how the system works and what can be improved in later phases.")
    );
  } else {
    tasks.push(
      task(4, "Prepare implementation materials", "High", owner, "Day 2-4", "Prepare tools, documents, configuration details or support resources required."),
      task(5, "Deliver the agreed service scope", "High", owner, "Day 4-9", "Complete the main service activity according to the approved scope."),
      task(6, "Quality check and client review", "Normal", owner, `Day ${Math.max(targetDays - 4, 8)}-${Math.max(targetDays - 2, 10)}`, "Review the work internally and prepare the client for feedback."),
      task(7, "Handover and support notes", "Normal", owner, `Day ${Math.max(targetDays - 2, 10)}-${targetDays}`, "Provide next steps, support recommendations and documentation where required.")
    );
  }

  if (complexity === "advanced") {
    tasks.push(
      task(tasks.length + 1, "Add advanced testing and risk review", "High", owner, `Before Day ${targetDays}`, "Review integrations, dependencies, security, performance and client acceptance risks."),
      task(tasks.length + 2, "Prepare phase-two improvement backlog", "Normal", owner, `Before Day ${targetDays}`, "List features, automations or enhancements that should be handled after the first delivery.")
    );
  }

  if (mode === "recovery_plan" || hasOpenTickets) {
    tasks.push(
      task(tasks.length + 1, "Resolve blockers and support issues", "Urgent", owner, "Immediate", "Review open support tickets or blockers and resolve what prevents project progress."),
      task(tasks.length + 2, "Send revised client update", "High", owner, "Immediate", "Notify the client of the recovery plan, outstanding inputs and revised delivery path.")
    );
  }

  if (mode === "handover_plan") {
    tasks.push(
      task(tasks.length + 1, "Confirm final acceptance", "High", "Client + MKETICS", "Final stage", "Get client confirmation that the agreed scope has been reviewed and accepted."),
      task(tasks.length + 2, "Create support follow-up reminder", "Normal", owner, "After handover", "Schedule a post-handover support check and record any future maintenance items.")
    );
  }

  return tasks;
}

function task(id, title, priority, owner, target, description) {
  return { id, title, priority, owner, target, description };
}

function buildMilestones(project, targetDays, mode) {
  if (mode === "handover_plan") {
    return [
      "Final delivery reviewed internally.",
      "Client feedback received and resolved.",
      "Handover files, access and guidance shared.",
      "Support follow-up recorded.",
    ];
  }

  return [
    "Project scope and client responsibilities confirmed.",
    `Core delivery completed by approximately Day ${Math.max(Math.ceil(targetDays * 0.7), 2)}.`,
    "Internal quality check completed before client review.",
    "Client review, handover and next-step support completed.",
    project.due_date && `Target due date remains ${formatDate(project.due_date)} unless scope changes.`,
  ].filter(Boolean);
}

function buildClientChecklist(lowerService, project, client) {
  const checklist = [
    "Confirm the final scope and expected outcome.",
    "Provide missing content, files, branding and access credentials.",
    "Confirm the preferred contact person for review feedback.",
    "Respond to review requests quickly to avoid delivery delays.",
  ];

  if (lowerService.includes("website") || lowerService.includes("store")) {
    checklist.push("Provide page text, product details, images, logo and domain/hosting access if available.");
  }

  if (lowerService.includes("system") || lowerService.includes("app")) {
    checklist.push("Confirm user roles, required fields, approval flow and example records for testing.");
  }

  if (!client?.email && !client?.phone) {
    checklist.push("Confirm reliable client contact details before project execution continues.");
  }

  if (!project.due_date) {
    checklist.push("Confirm a target deadline or preferred launch date.");
  }

  return checklist;
}

function buildRisks(project, tickets, extraInstruction) {
  const risks = [
    "Scope creep may occur if extra features are added after delivery starts — confirm change requests in writing.",
    "Delivery may be delayed if the client does not provide content, access or feedback on time.",
    "Third-party services may affect timelines if accounts, payment or verification are not ready.",
  ];

  const openTickets = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status));

  if (openTickets.length > 0) {
    risks.push(`${openTickets.length} open support ticket(s) may affect project delivery and should be handled before final handover.`);
  }

  if (project.status === "awaiting_client") {
    risks.push("Project is awaiting client input. Send a clear checklist and deadline to keep progress moving.");
  }

  if (extraInstruction) {
    risks.push(`Extra instruction to monitor: ${extraInstruction}`);
  }

  return risks;
}

function buildPlanningDirection(mode, lowerService) {
  if (mode === "task_breakdown") {
    return "Focus on clear practical tasks, priorities and owner responsibilities.";
  }

  if (mode === "recovery_plan") {
    return "Focus on removing blockers, client communication and revised delivery priorities.";
  }

  if (mode === "handover_plan") {
    return "Focus on final review, sign-off, documentation, access handover and support readiness.";
  }

  if (lowerService.includes("website") || lowerService.includes("store")) {
    return "Focus on content collection, page structure, build, mobile testing and launch handover.";
  }

  return "Focus on scope confirmation, delivery preparation, implementation, review and handover.";
}

function buildClientEmail({ project, client, serviceType, milestones, clientChecklist }) {
  return [
    `Hello ${client?.full_name || ""},`.trim(),
    "",
    `MKETICS has prepared the project plan for ${project.title}.`,
    "",
    `The current service focus is ${serviceType}. The plan will move through scope confirmation, delivery work, quality checks and handover.`,
    "",
    "Key milestones:",
    ...milestones.map((milestone) => `- ${milestone}`),
    "",
    "To keep the project moving, please assist with:",
    ...clientChecklist.slice(0, 5).map((item) => `- ${item}`),
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function buildWhatsAppUpdate({ project, client, milestones }) {
  return [
    `Hello ${client?.full_name || ""},`.trim(),
    "",
    `MKETICS has prepared the working plan for ${project.title}.`,
    "",
    "Main next step:",
    milestones[0] || "Confirm scope, requirements and client responsibilities.",
    "",
    "Please send any missing content, access or feedback so we can keep the project moving.",
    "",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function buildPromptSummary(project, client, input) {
  return [
    `Mode: ${input.mode}`,
    `Project: ${project?.title || "Unknown"}`,
    client?.full_name && `Client: ${client.full_name}`,
    `Complexity: ${input.complexity}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

function buildFullPlanText(output) {
  return [
    output.planTitle,
    "",
    "SUMMARY",
    output.summary,
    "",
    "PHASES",
    ...output.phases.map((item) => `- ${item}`),
    "",
    "TASKS",
    output.taskText,
    "",
    "MILESTONES",
    ...output.milestones.map((item) => `- ${item}`),
    "",
    "CLIENT CHECKLIST",
    ...output.clientChecklist.map((item) => `- ${item}`),
    "",
    "RISKS AND CONTROLS",
    ...output.risks.map((item) => `- ${item}`),
    "",
    "CLIENT EMAIL",
    output.clientEmail,
    "",
    "WHATSAPP UPDATE",
    output.whatsappUpdate,
  ].join("\n");
}

function buildProjectDescriptionUpdate(project, output) {
  const existingDescription = project.description?.trim();
  const planningSection = [
    "AI-ASSISTED PROJECT PLAN",
    `Generated: ${new Date().toLocaleDateString("en-ZA")}`,
    "",
    output.summary,
    "",
    "Generated Tasks:",
    output.taskText,
  ].join("\n");

  if (!existingDescription) return planningSection;

  return `${existingDescription}\n\n---\n\n${planningSection}`;
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
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
  if (!value) return "Not provided";

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
