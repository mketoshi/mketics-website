import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Timer,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const timeTrackingSettingKey = "project_time_tracking_v1";
const taskBoardSettingKey = "project_task_board_v1";

const workTypeOptions = [
  "Discovery",
  "Planning",
  "Design",
  "Development",
  "Testing",
  "Client Communication",
  "Admin",
  "Support",
  "Handover",
];

const deliveryStageOptions = [
  "Discovery",
  "Planning",
  "Build",
  "Review",
  "Support",
  "Handover",
];

const reportTypeOptions = [
  "Delivery Progress Report",
  "Time Report",
  "Handover Summary",
  "Support Summary",
];

export default function ProjectTimeReports({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    projects: [],
    clients: [],
    tasks: [],
    tickets: [],
    documents: [],
    entries: [],
  });

  const [filters, setFilters] = useState({
    projectId: "all",
    search: "",
  });

  const [timeForm, setTimeForm] = useState({
    projectId: "",
    taskId: "",
    entryDate: getTodayInputValue(),
    startTime: "",
    endTime: "",
    hours: "",
    workType: "Development",
    deliveryStage: "Build",
    billingType: "billable",
    description: "",
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [reportForm, setReportForm] = useState({
    projectId: "",
    reportType: "Delivery Progress Report",
    periodStart: getMonthStartInputValue(),
    periodEnd: getTodayInputValue(),
    nextSteps: "",
  });

  const [reportState, setReportState] = useState({
    loading: false,
    error: "",
    success: "",
    preview: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchTimeReportData();
    }
  }, [isActive]);

  useEffect(() => {
    if (!timeForm.hours && timeForm.startTime && timeForm.endTime) {
      const computedHours = calculateHoursFromTimes(timeForm.startTime, timeForm.endTime);

      if (computedHours) {
        setTimeForm((current) => ({
          ...current,
          hours: computedHours,
        }));
      }
    }
  }, [timeForm.startTime, timeForm.endTime, timeForm.hours]);

  const visibleEntries = useMemo(() => {
    return dataState.entries.filter((entry) => {
      const matchesProject = filters.projectId === "all" || entry.projectId === filters.projectId;
      const project = dataState.projects.find((item) => item.id === entry.projectId);
      const client = dataState.clients.find((item) => item.id === project?.client_id);
      const task = dataState.tasks.find((item) => item.id === entry.taskId);

      const searchableText = [
        entry.description,
        entry.workType,
        entry.deliveryStage,
        entry.billingType,
        project?.title,
        project?.service_type,
        client?.full_name,
        client?.organisation,
        task?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !filters.search.trim() ||
        searchableText.includes(filters.search.trim().toLowerCase());

      return matchesProject && matchesSearch;
    });
  }, [dataState.clients, dataState.entries, dataState.projects, dataState.tasks, filters]);

  const projectTasks = useMemo(() => {
    if (!timeForm.projectId) return [];
    return dataState.tasks.filter((task) => task.projectId === timeForm.projectId);
  }, [dataState.tasks, timeForm.projectId]);

  const selectedTimeProject = useMemo(() => {
    if (!timeForm.projectId) return null;
    return dataState.projects.find((project) => project.id === timeForm.projectId) || null;
  }, [dataState.projects, timeForm.projectId]);

  const selectedReportProject = useMemo(() => {
    if (!reportForm.projectId) return null;
    return dataState.projects.find((project) => project.id === reportForm.projectId) || null;
  }, [dataState.projects, reportForm.projectId]);

  const timeStats = useMemo(() => {
    const totalHours = sumHours(dataState.entries);
    const billableHours = sumHours(dataState.entries.filter((entry) => entry.billingType === "billable"));
    const nonBillableHours = totalHours - billableHours;
    const trackedProjects = new Set(dataState.entries.map((entry) => entry.projectId).filter(Boolean)).size;
    const monthStart = startOfDay(new Date(getMonthStartInputValue()));
    const thisMonthHours = sumHours(
      dataState.entries.filter((entry) => startOfDay(new Date(entry.entryDate)) >= monthStart)
    );
    const reportsSaved = dataState.documents.filter(
      (document) => document.document_type === "Delivery Report" || document.document_type === "Time Report"
    ).length;

    return {
      totalHours: roundHours(totalHours),
      billableHours: roundHours(billableHours),
      nonBillableHours: roundHours(nonBillableHours),
      trackedProjects,
      thisMonthHours: roundHours(thisMonthHours),
      reportsSaved,
    };
  }, [dataState.documents, dataState.entries]);

  async function fetchTimeReportData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const [projectsResponse, clientsResponse, tasksResponse, ticketsResponse, documentsResponse, timeResponse] =
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
            .from("settings")
            .select("setting_value")
            .eq("setting_key", taskBoardSettingKey)
            .maybeSingle(),
          supabase
            .from("support_tickets")
            .select("id, client_id, project_id, ticket_type, priority, subject, description, status, resolution_notes, created_at, updated_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("documents")
            .select("id, client_id, project_id, quote_id, title, document_type, storage_path, public_url, notes, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("settings")
            .select("setting_value")
            .eq("setting_key", timeTrackingSettingKey)
            .maybeSingle(),
        ]);

      const firstError =
        projectsResponse.error ||
        clientsResponse.error ||
        tasksResponse.error ||
        ticketsResponse.error ||
        documentsResponse.error ||
        timeResponse.error;

      if (firstError) throw firstError;

      const tasks = normaliseTasks(tasksResponse.data?.setting_value?.tasks || []);
      const entries = normaliseTimeEntries(timeResponse.data?.setting_value?.entries || []);

      setDataState({
        loading: false,
        error: "",
        projects: projectsResponse.data || [],
        clients: clientsResponse.data || [],
        tasks,
        tickets: ticketsResponse.data || [],
        documents: documentsResponse.data || [],
        entries,
      });

      const firstProjectId = projectsResponse.data?.[0]?.id || "";
      setTimeForm((current) => ({
        ...current,
        projectId: current.projectId || firstProjectId,
      }));
      setReportForm((current) => ({
        ...current,
        projectId: current.projectId || firstProjectId,
      }));
    } catch (error) {
      setDataState({
        loading: false,
        error:
          error?.message ||
          "Unable to load time tracking records. Check Supabase projects, settings, documents and tickets permissions.",
        projects: [],
        clients: [],
        tasks: [],
        tickets: [],
        documents: [],
        entries: [],
      });
    }
  }

  async function saveTimeEntries(nextEntries) {
    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: timeTrackingSettingKey,
        setting_value: { entries: nextEntries },
        description: "MKETICS project time tracking and delivery report source records.",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;
  }

  async function handleAddTimeEntry(event) {
    event.preventDefault();

    if (!supabase) return;

    const hours = parseHours(timeForm.hours);

    if (!timeForm.projectId) {
      setSaveState({ loading: false, error: "Choose a project before logging time.", success: "" });
      return;
    }

    if (!timeForm.entryDate) {
      setSaveState({ loading: false, error: "Choose a work date.", success: "" });
      return;
    }

    if (!hours || hours <= 0) {
      setSaveState({ loading: false, error: "Enter valid hours greater than 0.", success: "" });
      return;
    }

    if (!timeForm.description.trim()) {
      setSaveState({ loading: false, error: "Describe the work completed.", success: "" });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const now = new Date().toISOString();
      const nextEntry = {
        id: createId(),
        projectId: timeForm.projectId,
        taskId: timeForm.taskId || "",
        entryDate: timeForm.entryDate,
        startTime: timeForm.startTime || "",
        endTime: timeForm.endTime || "",
        hours,
        workType: timeForm.workType,
        deliveryStage: timeForm.deliveryStage,
        billingType: timeForm.billingType,
        description: timeForm.description.trim(),
        createdAt: now,
        updatedAt: now,
      };

      const nextEntries = [nextEntry, ...dataState.entries];
      await saveTimeEntries(nextEntries);

      setDataState((current) => ({
        ...current,
        entries: nextEntries,
      }));

      setTimeForm((current) => ({
        ...current,
        taskId: "",
        startTime: "",
        endTime: "",
        hours: "",
        description: "",
      }));

      setSaveState({ loading: false, error: "", success: "Time entry saved successfully." });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to save time entry. Check Supabase settings permissions.",
        success: "",
      });
    }
  }

  async function handleDeleteTimeEntry(entryId) {
    if (!supabase || !entryId) return;

    const confirmed = window.confirm("Delete this time entry from the project record?");
    if (!confirmed) return;

    try {
      setSaveState({ loading: true, error: "", success: "" });
      const nextEntries = dataState.entries.filter((entry) => entry.id !== entryId);
      await saveTimeEntries(nextEntries);

      setDataState((current) => ({
        ...current,
        entries: nextEntries,
      }));

      setSaveState({ loading: false, error: "", success: "Time entry deleted." });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to delete this time entry.",
        success: "",
      });
    }
  }

  function handleTimeFieldChange(event) {
    const { name, value } = event.target;

    setTimeForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "projectId" ? { taskId: "" } : {}),
    }));

    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  function handleReportFieldChange(event) {
    const { name, value } = event.target;

    setReportForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (reportState.error || reportState.success) {
      setReportState((current) => ({ ...current, error: "", success: "" }));
    }
  }

  function handleGenerateReport(event) {
    event.preventDefault();

    if (!reportForm.projectId) {
      setReportState({ loading: false, error: "Choose a project before generating a report.", success: "", preview: "" });
      return;
    }

    const project = dataState.projects.find((item) => item.id === reportForm.projectId);

    if (!project) {
      setReportState({ loading: false, error: "Selected project could not be found.", success: "", preview: "" });
      return;
    }

    const report = buildDeliveryReport({
      project,
      client: dataState.clients.find((client) => client.id === project.client_id),
      tasks: dataState.tasks.filter((task) => task.projectId === project.id),
      tickets: dataState.tickets.filter((ticket) => ticket.project_id === project.id),
      entries: filterEntriesForReport(dataState.entries, reportForm),
      reportForm,
    });

    setReportState({
      loading: false,
      error: "",
      success: "Delivery report generated.",
      preview: report,
    });
  }

  async function handleSaveReportAsDocument() {
    if (!supabase || !reportState.preview || !selectedReportProject) return;

    try {
      setReportState((current) => ({ ...current, loading: true, error: "", success: "" }));

      const { data, error } = await supabase
        .from("documents")
        .insert({
          client_id: selectedReportProject.client_id || null,
          project_id: selectedReportProject.id,
          title: `${reportForm.reportType} - ${selectedReportProject.title}`,
          document_type: reportForm.reportType.includes("Time") ? "Time Report" : "Delivery Report",
          notes: reportState.preview,
        })
        .select("id, client_id, project_id, quote_id, title, document_type, storage_path, public_url, notes, created_at")
        .single();

      if (error) throw error;

      setDataState((current) => ({
        ...current,
        documents: data ? [data, ...current.documents] : current.documents,
      }));

      setReportState((current) => ({
        ...current,
        loading: false,
        error: "",
        success: "Report saved as a document record.",
      }));
    } catch (error) {
      setReportState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Unable to save report as a document record.",
        success: "",
      }));
    }
  }

  async function copyReportText() {
    if (!reportState.preview) return;
    await navigator.clipboard.writeText(reportState.preview);
    setReportState((current) => ({ ...current, success: "Report copied to clipboard." }));
  }

  async function copyTimeSummary() {
    const summary = buildTimeSummaryText({
      stats: timeStats,
      entries: visibleEntries,
      projects: dataState.projects,
      clients: dataState.clients,
    });

    await navigator.clipboard.writeText(summary);
    setSaveState({ loading: false, error: "", success: "Time summary copied to clipboard." });
  }

  function printReport() {
    if (!reportState.preview) return;

    const reportTitle = `${reportForm.reportType || "MKETICS Delivery Report"}${
      selectedReportProject?.title ? ` - ${selectedReportProject.title}` : ""
    }`;

    const printFrame = document.createElement("iframe");
    printFrame.title = "MKETICS report print frame";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";

    document.body.appendChild(printFrame);

    const frameDocument =
      printFrame.contentDocument || printFrame.contentWindow?.document;

    if (!frameDocument) {
      document.body.removeChild(printFrame);
      return;
    }

    frameDocument.open();
    frameDocument.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(reportTitle)}</title>
          <style>
            @page {
              size: A4;
              margin: 18mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #061A33;
              background: #ffffff;
              line-height: 1.6;
            }

            .report-header {
              border-bottom: 3px solid #00AEEF;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }

            .company-name {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 0.04em;
              margin: 0;
            }

            .company-tagline {
              margin: 4px 0 0;
              color: #35516d;
              font-size: 12px;
              font-weight: 700;
            }

            .report-title {
              margin: 18px 0 0;
              font-size: 18px;
              font-weight: 900;
              color: #0B7CFF;
            }

            .report-meta {
              margin: 4px 0 0;
              color: #52677d;
              font-size: 12px;
              font-weight: 700;
            }

            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 13px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <header class="report-header">
            <p class="company-name">MKETICS (PTY) LTD</p>
            <p class="company-tagline">Speak Innovation. Deliver Value.</p>
            <p class="report-title">${escapeHtml(reportTitle)}</p>
            <p class="report-meta">Generated ${escapeHtml(formatFullDate(new Date().toISOString()))}</p>
          </header>

          <main>
            <pre>${escapeHtml(reportState.preview)}</pre>
          </main>
        </body>
      </html>
    `);
    frameDocument.close();

    window.setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      window.setTimeout(() => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      }, 1000);
    }, 250);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            <Timer size={16} />
            Project Time Tracking
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#020B1F]">
            Time tracking and delivery reports.
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
            Track delivery hours, connect work to project tasks and generate clear client-ready progress reports.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTimeReportData}
          disabled={dataState.loading}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
        >
          {dataState.loading ? (
            <Loader2 size={17} className="mr-2 animate-spin" />
          ) : (
            <RefreshCw size={17} className="mr-2" />
          )}
          Refresh
        </button>
      </div>

      {dataState.error && <StatusMessage type="error" message={dataState.error} />}

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Hours" value={timeStats.totalHours} />
        <StatCard label="Billable" value={timeStats.billableHours} />
        <StatCard label="Non-Billable" value={timeStats.nonBillableHours} />
        <StatCard label="This Month" value={timeStats.thisMonthHours} />
        <StatCard label="Projects" value={timeStats.trackedProjects} />
        <StatCard label="Reports" value={timeStats.reportsSaved} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleAddTimeEntry} className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Plus size={22} />
          </div>

          <h3 className="mt-4 text-xl font-black text-[#020B1F]">Log project time</h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            Record work done for delivery, support and client communication.
          </p>

          {saveState.error && <StatusMessage type="error" message={saveState.error} />}
          {saveState.success && <StatusMessage type="success" message={saveState.success} />}

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Project</span>
              <select
                name="projectId"
                value={timeForm.projectId}
                onChange={handleTimeFieldChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">Choose project</option>
                {dataState.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Linked Task</span>
              <select
                name="taskId"
                value={timeForm.taskId}
                onChange={handleTimeFieldChange}
                disabled={!timeForm.projectId || projectTasks.length === 0}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">No linked task</option>
                {projectTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Date</span>
                <input
                  name="entryDate"
                  value={timeForm.entryDate}
                  onChange={handleTimeFieldChange}
                  type="date"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Start</span>
                <input
                  name="startTime"
                  value={timeForm.startTime}
                  onChange={handleTimeFieldChange}
                  type="time"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">End</span>
                <input
                  name="endTime"
                  value={timeForm.endTime}
                  onChange={handleTimeFieldChange}
                  type="time"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Hours</span>
                <input
                  name="hours"
                  value={timeForm.hours}
                  onChange={handleTimeFieldChange}
                  inputMode="decimal"
                  placeholder="2.5"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Work Type</span>
                <select
                  name="workType"
                  value={timeForm.workType}
                  onChange={handleTimeFieldChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {workTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Stage</span>
                <select
                  name="deliveryStage"
                  value={timeForm.deliveryStage}
                  onChange={handleTimeFieldChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {deliveryStageOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Billing Type</span>
              <select
                name="billingType"
                value={timeForm.billingType}
                onChange={handleTimeFieldChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="billable">Billable</option>
                <option value="non_billable">Non-Billable</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Work Completed</span>
              <textarea
                name="description"
                value={timeForm.description}
                onChange={handleTimeFieldChange}
                rows={5}
                placeholder="Example: Built contact form validation and tested Supabase lead submission."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            {selectedTimeProject && (
              <div className="rounded-2xl border border-cyan-200 bg-white p-4">
                <DetailLine label="Selected Project" value={selectedTimeProject.title} />
                <DetailLine label="Project Status" value={toReadableLabel(selectedTimeProject.status)} />
              </div>
            )}

            <button
              type="submit"
              disabled={saveState.loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving Time
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Time Entry
                </>
              )}
            </button>
          </div>
        </form>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#020B1F]">Time entries</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Search, filter and review recorded delivery work.
              </p>
            </div>

            <button
              type="button"
              onClick={copyTimeSummary}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy Summary
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_260px]">
            <label className="relative block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search time entries..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <select
              value={filters.projectId}
              onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All projects</option>
              {dataState.projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid max-h-[700px] gap-3 overflow-y-auto pr-1">
            {dataState.loading && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-8 text-center">
                <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                <p className="mt-3 text-sm font-black text-slate-500">Loading time entries...</p>
              </div>
            )}

            {!dataState.loading && visibleEntries.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-8 text-center">
                <Timer className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 text-sm font-black text-slate-500">No time entries found.</p>
              </div>
            )}

            {!dataState.loading && visibleEntries.map((entry) => {
              const project = dataState.projects.find((item) => item.id === entry.projectId);
              const client = dataState.clients.find((item) => item.id === project?.client_id);
              const task = dataState.tasks.find((item) => item.id === entry.taskId);

              return (
                <article key={entry.id} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-black text-[#020B1F]">
                        {entry.hours} hrs • {entry.workType}
                      </p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                        {formatDate(entry.entryDate)} • {toReadableLabel(entry.billingType)} • {entry.deliveryStage}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTimeEntry(entry.id)}
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                    {entry.description}
                  </p>

                  <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck size={14} />
                      {project?.title || "Project not found"}
                    </span>
                    {client && (
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList size={14} />
                        {client.full_name || client.organisation}
                      </span>
                    )}
                    {task && (
                      <span className="inline-flex items-center gap-2">
                        <Clipboard size={14} />
                        Linked task: {task.title}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerateReport} className="mt-6 rounded-[1.5rem] border border-cyan-200 bg-[#F8FCFF] p-5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <FileText size={22} />
        </div>

        <h3 className="mt-4 text-xl font-black text-[#020B1F]">Delivery report builder</h3>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          Generate a report using project details, tasks, tickets and time entries.
        </p>

        {reportState.error && <StatusMessage type="error" message={reportState.error} />}
        {reportState.success && <StatusMessage type="success" message={reportState.success} />}

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <span className="text-sm font-black text-[#061A33]">Project</span>
            <select
              name="projectId"
              value={reportForm.projectId}
              onChange={handleReportFieldChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">Choose project</option>
              {dataState.projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Report Type</span>
            <select
              name="reportType"
              value={reportForm.reportType}
              onChange={handleReportFieldChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              {reportTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">From</span>
              <input
                name="periodStart"
                value={reportForm.periodStart}
                onChange={handleReportFieldChange}
                type="date"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">To</span>
              <input
                name="periodEnd"
                value={reportForm.periodEnd}
                onChange={handleReportFieldChange}
                type="date"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-black text-[#061A33]">Next Steps / Client Requests</span>
          <textarea
            name="nextSteps"
            value={reportForm.nextSteps}
            onChange={handleReportFieldChange}
            rows={4}
            placeholder="Example: Client to send product images and confirm final wording by Friday."
            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5"
          >
            <BarChart3 size={18} className="mr-2" />
            Generate Report
          </button>

          <button
            type="button"
            onClick={copyReportText}
            disabled={!reportState.preview}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-6 py-3 font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clipboard size={18} className="mr-2" />
            Copy Report
          </button>

          <button
            type="button"
            onClick={printReport}
            disabled={!reportState.preview}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-6 py-3 font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={18} className="mr-2" />
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleSaveReportAsDocument}
            disabled={!reportState.preview || reportState.loading}
            className="inline-flex items-center justify-center rounded-full border border-[#061A33]/20 bg-[#061A33] px-6 py-3 font-black text-white transition hover:bg-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reportState.loading ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Save as Document
          </button>
        </div>

        {reportState.preview && (
          <pre className="mt-5 max-h-[650px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-7 text-slate-700">
            {reportState.preview}
          </pre>
        )}
      </form>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
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

function buildDeliveryReport({ project, client, tasks, tickets, entries, reportForm }) {
  const completedTasks = tasks.filter((task) => task.status === "done");
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const openTickets = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status));
  const totalHours = roundHours(sumHours(entries));
  const billableHours = roundHours(sumHours(entries.filter((entry) => entry.billingType === "billable")));
  const stages = groupHoursBy(entries, "deliveryStage");
  const workTypes = groupHoursBy(entries, "workType");

  return [
    "MKETICS (PTY) LTD",
    reportForm.reportType.toUpperCase(),
    "Speak Innovation. Deliver Value.",
    "",
    `Project: ${project.title}`,
    `Client: ${client?.full_name || client?.organisation || "Client not linked"}`,
    `Service Type: ${project.service_type || "Not specified"}`,
    `Project Status: ${toReadableLabel(project.status)}`,
    `Report Period: ${formatDate(reportForm.periodStart)} to ${formatDate(reportForm.periodEnd)}`,
    `Generated: ${formatFullDate(new Date().toISOString())}`,
    "",
    "1. DELIVERY SUMMARY",
    `This report summarises the delivery work, time entries, task progress and support activity recorded for ${project.title}.`,
    "",
    "2. TIME SUMMARY",
    `Total recorded hours: ${totalHours}`,
    `Billable hours: ${billableHours}`,
    `Non-billable hours: ${roundHours(totalHours - billableHours)}`,
    "",
    "Hours by delivery stage:",
    formatGroupedHours(stages),
    "",
    "Hours by work type:",
    formatGroupedHours(workTypes),
    "",
    "3. WORK COMPLETED",
    entries.length
      ? entries
          .map(
            (entry, index) =>
              `${index + 1}. ${formatDate(entry.entryDate)} - ${entry.hours} hrs - ${entry.workType}\n   ${entry.description}`
          )
          .join("\n")
      : "No time entries were recorded for this period.",
    "",
    "4. TASK PROGRESS",
    `Total tasks: ${tasks.length}`,
    `Completed tasks: ${completedTasks.length}`,
    `Blocked tasks: ${blockedTasks.length}`,
    tasks.length
      ? tasks
          .map((task, index) => `${index + 1}. [${toReadableLabel(task.status)}] ${task.title}`)
          .join("\n")
      : "No task board records found for this project.",
    "",
    "5. SUPPORT / ISSUES",
    `Open tickets: ${openTickets.length}`,
    tickets.length
      ? tickets
          .map((ticket, index) => `${index + 1}. [${toReadableLabel(ticket.status)}] ${ticket.subject}`)
          .join("\n")
      : "No support tickets are linked to this project.",
    "",
    "6. NEXT STEPS",
    reportForm.nextSteps?.trim() || "Confirm next delivery action with the client and continue project execution.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function buildTimeSummaryText({ stats, entries, projects, clients }) {
  return [
    "MKETICS TIME TRACKING SUMMARY",
    `Total hours: ${stats.totalHours}`,
    `Billable hours: ${stats.billableHours}`,
    `Non-billable hours: ${stats.nonBillableHours}`,
    `This month: ${stats.thisMonthHours}`,
    "",
    "Visible entries:",
    entries.length
      ? entries
          .map((entry, index) => {
            const project = projects.find((item) => item.id === entry.projectId);
            const client = clients.find((item) => item.id === project?.client_id);
            return `${index + 1}. ${formatDate(entry.entryDate)} - ${entry.hours} hrs - ${project?.title || "Project"} - ${client?.full_name || client?.organisation || "Client"}\n   ${entry.description}`;
          })
          .join("\n")
      : "No visible entries.",
  ].join("\n");
}

function filterEntriesForReport(entries, reportForm) {
  const start = reportForm.periodStart ? startOfDay(new Date(reportForm.periodStart)) : null;
  const end = reportForm.periodEnd ? startOfDay(new Date(reportForm.periodEnd)) : null;

  return entries.filter((entry) => {
    if (entry.projectId !== reportForm.projectId) return false;

    const entryDate = startOfDay(new Date(entry.entryDate));
    if (start && entryDate < start) return false;
    if (end && entryDate > end) return false;

    return true;
  });
}

function normaliseTimeEntries(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: entry.id || createId(),
      projectId: entry.projectId || entry.project_id || "",
      taskId: entry.taskId || entry.task_id || "",
      entryDate: entry.entryDate || entry.entry_date || getTodayInputValue(),
      startTime: entry.startTime || entry.start_time || "",
      endTime: entry.endTime || entry.end_time || "",
      hours: parseHours(entry.hours) || 0,
      workType: workTypeOptions.includes(entry.workType) ? entry.workType : entry.work_type || "Development",
      deliveryStage: deliveryStageOptions.includes(entry.deliveryStage)
        ? entry.deliveryStage
        : entry.delivery_stage || "Build",
      billingType: ["billable", "non_billable"].includes(entry.billingType)
        ? entry.billingType
        : entry.billing_type || "billable",
      description: String(entry.description || ""),
      createdAt: entry.createdAt || entry.created_at || new Date().toISOString(),
      updatedAt: entry.updatedAt || entry.updated_at || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
}

function normaliseTasks(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((task) => task && typeof task === "object")
    .map((task) => ({
      id: task.id || createId(),
      projectId: task.projectId || task.project_id || "",
      title: String(task.title || "Untitled Task"),
      description: String(task.description || ""),
      status: task.status || "todo",
      priority: task.priority || "normal",
      category: task.category || "Development",
      dueDate: task.dueDate || task.due_date || "",
      createdAt: task.createdAt || task.created_at || new Date().toISOString(),
      updatedAt: task.updatedAt || task.updated_at || new Date().toISOString(),
      completedAt: task.completedAt || task.completed_at || "",
    }));
}

function calculateHoursFromTimes(startTime, endTime) {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  if ([startHours, startMinutes, endHours, endMinutes].some((value) => Number.isNaN(value))) return "";

  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;
  const minutes = end >= start ? end - start : end + 24 * 60 - start;

  return roundHours(minutes / 60).toString();
}

function parseHours(value) {
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? roundHours(parsed) : 0;
}

function sumHours(entries) {
  return entries.reduce((total, entry) => total + (Number(entry.hours) || 0), 0);
}

function groupHoursBy(entries, key) {
  return entries.reduce((groups, entry) => {
    const groupKey = entry[key] || "Other";
    return {
      ...groups,
      [groupKey]: roundHours((groups[groupKey] || 0) + (Number(entry.hours) || 0)),
    };
  }, {});
}

function formatGroupedHours(groups) {
  const entries = Object.entries(groups);
  if (entries.length === 0) return "No recorded hours.";
  return entries.map(([label, hours]) => `- ${label}: ${hours} hrs`).join("\n");
}

function roundHours(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStartInputValue() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `time-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(value) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
