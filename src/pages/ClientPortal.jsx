import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import exportInvoicePDF from "../utils/generateInvoicePdf";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Bell,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  FolderKanban,
  LogOut,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Upload,
  UserCircle2,
  ArrowRight,
} from "lucide-react";

const money = (value) => `R${Number(value || 0).toLocaleString("en-ZA")}`;
const dateTime = (value) => (value ? new Date(value).toLocaleString("en-ZA") : "—");
const dateOnly = (value) => (value ? new Date(value).toLocaleDateString("en-ZA") : "—");

const projectStatusStyle = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("complete")) return "bg-green-500/10 text-green-500";
  if (normalized.includes("progress") || normalized.includes("testing")) return "bg-sky-500/10 text-sky-500";
  if (normalized.includes("hold")) return "bg-orange-500/10 text-orange-500";
  return "bg-purple-500/10 text-purple-500";
};

const nextStepText = (project) => {
  const progress = Number(project.progress || 0);
  if (progress >= 100) return "Project completed. MKETICS will support close-out or after-service requests.";
  if (progress >= 70) return "Final checks, testing and client confirmation are the next priority.";
  if (progress >= 35) return "Implementation is in progress. MKETICS will continue updating delivery progress.";
  return "Planning and setup stage. MKETICS will confirm requirements, timelines and delivery details.";
};

export default function ClientPortal() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [supportFiles, setSupportFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [selectedProjectFileId, setSelectedProjectFileId] = useState("");
  const [selectedSupportTicketId, setSelectedSupportTicketId] = useState("");
  const [clientProjectFile, setClientProjectFile] = useState(null);
  const [clientSupportFile, setClientSupportFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const clientEmail = session?.user?.email || "";

  const invoiceTotals = useMemo(() => {
    const paid = invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const outstanding = invoices
      .filter((invoice) => invoice.status !== "Paid")
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

    return { paid, outstanding };
  }, [invoices]);

  const recentProjectUpdates = useMemo(() => projectUpdates.slice(0, 3), [projectUpdates]);
  const unpaidInvoices = useMemo(() => invoices.filter((invoice) => invoice.status !== "Paid"), [invoices]);

  const buildClientQuery = (query, email, workspace) => {
    if (workspace) {
      return query.or(`workspace_id.eq.${workspace},client_email.eq.${email}`);
    }

    return query.eq("client_email", email);
  };

  const loadClientData = async (email, workspace) => {
    const projectQuery = buildClientQuery(
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      email,
      workspace
    );
    const { data: projectData } = await projectQuery;
    setProjects(projectData || []);

    const invoiceQuery = buildClientQuery(
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      email,
      workspace
    );
    const { data: invoiceData } = await invoiceQuery;
    setInvoices(invoiceData || []);

    const ticketQuery = buildClientQuery(
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      email,
      workspace
    );
    const { data: ticketData } = await ticketQuery;
    setTickets(ticketData || []);

    const fileQuery = buildClientQuery(
      supabase.from("project_files").select("*").order("created_at", { ascending: false }),
      email,
      workspace
    );
    const { data: projectFilesData } = await fileQuery;
    setProjectFiles(projectFilesData || []);

    const supportFileQuery = buildClientQuery(
      supabase.from("support_files").select("*").order("created_at", { ascending: false }),
      email,
      workspace
    );
    const { data: supportFilesData } = await supportFileQuery;
    setSupportFiles(supportFilesData || []);

    const { data: updatesData } = await supabase
      .from("project_updates")
      .select("*")
      .eq("client_email", email)
      .order("created_at", { ascending: false });
    setProjectUpdates(updatesData || []);

    const { data: notificationData } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    setNotifications(notificationData || []);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/client-login";
        return;
      }

      setSession(data.session);
      const email = data.session.user.email;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .maybeSingle();

      setProfile(profileData || null);
      setWorkspaceId(profileData?.workspace_id || null);

      await loadClientData(email, profileData?.workspace_id || null);
      setLoading(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!clientEmail) return;

    const channel = supabase
      .channel("client-portal-live-refresh")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => loadClientData(clientEmail, workspaceId))
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => loadClientData(clientEmail, workspaceId))
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => loadClientData(clientEmail, workspaceId))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [clientEmail, workspaceId]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client-login";
  };

  const downloadStoredFile = async (filePath) => {
    const { data, error } = await supabase.storage
      .from("mketics-files")
      .createSignedUrl(filePath, 60);

    if (error) {
      toast.error("Could not prepare file download.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const uploadClientProjectFile = async () => {
    if (!selectedProjectFileId || !clientProjectFile) {
      toast.error("Select a project and choose a file.");
      return;
    }

    const selectedProject = projects.find((project) => project.id === selectedProjectFileId);
    if (!selectedProject) {
      toast.error("Selected project was not found.");
      return;
    }

    setUploadingFile(true);
    const safeName = clientProjectFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `projects/${clientEmail}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("mketics-files")
      .upload(filePath, clientProjectFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setUploadingFile(false);
      toast.error("Project file upload failed.");
      return;
    }

    await supabase.from("project_files").insert([
      {
        project_id: selectedProjectFileId,
        workspace_id: workspaceId,
        client_email: clientEmail,
        file_name: clientProjectFile.name,
        file_url: filePath,
        file_type: clientProjectFile.type || "Unknown",
        category: "Client Upload",
        uploaded_by: clientEmail,
      },
    ]);

    setSelectedProjectFileId("");
    setClientProjectFile(null);
    setUploadingFile(false);
    toast.success("Project file uploaded");
    await loadClientData(clientEmail, workspaceId);
  };

  const uploadClientSupportFile = async () => {
    if (!selectedSupportTicketId || !clientSupportFile) {
      toast.error("Select a support ticket and choose a file.");
      return;
    }

    const selectedTicket = tickets.find((ticket) => ticket.id === selectedSupportTicketId);
    if (!selectedTicket) {
      toast.error("Selected support ticket was not found.");
      return;
    }

    setUploadingFile(true);
    const safeName = clientSupportFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `support/${clientEmail}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("mketics-files")
      .upload(filePath, clientSupportFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setUploadingFile(false);
      toast.error("Support file upload failed.");
      return;
    }

    await supabase.from("support_files").insert([
      {
        ticket_id: selectedSupportTicketId,
        workspace_id: workspaceId,
        client_email: clientEmail,
        file_name: clientSupportFile.name,
        file_url: filePath,
        file_type: clientSupportFile.type || "Unknown",
        uploaded_by: clientEmail,
      },
    ]);

    setSelectedSupportTicketId("");
    setClientSupportFile(null);
    setUploadingFile(false);
    toast.success("Support attachment uploaded");
    await loadClientData(clientEmail, workspaceId);
  };

  const createTicket = async () => {
    if (!ticketSubject || !ticketMessage) {
      toast.error("Complete all ticket fields.");
      return;
    }

    const { error } = await supabase.from("support_tickets").insert([
      {
        workspace_id: workspaceId,
        client_email: clientEmail,
        subject: ticketSubject,
        message: ticketMessage,
        status: "Open",
      },
    ]);

    if (error) {
      toast.error("Could not submit support ticket.");
      return;
    }

    setTicketSubject("");
    setTicketMessage("");
    toast.success("Support ticket submitted");
    await loadClientData(clientEmail, workspaceId);
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center app-bg px-4">
        <div className="text-center">
          <img src="/images/logo-icon.webp?v=2" alt="MKETICS" className="mx-auto h-16 w-16 animate-pulse object-contain" />
          <p className="mt-5 text-lg font-bold app-muted">Loading Client Portal...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-bg">
      <Toaster position="top-right" />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-10 pt-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-4 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-8 right-4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="brand-panel overflow-hidden rounded-[2rem] p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
                  <ShieldCheck className="h-4 w-4" />
                  MKETICS Client Portal
                </div>

                <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Your project workspace
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 app-muted sm:text-lg">
                  View your MKETICS projects, invoices, support requests, documents and important updates in one secure place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {["Projects", "Invoices", "Support", "Documents"].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-500">
                      {item}
                    </a>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href="/docs/MKETICS_Service_Catalogue.pdf" download className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 px-5 py-3 text-sm font-black text-sky-500 hover:bg-sky-500/10">
                    <Download className="h-4 w-4" /> Download Catalogue
                  </a>
                  <a href="https://wa.me/27722864367" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white hover:bg-green-400">
                    <MessageCircle className="h-4 w-4" /> WhatsApp MKETICS
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-sky-400/20 bg-white/70 p-5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <UserCircle2 className="h-14 w-14 text-sky-500" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] app-subtle">Logged in as</p>
                    <p className="mt-1 max-w-[260px] break-words font-black">{clientEmail}</p>
                    <p className="mt-1 text-sm app-muted">{profile?.company_name || "Client Workspace"}</p>
                  </div>
                </div>

                <button onClick={logout} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Projects", value: projects.length, icon: FolderKanban, tone: "text-sky-500" },
            { label: "Invoices", value: invoices.length, icon: FileText, tone: "text-green-500" },
            { label: "Open Tickets", value: tickets.filter((ticket) => ticket.status !== "Closed").length, icon: MessageSquare, tone: "text-orange-500" },
            { label: "Outstanding", value: money(invoiceTotals.outstanding), icon: CreditCard, tone: "text-cyan-500" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="brand-card rounded-[1.6rem] p-5 shadow-xl">
                <div className={`inline-flex rounded-2xl bg-white/5 p-3 ${item.tone}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] app-subtle">{item.label}</p>
                <h2 className="mt-2 text-3xl font-black break-words">{item.value}</h2>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Workspace Summary</p>
            <h2 className="mt-3 text-3xl font-black">What needs attention</h2>
            <div className="mt-6 grid gap-4">
              {unpaidInvoices.length > 0 ? (
                unpaidInvoices.slice(0, 3).map((invoice) => (
                  <a key={invoice.id} href="#invoices" className="group rounded-[1.3rem] app-surface p-5 transition hover:-translate-y-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Payment Required</p>
                        <h3 className="mt-2 text-xl font-black">{invoice.invoice_number}</h3>
                        <p className="mt-1 app-muted">{invoice.service || "MKETICS service invoice"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sky-500">
                        <span className="text-2xl font-black">{money(invoice.amount)}</span>
                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-[1.3rem] app-surface p-5">
                  <p className="font-black text-green-500">No outstanding invoices</p>
                  <p className="mt-2 app-muted">Your MKETICS billing status is clear.</p>
                </div>
              )}
            </div>
          </div>

          <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-500">Recent Updates</p>
            <h2 className="mt-3 text-3xl font-black">Latest from MKETICS</h2>
            <div className="mt-6 grid gap-4">
              {recentProjectUpdates.length ? recentProjectUpdates.map((update) => (
                <div key={update.id} className="rounded-[1.3rem] app-surface p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">Project Update</p>
                  <h3 className="mt-2 font-black">{update.update_title}</h3>
                  <p className="mt-2 text-sm leading-6 app-muted">{update.update_message || "No additional details provided."}</p>
                  <p className="mt-3 text-xs app-subtle">{dateTime(update.created_at)}</p>
                </div>
              )) : (
                <div className="rounded-[1.3rem] app-surface p-5">
                  <p className="font-black">No updates yet</p>
                  <p className="mt-2 app-muted">Project updates will appear here when MKETICS posts progress notes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-7xl px-4 pb-10">
        <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Project Tracking</p>
              <h2 className="mt-3 text-3xl font-black">My Projects</h2>
              <p className="mt-4 max-w-3xl leading-8 app-muted">Track active work, progress, status and delivery updates from MKETICS.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {projects.map((project) => (
              <div key={project.id} className="rounded-[1.5rem] app-surface p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black">{project.project_name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${projectStatusStyle(project.status)}`}>{project.status || "Planning"}</span>
                    </div>
                    <p className="mt-3 leading-7 app-muted">{project.description || project.service || "Project details will be updated by MKETICS."}</p>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                    <p className="mt-2 text-sm font-black text-sky-500">{project.progress || 0}% complete</p>
                    <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">Next Step</p>
                      <p className="mt-2 text-sm leading-6 app-muted">{nextStepText(project)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-black/5 p-4 text-sm app-subtle dark:bg-black/20">
                    <p className="font-black text-sky-500">Created</p>
                    <p>{dateOnly(project.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}

            {!projects.length && <EmptyState icon={FolderKanban} title="No projects yet" message="When MKETICS creates a project for you, it will appear here." />}
          </div>

          {!!projectUpdates.length && (
            <div className="mt-10">
              <h3 className="text-2xl font-black">Latest Updates</h3>
              <div className="mt-5 grid gap-4">
                {projectUpdates.slice(0, 5).map((update) => (
                  <div key={update.id} className="rounded-[1.5rem] app-surface p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">Project Update</p>
                    <h4 className="mt-2 text-xl font-black">{update.update_title}</h4>
                    <p className="mt-3 leading-7 app-muted">{update.update_message || "No additional details provided."}</p>
                    <p className="mt-3 text-sm app-subtle">{dateTime(update.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="invoices" className="mx-auto max-w-7xl px-4 pb-10">
        <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-green-500">Billing</p>
            <h2 className="mt-3 text-3xl font-black">My Invoices</h2>
            <p className="mt-4 max-w-3xl leading-8 app-muted">Download MKETICS invoices and use the invoice number as your payment reference.</p>
          </div>

          <div className="mt-6 grid gap-4 rounded-[1.5rem] app-surface p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] app-subtle">Outstanding</p>
              <p className="mt-2 text-3xl font-black text-orange-500">{money(invoiceTotals.outstanding)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] app-subtle">Paid</p>
              <p className="mt-2 text-3xl font-black text-green-500">{money(invoiceTotals.paid)}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[1.5rem] app-surface p-5">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black">{invoice.invoice_number}</h3>
                      <span className={`rounded-full px-4 py-2 text-xs font-black ${invoice.status === "Paid" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"}`}>{invoice.status || "Unpaid"}</span>
                    </div>
                    <p className="mt-2 app-muted">{invoice.service || invoice.notes || "MKETICS service invoice"}</p>
                    <p className="mt-4 text-3xl font-black text-sky-500">{money(invoice.amount)}</p>
                    <p className="mt-2 text-sm app-subtle">Created: {dateOnly(invoice.created_at)} {invoice.due_date ? `• Due: ${dateOnly(invoice.due_date)}` : ""}</p>
                    {invoice.status !== "Paid" && (
                      <div className="mt-5 grid gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/5 p-4 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Banking</p>
                          <p className="mt-1 font-bold">Standard Bank • 10274150083</p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Reference</p>
                          <p className="mt-1 font-bold">{invoice.invoice_number}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <button onClick={() => exportInvoicePDF(invoice)} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                    {invoice.payment_url && invoice.status !== "Paid" && (
                      <button onClick={() => window.open(invoice.payment_url, "_blank")} className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white">
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!invoices.length && <EmptyState icon={FileText} title="No invoices yet" message="When MKETICS creates an invoice for your project, it will appear here." />}
          </div>
        </div>
      </section>

      <section id="support" className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Support Center</p>
            <h2 className="mt-3 text-3xl font-black">Request Support</h2>
            <p className="mt-4 leading-8 app-muted">Report an issue, ask a question or request help from MKETICS.</p>

            <div className="mt-8 grid gap-4">
              <input type="text" placeholder="Ticket subject" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="app-input rounded-2xl px-5 py-4 outline-none" />
              <textarea placeholder="Describe what you need help with..." value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} rows={6} className="app-input rounded-2xl px-5 py-4 outline-none" />
              <button onClick={createTicket} className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white">Submit Support Ticket</button>
            </div>
          </div>

          <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Ticket History</p>
            <h2 className="mt-3 text-3xl font-black">My Tickets</h2>

            <div className="mt-8 grid gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-[1.5rem] app-surface p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black">{ticket.subject}</h3>
                      <p className="mt-2 leading-7 app-muted">{ticket.message}</p>
                      <p className="mt-3 text-sm app-subtle">{dateTime(ticket.created_at)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${ticket.status === "Closed" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"}`}>{ticket.status || "Open"}</span>
                  </div>
                </div>
              ))}

              {!tickets.length && <EmptyState icon={MessageSquare} title="No support tickets yet" message="Create a ticket when you need help from MKETICS." />}
            </div>
          </div>
        </div>
      </section>

      <section id="documents" className="mx-auto max-w-7xl px-4 pb-10">
        <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Document Center</p>
            <h2 className="mt-3 text-3xl font-black">Files & Attachments</h2>
            <p className="mt-4 max-w-3xl leading-8 app-muted">Upload requirements, screenshots, proof documents and download MKETICS deliverables securely.</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <UploadBox
              title="Upload Project File"
              selectLabel="Select Project"
              items={projects.map((project) => ({ id: project.id, label: project.project_name }))}
              selectedId={selectedProjectFileId}
              onSelect={setSelectedProjectFileId}
              onFile={setClientProjectFile}
              onUpload={uploadClientProjectFile}
              uploading={uploadingFile}
              buttonText="Upload Project File"
            />
            <UploadBox
              title="Upload Support Attachment"
              selectLabel="Select Support Ticket"
              items={tickets.map((ticket) => ({ id: ticket.id, label: ticket.subject }))}
              selectedId={selectedSupportTicketId}
              onSelect={setSelectedSupportTicketId}
              onFile={setClientSupportFile}
              onUpload={uploadClientSupportFile}
              uploading={uploadingFile}
              buttonText="Upload Support File"
            />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <FileList title="Project Files" files={projectFiles} onDownload={downloadStoredFile} />
            <FileList title="Support Files" files={supportFiles} onDownload={downloadStoredFile} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl bg-orange-500/10 p-4 text-orange-500">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Notifications</p>
              <h2 className="mt-2 text-3xl font-black">MKETICS Updates</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-[1.5rem] app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black">{notification.title || "Notification"}</h3>
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-500">{notification.type || "info"}</span>
                    </div>
                    <p className="mt-3 leading-8 app-muted">{notification.message}</p>
                  </div>
                  <p className="shrink-0 text-sm app-subtle">{dateTime(notification.created_at)}</p>
                </div>
              </div>
            ))}

            {!notifications.length && <EmptyState icon={Bell} title="No notifications yet" message="Important MKETICS updates will appear here." />}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="rounded-[1.5rem] app-surface p-8 text-center">
      <Icon className="mx-auto h-12 w-12 text-sky-500" />
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl app-muted">{message}</p>
    </div>
  );
}

function UploadBox({ title, selectLabel, items, selectedId, onSelect, onFile, onUpload, uploading, buttonText }) {
  return (
    <div className="rounded-[1.5rem] app-surface p-5">
      <p className="font-black">{title}</p>
      <div className="mt-5 grid gap-4">
        <select value={selectedId} onChange={(e) => onSelect(e.target.value)} className="app-input rounded-2xl px-5 py-4 outline-none">
          <option value="">{selectLabel}</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <input type="file" onChange={(e) => onFile(e.target.files?.[0] || null)} className="app-input rounded-2xl px-5 py-4 outline-none" />
        <button onClick={onUpload} disabled={uploading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 font-black text-white disabled:opacity-60">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : buttonText}
        </button>
      </div>
    </div>
  );
}

function FileList({ title, files, onDownload }) {
  return (
    <div>
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-5 grid gap-4">
        {files.map((file) => (
          <div key={file.id} className="rounded-2xl app-surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-words font-black">{file.file_name}</p>
                <p className="mt-1 text-xs app-muted">{dateTime(file.created_at)}</p>
              </div>
              <button onClick={() => onDownload(file.file_url)} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        ))}
        {!files.length && (
          <div className="rounded-2xl app-surface p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-sky-500" />
            <p className="mt-3 font-bold app-muted">No files yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
