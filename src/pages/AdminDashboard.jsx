import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Search,
  RefreshCw,
  PhoneCall,
  Mail,
  MessageCircle,
  Users,
  CheckCircle2,
  Clock3,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const logout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/admin";
};

const STATUS_OPTIONS = ["New", "Contacted", "Quoted", "Closed", "Lost"];

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Could not load leads. Check Supabase RLS SELECT policy.");
    } else {
      setLeads(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id, status) => {
    const previous = leads;

    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );

    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error) {
      console.error(error);
      setLeads(previous);
      alert("Status update failed. Check Supabase RLS UPDATE policy.");
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const text = `${lead.name || ""} ${lead.phone || ""} ${lead.email || ""} ${lead.service || ""} ${lead.message || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "New" || !lead.status).length;
    const closed = leads.filter((lead) => lead.status === "Closed").length;
    const revenue = leads
      .filter((lead) => lead.status === "Closed")
      .reduce((sum, lead) => sum + Number(lead.estimated_price || 0), 0);

    return { total, newLeads, closed, revenue };
  }, [leads]);

const analytics = useMemo(() => {
  const daily = {};

  leads.forEach((lead) => {
    const date = new Date(lead.created_at).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
    });

    daily[date] = (daily[date] || 0) + 1;
  });

  const dailyLeads = Object.entries(daily).map(([date, count]) => ({
    date,
    leads: count,
  }));

  const statusCounts = STATUS_OPTIONS.map((status) => ({
    name: status,
    value: leads.filter((lead) => lead.status === status).length,
  })).filter((item) => item.value > 0);

  const conversionRate =
    leads.length > 0
      ? Math.round((leads.filter((lead) => lead.status === "Closed").length / leads.length) * 100)
      : 0;

  return { dailyLeads, statusCounts, conversionRate };
}, [leads]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const whatsappLink = (lead) => {
    const phone = (lead.phone || "").replace(/\D/g, "");
    const cleanPhone = phone.startsWith("0") ? `27${phone.slice(1)}` : phone;
    const text = encodeURIComponent(
      `Hi ${lead.name || "there"}, this is MKETICS. Thank you for requesting a quote for ${lead.service || "our services"}.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <main className="min-h-[100svh] bg-slate-950 text-slate-50">
      <section className="border-b border-white/10 bg-slate-950/90 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 to-sky-300 shadow-lg shadow-sky-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">MKETICS Dashboard</h1>
              <p className="text-sm text-slate-400">Lead management and quote tracking</p>
            </div>
          </div>

<div className="flex gap-3">
  <button
    onClick={fetchLeads}
    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
  >
    Refresh
  </button>

  <button
    onClick={logout}
    className="rounded-full border border-white/10 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200 hover:bg-red-500/20"
  >
    Logout
  </button>
</div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Total Leads" value={stats.total} />
          <StatCard icon={Clock3} label="New Leads" value={stats.newLeads} />
          <StatCard icon={CheckCircle2} label="Closed Leads" value={stats.closed} />
          <StatCard icon={TrendingUp} label="Closed Value" value={`R${stats.revenue.toLocaleString()}`} />
        </div>

<div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
  {/* Line Chart */}
  <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
    <h2 className="text-xl font-black">Daily Leads</h2>

    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={analytics.dailyLeads}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="leads"
            stroke="#38bdf8"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Pie Chart */}
  <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
    <h2 className="text-xl font-black">
      Pipeline ({analytics.conversionRate}%)
    </h2>

    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
<Pie
  data={analytics.statusCounts}
  dataKey="value"
  nameKey="name"
  outerRadius={90}
  label
>
  {analytics.statusCounts.map((entry, index) => (
    <Cell
      key={entry.name}
      fill={
        {
          New: "#38bdf8",
          Contacted: "#a78bfa",
          Quoted: "#facc15",
          Closed: "#22c55e",
          Lost: "#ef4444",
        }[entry.name]
      }
    />
  ))}
</Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Lead Requests</h2>
              <p className="mt-1 text-sm text-slate-400">Track quote requests from your website.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full rounded-full border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-sm outline-none ring-sky-400/20 focus:ring-4 sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none ring-sky-400/20 focus:ring-4"
              >
                <option>All</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Service</th>
                  <th className="px-4 py-2">Budget</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="rounded-2xl bg-white/[0.035] p-8 text-center text-slate-400">
                      Loading leads...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="rounded-2xl bg-white/[0.035] p-8 text-center text-slate-400">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="rounded-3xl bg-white/[0.035]">
                      <td className="rounded-l-3xl px-4 py-4">
                        <div className="font-bold text-white">{lead.name || "Unknown"}</div>
                        <div className="mt-1 text-xs text-slate-400">{lead.phone || "No phone"}</div>
                        <div className="text-xs text-slate-500">{lead.email || "No email"}</div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-200">{lead.service || "-"}</div>
                        <div className="mt-1 text-xs text-slate-400">{lead.size || "-"}</div>
                        {lead.message && (
                          <div className="mt-2 max-w-xs truncate text-xs text-slate-500">{lead.message}</div>
                        )}
                      </td>

                      <td className="px-4 py-4 font-black text-sky-300">
                        R{Number(lead.estimated_price || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={lead.status || "New"}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold outline-none"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-400">{formatDate(lead.created_at)}</td>

                      <td className="rounded-r-3xl px-4 py-4">
                        <div className="flex items-center gap-2">
                          {lead.phone && (
                            <a href={whatsappLink(lead)} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-green-500/15 text-green-300 hover:bg-green-500/25">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-sky-500/15 text-sky-300 hover:bg-sky-500/25">
                              <PhoneCall className="h-4 w-4" />
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-slate-200 hover:bg-white/15">
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

