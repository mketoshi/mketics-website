import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Copy,
  Loader2,
  Megaphone,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const announcementsSettingKey = "client_portal_announcements_v1";

const defaultForm = {
  title: "",
  message: "",
  audienceType: "all",
  clientId: "",
  projectId: "",
  priority: "normal",
  status: "published",
  expiresAt: "",
};

const priorityOptions = ["low", "normal", "important", "urgent"];
const statusOptions = ["draft", "published", "archived"];
const audienceOptions = [
  { value: "all", label: "All portal clients" },
  { value: "client", label: "Specific client" },
  { value: "project", label: "Specific project" },
];

export default function ClientPortalAnnouncementsDashboard({ isActive }) {
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: "",
    announcements: [],
    clients: [],
    projects: [],
  });

  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (isActive) {
      fetchDashboardData();
    }
  }, [isActive]);

  const filteredAnnouncements = useMemo(() => {
    const text = searchTerm.trim().toLowerCase();

    return state.announcements.filter((announcement) => {
      const matchesStatus =
        statusFilter === "all" || announcement.status === statusFilter;

      const searchable = [
        announcement.title,
        announcement.message,
        announcement.priority,
        announcement.status,
        announcement.audienceType,
        getClientName(state.clients, announcement.clientId),
        getProjectTitle(state.projects, announcement.projectId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !text || searchable.includes(text);

      return matchesStatus && matchesSearch;
    });
  }, [state.announcements, state.clients, state.projects, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = state.announcements.length;
    const published = state.announcements.filter((item) => item.status === "published").length;
    const draft = state.announcements.filter((item) => item.status === "draft").length;
    const urgent = state.announcements.filter((item) => item.priority === "urgent").length;

    return { total, published, draft, urgent };
  }, [state.announcements]);

  async function fetchDashboardData() {
    if (!supabase) return;

    try {
      setState((current) => ({ ...current, loading: true, error: "", success: "" }));

      const [settingsResponse, clientsResponse, projectsResponse] = await Promise.all([
        supabase
          .from("settings")
          .select("setting_value")
          .eq("setting_key", announcementsSettingKey)
          .maybeSingle(),
        supabase
          .from("clients")
          .select("id, full_name, email, organisation, profile_id, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, client_id, title, status, created_at")
          .order("created_at", { ascending: false }),
      ]);

      const firstError =
        settingsResponse.error || clientsResponse.error || projectsResponse.error;

      if (firstError) throw firstError;

      setState({
        loading: false,
        error: "",
        success: "",
        announcements: normaliseAnnouncements(settingsResponse.data?.setting_value?.announcements),
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error:
          error?.message ||
          "Unable to load client announcements. Check Supabase settings permissions.",
      }));
    }
  }

  async function saveAnnouncements(nextAnnouncements, successMessage) {
    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: announcementsSettingKey,
        setting_value: { announcements: nextAnnouncements },
        description: "MKETICS client portal announcements and notifications.",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;

    setState((current) => ({
      ...current,
      announcements: nextAnnouncements,
      error: "",
      success: successMessage,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setState((current) => ({
        ...current,
        error: "Announcement title and message are required.",
        success: "",
      }));
      return;
    }

    if (form.audienceType === "client" && !form.clientId) {
      setState((current) => ({
        ...current,
        error: "Choose a client for a client-specific announcement.",
        success: "",
      }));
      return;
    }

    if (form.audienceType === "project" && !form.projectId) {
      setState((current) => ({
        ...current,
        error: "Choose a project for a project-specific announcement.",
        success: "",
      }));
      return;
    }

    try {
      setState((current) => ({ ...current, loading: true, error: "", success: "" }));

      const now = new Date().toISOString();
      const nextAnnouncement = {
        id: crypto.randomUUID?.() || `announcement-${Date.now()}`,
        title: form.title.trim(),
        message: form.message.trim(),
        audienceType: form.audienceType,
        clientId: form.audienceType === "client" ? form.clientId : "",
        projectId: form.audienceType === "project" ? form.projectId : "",
        priority: form.priority,
        status: form.status,
        expiresAt: form.expiresAt || "",
        createdAt: now,
        updatedAt: now,
      };

      const nextAnnouncements = [nextAnnouncement, ...state.announcements];
      await saveAnnouncements(nextAnnouncements, "Announcement published to the client portal.");

      setForm(defaultForm);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Unable to save announcement.",
        success: "",
      }));
    }
  }

  async function updateAnnouncementStatus(announcementId, status) {
    try {
      const nextAnnouncements = state.announcements.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, status, updatedAt: new Date().toISOString() }
          : announcement
      );

      await saveAnnouncements(nextAnnouncements, `Announcement marked as ${toReadableLabel(status)}.`);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error?.message || "Unable to update announcement status.",
        success: "",
      }));
    }
  }

  async function deleteAnnouncement(announcementId) {
    const confirmed = window.confirm("Delete this announcement from the client portal?");
    if (!confirmed) return;

    try {
      const nextAnnouncements = state.announcements.filter(
        (announcement) => announcement.id !== announcementId
      );

      await saveAnnouncements(nextAnnouncements, "Announcement deleted.");
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error?.message || "Unable to delete announcement.",
        success: "",
      }));
    }
  }

  async function copyAnnouncementSummary() {
    const summary = [
      "MKETICS Client Portal Announcements",
      `Total: ${stats.total}`,
      `Published: ${stats.published}`,
      `Draft: ${stats.draft}`,
      `Urgent: ${stats.urgent}`,
      "",
      ...filteredAnnouncements.slice(0, 10).map((announcement, index) =>
        `${index + 1}. ${announcement.title} — ${toReadableLabel(announcement.status)} / ${toReadableLabel(announcement.priority)}`
      ),
    ].join("\n");

    await navigator.clipboard?.writeText(summary);

    setState((current) => ({
      ...current,
      success: "Announcement summary copied.",
      error: "",
    }));
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "audienceType" ? { clientId: "", projectId: "" } : {}),
    }));

    if (state.error || state.success) {
      setState((current) => ({ ...current, error: "", success: "" }));
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
              Client Portal Communication
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#020B1F]">
              Notifications & announcements
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Publish client portal notices for all clients, one client, or a specific project.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyAnnouncementSummary}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Copy size={17} className="mr-2" />
              Copy Summary
            </button>

            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={state.loading}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
            >
              {state.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={17} className="mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {state.error && <StatusMessage type="error" message={state.error} />}
        {state.success && <StatusMessage type="success" message={state.success} />}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Urgent" value={stats.urgent} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Megaphone size={22} />
          </div>

          <h3 className="mt-4 text-xl font-black text-[#020B1F]">
            New announcement
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            This will appear inside the client portal notifications tab.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Title</span>
              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                placeholder="Example: Project update available"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={updateForm}
                rows={6}
                placeholder="Write the announcement or client update here."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Audience</span>
                <select
                  name="audienceType"
                  value={form.audienceType}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  {audienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Priority</span>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>{toReadableLabel(option)}</option>
                  ))}
                </select>
              </label>
            </div>

            {form.audienceType === "client" && (
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Client</span>
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="">Choose client</option>
                  {state.clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.full_name || client.email}</option>
                  ))}
                </select>
              </label>
            )}

            {form.audienceType === "project" && (
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Project</span>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="">Choose project</option>
                  {state.projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Status</span>
                <select
                  name="status"
                  value={form.status}
                  onChange={updateForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{toReadableLabel(option)}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Expires At</span>
                <input
                  name="expiresAt"
                  value={form.expiresAt}
                  onChange={updateForm}
                  type="date"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Publish Announcement
                </>
              )}
            </button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#020B1F]">Announcement records</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Manage the client-facing notification queue.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_210px]">
            <label className="relative block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search announcements..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{toReadableLabel(status)}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-3">
            {state.loading && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6 text-center">
                <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                <p className="mt-3 text-sm font-black text-slate-500">Loading announcements...</p>
              </div>
            )}

            {!state.loading && filteredAnnouncements.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6">
                <p className="text-sm font-bold leading-6 text-slate-600">
                  No announcements found.
                </p>
              </div>
            )}

            {!state.loading && filteredAnnouncements.map((announcement) => (
              <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-black text-[#020B1F]">{announcement.title}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">{announcement.message}</p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                      {toReadableLabel(announcement.status)} • {toReadableLabel(announcement.priority)} • {getAudienceLabel(announcement, state.clients, state.projects)}
                    </p>
                    {announcement.expiresAt && (
                      <p className="mt-1 text-xs font-bold text-slate-500">Expires {formatDate(announcement.expiresAt)}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateAnnouncementStatus(announcement.id, status)}
                        className="rounded-full border border-[#0B7CFF]/25 bg-white px-3 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                      >
                        {toReadableLabel(status)}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={13} className="mr-1 inline" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function normaliseAnnouncements(value) {
  const source = Array.isArray(value)
    ? value
    : Array.isArray(value?.announcements)
      ? value.announcements
      : [];

  return source
    .filter(Boolean)
    .map((item) => ({
      id: item.id || `announcement-${Date.now()}-${Math.random()}`,
      title: item.title || "Client Portal Announcement",
      message: item.message || "",
      audienceType: item.audienceType || item.audience_type || "all",
      clientId: item.clientId || item.client_id || "",
      projectId: item.projectId || item.project_id || "",
      priority: item.priority || "normal",
      status: item.status || "published",
      expiresAt: item.expiresAt || item.expires_at || "",
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      updatedAt: item.updatedAt || item.updated_at || item.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getAudienceLabel(announcement, clients, projects) {
  if (announcement.audienceType === "client") {
    return getClientName(clients, announcement.clientId) || "Specific client";
  }

  if (announcement.audienceType === "project") {
    return getProjectTitle(projects, announcement.projectId) || "Specific project";
  }

  return "All clients";
}

function getClientName(clients, clientId) {
  return clients.find((client) => client.id === clientId)?.full_name ||
    clients.find((client) => client.id === clientId)?.email ||
    "";
}

function getProjectTitle(projects, projectId) {
  return projects.find((project) => project.id === projectId)?.title || "";
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">{label}</p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
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

function formatDate(value) {
  if (!value) return "Not set";

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
