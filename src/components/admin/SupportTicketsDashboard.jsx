import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  TicketCheck,
  UserRound,
} from "lucide-react";

const ticketStatusOptions = [
  "open",
  "in_progress",
  "waiting_for_client",
  "resolved",
  "closed",
];

const ticketPriorityOptions = ["low", "normal", "high", "urgent"];

export default function SupportTicketsDashboard({
  loading,
  tickets = [],
  projects = [],
  clients = [],
  searchTerm = "",
  onTicketUpdate,
  onOpenProject,
  onOpenClient,
  onRefresh,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);

  const clientMap = useMemo(() => {
    return new Map(clients.map((client) => [client.id, client]));
  }, [clients]);

  const selectedTicket = useMemo(() => {
    return tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const project = projectMap.get(ticket.project_id);
      const client = clientMap.get(ticket.client_id);

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;

      const searchableText = [
        ticket.subject,
        ticket.description,
        ticket.ticket_type,
        ticket.priority,
        ticket.status,
        ticket.resolution_notes,
        project?.title,
        project?.service_type,
        client?.full_name,
        client?.email,
        client?.phone,
        client?.organisation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        searchableText.includes(searchTerm.trim().toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, projectMap, clientMap, statusFilter, priorityFilter, searchTerm]);

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "open").length;
    const inProgress = tickets.filter(
      (ticket) => ticket.status === "in_progress"
    ).length;
    const waiting = tickets.filter(
      (ticket) => ticket.status === "waiting_for_client"
    ).length;
    const resolved = tickets.filter(
      (ticket) => ticket.status === "resolved"
    ).length;
    const urgent = tickets.filter((ticket) => ticket.priority === "urgent").length;

    return {
      total: tickets.length,
      open,
      inProgress,
      waiting,
      resolved,
      urgent,
    };
  }, [tickets]);

  function handleTicketView(ticket) {
    setSelectedTicketId(ticket.id);
  }

  return (
    <div className="mt-6 grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SmallStat label="Tickets" value={stats.total} />
        <SmallStat label="Open" value={stats.open} />
        <SmallStat label="Progress" value={stats.inProgress} />
        <SmallStat label="Waiting" value={stats.waiting} />
        <SmallStat label="Resolved" value={stats.resolved} />
        <SmallStat label="Urgent" value={stats.urgent} />
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black text-[#020B1F]">
              Support ticket workflow
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              Review support requests, update progress and close resolved tickets.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={17} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={17} className="mr-2" />
            )}
            Refresh Tickets
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-[#061A33]">
              Ticket Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All ticket statuses</option>
              {ticketStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {toReadableLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">
              Priority
            </span>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All priorities</option>
              {ticketPriorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {toReadableLabel(priority)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <TicketsTable
        loading={loading}
        tickets={filteredTickets}
        projectMap={projectMap}
        clientMap={clientMap}
        onView={handleTicketView}
      />

      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          project={projectMap.get(selectedTicket.project_id)}
          client={clientMap.get(selectedTicket.client_id)}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdate={onTicketUpdate}
          onOpenProject={onOpenProject}
          onOpenClient={onOpenClient}
        />
      )}
    </div>
  );
}

function TicketsTable({ loading, tickets, projectMap, clientMap, onView }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse bg-white text-left">
          <thead className="bg-[#F8FCFF]">
            <tr>
              <Th>Created</Th>
              <Th>Ticket</Th>
              <Th>Client</Th>
              <Th>Project</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Closed</Th>
              <Th>Action</Th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" className="px-5 py-10 text-center">
                  <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    Loading support tickets...
                  </p>
                </td>
              </tr>
            )}

            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan="8" className="px-5 py-10 text-center">
                  <Headphones className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    No support tickets found.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              tickets.map((ticket) => {
                const project = projectMap.get(ticket.project_id);
                const client = clientMap.get(ticket.client_id);

                return (
                  <tr
                    key={ticket.id}
                    className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]"
                  >
                    <Td>
                      <p className="font-black text-[#061A33]">
                        {formatDate(ticket.created_at)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatTime(ticket.created_at)}
                      </p>
                    </Td>

                    <Td>
                      <p className="font-black text-[#020B1F]">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                        {ticket.description}
                      </p>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                        {toReadableLabel(ticket.ticket_type)}
                      </p>
                    </Td>

                    <Td>
                      <p className="font-black text-[#061A33]">
                        {client?.full_name || "No client linked"}
                      </p>
                      {client?.organisation && (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {client.organisation}
                        </p>
                      )}
                    </Td>

                    <Td>{project?.title || "No project linked"}</Td>

                    <Td>
                      <PriorityBadge priority={ticket.priority} />
                    </Td>

                    <Td>
                      <StatusBadge status={ticket.status} />
                    </Td>

                    <Td>{ticket.closed_at ? formatDate(ticket.closed_at) : "Open"}</Td>

                    <Td>
                      <button
                        type="button"
                        onClick={() => onView(ticket)}
                        className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                      >
                        <Eye size={14} className="mr-2" />
                        View
                      </button>
                    </Td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TicketDetailPanel({
  ticket,
  project,
  client,
  onClose,
  onTicketUpdate,
  onOpenProject,
  onOpenClient,
}) {
  const [form, setForm] = useState(() => buildTicketStatusForm(ticket));
  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    setForm(buildTicketStatusForm(ticket));
    setSaveState({ loading: false, error: "", success: "" });
  }, [ticket?.id, ticket?.status, ticket?.priority, ticket?.resolution_notes]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!ticket?.id) return;

    if (!ticketStatusOptions.includes(form.status)) {
      setSaveState({
        loading: false,
        error: "Choose a valid ticket status.",
        success: "",
      });
      return;
    }

    if (!ticketPriorityOptions.includes(form.priority)) {
      setSaveState({
        loading: false,
        error: "Choose a valid ticket priority.",
        success: "",
      });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const shouldClose = ["resolved", "closed"].includes(form.status);
      const shouldReopen =
        !["resolved", "closed"].includes(form.status) && Boolean(ticket.closed_at);

      await onTicketUpdate(ticket.id, {
        status: form.status,
        priority: form.priority,
        resolution_notes: form.resolutionNotes.trim() || null,
        closed_at: shouldClose
          ? ticket.closed_at || new Date().toISOString()
          : shouldReopen
            ? null
            : ticket.closed_at,
      });

      setSaveState({
        loading: false,
        error: "",
        success: "Support ticket updated successfully.",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to update support ticket. Check Supabase support ticket permissions.",
        success: "",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            Ticket Detail
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#020B1F]">
            {ticket.subject}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Created {formatFullDate(ticket.created_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F8FCFF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-5 content-start">
          <DetailCard title="Ticket Information" icon={TicketCheck}>
            <DetailLine label="Ticket Type" value={toReadableLabel(ticket.ticket_type)} />
            <DetailLine label="Priority" value={toReadableLabel(ticket.priority)} />
            <DetailLine label="Status" value={toReadableLabel(ticket.status)} />
            <DetailLine label="Closed At" value={formatFullDate(ticket.closed_at)} />

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
                {ticket.description || "No ticket description saved."}
              </p>
            </div>

            {ticket.resolution_notes && (
              <div className="mt-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                  Resolution Notes
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
                  {ticket.resolution_notes}
                </p>
              </div>
            )}
          </DetailCard>

          <DetailCard title="Linked Records" icon={UserRound}>
            {client ? (
              <>
                <DetailLine label="Client" value={client.full_name} />
                <DetailLine label="Organisation" value={client.organisation} />
                <DetailLine label="Email" value={client.email} />
                <DetailLine label="Phone" value={client.phone} />

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <ActionLink
                    href={client.phone ? createClientWhatsAppLink(client, ticket) : "#"}
                    disabled={!client.phone}
                    label="WhatsApp"
                    icon={MessageCircle}
                    external
                  />
                  <ActionLink
                    href={client.email ? createClientEmailLink(client, project, ticket) : "#"}
                    disabled={!client.email}
                    label="Email"
                    icon={Mail}
                  />
                  <ActionLink
                    href={client.phone ? `tel:${sanitizePhoneForTel(client.phone)}` : "#"}
                    disabled={!client.phone}
                    label="Call"
                    icon={Phone}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onOpenClient(client)}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                >
                  <Eye size={14} className="mr-2" />
                  Open Client
                </button>
              </>
            ) : (
              <p className="text-sm font-bold leading-6 text-slate-600">
                This ticket is not linked to a client record.
              </p>
            )}

            {project && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                <DetailLine label="Project" value={project.title} />
                <DetailLine label="Project Status" value={toReadableLabel(project.status)} />

                <button
                  type="button"
                  onClick={() => onOpenProject(project)}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                >
                  <Eye size={14} className="mr-2" />
                  Open Project
                </button>
              </div>
            )}
          </DetailCard>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-cyan-200 bg-[#F8FCFF] p-5"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <ShieldCheck size={22} />
          </div>

          <h3 className="mt-4 text-xl font-black text-[#020B1F]">
            Manage ticket workflow
          </h3>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            Update ticket status, priority and resolution notes as the support request moves forward.
          </p>

          {saveState.error && (
            <StatusMessage type="error" message={saveState.error} />
          )}

          {saveState.success && (
            <StatusMessage type="success" message={saveState.success} />
          )}

          <label className="mt-5 block">
            <span className="text-sm font-black text-[#061A33]">
              Ticket Status
            </span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              {ticketStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {toReadableLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-[#061A33]">
              Priority
            </span>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            >
              {ticketPriorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {toReadableLabel(priority)}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-[#061A33]">
              Resolution / Progress Notes
            </span>
            <textarea
              name="resolutionNotes"
              value={form.resolutionNotes}
              onChange={handleChange}
              rows={8}
              placeholder="Example: Checked issue, contacted client, waiting for access details."
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <DetailLine label="Current Status" value={toReadableLabel(ticket.status)} />
            <DetailLine label="Last Updated" value={formatFullDate(ticket.updated_at)} />
            <DetailLine label="Closed At" value={formatFullDate(ticket.closed_at)} />
          </div>

          <button
            type="submit"
            disabled={saveState.loading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveState.loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Saving Ticket
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Ticket Update
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

function SmallStat({ label, value }) {
  return (
    <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#020B1F]">{value}</p>
    </article>
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

function DetailLine({ label, value }) {
  if (!value || value === "Unknown" || value === "Not available") return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ActionLink({ href, disabled, label, icon: Icon, external = false }) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-400"
      >
        <Icon size={16} className="mr-2" />
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
    >
      <Icon size={16} className="mr-2" />
      {label}
    </a>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
      {toReadableLabel(priority)}
    </span>
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
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}
      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700">
      {children}
    </td>
  );
}

function buildTicketStatusForm(ticket) {
  return {
    status: ticket?.status || "open",
    priority: ticket?.priority || "normal",
    resolutionNotes: ticket?.resolution_notes || "",
  };
}

function createClientWhatsAppLink(client, ticket) {
  const number = normalisePhoneForWhatsApp(client?.phone);

  if (!number) return "#";

  const message = [
    `Hello ${client?.full_name || ""},`,
    "",
    "This is a support follow-up from MKETICS.",
    ticket?.subject ? `Ticket: ${ticket.subject}` : "",
    "",
    "Kindly let us know when you are available so we can continue with the support request.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function createClientEmailLink(client, project, ticket) {
  const subject = `MKETICS Support Update${ticket?.subject ? ` - ${ticket.subject}` : ""}`;

  const body = [
    `Hello ${client?.full_name || ""},`,
    "",
    "This is a support follow-up from MKETICS.",
    project?.title ? `Project: ${project.title}` : "",
    ticket?.subject ? `Ticket: ${ticket.subject}` : "",
    "",
    "Kindly let us know when you are available so we can continue with the support request.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return `mailto:${client.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function normalisePhoneForWhatsApp(phone) {
  if (!phone) return "";

  const digits = String(phone).replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("27")) return digits;

  if (digits.startsWith("0")) {
    return `27${digits.slice(1)}`;
  }

  return digits;
}

function sanitizePhoneForTel(phone) {
  if (!phone) return "";

  return String(phone).replace(/\s/g, "");
}

function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
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
