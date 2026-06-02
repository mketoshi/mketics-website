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


const parseLeadDetails = (message = "") => {
  const lines = String(message || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const details = {
    projectNotes: [],
    location: "",
    timeline: "",
    budgetRange: "",
    contactMethod: "",
  };

  lines.forEach((line) => {
    if (line.startsWith("Location/Site:")) details.location = line.replace("Location/Site:", "").trim();
    else if (line.startsWith("Timeline:")) details.timeline = line.replace("Timeline:", "").trim();
    else if (line.startsWith("Budget Range:")) details.budgetRange = line.replace("Budget Range:", "").trim();
    else if (line.startsWith("Preferred Contact:")) details.contactMethod = line.replace("Preferred Contact:", "").trim();
    else details.projectNotes.push(line);
  });

  return details;
};

const cleanPhoneForWhatsApp = (phone = "") => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
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
      alert("Select workspace and workspace plan.");
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
      toast.error("Could not assign workspace plan.");
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
      "Assigned workspace plan",
      "Workspace Billing",
      `${selectedWorkspace?.company_name || planWorkspaceId} → ${selectedPlan?.plan_name || selectedPlanId}`
    );

    await supabase.from("admin_notifications").insert([
      {
        title: "Workspace Plan Assigned",
        message: `${selectedWorkspace?.company_name || "Workspace"} was assigned to ${selectedPlan?.plan_name || "a plan"}.`,
        type: "billing",
        is_read: false,
      },
    ]);

    toast.success("Workspace workspace plan assigned");

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

    await logStaffAudit("Updated workspace plan status", "Workspace Billing", status);
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
      "Created subscription from workspace plan",
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
      "Workspace Analytics",
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
      "Workspace Analytics",
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

    await logStaffAudit("Created workspace usage record", "Usage Tracking", usageClientEmail);
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

  const prepareProjectFromLead = (lead) => {
    const projectTitle = `${lead.service || "MKETICS Project"} - ${lead.name || "Client"}`;

    setProjectName(projectTitle);
    setProjectClient(lead.email || "");
    setProjectStatus("Planning");
    setProjectProgress(0);
    setSelectedLead(null);

    setTimeout(() => {
      document.getElementById("quick-project")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const prepareInvoiceFromLead = (lead) => {
    const nextNumber = `INV-${String((invoices?.length || 0) + 1).padStart(4, "0")}`;

    setInvoiceEmail(lead.email || "");
    setInvoiceNumber(nextNumber);
    setInvoiceService(lead.service || "");
    setInvoiceAmount(lead.estimated_price || "");
    setSelectedLead(null);

    setTimeout(() => {
      document.getElementById("quick-invoice")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
      title: "Workspace Plans",
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

  const adminSummary = [
    {
      label: "New Leads",
      value: leads.filter((lead) => (lead.status || "New") === "New").length,
      icon: Users,
      tone: "text-sky-500",
      note: "Quote requests to action",
    },
    {
      label: "Active Projects",
      value: projects.filter((project) => project.status !== "Completed").length,
      icon: FolderKanban,
      tone: "text-purple-500",
      note: "Work currently in progress",
    },
    {
      label: "Unpaid Invoices",
      value: invoices.filter((invoice) => invoice.status !== "Paid").length,
      icon: Wallet,
      tone: "text-orange-500",
      note: "Follow up on payments",
    },
    {
      label: "Open Tickets",
      value: tickets.filter((ticket) => ticket.status !== "Closed").length,
      icon: Activity,
      tone: "text-green-500",
      note: "Client support items",
    },
  ];

  const adminFlow = [
    {
      title: "Requests",
      text: "Capture quote requests and convert serious enquiries into projects.",
      icon: Users,
      href: "#leads",
    },
    {
      title: "Delivery",
      text: "Track real MKETICS work: websites, systems, networks, cloud and CCTV.",
      icon: FolderKanban,
      href: "#projects",
    },
    {
      title: "Billing",
      text: "Create invoices, confirm payments and keep client records clean.",
      icon: FileText,
      href: "#invoices",
    },
    {
      title: "Support",
      text: "View support tickets and keep communication professional.",
      icon: ShieldCheck,
      href: "#tickets",
    },
  ];

  return (
    <main className="min-h-screen app-bg">
      <Toaster position="top-right" />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-8 pt-28 sm:pb-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="glass-card rounded-[2rem] p-6 shadow-2xl sm:rounded-[2.5rem] sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-400">
                  <ShieldCheck className="h-4 w-4" />
                  Founder Admin Control
                </div>

                <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  MKETICS <span className="text-sky-500">Business Control</span>
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 app-muted sm:text-lg">
                  A cleaner internal dashboard for managing quote requests, client projects,
                  invoices and support activity without mixing in advanced platform tools.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
                  {[
                    ["Quote Requests", "#leads"],
                    ["Projects", "#projects"],
                    ["Invoices", "#invoices"],
                    ["Support", "#tickets"],
                  ].map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-sm font-black transition hover:border-sky-400/40 hover:bg-sky-500/10"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-500/10 text-sky-400">
                    <UserCog className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] app-subtle">
                      Administrator
                    </p>
                    <p className="mt-1 max-w-[240px] break-words text-sm font-bold sm:text-base">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-4 text-sm font-black text-white hover:bg-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminSummary.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-card rounded-[1.75rem] p-5 shadow-xl">
                <div className={`inline-flex rounded-2xl bg-white/5 p-3 ${item.tone}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] app-subtle">
                  {item.label}
                </p>
                <h2 className="mt-2 text-4xl font-black">{item.value}</h2>
                <p className="mt-2 text-sm app-muted">{item.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {adminFlow.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.title} href={item.href} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-sky-400/40 hover:bg-sky-500/10">
                <div className="flex items-start justify-between gap-5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sky-400 transition group-hover:translate-x-1">→</span>
                </div>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 app-muted">{item.text}</p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 lg:grid-cols-2">
        <div id="quick-invoice" className="glass-card scroll-mt-28 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-500/10 text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Quick Invoice</p>
              <h2 className="text-2xl font-black">Create client invoice</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <input value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} placeholder="Client email" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Invoice number e.g. INV-0007" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input value={invoiceService} onChange={(e) => setInvoiceService(e.target.value)} placeholder="Service e.g. Website design" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} placeholder="Amount" type="number" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <button onClick={createInvoice} className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white hover:bg-sky-400">
              Create Invoice
            </button>
          </div>
        </div>

        <div id="quick-project" className="glass-card scroll-mt-28 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/10 text-purple-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Quick Project</p>
              <h2 className="text-2xl font-black">Add delivery project</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <input value={projectClient} onChange={(e) => setProjectClient(e.target.value)} placeholder="Client email" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <select value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5">
              <option>Planning</option>
              <option>In Progress</option>
              <option>Testing</option>
              <option>Completed</option>
            </select>
            <input value={projectProgress} onChange={(e) => setProjectProgress(e.target.value)} placeholder="Progress %" type="number" min="0" max="100" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5" />
            <button onClick={createProject} className="rounded-2xl bg-purple-500 px-5 py-4 font-black text-white hover:bg-purple-400">
              Add Project
            </button>
          </div>
        </div>
      </section>

      <section id="leads" className="mx-auto max-w-7xl px-4 pb-8">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Quote Requests</p>
              <h2 className="mt-2 text-3xl font-black">Incoming client enquiries</h2>
              <p className="mt-3 max-w-2xl app-muted">Review new requests, contact clients and move serious leads forward.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 app-subtle" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads" className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 outline-none dark:border-white/10 dark:bg-white/5" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5">
                <option>All</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Quoted</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {filteredLeads.slice(0, 12).map((lead) => {
              const details = parseLeadDetails(lead.message);
              const whatsappNumber = cleanPhoneForWhatsApp(lead.phone);
              const whatsappMessage = encodeURIComponent(`Hi ${lead.name || "there"}, this is MKETICS. We received your quote request for ${lead.service || "your project"}.`);
              return (
                <div key={lead.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black">{lead.name || "Unnamed client"}</h3>
                      <p className="mt-1 break-words text-sm app-subtle">{lead.email}</p>
                      <p className="mt-1 break-words text-sm app-subtle">{lead.phone || "No phone number"}</p>
                      <p className="mt-3 font-bold text-sky-400">{lead.service || "Service not specified"}</p>
                      <p className="mt-2 text-sm app-muted">{lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-ZA") : "No date"}</p>
                    </div>
                    <select value={lead.status || "New"} onChange={(e) => updateLeadStatus(lead.id, e.target.value)} className={`rounded-full border-0 px-4 py-2 text-xs font-black outline-none ${statusStyles[lead.status || "New"]}`}>
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Quoted</option>
                      <option>Completed</option>
                      <option>Archived</option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-black/10 p-3 dark:bg-black/20">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] app-subtle">Location</p>
                      <p className="mt-1 text-sm font-bold">{details.location || "Not provided"}</p>
                    </div>
                    <div className="rounded-2xl bg-black/10 p-3 dark:bg-black/20">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] app-subtle">Timeline</p>
                      <p className="mt-1 text-sm font-bold">{details.timeline || "Not provided"}</p>
                    </div>
                    <div className="rounded-2xl bg-black/10 p-3 dark:bg-black/20">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] app-subtle">Budget Range</p>
                      <p className="mt-1 text-sm font-bold">{details.budgetRange || "Not provided"}</p>
                    </div>
                    <div className="rounded-2xl bg-black/10 p-3 dark:bg-black/20">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] app-subtle">Preferred Contact</p>
                      <p className="mt-1 text-sm font-bold">{details.contactMethod || "Not provided"}</p>
                    </div>
                  </div>

                  {details.projectNotes.length > 0 && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 app-muted">{details.projectNotes.join(" ")}</p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => setSelectedLead(lead)} className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white"><Eye className="inline h-3 w-3" /> View Details</button>
                    <button onClick={() => prepareProjectFromLead(lead)} className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-black text-white">Prepare Project</button>
                    <button onClick={() => prepareInvoiceFromLead(lead)} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-white">Prepare Invoice</button>
                    <a href={`mailto:${lead.email}`} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black text-white">Email</a>
                    {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500 px-4 py-2 text-xs font-black text-white">WhatsApp</a>}
                    <button onClick={() => archiveLead(lead.id)} className="rounded-full bg-slate-500 px-4 py-2 text-xs font-black text-white"><Archive className="inline h-3 w-3" /> Archive</button>
                  </div>
                </div>
              );
            })}
            {!filteredLeads.length && <p className="rounded-2xl app-surface p-8 text-center font-bold app-muted lg:col-span-2">No leads found.</p>}
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-7xl px-4 pb-8">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Projects</p>
              <h2 className="mt-2 text-3xl font-black">Delivery pipeline</h2>
            </div>
            <button onClick={refreshDashboard} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black text-white">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {projects.slice(0, 9).map((project) => (
              <div key={project.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-xl font-black">{project.project_name}</h3>
                <p className="mt-1 break-words text-sm app-subtle">{project.client_email}</p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${Number(project.progress || 0)}%` }} />
                </div>
                <p className="mt-2 text-sm font-bold text-sky-400">{Number(project.progress || 0)}% complete</p>
                <div className="mt-5 grid gap-3">
                  <select value={project.status || "Planning"} onChange={(e) => updateProjectStatus(project.id, e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5">
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Testing</option>
                    <option>Completed</option>
                  </select>
                  <input type="number" min="0" max="100" value={project.progress || 0} onChange={(e) => updateProjectProgress(project.id, e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" />
                </div>
              </div>
            ))}
            {!projects.length && <p className="rounded-2xl app-surface p-8 text-center font-bold app-muted lg:col-span-3">No projects yet.</p>}
          </div>
        </div>
      </section>

      <section id="invoices" className="mx-auto max-w-7xl px-4 pb-8">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">Invoices</p>
            <h2 className="mt-2 text-3xl font-black">Billing records</h2>
            <p className="mt-3 app-muted">Total invoice value: <span className="font-black text-green-400">R{totalInvoiceValue.toLocaleString()}</span></p>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {invoices.slice(0, 12).map((invoice) => (
              <div key={invoice.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">{invoice.invoice_number}</h3>
                    <p className="mt-1 break-words text-sm app-subtle">{invoice.client_email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${invoice.status === "Paid" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}>{invoice.status === "Paid" ? "Paid" : "Unpaid"}</span>
                </div>
                <p className="mt-5 text-3xl font-black text-green-400">R{Number(invoice.amount || 0).toLocaleString()}</p>
                <p className="mt-2 text-sm app-muted">{invoice.service || invoice.notes || "MKETICS service"}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => markInvoicePaid(invoice.id, invoice.status)} className="rounded-full bg-green-500 px-4 py-2 text-xs font-black text-white">{invoice.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}</button>
                  <button onClick={() => exportInvoicePDF(invoice)} className="rounded-full bg-sky-500 px-4 py-2 text-xs font-black text-white"><Download className="inline h-3 w-3" /> PDF</button>
                </div>
              </div>
            ))}
            {!invoices.length && <p className="rounded-2xl app-surface p-8 text-center font-bold app-muted lg:col-span-3">No invoices yet.</p>}
          </div>
        </div>
      </section>

      <section id="tickets" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Support</p>
            <h2 className="mt-2 text-3xl font-black">Support tickets</h2>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {tickets.slice(0, 9).map((ticket) => (
              <div key={ticket.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-xl font-black">{ticket.title || ticket.subject || "Support request"}</h3>
                <p className="mt-1 break-words text-sm app-subtle">{ticket.client_email}</p>
                <p className="mt-4 line-clamp-3 text-sm leading-7 app-muted">{ticket.description || ticket.message || "No description provided."}</p>
                <select value={ticket.status || "Open"} onChange={(e) => updateTicketStatus(ticket.id, e.target.value)} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5">
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
            ))}
            {!tickets.length && <p className="rounded-2xl app-surface p-8 text-center font-bold app-muted lg:col-span-3">No support tickets yet.</p>}
          </div>
        </div>
      </section>

      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-950 sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Lead Details</p>
                <h2 className="mt-3 text-3xl font-black">{selectedLead.name}</h2>
              </div>
              <button onClick={() => setSelectedLead(null)} className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">Close</button>
            </div>

            {(() => {
              const details = parseLeadDetails(selectedLead.message);
              const whatsappNumber = cleanPhoneForWhatsApp(selectedLead.phone);
              const whatsappMessage = encodeURIComponent(`Hi ${selectedLead.name || "there"}, this is MKETICS. We received your quote request for ${selectedLead.service || "your project"}.`);
              return (
                <>
                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {[
                      ["Email", selectedLead.email],
                      ["Phone", selectedLead.phone],
                      ["Service", selectedLead.service],
                      ["Estimated Budget", `R${Number(selectedLead.estimated_price || 0).toLocaleString()}`],
                      ["Location/Site", details.location || "Not provided"],
                      ["Timeline", details.timeline || "Not provided"],
                      ["Budget Range", details.budgetRange || "Not provided"],
                      ["Preferred Contact", details.contactMethod || "Not provided"],
                      ["Status", selectedLead.status || "New"],
                      ["Created", selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString("en-ZA") : "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl app-surface p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] app-subtle">{label}</p>
                        <p className="mt-2 break-words font-bold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl app-surface p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] app-subtle">Project Notes</p>
                    <p className="mt-2 whitespace-pre-line leading-8 app-muted">{details.projectNotes.length ? details.projectNotes.join("\n") : "No message provided."}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => prepareProjectFromLead(selectedLead)} className="rounded-full bg-indigo-500 px-5 py-3 text-sm font-black text-white">Prepare Project</button>
                    <button onClick={() => prepareInvoiceFromLead(selectedLead)} className="rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-white">Prepare Invoice</button>
                    <a href={`mailto:${selectedLead.email}`} className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">Email Client</a>
                    {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white">WhatsApp Client</a>}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
