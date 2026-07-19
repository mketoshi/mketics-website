import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Eye,
  FileText,
  Loader2,
  Mail,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const invoiceSettingKey = "business_invoice_records_v1";
const financeSettingKey = "business_finance_records_v1";

const invoiceStatusOptions = ["draft", "sent", "partial", "paid", "overdue", "cancelled"];
const paymentMethodOptions = ["Not Set", "EFT", "Cash", "Card", "Mobile Money", "Other"];

const defaultInvoiceTerms = [
  "Payment is due on or before the invoice due date unless otherwise agreed in writing.",
  "Work may begin after the agreed deposit or payment confirmation has been received.",
  "Additional scope, third-party costs or urgent changes may be quoted separately.",
  "All payments must be made to the official MKETICS (PTY) LTD business account only.",
].join("\n");

export default function BusinessInvoicesDashboard({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    invoices: [],
    clients: [],
    projects: [],
    quotes: [],
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const [form, setForm] = useState(() => buildDefaultInvoiceForm());
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paidAmount: "",
    paymentStatus: "sent",
    paymentMethod: "EFT",
    paymentDate: getTodayInputValue(),
    paymentNotes: "",
    syncFinance: true,
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const selectedInvoice = useMemo(() => {
    return dataState.invoices.find((invoice) => invoice.id === selectedInvoiceId) || null;
  }, [dataState.invoices, selectedInvoiceId]);

  const visibleInvoices = useMemo(() => {
    return dataState.invoices.filter((invoice) => {
      const status = getInvoiceDisplayStatus(invoice);
      const matchesStatus = filters.status === "all" || status === filters.status;
      const client = dataState.clients.find((item) => item.id === invoice.clientId);
      const project = dataState.projects.find((item) => item.id === invoice.projectId);
      const quote = dataState.quotes.find((item) => item.id === invoice.quoteId);

      const searchableText = [
        invoice.invoiceNumber,
        invoice.title,
        invoice.paymentStatus,
        invoice.paymentMethod,
        invoice.reference,
        invoice.notes,
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

      return matchesStatus && matchesSearch;
    });
  }, [dataState.clients, dataState.invoices, dataState.projects, dataState.quotes, filters]);

  const invoiceStats = useMemo(() => {
    const totalBilled = sumAmounts(dataState.invoices, "amount");
    const totalPaid = sumAmounts(dataState.invoices, "paidAmount");
    const outstanding = Math.max(totalBilled - totalPaid, 0);
    const overdue = dataState.invoices.filter((invoice) => getInvoiceDisplayStatus(invoice) === "overdue").length;
    const sent = dataState.invoices.filter((invoice) => getInvoiceDisplayStatus(invoice) === "sent").length;
    const paid = dataState.invoices.filter((invoice) => getInvoiceDisplayStatus(invoice) === "paid").length;

    return { totalBilled, totalPaid, outstanding, overdue, sent, paid };
  }, [dataState.invoices]);

  useEffect(() => {
    if (isActive) {
      fetchInvoiceData();
    }
  }, [isActive]);

  useEffect(() => {
    if (!selectedInvoice) return;

    setPaymentForm({
      paidAmount: selectedInvoice.paidAmount ? String(selectedInvoice.paidAmount) : "",
      paymentStatus: getInvoiceDisplayStatus(selectedInvoice),
      paymentMethod: selectedInvoice.paymentMethod || "EFT",
      paymentDate: selectedInvoice.paymentDate || getTodayInputValue(),
      paymentNotes: selectedInvoice.paymentNotes || "",
      syncFinance: true,
    });
  }, [selectedInvoiceId]);

  async function fetchInvoiceData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));

      const [invoiceResponse, clientsResponse, projectsResponse, quotesResponse] = await Promise.all([
        supabase.from("settings").select("setting_value").eq("setting_key", invoiceSettingKey).maybeSingle(),
        supabase.from("clients").select("id, full_name, email, phone, organisation, created_at, updated_at").order("updated_at", { ascending: false }),
        supabase.from("projects").select("id, client_id, title, service_type, status, start_date, due_date, created_at, updated_at").order("updated_at", { ascending: false }),
        supabase.from("quotes").select("id, lead_id, client_id, project_id, quote_number, title, amount, currency, status, valid_until, created_at").order("created_at", { ascending: false }),
      ]);

      const firstError = invoiceResponse.error || clientsResponse.error || projectsResponse.error || quotesResponse.error;
      if (firstError) throw firstError;

      setDataState({
        loading: false,
        error: "",
        invoices: normaliseInvoices(invoiceResponse.data?.setting_value?.invoices || []),
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
        quotes: quotesResponse.data || [],
      });
    } catch (error) {
      setDataState({
        loading: false,
        error: error?.message || "Unable to load invoice records. Check Supabase invoice permissions.",
        invoices: [],
        clients: [],
        projects: [],
        quotes: [],
      });
    }
  }

  async function saveInvoiceRecords(nextInvoices) {
    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: invoiceSettingKey,
        setting_value: { invoices: nextInvoices },
        description: "MKETICS invoice builder, invoice status and payment tracking records.",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;
  }

  async function handleCreateInvoice(event) {
    event.preventDefault();

    if (!supabase) return;

    const amount = parseMoney(form.amount);
    const paidAmount = parseMoney(form.paidAmount);

    if (!form.title.trim()) {
      setSaveState({ loading: false, error: "Enter an invoice title.", success: "" });
      return;
    }

    if (!amount || amount <= 0) {
      setSaveState({ loading: false, error: "Enter a valid invoice amount greater than zero.", success: "" });
      return;
    }

    if (paidAmount > amount) {
      setSaveState({ loading: false, error: "Paid amount cannot be greater than invoice amount.", success: "" });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const now = new Date().toISOString();
      const nextInvoice = {
        id: createId(),
        invoiceNumber: form.invoiceNumber.trim() || generateInvoiceNumber(),
        title: form.title.trim(),
        clientId: form.clientId || "",
        projectId: form.projectId || "",
        quoteId: form.quoteId || "",
        amount,
        paidAmount,
        currency: "ZAR",
        issueDate: form.issueDate || getTodayInputValue(),
        dueDate: form.dueDate || "",
        paymentStatus: normalisePaymentStatus(form.paymentStatus, amount, paidAmount, form.dueDate),
        paymentMethod: form.paymentMethod || "Not Set",
        paymentDate: paidAmount > 0 ? getTodayInputValue() : "",
        lineItems: form.lineItems.trim(),
        terms: form.terms.trim(),
        reference: form.reference.trim(),
        notes: form.notes.trim(),
        sentAt: form.paymentStatus === "sent" ? now : "",
        paidAt: paidAmount >= amount ? now : "",
        createdAt: now,
        updatedAt: now,
      };

      const nextInvoices = [nextInvoice, ...dataState.invoices];
      await saveInvoiceRecords(nextInvoices);

      if (paidAmount > 0) {
        await upsertInvoiceFinanceRecord(nextInvoice);
      }

      setDataState((current) => ({ ...current, invoices: nextInvoices }));
      setSelectedInvoiceId(nextInvoice.id);
      setForm(buildDefaultInvoiceForm());
      setSaveState({ loading: false, error: "", success: "Invoice created successfully." });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to create invoice. Check Supabase settings permissions.",
        success: "",
      });
    }
  }

  async function handleUpdatePayment(event) {
    event.preventDefault();

    if (!supabase || !selectedInvoice) return;

    const amount = Number(selectedInvoice.amount) || 0;
    const paidAmount = parseMoney(paymentForm.paidAmount);

    if (paidAmount > amount) {
      setSaveState({ loading: false, error: "Paid amount cannot be greater than invoice amount.", success: "" });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const now = new Date().toISOString();
      const updatedInvoice = {
        ...selectedInvoice,
        paidAmount,
        paymentStatus: normalisePaymentStatus(paymentForm.paymentStatus, amount, paidAmount, selectedInvoice.dueDate),
        paymentMethod: paymentForm.paymentMethod || "Not Set",
        paymentDate: paidAmount > 0 ? paymentForm.paymentDate || getTodayInputValue() : "",
        paymentNotes: paymentForm.paymentNotes.trim(),
        paidAt: paidAmount >= amount ? selectedInvoice.paidAt || now : "",
        sentAt: selectedInvoice.sentAt || (paymentForm.paymentStatus === "sent" ? now : ""),
        updatedAt: now,
      };

      const nextInvoices = dataState.invoices.map((invoice) =>
        invoice.id === selectedInvoice.id ? updatedInvoice : invoice
      );

      await saveInvoiceRecords(nextInvoices);

      if (paymentForm.syncFinance && paidAmount > 0) {
        await upsertInvoiceFinanceRecord(updatedInvoice);
      }

      setDataState((current) => ({ ...current, invoices: nextInvoices }));
      setSaveState({ loading: false, error: "", success: "Invoice payment updated successfully." });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to update invoice payment.",
        success: "",
      });
    }
  }

  async function handleMarkInvoicePaid(invoiceId) {
    const invoice = dataState.invoices.find((item) => item.id === invoiceId);
    if (!invoice || !supabase) return;

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const now = new Date().toISOString();
      const updatedInvoice = {
        ...invoice,
        paidAmount: Number(invoice.amount) || 0,
        paymentStatus: "paid",
        paymentMethod: invoice.paymentMethod || "EFT",
        paymentDate: getTodayInputValue(),
        paidAt: invoice.paidAt || now,
        updatedAt: now,
      };

      const nextInvoices = dataState.invoices.map((item) => (item.id === invoice.id ? updatedInvoice : item));
      await saveInvoiceRecords(nextInvoices);
      await upsertInvoiceFinanceRecord(updatedInvoice);

      setDataState((current) => ({ ...current, invoices: nextInvoices }));
      setSaveState({ loading: false, error: "", success: "Invoice marked as paid and synced to finance records." });
    } catch (error) {
      setSaveState({ loading: false, error: error?.message || "Unable to mark invoice as paid.", success: "" });
    }
  }

  async function handleDeleteInvoice(invoiceId) {
    if (!supabase || !invoiceId) return;

    const confirmed = window.confirm("Delete this invoice record from MKETICS invoice tracking?");
    if (!confirmed) return;

    try {
      setSaveState({ loading: true, error: "", success: "" });
      const nextInvoices = dataState.invoices.filter((invoice) => invoice.id !== invoiceId);
      await saveInvoiceRecords(nextInvoices);
      await removeInvoiceFinanceRecord(invoiceId);
      setDataState((current) => ({ ...current, invoices: nextInvoices }));
      if (selectedInvoiceId === invoiceId) setSelectedInvoiceId(null);
      setSaveState({ loading: false, error: "", success: "Invoice deleted." });
    } catch (error) {
      setSaveState({ loading: false, error: error?.message || "Unable to delete invoice.", success: "" });
    }
  }

  async function upsertInvoiceFinanceRecord(invoice) {
    if (!supabase || !invoice?.id) return;

    const { data, error } = await supabase
      .from("settings")
      .select("setting_value")
      .eq("setting_key", financeSettingKey)
      .maybeSingle();

    if (error) throw error;

    const currentRecords = Array.isArray(data?.setting_value?.records) ? data.setting_value.records : [];
    const now = new Date().toISOString();
    const financeId = `invoice-${invoice.id}`;
    const client = dataState.clients.find((item) => item.id === invoice.clientId);
    const project = dataState.projects.find((item) => item.id === invoice.projectId);

    const financeRecord = {
      id: financeId,
      transactionType: "income",
      title: `Invoice ${invoice.invoiceNumber} - ${invoice.title}`,
      clientId: invoice.clientId || "",
      projectId: invoice.projectId || "",
      quoteId: invoice.quoteId || "",
      amount: Number(invoice.amount) || 0,
      paidAmount: Number(invoice.paidAmount) || 0,
      transactionDate: invoice.issueDate || getTodayInputValue(),
      dueDate: invoice.dueDate || "",
      category: project?.service_type || "Invoice Payment",
      paymentStatus: mapInvoiceStatusToFinanceStatus(getInvoiceDisplayStatus(invoice)),
      paymentMethod: invoice.paymentMethod || "EFT",
      reference: invoice.invoiceNumber || "",
      notes: [
        `Auto-synced from MKETICS invoice ${invoice.invoiceNumber}.`,
        client ? `Client: ${getClientName(client)}` : "",
        invoice.paymentNotes || invoice.notes || "",
      ]
        .filter(Boolean)
        .join("\n"),
      createdAt: currentRecords.find((record) => record.id === financeId)?.createdAt || now,
      updatedAt: now,
    };

    const nextRecords = [financeRecord, ...currentRecords.filter((record) => record.id !== financeId)];

    const { error: upsertError } = await supabase.from("settings").upsert(
      {
        setting_key: financeSettingKey,
        setting_value: { records: nextRecords },
        description: "MKETICS finance, income, expense and payment tracking records.",
      },
      { onConflict: "setting_key" }
    );

    if (upsertError) throw upsertError;
  }

  async function removeInvoiceFinanceRecord(invoiceId) {
    const { data, error } = await supabase
      .from("settings")
      .select("setting_value")
      .eq("setting_key", financeSettingKey)
      .maybeSingle();

    if (error) throw error;

    const currentRecords = Array.isArray(data?.setting_value?.records) ? data.setting_value.records : [];
    const nextRecords = currentRecords.filter((record) => record.id !== `invoice-${invoiceId}`);

    const { error: upsertError } = await supabase.from("settings").upsert(
      {
        setting_key: financeSettingKey,
        setting_value: { records: nextRecords },
        description: "MKETICS finance, income, expense and payment tracking records.",
      },
      { onConflict: "setting_key" }
    );

    if (upsertError) throw upsertError;
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "quoteId" ? deriveFromQuote(value, dataState.quotes, dataState.clients, dataState.projects) : {}),
      ...(name === "projectId" ? { quoteId: current.quoteId } : {}),
    }));

    clearStatusMessage();
  }

  function handlePaymentChange(event) {
    const { name, value, checked, type } = event.target;

    setPaymentForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    clearStatusMessage();
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearStatusMessage() {
    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  function fillFromQuote(quoteId) {
    setForm((current) => ({
      ...current,
      quoteId,
      ...deriveFromQuote(quoteId, dataState.quotes, dataState.clients, dataState.projects),
    }));
  }

  async function copyInvoiceSummary() {
    await navigator.clipboard.writeText(
      buildInvoiceSummaryText({ invoices: visibleInvoices, dataState, stats: invoiceStats })
    );
    setSaveState({ loading: false, error: "", success: "Invoice summary copied to clipboard." });
  }

  async function copyInvoiceEmail(invoice) {
    await navigator.clipboard.writeText(buildInvoiceEmail(invoice, dataState));
    setSaveState({ loading: false, error: "", success: "Client-ready invoice email copied." });
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">MKETICS Invoices</p>
            <h2 className="mt-2 text-3xl font-black text-[#020B1F]">Invoice Builder & Payment Tracking</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Create client-ready invoices from quotes, track paid amounts, manage outstanding balances and sync payments into the finance dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchInvoiceData}
              disabled={dataState.loading}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
            >
              {dataState.loading ? <Loader2 size={17} className="mr-2 animate-spin" /> : <RefreshCw size={17} className="mr-2" />}
              Refresh
            </button>

            <button
              type="button"
              onClick={copyInvoiceSummary}
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <InvoiceStatCard label="Total Billed" value={formatCurrency(invoiceStats.totalBilled)} />
        <InvoiceStatCard label="Paid" value={formatCurrency(invoiceStats.totalPaid)} />
        <InvoiceStatCard label="Outstanding" value={formatCurrency(invoiceStats.outstanding)} />
        <InvoiceStatCard label="Sent" value={invoiceStats.sent} />
        <InvoiceStatCard label="Paid Invoices" value={invoiceStats.paid} />
        <InvoiceStatCard label="Overdue" value={invoiceStats.overdue} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleCreateInvoice} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Plus size={22} />
          </div>

          <h3 className="mt-4 text-2xl font-black text-[#020B1F]">Create invoice</h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            Build an invoice manually or from an accepted quote/project record.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Invoice Number" name="invoiceNumber" value={form.invoiceNumber} onChange={handleFormChange} />
              <SelectField label="Status" name="paymentStatus" value={form.paymentStatus} onChange={handleFormChange} options={invoiceStatusOptions} />
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Invoice Title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Example: Website project invoice"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <SelectField label="Client" name="clientId" value={form.clientId} onChange={handleFormChange} options={["", ...dataState.clients.map((client) => client.id)]} getLabel={(value) => value ? getClientName(dataState.clients.find((client) => client.id === value)) : "No client linked"} />
            <SelectField label="Project" name="projectId" value={form.projectId} onChange={handleFormChange} options={["", ...dataState.projects.map((project) => project.id)]} getLabel={(value) => value ? dataState.projects.find((project) => project.id === value)?.title || "Project" : "No project linked"} />
            <SelectField label="Quote" name="quoteId" value={form.quoteId} onChange={handleFormChange} options={["", ...dataState.quotes.map((quote) => quote.id)]} getLabel={(value) => value ? getQuoteLabel(dataState.quotes.find((quote) => quote.id === value)) : "No quote linked"} />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Amount" name="amount" value={form.amount} onChange={handleFormChange} placeholder="2500" inputMode="decimal" />
              <InputField label="Paid Amount" name="paidAmount" value={form.paidAmount} onChange={handleFormChange} placeholder="0" inputMode="decimal" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Issue Date" name="issueDate" type="date" value={form.issueDate} onChange={handleFormChange} />
              <InputField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleFormChange} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange} options={paymentMethodOptions} />
              <InputField label="Reference" name="reference" value={form.reference} onChange={handleFormChange} placeholder="PO number, quote number or payment reference" />
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Line Items / Scope</span>
              <textarea
                name="lineItems"
                value={form.lineItems}
                onChange={handleFormChange}
                rows={6}
                placeholder="List the invoice scope, line items or deliverables."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Terms</span>
              <textarea
                name="terms"
                value={form.terms}
                onChange={handleFormChange}
                rows={5}
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                rows={4}
                placeholder="Example: 50% deposit, balance due before handover."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="submit"
              disabled={saveState.loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState.loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
              Save Invoice
            </button>
          </div>
        </form>

        <div className="grid gap-6 content-start">
          <QuickQuoteInvoicePanel quotes={dataState.quotes} clients={dataState.clients} projects={dataState.projects} onUseQuote={fillFromQuote} />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-[#020B1F]">Invoice records</h3>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                  Search invoices, track payments and export client-ready PDF copies.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px]">
              <label className="relative block">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search invoices..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100">
                <option value="all">All statuses</option>
                {invoiceStatusOptions.map((status) => (
                  <option key={status} value={status}>{toReadableLabel(status)}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[1050px] w-full border-collapse bg-white text-left">
                  <thead className="bg-[#F8FCFF]">
                    <tr>
                      <Th>Invoice</Th>
                      <Th>Client</Th>
                      <Th>Amount</Th>
                      <Th>Paid</Th>
                      <Th>Due</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataState.loading && (
                      <tr>
                        <td colSpan="7" className="px-5 py-10 text-center">
                          <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">Loading invoices...</p>
                        </td>
                      </tr>
                    )}

                    {!dataState.loading && visibleInvoices.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-5 py-10 text-center">
                          <FileText className="mx-auto text-slate-400" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">No invoice records found.</p>
                        </td>
                      </tr>
                    )}

                    {!dataState.loading && visibleInvoices.map((invoice) => (
                      <InvoiceRow
                        key={invoice.id}
                        invoice={invoice}
                        dataState={dataState}
                        onView={() => setSelectedInvoiceId(invoice.id)}
                        onPrint={() => printInvoice(invoice, dataState)}
                        onEmail={() => openInvoiceEmail(invoice, dataState)}
                        onMarkPaid={() => handleMarkInvoicePaid(invoice.id)}
                        onDelete={() => handleDeleteInvoice(invoice.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailPanel
          invoice={selectedInvoice}
          dataState={dataState}
          paymentForm={paymentForm}
          saveState={saveState}
          onClose={() => setSelectedInvoiceId(null)}
          onPaymentChange={handlePaymentChange}
          onUpdatePayment={handleUpdatePayment}
          onPrint={() => printInvoice(selectedInvoice, dataState)}
          onCopyEmail={() => copyInvoiceEmail(selectedInvoice)}
          onOpenEmail={() => openInvoiceEmail(selectedInvoice, dataState)}
        />
      )}
    </section>
  );
}

function QuickQuoteInvoicePanel({ quotes, clients, projects, onUseQuote }) {
  const candidateQuotes = quotes.filter((quote) => Number(quote.amount) > 0).slice(0, 8);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <WalletCards size={22} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#020B1F]">Quick invoice from quote</h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            Use an existing quote to prefill invoice title, amount, client, project and scope.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {candidateQuotes.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-bold leading-6 text-slate-600">
            No quote amounts are available yet.
          </p>
        )}

        {candidateQuotes.map((quote) => {
          const client = clients.find((item) => item.id === quote.client_id);
          const project = projects.find((item) => item.id === quote.project_id);
          return (
            <button
              key={quote.id}
              type="button"
              onClick={() => onUseQuote(quote.id)}
              className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              <p className="text-sm font-black text-[#020B1F]">{quote.quote_number || "Quote"} • {formatCurrency(quote.amount)}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{quote.title}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                {client ? getClientName(client) : "No client"} {project ? `• ${project.title}` : ""}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function InvoiceRow({ invoice, dataState, onView, onPrint, onEmail, onMarkPaid, onDelete }) {
  const client = dataState.clients.find((item) => item.id === invoice.clientId);
  const status = getInvoiceDisplayStatus(invoice);

  return (
    <tr className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]">
      <Td>
        <p className="font-black text-[#020B1F]">{invoice.invoiceNumber}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{invoice.title}</p>
      </Td>
      <Td>{client ? getClientName(client) : "No client linked"}</Td>
      <Td>{formatCurrency(invoice.amount)}</Td>
      <Td>{formatCurrency(invoice.paidAmount)}</Td>
      <Td>{formatDate(invoice.dueDate)}</Td>
      <Td><StatusBadge status={status} /></Td>
      <Td>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={onView} label="View" icon={Eye} />
          <ActionButton onClick={onPrint} label="PDF" icon={Printer} />
          <ActionButton onClick={onEmail} label="Email" icon={Mail} />
          {status !== "paid" && <ActionButton onClick={onMarkPaid} label="Paid" icon={CheckCircle2} />}
          <ActionButton onClick={onDelete} label="Delete" icon={Trash2} danger />
        </div>
      </Td>
    </tr>
  );
}

function InvoiceDetailPanel({
  invoice,
  dataState,
  paymentForm,
  saveState,
  onClose,
  onPaymentChange,
  onUpdatePayment,
  onPrint,
  onCopyEmail,
  onOpenEmail,
}) {
  const client = dataState.clients.find((item) => item.id === invoice.clientId);
  const project = dataState.projects.find((item) => item.id === invoice.projectId);
  const quote = dataState.quotes.find((item) => item.id === invoice.quoteId);
  const outstanding = Math.max((Number(invoice.amount) || 0) - (Number(invoice.paidAmount) || 0), 0);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">Invoice Detail</p>
          <h2 className="mt-2 text-2xl font-black text-[#020B1F]">{invoice.invoiceNumber}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">{invoice.title}</p>
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

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <article className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#020B1F]">MKETICS (PTY) LTD</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Speak Innovation. Deliver Value.</p>
              <p className="mt-3 text-xs font-bold leading-6 text-slate-500">
                Reg No: 2026/290708/07<br />
                Email: services@mketics.co.za<br />
                Phone: +27 72 286 4367
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-right">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Invoice</p>
              <p className="mt-1 text-lg font-black text-[#020B1F]">{invoice.invoiceNumber}</p>
              <StatusBadge status={getInvoiceDisplayStatus(invoice)} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PreviewLine label="Bill To" value={client ? getClientName(client) : "No client linked"} />
            <PreviewLine label="Client Email" value={client?.email} />
            <PreviewLine label="Issue Date" value={formatDate(invoice.issueDate)} />
            <PreviewLine label="Due Date" value={formatDate(invoice.dueDate)} />
            <PreviewLine label="Project" value={project?.title} />
            <PreviewLine label="Quote" value={quote ? getQuoteLabel(quote) : "No quote linked"} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Line Items / Scope</p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">{invoice.lineItems || invoice.title}</p>
          </div>

          {invoice.terms && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Terms</p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">{invoice.terms}</p>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InvoiceMoneyCard label="Invoice Amount" value={formatCurrency(invoice.amount)} />
            <InvoiceMoneyCard label="Paid" value={formatCurrency(invoice.paidAmount)} />
            <InvoiceMoneyCard label="Outstanding" value={formatCurrency(outstanding)} />
          </div>
        </article>

        <div className="grid gap-5 content-start">
          <form onSubmit={onUpdatePayment} className="rounded-[1.5rem] border border-cyan-200 bg-[#F8FCFF] p-5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <Banknote size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">Payment tracking</h3>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              Update paid amount, payment method and invoice status. Paid invoices can sync to the Finance tab.
            </p>

            {saveState.error && <StatusMessage type="error" message={saveState.error} />}
            {saveState.success && <StatusMessage type="success" message={saveState.success} />}

            <div className="mt-5 grid gap-4">
              <InputField label="Paid Amount" name="paidAmount" value={paymentForm.paidAmount} onChange={onPaymentChange} inputMode="decimal" />
              <SelectField label="Invoice Status" name="paymentStatus" value={paymentForm.paymentStatus} onChange={onPaymentChange} options={invoiceStatusOptions} />
              <SelectField label="Payment Method" name="paymentMethod" value={paymentForm.paymentMethod} onChange={onPaymentChange} options={paymentMethodOptions} />
              <InputField label="Payment Date" name="paymentDate" type="date" value={paymentForm.paymentDate} onChange={onPaymentChange} />

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Payment Notes</span>
                <textarea
                  name="paymentNotes"
                  value={paymentForm.paymentNotes}
                  onChange={onPaymentChange}
                  rows={4}
                  placeholder="Example: Payment confirmed by EFT. Proof received."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <input
                  type="checkbox"
                  name="syncFinance"
                  checked={paymentForm.syncFinance}
                  onChange={onPaymentChange}
                  className="mt-1 h-4 w-4 accent-[#0B7CFF]"
                />
                <span className="text-sm font-bold leading-6 text-slate-700">
                  Sync this invoice payment into the Finance dashboard.
                </span>
              </label>

              <button
                type="submit"
                disabled={saveState.loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveState.loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                Save Payment Update
              </button>
            </div>
          </form>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-[#020B1F]">Client-ready actions</h3>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              Export a PDF invoice or prepare the client email.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={onPrint} className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300">
                <Printer size={17} className="mr-2" />
                Print / Save PDF
              </button>
              <button type="button" onClick={onOpenEmail} className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300">
                <Mail size={17} className="mr-2" />
                Open Email Draft
              </button>
              <button type="button" onClick={onCopyEmail} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 sm:col-span-2">
                <Clipboard size={17} className="mr-2" />
                Copy Email Text
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function InvoiceStatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
    </article>
  );
}

function InvoiceMoneyCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{label}</p>
      <p className="mt-2 text-lg font-black text-[#020B1F]">{value}</p>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text", placeholder = "", inputMode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
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
          <option key={String(option)} value={option}>
            {getLabel ? getLabel(option) : toReadableLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionButton({ onClick, label, icon: Icon, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-black transition ${
        danger
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[#0B7CFF]/25 bg-[#EAF6FF] text-[#061A33] hover:border-cyan-300 hover:bg-cyan-300"
      }`}
    >
      <Icon size={13} className="mr-1.5" />
      {label}
    </button>
  );
}

function PreviewLine({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{value}</p>
    </div>
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
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
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

function buildDefaultInvoiceForm() {
  return {
    invoiceNumber: generateInvoiceNumber(),
    title: "",
    clientId: "",
    projectId: "",
    quoteId: "",
    amount: "",
    paidAmount: "",
    issueDate: getTodayInputValue(),
    dueDate: getFutureInputValue(7),
    paymentStatus: "draft",
    paymentMethod: "Not Set",
    lineItems: "",
    terms: defaultInvoiceTerms,
    reference: "",
    notes: "",
  };
}

function deriveFromQuote(quoteId, quotes, clients, projects) {
  const quote = quotes.find((item) => item.id === quoteId);
  if (!quote) return {};

  const project = projects.find((item) => item.id === quote.project_id);
  const client = clients.find((item) => item.id === quote.client_id || item.id === project?.client_id);

  return {
    title: quote.title ? quote.title.replace(/quotation/i, "invoice") : "MKETICS invoice",
    clientId: client?.id || quote.client_id || "",
    projectId: quote.project_id || "",
    amount: quote.amount ? String(quote.amount) : "",
    reference: quote.quote_number || "",
    lineItems: [
      quote.title || "MKETICS service delivery",
      "",
      quote.scope_summary || "Invoice based on the accepted MKETICS quotation.",
      quote.exclusions ? `\nNotes / exclusions:\n${quote.exclusions}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function normaliseInvoices(invoices) {
  if (!Array.isArray(invoices)) return [];

  return invoices
    .filter((invoice) => invoice && invoice.id)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || generateInvoiceNumber(),
      title: invoice.title || "MKETICS invoice",
      clientId: invoice.clientId || "",
      projectId: invoice.projectId || "",
      quoteId: invoice.quoteId || "",
      amount: Number(invoice.amount) || 0,
      paidAmount: Number(invoice.paidAmount) || 0,
      currency: invoice.currency || "ZAR",
      issueDate: invoice.issueDate || getTodayInputValue(),
      dueDate: invoice.dueDate || "",
      paymentStatus: invoice.paymentStatus || "draft",
      paymentMethod: invoice.paymentMethod || "Not Set",
      paymentDate: invoice.paymentDate || "",
      paymentNotes: invoice.paymentNotes || "",
      lineItems: invoice.lineItems || "",
      terms: invoice.terms || defaultInvoiceTerms,
      reference: invoice.reference || "",
      notes: invoice.notes || "",
      sentAt: invoice.sentAt || "",
      paidAt: invoice.paidAt || "",
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: invoice.updatedAt || invoice.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

function normalisePaymentStatus(status, amount, paidAmount, dueDate) {
  if (status === "cancelled") return "cancelled";
  if (paidAmount >= amount && amount > 0) return "paid";
  if (paidAmount > 0) return "partial";
  if (dueDate && startOfDay(new Date(dueDate)) < startOfDay(new Date())) return "overdue";
  return invoiceStatusOptions.includes(status) ? status : "draft";
}

function getInvoiceDisplayStatus(invoice) {
  return normalisePaymentStatus(invoice.paymentStatus, Number(invoice.amount) || 0, Number(invoice.paidAmount) || 0, invoice.dueDate);
}

function mapInvoiceStatusToFinanceStatus(status) {
  if (status === "paid") return "paid";
  if (status === "partial") return "partial";
  if (status === "overdue") return "overdue";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function buildInvoiceSummaryText({ invoices, dataState, stats }) {
  const rows = invoices.slice(0, 12).map((invoice) => {
    const client = dataState.clients.find((item) => item.id === invoice.clientId);
    return `- ${invoice.invoiceNumber}: ${invoice.title} | ${client ? getClientName(client) : "No client"} | ${formatCurrency(invoice.amount)} | Paid ${formatCurrency(invoice.paidAmount)} | ${toReadableLabel(getInvoiceDisplayStatus(invoice))}`;
  });

  return [
    "MKETICS Invoice Summary",
    "",
    `Total billed: ${formatCurrency(stats.totalBilled)}`,
    `Total paid: ${formatCurrency(stats.totalPaid)}`,
    `Outstanding: ${formatCurrency(stats.outstanding)}`,
    `Overdue invoices: ${stats.overdue}`,
    "",
    "Invoices:",
    rows.length ? rows.join("\n") : "No invoices found.",
  ].join("\n");
}

function buildInvoiceEmail(invoice, dataState) {
  const client = dataState.clients.find((item) => item.id === invoice.clientId);
  const outstanding = Math.max((Number(invoice.amount) || 0) - (Number(invoice.paidAmount) || 0), 0);

  return [
    `Hello ${client?.full_name || ""},`,
    "",
    `Please find the invoice details for ${invoice.title}.`,
    "",
    `Invoice Number: ${invoice.invoiceNumber}`,
    `Invoice Amount: ${formatCurrency(invoice.amount)}`,
    `Paid Amount: ${formatCurrency(invoice.paidAmount)}`,
    `Outstanding Balance: ${formatCurrency(outstanding)}`,
    `Due Date: ${formatDate(invoice.dueDate)}`,
    "",
    "Kindly use the official MKETICS business account details when making payment and send proof of payment once done.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
    "Speak Innovation. Deliver Value.",
  ].join("\n");
}

function openInvoiceEmail(invoice, dataState) {
  const client = dataState.clients.find((item) => item.id === invoice.clientId);
  const subject = `MKETICS Invoice ${invoice.invoiceNumber}`;
  const body = buildInvoiceEmail(invoice, dataState);
  window.location.href = `mailto:${client?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function printInvoice(invoice, dataState) {
  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow.document;
  doc.open();
  doc.write(buildInvoicePrintHtml(invoice, dataState));
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    setTimeout(() => document.body.removeChild(printFrame), 800);
  }, 250);
}

function buildInvoicePrintHtml(invoice, dataState) {
  const client = dataState.clients.find((item) => item.id === invoice.clientId);
  const project = dataState.projects.find((item) => item.id === invoice.projectId);
  const outstanding = Math.max((Number(invoice.amount) || 0) - (Number(invoice.paidAmount) || 0), 0);

  return `<!doctype html>
<html>
<head>
  <title>${escapeHtml(invoice.invoiceNumber)} - MKETICS Invoice</title>
  <style>
    body { font-family: Arial, sans-serif; color: #061A33; margin: 0; padding: 32px; }
    .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 4px solid #0B7CFF; padding-bottom: 18px; }
    h1 { margin: 0; font-size: 34px; }
    h2 { margin: 0 0 8px; font-size: 18px; color: #0B7CFF; letter-spacing: 0.08em; text-transform: uppercase; }
    .muted { color: #526174; font-size: 13px; line-height: 1.6; }
    .box { border: 1px solid #d9e7f5; border-radius: 18px; padding: 18px; margin-top: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .money { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; }
    .money div { background: #EAF6FF; border-radius: 16px; padding: 16px; }
    .label { color: #0B7CFF; font-weight: 800; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
    .value { margin-top: 6px; font-weight: 800; font-size: 15px; white-space: pre-wrap; line-height: 1.6; }
    .status { display: inline-block; background: #EAF6FF; color: #0B7CFF; border-radius: 999px; padding: 8px 12px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; }
    .footer { margin-top: 26px; padding-top: 18px; border-top: 1px solid #d9e7f5; font-size: 12px; color: #526174; line-height: 1.6; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <section class="top">
    <div>
      <h2>MKETICS (PTY) LTD</h2>
      <h1>Invoice</h1>
      <p class="muted">Speak Innovation. Deliver Value.<br>Reg No: 2026/290708/07<br>services@mketics.co.za | +27 72 286 4367</p>
    </div>
    <div style="text-align:right">
      <p class="status">${escapeHtml(toReadableLabel(getInvoiceDisplayStatus(invoice)))}</p>
      <p class="value">${escapeHtml(invoice.invoiceNumber)}</p>
      <p class="muted">Issue Date: ${escapeHtml(formatDate(invoice.issueDate))}<br>Due Date: ${escapeHtml(formatDate(invoice.dueDate))}</p>
    </div>
  </section>

  <section class="grid box">
    <div><p class="label">Bill To</p><p class="value">${escapeHtml(client ? getClientName(client) : "No client linked")}</p></div>
    <div><p class="label">Project</p><p class="value">${escapeHtml(project?.title || "No project linked")}</p></div>
    <div><p class="label">Email</p><p class="value">${escapeHtml(client?.email || "Not provided")}</p></div>
    <div><p class="label">Phone</p><p class="value">${escapeHtml(client?.phone || "Not provided")}</p></div>
  </section>

  <section class="box">
    <p class="label">Invoice Title</p><p class="value">${escapeHtml(invoice.title)}</p>
    <p class="label" style="margin-top:16px">Line Items / Scope</p><p class="value">${escapeHtml(invoice.lineItems || invoice.title)}</p>
  </section>

  <section class="money">
    <div><p class="label">Invoice Amount</p><p class="value">${escapeHtml(formatCurrency(invoice.amount))}</p></div>
    <div><p class="label">Paid</p><p class="value">${escapeHtml(formatCurrency(invoice.paidAmount))}</p></div>
    <div><p class="label">Outstanding</p><p class="value">${escapeHtml(formatCurrency(outstanding))}</p></div>
  </section>

  ${invoice.terms ? `<section class="box"><p class="label">Terms</p><p class="value">${escapeHtml(invoice.terms)}</p></section>` : ""}
  ${invoice.notes ? `<section class="box"><p class="label">Notes</p><p class="value">${escapeHtml(invoice.notes)}</p></section>` : ""}

  <section class="footer">
    <strong>Payment note:</strong> Please use the official MKETICS (PTY) LTD business account only. This invoice was generated from the MKETICS Business Console.
  </section>
</body>
</html>`;
}

function generateInvoiceNumber() {
  const now = new Date();
  const datePart = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("");
  const timePart = [pad(now.getHours()), pad(now.getMinutes())].join("");
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MKI-${datePart}-${timePart}${randomPart}`;
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getFutureInputValue(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `invoice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseMoney(value) {
  if (!value) return 0;
  const parsed = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sumAmounts(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getClientName(client) {
  if (!client) return "No client linked";
  return client.organisation ? `${client.full_name} • ${client.organisation}` : client.full_name;
}

function getQuoteLabel(quote) {
  if (!quote) return "No quote linked";
  return `${quote.quote_number || "Quote"} • ${quote.title || "Untitled"} • ${formatCurrency(quote.amount, quote.currency || "ZAR")}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
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
