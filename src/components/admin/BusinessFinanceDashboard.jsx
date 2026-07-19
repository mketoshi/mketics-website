import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const financeSettingKey = "business_finance_records_v1";

const transactionTypes = ["income", "expense"];

const incomeCategories = [
  "Website Project",
  "System Development",
  "IT Support",
  "Digital Marketing",
  "Business Registration",
  "Consultation",
  "Maintenance",
  "Other Income",
];

const expenseCategories = [
  "Hosting & Domains",
  "Software Tools",
  "Transport",
  "Airtime & Data",
  "Equipment",
  "Marketing",
  "Bank Charges",
  "Other Expense",
];

const paymentStatusOptions = ["pending", "partial", "paid", "overdue", "cancelled"];
const paymentMethodOptions = ["Not Set", "EFT", "Cash", "Card", "Mobile Money", "Other"];

export default function BusinessFinanceDashboard({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    records: [],
    clients: [],
    projects: [],
    quotes: [],
  });

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
  });

  const [form, setForm] = useState({
    transactionType: "income",
    title: "",
    clientId: "",
    projectId: "",
    quoteId: "",
    amount: "",
    paidAmount: "",
    transactionDate: getTodayInputValue(),
    dueDate: "",
    category: "Website Project",
    paymentStatus: "pending",
    paymentMethod: "Not Set",
    reference: "",
    notes: "",
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchFinanceData();
    }
  }, [isActive]);

  useEffect(() => {
    const categories = form.transactionType === "income" ? incomeCategories : expenseCategories;

    if (!categories.includes(form.category)) {
      setForm((current) => ({
        ...current,
        category: categories[0],
      }));
    }
  }, [form.transactionType, form.category]);

  const visibleRecords = useMemo(() => {
    return dataState.records.filter((record) => {
      const matchesType = filters.type === "all" || record.transactionType === filters.type;
      const matchesStatus = filters.status === "all" || record.paymentStatus === filters.status;
      const client = dataState.clients.find((item) => item.id === record.clientId);
      const project = dataState.projects.find((item) => item.id === record.projectId);
      const quote = dataState.quotes.find((item) => item.id === record.quoteId);

      const searchableText = [
        record.title,
        record.category,
        record.paymentStatus,
        record.paymentMethod,
        record.reference,
        record.notes,
        client?.full_name,
        client?.organisation,
        project?.title,
        quote?.quote_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !filters.search.trim() || searchableText.includes(filters.search.trim().toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [dataState.clients, dataState.projects, dataState.quotes, dataState.records, filters]);

  const availableQuotes = useMemo(() => {
    return dataState.quotes.filter((quote) => {
      if (form.projectId && quote.project_id && quote.project_id !== form.projectId) return false;
      if (form.clientId && quote.client_id && quote.client_id !== form.clientId) return false;
      return true;
    });
  }, [dataState.quotes, form.clientId, form.projectId]);

  const financeStats = useMemo(() => {
    const income = dataState.records.filter((record) => record.transactionType === "income");
    const expenses = dataState.records.filter((record) => record.transactionType === "expense");
    const thisMonthStart = startOfMonth(new Date());

    const totalIncome = sumAmounts(income, "amount");
    const paidIncome = sumAmounts(income, "paidAmount");
    const totalExpenses = sumAmounts(expenses, "amount");
    const paidExpenses = sumAmounts(expenses, "paidAmount");
    const outstandingIncome = Math.max(totalIncome - paidIncome, 0);
    const netCash = paidIncome - paidExpenses;
    const thisMonthIncome = sumAmounts(
      income.filter((record) => startOfDay(new Date(record.transactionDate)) >= thisMonthStart),
      "paidAmount"
    );
    const overdue = income.filter((record) => isOverdue(record)).length;

    return {
      totalIncome,
      paidIncome,
      outstandingIncome,
      totalExpenses,
      paidExpenses,
      netCash,
      thisMonthIncome,
      overdue,
    };
  }, [dataState.records]);

  async function fetchFinanceData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));

      const [financeResponse, clientsResponse, projectsResponse, quotesResponse] = await Promise.all([
        supabase.from("settings").select("setting_value").eq("setting_key", financeSettingKey).maybeSingle(),
        supabase.from("clients").select("id, full_name, email, phone, organisation, created_at, updated_at").order("updated_at", { ascending: false }),
        supabase.from("projects").select("id, client_id, title, service_type, status, start_date, due_date, created_at, updated_at").order("updated_at", { ascending: false }),
        supabase.from("quotes").select("id, lead_id, client_id, project_id, quote_number, title, amount, currency, status, valid_until, created_at").order("created_at", { ascending: false }),
      ]);

      const firstError = financeResponse.error || clientsResponse.error || projectsResponse.error || quotesResponse.error;
      if (firstError) throw firstError;

      const records = normaliseFinanceRecords(financeResponse.data?.setting_value?.records || []);

      setDataState({
        loading: false,
        error: "",
        records,
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
        quotes: quotesResponse.data || [],
      });
    } catch (error) {
      setDataState({
        loading: false,
        error: error?.message || "Unable to load finance records. Check Supabase finance permissions.",
        records: [],
        clients: [],
        projects: [],
        quotes: [],
      });
    }
  }

  async function saveFinanceRecords(nextRecords) {
    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: financeSettingKey,
        setting_value: { records: nextRecords },
        description: "MKETICS finance, income, expense and payment tracking records.",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;
  }

  async function handleAddRecord(event) {
    event.preventDefault();

    if (!supabase) return;

    const amount = parseMoney(form.amount);
    const paidAmount = parseMoney(form.paidAmount);

    if (!form.title.trim()) {
      setSaveState({ loading: false, error: "Enter a transaction title.", success: "" });
      return;
    }

    if (!amount || amount <= 0) {
      setSaveState({ loading: false, error: "Enter a valid amount greater than zero.", success: "" });
      return;
    }

    if (paidAmount > amount) {
      setSaveState({ loading: false, error: "Paid amount cannot be greater than the total amount.", success: "" });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const now = new Date().toISOString();
      const nextRecord = {
        id: createId(),
        transactionType: form.transactionType,
        title: form.title.trim(),
        clientId: form.clientId || "",
        projectId: form.projectId || "",
        quoteId: form.quoteId || "",
        amount,
        paidAmount,
        transactionDate: form.transactionDate || getTodayInputValue(),
        dueDate: form.dueDate || "",
        category: form.category,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        reference: form.reference.trim(),
        notes: form.notes.trim(),
        createdAt: now,
        updatedAt: now,
      };

      const nextRecords = [nextRecord, ...dataState.records];
      await saveFinanceRecords(nextRecords);

      setDataState((current) => ({ ...current, records: nextRecords }));
      setForm((current) => ({
        ...current,
        title: "",
        amount: "",
        paidAmount: "",
        dueDate: "",
        reference: "",
        notes: "",
      }));
      setSaveState({ loading: false, error: "", success: "Finance record saved successfully." });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to save finance record. Check Supabase settings permissions.",
        success: "",
      });
    }
  }

  async function handleMarkPaid(recordId) {
    if (!supabase || !recordId) return;

    try {
      setSaveState({ loading: true, error: "", success: "" });
      const nextRecords = dataState.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              paidAmount: record.amount,
              paymentStatus: "paid",
              paymentMethod: record.paymentMethod || "EFT",
              updatedAt: new Date().toISOString(),
            }
          : record
      );

      await saveFinanceRecords(nextRecords);
      setDataState((current) => ({ ...current, records: nextRecords }));
      setSaveState({ loading: false, error: "", success: "Finance record marked as paid." });
    } catch (error) {
      setSaveState({ loading: false, error: error?.message || "Unable to update finance record.", success: "" });
    }
  }

  async function handleDeleteRecord(recordId) {
    if (!supabase || !recordId) return;

    const confirmed = window.confirm("Delete this finance record from MKETICS finance tracking?");
    if (!confirmed) return;

    try {
      setSaveState({ loading: true, error: "", success: "" });
      const nextRecords = dataState.records.filter((record) => record.id !== recordId);
      await saveFinanceRecords(nextRecords);
      setDataState((current) => ({ ...current, records: nextRecords }));
      setSaveState({ loading: false, error: "", success: "Finance record deleted." });
    } catch (error) {
      setSaveState({ loading: false, error: error?.message || "Unable to delete finance record.", success: "" });
    }
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "transactionType"
        ? {
            category: value === "income" ? incomeCategories[0] : expenseCategories[0],
            paymentStatus: value === "expense" ? "paid" : current.paymentStatus,
          }
        : {}),
      ...(name === "quoteId" ? deriveFromQuote(value, dataState.quotes, dataState.projects) : {}),
      ...(name === "projectId" ? { quoteId: "" } : {}),
    }));

    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function copyFinanceSummary() {
    const summary = buildFinanceSummaryText({ stats: financeStats, records: visibleRecords, dataState });
    await navigator.clipboard.writeText(summary);
    setSaveState({ loading: false, error: "", success: "Finance summary copied to clipboard." });
  }

  function fillFromQuote(quoteId) {
    setForm((current) => ({
      ...current,
      quoteId,
      transactionType: "income",
      ...deriveFromQuote(quoteId, dataState.quotes, dataState.projects),
    }));
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">MKETICS Finance</p>
            <h2 className="mt-2 text-3xl font-black text-[#020B1F]">Business Finance Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Track income, paid amounts, outstanding payments, expenses and basic cash position from MKETICS projects and quotes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchFinanceData}
              disabled={dataState.loading}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
            >
              {dataState.loading ? <Loader2 size={17} className="mr-2 animate-spin" /> : <RefreshCw size={17} className="mr-2" />}
              Refresh
            </button>

            <button
              type="button"
              onClick={copyFinanceSummary}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy Summary
            </button>
          </div>
        </div>

        {dataState.error && <StatusMessage type="error" message={dataState.error} />}
        {saveState.error && <StatusMessage type="error" message={saveState.error} />}
        {saveState.success && <StatusMessage type="success" message={saveState.success} />}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard label="Paid Income" value={formatCurrency(financeStats.paidIncome)} />
        <FinanceStatCard label="Outstanding" value={formatCurrency(financeStats.outstandingIncome)} />
        <FinanceStatCard label="Expenses Paid" value={formatCurrency(financeStats.paidExpenses)} />
        <FinanceStatCard label="Net Cash" value={formatCurrency(financeStats.netCash)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard label="Total Income" value={formatCurrency(financeStats.totalIncome)} />
        <FinanceStatCard label="This Month Income" value={formatCurrency(financeStats.thisMonthIncome)} />
        <FinanceStatCard label="Total Expenses" value={formatCurrency(financeStats.totalExpenses)} />
        <FinanceStatCard label="Overdue Income" value={financeStats.overdue} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleAddRecord} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Plus size={22} />
          </div>

          <h3 className="mt-4 text-2xl font-black text-[#020B1F]">Add finance record</h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            Add income from quotes/projects or record MKETICS business expenses.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Type" name="transactionType" value={form.transactionType} onChange={handleFieldChange} options={transactionTypes} />
              <SelectField
                label="Category"
                name="category"
                value={form.category}
                onChange={handleFieldChange}
                options={form.transactionType === "income" ? incomeCategories : expenseCategories}
              />
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleFieldChange}
                placeholder="Example: Website deposit payment"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Amount</span>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleFieldChange}
                  inputMode="decimal"
                  placeholder="2500"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Paid Amount</span>
                <input
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleFieldChange}
                  inputMode="decimal"
                  placeholder="0"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Transaction Date</span>
                <input
                  type="date"
                  name="transactionDate"
                  value={form.transactionDate}
                  onChange={handleFieldChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Due Date</span>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleFieldChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Payment Status" name="paymentStatus" value={form.paymentStatus} onChange={handleFieldChange} options={paymentStatusOptions} />
              <SelectField label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleFieldChange} options={paymentMethodOptions} />
            </div>

            <SelectField label="Client" name="clientId" value={form.clientId} onChange={handleFieldChange} options={["", ...dataState.clients.map((client) => client.id)]} getLabel={(value) => value ? getClientName(dataState.clients.find((client) => client.id === value)) : "No client linked"} />
            <SelectField label="Project" name="projectId" value={form.projectId} onChange={handleFieldChange} options={["", ...dataState.projects.map((project) => project.id)]} getLabel={(value) => value ? dataState.projects.find((project) => project.id === value)?.title || "Project" : "No project linked"} />
            <SelectField label="Quote" name="quoteId" value={form.quoteId} onChange={handleFieldChange} options={["", ...availableQuotes.map((quote) => quote.id)]} getLabel={(value) => value ? getQuoteLabel(dataState.quotes.find((quote) => quote.id === value)) : "No quote linked"} />

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Reference</span>
              <input
                name="reference"
                value={form.reference}
                onChange={handleFieldChange}
                placeholder="Invoice, proof of payment or bank reference"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFieldChange}
                rows={5}
                placeholder="Example: 50% deposit received. Balance due after delivery."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="submit"
              disabled={saveState.loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState.loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
              Save Finance Record
            </button>
          </div>
        </form>

        <div className="grid gap-6 content-start">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-[#020B1F]">Finance records</h3>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                  Search payments, outstanding balances, income and expenses.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <label className="relative block">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search finance records..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <select name="type" value={filters.type} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100">
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>

              <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100">
                <option value="all">All statuses</option>
                {paymentStatusOptions.map((status) => (
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
                      <Th>Title</Th>
                      <Th>Link</Th>
                      <Th>Type</Th>
                      <Th>Amount</Th>
                      <Th>Paid</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataState.loading && (
                      <tr>
                        <td colSpan="8" className="px-5 py-10 text-center">
                          <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">Loading finance records...</p>
                        </td>
                      </tr>
                    )}

                    {!dataState.loading && visibleRecords.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-5 py-10 text-center">
                          <WalletCards className="mx-auto text-slate-400" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">No finance records found.</p>
                        </td>
                      </tr>
                    )}

                    {!dataState.loading && visibleRecords.map((record) => (
                      <FinanceRecordRow
                        key={record.id}
                        record={record}
                        clients={dataState.clients}
                        projects={dataState.projects}
                        quotes={dataState.quotes}
                        onMarkPaid={() => handleMarkPaid(record.id)}
                        onDelete={() => handleDeleteRecord(record.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <FileText size={22} />
            </div>
            <h3 className="mt-4 text-xl font-black text-[#020B1F]">Quick income from quotes</h3>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              Use accepted or sent quotes to quickly prepare income records.
            </p>

            <div className="mt-5 grid gap-3">
              {dataState.quotes.slice(0, 6).map((quote) => (
                <button
                  type="button"
                  key={quote.id}
                  onClick={() => fillFromQuote(quote.id)}
                  className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <p className="text-sm font-black text-[#020B1F]">{quote.quote_number || "Quote"}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{quote.title}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                    {formatCurrency(quote.amount, quote.currency)} • {toReadableLabel(quote.status)}
                  </p>
                </button>
              ))}

              {dataState.quotes.length === 0 && (
                <p className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-bold leading-6 text-slate-600">
                  No quotes are available yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function FinanceRecordRow({ record, clients, projects, quotes, onMarkPaid, onDelete }) {
  const client = clients.find((item) => item.id === record.clientId);
  const project = projects.find((item) => item.id === record.projectId);
  const quote = quotes.find((item) => item.id === record.quoteId);
  const balance = Math.max(Number(record.amount || 0) - Number(record.paidAmount || 0), 0);

  return (
    <tr className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]">
      <Td>
        <p className="font-black text-[#061A33]">{formatDate(record.transactionDate)}</p>
        {record.dueDate && <p className="mt-1 text-xs font-semibold text-slate-500">Due {formatDate(record.dueDate)}</p>}
      </Td>
      <Td>
        <p className="font-black text-[#020B1F]">{record.title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{record.category}</p>
        {record.reference && <p className="mt-1 text-xs font-semibold text-slate-500">Ref: {record.reference}</p>}
      </Td>
      <Td>
        <p className="font-semibold text-slate-700">{getClientName(client) || "No client"}</p>
        {project && <p className="mt-1 text-xs font-semibold text-slate-500">{project.title}</p>}
        {quote && <p className="mt-1 text-xs font-black text-[#0B7CFF]">{quote.quote_number}</p>}
      </Td>
      <Td>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${record.transactionType === "income" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
          {toReadableLabel(record.transactionType)}
        </span>
      </Td>
      <Td>
        <p className="font-black text-[#061A33]">{formatCurrency(record.amount)}</p>
        {balance > 0 && <p className="mt-1 text-xs font-black text-red-600">Balance {formatCurrency(balance)}</p>}
      </Td>
      <Td>
        <p>{formatCurrency(record.paidAmount)}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{record.paymentMethod}</p>
      </Td>
      <Td>
        <StatusBadge status={record.paymentStatus} />
      </Td>
      <Td>
        <div className="flex flex-wrap gap-2">
          {record.paymentStatus !== "paid" && (
            <button type="button" onClick={onMarkPaid} className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100">
              <CheckCircle2 size={14} className="mr-1" /> Paid
            </button>
          )}
          <button type="button" onClick={onDelete} className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100">
            <Trash2 size={14} className="mr-1" /> Delete
          </button>
        </div>
      </Td>
    </tr>
  );
}

function FinanceStatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EAF6FF] text-[#0B7CFF]">
          <Banknote size={19} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
    </article>
  );
}

function SelectField({ label, name, value, onChange, options, getLabel }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {getLabel ? getLabel(option) : toReadableLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
      {toReadableLabel(status)}
    </span>
  );
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

function deriveFromQuote(quoteId, quotes, projects) {
  const quote = quotes.find((item) => item.id === quoteId);
  if (!quote) return {};

  const linkedProject = projects.find((project) => project.id === quote.project_id);

  return {
    title: quote.title || "Quote income",
    amount: quote.amount ? String(quote.amount) : "",
    paidAmount: "",
    clientId: quote.client_id || linkedProject?.client_id || "",
    projectId: quote.project_id || "",
    category: "Website Project",
    paymentStatus: quote.status === "accepted" ? "pending" : "pending",
    reference: quote.quote_number || "",
    notes: `Income record prepared from quote ${quote.quote_number || quote.title || ""}.`,
  };
}

function normaliseFinanceRecords(records) {
  if (!Array.isArray(records)) return [];

  return records
    .filter((record) => record && record.id)
    .map((record) => ({
      id: record.id,
      transactionType: transactionTypes.includes(record.transactionType) ? record.transactionType : "income",
      title: record.title || "Finance Record",
      clientId: record.clientId || "",
      projectId: record.projectId || "",
      quoteId: record.quoteId || "",
      amount: Number(record.amount || 0),
      paidAmount: Number(record.paidAmount || 0),
      transactionDate: record.transactionDate || getTodayInputValue(),
      dueDate: record.dueDate || "",
      category: record.category || "Other Income",
      paymentStatus: paymentStatusOptions.includes(record.paymentStatus) ? record.paymentStatus : "pending",
      paymentMethod: record.paymentMethod || "Not Set",
      reference: record.reference || "",
      notes: record.notes || "",
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
}

function buildFinanceSummaryText({ stats, records, dataState }) {
  const lines = [
    "MKETICS Finance Summary",
    "=======================",
    `Paid Income: ${formatCurrency(stats.paidIncome)}`,
    `Outstanding Income: ${formatCurrency(stats.outstandingIncome)}`,
    `Paid Expenses: ${formatCurrency(stats.paidExpenses)}`,
    `Net Cash: ${formatCurrency(stats.netCash)}`,
    `This Month Income: ${formatCurrency(stats.thisMonthIncome)}`,
    "",
    "Visible Records:",
  ];

  records.slice(0, 20).forEach((record) => {
    const client = dataState.clients.find((item) => item.id === record.clientId);
    lines.push(
      `- ${formatDate(record.transactionDate)} | ${toReadableLabel(record.transactionType)} | ${record.title} | ${formatCurrency(record.amount)} | Paid ${formatCurrency(record.paidAmount)} | ${toReadableLabel(record.paymentStatus)} | ${getClientName(client) || "No client"}`
    );
  });

  return lines.join("\n");
}

function sumAmounts(records, key) {
  return records.reduce((total, record) => total + Number(record[key] || 0), 0);
}

function parseMoney(value) {
  if (!value) return 0;
  const parsed = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isOverdue(record) {
  if (record.transactionType !== "income") return false;
  if (record.paymentStatus === "paid" || record.paymentStatus === "cancelled") return false;
  if (!record.dueDate) return false;
  return startOfDay(new Date(record.dueDate)) < startOfDay(new Date());
}

function getClientName(client) {
  if (!client) return "";
  return client.organisation || client.full_name || client.email || "Client";
}

function getQuoteLabel(quote) {
  if (!quote) return "Quote";
  return `${quote.quote_number || quote.title || "Quote"} - ${formatCurrency(quote.amount, quote.currency)}`;
}

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function createId() {
  return `finance-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toReadableLabel(value) {
  if (!value) return "Not provided";
  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
