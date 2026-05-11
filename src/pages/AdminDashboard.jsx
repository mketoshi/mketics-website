import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
  TrendingUp,
  Clock3,
  Search,
  Trash2,
  Archive,
  Eye,
  RefreshCw,
  Wallet,
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
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const loadDashboardData = async () => {
    const [leadsRes, projectsRes, invoicesRes, quotesRes] =
      await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      ]);

    setLeads(leadsRes.data || []);
    setProjects(projectsRes.data || []);
    setInvoices(invoicesRes.data || []);
    setQuotes(quotesRes.data || []);
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

  const updateLeadStatus = async (id, status) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    await loadDashboardData();
  };

  const deleteLead = async (id) => {
    const confirmed = window.confirm("Delete this lead permanently?");

    if (!confirmed) return;

    await supabase.from("leads").delete().eq("id", id);
    await loadDashboardData();
  };

  const archiveLead = async (id) => {
    await updateLeadStatus(id, "Archived");
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

  const maxStatusCount = Math.max(...statusCounts.map((item) => item.count), 1);

  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "text-sky-500",
    },
    {
      title: "Projects",
      value: projects.length,
      icon: FolderKanban,
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
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-28">
        <div className="glass-card rounded-[2rem] p-8 md:p-12">
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
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">Client</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">Service</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">Budget</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">Date</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.2em] app-subtle">Actions</th>
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