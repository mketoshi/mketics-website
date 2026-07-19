import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Download,
  Eye,
  FileText,
  FolderOpen,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  RefreshCw,
  Send,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const supportPriorities = ["low", "normal", "high", "urgent"];

const projectApprovalDecisions = [
  { value: "approved", label: "Approved / accepted" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "question", label: "Question / clarification" },
];

const projectProgressSettingKey = "client_portal_project_progress_updates_v1";
const projectApprovalSettingKey = "client_portal_project_approvals_v1";
const quoteResponseSettingKey = "client_portal_quote_responses_v1";
const invoicePaymentRequestSettingKey = "client_portal_invoice_payment_requests_v1";

const quoteResponseTypes = [
  { value: "accepted", label: "Accept quote" },
  { value: "changes_requested", label: "Request changes" },
  { value: "question", label: "Ask a question" },
  { value: "request_invoice", label: "Request invoice / payment details" },
];

const invoicePaymentRequestTypes = [
  { value: "payment_made", label: "I have made payment" },
  { value: "request_banking_details", label: "Request banking details" },
  { value: "request_invoice_update", label: "Request invoice update" },
  { value: "request_receipt", label: "Request receipt" },
];

const portalTabs = [
  {
    id: "overview",
    label: "Overview",
    icon: ShieldCheck,
  },
  {
    id: "projects",
    label: "Projects",
    icon: BriefcaseBusiness,
  },
  {
    id: "quotes",
    label: "Quotes",
    icon: WalletCards,
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
  },
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "profile",
    label: "Profile",
    icon: ClipboardList,
  },
];

export default function ClientPortalDashboard({ profile }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [portalState, setPortalState] = useState({
    loading: false,
    error: "",
    clients: [],
    projects: [],
    quotes: [],
    invoices: [],
    tickets: [],
    documents: [],
    progressUpdates: [],
    approvals: [],
    quoteResponses: [],
    paymentRequests: [],
  });

  const [supportForm, setSupportForm] = useState({
    clientId: "",
    projectId: "",
    priority: "normal",
    subject: "",
    description: "",
  });

  const [supportSaveState, setSupportSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [approvalForms, setApprovalForms] = useState({});

  const [approvalSaveState, setApprovalSaveState] = useState({
    loadingProjectId: "",
    error: "",
    success: "",
  });

  const [quoteForms, setQuoteForms] = useState({});

  const [quoteActionState, setQuoteActionState] = useState({
    loadingQuoteId: "",
    error: "",
    success: "",
  });

  const [paymentRequestForms, setPaymentRequestForms] = useState({});

  const [paymentRequestSaveState, setPaymentRequestSaveState] = useState({
    loadingInvoiceId: "",
    error: "",
    success: "",
  });

  const [documentActionState, setDocumentActionState] = useState({
    loadingId: "",
    error: "",
  });

  const [receiptActionState, setReceiptActionState] = useState({
    loadingId: "",
    error: "",
    success: "",
  });

  const primaryClient = portalState.clients[0] || null;

  const clientIds = useMemo(
    () => portalState.clients.map((client) => client.id).filter(Boolean),
    [portalState.clients]
  );

  const stats = useMemo(() => {
    const activeProjects = portalState.projects.filter(
      (project) => !["completed", "cancelled"].includes(project.status)
    ).length;

    const openTickets = portalState.tickets.filter(
      (ticket) => !["resolved", "closed"].includes(ticket.status)
    ).length;

    const acceptedQuotes = portalState.quotes.filter(
      (quote) => quote.status === "accepted"
    ).length;

    const totalQuoteValue = portalState.quotes.reduce(
      (sum, quote) => sum + parseAmount(quote.amount),
      0
    );

    const paidInvoices = portalState.invoices.filter(
      (invoice) => getInvoiceDisplayStatus(invoice) === "paid"
    ).length;

    const totalInvoiceValue = portalState.invoices.reduce(
      (sum, invoice) => sum + parseAmount(invoice.amount),
      0
    );

    const totalInvoicePaid = portalState.invoices.reduce(
      (sum, invoice) => sum + parseAmount(invoice.paidAmount),
      0
    );

    const receiptCount = portalState.invoices.reduce(
      (total, invoice) => total + getInvoiceReceipts(invoice).length,
      0
    );

    return {
      clients: portalState.clients.length,
      projects: portalState.projects.length,
      activeProjects,
      quotes: portalState.quotes.length,
      acceptedQuotes,
      invoices: portalState.invoices.length,
      paidInvoices,
      totalInvoiceValue,
      totalInvoicePaid,
      invoiceOutstanding: Math.max(totalInvoiceValue - totalInvoicePaid, 0),
      receiptCount,
      openTickets,
      documents: portalState.documents.length,
      approvals: portalState.approvals.length,
      pendingApprovals: portalState.approvals.filter(
        (approval) => approval.decision === "changes_requested" || approval.decision === "question"
      ).length,
      totalQuoteValue,
    };
  }, [portalState.projects, portalState.quotes, portalState.invoices, portalState.tickets, portalState.documents, portalState.clients, portalState.approvals]);

  useEffect(() => {
    fetchPortalData();
  }, [profile?.id]);

  useEffect(() => {
    if (!supportForm.clientId && primaryClient?.id) {
      setSupportForm((current) => ({
        ...current,
        clientId: primaryClient.id,
      }));
    }
  }, [primaryClient?.id, supportForm.clientId]);

  async function fetchPortalData() {
    if (!supabase || !profile?.id) return;

    try {
      setPortalState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const clients = await fetchLinkedClients(profile);
      const ids = clients.map((client) => client.id).filter(Boolean);

      if (ids.length === 0) {
        setPortalState({
          loading: false,
          error: "",
          clients: [],
          projects: [],
          quotes: [],
          invoices: [],
          tickets: [],
          documents: [],
          progressUpdates: [],
          approvals: [],
          quoteResponses: [],
          paymentRequests: [],
        });
        return;
      }

      const [
        projectsResult,
        quotesResult,
        ticketsResult,
        documentsResult,
        invoicesResult,
        projectActivityResult,
        commerceActivityResult,
      ] = await Promise.all([
          supabase
            .from("projects")
            .select(
              "id, client_id, lead_id, title, description, service_type, status, start_date, due_date, completed_at, created_at, updated_at"
            )
            .in("client_id", ids)
            .order("created_at", { ascending: false }),
          supabase
            .from("quotes")
            .select(
              "id, client_id, project_id, quote_number, title, scope_summary, amount, currency, status, valid_until, sent_at, accepted_at, rejected_at, created_at, updated_at"
            )
            .in("client_id", ids)
            .order("created_at", { ascending: false }),
          supabase
            .from("support_tickets")
            .select(
              "id, client_id, project_id, ticket_type, priority, subject, description, status, resolution_notes, closed_at, created_at, updated_at"
            )
            .in("client_id", ids)
            .order("created_at", { ascending: false }),
          supabase
            .from("documents")
            .select(
              "id, client_id, project_id, quote_id, title, document_type, storage_path, public_url, notes, created_at, updated_at"
            )
            .in("client_id", ids)
            .order("created_at", { ascending: false }),
          fetchClientPortalInvoices(),
          fetchClientPortalProjectActivity(ids),
          fetchClientPortalCommerceActivity(ids),
        ]);

      const firstError =
        projectsResult.error ||
        quotesResult.error ||
        ticketsResult.error ||
        documentsResult.error ||
        invoicesResult.error ||
        projectActivityResult.error ||
        commerceActivityResult.error;

      if (firstError) throw firstError;

      setPortalState({
        loading: false,
        error: "",
        clients,
        projects: projectsResult.data || [],
        quotes: quotesResult.data || [],
        invoices: invoicesResult.invoices || [],
        tickets: ticketsResult.data || [],
        documents: documentsResult.data || [],
        progressUpdates: projectActivityResult.progressUpdates || [],
        approvals: projectActivityResult.approvals || [],
        quoteResponses: commerceActivityResult.quoteResponses || [],
        paymentRequests: commerceActivityResult.paymentRequests || [],
      });
    } catch (error) {
      setPortalState({
        loading: false,
        error:
          error?.message ||
          "Unable to load portal records. Check client portal permissions.",
        clients: [],
        projects: [],
        quotes: [],
        invoices: [],
        tickets: [],
        documents: [],
        progressUpdates: [],
        approvals: [],
        quoteResponses: [],
        paymentRequests: [],
      });
    }
  }

  async function fetchLinkedClients(currentProfile) {
    const { data: profileClients, error: profileError } = await supabase
      .from("clients")
      .select("id, profile_id, full_name, email, phone, organisation, notes, created_at, updated_at")
      .eq("profile_id", currentProfile.id)
      .order("created_at", { ascending: false });

    if (profileError) throw profileError;

    const clientsById = new Map();

    (profileClients || []).forEach((client) => {
      clientsById.set(client.id, client);
    });

    const email = currentProfile.email?.trim();

    if (email) {
      const { data: emailClients, error: emailError } = await supabase
        .from("clients")
        .select("id, profile_id, full_name, email, phone, organisation, notes, created_at, updated_at")
        .ilike("email", email)
        .order("created_at", { ascending: false });

      if (emailError) throw emailError;

      (emailClients || []).forEach((client) => {
        clientsById.set(client.id, client);
      });
    }

    return Array.from(clientsById.values());
  }

  async function fetchClientPortalInvoices() {
    const { data, error } = await supabase.rpc("get_client_portal_invoice_records");

    if (error) {
      return {
        invoices: [],
        error,
      };
    }

    return {
      invoices: normaliseClientInvoices(data || []),
      error: null,
    };
  }

  async function fetchClientPortalProjectActivity(clientIds = []) {
    if (!supabase || clientIds.length === 0) {
      return { progressUpdates: [], approvals: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("setting_key, setting_value")
        .in("setting_key", [projectProgressSettingKey, projectApprovalSettingKey]);

      if (error) throw error;

      const settings = new Map((data || []).map((item) => [item.setting_key, item.setting_value]));
      const clientSet = new Set(clientIds);

      const progressUpdates = normaliseProjectProgressUpdates(
        settings.get(projectProgressSettingKey)
      ).filter((update) => clientSet.has(update.clientId));

      const approvals = normaliseProjectApprovals(
        settings.get(projectApprovalSettingKey)
      ).filter((approval) => clientSet.has(approval.clientId));

      return { progressUpdates, approvals, error: null };
    } catch (error) {
      return { progressUpdates: [], approvals: [], error };
    }
  }

  async function fetchClientPortalCommerceActivity(clientIds = []) {
    if (!supabase || clientIds.length === 0) {
      return { quoteResponses: [], paymentRequests: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("setting_key, setting_value")
        .in("setting_key", [quoteResponseSettingKey, invoicePaymentRequestSettingKey]);

      if (error) throw error;

      const settings = new Map((data || []).map((item) => [item.setting_key, item.setting_value]));
      const clientSet = new Set(clientIds);

      const quoteResponses = normaliseQuoteResponses(
        settings.get(quoteResponseSettingKey)
      ).filter((response) => clientSet.has(response.clientId));

      const paymentRequests = normaliseInvoicePaymentRequests(
        settings.get(invoicePaymentRequestSettingKey)
      ).filter((request) => clientSet.has(request.clientId));

      return { quoteResponses, paymentRequests, error: null };
    } catch (error) {
      return { quoteResponses: [], paymentRequests: [], error };
    }
  }

  async function handleSubmitProjectApproval(project) {
    if (!supabase || !project?.id) return;

    const form = approvalForms[project.id] || getDefaultApprovalForm();
    const feedback = form.feedback.trim();

    if (!feedback) {
      setApprovalSaveState({
        loadingProjectId: "",
        error: "Write your approval note, question or requested changes before sending.",
        success: "",
      });
      return;
    }

    try {
      setApprovalSaveState({
        loadingProjectId: project.id,
        error: "",
        success: "",
      });

      const existingApprovals = normaliseProjectApprovals(
        await getSettingsValue(projectApprovalSettingKey)
      );

      const approval = {
        id: crypto.randomUUID?.() || `approval-${Date.now()}`,
        clientId: project.client_id,
        projectId: project.id,
        projectTitle: project.title || "MKETICS Project",
        clientName: primaryClient?.full_name || profile?.full_name || "Client",
        clientEmail: primaryClient?.email || profile?.email || "",
        decision: form.decision || "approved",
        feedback,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedApprovals = [approval, ...existingApprovals];
      await upsertSettingsValue(projectApprovalSettingKey, updatedApprovals);

      setPortalState((current) => ({
        ...current,
        approvals: [approval, ...current.approvals],
      }));

      setApprovalForms((current) => ({
        ...current,
        [project.id]: getDefaultApprovalForm(),
      }));

      setApprovalSaveState({
        loadingProjectId: "",
        error: "",
        success: "Project response sent to MKETICS.",
      });
    } catch (error) {
      setApprovalSaveState({
        loadingProjectId: "",
        error:
          error?.message ||
          "Unable to send project approval. Check client portal approval permissions.",
        success: "",
      });
    }
  }

  async function handleSubmitQuoteResponse(quote) {
    if (!supabase || !quote?.id) return;

    const form = quoteForms[quote.id] || getDefaultQuoteResponseForm();
    const feedback = form.feedback.trim();
    const responseType = form.responseType || "accepted";

    if (!["accepted", "request_invoice"].includes(responseType) && !feedback) {
      setQuoteActionState({
        loadingQuoteId: "",
        error: "Write your question or requested changes before sending.",
        success: "",
      });
      return;
    }

    try {
      setQuoteActionState({
        loadingQuoteId: quote.id,
        error: "",
        success: "",
      });

      const requestInvoice = Boolean(form.requestInvoice) || responseType === "request_invoice";

      const { data, error } = await supabase.rpc("client_portal_submit_quote_response", {
        p_quote_id: quote.id,
        p_response_type: responseType,
        p_feedback: feedback,
        p_request_invoice: requestInvoice,
      });

      if (error) throw error;

      const response = normaliseQuoteResponses([data?.response || data]).at(0) || {
        id: crypto.randomUUID?.() || `quote-response-${Date.now()}`,
        clientId: quote.client_id || "",
        quoteId: quote.id,
        quoteNumber: quote.quote_number || "Quote",
        quoteTitle: quote.title || "MKETICS Quote",
        responseType,
        feedback,
        requestInvoice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nextQuoteStatus = data?.quote?.status ||
        (responseType === "accepted" ? "accepted" : responseType === "rejected" ? "rejected" : quote.status);

      setPortalState((current) => ({
        ...current,
        quotes: current.quotes.map((item) =>
          item.id === quote.id
            ? {
                ...item,
                status: nextQuoteStatus,
                accepted_at:
                  responseType === "accepted"
                    ? data?.quote?.accepted_at || new Date().toISOString()
                    : item.accepted_at,
                rejected_at:
                  responseType === "rejected"
                    ? data?.quote?.rejected_at || new Date().toISOString()
                    : item.rejected_at,
                updated_at: data?.quote?.updated_at || new Date().toISOString(),
              }
            : item
        ),
        quoteResponses: [response, ...current.quoteResponses],
      }));

      setQuoteForms((current) => ({
        ...current,
        [quote.id]: getDefaultQuoteResponseForm(),
      }));

      setQuoteActionState({
        loadingQuoteId: "",
        error: "",
        success:
          responseType === "accepted"
            ? "Quote accepted and sent to MKETICS."
            : "Quote response sent to MKETICS.",
      });
    } catch (error) {
      setQuoteActionState({
        loadingQuoteId: "",
        error:
          error?.message ||
          "Unable to submit quote response. Check client portal quote permissions.",
        success: "",
      });
    }
  }

  async function handleSubmitInvoicePaymentRequest(invoice) {
    if (!supabase || !invoice?.id) return;

    const form = paymentRequestForms[invoice.id] || getDefaultPaymentRequestForm(invoice);
    const note = form.note.trim();

    if (!note && form.requestType !== "request_banking_details") {
      setPaymentRequestSaveState({
        loadingInvoiceId: "",
        error: "Add a short note or payment reference before sending.",
        success: "",
      });
      return;
    }

    try {
      setPaymentRequestSaveState({
        loadingInvoiceId: invoice.id,
        error: "",
        success: "",
      });

      const existingRequests = normaliseInvoicePaymentRequests(
        await getSettingsValue(invoicePaymentRequestSettingKey)
      );

      const request = {
        id: crypto.randomUUID?.() || `payment-request-${Date.now()}`,
        clientId: invoice.clientId || primaryClient?.id || "",
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber || "Invoice",
        invoiceTitle: invoice.title || "MKETICS Invoice",
        requestType: form.requestType || "payment_made",
        amount: parseAmount(form.amount),
        reference: form.reference.trim(),
        note,
        clientName: primaryClient?.full_name || profile?.full_name || "Client",
        clientEmail: primaryClient?.email || profile?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await upsertSettingsValue(invoicePaymentRequestSettingKey, [request, ...existingRequests]);

      setPortalState((current) => ({
        ...current,
        paymentRequests: [request, ...current.paymentRequests],
      }));

      setPaymentRequestForms((current) => ({
        ...current,
        [invoice.id]: getDefaultPaymentRequestForm(invoice),
      }));

      setPaymentRequestSaveState({
        loadingInvoiceId: "",
        error: "",
        success: "Payment request sent to MKETICS.",
      });
    } catch (error) {
      setPaymentRequestSaveState({
        loadingInvoiceId: "",
        error:
          error?.message ||
          "Unable to send payment request. Check client portal payment request permissions.",
        success: "",
      });
    }
  }

  async function getSettingsValue(key) {
    const { data, error } = await supabase
      .from("settings")
      .select("setting_value")
      .eq("setting_key", key)
      .maybeSingle();

    if (error) throw error;

    return data?.setting_value;
  }

  async function upsertSettingsValue(key, value) {
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          setting_key: key,
          setting_value: value,
          description: "MKETICS client portal project progress and approval records.",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "setting_key" }
      );

    if (error) throw error;
  }


  async function handleCreateSupportTicket(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!supportForm.clientId) {
      setSupportSaveState({
        loading: false,
        error: "No linked client record was found for this account.",
        success: "",
      });
      return;
    }

    if (!supportForm.subject.trim() || !supportForm.description.trim()) {
      setSupportSaveState({
        loading: false,
        error: "Enter a subject and description before sending support request.",
        success: "",
      });
      return;
    }

    try {
      setSupportSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const ticketRow = {
        client_id: supportForm.clientId,
        project_id: supportForm.projectId || null,
        ticket_type: "client_portal_request",
        priority: supportForm.priority,
        subject: supportForm.subject.trim(),
        description: supportForm.description.trim(),
        status: "open",
      };

      const { data, error } = await supabase
        .from("support_tickets")
        .insert(ticketRow)
        .select(
          "id, client_id, project_id, ticket_type, priority, subject, description, status, resolution_notes, closed_at, created_at, updated_at"
        )
        .single();

      if (error) throw error;

      setPortalState((current) => ({
        ...current,
        tickets: [data, ...current.tickets],
      }));

      setSupportForm((current) => ({
        clientId: current.clientId,
        projectId: "",
        priority: "normal",
        subject: "",
        description: "",
      }));

      setSupportSaveState({
        loading: false,
        error: "",
        success: "Support request sent to MKETICS.",
      });
    } catch (error) {
      setSupportSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to send support request. Check support ticket permissions.",
        success: "",
      });
    }
  }

  async function handleOpenDocument(document) {
    if (!document?.id) return;

    try {
      setDocumentActionState({ loadingId: document.id, error: "" });

      if (document.public_url) {
        window.open(document.public_url, "_blank", "noopener,noreferrer");
        setDocumentActionState({ loadingId: "", error: "" });
        return;
      }

      if (!document.storage_path) {
        setDocumentActionState({
          loadingId: "",
          error: "This document record does not have a file link yet.",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from("mketics-documents")
        .createSignedUrl(document.storage_path, 60 * 10);

      if (error) throw error;

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");

      setDocumentActionState({ loadingId: "", error: "" });
    } catch (error) {
      setDocumentActionState({
        loadingId: "",
        error:
          error?.message ||
          "Unable to open this document. Check storage permissions.",
      });
    }
  }



  async function handleOpenReceiptProof(receipt) {
    const location = receipt?.proofUrl || receipt?.proofStoragePath;

    if (!location) {
      setReceiptActionState({
        loadingId: "",
        error: "This receipt does not have proof of payment attached.",
        success: "",
      });
      return;
    }

    try {
      setReceiptActionState({ loadingId: receipt.id, error: "", success: "" });

      if (receipt.proofUrl) {
        window.open(receipt.proofUrl, "_blank", "noopener,noreferrer");
        setReceiptActionState({ loadingId: "", error: "", success: "" });
        return;
      }

      const { data, error } = await supabase.storage
        .from("mketics-documents")
        .createSignedUrl(receipt.proofStoragePath, 60 * 10);

      if (error) throw error;

      window.open(data?.signedUrl, "_blank", "noopener,noreferrer");
      setReceiptActionState({ loadingId: "", error: "", success: "" });
    } catch (error) {
      setReceiptActionState({
        loadingId: "",
        error:
          error?.message ||
          "Unable to open payment proof. Check client portal storage permissions.",
        success: "",
      });
    }
  }

  async function handleCopyReceipt(receipt, invoice) {
    try {
      await navigator.clipboard.writeText(buildClientReceiptText(receipt, invoice));
      setReceiptActionState({
        loadingId: "",
        error: "",
        success: "Receipt text copied to clipboard.",
      });
    } catch (error) {
      setReceiptActionState({
        loadingId: "",
        error: "Unable to copy receipt text.",
        success: "",
      });
    }
  }

  function handlePrintInvoice(invoice) {
    printClientInvoice(invoice, portalState);
  }


  function updateSupportForm(event) {
    const { name, value } = event.target;

    setSupportForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (supportSaveState.error || supportSaveState.success) {
      setSupportSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  function updateApprovalForm(projectId, field, value) {
    setApprovalForms((current) => ({
      ...current,
      [projectId]: {
        ...getDefaultApprovalForm(),
        ...(current[projectId] || {}),
        [field]: value,
      },
    }));

    if (approvalSaveState.error || approvalSaveState.success) {
      setApprovalSaveState({
        loadingProjectId: "",
        error: "",
        success: "",
      });
    }
  }

  function updateQuoteForm(quoteId, field, value) {
    setQuoteForms((current) => ({
      ...current,
      [quoteId]: {
        ...getDefaultQuoteResponseForm(),
        ...(current[quoteId] || {}),
        [field]: value,
      },
    }));

    if (quoteActionState.error || quoteActionState.success) {
      setQuoteActionState({
        loadingQuoteId: "",
        error: "",
        success: "",
      });
    }
  }

  function updatePaymentRequestForm(invoiceId, field, value) {
    setPaymentRequestForms((current) => ({
      ...current,
      [invoiceId]: {
        ...getDefaultPaymentRequestForm(),
        ...(current[invoiceId] || {}),
        [field]: value,
      },
    }));

    if (paymentRequestSaveState.error || paymentRequestSaveState.success) {
      setPaymentRequestSaveState({
        loadingInvoiceId: "",
        error: "",
        success: "",
      });
    }
  }

  return (
    <section className="px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {portalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-[1.35rem] border p-4 text-left transition ${
                  isActive
                    ? "border-cyan-300 bg-[#061A33] text-white shadow-[0_18px_45px_rgba(6,26,51,0.22)]"
                    : "border-slate-200 bg-white text-[#061A33] hover:border-cyan-300 hover:bg-[#F8FCFF]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-2xl ${
                      isActive
                        ? "bg-cyan-300 text-[#061A33]"
                        : "bg-[#EAF6FF] text-[#0B7CFF]"
                    }`}
                  >
                    <Icon size={19} />
                  </div>

                  <p className="text-sm font-black">{tab.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#020B1F]">
              Welcome, {profile?.full_name || profile?.email}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              This portal shows MKETICS records linked to your client account.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPortalData}
            disabled={portalState.loading}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {portalState.loading ? (
              <Loader2 size={17} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={17} className="mr-2" />
            )}
            Refresh Portal
          </button>
        </div>

        {portalState.error && (
          <StatusMessage type="error" message={portalState.error} />
        )}

        {!portalState.loading && clientIds.length === 0 ? (
          <NoClientRecord profile={profile} />
        ) : portalState.loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={30} />
            <p className="mt-3 text-sm font-black text-slate-500">
              Loading portal records...
            </p>
          </div>
        ) : activeTab === "overview" ? (
          <OverviewTab stats={stats} projects={portalState.projects} tickets={portalState.tickets} quotes={portalState.quotes} invoices={portalState.invoices} documents={portalState.documents} />
        ) : activeTab === "projects" ? (
          <ProjectsTab
            projects={portalState.projects}
            progressUpdates={portalState.progressUpdates}
            approvals={portalState.approvals}
            approvalForms={approvalForms}
            approvalSaveState={approvalSaveState}
            onApprovalChange={updateApprovalForm}
            onApprovalSubmit={handleSubmitProjectApproval}
          />
        ) : activeTab === "quotes" ? (
          <QuotesTab
            quotes={portalState.quotes}
            quoteResponses={portalState.quoteResponses}
            quoteForms={quoteForms}
            actionState={quoteActionState}
            onQuoteFormChange={updateQuoteForm}
            onSubmitQuoteResponse={handleSubmitQuoteResponse}
          />
        ) : activeTab === "invoices" ? (
          <InvoicesTab
            invoices={portalState.invoices}
            clients={portalState.clients}
            projects={portalState.projects}
            quotes={portalState.quotes}
            actionState={receiptActionState}
            paymentRequests={portalState.paymentRequests}
            paymentRequestForms={paymentRequestForms}
            paymentRequestSaveState={paymentRequestSaveState}
            onOpenProof={handleOpenReceiptProof}
            onCopyReceipt={handleCopyReceipt}
            onPrintInvoice={handlePrintInvoice}
            onPaymentRequestChange={updatePaymentRequestForm}
            onSubmitPaymentRequest={handleSubmitInvoicePaymentRequest}
          />
        ) : activeTab === "support" ? (
          <SupportTab
            tickets={portalState.tickets}
            projects={portalState.projects}
            clients={portalState.clients}
            form={supportForm}
            saveState={supportSaveState}
            onChange={updateSupportForm}
            onSubmit={handleCreateSupportTicket}
          />
        ) : activeTab === "documents" ? (
          <DocumentsTab
            documents={portalState.documents}
            projects={portalState.projects}
            quotes={portalState.quotes}
            actionState={documentActionState}
            onOpenDocument={handleOpenDocument}
          />
        ) : (
          <ProfileTab profile={profile} clients={portalState.clients} />
        )}
      </div>
    </section>
  );
}

function OverviewTab({ stats, projects, tickets, quotes, invoices, documents }) {
  const recentProjects = projects.slice(0, 3);
  const recentTickets = tickets.slice(0, 3);
  const recentQuotes = quotes.slice(0, 3);
  const recentInvoices = invoices.slice(0, 3);
  const recentDocuments = documents.slice(0, 3);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Projects" value={stats.activeProjects} />
        <StatCard label="Quotes" value={stats.quotes} />
        <StatCard label="Invoices" value={stats.invoices} />
        <StatCard label="Open Support" value={stats.openTickets} />
        <StatCard label="Approvals" value={stats.approvals} />
        <StatCard label="Documents" value={stats.documents} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SummaryCard title="Recent Projects" icon={BriefcaseBusiness} items={recentProjects} empty="No projects available yet." renderItem={(project) => (
          <MiniRecord title={project.title} meta={`${toReadableLabel(project.status)} • Due ${formatDate(project.due_date)}`} />
        )} />

        <SummaryCard title="Recent Quotes" icon={WalletCards} items={recentQuotes} empty="No quotes available yet." renderItem={(quote) => (
          <MiniRecord title={quote.quote_number || quote.title} meta={`${formatCurrency(quote.amount, quote.currency)} • ${toReadableLabel(quote.status)}`} />
        )} />

        <SummaryCard title="Recent Invoices" icon={FileText} items={recentInvoices} empty="No invoices available yet." renderItem={(invoice) => (
          <MiniRecord title={invoice.invoiceNumber || invoice.title} meta={`${formatCurrency(invoice.amount, invoice.currency)} • ${toReadableLabel(getInvoiceDisplayStatus(invoice))}`} />
        )} />

        <SummaryCard title="Recent Support" icon={LifeBuoy} items={recentTickets} empty="No support tickets available yet." renderItem={(ticket) => (
          <MiniRecord title={ticket.subject} meta={`${toReadableLabel(ticket.status)} • ${toReadableLabel(ticket.priority)}`} />
        )} />

        <SummaryCard title="Recent Documents" icon={FileText} items={recentDocuments} empty="No documents available yet." renderItem={(document) => (
          <MiniRecord title={document.title} meta={`${toReadableLabel(document.document_type)} • ${formatDate(document.created_at)}`} />
        )} />
      </div>
    </div>
  );
}

function ProjectsTab({
  projects,
  progressUpdates,
  approvals,
  approvalForms,
  approvalSaveState,
  onApprovalChange,
  onApprovalSubmit,
}) {
  return (
    <RecordSection
      title="Your Projects"
      description="Track active MKETICS project progress, view delivery updates and send approvals or feedback."
    >
      {approvalSaveState.error && (
        <StatusMessage type="error" message={approvalSaveState.error} />
      )}

      {approvalSaveState.success && (
        <StatusMessage type="success" message={approvalSaveState.success} />
      )}

      {projects.length === 0 ? (
        <EmptyState message="No project records have been linked to your portal yet." />
      ) : (
        <div className="grid gap-5">
          {projects.map((project) => {
            const projectUpdates = progressUpdates.filter(
              (update) => update.projectId === project.id
            );
            const projectApprovals = approvals.filter(
              (approval) => approval.projectId === project.id
            );
            const latestUpdate = projectUpdates[0] || null;
            const progressPercent = getProjectProgressPercent(project, latestUpdate);
            const form = approvalForms[project.id] || getDefaultApprovalForm();
            const isSaving = approvalSaveState.loadingProjectId === project.id;

            return (
              <article
                key={project.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                      {project.service_type || "MKETICS Project"}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#020B1F]">
                      {project.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
                      {project.description ||
                        "Project details will appear here when MKETICS updates this record."}
                    </p>
                  </div>

                  <StatusBadge status={project.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <DetailPill label="Start Date" value={formatDate(project.start_date)} />
                  <DetailPill label="Due Date" value={formatDate(project.due_date)} />
                  <DetailPill label="Last Updated" value={formatDate(project.updated_at)} />
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-cyan-200 bg-[#F8FCFF] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                        Project Progress
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {progressPercent}% complete
                      </p>
                    </div>
                    {latestUpdate && <StatusBadge status={latestUpdate.updateType} />}
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {latestUpdate ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-black text-[#020B1F]">
                        {latestUpdate.title}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
                        {latestUpdate.message}
                      </p>
                      {latestUpdate.nextStep && (
                        <p className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-sm font-bold leading-6 text-[#061A33]">
                          Next step: {latestUpdate.nextStep}
                        </p>
                      )}
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                        Updated {formatDate(latestUpdate.createdAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-600">
                      No detailed progress updates have been posted for this project yet.
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-[#F8FCFF] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#020B1F]">
                          Approval & Feedback History
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {projectApprovals.length} response{projectApprovals.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    {projectApprovals.length === 0 ? (
                      <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-600">
                        No approval or feedback has been submitted for this project yet.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {projectApprovals.slice(0, 4).map((approval) => (
                          <article
                            key={approval.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                              {toReadableLabel(approval.decision)} • {formatDate(approval.createdAt)}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                              {approval.feedback}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      onApprovalSubmit(project);
                    }}
                    className="rounded-[1.25rem] border border-cyan-200 bg-white p-4"
                  >
                    <p className="text-sm font-black text-[#020B1F]">
                      Send approval or feedback
                    </p>
                    <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                      Approve progress, request changes or ask a question directly from your portal.
                    </p>

                    <label className="mt-4 block">
                      <span className="text-sm font-black text-[#061A33]">
                        Response Type
                      </span>
                      <select
                        value={form.decision}
                        onChange={(event) =>
                          onApprovalChange(project.id, "decision", event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                      >
                        {projectApprovalDecisions.map((decision) => (
                          <option key={decision.value} value={decision.value}>
                            {decision.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-4 block">
                      <span className="text-sm font-black text-[#061A33]">
                        Note to MKETICS
                      </span>
                      <textarea
                        value={form.feedback}
                        onChange={(event) =>
                          onApprovalChange(project.id, "feedback", event.target.value)
                        }
                        rows={5}
                        placeholder="Example: Approved. Please continue with the next phase."
                        className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={17} className="mr-2 animate-spin" />
                          Sending Response
                        </>
                      ) : (
                        <>
                          <Send size={17} className="mr-2" />
                          Send Response
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </RecordSection>
  );
}

function QuotesTab({
  quotes,
  quoteResponses,
  quoteForms,
  actionState,
  onQuoteFormChange,
  onSubmitQuoteResponse,
}) {
  return (
    <RecordSection
      title="Your Quotes"
      description="View MKETICS quote records, accept a quote, request changes or ask MKETICS to prepare an invoice."
    >
      {actionState.error && <StatusMessage type="error" message={actionState.error} />}
      {actionState.success && <StatusMessage type="success" message={actionState.success} />}
      {paymentRequestSaveState.error && <StatusMessage type="error" message={paymentRequestSaveState.error} />}
      {paymentRequestSaveState.success && <StatusMessage type="success" message={paymentRequestSaveState.success} />}

      {quotes.length === 0 ? (
        <EmptyState message="No quote records have been linked to your portal yet." />
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => {
            const responses = quoteResponses.filter((response) => response.quoteId === quote.id);
            const form = quoteForms[quote.id] || getDefaultQuoteResponseForm();
            const isSaving = actionState.loadingQuoteId === quote.id;

            return (
              <article key={quote.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                      {quote.quote_number || "Quote"}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#020B1F]">
                      {quote.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
                      {quote.scope_summary || "Quote scope will appear here when MKETICS updates this record."}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-2xl font-black text-[#020B1F]">
                      {formatCurrency(quote.amount, quote.currency)}
                    </p>
                    <div className="mt-2 flex lg:justify-end">
                      <StatusBadge status={quote.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <DetailPill label="Valid Until" value={formatDate(quote.valid_until)} />
                  <DetailPill label="Sent" value={formatDate(quote.sent_at)} />
                  <DetailPill label="Created" value={formatDate(quote.created_at)} />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-[#F8FCFF] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#020B1F]">
                          Quote Response History
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {responses.length} response{responses.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    {responses.length === 0 ? (
                      <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-600">
                        No client response has been sent for this quote yet.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {responses.slice(0, 5).map((response) => (
                          <article key={response.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                              {toReadableLabel(response.responseType)} • {formatDate(response.createdAt)}
                            </p>
                            {response.requestInvoice && (
                              <p className="mt-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
                                Invoice requested
                              </p>
                            )}
                            {response.feedback && (
                              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                                {response.feedback}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      onSubmitQuoteResponse(quote);
                    }}
                    className="rounded-[1.25rem] border border-cyan-200 bg-white p-4"
                  >
                    <p className="text-sm font-black text-[#020B1F]">
                      Respond to quote
                    </p>
                    <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                      Accept this quote, request changes, ask a question or ask MKETICS to prepare the invoice.
                    </p>

                    <label className="mt-4 block">
                      <span className="text-sm font-black text-[#061A33]">
                        Response Type
                      </span>
                      <select
                        value={form.responseType}
                        onChange={(event) => onQuoteFormChange(quote.id, "responseType", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                      >
                        {quoteResponseTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-4 block">
                      <span className="text-sm font-black text-[#061A33]">
                        Message to MKETICS
                      </span>
                      <textarea
                        value={form.feedback}
                        onChange={(event) => onQuoteFormChange(quote.id, "feedback", event.target.value)}
                        rows={5}
                        placeholder="Example: I accept this quote. Please prepare the invoice and next steps."
                        className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                      />
                    </label>

                    <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                      <input
                        type="checkbox"
                        checked={Boolean(form.requestInvoice)}
                        onChange={(event) => onQuoteFormChange(quote.id, "requestInvoice", event.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#0B7CFF]"
                      />
                      <span className="text-sm font-bold leading-6 text-slate-700">
                        Ask MKETICS to prepare an invoice / payment request for this quote.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={17} className="mr-2 animate-spin" />
                          Sending Response
                        </>
                      ) : (
                        <>
                          <Send size={17} className="mr-2" />
                          Send Quote Response
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </RecordSection>
  );
}


function InvoicesTab({
  invoices,
  clients,
  projects,
  quotes,
  actionState,
  paymentRequests,
  paymentRequestForms,
  paymentRequestSaveState,
  onOpenProof,
  onCopyReceipt,
  onPrintInvoice,
  onPaymentRequestChange,
  onSubmitPaymentRequest,
}) {
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const quoteById = new Map(quotes.map((quote) => [quote.id, quote]));

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((sum, invoice) => sum + parseAmount(invoice.amount), 0);
    const totalPaid = invoices.reduce((sum, invoice) => sum + parseAmount(invoice.paidAmount), 0);
    const receiptCount = invoices.reduce((total, invoice) => total + getInvoiceReceipts(invoice).length, 0);
    const outstanding = Math.max(totalBilled - totalPaid, 0);

    return {
      totalBilled,
      totalPaid,
      outstanding,
      receiptCount,
      invoiceCount: invoices.length,
    };
  }, [invoices]);

  return (
    <RecordSection
      title="Invoices & Receipts"
      description="View MKETICS invoices, payment progress and receipt records linked to your client account."
    >
      {actionState.error && <StatusMessage type="error" message={actionState.error} />}
      {actionState.success && <StatusMessage type="success" message={actionState.success} />}
      {paymentRequestSaveState.error && <StatusMessage type="error" message={paymentRequestSaveState.error} />}
      {paymentRequestSaveState.success && <StatusMessage type="success" message={paymentRequestSaveState.success} />}

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Invoices" value={stats.invoiceCount} />
        <StatCard label="Total Billed" value={formatCurrency(stats.totalBilled)} />
        <StatCard label="Paid" value={formatCurrency(stats.totalPaid)} />
        <StatCard label="Outstanding" value={formatCurrency(stats.outstanding)} />
      </div>

      {invoices.length === 0 ? (
        <EmptyState message="No invoice records have been linked to your portal yet." />
      ) : (
        <div className="grid gap-5">
          {invoices.map((invoice) => {
            const client = clientById.get(invoice.clientId);
            const project = projectById.get(invoice.projectId);
            const quote = quoteById.get(invoice.quoteId);
            const receipts = getInvoiceReceipts(invoice);
            const status = getInvoiceDisplayStatus(invoice);
            const outstanding = getInvoiceOutstanding(invoice);

            return (
              <article
                key={invoice.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                      {invoice.invoiceNumber || "Invoice"}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#020B1F]">
                      {invoice.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {project ? `Project: ${project.title}` : "General MKETICS service"}
                      {quote ? ` • Quote: ${quote.quote_number || quote.title}` : ""}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-2xl font-black text-[#020B1F]">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <div className="mt-2 flex lg:justify-end">
                      <StatusBadge status={status} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailPill label="Issued" value={formatDate(invoice.issueDate)} />
                  <DetailPill label="Due" value={formatDate(invoice.dueDate)} />
                  <DetailPill label="Paid" value={formatCurrency(invoice.paidAmount, invoice.currency)} />
                  <DetailPill label="Outstanding" value={formatCurrency(outstanding, invoice.currency)} />
                </div>

                {invoice.lineItems && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
                      Scope / Line Items
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                      {invoice.lineItems}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onPrintInvoice(invoice)}
                    className="inline-flex items-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                  >
                    <Printer size={14} className="mr-2" />
                    Print / Save PDF
                  </button>
                </div>

                <InvoicePaymentRequestPanel
                  invoice={invoice}
                  requests={paymentRequests.filter((request) => request.invoiceId === invoice.id)}
                  form={paymentRequestForms[invoice.id] || getDefaultPaymentRequestForm(invoice)}
                  isSaving={paymentRequestSaveState.loadingInvoiceId === invoice.id}
                  onChange={onPaymentRequestChange}
                  onSubmit={onSubmitPaymentRequest}
                />

                <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-[#F8FCFF] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[#020B1F]">Receipt History</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {receipts.length} receipt record{receipts.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Clipboard size={18} className="text-[#0B7CFF]" />
                  </div>

                  {receipts.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-600">
                      No receipt records have been added for this invoice yet.
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {receipts.map((receipt) => (
                        <div key={receipt.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-black text-[#020B1F]">
                                {receipt.receiptNumber || "Receipt"}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-600">
                                {formatCurrency(receipt.amount, invoice.currency)} • {receipt.paymentMethod || "Payment"}
                              </p>
                              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                                {formatDate(receipt.paymentDate)}
                                {receipt.reference ? ` • Ref: ${receipt.reference}` : ""}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => onCopyReceipt(receipt, invoice)}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-[#F8FCFF] px-3 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                              >
                                <Clipboard size={13} className="mr-2" />
                                Copy
                              </button>

                              {(receipt.proofUrl || receipt.proofStoragePath) && (
                                <button
                                  type="button"
                                  onClick={() => onOpenProof(receipt)}
                                  disabled={actionState.loadingId === receipt.id}
                                  className="inline-flex items-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-3 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
                                >
                                  {actionState.loadingId === receipt.id ? (
                                    <Loader2 size={13} className="mr-2 animate-spin" />
                                  ) : (
                                    <Download size={13} className="mr-2" />
                                  )}
                                  Open Proof
                                </button>
                              )}
                            </div>
                          </div>

                          {receipt.notes && (
                            <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-3 text-sm font-semibold leading-6 text-slate-600">
                              {receipt.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </RecordSection>
  );
}

function InvoicePaymentRequestPanel({ invoice, requests, form, isSaving, onChange, onSubmit }) {
  return (
    <div className="mt-6 rounded-[1.25rem] border border-cyan-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <MessageCircle size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-[#020B1F]">
            Payment Request / Proof Message
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            Tell MKETICS you have paid, request banking details, or ask for an invoice/receipt update.
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(invoice);
        }}
        className="mt-4 grid gap-4"
      >
        <label>
          <span className="text-sm font-black text-[#061A33]">Request Type</span>
          <select
            value={form.requestType}
            onChange={(event) => onChange(invoice.id, "requestType", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
          >
            {invoicePaymentRequestTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-black text-[#061A33]">Amount</span>
            <input
              value={form.amount}
              onChange={(event) => onChange(invoice.id, "amount", event.target.value)}
              placeholder="Example: 900"
              inputMode="decimal"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label>
            <span className="text-sm font-black text-[#061A33]">Payment Reference</span>
            <input
              value={form.reference}
              onChange={(event) => onChange(invoice.id, "reference", event.target.value)}
              placeholder="Example: Bank ref / POP ref"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>

        <label>
          <span className="text-sm font-black text-[#061A33]">Message</span>
          <textarea
            value={form.note}
            onChange={(event) => onChange(invoice.id, "note", event.target.value)}
            rows={4}
            placeholder="Example: I have made payment. Please confirm receipt and update my portal."
            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 size={17} className="mr-2 animate-spin" />
              Sending Request
            </>
          ) : (
            <>
              <Send size={17} className="mr-2" />
              Send Payment Request
            </>
          )}
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
          Request History
        </p>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm font-bold leading-6 text-slate-600">
            No payment request messages have been sent for this invoice yet.
          </p>
        ) : (
          <div className="mt-3 grid gap-3">
            {requests.slice(0, 5).map((request) => (
              <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                  {toReadableLabel(request.requestType)} • {formatDate(request.createdAt)}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                  {formatCurrency(request.amount, invoice.currency)}
                  {request.reference ? ` • Ref: ${request.reference}` : ""}
                </p>
                {request.note && (
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
                    {request.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupportTab({ tickets, projects, clients, form, saveState, onChange, onSubmit }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={onSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <LifeBuoy size={22} />
        </div>

        <h2 className="mt-4 text-2xl font-black text-[#020B1F]">
          Send support request
        </h2>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
          Send a support request to MKETICS for an active project or general client support.
        </p>

        {saveState.error && <StatusMessage type="error" message={saveState.error} />}
        {saveState.success && <StatusMessage type="success" message={saveState.success} />}

        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-sm font-black text-[#061A33]">Client Record</span>
            <select name="clientId" value={form.clientId} onChange={onChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100">
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.full_name}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-black text-[#061A33]">Related Project</span>
            <select name="projectId" value={form.projectId} onChange={onChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100">
              <option value="">General support</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-black text-[#061A33]">Priority</span>
            <select name="priority" value={form.priority} onChange={onChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100">
              {supportPriorities.map((priority) => (
                <option key={priority} value={priority}>{toReadableLabel(priority)}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-black text-[#061A33]">Subject</span>
            <input name="subject" value={form.subject} onChange={onChange} placeholder="Example: Website content update request" className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100" />
          </label>

          <label>
            <span className="text-sm font-black text-[#061A33]">Description</span>
            <textarea name="description" value={form.description} onChange={onChange} rows={7} placeholder="Describe what you need help with." className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100" />
          </label>
        </div>

        <button type="submit" disabled={saveState.loading} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
          {saveState.loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Sending Request
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Send Support Request
            </>
          )}
        </button>
      </form>

      <RecordSection title="Support Tickets" description="View current and previous support requests.">
        {tickets.length === 0 ? (
          <EmptyState message="No support tickets have been created yet." />
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                      {toReadableLabel(ticket.priority)} Priority
                    </p>
                    <h3 className="mt-2 text-lg font-black text-[#020B1F]">{ticket.subject}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">{ticket.description}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>

                {ticket.resolution_notes && (
                  <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-7 text-emerald-900">
                    {ticket.resolution_notes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </RecordSection>
    </div>
  );
}

function DocumentsTab({ documents, projects, quotes, actionState, onOpenDocument }) {
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const quoteById = new Map(quotes.map((quote) => [quote.id, quote]));

  return (
    <RecordSection title="Documents" description="Open documents and shared files linked to your MKETICS client record.">
      {actionState.error && <StatusMessage type="error" message={actionState.error} />}

      {documents.length === 0 ? (
        <EmptyState message="No documents have been linked to your portal yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <article key={document.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                  <FileText size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                    {toReadableLabel(document.document_type)}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-[#020B1F]">{document.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {document.project_id && projectById.get(document.project_id)
                      ? `Project: ${projectById.get(document.project_id).title}`
                      : document.quote_id && quoteById.get(document.quote_id)
                      ? `Quote: ${quoteById.get(document.quote_id).quote_number || quoteById.get(document.quote_id).title}`
                      : "General client document"}
                  </p>

                  {document.notes && (
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-600">{document.notes}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenDocument(document)}
                    disabled={actionState.loadingId === document.id}
                    className="mt-4 inline-flex items-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
                  >
                    {actionState.loadingId === document.id ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <Download size={14} className="mr-2" />
                    )}
                    Open Document
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </RecordSection>
  );
}

function ProfileTab({ profile, clients }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <DetailCard title="Portal Profile" icon={ShieldCheck}>
        <DetailLine label="Name" value={profile?.full_name} />
        <DetailLine label="Email" value={profile?.email} />
        <DetailLine label="Phone" value={profile?.phone} />
        <DetailLine label="Organisation" value={profile?.organisation} />
        <DetailLine label="Role" value={toReadableLabel(profile?.role)} />
      </DetailCard>

      <DetailCard title="Linked Client Records" icon={FolderOpen}>
        {clients.length === 0 ? (
          <p className="text-sm font-bold leading-6 text-slate-600">
            No linked client records found.
          </p>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
              <DetailLine label="Client" value={client.full_name} />
              <DetailLine label="Email" value={client.email} />
              <DetailLine label="Phone" value={client.phone} />
              <DetailLine label="Organisation" value={client.organisation} />
            </div>
          ))
        )}
      </DetailCard>
    </div>
  );
}

function NoClientRecord({ profile }) {
  const emailLink = createEmailLink(profile);
  const whatsappLink = createWhatsAppLink(profile);

  return (
    <div className="rounded-[2rem] border border-cyan-200 bg-white p-6 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <AlertCircle size={23} />
      </div>

      <h2 className="mt-4 text-2xl font-black text-[#020B1F]">
        No linked client record yet.
      </h2>

      <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
        Your account is signed in, but MKETICS has not linked this profile to a
        client record yet. Ask MKETICS to link your portal profile to your client
        account using your email address: {profile?.email || "not available"}.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#061A33] transition hover:bg-white">
          <MessageCircle size={17} className="mr-2" />
          WhatsApp MKETICS
        </a>

        <a href={emailLink} className="inline-flex items-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300">
          <Mail size={17} className="mr-2" />
          Email MKETICS
        </a>
      </div>
    </div>
  );
}

function RecordSection({ title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-black text-[#020B1F]">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
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

function SummaryCard({ title, icon: Icon, items, empty, renderItem }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={19} />
        </div>
        <h3 className="text-lg font-black text-[#020B1F]">{title}</h3>
      </div>
      <div className="mt-5 grid gap-3">
        {items.length === 0 ? (
          <p className="text-sm font-bold leading-6 text-slate-600">{empty}</p>
        ) : (
          items.map((item) => <div key={item.id}>{renderItem(item)}</div>)
        )}
      </div>
    </article>
  );
}

function MiniRecord({ title, meta }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <p className="text-sm font-black text-[#020B1F]">{title}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#0B7CFF]">{meta}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{label}</p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
  );
}

function DetailPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value || "Not available"}</p>
    </div>
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

function StatusBadge({ status }) {
  return (
    <span className="inline-flex w-fit rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
      {toReadableLabel(status)}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6 text-center">
      <Eye className="mx-auto text-slate-400" size={28} />
      <p className="mt-3 text-sm font-black text-slate-500">{message}</p>
    </div>
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

function createEmailLink(profile) {
  const subject = "MKETICS Client Portal Access";
  const body = [
    "Hello MKETICS,",
    "",
    "Please link my client portal account to my MKETICS client record.",
    "",
    `Portal email: ${profile?.email || ""}`,
    "",
    "Regards,",
    profile?.full_name || "Client",
  ].join("\n");

  return `mailto:services@mketics.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function createWhatsAppLink(profile) {
  const message = [
    "Hello MKETICS,",
    "",
    "Please link my client portal account to my client record.",
    `Portal email: ${profile?.email || ""}`,
  ].join("\n");

  return `https://wa.me/27722864367?text=${encodeURIComponent(message)}`;
}


function getDefaultApprovalForm() {
  return {
    decision: "approved",
    feedback: "",
  };
}

function normaliseProjectProgressUpdates(value) {
  const updates = Array.isArray(value) ? value : [];

  return updates
    .filter((update) => update && update.id && update.projectId)
    .map((update) => ({
      id: update.id,
      clientId: update.clientId || "",
      projectId: update.projectId || "",
      title: update.title || "Project update",
      message: update.message || "",
      nextStep: update.nextStep || "",
      updateType: update.updateType || "progress_update",
      progressPercent: clampProgress(update.progressPercent),
      visibleToClient: update.visibleToClient !== false,
      createdAt: update.createdAt || new Date().toISOString(),
      updatedAt: update.updatedAt || update.createdAt || new Date().toISOString(),
    }))
    .filter((update) => update.visibleToClient)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normaliseProjectApprovals(value) {
  const approvals = Array.isArray(value) ? value : [];

  return approvals
    .filter((approval) => approval && approval.id && approval.projectId)
    .map((approval) => ({
      id: approval.id,
      clientId: approval.clientId || "",
      projectId: approval.projectId || "",
      projectTitle: approval.projectTitle || "MKETICS Project",
      clientName: approval.clientName || "Client",
      clientEmail: approval.clientEmail || "",
      decision: approval.decision || "approved",
      feedback: approval.feedback || "",
      createdAt: approval.createdAt || new Date().toISOString(),
      updatedAt: approval.updatedAt || approval.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getProjectProgressPercent(project, latestUpdate) {
  if (latestUpdate?.progressPercent || latestUpdate?.progressPercent === 0) {
    return clampProgress(latestUpdate.progressPercent);
  }

  const status = String(project?.status || "").toLowerCase();

  if (["completed", "done", "closed"].includes(status)) return 100;
  if (["review", "client_review", "handover"].includes(status)) return 85;
  if (["in_progress", "development", "active"].includes(status)) return 60;
  if (["awaiting_client", "waiting"].includes(status)) return 45;
  if (["planning", "quoted"].includes(status)) return 25;
  if (["new", "pending"].includes(status)) return 10;

  return 35;
}

function clampProgress(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) return 0;

  return Math.min(Math.max(parsed, 0), 100);
}

function getDefaultQuoteResponseForm() {
  return {
    responseType: "accepted",
    feedback: "",
    requestInvoice: true,
  };
}

function getDefaultPaymentRequestForm(invoice = {}) {
  return {
    requestType: "payment_made",
    amount: String(getInvoiceOutstanding(invoice) || invoice.amount || ""),
    reference: "",
    note: "",
  };
}

function normaliseQuoteResponses(value) {
  const responses = Array.isArray(value) ? value : [];

  return responses
    .filter((response) => response && response.id && response.quoteId)
    .map((response) => ({
      id: response.id,
      clientId: response.clientId || "",
      quoteId: response.quoteId || "",
      quoteNumber: response.quoteNumber || "Quote",
      quoteTitle: response.quoteTitle || "MKETICS Quote",
      responseType: response.responseType || "accepted",
      feedback: response.feedback || "",
      requestInvoice: Boolean(response.requestInvoice),
      clientName: response.clientName || "Client",
      clientEmail: response.clientEmail || "",
      createdAt: response.createdAt || new Date().toISOString(),
      updatedAt: response.updatedAt || response.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normaliseInvoicePaymentRequests(value) {
  const requests = Array.isArray(value) ? value : [];

  return requests
    .filter((request) => request && request.id && request.invoiceId)
    .map((request) => ({
      id: request.id,
      clientId: request.clientId || "",
      invoiceId: request.invoiceId || "",
      invoiceNumber: request.invoiceNumber || "Invoice",
      invoiceTitle: request.invoiceTitle || "MKETICS Invoice",
      requestType: request.requestType || "payment_made",
      amount: Number(request.amount) || 0,
      reference: request.reference || "",
      note: request.note || "",
      clientName: request.clientName || "Client",
      clientEmail: request.clientEmail || "",
      createdAt: request.createdAt || new Date().toISOString(),
      updatedAt: request.updatedAt || request.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normaliseClientInvoices(invoices) {
  if (!Array.isArray(invoices)) return [];

  return invoices
    .filter((invoice) => invoice && invoice.id)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || "Invoice",
      title: invoice.title || "MKETICS Invoice",
      clientId: invoice.clientId || "",
      projectId: invoice.projectId || "",
      quoteId: invoice.quoteId || "",
      amount: Number(invoice.amount) || 0,
      paidAmount: Number(invoice.paidAmount) || getReceiptTotal(invoice.receipts || []),
      currency: invoice.currency || "ZAR",
      issueDate: invoice.issueDate || invoice.createdAt || "",
      dueDate: invoice.dueDate || "",
      paymentStatus: invoice.paymentStatus || "draft",
      paymentMethod: invoice.paymentMethod || "Not Set",
      paymentDate: invoice.paymentDate || "",
      lineItems: invoice.lineItems || "",
      terms: invoice.terms || "",
      reference: invoice.reference || "",
      notes: invoice.notes || "",
      receipts: normaliseClientReceipts(invoice.receipts || []),
      sentAt: invoice.sentAt || "",
      paidAt: invoice.paidAt || "",
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: invoice.updatedAt || invoice.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

function normaliseClientReceipts(receipts) {
  if (!Array.isArray(receipts)) return [];

  return receipts
    .filter((receipt) => receipt && receipt.id)
    .map((receipt) => ({
      id: receipt.id,
      receiptNumber: receipt.receiptNumber || "Receipt",
      amount: Number(receipt.amount) || 0,
      paymentMethod: receipt.paymentMethod || "EFT",
      paymentDate: receipt.paymentDate || "",
      reference: receipt.reference || "",
      proofUrl: receipt.proofUrl || "",
      proofStoragePath: receipt.proofStoragePath || "",
      notes: receipt.notes || "",
      createdAt: receipt.createdAt || new Date().toISOString(),
      updatedAt: receipt.updatedAt || receipt.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getInvoiceReceipts(invoice) {
  return normaliseClientReceipts(invoice?.receipts || []);
}

function getReceiptTotal(receipts) {
  return normaliseClientReceipts(receipts).reduce(
    (total, receipt) => total + parseAmount(receipt.amount),
    0
  );
}

function getInvoiceOutstanding(invoice) {
  const amount = parseAmount(invoice?.amount);
  const paid = parseAmount(invoice?.paidAmount) || getReceiptTotal(invoice?.receipts || []);

  return Math.max(amount - paid, 0);
}

function getInvoiceDisplayStatus(invoice) {
  const amount = parseAmount(invoice?.amount);
  const paid = parseAmount(invoice?.paidAmount) || getReceiptTotal(invoice?.receipts || []);
  const status = invoice?.paymentStatus || "draft";

  if (status === "cancelled") return "cancelled";
  if (paid >= amount && amount > 0) return "paid";
  if (paid > 0) return "partial";
  if (invoice?.dueDate && startOfDay(new Date(invoice.dueDate)) < startOfDay(new Date())) {
    return "overdue";
  }

  return status;
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function buildClientReceiptText(receipt, invoice) {
  return [
    `Receipt: ${receipt.receiptNumber || "Receipt"}`,
    `Invoice: ${invoice.invoiceNumber || "Invoice"}`,
    `Amount received: ${formatCurrency(receipt.amount, invoice.currency)}`,
    `Payment method: ${receipt.paymentMethod || "EFT"}`,
    `Payment date: ${formatDate(receipt.paymentDate)}`,
    receipt.reference ? `Reference: ${receipt.reference}` : "",
    receipt.notes ? `Notes: ${receipt.notes}` : "",
    "",
    "MKETICS (PTY) LTD",
    "Speak Innovation. Deliver Value.",
  ]
    .filter(Boolean)
    .join("\n");
}

function printClientInvoice(invoice, portalState) {
  const html = buildClientInvoicePrintHtml(invoice, portalState);
  const frame = document.createElement("iframe");

  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.setAttribute("aria-hidden", "true");

  document.body.appendChild(frame);

  const printDocument = frame.contentWindow?.document;

  if (!printDocument) {
    document.body.removeChild(frame);
    return;
  }

  printDocument.open();
  printDocument.write(html);
  printDocument.close();

  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => {
      document.body.removeChild(frame);
    }, 1000);
  };
}

function buildClientInvoicePrintHtml(invoice, portalState) {
  const client = portalState.clients.find((item) => item.id === invoice.clientId);
  const project = portalState.projects.find((item) => item.id === invoice.projectId);
  const quote = portalState.quotes.find((item) => item.id === invoice.quoteId);
  const receipts = getInvoiceReceipts(invoice);
  const outstanding = getInvoiceOutstanding(invoice);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.invoiceNumber || "MKETICS Invoice")}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; font-family: Arial, sans-serif; color: #061A33; background: #ffffff; }
    .page { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 4px solid #00AEEF; padding-bottom: 24px; }
    .brand h1 { margin: 0; font-size: 28px; letter-spacing: 0.05em; }
    .brand p { margin: 6px 0; color: #475569; font-size: 13px; line-height: 1.6; }
    .badge { border: 1px solid #dbeafe; background: #EAF6FF; border-radius: 18px; padding: 18px; text-align: right; min-width: 240px; }
    .badge p { margin: 0; font-size: 11px; font-weight: 800; color: #0B7CFF; text-transform: uppercase; letter-spacing: 0.14em; }
    .badge h2 { margin: 8px 0 0; font-size: 22px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
    .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; background: #F8FCFF; }
    .card h3 { margin: 0 0 10px; font-size: 12px; color: #0B7CFF; text-transform: uppercase; letter-spacing: 0.14em; }
    .card p { margin: 4px 0; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
    .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 24px; }
    .money { border: 1px solid #e2e8f0; border-radius: 18px; padding: 16px; }
    .money p { margin: 0; font-size: 11px; color: #0B7CFF; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; }
    .money h3 { margin: 8px 0 0; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; }
    th { color: #0B7CFF; text-transform: uppercase; letter-spacing: 0.12em; font-size: 10px; }
    .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #e2e8f0; color: #475569; font-size: 12px; line-height: 1.7; }
    @media print { body { padding: 18px; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div class="brand">
        <h1>MKETICS (PTY) LTD</h1>
        <p>Speak Innovation. Deliver Value.</p>
        <p>Reg No: 2026/290708/07<br />Email: services@mketics.co.za<br />Phone: +27 72 286 4367</p>
      </div>
      <div class="badge">
        <p>Invoice</p>
        <h2>${escapeHtml(invoice.invoiceNumber || "Invoice")}</h2>
        <p>${escapeHtml(toReadableLabel(getInvoiceDisplayStatus(invoice)))}</p>
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <h3>Bill To</h3>
        <p><strong>${escapeHtml(client?.full_name || "Client")}</strong></p>
        <p>${escapeHtml(client?.email || "")}</p>
        <p>${escapeHtml(client?.phone || "")}</p>
        <p>${escapeHtml(client?.organisation || "")}</p>
      </div>
      <div class="card">
        <h3>Invoice Details</h3>
        <p>Issue date: ${escapeHtml(formatDate(invoice.issueDate))}</p>
        <p>Due date: ${escapeHtml(formatDate(invoice.dueDate))}</p>
        <p>Project: ${escapeHtml(project?.title || "Not linked")}</p>
        <p>Quote: ${escapeHtml(quote?.quote_number || quote?.title || "Not linked")}</p>
      </div>
    </section>

    <section class="card" style="margin-top: 24px;">
      <h3>Scope / Line Items</h3>
      <p>${escapeHtml(invoice.lineItems || invoice.title || "MKETICS service")}</p>
    </section>

    <section class="summary">
      <div class="money"><p>Invoice Amount</p><h3>${escapeHtml(formatCurrency(invoice.amount, invoice.currency))}</h3></div>
      <div class="money"><p>Paid</p><h3>${escapeHtml(formatCurrency(invoice.paidAmount, invoice.currency))}</h3></div>
      <div class="money"><p>Outstanding</p><h3>${escapeHtml(formatCurrency(outstanding, invoice.currency))}</h3></div>
    </section>

    <section class="card" style="margin-top: 24px;">
      <h3>Receipt History</h3>
      ${receipts.length === 0 ? "<p>No receipt records available yet.</p>" : `
        <table>
          <thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Reference</th><th>Amount</th></tr></thead>
          <tbody>
            ${receipts.map((receipt) => `
              <tr>
                <td>${escapeHtml(receipt.receiptNumber || "Receipt")}</td>
                <td>${escapeHtml(formatDate(receipt.paymentDate))}</td>
                <td>${escapeHtml(receipt.paymentMethod || "EFT")}</td>
                <td>${escapeHtml(receipt.reference || "")}</td>
                <td>${escapeHtml(formatCurrency(receipt.amount, invoice.currency))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}
    </section>

    ${invoice.terms ? `<section class="card" style="margin-top: 24px;"><h3>Terms</h3><p>${escapeHtml(invoice.terms)}</p></section>` : ""}

    <section class="footer">
      <strong>MKETICS (PTY) LTD</strong><br />
      This invoice is provided through the MKETICS Client Portal for record visibility and payment tracking.
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseAmount(value) {
  const parsed = Number.parseFloat(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(parseAmount(amount));
}

function formatDate(value) {
  if (!value) return "Not available";

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
