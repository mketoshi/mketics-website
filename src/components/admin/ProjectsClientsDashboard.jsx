import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const projectStatusOptions = [
  "new",
  "planning",
  "in_design",
  "in_development",
  "review",
  "awaiting_client",
  "completed",
  "support",
];

export default function ProjectsClientsDashboard({ isActive }) {
  const [activeView, setActiveView] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const [dashboardState, setDashboardState] = useState({
    loading: false,
    error: "",
    clients: [],
    projects: [],
  });

  const clientMap = useMemo(() => {
    return new Map(dashboardState.clients.map((client) => [client.id, client]));
  }, [dashboardState.clients]);

  const projectCountsByClient = useMemo(() => {
    return dashboardState.projects.reduce((counts, project) => {
      if (!project.client_id) return counts;

      counts[project.client_id] = (counts[project.client_id] || 0) + 1;
      return counts;
    }, {});
  }, [dashboardState.projects]);

  const selectedProject = useMemo(() => {
    return (
      dashboardState.projects.find((project) => project.id === selectedProjectId) ||
      null
    );
  }, [dashboardState.projects, selectedProjectId]);

  const selectedClient = useMemo(() => {
    return (
      dashboardState.clients.find((client) => client.id === selectedClientId) ||
      null
    );
  }, [dashboardState.clients, selectedClientId]);

  const selectedClientProjects = useMemo(() => {
    if (!selectedClient) return [];

    return dashboardState.projects.filter(
      (project) => project.client_id === selectedClient.id
    );
  }, [dashboardState.projects, selectedClient]);

  const filteredProjects = useMemo(() => {
    return dashboardState.projects.filter((project) => {
      const client = clientMap.get(project.client_id);
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      const searchableText = [
        project.title,
        project.description,
        project.service_type,
        project.status,
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

      return matchesStatus && matchesSearch;
    });
  }, [dashboardState.projects, clientMap, searchTerm, statusFilter]);

  const filteredClients = useMemo(() => {
    return dashboardState.clients.filter((client) => {
      const searchableText = [
        client.full_name,
        client.email,
        client.phone,
        client.organisation,
        client.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        !searchTerm.trim() ||
        searchableText.includes(searchTerm.trim().toLowerCase())
      );
    });
  }, [dashboardState.clients, searchTerm]);

  const stats = useMemo(() => {
    const totalProjects = dashboardState.projects.length;
    const activeProjects = dashboardState.projects.filter(
      (project) => !["completed", "support"].includes(project.status)
    ).length;
    const completedProjects = dashboardState.projects.filter(
      (project) => project.status === "completed"
    ).length;
    const supportProjects = dashboardState.projects.filter(
      (project) => project.status === "support"
    ).length;

    return {
      clients: dashboardState.clients.length,
      totalProjects,
      activeProjects,
      completedProjects,
      supportProjects,
    };
  }, [dashboardState.clients.length, dashboardState.projects]);

  useEffect(() => {
    if (isActive) {
      fetchDashboardRecords();
    }
  }, [isActive]);

  async function fetchDashboardRecords() {
    if (!supabase) return;

    try {
      setDashboardState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const [clientsResponse, projectsResponse] = await Promise.all([
        supabase
          .from("clients")
          .select(
            "id, profile_id, full_name, email, phone, organisation, notes, created_at, updated_at"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select(
            "id, client_id, lead_id, title, description, service_type, status, start_date, due_date, completed_at, created_at, updated_at"
          )
          .order("created_at", { ascending: false }),
      ]);

      if (clientsResponse.error) throw clientsResponse.error;
      if (projectsResponse.error) throw projectsResponse.error;

      setDashboardState({
        loading: false,
        error: "",
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
      });
    } catch (error) {
      setDashboardState({
        loading: false,
        error:
          error?.message ||
          "Unable to load clients and projects. Check Supabase permissions.",
        clients: [],
        projects: [],
      });
    }
  }

  function handleProjectView(project) {
    setSelectedProjectId(project.id);
    setSelectedClientId(null);
  }

  function handleClientView(client) {
    setSelectedClientId(client.id);
    setSelectedProjectId(null);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Clients" value={stats.clients} />
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Active" value={stats.activeProjects} />
        <StatCard label="Completed" value={stats.completedProjects} />
        <StatCard label="Support" value={stats.supportProjects} />
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#020B1F]">
              Projects & client records
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              View converted clients and active MKETICS projects created from accepted quotes.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardRecords}
            disabled={dashboardState.loading}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {dashboardState.loading ? (
              <Loader2 size={17} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={17} className="mr-2" />
            )}
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[auto_1fr_220px]">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-1">
            <button
              type="button"
              onClick={() => setActiveView("projects")}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                activeView === "projects"
                  ? "bg-[#061A33] text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Projects
            </button>

            <button
              type="button"
              onClick={() => setActiveView("clients")}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                activeView === "clients"
                  ? "bg-[#061A33] text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Clients
            </button>
          </div>

          <label className="relative block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search clients, projects, services, status..."
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            disabled={activeView !== "projects"}
            className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            <option value="all">All project statuses</option>
            {projectStatusOptions.map((status) => (
              <option key={status} value={status}>
                {toReadableLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {dashboardState.error && (
          <StatusMessage type="error" message={dashboardState.error} />
        )}

        {activeView === "projects" ? (
          <ProjectsTable
            loading={dashboardState.loading}
            projects={filteredProjects}
            clientMap={clientMap}
            onView={handleProjectView}
          />
        ) : (
          <ClientsTable
            loading={dashboardState.loading}
            clients={filteredClients}
            projectCountsByClient={projectCountsByClient}
            onView={handleClientView}
          />
        )}
      </div>

      {selectedProject && (
        <ProjectDetailPanel
          project={selectedProject}
          client={clientMap.get(selectedProject.client_id)}
          onClose={() => setSelectedProjectId(null)}
        />
      )}

      {selectedClient && (
        <ClientDetailPanel
          client={selectedClient}
          projects={selectedClientProjects}
          onClose={() => setSelectedClientId(null)}
          onOpenProject={handleProjectView}
        />
      )}
    </div>
  );
}

function ProjectsTable({ loading, projects, clientMap, onView }) {
  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full border-collapse bg-white text-left">
          <thead className="bg-[#F8FCFF]">
            <tr>
              <Th>Created</Th>
              <Th>Project</Th>
              <Th>Client</Th>
              <Th>Service</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center">
                  <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    Loading projects...
                  </p>
                </td>
              </tr>
            )}

            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center">
                  <BriefcaseBusiness className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    No projects found.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              projects.map((project) => {
                const client = clientMap.get(project.client_id);

                return (
                  <tr
                    key={project.id}
                    className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]"
                  >
                    <Td>
                      <p className="font-black text-[#061A33]">
                        {formatDate(project.created_at)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatTime(project.created_at)}
                      </p>
                    </Td>

                    <Td>
                      <p className="font-black text-[#020B1F]">{project.title}</p>
                      {project.description && (
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">
                          {project.description}
                        </p>
                      )}
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

                    <Td>{project.service_type || "Not provided"}</Td>
                    <Td>{formatDate(project.due_date)}</Td>
                    <Td>
                      <StatusBadge status={project.status} />
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => onView(project)}
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

function ClientsTable({ loading, clients, projectCountsByClient, onView }) {
  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-[950px] w-full border-collapse bg-white text-left">
          <thead className="bg-[#F8FCFF]">
            <tr>
              <Th>Created</Th>
              <Th>Client</Th>
              <Th>Contact</Th>
              <Th>Organisation</Th>
              <Th>Projects</Th>
              <Th>Action</Th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center">
                  <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    Loading clients...
                  </p>
                </td>
              </tr>
            )}

            {!loading && clients.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center">
                  <Building2 className="mx-auto text-slate-400" size={28} />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    No clients found.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]"
                >
                  <Td>
                    <p className="font-black text-[#061A33]">
                      {formatDate(client.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatTime(client.created_at)}
                    </p>
                  </Td>

                  <Td>
                    <p className="font-black text-[#020B1F]">{client.full_name}</p>
                    {client.notes && (
                      <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">
                        {client.notes}
                      </p>
                    )}
                  </Td>

                  <Td>
                    <div className="grid gap-1">
                      {client.email && (
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Mail size={13} />
                          {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Phone size={13} />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </Td>

                  <Td>{client.organisation || "Not provided"}</Td>
                  <Td>
                    <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
                      {projectCountsByClient[client.id] || 0}
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => onView(client)}
                      className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                    >
                      <Eye size={14} className="mr-2" />
                      View
                    </button>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectDetailPanel({ project, client, onClose }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <DetailHeader
        eyebrow="Project Detail"
        title={project.title}
        subtitle={`Created ${formatFullDate(project.created_at)}`}
        onClose={onClose}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <DetailCard title="Project Information" icon={BriefcaseBusiness}>
          <DetailLine label="Project Title" value={project.title} />
          <DetailLine label="Service Type" value={project.service_type} />
          <DetailLine label="Status" value={toReadableLabel(project.status)} />
          <DetailLine label="Start Date" value={formatDate(project.start_date)} />
          <DetailLine label="Due Date" value={formatDate(project.due_date)} />
          <DetailLine label="Completed At" value={formatFullDate(project.completed_at)} />

          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
              {project.description || "No project description saved."}
            </p>
          </div>
        </DetailCard>

        <DetailCard title="Linked Client" icon={UserRound}>
          {client ? (
            <>
              <DetailLine label="Client Name" value={client.full_name} />
              <DetailLine label="Organisation" value={client.organisation} />
              <DetailLine label="Email" value={client.email} />
              <DetailLine label="Phone" value={client.phone} />
              <DetailLine label="Client Notes" value={client.notes} />
            </>
          ) : (
            <p className="text-sm font-bold leading-6 text-slate-600">
              This project is not linked to a client record.
            </p>
          )}
        </DetailCard>
      </div>
    </section>
  );
}

function ClientDetailPanel({ client, projects, onClose, onOpenProject }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <DetailHeader
        eyebrow="Client Record"
        title={client.full_name}
        subtitle={`Created ${formatFullDate(client.created_at)}`}
        onClose={onClose}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <DetailCard title="Client Information" icon={Building2}>
          <DetailLine label="Full Name" value={client.full_name} />
          <DetailLine label="Organisation" value={client.organisation} />
          <DetailLine label="Email" value={client.email} />
          <DetailLine label="Phone" value={client.phone} />
          <DetailLine label="Notes" value={client.notes} />
        </DetailCard>

        <DetailCard title="Linked Projects" icon={CalendarDays}>
          {projects.length === 0 && (
            <p className="text-sm font-bold leading-6 text-slate-600">
              No projects are linked to this client yet.
            </p>
          )}

          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#020B1F]">
                    {project.title}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                    {toReadableLabel(project.status)} • {project.service_type || "Service not set"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenProject(project)}
                  className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                >
                  <Eye size={14} className="mr-2" />
                  View
                </button>
              </div>
            </article>
          ))}
        </DetailCard>
      </div>
    </section>
  );
}

function DetailHeader({ eyebrow, title, subtitle, onClose }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#020B1F]">{title}</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">{subtitle}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F8FCFF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
      >
        Close
      </button>
    </div>
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

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
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
