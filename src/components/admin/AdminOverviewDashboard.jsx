import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Headphones,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const recentLimit = 80;

export default function AdminOverviewDashboard({ isActive, onGoToTab }) {
  const [overviewState, setOverviewState] = useState({
    loading: false,
    error: "",
    leads: [],
    quotes: [],
    clients: [],
    projects: [],
    tickets: [],
    leadNotes: [],
  });

  useEffect(() => {
    if (isActive) {
      fetchOverviewData();
    }
  }, [isActive]);

  const stats = useMemo(() => {
    const openLeadStatuses = ["new", "reviewed", "contacted"];
    const activeProjectStatuses = [
      "new",
      "planning",
      "in_design",
      "in_development",
      "review",
      "awaiting_client",
    ];
    const openTicketStatuses = ["open", "in_progress", "waiting_for_client"];
    const activeQuoteStatuses = ["draft", "sent"];

    const openLeads = overviewState.leads.filter((lead) =>
      openLeadStatuses.includes(lead.status)
    );
    const wonLeads = overviewState.leads.filter((lead) => lead.status === "won");
    const activeProjects = overviewState.projects.filter((project) =>
      activeProjectStatuses.includes(project.status)
    );
    const awaitingClientProjects = overviewState.projects.filter(
      (project) => project.status === "awaiting_client"
    );
    const openTickets = overviewState.tickets.filter((ticket) =>
      openTicketStatuses.includes(ticket.status)
    );
    const urgentTickets = overviewState.tickets.filter(
      (ticket) => ticket.priority === "urgent" && ticket.status !== "closed"
    );
    const waitingTickets = overviewState.tickets.filter(
      (ticket) => ticket.status === "waiting_for_client"
    );
    const activeQuotes = overviewState.quotes.filter((quote) =>
      activeQuoteStatuses.includes(quote.status)
    );
    const acceptedQuotes = overviewState.quotes.filter(
      (quote) => quote.status === "accepted"
    );

    const pipelineValue = sumQuoteAmounts(activeQuotes);
    const acceptedValue = sumQuoteAmounts(acceptedQuotes);

    return {
      totalLeads: overviewState.leads.length,
      openLeads: openLeads.length,
      wonLeads: wonLeads.length,
      clients: overviewState.clients.length,
      activeProjects: activeProjects.length,
      awaitingClient:
        awaitingClientProjects.length + waitingTickets.length,
      openTickets: openTickets.length,
      urgentTickets: urgentTickets.length,
      activeQuotes: activeQuotes.length,
      acceptedQuotes: acceptedQuotes.length,
      pipelineValue,
      acceptedValue,
    };
  }, [overviewState]);

  const timeline = useMemo(() => {
    return buildActivityTimeline(overviewState).slice(0, 30);
  }, [overviewState]);

  const priorityActions = useMemo(() => {
    return [
      {
        title: "New leads to review",
        value: overviewState.leads.filter((lead) => lead.status === "new").length,
        description: "Fresh enquiries that need first response.",
        tab: "leads",
        icon: ClipboardList,
      },
      {
        title: "Quotes waiting",
        value: overviewState.quotes.filter((quote) => quote.status === "draft").length,
        description: "Draft quotes that may need sending or revision.",
        tab: "leads",
        icon: WalletCards,
      },
      {
        title: "Awaiting client",
        value: stats.awaitingClient,
        description: "Projects or tickets waiting for client feedback.",
        tab: "projects",
        icon: Clock,
      },
      {
        title: "Urgent tickets",
        value: stats.urgentTickets,
        description: "High-priority support items to resolve first.",
        tab: "projects",
        icon: Headphones,
      },
    ];
  }, [overviewState, stats.awaitingClient, stats.urgentTickets]);

  async function fetchOverviewData() {
    if (!supabase) return;

    try {
      setOverviewState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const [
        leadsResponse,
        quotesResponse,
        clientsResponse,
        projectsResponse,
        ticketsResponse,
        notesResponse,
      ] = await Promise.all([
        supabase
          .from("leads")
          .select(
            "id, full_name, email, phone, organisation, service_needed, status, budget, timeline, created_at, updated_at"
          )
          .order("created_at", { ascending: false })
          .limit(recentLimit),
        supabase
          .from("quotes")
          .select(
            "id, lead_id, client_id, project_id, quote_number, title, amount, currency, status, valid_until, sent_at, accepted_at, rejected_at, created_at, updated_at"
          )
          .order("created_at", { ascending: false })
          .limit(recentLimit),
        supabase
          .from("clients")
          .select("id, full_name, email, phone, organisation, created_at, updated_at")
          .order("created_at", { ascending: false })
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
          .from("lead_notes")
          .select("id, lead_id, note, created_at")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      const firstError = [
        leadsResponse.error,
        quotesResponse.error,
        clientsResponse.error,
        projectsResponse.error,
        ticketsResponse.error,
        notesResponse.error,
      ].find(Boolean);

      if (firstError) throw firstError;

      setOverviewState({
        loading: false,
        error: "",
        leads: leadsResponse.data || [],
        quotes: quotesResponse.data || [],
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
        tickets: ticketsResponse.data || [],
        leadNotes: notesResponse.data || [],
      });
    } catch (error) {
      setOverviewState({
        loading: false,
        error:
          error?.message ||
          "Unable to load the admin overview. Check Supabase permissions.",
        leads: [],
        quotes: [],
        clients: [],
        projects: [],
        tickets: [],
        leadNotes: [],
      });
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
                <Activity size={16} />
                Admin Overview
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Business activity snapshot.
              </h2>

              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-300">
                Monitor leads, quotes, clients, projects and support activity from one MKETICS control view.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOverviewData}
              disabled={overviewState.loading}
              className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33] disabled:opacity-70"
            >
              {overviewState.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={17} className="mr-2" />
              )}
              Refresh Overview
            </button>
          </div>
        </div>

        {overviewState.error && (
          <div className="p-5">
            <StatusMessage type="error" message={overviewState.error} />
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="Lead Pipeline"
          value={stats.openLeads}
          helper={`${stats.totalLeads} total leads • ${stats.wonLeads} won`}
          icon={ClipboardList}
        />
        <OverviewStatCard
          label="Quote Pipeline"
          value={formatCurrency(stats.pipelineValue)}
          helper={`${stats.activeQuotes} draft/sent quotes • ${formatCurrency(stats.acceptedValue)} accepted`}
          icon={WalletCards}
        />
        <OverviewStatCard
          label="Active Projects"
          value={stats.activeProjects}
          helper={`${stats.clients} client records • ${stats.awaitingClient} waiting items`}
          icon={BriefcaseBusiness}
        />
        <OverviewStatCard
          label="Support Load"
          value={stats.openTickets}
          helper={`${stats.urgentTickets} urgent support tickets`}
          icon={Headphones}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#020B1F]">
                Priority actions
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Use this section to decide what needs attention first.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {priorityActions.map((action) => (
              <PriorityActionCard
                key={action.title}
                action={action}
                onGoToTab={onGoToTab}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <BarChart3 size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#020B1F]">
                  Operating summary
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Current MKETICS pipeline indicators across the admin system.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SummaryLine label="Clients converted" value={stats.clients} />
            <SummaryLine label="Quotes accepted" value={stats.acceptedQuotes} />
            <SummaryLine label="Waiting for client" value={stats.awaitingClient} />
            <SummaryLine label="Urgent tickets" value={stats.urgentTickets} />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#020B1F]">
                Business activity timeline
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Recent leads, quotes, projects, tickets and follow-up notes.
              </p>
            </div>
          </div>

          {overviewState.loading && (
            <div className="inline-flex items-center rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-sm font-black text-[#061A33]">
              <Loader2 size={16} className="mr-2 animate-spin text-[#0B7CFF]" />
              Loading activity
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3">
          {!overviewState.loading && timeline.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5">
              <p className="text-sm font-bold leading-6 text-slate-600">
                No activity is available yet. New leads, quotes, projects and tickets will appear here.
              </p>
            </div>
          )}

          {timeline.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function buildActivityTimeline({ leads, quotes, clients, projects, tickets, leadNotes }) {
  const items = [];

  leads.forEach((lead) => {
    items.push({
      id: `lead-created-${lead.id}`,
      type: "Lead",
      title: `New lead: ${lead.full_name}`,
      description: `${lead.service_needed || "General enquiry"} • ${toReadableLabel(lead.status)}`,
      time: lead.created_at,
      icon: ClipboardList,
    });

    if (lead.updated_at && lead.updated_at !== lead.created_at) {
      items.push({
        id: `lead-updated-${lead.id}`,
        type: "Lead Update",
        title: `Lead updated: ${lead.full_name}`,
        description: `Status is now ${toReadableLabel(lead.status)}`,
        time: lead.updated_at,
        icon: RefreshCw,
      });
    }
  });

  quotes.forEach((quote) => {
    items.push({
      id: `quote-created-${quote.id}`,
      type: "Quote",
      title: quote.quote_number || quote.title || "Quote created",
      description: `${quote.title || "Quote"} • ${formatCurrency(quote.amount, quote.currency)} • ${toReadableLabel(quote.status)}`,
      time: quote.created_at,
      icon: WalletCards,
    });

    if (quote.sent_at) {
      items.push({
        id: `quote-sent-${quote.id}`,
        type: "Quote Sent",
        title: quote.quote_number || "Quote sent",
        description: "Quote was marked as sent to the client.",
        time: quote.sent_at,
        icon: FileText,
      });
    }

    if (quote.accepted_at) {
      items.push({
        id: `quote-accepted-${quote.id}`,
        type: "Quote Accepted",
        title: quote.quote_number || "Quote accepted",
        description: `${formatCurrency(quote.amount, quote.currency)} accepted value`,
        time: quote.accepted_at,
        icon: CheckCircle2,
      });
    }

    if (quote.rejected_at) {
      items.push({
        id: `quote-rejected-${quote.id}`,
        type: "Quote Rejected",
        title: quote.quote_number || "Quote rejected",
        description: "Quote was marked as rejected.",
        time: quote.rejected_at,
        icon: AlertCircle,
      });
    }
  });

  clients.forEach((client) => {
    items.push({
      id: `client-created-${client.id}`,
      type: "Client",
      title: `Client record: ${client.full_name}`,
      description: client.organisation || client.email || "Client added to MKETICS records",
      time: client.created_at,
      icon: UserRound,
    });
  });

  projects.forEach((project) => {
    items.push({
      id: `project-updated-${project.id}`,
      type: "Project",
      title: project.title,
      description: `${project.service_type || "Project"} • ${toReadableLabel(project.status)}`,
      time: project.updated_at || project.created_at,
      icon: BriefcaseBusiness,
    });

    if (project.completed_at) {
      items.push({
        id: `project-completed-${project.id}`,
        type: "Project Completed",
        title: project.title,
        description: "Project was marked as completed.",
        time: project.completed_at,
        icon: CheckCircle2,
      });
    }
  });

  tickets.forEach((ticket) => {
    items.push({
      id: `ticket-updated-${ticket.id}`,
      type: "Support Ticket",
      title: ticket.subject,
      description: `${toReadableLabel(ticket.priority)} priority • ${toReadableLabel(ticket.status)}`,
      time: ticket.updated_at || ticket.created_at,
      icon: Headphones,
    });

    if (ticket.closed_at) {
      items.push({
        id: `ticket-closed-${ticket.id}`,
        type: "Ticket Closed",
        title: ticket.subject,
        description: "Support ticket was closed or resolved.",
        time: ticket.closed_at,
        icon: CheckCircle2,
      });
    }
  });

  leadNotes.forEach((note) => {
    items.push({
      id: `lead-note-${note.id}`,
      type: "Follow-up Note",
      title: "Lead note added",
      description: truncateText(note.note, 120),
      time: note.created_at,
      icon: FileText,
    });
  });

  return items
    .filter((item) => Boolean(item.time))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function OverviewStatCard({ label, value, helper, icon: Icon }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {helper}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EAF6FF] text-[#0B7CFF]">
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
}

function PriorityActionCard({ action, onGoToTab }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={() => onGoToTab?.(action.tab)}
      className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#0B7CFF]">
          <Icon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#020B1F]">{action.title}</p>
            <span className="rounded-full bg-[#061A33] px-3 py-1 text-xs font-black text-white">
              {action.value}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
            {action.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#020B1F]">{value}</p>
    </div>
  );
}

function TimelineItem({ item }) {
  const Icon = item.icon || Activity;

  return (
    <article className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#0B7CFF] shadow-sm">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black text-[#020B1F]">{item.title}</p>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
              {item.type}
            </p>
          </div>

          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {item.description}
          </p>

          <p className="mt-2 text-xs font-bold text-slate-500">
            {formatFullDate(item.time)}
          </p>
        </div>
      </div>
    </article>
  );
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-0 flex items-start gap-3 rounded-2xl border p-4 ${
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

function sumQuoteAmounts(quotes) {
  return quotes.reduce((total, quote) => {
    const amount = Number.parseFloat(quote.amount || 0);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

function formatCurrency(amount, currency = "ZAR") {
  const numericAmount = Number.parseFloat(amount || 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
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

function truncateText(value, limit) {
  if (!value) return "No details provided.";

  const text = String(value).trim();

  if (text.length <= limit) return text;

  return `${text.slice(0, limit).trim()}...`;
}
