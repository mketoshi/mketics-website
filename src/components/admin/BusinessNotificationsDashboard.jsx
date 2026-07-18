import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Clock,
  FileText,
  Headphones,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const recentLimit = 120;
const reminderSettingKey = "admin_reminders";
const openTicketStatuses = ["open", "in_progress", "waiting_for_client"];
const manualReminderStatuses = ["open", "completed"];
const priorityOrder = {
  urgent: 1,
  high: 2,
  medium: 3,
  normal: 4,
  low: 5,
};

export default function BusinessNotificationsDashboard({ isActive, onGoToTab }) {
  const [dashboardState, setDashboardState] = useState({
    loading: false,
    error: "",
    leads: [],
    quotes: [],
    projects: [],
    tickets: [],
    reminders: [],
  });

  const [reminderForm, setReminderForm] = useState({
    title: "",
    dueDate: getTodayInputValue(),
    priority: "medium",
    area: "General",
    details: "",
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchNotificationsData();
    }
  }, [isActive]);

  const systemNotifications = useMemo(() => {
    return buildSystemNotifications(dashboardState).slice(0, 80);
  }, [dashboardState]);

  const openReminders = useMemo(() => {
    return dashboardState.reminders
      .filter((reminder) => reminder.status !== "completed")
      .sort(sortReminderItems);
  }, [dashboardState.reminders]);

  const completedReminders = useMemo(() => {
    return dashboardState.reminders
      .filter((reminder) => reminder.status === "completed")
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
      .slice(0, 8);
  }, [dashboardState.reminders]);

  const combinedQueue = useMemo(() => {
    const manualItems = openReminders.map((reminder) => ({
      id: `manual-${reminder.id}`,
      source: "Manual Reminder",
      title: reminder.title,
      description: reminder.details || `${reminder.area} reminder`,
      priority: reminder.priority || "medium",
      dueDate: reminder.dueDate,
      tab: getTabForArea(reminder.area),
      icon: CalendarCheck,
      isManual: true,
      reminder,
    }));

    return [...systemNotifications, ...manualItems]
      .sort(sortNotificationItems)
      .slice(0, 40);
  }, [openReminders, systemNotifications]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());

    const overdue = combinedQueue.filter((item) => {
      if (!item.dueDate) return false;
      return startOfDay(new Date(item.dueDate)) < today;
    }).length;

    const dueToday = combinedQueue.filter((item) => {
      if (!item.dueDate) return false;
      return datesMatch(new Date(item.dueDate), today);
    }).length;

    const urgent = combinedQueue.filter((item) => item.priority === "urgent").length;

    return {
      total: combinedQueue.length,
      overdue,
      dueToday,
      urgent,
      manualOpen: openReminders.length,
    };
  }, [combinedQueue, openReminders.length]);

  async function fetchNotificationsData() {
    if (!supabase) return;

    try {
      setDashboardState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const [leadsResponse, quotesResponse, projectsResponse, ticketsResponse, remindersResponse] =
        await Promise.all([
          supabase
            .from("leads")
            .select(
              "id, full_name, email, phone, organisation, service_needed, status, created_at, updated_at"
            )
            .order("updated_at", { ascending: false })
            .limit(recentLimit),
          supabase
            .from("quotes")
            .select(
              "id, lead_id, client_id, project_id, quote_number, title, amount, currency, status, valid_until, sent_at, accepted_at, rejected_at, created_at, updated_at"
            )
            .order("updated_at", { ascending: false })
            .limit(recentLimit),
          supabase
            .from("projects")
            .select(
              "id, client_id, lead_id, title, service_type, status, start_date, due_date, completed_at, created_at, updated_at"
            )
            .order("updated_at", { ascending: false })
            .limit(recentLimit),
          supabase
            .from("support_tickets")
            .select(
              "id, client_id, project_id, ticket_type, priority, subject, status, closed_at, created_at, updated_at"
            )
            .order("updated_at", { ascending: false })
            .limit(recentLimit),
          supabase
            .from("settings")
            .select("setting_value")
            .eq("setting_key", reminderSettingKey)
            .maybeSingle(),
        ]);

      const firstError = [
        leadsResponse.error,
        quotesResponse.error,
        projectsResponse.error,
        ticketsResponse.error,
        remindersResponse.error,
      ].find(Boolean);

      if (firstError) throw firstError;

      setDashboardState({
        loading: false,
        error: "",
        leads: leadsResponse.data || [],
        quotes: quotesResponse.data || [],
        projects: projectsResponse.data || [],
        tickets: ticketsResponse.data || [],
        reminders: normaliseReminders(remindersResponse.data?.setting_value?.reminders),
      });
    } catch (error) {
      setDashboardState({
        loading: false,
        error:
          error?.message ||
          "Unable to load notifications and reminders. Check Supabase settings permissions.",
        leads: [],
        quotes: [],
        projects: [],
        tickets: [],
        reminders: [],
      });
    }
  }

  async function saveReminders(nextReminders, successMessage) {
    if (!supabase) return;

    const cleanReminders = normaliseReminders(nextReminders);

    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: reminderSettingKey,
        setting_value: {
          reminders: cleanReminders,
        },
        description: "MKETICS admin manual business reminders.",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;

    setDashboardState((current) => ({
      ...current,
      reminders: cleanReminders,
    }));

    setSaveState({
      loading: false,
      error: "",
      success: successMessage,
    });
  }

  async function handleAddReminder(event) {
    event.preventDefault();

    if (!reminderForm.title.trim()) {
      setSaveState({
        loading: false,
        error: "Write a reminder title before saving.",
        success: "",
      });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const nextReminder = {
        id: createId(),
        title: reminderForm.title.trim(),
        details: reminderForm.details.trim(),
        dueDate: reminderForm.dueDate || getTodayInputValue(),
        priority: reminderForm.priority || "medium",
        area: reminderForm.area || "General",
        status: "open",
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      await saveReminders(
        [nextReminder, ...dashboardState.reminders],
        "Reminder saved successfully."
      );

      setReminderForm({
        title: "",
        dueDate: getTodayInputValue(),
        priority: "medium",
        area: "General",
        details: "",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to save reminder.",
        success: "",
      });
    }
  }

  async function handleToggleReminder(reminder) {
    try {
      setSaveState({ loading: true, error: "", success: "" });

      const nextStatus = reminder.status === "completed" ? "open" : "completed";

      const nextReminders = dashboardState.reminders.map((item) =>
        item.id === reminder.id
          ? {
              ...item,
              status: nextStatus,
              completedAt: nextStatus === "completed" ? new Date().toISOString() : null,
            }
          : item
      );

      await saveReminders(
        nextReminders,
        nextStatus === "completed" ? "Reminder marked as completed." : "Reminder reopened."
      );
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to update reminder.",
        success: "",
      });
    }
  }

  async function handleDeleteReminder(reminder) {
    try {
      setSaveState({ loading: true, error: "", success: "" });

      const nextReminders = dashboardState.reminders.filter((item) => item.id !== reminder.id);

      await saveReminders(nextReminders, "Reminder deleted.");
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to delete reminder.",
        success: "",
      });
    }
  }

  async function handleCopyActionPlan() {
    const actionPlan = buildActionPlan(combinedQueue);

    try {
      await navigator.clipboard.writeText(actionPlan);
      setSaveState({
        loading: false,
        error: "",
        success: "Action plan copied to clipboard.",
      });
    } catch {
      setSaveState({
        loading: false,
        error: "Copy failed. Select the notification list manually and copy it.",
        success: "",
      });
    }
  }

  function updateReminderForm(event) {
    const { name, value } = event.target;

    setReminderForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-[#061A33] p-6 text-white lg:p-8">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[#0B7CFF]/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                <Bell size={16} />
                Notifications & Reminders
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Business follow-up control centre.
              </h2>

              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-300">
                Track overdue work, urgent support, quote follow-ups, project due dates and manual reminders in one MKETICS workflow.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyActionPlan}
                className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
              >
                <Clipboard size={17} className="mr-2" />
                Copy Action Plan
              </button>

              <button
                type="button"
                onClick={fetchNotificationsData}
                disabled={dashboardState.loading}
                className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33] disabled:opacity-70"
              >
                {dashboardState.loading ? (
                  <Loader2 size={17} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={17} className="mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <NotificationStatCard label="Total Queue" value={stats.total} icon={Bell} />
          <NotificationStatCard label="Overdue" value={stats.overdue} icon={AlertCircle} />
          <NotificationStatCard label="Due Today" value={stats.dueToday} icon={Clock} />
          <NotificationStatCard label="Urgent" value={stats.urgent} icon={Headphones} />
          <NotificationStatCard label="Manual" value={stats.manualOpen} icon={CalendarCheck} />
        </div>
      </section>

      {dashboardState.error && <StatusMessage type="error" message={dashboardState.error} />}
      {saveState.error && <StatusMessage type="error" message={saveState.error} />}
      {saveState.success && <StatusMessage type="success" message={saveState.success} />}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[#020B1F]">
                Business notification queue
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                System reminders are generated from leads, quotes, projects and support tickets.
              </p>
            </div>

            {dashboardState.loading && (
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-sm font-black text-[#061A33]">
                <Loader2 size={16} className="mr-2 animate-spin text-[#0B7CFF]" />
                Loading queue
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            {!dashboardState.loading && combinedQueue.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5">
                <p className="text-sm font-bold leading-6 text-slate-600">
                  No urgent notifications or reminders right now. MKETICS is up to date.
                </p>
              </div>
            )}

            {combinedQueue.map((item) => (
              <NotificationItem key={item.id} item={item} onGoToTab={onGoToTab} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 content-start">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <Plus size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">
              Add manual reminder
            </h3>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              Add follow-up tasks that are not automatically detected from records.
            </p>

            <form onSubmit={handleAddReminder} className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Reminder Title</span>
                <input
                  name="title"
                  value={reminderForm.title}
                  onChange={updateReminderForm}
                  placeholder="Example: Follow up with website client"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-[#061A33]">Due Date</span>
                  <input
                    name="dueDate"
                    type="date"
                    value={reminderForm.dueDate}
                    onChange={updateReminderForm}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#061A33]">Priority</span>
                  <select
                    name="priority"
                    value={reminderForm.priority}
                    onChange={updateReminderForm}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Area</span>
                <select
                  name="area"
                  value={reminderForm.area}
                  onChange={updateReminderForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option>General</option>
                  <option>Leads</option>
                  <option>Quotes</option>
                  <option>Projects</option>
                  <option>Support</option>
                  <option>Client Communication</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Details</span>
                <textarea
                  name="details"
                  value={reminderForm.details}
                  onChange={updateReminderForm}
                  rows={5}
                  placeholder="Add context, next step, or the person to contact."
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <button
                type="submit"
                disabled={saveState.loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveState.loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Saving Reminder
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Reminder
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-xl font-black text-[#020B1F]">
              Manual reminders
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Complete or reopen reminders as work moves forward.
            </p>

            <div className="mt-5 grid gap-3">
              {openReminders.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                  <p className="text-sm font-bold leading-6 text-slate-600">
                    No open manual reminders.
                  </p>
                </div>
              )}

              {openReminders.map((reminder) => (
                <ManualReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggle={() => handleToggleReminder(reminder)}
                  onDelete={() => handleDeleteReminder(reminder)}
                />
              ))}
            </div>

            {completedReminders.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                  Recently Completed
                </h4>

                <div className="mt-3 grid gap-2">
                  {completedReminders.map((reminder) => (
                    <ManualReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      compact
                      onToggle={() => handleToggleReminder(reminder)}
                      onDelete={() => handleDeleteReminder(reminder)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function buildSystemNotifications({ leads, quotes, projects, tickets }) {
  const items = [];
  const now = new Date();

  leads.forEach((lead) => {
    const ageDays = differenceInDays(now, lead.created_at);
    const updatedAge = differenceInDays(now, lead.updated_at || lead.created_at);

    if (lead.status === "new") {
      items.push({
        id: `lead-new-${lead.id}`,
        source: "Lead",
        title: `New lead needs first response: ${lead.full_name}`,
        description: `${lead.service_needed || "General enquiry"} • submitted ${formatFullDate(lead.created_at)}`,
        priority: ageDays >= 2 ? "urgent" : "high",
        dueDate: lead.created_at,
        tab: "leads",
        icon: ClipboardList,
      });
    }

    if (["reviewed", "contacted"].includes(lead.status) && updatedAge >= 3) {
      items.push({
        id: `lead-followup-${lead.id}`,
        source: "Lead Follow-up",
        title: `Follow up lead: ${lead.full_name}`,
        description: `${toReadableLabel(lead.status)} lead has not moved for ${updatedAge} day(s).`,
        priority: updatedAge >= 7 ? "high" : "medium",
        dueDate: lead.updated_at || lead.created_at,
        tab: "leads",
        icon: Clock,
      });
    }
  });

  quotes.forEach((quote) => {
    const updatedAge = differenceInDays(now, quote.updated_at || quote.created_at);
    const validUntil = quote.valid_until ? new Date(quote.valid_until) : null;
    const daysUntilExpiry = validUntil ? differenceInCalendarDays(validUntil, startOfDay(now)) : null;

    if (quote.status === "draft" && updatedAge >= 1) {
      items.push({
        id: `quote-draft-${quote.id}`,
        source: "Quote",
        title: `Draft quote waiting: ${quote.quote_number || quote.title}`,
        description: `${quote.title || "Quote"} • ${formatCurrency(quote.amount, quote.currency)} needs review or sending.`,
        priority: updatedAge >= 3 ? "high" : "medium",
        dueDate: quote.updated_at || quote.created_at,
        tab: "leads",
        icon: WalletCards,
      });
    }

    if (quote.status === "sent" && daysUntilExpiry !== null && daysUntilExpiry <= 3) {
      items.push({
        id: `quote-expiry-${quote.id}`,
        source: "Quote Expiry",
        title: `Quote follow-up: ${quote.quote_number || quote.title}`,
        description:
          daysUntilExpiry < 0
            ? `Quote expired ${Math.abs(daysUntilExpiry)} day(s) ago.`
            : `Quote expires in ${daysUntilExpiry} day(s).`,
        priority: daysUntilExpiry < 0 ? "urgent" : "high",
        dueDate: quote.valid_until,
        tab: "leads",
        icon: AlertCircle,
      });
    }

    if (quote.status === "accepted" && (!quote.client_id || !quote.project_id)) {
      items.push({
        id: `quote-convert-${quote.id}`,
        source: "Quote Conversion",
        title: `Accepted quote needs conversion: ${quote.quote_number || quote.title}`,
        description: "Create or link the client and project record from the accepted quote.",
        priority: "urgent",
        dueDate: quote.accepted_at || quote.updated_at || quote.created_at,
        tab: "leads",
        icon: CheckCircle2,
      });
    }
  });

  projects.forEach((project) => {
    if (["completed", "cancelled", "archived"].includes(project.status)) return;

    const dueDate = project.due_date ? new Date(project.due_date) : null;
    const daysUntilDue = dueDate ? differenceInCalendarDays(dueDate, startOfDay(now)) : null;

    if (project.status === "awaiting_client") {
      items.push({
        id: `project-awaiting-${project.id}`,
        source: "Project",
        title: `Awaiting client: ${project.title}`,
        description: "Project needs client feedback, content, approval or confirmation.",
        priority: "high",
        dueDate: project.updated_at || project.created_at,
        tab: "projects",
        icon: BriefcaseIcon,
      });
    }

    if (daysUntilDue !== null && daysUntilDue <= 7) {
      items.push({
        id: `project-due-${project.id}`,
        source: "Project Due Date",
        title: `Project deadline: ${project.title}`,
        description:
          daysUntilDue < 0
            ? `Project is overdue by ${Math.abs(daysUntilDue)} day(s).`
            : `Project is due in ${daysUntilDue} day(s).`,
        priority: daysUntilDue < 0 ? "urgent" : daysUntilDue <= 2 ? "high" : "medium",
        dueDate: project.due_date,
        tab: "projects",
        icon: CalendarCheck,
      });
    }
  });

  tickets.forEach((ticket) => {
    if (!openTicketStatuses.includes(ticket.status)) return;

    const updatedAge = differenceInDays(now, ticket.updated_at || ticket.created_at);

    if (ticket.priority === "urgent" || updatedAge >= 2 || ticket.status === "waiting_for_client") {
      items.push({
        id: `ticket-${ticket.id}`,
        source: "Support Ticket",
        title: ticket.subject,
        description: `${toReadableLabel(ticket.priority)} priority • ${toReadableLabel(ticket.status)} • updated ${updatedAge} day(s) ago.`,
        priority: ticket.priority === "urgent" ? "urgent" : updatedAge >= 4 ? "high" : "medium",
        dueDate: ticket.updated_at || ticket.created_at,
        tab: "projects",
        icon: Headphones,
      });
    }
  });

  return items.sort(sortNotificationItems);
}

function NotificationItem({ item, onGoToTab }) {
  const Icon = item.icon || Bell;
  const isOverdue = item.dueDate && startOfDay(new Date(item.dueDate)) < startOfDay(new Date());

  return (
    <article className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#0B7CFF] shadow-sm">
            <Icon size={19} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={item.priority} />
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                {item.source}
              </span>
              {isOverdue && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-red-700">
                  Overdue
                </span>
              )}
            </div>

            <h4 className="mt-3 text-base font-black text-[#020B1F]">{item.title}</h4>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {item.description}
            </p>
            {item.dueDate && (
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                Due / Trigger: {formatFullDate(item.dueDate)}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGoToTab?.(item.tab)}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          Open Area
        </button>
      </div>
    </article>
  );
}

function ManualReminderCard({ reminder, compact = false, onToggle, onDelete }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={reminder.priority} />
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              {reminder.area || "General"}
            </span>
            {reminder.status === "completed" && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                Completed
              </span>
            )}
          </div>

          <h4 className="mt-3 text-sm font-black text-[#020B1F]">{reminder.title}</h4>
          {!compact && reminder.details && (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {reminder.details}
            </p>
          )}
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
            Due: {formatDate(reminder.dueDate)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#0B7CFF]/25 bg-white text-[#0B7CFF] transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
            aria-label={reminder.status === "completed" ? "Reopen reminder" : "Complete reminder"}
          >
            <CheckCircle2 size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="grid h-9 w-9 place-items-center rounded-full border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
            aria-label="Delete reminder"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function NotificationStatCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-[1.35rem] border border-slate-200 bg-[#F8FCFF] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-[#020B1F]">{value}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#0B7CFF]">
          <Icon size={19} />
        </div>
      </div>
    </article>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-cyan-100 text-[#0B7CFF]",
    normal: "bg-slate-100 text-slate-600",
    low: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${
        styles[priority] || styles.medium
      }`}
    >
      {toReadableLabel(priority)}
    </span>
  );
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
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

function normaliseReminders(reminders) {
  if (!Array.isArray(reminders)) return [];

  return reminders
    .filter((reminder) => reminder && reminder.title)
    .map((reminder) => ({
      id: reminder.id || createId(),
      title: String(reminder.title || "Reminder").trim(),
      details: String(reminder.details || "").trim(),
      dueDate: reminder.dueDate || getTodayInputValue(),
      priority: priorityOrder[reminder.priority] ? reminder.priority : "medium",
      area: reminder.area || "General",
      status: manualReminderStatuses.includes(reminder.status) ? reminder.status : "open",
      createdAt: reminder.createdAt || new Date().toISOString(),
      completedAt: reminder.completedAt || null,
    }));
}

function sortNotificationItems(a, b) {
  const priorityDifference =
    (priorityOrder[a.priority] || priorityOrder.medium) -
    (priorityOrder[b.priority] || priorityOrder.medium);

  if (priorityDifference !== 0) return priorityDifference;

  return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
}

function sortReminderItems(a, b) {
  return sortNotificationItems(
    { priority: a.priority, dueDate: a.dueDate },
    { priority: b.priority, dueDate: b.dueDate }
  );
}

function buildActionPlan(items) {
  if (!items.length) {
    return "MKETICS action plan: No urgent notifications or reminders right now.";
  }

  return [
    "MKETICS Business Action Plan",
    `Generated: ${formatFullDate(new Date().toISOString())}`,
    "",
    ...items.slice(0, 20).map((item, index) => {
      return `${index + 1}. [${toReadableLabel(item.priority)}] ${item.title}\n   ${item.description}\n   Area: ${toReadableLabel(item.tab)} | Due: ${formatFullDate(item.dueDate)}`;
    }),
  ].join("\n");
}

function getTabForArea(area) {
  const value = String(area || "").toLowerCase();

  if (value.includes("lead") || value.includes("quote")) return "leads";
  if (value.includes("project") || value.includes("support") || value.includes("client")) {
    return "projects";
  }

  return "overview";
}

function differenceInDays(now, value) {
  if (!value) return 0;

  return Math.floor((startOfDay(now).getTime() - startOfDay(new Date(value)).getTime()) / 86400000);
}

function differenceInCalendarDays(target, start) {
  return Math.ceil((startOfDay(target).getTime() - startOfDay(start).getTime()) / 86400000);
}

function datesMatch(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatCurrency(amount, currency = "ZAR") {
  const numericAmount = Number.parseFloat(amount || 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(value) {
  if (!value) return "Not available";

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

function BriefcaseIcon(props) {
  return <ShieldCheck {...props} />;
}
