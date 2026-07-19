import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Save,
  Search,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const financeSettingKey = "business_finance_records_v1";
const invoiceSettingKey = "business_invoice_records_v1";
const timeTrackingSettingKey = "project_time_tracking_v1";
const taskBoardSettingKey = "project_task_board_v1";
const remindersSettingKey = "admin_reminders";

const reportTypeOptions = [
  "Monthly Business Summary",
  "Finance Summary",
  "Delivery Summary",
  "Pipeline Summary",
];

const periodFilterOptions = [
  { value: "month", label: "Selected Month" },
  { value: "quarter", label: "Quarter to Date" },
  { value: "year", label: "Year to Date" },
  { value: "all", label: "All Records" },
];

export default function BusinessReportsDashboard({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    leads: [],
    clients: [],
    projects: [],
    quotes: [],
    tickets: [],
    documents: [],
    financeRecords: [],
    invoices: [],
    timeEntries: [],
    tasks: [],
    reminders: [],
  });

  const [filters, setFilters] = useState({
    month: getCurrentMonthInputValue(),
    period: "month",
    reportType: "Monthly Business Summary",
    search: "",
  });

  const [reportState, setReportState] = useState({
    loading: false,
    error: "",
    success: "",
    preview: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchReportData();
    }
  }, [isActive]);

  const periodRange = useMemo(() => buildPeriodRange(filters), [filters.month, filters.period]);

  const filteredActivity = useMemo(() => {
    const activity = buildActivityTimeline(dataState).filter((item) => isWithinRange(item.date, periodRange));

    if (!filters.search.trim()) return activity;

    const search = filters.search.trim().toLowerCase();

    return activity.filter((item) =>
      [item.title, item.description, item.type, item.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [dataState, filters.search, periodRange]);

  const reportStats = useMemo(() => {
    const leads = dataState.leads.filter((item) => isWithinRange(item.created_at, periodRange));
    const quotes = dataState.quotes.filter((item) => isWithinRange(item.created_at, periodRange));
    const clients = dataState.clients.filter((item) => isWithinRange(item.created_at, periodRange));
    const projects = dataState.projects.filter((item) => isWithinRange(item.created_at, periodRange) || isWithinRange(item.updated_at, periodRange));
    const tickets = dataState.tickets.filter((item) => isWithinRange(item.created_at, periodRange) || isWithinRange(item.updated_at, periodRange));
    const documents = dataState.documents.filter((item) => isWithinRange(item.created_at, periodRange));
    const finance = dataState.financeRecords.filter((item) => isWithinRange(item.transactionDate, periodRange));
    const invoices = dataState.invoices.filter((item) => isWithinRange(item.issueDate || item.createdAt, periodRange));
    const timeEntries = dataState.timeEntries.filter((item) => isWithinRange(item.entryDate, periodRange));

    const income = finance.filter((item) => item.transactionType === "income");
    const expenses = finance.filter((item) => item.transactionType === "expense");
    const invoiceBilled = sumAmounts(invoices, "amount");
    const invoicePaid = sumAmounts(invoices, "paidAmount");
    const financePaidIncome = sumAmounts(income, "paidAmount");
    const financePaidExpenses = sumAmounts(expenses, "paidAmount");
    const billableHours = sumAmounts(timeEntries.filter((item) => item.billingType === "billable"), "hours");
    const totalHours = sumAmounts(timeEntries, "hours");

    return {
      leads: leads.length,
      wonLeads: leads.filter((item) => item.status === "won").length,
      clients: clients.length,
      projects: projects.length,
      activeProjects: dataState.projects.filter((item) => isActiveProjectStatus(item.status)).length,
      completedProjects: projects.filter((item) => item.status === "completed").length,
      quotes: quotes.length,
      acceptedQuotes: quotes.filter((item) => item.status === "accepted").length,
      quotedValue: sumAmounts(quotes, "amount"),
      invoiceCount: invoices.length,
      invoiceBilled,
      invoicePaid,
      invoiceOutstanding: Math.max(invoiceBilled - invoicePaid, 0),
      paidIncome: financePaidIncome,
      paidExpenses: financePaidExpenses,
      netCash: financePaidIncome - financePaidExpenses,
      tickets: tickets.length,
      openTickets: dataState.tickets.filter((item) => !["resolved", "closed"].includes(item.status)).length,
      urgentTickets: dataState.tickets.filter((item) => item.priority === "urgent").length,
      documents: documents.length,
      timeEntries: timeEntries.length,
      totalHours: roundHours(totalHours),
      billableHours: roundHours(billableHours),
      tasksDone: dataState.tasks.filter((item) => item.status === "done" && isWithinRange(item.updatedAt || item.completedAt, periodRange)).length,
      remindersOpen: dataState.reminders.filter((item) => !item.completed).length,
      activityCount: filteredActivity.length,
    };
  }, [dataState, filteredActivity.length, periodRange]);

  const generatedSummary = useMemo(() => {
    return buildBusinessReportText({
      filters,
      periodRange,
      stats: reportStats,
      dataState,
      activity: filteredActivity,
    });
  }, [dataState, filteredActivity, filters, periodRange, reportStats]);

  async function fetchReportData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));

      const [
        leadsResponse,
        clientsResponse,
        projectsResponse,
        quotesResponse,
        ticketsResponse,
        documentsResponse,
        financeResponse,
        invoicesResponse,
        timeResponse,
        tasksResponse,
        remindersResponse,
      ] = await Promise.all([
        supabase
          .from("leads")
          .select("id, full_name, email, phone, organisation, service_needed, status, budget, timeline, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, full_name, email, phone, organisation, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, client_id, lead_id, title, service_type, status, start_date, due_date, completed_at, created_at, updated_at")
          .order("updated_at", { ascending: false }),
        supabase
          .from("quotes")
          .select("id, lead_id, client_id, project_id, quote_number, title, amount, currency, status, valid_until, sent_at, accepted_at, rejected_at, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("support_tickets")
          .select("id, client_id, project_id, ticket_type, priority, subject, status, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("documents")
          .select("id, client_id, project_id, quote_id, title, document_type, public_url, storage_path, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("settings").select("setting_value").eq("setting_key", financeSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", invoiceSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", timeTrackingSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", taskBoardSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", remindersSettingKey).maybeSingle(),
      ]);

      const firstError =
        leadsResponse.error ||
        clientsResponse.error ||
        projectsResponse.error ||
        quotesResponse.error ||
        ticketsResponse.error ||
        documentsResponse.error ||
        financeResponse.error ||
        invoicesResponse.error ||
        timeResponse.error ||
        tasksResponse.error ||
        remindersResponse.error;

      if (firstError) throw firstError;

      setDataState({
        loading: false,
        error: "",
        leads: leadsResponse.data || [],
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
        quotes: quotesResponse.data || [],
        tickets: ticketsResponse.data || [],
        documents: documentsResponse.data || [],
        financeRecords: normaliseFinanceRecords(financeResponse.data?.setting_value?.records || []),
        invoices: normaliseInvoices(invoicesResponse.data?.setting_value?.invoices || []),
        timeEntries: normaliseTimeEntries(timeResponse.data?.setting_value?.entries || []),
        tasks: normaliseTasks(tasksResponse.data?.setting_value?.tasks || []),
        reminders: normaliseReminders(remindersResponse.data?.setting_value?.reminders || []),
      });
    } catch (error) {
      setDataState({
        loading: false,
        error: error?.message || "Unable to load business report data. Check Supabase report permissions.",
        leads: [],
        clients: [],
        projects: [],
        quotes: [],
        tickets: [],
        documents: [],
        financeRecords: [],
        invoices: [],
        timeEntries: [],
        tasks: [],
        reminders: [],
      });
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setReportState((current) => ({ ...current, error: "", success: "" }));
  }

  function handleGenerateReport() {
    setReportState({
      loading: false,
      error: "",
      success: "Business report generated.",
      preview: generatedSummary,
    });
  }

  async function handleCopyReport() {
    const text = reportState.preview || generatedSummary;

    try {
      await navigator.clipboard.writeText(text);
      setReportState((current) => ({
        ...current,
        error: "",
        success: "Business report copied to clipboard.",
      }));
    } catch (error) {
      setReportState((current) => ({
        ...current,
        error: "Unable to copy the report. Select and copy the text manually.",
        success: "",
      }));
    }
  }

  function handlePrintReport() {
    const text = reportState.preview || generatedSummary;
    printBusinessReport(text, filters.reportType);
  }

  async function handleSaveReportDocument() {
    if (!supabase) return;

    try {
      setReportState((current) => ({ ...current, loading: true, error: "", success: "" }));

      const reportText = reportState.preview || generatedSummary;
      const title = `${filters.reportType} - ${periodRange.label}`;

      const { error } = await supabase.from("documents").insert({
        title,
        document_type: "Business Report",
        notes: reportText,
      });

      if (error) throw error;

      setReportState({
        loading: false,
        error: "",
        success: "Business report saved as a document record.",
        preview: reportText,
      });
    } catch (error) {
      setReportState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Unable to save report document. Check Supabase document permissions.",
        success: "",
      }));
    }
  }

  const reportPreview = reportState.preview || generatedSummary;

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
              <BarChart3 size={16} />
              Business Reports
            </div>

            <h2 className="mt-5 text-3xl font-black text-[#020B1F]">
              Business reports and monthly summaries.
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Consolidate leads, quotes, projects, invoices, finance records,
              time entries, support tickets and documents into one MKETICS
              operating report.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReportData}
            disabled={dataState.loading}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {dataState.loading ? (
              <Loader2 size={17} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={17} className="mr-2" />
            )}
            Refresh Report Data
          </button>
        </div>

        {dataState.error && <StatusMessage type="error" message={dataState.error} />}
        {reportState.error && <StatusMessage type="error" message={reportState.error} />}
        {reportState.success && <StatusMessage type="success" message={reportState.success} />}

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Report Type</span>
            <select
              name="reportType"
              value={filters.reportType}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              {reportTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Month</span>
            <input
              type="month"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Period</span>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              {periodFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Search Activity</span>
            <div className="relative mt-2">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search timeline..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard label="Leads" value={reportStats.leads} note={`${reportStats.wonLeads} won`} icon={Clipboard} />
        <ReportStatCard label="Quoted Value" value={formatCurrency(reportStats.quotedValue)} note={`${reportStats.acceptedQuotes} accepted quotes`} icon={FileText} />
        <ReportStatCard label="Invoice Paid" value={formatCurrency(reportStats.invoicePaid)} note={`${formatCurrency(reportStats.invoiceOutstanding)} outstanding`} icon={WalletCards} />
        <ReportStatCard label="Tracked Hours" value={`${reportStats.totalHours} hrs`} note={`${reportStats.billableHours} billable hrs`} icon={Clock} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard label="Active Projects" value={reportStats.activeProjects} note={`${reportStats.completedProjects} completed in period`} icon={BriefcaseBusiness} />
        <ReportStatCard label="Open Tickets" value={reportStats.openTickets} note={`${reportStats.urgentTickets} urgent`} icon={AlertCircle} />
        <ReportStatCard label="Net Cash" value={formatCurrency(reportStats.netCash)} note={`${formatCurrency(reportStats.paidExpenses)} paid expenses`} icon={WalletCards} />
        <ReportStatCard label="Documents" value={reportStats.documents} note={`${reportStats.activityCount} timeline items`} icon={FileText} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[#020B1F]">Activity timeline</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Showing activity for {periodRange.label}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid max-h-[720px] gap-3 overflow-y-auto pr-1">
            {dataState.loading && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6 text-center">
                <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                <p className="mt-3 text-sm font-black text-slate-500">Loading timeline...</p>
              </div>
            )}

            {!dataState.loading && filteredActivity.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6">
                <p className="text-sm font-bold leading-6 text-slate-600">
                  No business activity matched this report period.
                </p>
              </div>
            )}

            {!dataState.loading &&
              filteredActivity.slice(0, 80).map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#020B1F]">{item.title}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.description}</p>
                    </div>

                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
                      {item.type}
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    {formatFullDate(item.date)} {item.status ? `• ${toReadableLabel(item.status)}` : ""}
                  </p>
                </article>
              ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[#020B1F]">Monthly summary report</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Generate, copy, print or save this summary into the Documents tab.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateReport}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <BarChart3 size={17} className="mr-2" />
              Generate Summary
            </button>
          </div>

          <textarea
            value={reportPreview}
            onChange={(event) =>
              setReportState((current) => ({
                ...current,
                preview: event.target.value,
                error: "",
                success: "",
              }))
            }
            rows={24}
            className="mt-5 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 font-mono text-xs font-semibold leading-6 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Printer size={17} className="mr-2" />
              Print / PDF
            </button>

            <button
              type="button"
              onClick={handleSaveReportDocument}
              disabled={reportState.loading}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {reportState.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <Save size={17} className="mr-2" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportStatCard({ label, value, note, icon: Icon }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{label}</p>
          <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
          {note && <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{note}</p>}
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isError ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {isError ? <AlertCircle size={20} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={20} className="mt-0.5 shrink-0" />}
      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}

function buildBusinessReportText({ filters, periodRange, stats, dataState, activity }) {
  const recentLeads = dataState.leads.filter((item) => isWithinRange(item.created_at, periodRange)).slice(0, 8);
  const recentProjects = dataState.projects.filter((item) => isWithinRange(item.updated_at || item.created_at, periodRange)).slice(0, 8);
  const recentInvoices = dataState.invoices.filter((item) => isWithinRange(item.issueDate || item.createdAt, periodRange)).slice(0, 8);
  const recentTickets = dataState.tickets.filter((item) => isWithinRange(item.updated_at || item.created_at, periodRange)).slice(0, 8);

  const lines = [
    "MKETICS (PTY) LTD",
    filters.reportType,
    "Speak Innovation. Deliver Value.",
    "==================================================",
    `Period: ${periodRange.label}`,
    `Generated: ${formatFullDate(new Date().toISOString())}`,
    "",
    "EXECUTIVE SNAPSHOT",
    "------------------",
    `Leads received: ${stats.leads}`,
    `Won leads: ${stats.wonLeads}`,
    `New clients: ${stats.clients}`,
    `Projects touched: ${stats.projects}`,
    `Active projects total: ${stats.activeProjects}`,
    `Open support tickets total: ${stats.openTickets}`,
    "",
    "FINANCE SUMMARY",
    "---------------",
    `Quoted value: ${formatCurrency(stats.quotedValue)}`,
    `Invoice billed: ${formatCurrency(stats.invoiceBilled)}`,
    `Invoice paid: ${formatCurrency(stats.invoicePaid)}`,
    `Invoice outstanding: ${formatCurrency(stats.invoiceOutstanding)}`,
    `Finance paid income: ${formatCurrency(stats.paidIncome)}`,
    `Finance paid expenses: ${formatCurrency(stats.paidExpenses)}`,
    `Net cash position: ${formatCurrency(stats.netCash)}`,
    "",
    "DELIVERY SUMMARY",
    "----------------",
    `Tracked hours: ${stats.totalHours} hrs`,
    `Billable hours: ${stats.billableHours} hrs`,
    `Tasks completed: ${stats.tasksDone}`,
    `Documents added: ${stats.documents}`,
    `Support tickets touched: ${stats.tickets}`,
    `Urgent tickets total: ${stats.urgentTickets}`,
    "",
    "PIPELINE SUMMARY",
    "----------------",
    `Quotes created: ${stats.quotes}`,
    `Accepted quotes: ${stats.acceptedQuotes}`,
    `Invoices created: ${stats.invoiceCount}`,
    `Open reminders total: ${stats.remindersOpen}`,
    "",
    "RECENT LEADS",
    "------------",
    recentLeads.length
      ? recentLeads
          .map((lead) => `- ${formatDate(lead.created_at)} | ${lead.full_name} | ${lead.service_needed || "Service not set"} | ${toReadableLabel(lead.status)}`)
          .join("\n")
      : "No leads recorded for this period.",
    "",
    "RECENT PROJECTS",
    "---------------",
    recentProjects.length
      ? recentProjects.map((project) => `- ${project.title} | ${toReadableLabel(project.status)} | ${project.service_type || "Service not set"}`).join("\n")
      : "No projects updated for this period.",
    "",
    "RECENT INVOICES",
    "---------------",
    recentInvoices.length
      ? recentInvoices
          .map((invoice) => `- ${invoice.invoiceNumber} | ${invoice.title} | ${formatCurrency(invoice.amount)} | Paid ${formatCurrency(invoice.paidAmount)} | ${toReadableLabel(invoice.paymentStatus)}`)
          .join("\n")
      : "No invoices recorded for this period.",
    "",
    "RECENT SUPPORT",
    "--------------",
    recentTickets.length
      ? recentTickets.map((ticket) => `- ${ticket.subject} | ${toReadableLabel(ticket.status)} | ${toReadableLabel(ticket.priority)}`).join("\n")
      : "No support tickets recorded for this period.",
    "",
    "ACTIVITY TIMELINE",
    "-----------------",
    activity.length
      ? activity
          .slice(0, 20)
          .map((item) => `- ${formatDate(item.date)} | ${item.type} | ${item.title} | ${item.description}`)
          .join("\n")
      : "No activity found for this period.",
    "",
    "RECOMMENDED ACTIONS",
    "-------------------",
    stats.invoiceOutstanding > 0 ? `- Follow up outstanding invoices worth ${formatCurrency(stats.invoiceOutstanding)}.` : "- No invoice follow-up required from this report snapshot.",
    stats.openTickets > 0 ? `- Review ${stats.openTickets} open support ticket(s).` : "- Support ticket load is clear.",
    stats.remindersOpen > 0 ? `- Review ${stats.remindersOpen} open reminder(s) in Notifications.` : "- No open reminders flagged.",
    stats.activeProjects > 0 ? `- Continue delivery tracking for ${stats.activeProjects} active project(s).` : "- No active delivery pressure shown.",
  ];

  return lines.join("\n");
}

function buildActivityTimeline(dataState) {
  const items = [];

  dataState.leads.forEach((lead) => {
    items.push({
      id: `lead-${lead.id}`,
      type: "Lead",
      title: lead.full_name || "New Lead",
      description: lead.service_needed || "Website enquiry received.",
      status: lead.status,
      date: lead.created_at,
    });
  });

  dataState.quotes.forEach((quote) => {
    items.push({
      id: `quote-${quote.id}`,
      type: "Quote",
      title: quote.quote_number || quote.title || "Quote",
      description: `${quote.title || "Quote"} • ${formatCurrency(quote.amount, quote.currency)}`,
      status: quote.status,
      date: quote.created_at,
    });
  });

  dataState.clients.forEach((client) => {
    items.push({
      id: `client-${client.id}`,
      type: "Client",
      title: client.full_name || client.organisation || "Client",
      description: client.organisation || client.email || "Client record created.",
      status: "created",
      date: client.created_at,
    });
  });

  dataState.projects.forEach((project) => {
    items.push({
      id: `project-${project.id}`,
      type: "Project",
      title: project.title || "Project",
      description: project.service_type || "Project record updated.",
      status: project.status,
      date: project.updated_at || project.created_at,
    });
  });

  dataState.tickets.forEach((ticket) => {
    items.push({
      id: `ticket-${ticket.id}`,
      type: "Ticket",
      title: ticket.subject || "Support Ticket",
      description: `${toReadableLabel(ticket.priority)} priority • ${toReadableLabel(ticket.ticket_type)}`,
      status: ticket.status,
      date: ticket.updated_at || ticket.created_at,
    });
  });

  dataState.documents.forEach((document) => {
    items.push({
      id: `document-${document.id}`,
      type: "Document",
      title: document.title || "Document",
      description: document.document_type || "Document record added.",
      status: document.storage_path ? "stored" : "linked",
      date: document.created_at,
    });
  });

  dataState.invoices.forEach((invoice) => {
    items.push({
      id: `invoice-${invoice.id}`,
      type: "Invoice",
      title: invoice.invoiceNumber || invoice.title || "Invoice",
      description: `${invoice.title || "Invoice"} • ${formatCurrency(invoice.amount)} billed`,
      status: invoice.paymentStatus,
      date: invoice.issueDate || invoice.createdAt,
    });
  });

  dataState.financeRecords.forEach((record) => {
    items.push({
      id: `finance-${record.id}`,
      type: toReadableLabel(record.transactionType),
      title: record.title || "Finance Record",
      description: `${formatCurrency(record.amount)} • Paid ${formatCurrency(record.paidAmount)}`,
      status: record.paymentStatus,
      date: record.transactionDate || record.createdAt,
    });
  });

  dataState.timeEntries.forEach((entry) => {
    items.push({
      id: `time-${entry.id}`,
      type: "Time",
      title: entry.workType || "Time Entry",
      description: `${entry.hours || 0} hrs • ${entry.description || "Work logged"}`,
      status: entry.billingType,
      date: entry.entryDate || entry.createdAt,
    });
  });

  return items
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function buildPeriodRange(filters) {
  const [yearRaw, monthRaw] = String(filters.month || getCurrentMonthInputValue()).split("-");
  const year = Number(yearRaw) || new Date().getFullYear();
  const monthIndex = (Number(monthRaw) || new Date().getMonth() + 1) - 1;

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  if (filters.period === "quarter") {
    const quarterStartMonth = Math.floor(monthIndex / 3) * 3;
    const start = new Date(year, quarterStartMonth, 1);

    return {
      start,
      end: monthEnd,
      label: `${formatMonthYear(start)} to ${formatMonthYear(monthEnd)}`,
    };
  }

  if (filters.period === "year") {
    const start = new Date(year, 0, 1);

    return {
      start,
      end: monthEnd,
      label: `${year} year to ${formatMonthYear(monthEnd)}`,
    };
  }

  if (filters.period === "all") {
    return {
      start: null,
      end: null,
      label: "All records",
    };
  }

  return {
    start: monthStart,
    end: monthEnd,
    label: formatMonthYear(monthStart),
  };
}

function isWithinRange(value, range) {
  if (!value) return false;
  if (!range.start && !range.end) return true;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date >= range.start && date <= range.end;
}

function normaliseFinanceRecords(records) {
  if (!Array.isArray(records)) return [];

  return records
    .filter((record) => record && record.id)
    .map((record) => ({
      id: record.id,
      transactionType: record.transactionType || "income",
      title: record.title || "Finance Record",
      clientId: record.clientId || "",
      projectId: record.projectId || "",
      quoteId: record.quoteId || "",
      amount: Number(record.amount || 0),
      paidAmount: Number(record.paidAmount || 0),
      transactionDate: record.transactionDate || record.createdAt || "",
      dueDate: record.dueDate || "",
      category: record.category || "Other",
      paymentStatus: record.paymentStatus || "pending",
      paymentMethod: record.paymentMethod || "Not Set",
      reference: record.reference || "",
      notes: record.notes || "",
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
    }));
}

function normaliseInvoices(invoices) {
  if (!Array.isArray(invoices)) return [];

  return invoices
    .filter((invoice) => invoice && invoice.id)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || "Invoice",
      title: invoice.title || "MKETICS invoice",
      clientId: invoice.clientId || "",
      projectId: invoice.projectId || "",
      quoteId: invoice.quoteId || "",
      amount: Number(invoice.amount || 0),
      paidAmount: Number(invoice.paidAmount || 0),
      currency: invoice.currency || "ZAR",
      issueDate: invoice.issueDate || invoice.createdAt || "",
      dueDate: invoice.dueDate || "",
      paymentStatus: invoice.paymentStatus || "draft",
      paymentMethod: invoice.paymentMethod || "Not Set",
      paymentDate: invoice.paymentDate || "",
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: invoice.updatedAt || invoice.createdAt || new Date().toISOString(),
    }));
}

function normaliseTimeEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => entry && entry.id)
    .map((entry) => ({
      id: entry.id,
      projectId: entry.projectId || entry.project_id || "",
      taskId: entry.taskId || entry.task_id || "",
      entryDate: entry.entryDate || entry.entry_date || entry.createdAt || "",
      hours: Number(entry.hours || 0),
      workType: entry.workType || entry.work_type || "Work",
      deliveryStage: entry.deliveryStage || entry.delivery_stage || "Delivery",
      billingType: entry.billingType || entry.billing_type || "billable",
      description: entry.description || "",
      createdAt: entry.createdAt || entry.created_at || new Date().toISOString(),
      updatedAt: entry.updatedAt || entry.updated_at || new Date().toISOString(),
    }));
}

function normaliseTasks(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .filter((task) => task && task.id)
    .map((task) => ({
      id: task.id,
      projectId: task.projectId || task.project_id || "",
      title: task.title || "Task",
      status: task.status || "todo",
      priority: task.priority || "normal",
      dueDate: task.dueDate || task.due_date || "",
      createdAt: task.createdAt || task.created_at || new Date().toISOString(),
      updatedAt: task.updatedAt || task.updated_at || task.createdAt || new Date().toISOString(),
      completedAt: task.completedAt || task.completed_at || "",
    }));
}

function normaliseReminders(reminders) {
  if (!Array.isArray(reminders)) return [];

  return reminders
    .filter((reminder) => reminder && reminder.id)
    .map((reminder) => ({
      id: reminder.id,
      title: reminder.title || "Reminder",
      completed: Boolean(reminder.completed),
      createdAt: reminder.createdAt || reminder.created_at || new Date().toISOString(),
      updatedAt: reminder.updatedAt || reminder.updated_at || reminder.createdAt || new Date().toISOString(),
    }));
}

function printBusinessReport(text, title) {
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  const safeTitle = escapeHtml(title || "MKETICS Business Report");
  const safeText = escapeHtml(text).replace(/\n/g, "<br>");

  const content = `<!doctype html>
<html>
<head>
  <title>${safeTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #061A33; }
    .header { border-bottom: 3px solid #00AEEF; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 24px; }
    p { margin: 6px 0; }
    .report { white-space: normal; font-size: 12px; line-height: 1.55; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>MKETICS (PTY) LTD</h1>
    <p>Speak Innovation. Deliver Value.</p>
    <p>services@mketics.co.za | +27 72 286 4367</p>
  </div>
  <div class="report">${safeText}</div>
</body>
</html>`;

  frame.contentWindow.document.open();
  frame.contentWindow.document.write(content);
  frame.contentWindow.document.close();

  window.setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(() => document.body.removeChild(frame), 1000);
  }, 250);
}

function getCurrentMonthInputValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(amount, currency = "ZAR") {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(value);
}

function formatDate(value) {
  if (!value) return "Date not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(value) {
  if (!value) return "Date not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMonthYear(value) {
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "long",
  }).format(new Date(value));
}

function sumAmounts(items, key) {
  return items.reduce((total, item) => total + Number(item?.[key] || 0), 0);
}

function roundHours(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function isActiveProjectStatus(status) {
  return !["completed", "cancelled", "archived"].includes(String(status || "").toLowerCase());
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
