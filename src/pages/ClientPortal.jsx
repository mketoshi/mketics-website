import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import exportInvoicePDF from "../utils/generateInvoicePdf";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  FolderKanban,
  FileText,
  MessageSquare,
  ShieldCheck,
  UserCircle2,
  LogOut,
  Download,
  CreditCard,
  Upload,
  Bell,
} from "lucide-react";

export default function ClientPortal() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [supportFiles, setSupportFiles] = useState([]);
  const [clientNotifications, setClientNotifications] = useState([]);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [tickets, setTickets] = useState([]);

  const [selectedProjectFileId, setSelectedProjectFileId] = useState("");
  const [selectedSupportTicketId, setSelectedSupportTicketId] = useState("");
  const [clientProjectFile, setClientProjectFile] = useState(null);
  const [clientSupportFile, setClientSupportFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [invoiceReminders, setInvoiceReminders] = useState([]);
  const [onboardingRecords, setOnboardingRecords] = useState([]);
  const [liveSupportMessages, setLiveSupportMessages] = useState([]);
  const [liveSupportMessage, setLiveSupportMessage] = useState("");

  const [aiQuoteRequirements, setAiQuoteRequirements] = useState("");
  const [aiQuoteResult, setAiQuoteResult] = useState("");

  const [subscriptionRecords, setSubscriptionRecords] = useState([]);
  const [clientWorkspaces, setClientWorkspaces] = useState([]);
  const [generatedProposals, setGeneratedProposals] = useState([]);

  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [saasUsageTracking, setSaasUsageTracking] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/client-login";
        return;
      }

      setSession(data.session);

      const email = data.session.user.email;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.session.user.id)
        .single();

      if (profileError || !profileData) {
        toast.error("Workspace profile not found. Please contact MKETICS support.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setWorkspaceId(profileData.workspace_id);

      const workspace = profileData.workspace_id;

      const { data: invoiceData } = await supabase
        .from("invoices")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", {
          ascending: false,
        });

      setInvoices(invoiceData || []);

      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", {
          ascending: false,
        });

      setProjects(projectData || []);

      const { data: updatesData } = await supabase
        .from("project_updates")
        .select("*")
        .eq("client_email", email)
        .order("created_at", {
          ascending: false,
        });

      setProjectUpdates(updatesData || []);

      const { data: ticketData } = await supabase
        .from("support_tickets")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", {
          ascending: false,
        });

      setTickets(ticketData || []);

      const { data: projectFilesData } = await supabase
        .from("project_files")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", {
          ascending: false,
        });

      setProjectFiles(projectFilesData || []);

      const { data: supportFilesData } = await supabase
        .from("support_files")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", {
          ascending: false,
        });

      setSupportFiles(supportFilesData || []);

      const { data: notificationData } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(8);

      setClientNotifications(notificationData || []);

      const { data: reminderData } = await supabase
        .from("invoice_reminders")
        .select("*")
        .eq("client_email", email)
        .order("created_at", { ascending: false });

      setInvoiceReminders(reminderData || []);

      const { data: onboardingData } = await supabase
        .from("client_onboarding")
        .select("*")
        .eq("client_email", email)
        .order("created_at", { ascending: false });

      setOnboardingRecords(onboardingData || []);

      const { data: liveMessagesData } = await supabase
        .from("live_support_messages")
        .select("*")
        .eq("client_email", email)
        .order("created_at", { ascending: true });

      setLiveSupportMessages(liveMessagesData || []);

      const { data: subscriptionData } = await supabase
        .from("subscription_records")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", { ascending: false });

      setSubscriptionRecords(subscriptionData || []);

      const { data: workspaceData } = await supabase
        .from("company_workspaces")
        .select("*")
        .eq("owner_email", email)
        .order("created_at", { ascending: false });

      setClientWorkspaces(workspaceData || []);

      const { data: proposalsData } = await supabase
        .from("generated_proposals")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", { ascending: false });

      setGeneratedProposals(proposalsData || []);

      const { data: paymentData } = await supabase
        .from("payment_transactions")
        .select("*")
        .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
        .order("created_at", { ascending: false });

      setPaymentTransactions(paymentData || []);

      const { data: usageData } = await supabase
        .from("saas_usage_tracking")
        .select("*")
        .eq("client_email", email)
        .order("created_at", { ascending: false });

      setSaasUsageTracking(usageData || []);

      setLoading(false);
    };

    checkSession();
  }, []);

useEffect(() => {
  const notificationChannel = supabase
    .channel("admin-notifications-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "admin_notifications",
      },
      async () => {
        const { data: notificationData } = await supabase
          .from("admin_notifications")
          .select("*")
          .order("created_at", {
            ascending: false,
          })
          .limit(8);

        setClientNotifications(notificationData || []);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(notificationChannel);
  };
}, []);


useEffect(() => {
  if (!session?.user?.email || !workspaceId) return;

  const supportChannel = supabase
    .channel("client-support-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "support_tickets",
      },
      async () => {
        const { data: refreshedTickets } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", {
            ascending: false,
          });

        setTickets(refreshedTickets || []);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(supportChannel);
  };
}, [session, workspaceId]);

useEffect(() => {
  if (!session?.user?.email) return;

  const liveSupportChannel = supabase
    .channel("client-live-support-messages")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "live_support_messages",
      },
      async () => {
        const { data: liveMessagesData } = await supabase
          .from("live_support_messages")
          .select("*")
          .eq("client_email", session.user.email)
          .order("created_at", { ascending: true });

        setLiveSupportMessages(liveMessagesData || []);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(liveSupportChannel);
  };
}, [session]);

useEffect(() => {
  if (!session?.user?.email || !workspaceId) return;

  const paymentChannel = supabase
    .channel("client-payment-transactions-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "payment_transactions",
      },
      async () => {
        const { data: paymentData } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });

        setPaymentTransactions(paymentData || []);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(paymentChannel);
  };
}, [session, workspaceId]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client-login";
  };

  const refreshFiles = async () => {
    const email = session.user.email;
    const workspace = workspaceId;

    const { data: projectFilesData } = await supabase
      .from("project_files")
      .select("*")
      .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
      .order("created_at", {
        ascending: false,
      });

    setProjectFiles(projectFilesData || []);

    const { data: supportFilesData } = await supabase
      .from("support_files")
      .select("*")
      .or(`workspace_id.eq.${workspace},client_email.eq.${email}`)
      .order("created_at", {
        ascending: false,
      });

    setSupportFiles(supportFilesData || []);
  };

  const downloadStoredFile = async (filePath) => {
    const { data, error } = await supabase.storage
      .from("mketics-files")
      .createSignedUrl(filePath, 60);

    if (error) {
      alert("Could not prepare file download.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const uploadClientProjectFile = async () => {
    if (!selectedProjectFileId || !clientProjectFile) {
      alert("Select a project and choose a file.");
      return;
    }

    const selectedProject = projects.find(
      (project) => project.id === selectedProjectFileId
    );

    if (!selectedProject) {
      alert("Selected project was not found.");
      return;
    }

    setUploadingFile(true);

    const email = session.user.email;
    const safeName = clientProjectFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `projects/${email}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("mketics-files")
      .upload(filePath, clientProjectFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploadingFile(false);
      alert("Project file upload failed.");
      return;
    }

    await supabase.from("project_files").insert([
      {
        project_id: selectedProjectFileId,
        workspace_id: workspaceId,
        client_email: email,
        file_name: clientProjectFile.name,
        file_url: filePath,
        file_type: clientProjectFile.type || "Unknown",
        category: "Client Upload",
        uploaded_by: email,
      },
    ]);

    await supabase.from("activity_logs").insert([
      {
        user_email: email,
        action: `Uploaded project file: ${clientProjectFile.name}`,
        module: "Files",
      },
    ]);

    setSelectedProjectFileId("");
    setClientProjectFile(null);
    setUploadingFile(false);

    await refreshFiles();
  };

  const uploadClientSupportFile = async () => {
    if (!selectedSupportTicketId || !clientSupportFile) {
      alert("Select a support ticket and choose a file.");
      return;
    }

    const selectedTicket = tickets.find(
      (ticket) => ticket.id === selectedSupportTicketId
    );

    if (!selectedTicket) {
      alert("Selected support ticket was not found.");
      return;
    }

    setUploadingFile(true);

    const email = session.user.email;
    const safeName = clientSupportFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `support/${email}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("mketics-files")
      .upload(filePath, clientSupportFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploadingFile(false);
      alert("Support file upload failed.");
      return;
    }

    await supabase.from("support_files").insert([
      {
        ticket_id: selectedSupportTicketId,
        workspace_id: workspaceId,
        client_email: email,
        file_name: clientSupportFile.name,
        file_url: filePath,
        file_type: clientSupportFile.type || "Unknown",
        uploaded_by: email,
      },
    ]);

    await supabase.from("activity_logs").insert([
      {
        user_email: email,
        action: `Uploaded support file: ${clientSupportFile.name}`,
        module: "Files",
      },
    ]);

    setSelectedSupportTicketId("");
    setClientSupportFile(null);
    setUploadingFile(false);

    await refreshFiles();
  };

  
  const sendClientLiveSupportMessage = async () => {
    if (!liveSupportMessage) {
      alert("Type a message first.");
      return;
    }

    const email = session.user.email;

    await supabase.from("live_support_messages").insert([
      {
        client_email: email,
        sender_email: email,
        sender_type: "client",
        message: liveSupportMessage,
        status: "Sent",
      },
    ]);

    setLiveSupportMessage("");
    toast.success("Message sent");
  };

  const generateClientAiQuote = () => {
    if (!aiQuoteRequirements) {
      alert("Describe what you need first.");
      return;
    }

    const lower = aiQuoteRequirements.toLowerCase();

    let estimate = 1500;
    if (lower.includes("website")) estimate += 3500;
    if (lower.includes("ecommerce") || lower.includes("shop")) estimate += 6500;
    if (lower.includes("cctv")) estimate += 5000;
    if (lower.includes("network") || lower.includes("wifi")) estimate += 4000;
    if (lower.includes("portal") || lower.includes("dashboard")) estimate += 8500;
    if (lower.includes("hosting")) estimate += 1200;
    if (lower.includes("support")) estimate += 900;

    setAiQuoteResult(
      `Estimated starting price: R${estimate.toLocaleString()}\n\nThis is an AI-assisted estimate. MKETICS will review your requirements and prepare a formal quotation.`
    );

    toast.success("Estimate generated");
  };


  const exportClientProposalPDF = (proposal) => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MKETICS Proposal", 15, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(proposal.proposal_content || "", 180);
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 6;
    });

    doc.save(`${(proposal.proposal_title || "MKETICS-Proposal").replace(/[^a-z0-9]/gi, "-")}.pdf`);
  };

const createTicket = async () => {
    if (!ticketSubject || !ticketMessage) {
      alert("Complete all ticket fields.");
      return;
    }

    const email = session.user.email;

    await supabase.from("support_tickets").insert([
      {
        workspace_id: workspaceId,
        client_email: email,
        subject: ticketSubject,
        message: ticketMessage,
      },
    ]);

    await supabase.from("activity_logs").insert([
      {
        user_email: email,
        action: "Created support ticket",
        module: "Support",
      },
    ]);

    setTicketSubject("");
    setTicketMessage("");

    const { data: refreshedTickets } = await supabase
      .from("support_tickets")
      .select("*")
      .or(`workspace_id.eq.${workspaceId},client_email.eq.${email}`)
      .order("created_at", {
        ascending: false,
      });

    setTickets(refreshedTickets || []);
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center app-bg">
        <div className="text-center">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="mx-auto h-16 w-16 animate-pulse object-contain"
          />

          <p className="mt-5 text-lg font-bold app-muted">
            Loading Client Portal...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-bg">
      <Toaster position="top-right" />
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-32">
        <div className="glass-card rounded-[2rem] p-8 md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
                <ShieldCheck className="h-4 w-4" />
                Secure Client Access
              </div>

              <h1 className="mt-6 text-4xl font-black md:text-6xl">
                Welcome Back
              </h1>

              <p className="mt-4 text-lg font-bold text-sky-500">
                Workspace: {profile?.company_name || "MKETICS Workspace"}
              </p>

              <p className="mt-5 max-w-2xl text-lg leading-8 app-muted">
                Access your MKETICS projects, invoices,
                support requests, and digital services.
              </p>
            </div>

            <div className="rounded-[2rem] app-surface p-6">
              <div className="flex items-center gap-4">
                <UserCircle2 className="h-14 w-14 text-sky-500" />

                <div>
                  <p className="text-sm app-subtle">Logged in as</p>

                  <p className="max-w-[260px] break-words font-bold">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      
      
      
      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Payment Portal
          </p>

          <h2 className="mt-3 text-3xl font-black">
            PayFast / Yoco Checkout
          </h2>

          <p className="mt-4 leading-8 app-muted">
            View payment links prepared by MKETICS and track payment status.
          </p>

          <div className="mt-8 grid gap-4">
            {paymentTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">
                      {transaction.provider} Payment
                    </p>

                    <p className="mt-1 text-sm app-muted">
                      R{Number(transaction.amount || 0).toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs app-subtle">
                      {transaction.provider_reference || "No reference"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        transaction.payment_status === "Paid"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {transaction.payment_status || "Pending"}
                    </span>

                    {transaction.checkout_url && transaction.payment_status !== "Paid" && (
                      <button
                        onClick={() => window.open(transaction.checkout_url, "_blank")}
                        className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!paymentTransactions.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No payment transactions yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-purple-500">
            SaaS Usage
          </p>

          <h2 className="mt-3 text-3xl font-black">
            My Usage Limits
          </h2>

          <div className="mt-8 grid gap-4">
            {saasUsageTracking.map((usage) => {
              const percent = usage.usage_limit
                ? Math.min(100, (Number(usage.usage_count || 0) / Number(usage.usage_limit || 1)) * 100)
                : 0;

              return (
                <div key={usage.id} className="rounded-2xl app-surface p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black">{usage.usage_type}</p>
                      <p className="mt-1 text-sm app-subtle">{usage.billing_period}</p>
                    </div>

                    <p className="text-sm font-black text-purple-500">
                      {usage.usage_count || 0}/{usage.usage_limit || 0}
                    </p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {!saasUsageTracking.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No usage tracking yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

<section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-purple-500">My Workspace</p>
          <h2 className="mt-3 text-3xl font-black">Company Workspace Access</h2>
          <p className="mt-4 text-sm app-muted">
            Active workspace ID: {workspaceId || "Not assigned"}
          </p>

          <div className="mt-8 grid gap-4">
            {clientWorkspaces.map((workspace) => (
              <div key={workspace.id} className="rounded-2xl app-surface p-5">
                <p className="font-black">{workspace.company_name}</p>
                <p className="mt-1 text-sm app-subtle">{workspace.company_slug}</p>
                <p className="mt-1 text-sm app-muted">{workspace.plan_type} • {workspace.status}</p>
              </div>
            ))}
            {!clientWorkspaces.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No workspace assigned yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">Subscriptions</p>
          <h2 className="mt-3 text-3xl font-black">My Billing Plans</h2>

          <div className="mt-8 grid gap-4">
            {subscriptionRecords.map((record) => (
              <div key={record.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{record.subscription_plan}</p>
                    <p className="mt-1 text-sm app-muted">{record.billing_cycle} • R{Number(record.amount || 0).toLocaleString()}</p>
                    <p className="mt-1 text-xs app-subtle">Next billing: {record.next_billing_date || "Not set"}</p>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-xs font-black ${
                    record.payment_status === "Paid"
                      ? "bg-green-500/10 text-green-500"
                      : record.payment_status === "Overdue"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-orange-500/10 text-orange-500"
                  }`}>
                    {record.payment_status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
            {!subscriptionRecords.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No subscription records yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">Proposals & Quotations</p>
          <h2 className="mt-3 text-3xl font-black">My Generated Proposals</h2>

          <div className="mt-8 grid gap-4">
            {generatedProposals.map((proposal) => (
              <div key={proposal.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{proposal.proposal_title}</p>
                    <p className="mt-1 text-sm app-subtle">
                      {proposal.created_at ? new Date(proposal.created_at).toLocaleString("en-ZA") : "—"}
                    </p>
                  </div>
                  <button onClick={() => exportClientProposalPDF(proposal)} className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">Download PDF</button>
                </div>
              </div>
            ))}
            {!generatedProposals.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No generated proposals yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

<section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-purple-500">
            Onboarding
          </p>

          <h2 className="mt-3 text-3xl font-black">
            My Onboarding Progress
          </h2>

          <div className="mt-8 grid gap-4">
            {onboardingRecords.map((record) => (
              <div key={record.id} className="rounded-2xl app-surface p-5">
                <p className="font-black">{record.business_name || record.client_name}</p>
                <p className="mt-2 text-sm app-muted">{record.service_type}</p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{
                      width:
                        record.onboarding_stage === "Active Client"
                          ? "100%"
                          : record.onboarding_stage === "Project Started"
                          ? "80%"
                          : record.onboarding_stage === "Payment Pending"
                          ? "60%"
                          : record.onboarding_stage === "Invoice Sent"
                          ? "45%"
                          : record.onboarding_stage === "Requirements Received"
                          ? "30%"
                          : "15%",
                    }}
                  />
                </div>

                <p className="mt-3 text-sm font-black text-purple-500">
                  {record.onboarding_stage || "Account Created"}
                </p>
              </div>
            ))}

            {!onboardingRecords.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No onboarding progress yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-orange-500">
            Invoice Alerts
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Payment Reminders
          </h2>

          <div className="mt-8 grid gap-4">
            {invoiceReminders.map((reminder) => (
              <div key={reminder.id} className="rounded-2xl app-surface p-5">
                <p className="font-black">{reminder.invoice_number}</p>
                <p className="mt-2 text-sm app-muted">{reminder.reminder_message}</p>

                <span className="mt-4 inline-flex rounded-full bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-500">
                  {reminder.status || "Pending"}
                </span>
              </div>
            ))}

            {!invoiceReminders.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No invoice reminders.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">
            Live Support
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Chat with MKETICS
          </h2>

          <div className="mt-8 max-h-[420px] overflow-y-auto rounded-[2rem] app-surface p-5">
            {liveSupportMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 rounded-2xl p-4 ${
                  msg.sender_type === "client"
                    ? "bg-sky-500/10"
                    : "bg-green-500/10"
                }`}
              >
                <p className="text-xs font-black uppercase app-subtle">
                  {msg.sender_type}
                </p>
                <p className="mt-2 text-sm">{msg.message}</p>
              </div>
            ))}

            {!liveSupportMessages.length && (
              <p className="text-center font-bold app-muted">
                No live chat messages yet.
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-4">
            <textarea
              placeholder="Type your message..."
              value={liveSupportMessage}
              onChange={(e) => setLiveSupportMessage(e.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={sendClientLiveSupportMessage}
              className="rounded-2xl bg-green-500 px-5 py-4 font-black text-white"
            >
              Send Message
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            AI Quote Request
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Quick Estimate
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Describe what you need and get a quick AI-assisted starting estimate.
          </p>

          <div className="mt-8 grid gap-4">
            <textarea
              placeholder="Example: I need a website with hosting, email setup, support, and business profile..."
              value={aiQuoteRequirements}
              onChange={(e) => setAiQuoteRequirements(e.target.value)}
              rows={6}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={generateClientAiQuote}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Generate Estimate
            </button>
          </div>

          {aiQuoteResult && (
            <pre className="mt-8 whitespace-pre-wrap rounded-[2rem] app-surface p-6 text-sm leading-7">
              {aiQuoteResult}
            </pre>
          )}
        </div>
      </section>

<section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <FolderKanban className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">Projects</h2>

            <p className="mt-4 leading-8 app-muted">
              Track active projects, deployment progress,
              infrastructure work, and software systems.
            </p>

            <p className="mt-6 text-3xl font-black text-sky-500">
              {projects.length}
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <FileText className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">Invoices</h2>

            <p className="mt-4 leading-8 app-muted">
              View invoices, download branded PDF copies,
              and prepare payment references.
            </p>

            <p className="mt-6 text-3xl font-black text-sky-500">
              {invoices.length}
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <MessageSquare className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">Support</h2>

            <p className="mt-4 leading-8 app-muted">
              Create support tickets and track MKETICS
              responses inside your portal.
            </p>

            <p className="mt-6 text-3xl font-black text-sky-500">
              {tickets.length}
            </p>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl bg-orange-500/10 p-4 text-orange-500">
              <Bell className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Notifications
              </p>

              <h2 className="mt-2 text-3xl font-black">
                MKETICS Updates
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {clientNotifications.map((notification) => (
              <div key={notification.id} className="rounded-[2rem] app-surface p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black">
                        {notification.title || "Notification"}
                      </h3>

                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-500">
                        {notification.type || "info"}
                      </span>
                    </div>

                    <p className="mt-3 leading-8 app-muted">
                      {notification.message}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm app-subtle">
                    {notification.created_at
                      ? new Date(notification.created_at).toLocaleString("en-ZA")
                      : "—"}
                  </p>
                </div>
              </div>
            ))}

            {!clientNotifications.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No notifications yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Project Timeline
          </p>

          <h2 className="mt-3 text-3xl font-black">
            My Projects & Updates
          </h2>

          <p className="mt-4 max-w-3xl leading-8 app-muted">
            Track active project progress, delivery stages, and MKETICS
            project communication updates.
          </p>

          <div className="mt-8 grid gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-[2rem] app-surface p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-2xl font-black">
                      {project.project_name}
                    </h3>

                    <p className="mt-2 app-muted">
                      Status: {project.status || "Planning"}
                    </p>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{
                          width: `${project.progress || 0}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-sm font-bold text-sky-500">
                      {project.progress || 0}% Complete
                    </p>
                  </div>

                  <p className="text-sm app-subtle">
                    {project.created_at
                      ? new Date(project.created_at).toLocaleDateString("en-ZA")
                      : "—"}
                  </p>
                </div>
              </div>
            ))}

            {!projects.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <FolderKanban className="mx-auto h-12 w-12 text-sky-500" />

                <h3 className="mt-5 text-2xl font-black">
                  No projects yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl app-muted">
                  When MKETICS creates a project for you, it will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-black">
              Timeline Updates
            </h3>

            <div className="mt-6 grid gap-5">
              {projectUpdates.map((update) => (
                <div
                  key={update.id}
                  className="rounded-[2rem] app-surface p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                        Project Update
                      </p>

                      <h4 className="mt-2 text-xl font-black">
                        {update.update_title}
                      </h4>

                      <p className="mt-3 leading-8 app-muted">
                        {update.update_message || "No additional details provided."}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm app-subtle">
                      {update.created_at
                        ? new Date(update.created_at).toLocaleString("en-ZA")
                        : "—"}
                    </p>
                  </div>
                </div>
              ))}

              {!projectUpdates.length && (
                <div className="rounded-[2rem] app-surface p-8 text-center">
                  <p className="font-bold app-muted">
                    No project timeline updates yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Document Center
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Files & Attachments
          </h2>

          <p className="mt-4 max-w-3xl leading-8 app-muted">
            Upload project requirements, screenshots, support evidence, proof
            documents, and download MKETICS deliverables securely.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] app-surface p-6">
              <p className="font-black">Upload Project File</p>

              <div className="mt-5 grid gap-4">
                <select
                  value={selectedProjectFileId}
                  onChange={(e) => setSelectedProjectFileId(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  onChange={(e) => setClientProjectFile(e.target.files?.[0] || null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                />

                <button
                  onClick={uploadClientProjectFile}
                  disabled={uploadingFile}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-5 py-4 font-black text-white disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? "Uploading..." : "Upload Project File"}
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] app-surface p-6">
              <p className="font-black">Upload Support Attachment</p>

              <div className="mt-5 grid gap-4">
                <select
                  value={selectedSupportTicketId}
                  onChange={(e) => setSelectedSupportTicketId(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                >
                  <option value="">Select Support Ticket</option>
                  {tickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.subject}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  onChange={(e) => setClientSupportFile(e.target.files?.[0] || null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                />

                <button
                  onClick={uploadClientSupportFile}
                  disabled={uploadingFile}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 font-black text-white disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? "Uploading..." : "Upload Support File"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-black">Project Files</h3>

              <div className="mt-5 grid gap-4">
                {projectFiles.map((file) => (
                  <div key={file.id} className="rounded-2xl app-surface p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-black">{file.file_name}</p>
                        <p className="mt-1 text-xs app-muted">
                          {file.created_at
                            ? new Date(file.created_at).toLocaleString("en-ZA")
                            : "—"}
                        </p>
                      </div>

                      <button
                        onClick={() => downloadStoredFile(file.file_url)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}

                {!projectFiles.length && (
                  <div className="rounded-2xl app-surface p-6 text-center">
                    <p className="font-bold app-muted">No project files yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black">Support Files</h3>

              <div className="mt-5 grid gap-4">
                {supportFiles.map((file) => (
                  <div key={file.id} className="rounded-2xl app-surface p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-black">{file.file_name}</p>
                        <p className="mt-1 text-xs app-muted">
                          {file.created_at
                            ? new Date(file.created_at).toLocaleString("en-ZA")
                            : "—"}
                        </p>
                      </div>

                      <button
                        onClick={() => downloadStoredFile(file.file_url)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}

                {!supportFiles.length && (
                  <div className="rounded-2xl app-surface p-6 text-center">
                    <p className="font-bold app-muted">No support files yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Support Center
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Support Tickets
          </h2>

          <div className="mt-8 grid gap-5">
            <input
              type="text"
              placeholder="Ticket Subject"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <textarea
              placeholder="Describe your issue..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows={5}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createTicket}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Submit Ticket
            </button>
          </div>

          <div className="mt-10 grid gap-5">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-[2rem] app-surface p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">
                      {ticket.subject}
                    </h3>

                    <p className="mt-2 app-muted">
                      {ticket.message}
                    </p>

                    <p className="mt-3 text-sm app-subtle">
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString("en-ZA")
                        : "—"}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-500">
                    {ticket.status || "Open"}
                  </span>
                </div>
              </div>
            ))}

            {!tickets.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No support tickets yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
              Billing
            </p>

            <h2 className="mt-3 text-3xl font-black">
              My Invoices
            </h2>

            <p className="mt-4 max-w-3xl leading-8 app-muted">
              Download your MKETICS invoices and use the
              invoice number as your payment reference.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            {invoices.length ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-[2rem] app-surface p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black">
                          {invoice.invoice_number}
                        </h3>

                        <span
                          className={`rounded-full px-4 py-2 text-xs font-black ${
                            invoice.status === "Paid"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-orange-500/10 text-orange-500"
                          }`}
                        >
                          {invoice.status || "Unpaid"}
                        </span>
                      </div>

                      <p className="mt-2 app-muted">{invoice.service}</p>

                      <p className="mt-4 text-3xl font-black text-sky-500">
                        R{Number(invoice.amount || 0).toLocaleString()}
                      </p>

                      <p className="mt-2 text-sm app-subtle">
                        Created:{" "}
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString("en-ZA")
                          : "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => exportInvoicePDF(invoice)}
                        className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>

                      <button className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white">
                        <CreditCard className="h-4 w-4" />
                        Pay Later
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-sky-500" />

                <h3 className="mt-5 text-2xl font-black">
                  No invoices yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl app-muted">
                  When MKETICS creates an invoice for your
                  project, it will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}