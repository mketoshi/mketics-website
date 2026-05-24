import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import emailjs from "@emailjs/browser";

import exportInvoicePDF from "../utils/generateInvoicePdf";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  ShieldCheck,
  Users,
  FileText,
  FolderKanban,
  LogOut,
  UserCog,
  Activity,
  Search,
  Trash2,
  Archive,
  Eye,
  RefreshCw,
  Wallet,
  Upload,
  Download,
  Bell,
  UserPlus,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

const ADMIN_EMAILS = [
  "smsane0505@gmail.com",
  "admin@mketics.co.za",
];

const statusStyles = {
  New: "bg-sky-500/10 text-sky-500",
  Contacted: "bg-orange-500/10 text-orange-500",
  Quoted: "bg-purple-500/10 text-purple-500",
  Completed: "bg-green-500/10 text-green-500",
  Archived: "bg-slate-500/10 text-slate-500",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [kanbanProjects, setKanbanProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceService, setInvoiceService] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectStatus, setProjectStatus] = useState("Planning");
  const [projectProgress, setProjectProgress] = useState(0);

  const [projectUpdates, setProjectUpdates] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const [projectFiles, setProjectFiles] = useState([]);
  const [supportFiles, setSupportFiles] = useState([]);
  const [selectedProjectFileId, setSelectedProjectFileId] = useState("");
  const [selectedSupportTicketId, setSelectedSupportTicketId] = useState("");
  const [adminProjectFile, setAdminProjectFile] = useState(null);
  const [adminSupportFile, setAdminSupportFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [staffRoles, setStaffRoles] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffFullName, setStaffFullName] = useState("");
  const [staffRole, setStaffRole] = useState("staff");
  const [staffDepartment, setStaffDepartment] = useState("General");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");

  const [approvalRequests, setApprovalRequests] = useState([]);

  const [approvalClientEmail, setApprovalClientEmail] = useState("");
  const [approvalItemTitle, setApprovalItemTitle] = useState("");
  const [approvalDescription, setApprovalDescription] = useState("");
  const [approvalItemType, setApprovalItemType] = useState("Project");

  const [crmFollowups, setCrmFollowups] = useState([]);
  const [followupClientEmail, setFollowupClientEmail] = useState("");
  const [followupTitle, setFollowupTitle] = useState("");
  const [followupMessage, setFollowupMessage] = useState("");
  const [followupDueDate, setFollowupDueDate] = useState("");

  const [internalChats, setInternalChats] = useState([]);
  const [chatTicketId, setChatTicketId] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatEscalationLevel, setChatEscalationLevel] = useState("Normal");

  const [invoiceReminders, setInvoiceReminders] = useState([]);
  const [reminderInvoiceId, setReminderInvoiceId] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  const [clientOnboarding, setClientOnboarding] = useState([]);
  const [onboardingEmail, setOnboardingEmail] = useState("");
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingBusiness, setOnboardingBusiness] = useState("");
  const [onboardingService, setOnboardingService] = useState("");
  const [onboardingStage, setOnboardingStage] = useState("Account Created");
  const [onboardingNotes, setOnboardingNotes] = useState("");

  const [liveSupportMessages, setLiveSupportMessages] = useState([]);
  const [liveSupportClientEmail, setLiveSupportClientEmail] = useState("");
  const [liveSupportMessage, setLiveSupportMessage] = useState("");

  const [aiQuoteClientEmail, setAiQuoteClientEmail] = useState("");
  const [aiQuoteRequirements, setAiQuoteRequirements] = useState("");
  const [aiQuoteResult, setAiQuoteResult] = useState("");

  const [companyWorkspaces, setCompanyWorkspaces] = useState([]);
  const [workspaceCompanyName, setWorkspaceCompanyName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [workspaceOwnerEmail, setWorkspaceOwnerEmail] = useState("");
  const [workspacePlanType, setWorkspacePlanType] = useState("Starter");

  const [subscriptionRecords, setSubscriptionRecords] = useState([]);
  const [subscriptionClientEmail, setSubscriptionClientEmail] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Starter");
  const [subscriptionBillingCycle, setSubscriptionBillingCycle] = useState("Monthly");
  const [subscriptionAmount, setSubscriptionAmount] = useState("");
  const [subscriptionNextBilling, setSubscriptionNextBilling] = useState("");

  const [generatedProposals, setGeneratedProposals] = useState([]);
  const [premiumProposals, setPremiumProposals] = useState([]);
  const [proposalClientEmail, setProposalClientEmail] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalRequirements, setProposalRequirements] = useState("");
  const [proposalContent, setProposalContent] = useState("");

  const [emailAutomationSubject, setEmailAutomationSubject] = useState("");
  const [emailAutomationMessage, setEmailAutomationMessage] = useState("");

  const [staffAuditTrails, setStaffAuditTrails] = useState([]);
  const [saasUsageTracking, setSaasUsageTracking] = useState([]);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [aiProposalTemplates, setAiProposalTemplates] = useState([]);
  const [workspaceInvitations, setWorkspaceInvitations] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [workspaceAnalytics, setWorkspaceAnalytics] = useState([]);
  const [workspaceUsageMetering, setWorkspaceUsageMetering] = useState([]);
  const [saasPlans, setSaasPlans] = useState([]);
  const [workspacePlanAssignments, setWorkspacePlanAssignments] = useState([]);

  const [usageClientEmail, setUsageClientEmail] = useState("");
  const [usageType, setUsageType] = useState("Projects");
  const [usageCount, setUsageCount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [usageBillingPeriod, setUsageBillingPeriod] = useState("Monthly");

  const [paymentInvoiceId, setPaymentInvoiceId] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("PayFast");
  const [paymentCheckoutUrl, setPaymentCheckoutUrl] = useState("");

  const [templateName, setTemplateName] = useState("");
  const [templateServiceType, setTemplateServiceType] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const [inviteWorkspaceId, setInviteWorkspaceId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("client");

  const [analyticsWorkspaceId, setAnalyticsWorkspaceId] = useState("");
  const [analyticsMetricName, setAnalyticsMetricName] = useState("Projects");
  const [analyticsMetricValue, setAnalyticsMetricValue] = useState("");
  const [analyticsMetricType, setAnalyticsMetricType] = useState("usage");
  const [meterWorkspaceId, setMeterWorkspaceId] = useState("");
  const [meterCategory, setMeterCategory] = useState("AI Quotes");
  const [meterAmount, setMeterAmount] = useState("");
  const [meterBillingCycle, setMeterBillingCycle] = useState("monthly");

  const [planWorkspaceId, setPlanWorkspaceId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [planBillingCycle, setPlanBillingCycle] = useState("monthly");
  const [planRenewalDate, setPlanRenewalDate] = useState("");

const generateProposalApprovalLink = async (proposal) => {
  try {
    const token =
      crypto.randomUUID() + Date.now().toString(36);

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 14);

    const { error } = await supabase
      .from("proposal_access_tokens")
      .insert([
        {
          proposal_id: proposal.id,
          client_email: proposal.client_email,
          access_token: token,
          expires_at: expiresAt.toISOString(),
        },
      ]);

    if (error) {
      console.error(error);
      toast.error("Failed to create approval link.");
      return;
    }

    const approvalUrl = `${window.location.origin}/proposal-approval?token=${token}`;

    await navigator.clipboard.writeText(approvalUrl);

    toast.success("Approval link copied.");

    alert(`Approval Link:\n\n${approvalUrl}`);
  } catch (error) {
    console.error(error);
    toast.error("Approval link generation failed.");
  }
};

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user) {
        window.location.href = "/client-login";
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email)) {
        window.location.href = "/";
        return;
      }

      setSession(data.session);
      await loadDashboardData();
      setLoading(false);
    };

    initialize();
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
          await loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  useEffect(() => {
    const projectChannel = supabase
      .channel("admin-projects-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        async () => {
          await loadDashboardData();
        }
      )
      .subscribe();

    const ticketChannel = supabase
      .channel("admin-support-tickets-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
        },
        async () => {
          await loadDashboardData();
        }
      )
      .subscribe();

    const liveSupportChannel = supabase
      .channel("admin-live-support-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_support_messages",
        },
        async () => {
          await loadDashboardData();
        }
      )
      .subscribe();

    const reminderChannel = supabase
      .channel("admin-invoice-reminders-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoice_reminders",
        },
        async () => {
          await loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(liveSupportChannel);
      supabase.removeChannel(reminderChannel);
    };
  }, []);

  const loadDashboardData = async () => {
    const [
      leadsRes,
      projectsRes,
      invoicesRes,
      quotesRes,
      ticketsRes,
      activityRes,
      projectUpdatesRes,
      projectFilesRes,
      supportFilesRes,
      approvalRes,
      staffRolesRes,
      adminNotificationsRes,
      crmFollowupsRes,
      internalChatsRes,
      invoiceRemindersRes,
      onboardingRes,
      liveSupportRes,
      workspacesRes,
      subscriptionsRes,
      proposalsRes,
      premiumProposalsRes,
      auditTrailsRes,
      usageTrackingRes,
      paymentTransactionsRes,
      proposalTemplatesRes,
      workspaceInvitationsRes,
      workspaceMembersRes,
      workspaceAnalyticsRes,
      workspaceUsageMeteringRes,
      saasPlansRes,
      workspacePlanAssignmentsRes,
    ] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(15),
      supabase
        .from("project_updates")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
      supabase
        .from("project_files")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
      supabase
        .from("support_files")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
      supabase
        .from("client_approvals")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
      supabase
        .from("staff_roles")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
      supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(20),
      supabase
        .from("crm_followups")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("internal_chats")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("invoice_reminders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("client_onboarding")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("live_support_messages")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase.from("company_workspaces").select("*").order("created_at", { ascending: false }),
      supabase.from("subscription_records").select("*").order("created_at", { ascending: false }),
      supabase.from("generated_proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("premium_proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("staff_audit_trails").select("*").order("created_at", { ascending: false }).limit(40),
      supabase.from("saas_usage_tracking").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_proposal_templates").select("*").order("created_at", { ascending: false }),
      supabase.from("workspace_invitations").select("*").order("created_at", { ascending: false }),
      supabase.from("workspace_members").select("*").order("created_at", { ascending: false }),
      supabase.from("workspace_analytics").select("*").order("recorded_at", { ascending: false }),
      supabase.from("workspace_usage_metering").select("*").order("created_at", { ascending: false }),
      supabase.from("saas_plans").select("*").order("monthly_price", { ascending: true }),
      supabase.from("workspace_plan_assignments").select("*, saas_plans(*)").order("created_at", { ascending: false }),
    ]);

    setLeads(leadsRes.data || []);
    setProjects(projectsRes.data || []);
    setKanbanProjects(projectsRes.data || []);
    setInvoices(invoicesRes.data || []);
    setQuotes(quotesRes.data || []);
    setTickets(ticketsRes.data || []);
    setActivityLogs(activityRes.data || []);
    setProjectUpdates(projectUpdatesRes.data || []);
    setProjectFiles(projectFilesRes.data || []);
    setSupportFiles(supportFilesRes.data || []);
    setApprovalRequests(approvalRes.data || []);
    setStaffRoles(staffRolesRes.data || []);
    setAdminNotifications(adminNotificationsRes.data || []);
    setCrmFollowups(crmFollowupsRes.data || []);
    setInternalChats(internalChatsRes.data || []);
    setInvoiceReminders(invoiceRemindersRes.data || []);
    setClientOnboarding(onboardingRes.data || []);
    setLiveSupportMessages(liveSupportRes.data || []);
    setCompanyWorkspaces(workspacesRes.data || []);
    setSubscriptionRecords(subscriptionsRes.data || []);
    setGeneratedProposals(proposalsRes.data || []);
    setPremiumProposals(premiumProposalsRes.data || []);
    setStaffAuditTrails(auditTrailsRes.data || []);
    setSaasUsageTracking(usageTrackingRes.data || []);
    setPaymentTransactions(paymentTransactionsRes.data || []);
    setAiProposalTemplates(proposalTemplatesRes.data || []);
    setWorkspaceInvitations(workspaceInvitationsRes.data || []);
    setWorkspaceMembers(workspaceMembersRes.data || []);
    setWorkspaceAnalytics(workspaceAnalyticsRes.data || []);
    setWorkspaceUsageMetering(workspaceUsageMeteringRes.data || []);
    setSaasPlans(saasPlansRes.data || []);
    setWorkspacePlanAssignments(workspacePlanAssignmentsRes.data || []);
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client-login";
  };

  const logActivity = async (action, module = "General") => {
    await supabase.from("activity_logs").insert([
      {
        user_email: session?.user?.email,
        action,
        module,
      },
    ]);
  };

  const logStaffAudit = async (action, module = "General", targetRecord = "") => {
    await supabase.from("staff_audit_trails").insert([
      {
        staff_email: session?.user?.email,
        action,
        module,
        target_record: targetRecord,
      },
    ]);
  };

  const createAdminNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      alert("Complete notification title and message.");
      return;
    }

    await supabase.from("admin_notifications").insert([
      {
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        is_read: false,
      },
    ]);

    await logActivity(`Created notification: ${notificationTitle}`, "Notifications");

    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationType("info");

    await loadDashboardData();
  };

  const markNotificationRead = async (id) => {
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", id);

    await loadDashboardData();
  };

  const createStaffRole = async () => {
    if (!staffEmail || !staffFullName) {
      alert("Complete staff name and email.");
      return;
    }

    const { error } = await supabase.from("staff_roles").insert([
      {
        email: staffEmail,
        full_name: staffFullName,
        role: staffRole,
        department: staffDepartment,
        status: "Active",
      },
    ]);

    if (error) {
      alert("Could not create staff record. The email may already exist.");
      return;
    }

    await supabase.from("admin_notifications").insert([
      {
        title: "New staff account added",
        message: `${staffFullName} was added as ${staffRole} in ${staffDepartment}.`,
        type: "team",
        is_read: false,
      },
    ]);

    await logActivity(`Added staff account: ${staffEmail}`, "Staff");

    setStaffEmail("");
    setStaffFullName("");
    setStaffRole("staff");
    setStaffDepartment("General");

    await loadDashboardData();
  };

  const updateStaffStatus = async (id, status) => {
    await supabase
      .from("staff_roles")
      .update({ status })
      .eq("id", id);

    await logActivity(`Updated staff status to ${status}`, "Staff");

    await loadDashboardData();
  };

  const updateStaffRole = async (id, role) => {
    await supabase
      .from("staff_roles")
      .update({ role })
      .eq("id", id);

    await logActivity(`Updated staff role to ${role}`, "Staff");

    await loadDashboardData();
  };

  const createApprovalRequest = async () => {
    if (!approvalClientEmail || !approvalItemTitle) {
      alert("Complete approval fields.");
      return;
    }

    await supabase.from("client_approvals").insert([
      {
        client_email: approvalClientEmail,
        item_type: approvalItemType,
        item_title: approvalItemTitle,
        description: approvalDescription,
        status: "Pending",
      },
    ]);

    await supabase.from("admin_notifications").insert([
      {
        title: "Approval Request",
        message: `Approval request sent to ${approvalClientEmail}`,
        type: "approval",
        is_read: false,
      },
    ]);

    await logActivity(
      `Created approval request for ${approvalClientEmail}`,
      "Approvals"
    );

    setApprovalClientEmail("");
    setApprovalItemTitle("");
    setApprovalDescription("");
    setApprovalItemType("Project");

    await loadDashboardData();
  };

  
  const createCrmFollowup = async () => {
    if (!followupClientEmail || !followupTitle) {
      alert("Complete follow-up fields.");
      return;
    }

    await supabase.from("crm_followups").insert([
      {
        client_email: followupClientEmail,
        followup_title: followupTitle,
        followup_message: followupMessage,
        due_date: followupDueDate,
        status: "Pending",
      },
    ]);

    await supabase.from("admin_notifications").insert([
      {
        title: "CRM Follow-up Created",
        message: `Follow-up scheduled for ${followupClientEmail}`,
        type: "crm",
        is_read: false,
      },
    ]);

    await loadDashboardData();
  };

  const createInternalChat = async () => {
    if (!chatMessage) {
      alert("Add chat message.");
      return;
    }

    await supabase.from("internal_chats").insert([
      {
        ticket_id: chatTicketId || null,
        sender_email: session?.user?.email,
        message: chatMessage,
        escalation_level: chatEscalationLevel,
      },
    ]);

    await supabase.from("admin_notifications").insert([
      {
        title: "Internal Escalation",
        message: `A ${chatEscalationLevel} escalation was created.`,
        type: "support",
        is_read: false,
      },
    ]);

    setChatMessage("");

    await loadDashboardData();
  };


  const createInvoiceReminder = async () => {
    const selectedInvoice = invoices.find(
      (invoice) => String(invoice.id) === String(reminderInvoiceId)
    );

    if (!selectedInvoice) {
      alert("Select an invoice first.");
      return;
    }

    await supabase.from("invoice_reminders").insert([
      {
        invoice_id: selectedInvoice.id,
        client_email: selectedInvoice.client_email,
        invoice_number: selectedInvoice.invoice_number,
        reminder_message:
          reminderMessage ||
          `Friendly reminder: Invoice ${selectedInvoice.invoice_number} is still outstanding.`,
        status: "Pending",
      },
    ]);

    await supabase.from("admin_notifications").insert([
      {
        title: "Invoice Reminder Created",
        message: `Reminder prepared for ${selectedInvoice.client_email}`,
        type: "finance",
        is_read: false,
      },
    ]);

    toast.success("Invoice reminder created");
    setReminderInvoiceId("");
    setReminderMessage("");
    await loadDashboardData();
  };

  const markReminderSent = async (id) => {
    await supabase
      .from("invoice_reminders")
      .update({
        status: "Sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    toast.success("Reminder marked as sent");
    await loadDashboardData();
  };

  const createOnboardingRecord = async () => {
    if (!onboardingEmail || !onboardingName) {
      alert("Complete client name and email.");
      return;
    }

    await supabase.from("client_onboarding").insert([
      {
        client_email: onboardingEmail,
        client_name: onboardingName,
        business_name: onboardingBusiness,
        service_type: onboardingService,
        onboarding_stage: onboardingStage,
        notes: onboardingNotes,
        status: "Active",
      },
    ]);

    await supabase.from("admin_notifications").insert([
      {
        title: "Client Onboarding Started",
        message: `${onboardingName} has been added to onboarding.`,
        type: "onboarding",
        is_read: false,
      },
    ]);

    toast.success("Client onboarding record created");
    setOnboardingEmail("");
    setOnboardingName("");
    setOnboardingBusiness("");
    setOnboardingService("");
    setOnboardingStage("Account Created");
    setOnboardingNotes("");
    await loadDashboardData();
  };

  const updateOnboardingStage = async (id, stage) => {
    await supabase
      .from("client_onboarding")
      .update({ onboarding_stage: stage })
      .eq("id", id);

    toast.success("Onboarding stage updated");
    await loadDashboardData();
  };

  const sendAdminLiveSupportMessage = async () => {
    if (!liveSupportClientEmail || !liveSupportMessage) {
      alert("Choose client email and add a message.");
      return;
    }

    await supabase.from("live_support_messages").insert([
      {
        client_email: liveSupportClientEmail,
        sender_email: session?.user?.email,
        sender_type: "admin",
        message: liveSupportMessage,
        status: "Sent",
      },
    ]);

    setLiveSupportMessage("");
    toast.success("Live support message sent");
    await loadDashboardData();
  };

  const generateAiQuote = async () => {
    if (!aiQuoteRequirements) {
      alert("Describe the client requirements first.");
      return;
    }

    const lower = aiQuoteRequirements.toLowerCase();

    let base = 1500;
    if (lower.includes("website")) base += 3500;
    if (lower.includes("ecommerce") || lower.includes("shop")) base += 6500;
    if (lower.includes("cctv")) base += 5000;
    if (lower.includes("network") || lower.includes("wifi")) base += 4000;
    if (lower.includes("portal") || lower.includes("dashboard")) base += 8500;
    if (lower.includes("hosting")) base += 1200;
    if (lower.includes("support")) base += 900;

    const professionalFee = Math.round(base * 0.25);
    const total = base + professionalFee;

    const quoteText = `AI QUOTATION DRAFT\n\nClient: ${
      aiQuoteClientEmail || "Client"
    }\nEstimated Scope: ${aiQuoteRequirements}\n\nEstimated Project Cost: R${base.toLocaleString()}\nProfessional / Setup Fee: R${professionalFee.toLocaleString()}\nTotal Estimate: R${total.toLocaleString()}\n\nRecommended Payment Terms: 50% deposit and 50% balance on completion.\nValidity: 7 days.\n\nNote: This is an AI-assisted estimate and should be reviewed before sending.`;

    setAiQuoteResult(quoteText);
    toast.success("AI quotation draft generated");
  };




  const exportPremiumProposalPDF = (proposal = null) => {
    const title =
      proposal?.proposal_title || proposalTitle || "MKETICS Premium Proposal";
    const content = proposal?.proposal_content || proposalContent;
    const client =
      proposal?.client_email || proposalClientEmail || "client@mketics.co.za";
    const company = proposal?.company_name || "Client Company";

    if (!content) {
      alert("Generate or select a premium proposal first.");
      return;
    }

    const doc = new jsPDF();
    let y = 18;

    doc.setFillColor(8, 15, 30);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MKETICS", 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Innovate • Integrate • Elevate", 20, y);
    y += 28;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(title.substring(0, 45), 20, y);
    y += 12;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Prepared for: ${company}`, 20, y);
    y += 7;
    doc.text(`Client Email: ${client}`, 20, y);
    y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString("en-ZA")}`, 20, y);

    doc.addPage();
    y = 20;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Premium Proposal", 15, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(content, 180);
    lines.forEach((line) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      if (
        line.includes("Executive Summary") ||
        line.includes("Scope") ||
        line.includes("Timeline") ||
        line.includes("Pricing") ||
        line.includes("Payment Terms") ||
        line.includes("Support") ||
        line.includes("Closing")
      ) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      doc.text(line, 15, y);
      y += 6;
    });

    doc.addPage();
    doc.setFillColor(8, 15, 30);
    doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Approval & Signature", 20, 35);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Client Name: ________________________________", 20, 70);
    doc.text("Signature: _________________________________", 20, 95);
    doc.text("Date: ______________________________________", 20, 120);
    doc.text("Prepared by MKETICS (PTY) LTD", 20, 250);

    doc.save(`${title.replace(/[^a-z0-9]/gi, "-")}.pdf`);
  };

  const savePremiumProposalRecord = async ({
    clientEmail,
    clientName,
    companyName,
    title,
    serviceType,
    budget,
    requirements,
    content,
  }) => {
    const { data, error } = await supabase
      .from("premium_proposals")
      .insert([
        {
          client_email: clientEmail,
          client_name: clientName,
          company_name: companyName,
          proposal_title: title,
          service_type: serviceType,
          budget,
          requirements,
          proposal_content: content,
          proposal_status: "Draft",
          generated_by: session?.user?.email,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Premium proposal save error:", error);
      toast.error("AI proposal generated but failed to save.");
      return null;
    }

    await supabase.from("proposal_approvals").insert([
      {
        proposal_id: data.id,
        client_email: clientEmail,
        approval_status: "Pending",
      },
    ]);

    await supabase.from("admin_notifications").insert([
      {
        title: "Premium AI Proposal Created",
        message: `${title} was generated for ${clientEmail}`,
        type: "proposal",
        is_read: false,
      },
    ]);

    await logStaffAudit("Generated premium AI proposal", "Premium Proposals", title);

    return data;
  };

  const testAIQuote = async () => {
    try {
      toast.loading("Generating premium AI proposal...", { id: "ai-test" });

      const clientEmail = proposalClientEmail || "demo@mketics.co.za";
      const title = proposalTitle || "AI Premium Proposal";
      const requirements =
        proposalRequirements ||
        "Professional business website with dashboard, quotation system, payment integration, client portal, CRM automation and AI proposals.";

      const { data, error } = await supabase.functions.invoke(
        "generate-ai-quote",
        {
          body: {
            clientName: clientEmail.split("@")[0] || "MKETICS Client",
            company: "MKETICS Client Company",
            service: title,
            budget: "To be confirmed",
            requirements,
          },
        }
      );

      console.log("AI QUOTE DATA:", data);
      console.log("AI QUOTE ERROR:", error);

      if (error) {
        toast.error(`AI Quote Failed: ${error.message}`, { id: "ai-test" });
        alert(`AI Quote Failed: ${error.message}`);
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || "AI Quote Failed", { id: "ai-test" });
        alert(data?.error || "AI Quote Failed");
        return;
      }

      const generatedContent = data.quote || "No AI response returned.";

      setProposalContent(generatedContent);
      setProposalTitle(title);
      setProposalClientEmail(clientEmail);
      setProposalRequirements(requirements);

      const savedProposal = await savePremiumProposalRecord({
        clientEmail,
        clientName: clientEmail.split("@")[0] || "Client",
        companyName: "MKETICS Client Company",
        title,
        serviceType: title,
        budget: "To be confirmed",
        requirements,
        content: generatedContent,
      });

      if (savedProposal) {
        setPremiumProposals((current) => [savedProposal, ...current]);
      }

      toast.success("Premium AI proposal generated and saved", { id: "ai-test" });
      alert("AI Quote Generated Successfully");
      await loadDashboardData();
    } catch (err) {
      console.error("AI QUOTE UNEXPECTED ERROR:", err);
      toast.error("Unexpected AI Quote Error", { id: "ai-test" });
      alert("Unexpected AI Quote Error. Check browser console.");
    }
  };



  const currentStaffRecord = staffRoles.find(
    (staff) => staff.email === session?.user?.email
  );
  const currentRole = currentStaffRecord?.role || "admin";
  const canManageFinance = ["admin", "manager", "finance"].includes(currentRole);




  const assignWorkspacePlan = async () => {
    if (!planWorkspaceId || !selectedPlanId) {
      alert("Select workspace and SaaS plan.");
      return;
    }

    const renewsAt = planRenewalDate
      ? new Date(planRenewalDate)
      : new Date();

    if (!planRenewalDate) {
      if (planBillingCycle === "annual") {
        renewsAt.setFullYear(renewsAt.getFullYear() + 1);
      } else {
        renewsAt.setMonth(renewsAt.getMonth() + 1);
      }
    }

    const { error } = await supabase.from("workspace_plan_assignments").insert([
      {
        workspace_id: planWorkspaceId,
        plan_id: selectedPlanId,
        billing_cycle: planBillingCycle,
        status: "Active",
        renews_at: renewsAt.toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Could not assign SaaS plan.");
      return;
    }

    const selectedPlan = saasPlans.find((plan) => plan.id === selectedPlanId);
    const selectedWorkspace = companyWorkspaces.find(
      (workspace) => workspace.id === planWorkspaceId
    );

    await supabase.from("workspace_analytics").insert([
      {
        workspace_id: planWorkspaceId,
        metric_name: "Active Plan",
        metric_value: Number(selectedPlan?.monthly_price || 0),
        metric_type: "subscription",
      },
    ]);

    await logStaffAudit(
      "Assigned SaaS plan",
      "SaaS Billing",
      `${selectedWorkspace?.company_name || planWorkspaceId} → ${selectedPlan?.plan_name || selectedPlanId}`
    );

    await supabase.from("admin_notifications").insert([
      {
        title: "SaaS Plan Assigned",
        message: `${selectedWorkspace?.company_name || "Workspace"} was assigned to ${selectedPlan?.plan_name || "a plan"}.`,
        type: "billing",
        is_read: false,
      },
    ]);

    toast.success("Workspace SaaS plan assigned");

    setPlanWorkspaceId("");
    setSelectedPlanId("");
    setPlanBillingCycle("monthly");
    setPlanRenewalDate("");

    await loadDashboardData();
  };

  const updateWorkspacePlanStatus = async (assignmentId, status) => {
    await supabase
      .from("workspace_plan_assignments")
      .update({ status })
      .eq("id", assignmentId);

    await logStaffAudit("Updated workspace plan status", "SaaS Billing", status);
    toast.success("Plan status updated");
    await loadDashboardData();
  };

  const createSubscriptionFromPlan = async (assignment) => {
    const workspace = companyWorkspaces.find(
      (item) => String(item.id) === String(assignment.workspace_id)
    );

    const plan = assignment.saas_plans;

    if (!workspace || !plan) {
      alert("Workspace or plan data missing.");
      return;
    }

    const amount =
      assignment.billing_cycle === "annual"
        ? Number(plan.annual_price || 0)
        : Number(plan.monthly_price || 0);

    await supabase.from("subscription_records").insert([
      {
        workspace_id: assignment.workspace_id,
        client_email: workspace.owner_email,
        subscription_plan: plan.plan_name,
        billing_cycle: assignment.billing_cycle,
        amount,
        payment_status: "Pending",
        next_billing_date: assignment.renews_at || null,
      },
    ]);

    await logStaffAudit(
      "Created subscription from SaaS plan",
      "Subscriptions",
      `${workspace.owner_email} • ${plan.plan_name}`
    );

    toast.success("Subscription record created from plan");
    await loadDashboardData();
  };

  const recordWorkspaceAnalytics = async () => {
    if (!analyticsWorkspaceId || !analyticsMetricName || !analyticsMetricValue) {
      alert("Complete analytics workspace, metric name, and value.");
      return;
    }

    const { error } = await supabase.from("workspace_analytics").insert([
      {
        workspace_id: analyticsWorkspaceId,
        metric_name: analyticsMetricName,
        metric_value: Number(analyticsMetricValue || 0),
        metric_type: analyticsMetricType,
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Could not record workspace analytics.");
      return;
    }

    await logStaffAudit(
      "Recorded workspace analytics",
      "SaaS Analytics",
      analyticsMetricName
    );

    toast.success("Workspace analytics recorded");

    setAnalyticsWorkspaceId("");
    setAnalyticsMetricName("Projects");
    setAnalyticsMetricValue("");
    setAnalyticsMetricType("usage");

    await loadDashboardData();
  };

  const recordWorkspaceUsageMeter = async () => {
    if (!meterWorkspaceId || !meterCategory || !meterAmount) {
      alert("Complete usage workspace, category, and amount.");
      return;
    }

    const { error } = await supabase.from("workspace_usage_metering").insert([
      {
        workspace_id: meterWorkspaceId,
        usage_category: meterCategory,
        usage_amount: Number(meterAmount || 0),
        billing_cycle: meterBillingCycle,
        recorded_by: session?.user?.email,
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Could not record usage meter.");
      return;
    }

    await logStaffAudit(
      "Recorded workspace usage meter",
      "Usage Metering",
      meterCategory
    );

    toast.success("Usage meter recorded");

    setMeterWorkspaceId("");
    setMeterCategory("AI Quotes");
    setMeterAmount("");
    setMeterBillingCycle("monthly");

    await loadDashboardData();
  };

  const autoCalculateWorkspaceMetrics = async (workspace) => {
    if (!workspace?.id) return;

    const [
      workspaceProjects,
      workspaceInvoices,
      workspacePayments,
      workspaceTickets,
      workspaceMembersData,
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("workspace_id", workspace.id),
      supabase.from("invoices").select("*").eq("workspace_id", workspace.id),
      supabase.from("payment_transactions").select("*").eq("workspace_id", workspace.id),
      supabase.from("support_tickets").select("*").eq("workspace_id", workspace.id),
      supabase.from("workspace_members").select("*").eq("workspace_id", workspace.id),
    ]);

    const revenue = (workspaceInvoices.data || []).reduce(
      (sum, invoice) =>
        sum + Number(invoice.total_amount || invoice.amount || 0),
      0
    );

    const paidPayments = (workspacePayments.data || []).filter(
      (payment) => payment.payment_status === "Paid"
    ).length;

    const metrics = [
      {
        workspace_id: workspace.id,
        metric_name: "Projects",
        metric_value: workspaceProjects.data?.length || 0,
        metric_type: "usage",
      },
      {
        workspace_id: workspace.id,
        metric_name: "Invoices",
        metric_value: workspaceInvoices.data?.length || 0,
        metric_type: "billing",
      },
      {
        workspace_id: workspace.id,
        metric_name: "Revenue",
        metric_value: revenue,
        metric_type: "revenue",
      },
      {
        workspace_id: workspace.id,
        metric_name: "Paid Payments",
        metric_value: paidPayments,
        metric_type: "payments",
      },
      {
        workspace_id: workspace.id,
        metric_name: "Support Tickets",
        metric_value: workspaceTickets.data?.length || 0,
        metric_type: "support",
      },
      {
        workspace_id: workspace.id,
        metric_name: "Members",
        metric_value: workspaceMembersData.data?.length || 0,
        metric_type: "team",
      },
    ];

    const { error } = await supabase.from("workspace_analytics").insert(metrics);

    if (error) {
      console.error(error);
      toast.error("Could not auto-calculate workspace metrics.");
      return;
    }

    await logStaffAudit(
      "Auto-calculated workspace metrics",
      "SaaS Analytics",
      workspace.company_name || workspace.id
    );

    toast.success("Workspace metrics calculated");
    await loadDashboardData();
  };

  const createWorkspaceInvitation = async () => {
    if (!inviteWorkspaceId || !inviteEmail) {
      alert("Select workspace and enter invited email.");
      return;
    }

    const token =
      crypto.randomUUID() + "-" + Date.now().toString(36);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { error } = await supabase.from("workspace_invitations").insert([
      {
        workspace_id: inviteWorkspaceId,
        invited_email: inviteEmail,
        invited_role: inviteRole,
        invited_by: session?.user?.email,
        invitation_token: token,
        status: "Pending",
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Could not create workspace invitation.");
      return;
    }

    const inviteUrl = `${window.location.origin}/client-register?invite=${token}`;

    await navigator.clipboard.writeText(inviteUrl);

    await supabase.from("admin_notifications").insert([
      {
        title: "Workspace Invitation Created",
        message: `${inviteEmail} was invited as ${inviteRole}.`,
        type: "workspace",
        is_read: false,
      },
    ]);

    await logStaffAudit("Created workspace invitation", "Workspace", inviteEmail);

    toast.success("Invitation link copied");
    alert(`Invitation Link:\n\n${inviteUrl}`);

    setInviteWorkspaceId("");
    setInviteEmail("");
    setInviteRole("client");

    await loadDashboardData();
  };

  const cancelWorkspaceInvitation = async (invitationId) => {
    await supabase
      .from("workspace_invitations")
      .update({ status: "Cancelled" })
      .eq("id", invitationId);

    toast.success("Invitation cancelled");
    await loadDashboardData();
  };

  const addWorkspaceMemberManually = async (invitation) => {
    if (!invitation?.workspace_id || !invitation?.invited_email) return;

    await supabase.from("workspace_members").insert([
      {
        workspace_id: invitation.workspace_id,
        email: invitation.invited_email,
        role: invitation.invited_role || "client",
        status: "Active",
      },
    ]);

    await supabase
      .from("workspace_invitations")
      .update({ status: "Accepted" })
      .eq("id", invitation.id);

    await logStaffAudit(
      "Added workspace member from invitation",
      "Workspace Members",
      invitation.invited_email
    );

    toast.success("Workspace member added");
    await loadDashboardData();
  };

  const createCompanyWorkspace = async () => {
    if (!workspaceCompanyName || !workspaceOwnerEmail) {
      alert("Complete workspace company name and owner email.");
      return;
    }

    await supabase.from("company_workspaces").insert([
      {
        company_name: workspaceCompanyName,
        company_slug:
          workspaceSlug ||
          workspaceCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        owner_email: workspaceOwnerEmail,
        plan_type: workspacePlanType,
        status: "Active",
      },
    ]);

    toast.success("Workspace created");
    setWorkspaceCompanyName("");
    setWorkspaceSlug("");
    setWorkspaceOwnerEmail("");
    setWorkspacePlanType("Starter");
    await loadDashboardData();
  };

  const createSubscriptionRecord = async () => {
    if (!canManageFinance) {
      alert("Finance permission required.");
      return;
    }

    if (!subscriptionClientEmail || !subscriptionAmount) {
      alert("Complete subscription client and amount.");
      return;
    }

    await supabase.from("subscription_records").insert([
      {
        client_email: subscriptionClientEmail,
        subscription_plan: subscriptionPlan,
        billing_cycle: subscriptionBillingCycle,
        amount: Number(subscriptionAmount || 0),
        payment_status: "Pending",
        next_billing_date: subscriptionNextBilling || null,
      },
    ]);

    toast.success("Subscription record created");
    setSubscriptionClientEmail("");
    setSubscriptionPlan("Starter");
    setSubscriptionBillingCycle("Monthly");
    setSubscriptionAmount("");
    setSubscriptionNextBilling("");
    await loadDashboardData();
  };

  const updateSubscriptionStatus = async (id, status) => {
    await supabase
      .from("subscription_records")
      .update({ payment_status: status })
      .eq("id", id);

    toast.success("Subscription status updated");
    await loadDashboardData();
  };

  const generateProposalDraft = async () => {
    if (!proposalClientEmail || !proposalTitle || !proposalRequirements) {
      alert("Complete proposal client, title, and requirements.");
      return;
    }

    const lower = proposalRequirements.toLowerCase();
    let estimate = 2500;
    if (lower.includes("website")) estimate += 4500;
    if (lower.includes("ecommerce") || lower.includes("shop")) estimate += 7500;
    if (lower.includes("cctv")) estimate += 6000;
    if (lower.includes("network") || lower.includes("wifi")) estimate += 5000;
    if (lower.includes("portal") || lower.includes("dashboard")) estimate += 9500;
    if (lower.includes("hosting")) estimate += 1500;
    if (lower.includes("support")) estimate += 1200;
    if (lower.includes("cloud")) estimate += 4500;

    const content = `MKETICS PROPOSAL DRAFT\n\nClient: ${proposalClientEmail}\nTitle: ${proposalTitle}\n\nExecutive Summary:\nMKETICS proposes a professional solution based on the client requirements below.\n\nRequirements:\n${proposalRequirements}\n\nRecommended Solution:\n- Requirements analysis and setup planning\n- Professional implementation by MKETICS\n- Testing and quality assurance\n- Client handover and support guidance\n\nEstimated Investment:\nR${estimate.toLocaleString()}\n\nPayment Terms:\n50% deposit to begin. 50% balance on completion.\n\nValidity:\n7 days from date of issue.\n\nPrepared by MKETICS.`;

    setProposalContent(content);

    await supabase.from("generated_proposals").insert([
      {
        client_email: proposalClientEmail,
        proposal_title: proposalTitle,
        proposal_content: content,
        generated_by: session?.user?.email,
      },
    ]);

    toast.success("Proposal generated");
    await loadDashboardData();
  };

  const exportProposalPDF = (proposal = null) => {
    const title = proposal?.proposal_title || proposalTitle || "MKETICS Proposal";
    const content = proposal?.proposal_content || proposalContent;

    if (!content) {
      alert("Generate or select a proposal first.");
      return;
    }

    const doc = new jsPDF();
    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MKETICS", 15, y);
    y += 8;
    doc.setFontSize(13);
    doc.text(title, 15, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(content, 180);
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 6;
    });

    doc.save(`${title.replace(/[^a-z0-9]/gi, "-")}.pdf`);
  };

  const prepareEmailAutomation = async () => {
    if (!emailAutomationSubject || !emailAutomationMessage) {
      alert("Complete email subject and message.");
      return;
    }

    await supabase.from("admin_notifications").insert([
      {
        title: `Email Ready: ${emailAutomationSubject}`,
        message: emailAutomationMessage,
        type: "email",
        is_read: false,
      },
    ]);

    toast.success("Email automation hook prepared");
    setEmailAutomationSubject("");
    setEmailAutomationMessage("");
    await loadDashboardData();
  };


  const createSaasUsageRecord = async () => {
    if (!usageClientEmail || !usageType) {
      alert("Complete usage tracking fields.");
      return;
    }

    await supabase.from("saas_usage_tracking").insert([
      {
        client_email: usageClientEmail,
        usage_type: usageType,
        usage_count: Number(usageCount || 0),
        usage_limit: Number(usageLimit || 0),
        billing_period: usageBillingPeriod,
      },
    ]);

    await logStaffAudit("Created SaaS usage record", "Usage Tracking", usageClientEmail);
    toast.success("Usage tracking record created");

    setUsageClientEmail("");
    setUsageType("Projects");
    setUsageCount("");
    setUsageLimit("");
    setUsageBillingPeriod("Monthly");

    await loadDashboardData();
  };

  const createPaymentTransaction = async () => {
    const selectedInvoice = invoices.find(
      (invoice) => String(invoice.id) === String(paymentInvoiceId)
    );

    if (!selectedInvoice) {
      alert("Select an invoice first.");
      return;
    }

    const fallbackUrl =
      paymentProvider === "Yoco"
        ? "https://pay.yoco.com/"
        : "https://www.payfast.co.za/eng/process";

    await supabase.from("payment_transactions").insert([
      {
        invoice_id: selectedInvoice.id,
        client_email: selectedInvoice.client_email,
        provider: paymentProvider,
        amount: Number(selectedInvoice.amount || 0),
        payment_status: "Pending",
        provider_reference: `${paymentProvider}-${selectedInvoice.invoice_number}`,
        checkout_url: paymentCheckoutUrl || fallbackUrl,
      },
    ]);

    await logStaffAudit(
      `Created ${paymentProvider} payment transaction`,
      "Payments",
      selectedInvoice.invoice_number
    );

    toast.success(`${paymentProvider} payment transaction created`);

    setPaymentInvoiceId("");
    setPaymentProvider("PayFast");
    setPaymentCheckoutUrl("");

    await loadDashboardData();
  };

  const markPaymentPaid = async (transaction) => {
    await supabase
      .from("payment_transactions")
      .update({
        payment_status: "Paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (transaction.invoice_id) {
      await supabase
        .from("invoices")
        .update({ status: "Paid" })
        .eq("id", transaction.invoice_id);
    }

    await logStaffAudit("Marked transaction paid", "Payments", transaction.provider_reference);
    toast.success("Payment marked paid and invoice updated");

    await loadDashboardData();
  };

  const createProposalTemplate = async () => {
    if (!templateName || !templateContent) {
      alert("Complete template name and content.");
      return;
    }

    await supabase.from("ai_proposal_templates").insert([
      {
        template_name: templateName,
        service_type: templateServiceType,
        template_content: templateContent,
        created_by: session?.user?.email,
      },
    ]);

    await logStaffAudit("Created AI proposal template", "AI Templates", templateName);
    toast.success("AI proposal template saved");

    setTemplateName("");
    setTemplateServiceType("");
    setTemplateContent("");

    await loadDashboardData();
  };

  const useTemplateForProposal = (template) => {
    setProposalTitle(template.template_name || "");
    setProposalRequirements(template.template_content || "");
    toast.success("Template loaded into proposal builder");
  };

  const sendTransactionalEmail = async () => {
    if (!emailAutomationSubject || !emailAutomationMessage) {
      alert("Complete email subject and message.");
      return;
    }

    try {
      await emailjs.send(
        "service_j54ayfr",
        "template_4weiuia",
        {
          subject: emailAutomationSubject,
          message: emailAutomationMessage,
          to_email: invoiceEmail || proposalClientEmail || liveSupportClientEmail || "",
          from_name: "MKETICS",
        },
        "py8cRBCVu5UZFjux1"
      );

      await logStaffAudit("Sent transactional email", "EmailJS", emailAutomationSubject);
      toast.success("Transactional email sent");
    } catch (error) {
      console.error(error);
      toast.error("EmailJS failed. Check template fields.");
    }
  };

const updateLeadStatus = async (id, status) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    await logActivity(`Updated lead status to ${status}`, "Leads");
    await loadDashboardData();
  };

  const deleteLead = async (id) => {
    const confirmed = window.confirm("Delete this lead permanently?");

    if (!confirmed) return;

    await supabase.from("leads").delete().eq("id", id);
    await logActivity("Deleted lead", "Leads");
    await loadDashboardData();
  };

  const archiveLead = async (id) => {
    await updateLeadStatus(id, "Archived");
  };

  const createInvoice = async () => {
    if (!invoiceEmail || !invoiceNumber || !invoiceService || !invoiceAmount) {
      alert("Complete all invoice fields.");
      return;
    }

    await supabase.from("invoices").insert([
      {
        client_email: invoiceEmail,
        invoice_number: invoiceNumber,
        service: invoiceService,
        amount: invoiceAmount,
        status: "Unpaid",
      },
    ]);

    await logActivity(`Created invoice ${invoiceNumber}`, "Invoices");

    setInvoiceEmail("");
    setInvoiceNumber("");
    setInvoiceService("");
    setInvoiceAmount("");

    await loadDashboardData();
  };

  const markInvoicePaid = async (id, currentStatus) => {
    await supabase
      .from("invoices")
      .update({
        status: currentStatus === "Paid" ? "Unpaid" : "Paid",
      })
      .eq("id", id);

    await logActivity("Updated invoice payment status", "Invoices");
    await loadDashboardData();
  };

  const createProject = async () => {
    if (!projectName || !projectClient) {
      alert("Complete all project fields.");
      return;
    }

    await supabase.from("projects").insert([
      {
        project_name: projectName,
        client_email: projectClient,
        status: projectStatus,
        board_column: projectStatus,
        priority: "Medium",
        assigned_to: "",
        progress: Math.min(100, Math.max(0, Number(projectProgress))),
      },
    ]);

    await logActivity(`Created project ${projectName}`, "Projects");

    setProjectName("");
    setProjectClient("");
    setProjectStatus("Planning");
    setProjectProgress(0);

    await loadDashboardData();
  };

  const updateProjectStatus = async (id, status) => {
    await supabase
      .from("projects")
      .update({
        status,
        board_column: status,
      })
      .eq("id", id);

    await logActivity(`Updated project status to ${status}`, "Projects");
    await loadDashboardData();
  };

  const updateProjectProgress = async (id, progress) => {
    await supabase
      .from("projects")
      .update({
        progress: Math.min(100, Math.max(0, Number(progress))),
      })
      .eq("id", id);

    await logActivity(`Updated project progress to ${progress}%`, "Projects");
    await loadDashboardData();
  };

  const handleKanbanDrag = async (result) => {
    if (!result.destination) return;

    const projectId = result.draggableId;
    const newColumn = result.destination.droppableId;

    const progressByColumn = {
      Planning: 10,
      "In Progress": 45,
      Testing: 80,
      Completed: 100,
    };

    const updatedProjects = kanbanProjects.map((project) => {
      if (String(project.id) === String(projectId)) {
        return {
          ...project,
          board_column: newColumn,
          status: newColumn,
          progress: progressByColumn[newColumn] ?? project.progress ?? 0,
        };
      }

      return project;
    });

    setKanbanProjects(updatedProjects);
    setProjects(updatedProjects);

    await supabase
      .from("projects")
      .update({
        board_column: newColumn,
        status: newColumn,
        progress: progressByColumn[newColumn] ?? 0,
      })
      .eq("id", projectId);

    await logActivity(`Moved project to ${newColumn}`, "Kanban");

    await supabase.from("admin_notifications").insert([
      {
        title: "Project Board Updated",
        message: `A project moved to ${newColumn}.`,
        type: "project",
        is_read: false,
      },
    ]);

    await loadDashboardData();
  };

  const createProjectUpdate = async () => {
    if (!selectedProjectId || !updateTitle) {
      alert("Select a project and add an update title.");
      return;
    }

    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId
    );

    if (!selectedProject) {
      alert("Selected project was not found.");
      return;
    }

    await supabase.from("project_updates").insert([
      {
        project_id: selectedProjectId,
        client_email: selectedProject.client_email,
        update_title: updateTitle,
        update_message: updateMessage,
      },
    ]);

    await logActivity(`Added project update: ${updateTitle}`, "Projects");

    setSelectedProjectId("");
    setUpdateTitle("");
    setUpdateMessage("");

    await loadDashboardData();
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

  const uploadAdminProjectFile = async () => {
    if (!selectedProjectFileId || !adminProjectFile) {
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

    const safeName = adminProjectFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `projects/${selectedProject.client_email}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("mketics-files")
      .upload(filePath, adminProjectFile, {
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
        client_email: selectedProject.client_email,
        file_name: adminProjectFile.name,
        file_url: filePath,
        file_type: adminProjectFile.type || "Unknown",
        category: "Project",
        uploaded_by: session?.user?.email,
      },
    ]);

    await logActivity(`Uploaded project file: ${adminProjectFile.name}`, "Files");

    setSelectedProjectFileId("");
    setAdminProjectFile(null);
    setUploadingFile(false);

    await loadDashboardData();
  };

  const uploadAdminSupportFile = async () => {
    if (!selectedSupportTicketId || !adminSupportFile) {
      alert("Select a support ticket and choose a file.");
      return;
    }

    const selectedTicket = tickets.find(
      (ticket) => ticket.id === selectedSupportTicketId
    );

    if (!selectedTicket) {
      alert("Selected ticket was not found.");
      return;
    }

    setUploadingFile(true);

    const safeName = adminSupportFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `support/${selectedTicket.client_email}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("mketics-files")
      .upload(filePath, adminSupportFile, {
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
        client_email: selectedTicket.client_email,
        file_name: adminSupportFile.name,
        file_url: filePath,
        file_type: adminSupportFile.type || "Unknown",
        uploaded_by: session?.user?.email,
      },
    ]);

    await logActivity(`Uploaded support file: ${adminSupportFile.name}`, "Files");

    setSelectedSupportTicketId("");
    setAdminSupportFile(null);
    setUploadingFile(false);

    await loadDashboardData();
  };

  const updateTicketStatus = async (id, status) => {
    await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", id);

    await logActivity(`Updated support ticket to ${status}`, "Support");
    await loadDashboardData();
  };

  const filteredLeads = leads.filter((lead) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm) ||
      lead.service?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "All"
        ? true
        : (lead.status || "New") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalInvoiceValue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const statusCounts = ["New", "Contacted", "Quoted", "Completed", "Archived"].map(
    (status) => ({
      status,
      count: leads.filter((lead) => (lead.status || "New") === status).length,
    })
  );

  const maxStatusCount = Math.max(
    ...statusCounts.map((item) => item.count),
    1
  );

  const completedLeads = leads.filter((lead) => lead.status === "Completed").length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid").length;
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const unreadNotifications = adminNotifications.filter(
    (notification) => !notification.is_read
  ).length;

  const analyticsChartData = [
    { name: "Leads", value: leads.length },
    { name: "Projects", value: projects.length },
    { name: "Invoices", value: invoices.length },
    { name: "Tickets", value: tickets.length },
    { name: "Subscriptions", value: subscriptionRecords.length },
  ];

  const subscriptionValue = subscriptionRecords.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "text-sky-500",
    },
    {
      title: "Staff",
      value: staffRoles.length,
      icon: UserPlus,
      color: "text-green-500",
    },
    {
      title: "Approvals",
      value: approvalRequests.length,
      icon: CheckCircle2,
      color: "text-purple-500",
    },
    {
      title: "Alerts",
      value: unreadNotifications,
      icon: Bell,
      color: "text-orange-500",
    },
    {
      title: "Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "text-purple-500",
    },
    {
      title: "Timeline Updates",
      value: projectUpdates.length,
      icon: Activity,
      color: "text-sky-500",
    },
    {
      title: "Files",
      value: projectFiles.length + supportFiles.length,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Invoices",
      value: invoices.length,
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Invoice Value",
      value: `R${totalInvoiceValue.toLocaleString()}`,
      icon: Wallet,
      color: "text-orange-500",
    },
    {
      title: "Support Tickets",
      value: tickets.length,
      icon: Activity,
      color: "text-orange-500",
    },
    {
      title: "Workspaces",
      value: companyWorkspaces.length,
      icon: ShieldCheck,
      color: "text-purple-500",
    },
    {
      title: "Subscriptions",
      value: subscriptionRecords.length,
      icon: Wallet,
      color: "text-green-500",
    },
    {
      title: "Premium Proposals",
      value: premiumProposals.length,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Payments",
      value: paymentTransactions.length,
      icon: CreditCard,
      color: "text-sky-500",
    },
    {
      title: "Invitations",
      value: workspaceInvitations.length,
      icon: UserPlus,
      color: "text-green-500",
    },
    {
      title: "Members",
      value: workspaceMembers.length,
      icon: Users,
      color: "text-sky-500",
    },
    {
      title: "SaaS Plans",
      value: saasPlans.length,
      icon: Wallet,
      color: "text-green-500",
    },
    {
      title: "Plan Assignments",
      value: workspacePlanAssignments.length,
      icon: CreditCard,
      color: "text-sky-500",
    },
    {
      title: "Analytics",
      value: workspaceAnalytics.length,
      icon: Activity,
      color: "text-purple-500",
    },
    {
      title: "Usage Metering",
      value: workspaceUsageMetering.length,
      icon: BarChart,
      color: "text-green-500",
    },
    {
      title: "Audit Trails",
      value: staffAuditTrails.length,
      icon: ShieldCheck,
      color: "text-orange-500",
    },
  ];

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
            Loading Admin Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-bg">
      <Toaster position="top-right" />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-12 pt-28">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-red-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
        <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl md:p-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500">
                <ShieldCheck className="h-4 w-4" />
                Internal Operations
              </div>

              <h1 className="mt-6 text-5xl font-black md:text-6xl">
                MKETICS <span className="text-sky-500">Admin System</span>
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 app-muted">
                Live business operations dashboard for leads, invoices,
                projects, quotes, client workflow, and support actions.
              </p>
            </div>

            <div className="rounded-[2rem] app-surface p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-500">
                  <UserCog className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm app-subtle">Administrator</p>
                  <p className="max-w-[220px] break-words font-bold">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Leads",
              value: leads.length,
              icon: Users,
              color: "text-sky-500",
            },
            {
              label: "Projects",
              value: projects.length,
              icon: FolderKanban,
              color: "text-purple-500",
            },
            {
              label: "Invoices",
              value: invoices.length,
              icon: FileText,
              color: "text-green-500",
            },
            {
              label: "Workspaces",
              value: companyWorkspaces.length,
              icon: ShieldCheck,
              color: "text-orange-500",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="glass-card rounded-[2rem] p-6 shadow-xl transition hover:-translate-y-1 hover:border-sky-400/30"
              >
                <div className={`inline-flex rounded-2xl bg-white/5 p-4 ${item.color}`}>
                  <Icon className="h-8 w-8" />
                </div>

                <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] app-subtle">
                  {item.label}
                </p>

                <h2 className="mt-3 text-4xl font-black">
                  {item.value}
                </h2>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Payment Gateway Architecture
          </p>

          <h2 className="mt-3 text-3xl font-black">
            PayFast / Yoco Transaction Center
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Create payment records linked to invoices. Real gateway redirects
            and webhook verification should be handled through Supabase Edge
            Functions, not directly in React.
          </p>

          <div className="mt-8 grid gap-4">
            <select
              value={paymentInvoiceId}
              onChange={(e) => setPaymentInvoiceId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="">Select Invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} — {invoice.client_email} — R{Number(invoice.amount || 0).toLocaleString()}
                </option>
              ))}
            </select>

            <select
              value={paymentProvider}
              onChange={(e) => setPaymentProvider(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>PayFast</option>
              <option>Yoco</option>
            </select>

            <input
              type="url"
              placeholder="Checkout URL from secure backend / Edge Function"
              value={paymentCheckoutUrl}
              onChange={(e) => setPaymentCheckoutUrl(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createPaymentTransaction}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Create Payment Transaction
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {paymentTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">
                      {transaction.provider} • R{Number(transaction.amount || 0).toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm app-subtle">
                      {transaction.client_email}
                    </p>

                    <p className="mt-1 text-xs app-muted">
                      {transaction.provider_reference || "No reference"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {transaction.checkout_url && (
                      <button
                        onClick={() => window.open(transaction.checkout_url, "_blank")}
                        className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Open Checkout
                      </button>
                    )}

                    <button
                      onClick={() => markPaymentPaid(transaction)}
                      className="rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white"
                    >
                      {transaction.payment_status === "Paid" ? "Paid" : "Mark Paid"}
                    </button>
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
            SaaS Usage Tracking
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Usage & Limits
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input
              type="email"
              placeholder="Client Email"
              value={usageClientEmail}
              onChange={(e) => setUsageClientEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={usageType}
              onChange={(e) => setUsageType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>Projects</option>
              <option>Storage</option>
              <option>Users</option>
              <option>Tickets</option>
              <option>Invoices</option>
              <option>AI Quotes</option>
            </select>

            <input
              type="number"
              placeholder="Usage Count"
              value={usageCount}
              onChange={(e) => setUsageCount(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="number"
              placeholder="Usage Limit"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={usageBillingPeriod}
              onChange={(e) => setUsageBillingPeriod(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Annually</option>
            </select>

            <button
              onClick={createSaasUsageRecord}
              className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white md:col-span-2"
            >
              Save Usage Record
            </button>
          </div>

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
                      <p className="mt-1 text-sm app-subtle">{usage.client_email}</p>
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-orange-500">
            AI Proposal Templates
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Template Library
          </h2>

          <div className="mt-8 grid gap-4">
            <input
              type="text"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="text"
              placeholder="Service Type"
              value={templateServiceType}
              onChange={(e) => setTemplateServiceType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <textarea
              placeholder="Template Content"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              rows={5}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createProposalTemplate}
              className="rounded-2xl bg-orange-500 px-5 py-4 font-black text-white"
            >
              Save Template
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {aiProposalTemplates.map((template) => (
              <div key={template.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{template.template_name}</p>
                    <p className="mt-1 text-sm app-subtle">{template.service_type}</p>
                  </div>

                  <button
                    onClick={() => useTemplateForProposal(template)}
                    className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-red-500">
            Staff Audit Trails
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Security Activity Log
          </h2>

          <div className="mt-8 max-h-[520px] overflow-y-auto rounded-[2rem] app-surface p-5">
            {staffAuditTrails.map((audit) => (
              <div key={audit.id} className="mb-4 rounded-2xl bg-white/5 p-4">
                <p className="font-black">{audit.action}</p>
                <p className="mt-1 text-sm app-subtle">
                  {audit.staff_email} • {audit.module}
                </p>
                <p className="mt-1 text-xs app-muted">
                  {audit.target_record || "No target"} •{" "}
                  {audit.created_at
                    ? new Date(audit.created_at).toLocaleString("en-ZA")
                    : "—"}
                </p>
              </div>
            ))}

            {!staffAuditTrails.length && (
              <p className="text-center font-bold app-muted">
                No staff audit trails yet.
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-4">
            <button
              onClick={sendTransactionalEmail}
              className="rounded-2xl bg-red-500 px-5 py-4 font-black text-white"
            >
              Send Transactional EmailJS Message
            </button>
          </div>
        </div>
      </section>




      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">
            Commercial SaaS Plans
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Subscription Plan Catalog
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Manage Starter, Business, and Enterprise pricing packages for MKETICS SaaS workspaces.
          </p>

          <div className="mt-8 grid gap-4">
            {saasPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-2xl font-black">{plan.plan_name}</p>
                    <p className="mt-1 text-sm app-muted">
                      {plan.plan_code} • {plan.support_level} Support
                    </p>

                    <div className="mt-4 grid gap-2 text-sm app-subtle sm:grid-cols-2">
                      <p>Users: {plan.max_users}</p>
                      <p>Projects: {plan.max_projects}</p>
                      <p>AI Quotes: {plan.max_ai_quotes}</p>
                      <p>Storage: {plan.max_storage_gb}GB</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-green-500/10 p-5 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-green-500">
                      Pricing
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      R{Number(plan.monthly_price || 0).toLocaleString()}/mo
                    </p>
                    <p className="mt-1 text-sm app-muted">
                      R{Number(plan.annual_price || 0).toLocaleString()}/year
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {!saasPlans.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No SaaS plans found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Workspace Plan Assignment
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Upgrade / Downgrade Workspaces
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Assign a commercial SaaS plan to a workspace and create billing records.
          </p>

          <div className="mt-8 grid gap-4">
            <select
              value={planWorkspaceId}
              onChange={(e) => setPlanWorkspaceId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="">Select Workspace</option>
              {companyWorkspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.company_name} • {workspace.owner_email}
                </option>
              ))}
            </select>

            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="">Select SaaS Plan</option>
              {saasPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name} • R{Number(plan.monthly_price || 0).toLocaleString()}/mo
                </option>
              ))}
            </select>

            <select
              value={planBillingCycle}
              onChange={(e) => setPlanBillingCycle(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>

            <input
              type="date"
              value={planRenewalDate}
              onChange={(e) => setPlanRenewalDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={assignWorkspacePlan}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Assign SaaS Plan
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {workspacePlanAssignments.map((assignment) => {
              const workspace = companyWorkspaces.find(
                (item) => String(item.id) === String(assignment.workspace_id)
              );

              return (
                <div key={assignment.id} className="rounded-2xl app-surface p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-black">
                        {workspace?.company_name || "Workspace"} • {assignment.saas_plans?.plan_name || "Plan"}
                      </p>
                      <p className="mt-1 text-sm app-muted">
                        {assignment.billing_cycle} • {assignment.status}
                      </p>
                      <p className="mt-1 text-xs app-subtle">
                        Renews: {assignment.renews_at ? new Date(assignment.renews_at).toLocaleDateString("en-ZA") : "Not set"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => createSubscriptionFromPlan(assignment)}
                        className="rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Create Billing
                      </button>

                      <button
                        onClick={() => updateWorkspacePlanStatus(
                          assignment.id,
                          assignment.status === "Active" ? "Paused" : "Active"
                        )}
                        className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white"
                      >
                        {assignment.status === "Active" ? "Pause" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!workspacePlanAssignments.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No workspace plan assignments yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-purple-500">
            SaaS Analytics
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Workspace Metrics
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Track workspace usage, revenue, billing, projects, support, and team growth.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <select
              value={analyticsWorkspaceId}
              onChange={(e) => setAnalyticsWorkspaceId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            >
              <option value="">Select Workspace</option>
              {companyWorkspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.company_name} • {workspace.owner_email}
                </option>
              ))}
            </select>

            <select
              value={analyticsMetricName}
              onChange={(e) => setAnalyticsMetricName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>Projects</option>
              <option>Invoices</option>
              <option>Revenue</option>
              <option>Support Tickets</option>
              <option>AI Quotes</option>
              <option>Storage</option>
              <option>Members</option>
              <option>Payments</option>
            </select>

            <select
              value={analyticsMetricType}
              onChange={(e) => setAnalyticsMetricType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="usage">Usage</option>
              <option value="revenue">Revenue</option>
              <option value="billing">Billing</option>
              <option value="support">Support</option>
              <option value="team">Team</option>
              <option value="automation">Automation</option>
            </select>

            <input
              type="number"
              placeholder="Metric Value"
              value={analyticsMetricValue}
              onChange={(e) => setAnalyticsMetricValue(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            />

            <button
              onClick={recordWorkspaceAnalytics}
              className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white"
            >
              Save Metric
            </button>

            <button
              onClick={() => {
                const selected = companyWorkspaces.find(
                  (workspace) => String(workspace.id) === String(analyticsWorkspaceId)
                );

                if (!selected) {
                  alert("Select a workspace first.");
                  return;
                }

                autoCalculateWorkspaceMetrics(selected);
              }}
              className="rounded-2xl bg-black px-5 py-4 font-black text-white"
            >
              Auto Calculate
            </button>
          </div>

          <div className="mt-8 h-[320px] rounded-[2rem] app-surface p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workspaceAnalytics.slice(0, 10).reverse()}>
                <XAxis dataKey="metric_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="metric_value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid gap-4">
            {workspaceAnalytics.slice(0, 12).map((metric) => (
              <div key={metric.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{metric.metric_name}</p>
                    <p className="mt-1 text-sm app-muted">
                      {metric.metric_type} • {metric.workspace_id}
                    </p>
                  </div>

                  <p className="text-2xl font-black text-purple-500">
                    {Number(metric.metric_value || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {!workspaceAnalytics.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No workspace analytics yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">
            Usage Metering
          </p>

          <h2 className="mt-3 text-3xl font-black">
            SaaS Consumption Tracking
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Track billable usage such as AI quotes, tickets, storage, staff seats, invoices, and API calls.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <select
              value={meterWorkspaceId}
              onChange={(e) => setMeterWorkspaceId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            >
              <option value="">Select Workspace</option>
              {companyWorkspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.company_name} • {workspace.owner_email}
                </option>
              ))}
            </select>

            <select
              value={meterCategory}
              onChange={(e) => setMeterCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>AI Quotes</option>
              <option>Invoices</option>
              <option>Storage</option>
              <option>Support Tickets</option>
              <option>Staff Seats</option>
              <option>Projects</option>
              <option>Payment Links</option>
              <option>API Calls</option>
            </select>

            <select
              value={meterBillingCycle}
              onChange={(e) => setMeterBillingCycle(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>

            <input
              type="number"
              placeholder="Usage Amount"
              value={meterAmount}
              onChange={(e) => setMeterAmount(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            />

            <button
              onClick={recordWorkspaceUsageMeter}
              className="rounded-2xl bg-green-500 px-5 py-4 font-black text-white md:col-span-2"
            >
              Record Usage
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {workspaceUsageMetering.slice(0, 14).map((usage) => (
              <div key={usage.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{usage.usage_category}</p>
                    <p className="mt-1 text-sm app-muted">
                      {usage.billing_cycle} • {usage.workspace_id}
                    </p>
                    <p className="mt-1 text-xs app-subtle">
                      Recorded by {usage.recorded_by || "system"}
                    </p>
                  </div>

                  <p className="text-2xl font-black text-green-500">
                    {Number(usage.usage_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {!workspaceUsageMetering.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No usage metering yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">
            Workspace Team Access
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Team Invitations
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Invite clients, staff, managers, and workspace users into isolated company workspaces.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <select
              value={inviteWorkspaceId}
              onChange={(e) => setInviteWorkspaceId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            >
              <option value="">Select Workspace</option>
              {companyWorkspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.company_name} • {workspace.owner_email}
                </option>
              ))}
            </select>

            <input
              type="email"
              placeholder="Invited Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={createWorkspaceInvitation}
              className="rounded-2xl bg-green-500 px-5 py-4 font-black text-white md:col-span-2"
            >
              Create Invitation Link
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {workspaceInvitations.map((invite) => (
              <div key={invite.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{invite.invited_email}</p>
                    <p className="mt-1 text-sm app-muted">
                      Role: {invite.invited_role} • Status: {invite.status}
                    </p>
                    <p className="mt-1 text-xs app-subtle">
                      Expires: {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString("en-ZA") : "No expiry"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const inviteUrl = `${window.location.origin}/client-register?invite=${invite.invitation_token}`;
                        navigator.clipboard.writeText(inviteUrl);
                        toast.success("Invitation link copied");
                      }}
                      className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                    >
                      Copy Link
                    </button>

                    {invite.status !== "Accepted" && (
                      <button
                        onClick={() => addWorkspaceMemberManually(invite)}
                        className="rounded-full bg-purple-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Add Member
                      </button>
                    )}

                    {invite.status === "Pending" && (
                      <button
                        onClick={() => cancelWorkspaceInvitation(invite.id)}
                        className="rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!workspaceInvitations.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No workspace invitations yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Workspace Members
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Active Members
          </h2>

          <div className="mt-8 grid gap-4">
            {workspaceMembers.map((member) => (
              <div key={member.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{member.email}</p>
                    <p className="mt-1 text-sm app-muted">
                      Role: {member.role} • Status: {member.status}
                    </p>
                    <p className="mt-1 text-xs app-subtle">
                      Workspace: {member.workspace_id}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-500/10 px-4 py-2 text-xs font-black text-green-500">
                    {member.status || "Active"}
                  </span>
                </div>
              </div>
            ))}

            {!workspaceMembers.length && (
              <div className="rounded-2xl app-surface p-8 text-center">
                <p className="font-bold app-muted">No workspace members yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

<section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">Workspace Isolation</p>
          <h2 className="mt-3 text-3xl font-black">Company Workspaces</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input type="text" placeholder="Company Name" value={workspaceCompanyName} onChange={(e) => setWorkspaceCompanyName(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input type="text" placeholder="Company Slug" value={workspaceSlug} onChange={(e) => setWorkspaceSlug(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input type="email" placeholder="Owner Email" value={workspaceOwnerEmail} onChange={(e) => setWorkspaceOwnerEmail(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <select value={workspacePlanType} onChange={(e) => setWorkspacePlanType(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5">
              <option>Starter</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>
            <button onClick={createCompanyWorkspace} className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white md:col-span-2">Create Workspace</button>
          </div>

          <div className="mt-8 grid gap-4">
            {companyWorkspaces.map((workspace) => (
              <div key={workspace.id} className="rounded-2xl app-surface p-5">
                <p className="font-black">{workspace.company_name}</p>
                <p className="mt-1 text-sm app-subtle">{workspace.owner_email}</p>
                <p className="mt-1 text-sm app-muted">{workspace.company_slug} • {workspace.plan_type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">Subscription Billing</p>
          <h2 className="mt-3 text-3xl font-black">Recurring Billing Manager</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input type="email" placeholder="Client Email" value={subscriptionClientEmail} onChange={(e) => setSubscriptionClientEmail(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <select value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5">
              <option>Starter</option>
              <option>Business</option>
              <option>Enterprise</option>
              <option>Support Retainer</option>
            </select>
            <select value={subscriptionBillingCycle} onChange={(e) => setSubscriptionBillingCycle(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5">
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Annually</option>
            </select>
            <input type="number" placeholder="Amount" value={subscriptionAmount} onChange={(e) => setSubscriptionAmount(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input type="date" value={subscriptionNextBilling} onChange={(e) => setSubscriptionNextBilling(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2" />
            <button onClick={createSubscriptionRecord} className="rounded-2xl bg-green-500 px-5 py-4 font-black text-white md:col-span-2">Create Subscription</button>
          </div>

          <div className="mt-8 grid gap-4">
            {subscriptionRecords.map((record) => (
              <div key={record.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{record.client_email}</p>
                    <p className="mt-1 text-sm app-muted">{record.subscription_plan} • {record.billing_cycle} • R{Number(record.amount || 0).toLocaleString()}</p>
                  </div>
                  <select value={record.payment_status || "Pending"} onChange={(e) => updateSubscriptionStatus(record.id, e.target.value)} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black dark:bg-white/10">
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-purple-500">AI Proposal Builder</p>
          <h2 className="mt-3 text-3xl font-black">AI-Generated PDF Quotations</h2>

          <div className="mt-8 grid gap-4">
            <input type="email" placeholder="Client Email" value={proposalClientEmail} onChange={(e) => setProposalClientEmail(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input type="text" placeholder="Proposal Title" value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <textarea placeholder="Client requirements" value={proposalRequirements} onChange={(e) => setProposalRequirements(e.target.value)} rows={6} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <div className="grid gap-4 md:grid-cols-2">
              <button onClick={generateProposalDraft} className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white">Generate Basic Proposal</button>
              <button onClick={() => exportPremiumProposalPDF()} className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white">Export Premium PDF</button>
                <button
    onClick={testAIQuote}
    className="rounded-2xl bg-black px-5 py-4 font-black text-white md:col-span-2"
  >
    Test AI Quote
  </button>
            </div>
          </div>

          {proposalContent && (
            <pre className="mt-8 max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-[2rem] app-surface p-6 text-sm leading-7">{proposalContent}</pre>
          )}


          <div className="mt-8 rounded-[2rem] app-surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold uppercase tracking-[0.2em] text-purple-500">
                  Premium Proposal History
                </p>
                <h3 className="mt-2 text-2xl font-black">
                  Saved AI Proposals
                </h3>
              </div>

              <span className="rounded-full bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-500">
                {premiumProposals.length} Saved
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {premiumProposals.map((proposal) => (
                <div key={proposal.id} className="rounded-2xl bg-white/5 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-black">{proposal.proposal_title}</p>
                      <p className="mt-1 text-sm app-subtle">
                        {proposal.client_email} • {proposal.proposal_status || "Draft"}
                      </p>
                      <p className="mt-1 text-xs app-muted">
                        {proposal.created_at
                          ? new Date(proposal.created_at).toLocaleString("en-ZA")
                          : "No date"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setProposalTitle(proposal.proposal_title || "");
                          setProposalClientEmail(proposal.client_email || "");
                          setProposalRequirements(proposal.requirements || "");
                          setProposalContent(proposal.proposal_content || "");
                          toast.success("Premium proposal loaded");
                        }}
                        className="rounded-full bg-purple-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Load
                      </button>

                      <button
                        onClick={() => exportPremiumProposalPDF(proposal)}
                        className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Premium PDF
                      </button>
                      <button
                        onClick={() => generateProposalApprovalLink(proposal)}
                        className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white"
                      >
                        Approval Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!premiumProposals.length && (
                <p className="rounded-2xl bg-white/5 p-6 text-center font-bold app-muted">
                  No premium AI proposals saved yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {generatedProposals.map((proposal) => (
              <div key={proposal.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{proposal.proposal_title}</p>
                    <p className="mt-1 text-sm app-subtle">{proposal.client_email}</p>
                  </div>
                  <button onClick={() => exportProposalPDF(proposal)} className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-orange-500">Advanced Analytics</p>
          <h2 className="mt-3 text-3xl font-black">Business Intelligence</h2>
          <p className="mt-4 leading-8 app-muted">Subscription value: R{subscriptionValue.toLocaleString()}</p>

          <div className="mt-8 h-[300px] rounded-[2rem] app-surface p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid gap-4">
            <input type="text" placeholder="Email Subject" value={emailAutomationSubject} onChange={(e) => setEmailAutomationSubject(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <textarea placeholder="Transactional email message" value={emailAutomationMessage} onChange={(e) => setEmailAutomationMessage(e.target.value)} rows={4} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <button onClick={prepareEmailAutomation} className="rounded-2xl bg-orange-500 px-5 py-4 font-black text-white">Prepare Email Automation Hook</button>
          </div>
        </div>
      </section>

<section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Invoice Automation
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Automated Invoice Reminders
          </h2>

          <div className="mt-8 grid gap-4">
            <select
              value={reminderInvoiceId}
              onChange={(e) => setReminderInvoiceId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="">Select unpaid invoice</option>
              {invoices
                .filter((invoice) => invoice.status !== "Paid")
                .map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} — {invoice.client_email}
                  </option>
                ))}
            </select>

            <textarea
              placeholder="Reminder message"
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createInvoiceReminder}
              className="rounded-2xl bg-orange-500 px-5 py-4 font-black text-white"
            >
              Create Reminder
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {invoiceReminders.map((reminder) => (
              <div key={reminder.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{reminder.invoice_number}</p>
                    <p className="mt-1 text-sm app-subtle">{reminder.client_email}</p>
                    <p className="mt-2 text-sm app-muted">{reminder.reminder_message}</p>
                  </div>

                  <button
                    onClick={() => markReminderSent(reminder.id)}
                    className="rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white"
                  >
                    {reminder.status === "Sent" ? "Sent" : "Mark Sent"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-purple-500">
            SaaS Onboarding
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Client Onboarding Manager
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Client Name"
              value={onboardingName}
              onChange={(e) => setOnboardingName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="email"
              placeholder="Client Email"
              value={onboardingEmail}
              onChange={(e) => setOnboardingEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="text"
              placeholder="Business Name"
              value={onboardingBusiness}
              onChange={(e) => setOnboardingBusiness(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="text"
              placeholder="Service Type"
              value={onboardingService}
              onChange={(e) => setOnboardingService(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={onboardingStage}
              onChange={(e) => setOnboardingStage(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            >
              <option>Account Created</option>
              <option>Requirements Received</option>
              <option>Invoice Sent</option>
              <option>Payment Pending</option>
              <option>Project Started</option>
              <option>Active Client</option>
            </select>

            <textarea
              placeholder="Internal onboarding notes"
              value={onboardingNotes}
              onChange={(e) => setOnboardingNotes(e.target.value)}
              rows={3}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            />

            <button
              onClick={createOnboardingRecord}
              className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white md:col-span-2"
            >
              Add Onboarding Client
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {clientOnboarding.map((client) => (
              <div key={client.id} className="rounded-2xl app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-black">{client.client_name}</p>
                    <p className="mt-1 text-sm app-subtle">{client.client_email}</p>
                    <p className="mt-1 text-sm app-muted">{client.business_name}</p>
                  </div>

                  <select
                    value={client.onboarding_stage || "Account Created"}
                    onChange={(e) => updateOnboardingStage(client.id, e.target.value)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black dark:bg-white/10"
                  >
                    <option>Account Created</option>
                    <option>Requirements Received</option>
                    <option>Invoice Sent</option>
                    <option>Payment Pending</option>
                    <option>Project Started</option>
                    <option>Active Client</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-green-500">
            Live Support
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Operator Chat Center
          </h2>

          <div className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="Client Email"
              value={liveSupportClientEmail}
              onChange={(e) => setLiveSupportClientEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <textarea
              placeholder="Type support reply"
              value={liveSupportMessage}
              onChange={(e) => setLiveSupportMessage(e.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={sendAdminLiveSupportMessage}
              className="rounded-2xl bg-green-500 px-5 py-4 font-black text-white"
            >
              Send Live Support Message
            </button>
          </div>

          <div className="mt-8 max-h-[420px] overflow-y-auto rounded-[2rem] app-surface p-5">
            {liveSupportMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 rounded-2xl p-4 ${
                  msg.sender_type === "admin"
                    ? "bg-green-500/10"
                    : "bg-sky-500/10"
                }`}
              >
                <p className="text-xs font-black uppercase app-subtle">
                  {msg.sender_type} • {msg.sender_email}
                </p>
                <p className="mt-2 text-sm">{msg.message}</p>
              </div>
            ))}

            {!liveSupportMessages.length && (
              <p className="text-center font-bold app-muted">
                No live support messages yet.
              </p>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            AI Quotation Engine
          </p>

          <h2 className="mt-3 text-3xl font-black">
            AI-Assisted Quote Builder
          </h2>

          <p className="mt-4 leading-8 app-muted">
            Generate an internal quote draft from client requirements. Review
            pricing before sending to a client.
          </p>

          <div className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="Client Email"
              value={aiQuoteClientEmail}
              onChange={(e) => setAiQuoteClientEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <textarea
              placeholder="Describe requirements: website, CCTV, cloud storage, network setup, portal, support..."
              value={aiQuoteRequirements}
              onChange={(e) => setAiQuoteRequirements(e.target.value)}
              rows={6}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={generateAiQuote}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Generate AI Quote Draft
            </button>
          </div>

          {aiQuoteResult && (
            <pre className="mt-8 whitespace-pre-wrap rounded-[2rem] app-surface p-6 text-sm leading-7">
              {aiQuoteResult}
            </pre>
          )}
        </div>
      </section>

<section className="mx-auto max-w-7xl grid gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            CRM Follow-Ups
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Client Follow-up Automation
          </h2>

          <div className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="Client Email"
              value={followupClientEmail}
              onChange={(e) => setFollowupClientEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            />

            <input
              type="text"
              placeholder="Follow-up Title"
              value={followupTitle}
              onChange={(e) => setFollowupTitle(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            />

            <textarea
              placeholder="Follow-up Message"
              value={followupMessage}
              onChange={(e) => setFollowupMessage(e.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            />

            <input
              type="date"
              value={followupDueDate}
              onChange={(e) => setFollowupDueDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            />

            <button
              onClick={createCrmFollowup}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Create Follow-up
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {crmFollowups.map((item) => (
              <div key={item.id} className="rounded-2xl app-surface p-5">
                <p className="font-black">{item.followup_title}</p>
                <p className="mt-2 text-sm app-muted">{item.client_email}</p>
                <p className="mt-2 text-sm app-muted">{item.followup_message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-red-500">
            Internal Escalation
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Team Escalation Chat
          </h2>

          <div className="mt-8 grid gap-4">
            <select
              value={chatTicketId}
              onChange={(e) => setChatTicketId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <option value="">Select Ticket</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.subject}
                </option>
              ))}
            </select>

            <select
              value={chatEscalationLevel}
              onChange={(e) => setChatEscalationLevel(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <option>Normal</option>
              <option>Urgent</option>
              <option>Critical</option>
            </select>

            <textarea
              placeholder="Internal escalation message"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              rows={5}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            />

            <button
              onClick={createInternalChat}
              className="rounded-2xl bg-red-500 px-5 py-4 font-black text-white"
            >
              Send Escalation
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {internalChats.map((chat) => (
              <div key={chat.id} className="rounded-2xl app-surface p-5">
                <div className="flex items-center justify-between">
                  <p className="font-black">{chat.sender_email}</p>

                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-500">
                    {chat.escalation_level}
                  </span>
                </div>

                <p className="mt-3 text-sm app-muted">
                  {chat.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


<section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.title} className="glass-card rounded-[2rem] p-7">
                <div className={`inline-flex rounded-2xl bg-white/5 p-4 ${stat.color}`}>
                  <Icon className="h-8 w-8" />
                </div>

                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] app-subtle">
                  {stat.title}
                </p>

                <h2 className="mt-3 text-4xl font-black">{stat.value}</h2>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-7">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Analytics
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Business Insights
          </h2>

          <div className="mt-8 space-y-6">
            {[
              ["Lead Conversion", completedLeads, leads.length, "bg-green-500"],
              ["Paid Invoices", paidInvoices, invoices.length, "bg-sky-500"],
              [
                "Completed Projects",
                completedProjects,
                projects.length,
                "bg-purple-500",
              ],
            ].map(([label, done, total, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{label}</span>
                  <span>
                    {done}/{total}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{
                      width: `${total ? (done / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-7">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Activity Logs
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Recent Actions
          </h2>

          <div className="mt-8 space-y-4">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl app-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">
                      {log.action}
                    </p>

                    <p className="mt-1 text-sm app-subtle">
                      {log.module}
                    </p>

                    <p className="mt-2 text-xs app-muted">
                      {log.user_email}
                    </p>
                  </div>

                  <p className="text-xs app-subtle">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString("en-ZA")
                      : "—"}
                  </p>
                </div>
              </div>
            ))}

            {!activityLogs.length && (
              <div className="rounded-2xl app-surface p-6 text-center">
                <p className="font-bold app-muted">
                  No activity logs found.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-7">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Lead Pipeline
          </p>

          <h2 className="mt-3 text-3xl font-black">Status Overview</h2>

          <div className="mt-8 grid gap-5">
            {statusCounts.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{item.status}</span>
                  <span>{item.count}</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{
                      width: `${(item.count / maxStatusCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-7">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Modules
          </p>

          <h2 className="mt-3 text-3xl font-black">Business System</h2>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl app-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black">Invoice Module</p>
                  <p className="mt-1 text-sm app-subtle">
                    {invoices.length} invoices • R{totalInvoiceValue.toLocaleString()} total
                  </p>
                </div>
                <FileText className="h-7 w-7 text-green-500" />
              </div>
            </div>

            <div className="rounded-2xl app-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black">Project Module</p>
                  <p className="mt-1 text-sm app-subtle">
                    {projects.length} active project records
                  </p>
                </div>
                <FolderKanban className="h-7 w-7 text-purple-500" />
              </div>
            </div>

            <div className="rounded-2xl app-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black">Quote Module</p>
                  <p className="mt-1 text-sm app-subtle">
                    {quotes.length} quotation records
                  </p>
                </div>
                <Activity className="h-7 w-7 text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Team Management
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Staff Roles & Internal Accounts
              </h2>

              <p className="mt-4 max-w-3xl leading-8 app-muted">
                Create internal team records and prepare MKETICS for role-based
                access across finance, support, management, and operations.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Full Name"
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="email"
              placeholder="Staff Email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="finance">Finance</option>
              <option value="support">Support</option>
              <option value="staff">Staff</option>
            </select>

            <select
              value={staffDepartment}
              onChange={(e) => setStaffDepartment(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>General</option>
              <option>Operations</option>
              <option>Finance</option>
              <option>Support</option>
              <option>Projects</option>
              <option>Sales</option>
              <option>Technical</option>
            </select>

            <button
              onClick={createStaffRole}
              className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 font-black text-white"
            >
              <UserPlus className="h-4 w-4" />
              Add Staff Account
            </button>
          </div>

          <div className="mt-10 grid gap-4">
            {staffRoles.map((staff) => (
              <div key={staff.id} className="rounded-[2rem] app-surface p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xl font-black">
                      {staff.full_name || "Unnamed Staff"}
                    </p>

                    <p className="mt-1 text-sm app-subtle">
                      {staff.email}
                    </p>

                    <p className="mt-2 text-xs app-muted">
                      {staff.department || "General"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      value={staff.role || "staff"}
                      onChange={(e) => updateStaffRole(staff.id, e.target.value)}
                      className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black dark:bg-white/10"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="finance">Finance</option>
                      <option value="support">Support</option>
                      <option value="staff">Staff</option>
                    </select>

                    <select
                      value={staff.status || "Active"}
                      onChange={(e) => updateStaffStatus(staff.id, e.target.value)}
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        staff.status === "Suspended"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      <option>Active</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {!staffRoles.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No staff accounts created yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
              Notification Center
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Admin Notifications
            </h2>

            <p className="mt-4 max-w-3xl leading-8 app-muted">
              Create operational alerts and track internal activity notifications
              for the MKETICS admin environment.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            <input
              type="text"
              placeholder="Notification Title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <textarea
              placeholder="Notification Message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="info">Info</option>
              <option value="team">Team</option>
              <option value="finance">Finance</option>
              <option value="support">Support</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={createAdminNotification}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black text-white"
            >
              <Bell className="h-4 w-4" />
              Create Notification
            </button>
          </div>

          <div className="mt-10 grid gap-4">
            {adminNotifications.map((notification) => (
              <div key={notification.id} className="rounded-[2rem] app-surface p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xl font-black">
                        {notification.title || "Notification"}
                      </p>

                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        notification.is_read
                          ? "bg-slate-500/10 text-slate-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}>
                        {notification.is_read ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p className="mt-2 leading-7 app-muted">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs app-subtle">
                      {notification.type || "info"} • {notification.created_at
                        ? new Date(notification.created_at).toLocaleString("en-ZA")
                        : "—"}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!adminNotifications.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No admin notifications yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Approval Requests
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Client Approval Workflow
              </h2>

              <p className="mt-4 max-w-3xl leading-8 app-muted">
                Send project, quotation, invoice, or deployment approval
                requests directly to clients through their MKETICS portal.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input
              type="email"
              placeholder="Client Email"
              value={approvalClientEmail}
              onChange={(e) => setApprovalClientEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={approvalItemType}
              onChange={(e) => setApprovalItemType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>Project</option>
              <option>Invoice</option>
              <option>Quotation</option>
              <option>Deployment</option>
              <option>Handover</option>
            </select>

            <input
              type="text"
              placeholder="Approval Title"
              value={approvalItemTitle}
              onChange={(e) => setApprovalItemTitle(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            />

            <textarea
              placeholder="Approval Description"
              value={approvalDescription}
              onChange={(e) => setApprovalDescription(e.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5 md:col-span-2"
            />

            <button
              onClick={createApprovalRequest}
              className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white md:col-span-2"
            >
              Send Approval Request
            </button>
          </div>

          <div className="mt-10 grid gap-5">
            {approvalRequests.map((approval) => (
              <div
                key={approval.id}
                className="rounded-[2rem] app-surface p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black">
                        {approval.item_title}
                      </h3>

                      <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-500">
                        {approval.item_type || "Project"}
                      </span>
                    </div>

                    <p className="mt-3 leading-8 app-muted">
                      {approval.description || "No approval description provided."}
                    </p>

                    <p className="mt-3 text-sm app-subtle">
                      {approval.client_email} •{" "}
                      {approval.created_at
                        ? new Date(approval.created_at).toLocaleString("en-ZA")
                        : "—"}
                    </p>

                    {approval.approved_at && (
                      <p className="mt-2 text-sm font-bold text-green-500">
                        Approved: {new Date(approval.approved_at).toLocaleString("en-ZA")}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                      approval.status === "Approved"
                        ? "bg-green-500/10 text-green-500"
                        : approval.status === "Rejected"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-orange-500/10 text-orange-500"
                    }`}
                  >
                    {approval.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}

            {!approvalRequests.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No approval requests found.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Invoice System
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Create Invoice
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <input
              type="email"
              placeholder="Client Email"
              value={invoiceEmail}
              onChange={(e) => setInvoiceEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="text"
              placeholder="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="text"
              placeholder="Service"
              value={invoiceService}
              onChange={(e) => setInvoiceService(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="number"
              placeholder="Amount"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createInvoice}
              className="rounded-2xl bg-green-500 px-5 py-4 font-black text-white"
            >
              Create Invoice
            </button>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Invoice
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Service
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 dark:border-white/5"
                  >
                    <td className="px-4 py-5 font-bold">
                      {invoice.invoice_number}
                    </td>

                    <td className="px-4 py-5">
                      {invoice.client_email}
                    </td>

                    <td className="px-4 py-5">
                      {invoice.service}
                    </td>

                    <td className="px-4 py-5 font-black text-sky-500">
                      R{Number(invoice.amount || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-black ${
                          invoice.status === "Paid"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-orange-500/10 text-orange-500"
                        }`}
                      >
                        {invoice.status || "Unpaid"}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => markInvoicePaid(invoice.id, invoice.status)}
                          className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white"
                        >
                          Toggle Status
                        </button>

                        <button
                          onClick={() => exportInvoicePDF(invoice)}
                          className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black text-white"
                        >
                          PDF
                        </button>
                        <button
                            onClick={() =>
                            window.open(invoice.invoice_pdf_url, "_blank")
                          }
                          className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black text-white"
                        >
                        Pay Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!invoices.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <p className="text-lg font-bold app-muted">
                        No invoices found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Project Tracking
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Project Boards
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="email"
              placeholder="Client Email"
              value={projectClient}
              onChange={(e) => setProjectClient(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option>Planning</option>
              <option>In Progress</option>
              <option>Testing</option>
              <option>Completed</option>
            </select>

            <input
              type="number"
              placeholder="Progress %"
              value={projectProgress}
              onChange={(e) => setProjectProgress(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createProject}
              className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white"
            >
              Create Project
            </button>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Project
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Progress
                  </th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-100 dark:border-white/5"
                  >
                    <td className="px-4 py-5 font-bold">
                      {project.project_name}
                    </td>

                    <td className="px-4 py-5">
                      {project.client_email}
                    </td>

                    <td className="px-4 py-5">
                      <select
                        value={project.status || "Planning"}
                        onChange={(e) =>
                          updateProjectStatus(project.id, e.target.value)
                        }
                        className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black dark:bg-white/10"
                      >
                        <option>Planning</option>
                        <option>In Progress</option>
                        <option>Testing</option>
                        <option>Completed</option>
                      </select>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{
                              width: `${project.progress || 0}%`,
                            }}
                          />
                        </div>

                        <input
                          type="number"
                          value={project.progress || 0}
                          onChange={(e) =>
                            updateProjectProgress(project.id, e.target.value)
                          }
                          className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black outline-none dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {!projects.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <p className="text-lg font-bold app-muted">
                        No projects found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>



      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Kanban Workflow
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Drag & Drop Project Board
              </h2>

              <p className="mt-4 max-w-3xl leading-8 app-muted">
                Move projects between planning, implementation, testing, and
                completion stages. Updates sync to Supabase and project records
                automatically.
              </p>
            </div>
          </div>

          <DragDropContext onDragEnd={handleKanbanDrag}>
            <div className="mt-10 grid gap-6 lg:grid-cols-4">
              {["Planning", "In Progress", "Testing", "Completed"].map((column) => (
                <Droppable droppableId={column} key={column}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[520px] rounded-[2rem] p-5 transition ${
                        snapshot.isDraggingOver ? "bg-sky-500/10" : "app-surface"
                      }`}
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-xl font-black">{column}</h3>

                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-500">
                          {
                            kanbanProjects.filter(
                              (project) =>
                                (project.board_column || project.status || "Planning") === column
                            ).length
                          }
                        </span>
                      </div>

                      <div className="space-y-4">
                        {kanbanProjects
                          .filter(
                            (project) =>
                              (project.board_column || project.status || "Planning") === column
                          )
                          .map((project, index) => (
                            <Draggable
                              key={project.id}
                              draggableId={String(project.id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-white/10 dark:bg-white/5 ${
                                    snapshot.isDragging ? "scale-[1.02] shadow-xl" : "hover:-translate-y-1"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-lg font-black">
                                        {project.project_name}
                                      </p>

                                      <p className="mt-1 break-words text-sm app-subtle">
                                        {project.client_email}
                                      </p>
                                    </div>

                                    <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-500">
                                      {project.progress || 0}%
                                    </span>
                                  </div>

                                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                    <div
                                      className="h-full rounded-full bg-purple-500"
                                      style={{ width: `${project.progress || 0}%` }}
                                    />
                                  </div>

                                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-500">
                                      {project.status || "Planning"}
                                    </span>

                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-black ${
                                        project.priority === "High"
                                          ? "bg-red-500/10 text-red-500"
                                          : project.priority === "Low"
                                          ? "bg-slate-500/10 text-slate-500"
                                          : "bg-orange-500/10 text-orange-500"
                                      }`}
                                    >
                                      {project.priority || "Medium"}
                                    </span>
                                  </div>

                                  {project.assigned_to && (
                                    <p className="mt-3 text-xs app-muted">
                                      Assigned to: {project.assigned_to}
                                    </p>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}

                        {provided.placeholder}

                        {!kanbanProjects.filter(
                          (project) =>
                            (project.board_column || project.status || "Planning") === column
                        ).length && (
                          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10">
                            <p className="text-sm font-bold app-muted">
                              Drop projects here.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Project Timeline
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Project Updates
              </h2>

              <p className="mt-4 max-w-3xl leading-8 app-muted">
                Post timeline updates that clients can see inside their
                secure MKETICS portal.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name} — {project.client_email}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Update Title"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <input
              type="text"
              placeholder="Update Message"
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createProjectUpdate}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Add Update
            </button>
          </div>

          <div className="mt-10 grid gap-5">
            {projectUpdates.map((update) => (
              <div
                key={update.id}
                className="rounded-[2rem] app-surface p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                      {update.client_email}
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      {update.update_title}
                    </h3>

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
                  No project timeline updates found.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                File Management
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Project & Support Files
              </h2>

              <p className="mt-4 max-w-3xl leading-8 app-muted">
                Upload client deliverables, project documents, support evidence,
                screenshots, and handover files securely through Supabase Storage.
              </p>
            </div>
          </div>

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
                      {project.project_name} — {project.client_email}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  onChange={(e) => setAdminProjectFile(e.target.files?.[0] || null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                />

                <button
                  onClick={uploadAdminProjectFile}
                  disabled={uploadingFile}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-5 py-4 font-black text-white disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? "Uploading..." : "Upload Project File"}
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] app-surface p-6">
              <p className="font-black">Upload Support File</p>

              <div className="mt-5 grid gap-4">
                <select
                  value={selectedSupportTicketId}
                  onChange={(e) => setSelectedSupportTicketId(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                >
                  <option value="">Select Support Ticket</option>
                  {tickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.subject} — {ticket.client_email}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  onChange={(e) => setAdminSupportFile(e.target.files?.[0] || null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
                />

                <button
                  onClick={uploadAdminSupportFile}
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
                        <p className="mt-1 text-sm app-subtle">{file.client_email}</p>
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
                    <p className="font-bold app-muted">No project files uploaded yet.</p>
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
                        <p className="mt-1 text-sm app-subtle">{file.client_email}</p>
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
                    <p className="font-bold app-muted">No support files uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Support System
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Ticket Management
              </h2>
            </div>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Subject
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Message
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-100 dark:border-white/5"
                  >
                    <td className="px-4 py-5 font-bold">
                      {ticket.client_email}
                    </td>

                    <td className="px-4 py-5">
                      {ticket.subject}
                    </td>

                    <td className="px-4 py-5 max-w-[350px]">
                      <p className="line-clamp-2">
                        {ticket.message}
                      </p>
                    </td>

                    <td className="px-4 py-5">
                      <select
                        value={ticket.status || "Open"}
                        onChange={(e) =>
                          updateTicketStatus(ticket.id, e.target.value)
                        }
                        className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black dark:bg-white/10"
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                      </select>
                    </td>

                    <td className="px-4 py-5 text-sm app-subtle">
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleDateString("en-ZA")
                        : "—"}
                    </td>
                  </tr>
                ))}

                {!tickets.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <p className="text-lg font-bold app-muted">
                        No support tickets found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
                Lead Management
              </p>

              <h2 className="mt-3 text-3xl font-black">Client Requests</h2>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative w-full lg:w-[320px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/5"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold outline-none dark:border-white/10 dark:bg-white/5"
              >
                <option>All</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Quoted</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>

              <button
                onClick={refreshDashboard}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black text-white"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Service
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Budget
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-100 transition hover:bg-black/[0.02] dark:border-white/5 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-5">
                      <p className="font-bold">{lead.name}</p>
                      <p className="mt-1 text-sm app-subtle">{lead.email}</p>
                    </td>

                    <td className="px-4 py-5 font-medium">{lead.service}</td>

                    <td className="px-4 py-5 font-black text-sky-500">
                      R{Number(lead.estimated_price || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-5 text-sm app-subtle">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleDateString("en-ZA")
                        : "—"}
                    </td>

                    <td className="px-4 py-5">
                      <select
                        value={lead.status || "New"}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`rounded-full border-0 px-4 py-2 text-xs font-black outline-none ${
                          statusStyles[lead.status || "New"]
                        }`}
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Quoted</option>
                        <option>Completed</option>
                        <option>Archived</option>
                      </select>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white"
                        >
                          <Eye className="inline h-3 w-3" /> View
                        </button>

                        <a
                          href={`mailto:${lead.email}`}
                          className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black text-white"
                        >
                          Email
                        </a>

                        <a
                          href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-green-500 px-4 py-2 text-xs font-black text-white"
                        >
                          WhatsApp
                        </a>

                        <button
                          onClick={() => archiveLead(lead.id)}
                          className="rounded-full bg-slate-500 px-4 py-2 text-xs font-black text-white"
                        >
                          <Archive className="inline h-3 w-3" /> Archive
                        </button>

                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white"
                        >
                          <Trash2 className="inline h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredLeads.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <p className="text-lg font-bold app-muted">No leads found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-slate-950">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                  Lead Details
                </p>

                <h2 className="mt-3 text-3xl font-black">{selectedLead.name}</h2>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {[
                ["Email", selectedLead.email],
                ["Phone", selectedLead.phone],
                ["Service", selectedLead.service],
                [
                  "Budget",
                  `R${Number(selectedLead.estimated_price || 0).toLocaleString()}`,
                ],
                ["Status", selectedLead.status || "New"],
                [
                  "Created",
                  selectedLead.created_at
                    ? new Date(selectedLead.created_at).toLocaleString("en-ZA")
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl app-surface p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] app-subtle">
                    {label}
                  </p>

                  <p className="mt-2 break-words font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl app-surface p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] app-subtle">
                Project Notes
              </p>

              <p className="mt-2 leading-8 app-muted">
                {selectedLead.message || "No message provided."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${selectedLead.email}`}
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
              >
                Email Client
              </a>

              <a
                href={`https://wa.me/${selectedLead.phone?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white"
              >
                WhatsApp Client
              </a>
            </div>
          </div>
        </div>

        
      )}

      <Footer />
    </main>
  );
}