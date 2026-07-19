import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const financeSettingKey = "business_finance_records_v1";
const invoiceSettingKey = "business_invoice_records_v1";
const timeTrackingSettingKey = "project_time_tracking_v1";
const taskBoardSettingKey = "project_task_board_v1";

const periodFilterOptions = [
  { value: "month", label: "Selected Month" },
  { value: "quarter", label: "Quarter to Date" },
  { value: "year", label: "Year to Date" },
  { value: "all", label: "All Records" },
];

export default function BusinessKPIInsightsDashboard({ isActive }) {
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
  });

  const [filters, setFilters] = useState({
    month: getCurrentMonthInputValue(),
    period: "year",
    search: "",
  });

  const [copyState, setCopyState] = useState({
    error: "",
    success: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchKpiData();
    }
  }, [isActive]);

  const periodRange = useMemo(() => buildPeriodRange(filters), [filters.month, filters.period]);

  const scopedData = useMemo(() => {
    return {
      leads: dataState.leads.filter((item) => isWithinRange(item.created_at, periodRange)),
      quotes: dataState.quotes.filter((item) => isWithinRange(item.created_at, periodRange)),
      clients: dataState.clients.filter((item) => isWithinRange(item.created_at, periodRange)),
      projects: dataState.projects.filter((item) => isWithinRange(item.created_at, periodRange) || isWithinRange(item.updated_at, periodRange)),
      tickets: dataState.tickets.filter((item) => isWithinRange(item.created_at, periodRange) || isWithinRange(item.updated_at, periodRange)),
      documents: dataState.documents.filter((item) => isWithinRange(item.created_at, periodRange)),
      financeRecords: dataState.financeRecords.filter((item) => isWithinRange(item.transactionDate, periodRange)),
      invoices: dataState.invoices.filter((item) => isWithinRange(item.issueDate || item.createdAt, periodRange)),
      timeEntries: dataState.timeEntries.filter((item) => isWithinRange(item.entryDate, periodRange)),
      tasks: dataState.tasks.filter((item) => isWithinRange(item.createdAt || item.updatedAt, periodRange) || isWithinRange(item.completedAt, periodRange)),
    };
  }, [dataState, periodRange]);

  const kpis = useMemo(() => buildKpis(scopedData, dataState), [scopedData, dataState]);
  const monthlyTrend = useMemo(() => buildMonthlyTrend(dataState, filters), [dataState, filters.month, filters.period]);
  const leadFunnel = useMemo(() => buildLeadFunnel(scopedData.leads, scopedData.quotes), [scopedData.leads, scopedData.quotes]);
  const projectStatusBars = useMemo(() => buildProjectStatusBars(dataState.projects), [dataState.projects]);
  const insights = useMemo(() => buildGrowthInsights(kpis, monthlyTrend, leadFunnel, dataState), [kpis, monthlyTrend, leadFunnel, dataState]);

  const visibleInsights = useMemo(() => {
    if (!filters.search.trim()) return insights;

    const search = filters.search.trim().toLowerCase();

    return insights.filter((insight) =>
      [insight.title, insight.body, insight.action, insight.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [insights, filters.search]);

  async function fetchKpiData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));
      setCopyState({ error: "", success: "" });

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
      ] = await Promise.all([
        supabase
          .from("leads")
          .select("id, full_name, organisation, service_needed, status, budget, timeline, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, full_name, organisation, created_at, updated_at")
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
          .select("id, client_id, project_id, quote_id, title, document_type, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("settings").select("setting_value").eq("setting_key", financeSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", invoiceSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", timeTrackingSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", taskBoardSettingKey).maybeSingle(),
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
        tasksResponse.error;

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
      });
    } catch (error) {
      setDataState({
        loading: false,
        error: error?.message || "Unable to load KPI data. Check Supabase report permissions.",
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
      });
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setCopyState({ error: "", success: "" });
  }

  async function handleCopyInsights() {
    const text = buildKpiSummaryText({ kpis, insights, periodRange, monthlyTrend, leadFunnel });

    try {
      await navigator.clipboard.writeText(text);
      setCopyState({ error: "", success: "KPI insights copied to clipboard." });
    } catch (error) {
      setCopyState({ error: "Unable to copy KPI insights. Select and copy the text manually.", success: "" });
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
              <TrendingUp size={16} />
              KPI Charts
            </div>

            <h2 className="mt-5 text-3xl font-black text-[#020B1F]">
              Business KPI charts and growth insights.
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Review MKETICS growth signals across leads, quotes, invoices,
              finance, projects, support tickets, task delivery and tracked time.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopyInsights}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy Insights
            </button>

            <button
              type="button"
              onClick={fetchKpiData}
              disabled={dataState.loading}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#061A33] px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-[#0B7CFF] disabled:opacity-70"
            >
              {dataState.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={17} className="mr-2" />
              )}
              Refresh KPIs
            </button>
          </div>
        </div>

        {dataState.error && <StatusMessage type="error" message={dataState.error} />}
        {copyState.error && <StatusMessage type="error" message={copyState.error} />}
        {copyState.success && <StatusMessage type="success" message={copyState.success} />}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
            <span className="text-sm font-black text-[#061A33]">KPI Period</span>
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
            <span className="text-sm font-black text-[#061A33]">Search Insights</span>
            <div className="relative mt-2">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search KPI insight..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Lead Conversion" value={`${kpis.leadConversionRate}%`} note={`${kpis.wonLeads} won from ${kpis.totalLeads} leads`} icon={Target} tone={getRateTone(kpis.leadConversionRate, 30, 60)} />
        <KpiCard label="Quote Acceptance" value={`${kpis.quoteAcceptanceRate}%`} note={`${kpis.acceptedQuotes} accepted from ${kpis.totalQuotes} quotes`} icon={FileText} tone={getRateTone(kpis.quoteAcceptanceRate, 35, 65)} />
        <KpiCard label="Invoice Collection" value={`${kpis.collectionRate}%`} note={`${formatCurrency(kpis.invoicePaid)} paid of ${formatCurrency(kpis.invoiceBilled)}`} icon={WalletCards} tone={getRateTone(kpis.collectionRate, 50, 85)} />
        <KpiCard label="Net Cash" value={formatCurrency(kpis.netCash)} note={`${formatCurrency(kpis.paidIncome)} income less ${formatCurrency(kpis.paidExpenses)} expenses`} icon={WalletCards} tone={kpis.netCash >= 0 ? "good" : "risk"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Average Quote" value={formatCurrency(kpis.averageQuoteValue)} note={`${formatCurrency(kpis.quotedValue)} total quoted value`} icon={BarChart3} tone="neutral" />
        <KpiCard label="Task Completion" value={`${kpis.taskCompletionRate}%`} note={`${kpis.completedTasks} done from ${kpis.totalTasks} tasks`} icon={CheckCircle2} tone={getRateTone(kpis.taskCompletionRate, 35, 70)} />
        <KpiCard label="Billable Time" value={`${kpis.billableRatio}%`} note={`${kpis.billableHours} billable hrs from ${kpis.totalHours} hrs`} icon={Clock} tone={getRateTone(kpis.billableRatio, 40, 70)} />
        <KpiCard label="Support Load" value={kpis.openTickets} note={`${kpis.urgentTickets} urgent tickets`} icon={AlertCircle} tone={kpis.urgentTickets > 0 ? "risk" : "good"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChartPanel
          title="Income, expenses and invoicing trend"
          description="Month-by-month view of paid income, paid expenses and invoice collection."
          data={monthlyTrend}
          series={[
            { key: "paidIncome", label: "Paid income" },
            { key: "paidExpenses", label: "Paid expenses" },
            { key: "invoicePaid", label: "Invoice paid" },
          ]}
          formatValue={formatCurrency}
        />

        <BarChartPanel
          title="Lead and quote pipeline funnel"
          description="Shows where business opportunities are currently moving through the pipeline."
          data={leadFunnel}
          formatValue={(value) => String(value)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <BarChartPanel
          title="Project status mix"
          description="Current project distribution by delivery status."
          data={projectStatusBars}
          formatValue={(value) => String(value)}
        />

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <Activity size={22} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#020B1F]">Growth insights</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Practical signals for the selected period: {periodRange.label}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {dataState.loading && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6 text-center">
                <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                <p className="mt-3 text-sm font-black text-slate-500">Loading KPI insights...</p>
              </div>
            )}

            {!dataState.loading && visibleInsights.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5">
                <p className="text-sm font-bold leading-6 text-slate-600">
                  No insights matched your search. Clear the search box to view all KPI insights.
                </p>
              </div>
            )}

            {!dataState.loading &&
              visibleInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, note, icon: Icon, tone = "neutral" }) {
  const toneClasses = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    risk: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-cyan-200 bg-[#EAF6FF] text-[#0B7CFF]",
  };

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{label}</p>
          <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
        </div>

        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${toneClasses[tone] || toneClasses.neutral}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{note}</p>
    </article>
  );
}

function TrendChartPanel({ title, description, data, series, formatValue }) {
  const maxValue = Math.max(...data.flatMap((item) => series.map((entry) => Number(item[entry.key]) || 0)), 1);
  const points = data.map((item, index) => ({ ...item, index }));

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <h3 className="text-2xl font-black text-[#020B1F]">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid h-72 grid-cols-[70px_1fr] gap-4">
            <div className="flex flex-col justify-between text-right text-xs font-black text-slate-400">
              <span>{formatValue(maxValue)}</span>
              <span>{formatValue(maxValue / 2)}</span>
              <span>{formatValue(0)}</span>
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
              <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-200" />
              <div className="absolute inset-x-4 bottom-4 border-t border-slate-200" />

              <div className="relative grid h-full items-end gap-3" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
                {points.map((item) => (
                  <div key={item.monthKey} className="flex h-full flex-col justify-end gap-1">
                    <div className="flex h-[86%] items-end justify-center gap-1">
                      {series.map((entry, seriesIndex) => {
                        const value = Number(item[entry.key]) || 0;
                        const height = Math.max((value / maxValue) * 100, value > 0 ? 4 : 0);

                        return (
                          <div
                            key={entry.key}
                            title={`${entry.label}: ${formatValue(value)}`}
                            className={`w-3 rounded-t-full ${seriesIndex === 0 ? "bg-[#0B7CFF]" : seriesIndex === 1 ? "bg-[#061A33]" : "bg-cyan-300"}`}
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-center text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {series.map((entry, index) => (
              <div key={entry.key} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                <span className={`h-3 w-3 rounded-full ${index === 0 ? "bg-[#0B7CFF]" : index === 1 ? "bg-[#061A33]" : "bg-cyan-300"}`} />
                {entry.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function BarChartPanel({ title, description, data, formatValue }) {
  const maxValue = Math.max(...data.map((item) => Number(item.value) || 0), 1);

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <h3 className="text-2xl font-black text-[#020B1F]">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>

      <div className="mt-6 grid gap-4">
        {data.map((item) => {
          const width = Math.max(((Number(item.value) || 0) / maxValue) * 100, item.value > 0 ? 5 : 0);

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black text-[#061A33]">{item.label}</p>
                <p className="text-sm font-black text-[#0B7CFF]">{formatValue(item.value)}</p>
              </div>

              <div className="mt-2 h-4 rounded-full bg-[#EAF6FF]">
                <div className="h-4 rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF]" style={{ width: `${width}%` }} />
              </div>

              {item.note && <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.note}</p>}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function InsightCard({ insight }) {
  const toneClasses = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    risk: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-cyan-200 bg-[#EAF6FF] text-[#061A33]",
  };

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses[insight.tone] || toneClasses.neutral}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#020B1F]">{insight.title}</p>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">{insight.body}</p>
        </div>

        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
          {insight.type}
        </span>
      </div>

      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
        Action: {insight.action}
      </p>
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
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}

function buildKpis(scopedData, allData) {
  const totalLeads = scopedData.leads.length;
  const wonLeads = scopedData.leads.filter((lead) => lead.status === "won").length;
  const totalQuotes = scopedData.quotes.length;
  const acceptedQuotes = scopedData.quotes.filter((quote) => quote.status === "accepted").length;
  const quotedValue = sumAmounts(scopedData.quotes, "amount");
  const invoiceBilled = sumAmounts(scopedData.invoices, "amount");
  const invoicePaid = sumAmounts(scopedData.invoices, "paidAmount");

  const income = scopedData.financeRecords.filter((record) => record.transactionType === "income");
  const expenses = scopedData.financeRecords.filter((record) => record.transactionType === "expense");
  const paidIncome = sumAmounts(income, "paidAmount");
  const paidExpenses = sumAmounts(expenses, "paidAmount");

  const totalTasks = scopedData.tasks.length;
  const completedTasks = scopedData.tasks.filter((task) => task.status === "done").length;
  const totalHours = roundHours(sumAmounts(scopedData.timeEntries, "hours"));
  const billableHours = roundHours(sumAmounts(scopedData.timeEntries.filter((entry) => entry.billingType === "billable"), "hours"));

  const openTickets = allData.tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length;
  const urgentTickets = allData.tickets.filter((ticket) => ticket.priority === "urgent" && !["resolved", "closed"].includes(ticket.status)).length;

  return {
    totalLeads,
    wonLeads,
    leadConversionRate: calculateRate(wonLeads, totalLeads),
    totalQuotes,
    acceptedQuotes,
    quoteAcceptanceRate: calculateRate(acceptedQuotes, totalQuotes),
    quotedValue,
    averageQuoteValue: totalQuotes ? quotedValue / totalQuotes : 0,
    invoiceBilled,
    invoicePaid,
    collectionRate: calculateRate(invoicePaid, invoiceBilled),
    paidIncome,
    paidExpenses,
    netCash: paidIncome - paidExpenses,
    totalTasks,
    completedTasks,
    taskCompletionRate: calculateRate(completedTasks, totalTasks),
    totalHours,
    billableHours,
    billableRatio: calculateRate(billableHours, totalHours),
    openTickets,
    urgentTickets,
    activeProjects: allData.projects.filter((project) => isActiveProjectStatus(project.status)).length,
    completedProjects: scopedData.projects.filter((project) => project.status === "completed").length,
  };
}

function buildMonthlyTrend(dataState, filters) {
  const monthCount = filters.period === "month" ? 6 : 12;
  const endMonth = parseMonthInput(filters.month) || new Date();
  const months = [];

  for (let index = monthCount - 1; index >= 0; index -= 1) {
    const date = new Date(endMonth.getFullYear(), endMonth.getMonth() - index, 1);
    const monthKey = getMonthKey(date);
    const monthRange = {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };

    const income = dataState.financeRecords.filter((record) => record.transactionType === "income" && isWithinRange(record.transactionDate, monthRange));
    const expenses = dataState.financeRecords.filter((record) => record.transactionType === "expense" && isWithinRange(record.transactionDate, monthRange));
    const invoices = dataState.invoices.filter((invoice) => isWithinRange(invoice.issueDate || invoice.createdAt, monthRange));

    months.push({
      monthKey,
      label: new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date),
      paidIncome: sumAmounts(income, "paidAmount"),
      paidExpenses: sumAmounts(expenses, "paidAmount"),
      invoicePaid: sumAmounts(invoices, "paidAmount"),
      invoiceBilled: sumAmounts(invoices, "amount"),
      leads: dataState.leads.filter((lead) => isWithinRange(lead.created_at, monthRange)).length,
      quotes: dataState.quotes.filter((quote) => isWithinRange(quote.created_at, monthRange)).length,
    });
  }

  return months;
}

function buildLeadFunnel(leads, quotes) {
  const contacted = leads.filter((lead) => ["contacted", "quoted", "won"].includes(lead.status)).length;
  const quotedLeads = leads.filter((lead) => ["quoted", "won"].includes(lead.status)).length;
  const wonLeads = leads.filter((lead) => lead.status === "won").length;
  const acceptedQuotes = quotes.filter((quote) => quote.status === "accepted").length;

  return [
    { label: "New leads", value: leads.length, note: "All leads created in the selected period." },
    { label: "Contacted", value: contacted, note: "Leads moved beyond review into client contact." },
    { label: "Quoted", value: Math.max(quotedLeads, quotes.length), note: "Leads or quote records created during the selected period." },
    { label: "Accepted", value: acceptedQuotes, note: "Quotes accepted in the selected period." },
    { label: "Won", value: wonLeads, note: "Leads closed as won." },
  ];
}

function buildProjectStatusBars(projects) {
  const statuses = ["planning", "active", "in_progress", "awaiting_client", "support", "completed"];

  return statuses.map((status) => ({
    label: toReadableLabel(status),
    value: projects.filter((project) => normaliseStatus(project.status) === status).length,
  }));
}

function buildGrowthInsights(kpis, monthlyTrend, leadFunnel, dataState) {
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] || {};
  const previousMonth = monthlyTrend[monthlyTrend.length - 2] || {};
  const incomeChange = calculatePercentageChange(latestMonth.paidIncome, previousMonth.paidIncome);
  const leadChange = calculatePercentageChange(latestMonth.leads, previousMonth.leads);
  const insights = [];

  insights.push({
    id: "cash-position",
    type: "Finance",
    tone: kpis.netCash >= 0 ? "good" : "risk",
    title: kpis.netCash >= 0 ? "Cash position is positive" : "Cash position needs attention",
    body: `Paid income is ${formatCurrency(kpis.paidIncome)} and paid expenses are ${formatCurrency(kpis.paidExpenses)}, giving a net position of ${formatCurrency(kpis.netCash)}.`,
    action: kpis.netCash >= 0 ? "Protect margins and keep invoices moving to paid status." : "Review expenses and follow up outstanding invoices immediately.",
  });

  insights.push({
    id: "invoice-collection",
    type: "Invoices",
    tone: kpis.collectionRate >= 85 ? "good" : kpis.collectionRate >= 50 ? "warning" : "risk",
    title: `Invoice collection rate is ${kpis.collectionRate}%`,
    body: `${formatCurrency(kpis.invoicePaid)} has been collected from ${formatCurrency(kpis.invoiceBilled)} billed invoices in the selected period.`,
    action: kpis.collectionRate >= 85 ? "Maintain current payment follow-up discipline." : "Use invoice email actions and payment proof tracking to close outstanding balances.",
  });

  insights.push({
    id: "lead-conversion",
    type: "Pipeline",
    tone: kpis.leadConversionRate >= 60 ? "good" : kpis.leadConversionRate >= 30 ? "warning" : "neutral",
    title: `Lead conversion is ${kpis.leadConversionRate}%`,
    body: `${kpis.wonLeads} out of ${kpis.totalLeads} leads were marked as won during the selected period.`,
    action: "Prioritise reviewed and contacted leads with quote drafts and follow-up notes.",
  });

  insights.push({
    id: "quote-acceptance",
    type: "Quotes",
    tone: kpis.quoteAcceptanceRate >= 65 ? "good" : kpis.quoteAcceptanceRate >= 35 ? "warning" : "neutral",
    title: `Quote acceptance is ${kpis.quoteAcceptanceRate}%`,
    body: `${kpis.acceptedQuotes} accepted quotes from ${kpis.totalQuotes} quote records. Average quote value is ${formatCurrency(kpis.averageQuoteValue)}.`,
    action: "Use quote status management and client-ready emails to move drafts to sent and accepted.",
  });

  insights.push({
    id: "delivery-efficiency",
    type: "Delivery",
    tone: kpis.taskCompletionRate >= 70 ? "good" : kpis.taskCompletionRate >= 35 ? "warning" : "neutral",
    title: `Task completion is ${kpis.taskCompletionRate}%`,
    body: `${kpis.completedTasks} tasks are complete from ${kpis.totalTasks} tracked tasks. Billable time ratio is ${kpis.billableRatio}%.`,
    action: "Move blocked tasks into review/done and log billable delivery hours consistently.",
  });

  insights.push({
    id: "support-load",
    type: "Support",
    tone: kpis.urgentTickets > 0 ? "risk" : "good",
    title: kpis.urgentTickets > 0 ? "Urgent support needs attention" : "Support load is controlled",
    body: `There are ${kpis.openTickets} open tickets, including ${kpis.urgentTickets} urgent ticket(s).`,
    action: kpis.urgentTickets > 0 ? "Open the Tickets tab and resolve urgent items first." : "Keep ticket updates current and close resolved items.",
  });

  insights.push({
    id: "month-growth",
    type: "Growth",
    tone: incomeChange >= 0 && leadChange >= 0 ? "good" : "warning",
    title: "Month-to-month movement",
    body: `Latest month paid income changed by ${formatSignedPercent(incomeChange)} and lead volume changed by ${formatSignedPercent(leadChange)} compared with the previous month.`,
    action: "Use marketing posts, follow-ups and quote activity to stabilise lead flow and collections.",
  });

  insights.push({
    id: "records-health",
    type: "Data",
    tone: dataState.documents.length > 0 ? "good" : "neutral",
    title: "Record keeping health",
    body: `The system currently has ${dataState.clients.length} clients, ${dataState.projects.length} projects, ${dataState.documents.length} document records and ${dataState.timeEntries.length} time entries.`,
    action: "Continue attaching quotes, invoices, proofs and reports to each client/project record.",
  });

  return insights;
}

function buildKpiSummaryText({ kpis, insights, periodRange, monthlyTrend, leadFunnel }) {
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] || {};

  return [
    "MKETICS KPI Growth Insights",
    `Period: ${periodRange.label}`,
    "",
    "Core KPIs:",
    `- Lead conversion: ${kpis.leadConversionRate}% (${kpis.wonLeads}/${kpis.totalLeads})`,
    `- Quote acceptance: ${kpis.quoteAcceptanceRate}% (${kpis.acceptedQuotes}/${kpis.totalQuotes})`,
    `- Invoice collection: ${kpis.collectionRate}% (${formatCurrency(kpis.invoicePaid)} paid of ${formatCurrency(kpis.invoiceBilled)})`,
    `- Net cash: ${formatCurrency(kpis.netCash)}`,
    `- Task completion: ${kpis.taskCompletionRate}%`,
    `- Billable time ratio: ${kpis.billableRatio}%`,
    `- Open support tickets: ${kpis.openTickets} (${kpis.urgentTickets} urgent)`,
    "",
    "Latest Month Snapshot:",
    `- Paid income: ${formatCurrency(latestMonth.paidIncome || 0)}`,
    `- Paid expenses: ${formatCurrency(latestMonth.paidExpenses || 0)}`,
    `- Invoice paid: ${formatCurrency(latestMonth.invoicePaid || 0)}`,
    `- Leads: ${latestMonth.leads || 0}`,
    `- Quotes: ${latestMonth.quotes || 0}`,
    "",
    "Pipeline Funnel:",
    ...leadFunnel.map((item) => `- ${item.label}: ${item.value}`),
    "",
    "Insights:",
    ...insights.map((item) => `- ${item.title}: ${item.action}`),
  ].join("\n");
}

function buildPeriodRange(filters) {
  const selectedMonth = parseMonthInput(filters.month) || new Date();

  if (filters.period === "all") {
    return {
      start: null,
      end: null,
      label: "All records",
    };
  }

  if (filters.period === "year") {
    const start = new Date(selectedMonth.getFullYear(), 0, 1);
    const end = new Date(selectedMonth.getFullYear(), 11, 31, 23, 59, 59, 999);

    return {
      start,
      end,
      label: `${selectedMonth.getFullYear()} year to date`,
    };
  }

  if (filters.period === "quarter") {
    const quarterStartMonth = Math.floor(selectedMonth.getMonth() / 3) * 3;
    const start = new Date(selectedMonth.getFullYear(), quarterStartMonth, 1);
    const end = endOfMonth(selectedMonth);

    return {
      start,
      end,
      label: `Q${Math.floor(selectedMonth.getMonth() / 3) + 1} ${selectedMonth.getFullYear()} to date`,
    };
  }

  return {
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
    label: new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" }).format(selectedMonth),
  };
}

function normaliseFinanceRecords(records) {
  return Array.isArray(records)
    ? records.map((record) => ({
        ...record,
        amount: Number(record.amount) || 0,
        paidAmount: Number(record.paidAmount) || 0,
        transactionDate: record.transactionDate || record.createdAt || new Date().toISOString(),
      }))
    : [];
}

function normaliseInvoices(invoices) {
  return Array.isArray(invoices)
    ? invoices.map((invoice) => ({
        ...invoice,
        amount: Number(invoice.amount) || 0,
        paidAmount: Number(invoice.paidAmount) || 0,
        issueDate: invoice.issueDate || invoice.createdAt || new Date().toISOString(),
        paymentStatus: invoice.paymentStatus || "draft",
      }))
    : [];
}

function normaliseTimeEntries(entries) {
  return Array.isArray(entries)
    ? entries.map((entry) => ({
        ...entry,
        hours: Number(entry.hours) || 0,
        entryDate: entry.entryDate || entry.createdAt || new Date().toISOString(),
      }))
    : [];
}

function normaliseTasks(tasks) {
  return Array.isArray(tasks)
    ? tasks.map((task) => ({
        ...task,
        status: task.status || "todo",
        createdAt: task.createdAt || task.updatedAt || new Date().toISOString(),
      }))
    : [];
}

function isWithinRange(value, range) {
  if (!value) return false;
  if (!range?.start || !range?.end) return true;

  const date = startOfDay(new Date(value));

  if (Number.isNaN(date.getTime())) return false;

  return date >= startOfDay(range.start) && date <= endOfDay(range.end);
}

function isActiveProjectStatus(status) {
  return !["completed", "cancelled", "archived"].includes(normaliseStatus(status));
}

function normaliseStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getRateTone(value, warningThreshold, goodThreshold) {
  if (value >= goodThreshold) return "good";
  if (value >= warningThreshold) return "warning";
  return "neutral";
}

function calculateRate(value, total) {
  const safeValue = Number(value) || 0;
  const safeTotal = Number(total) || 0;

  if (!safeTotal) return 0;

  return Math.round((safeValue / safeTotal) * 100);
}

function calculatePercentageChange(current, previous) {
  const safeCurrent = Number(current) || 0;
  const safePrevious = Number(previous) || 0;

  if (!safePrevious && !safeCurrent) return 0;
  if (!safePrevious) return 100;

  return Math.round(((safeCurrent - safePrevious) / safePrevious) * 100);
}

function sumAmounts(items, key) {
  return items.reduce((total, item) => total + (Number(item?.[key]) || 0), 0);
}

function roundHours(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function parseMonthInput(value) {
  if (!value) return null;

  const [year, month] = value.split("-").map(Number);

  if (!year || !month) return null;

  return new Date(year, month - 1, 1);
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentMonthInputValue() {
  const today = new Date();

  return getMonthKey(today);
}

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(Number(amount) || 0);
}

function formatSignedPercent(value) {
  const safeValue = Number(value) || 0;

  return `${safeValue >= 0 ? "+" : ""}${safeValue}%`;
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
