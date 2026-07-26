import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MessageCircle,
  Paperclip,
  RefreshCw,
  Save,
  Search,
  Send,
  TicketCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const statuses = ["open", "in_progress", "waiting_for_client", "resolved", "closed"];
const priorities = ["low", "normal", "high", "urgent"];

export default function SupportTicketsDashboard({ isActive, profile }) {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "all", priority: "all" });
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [reply, setReply] = useState({ message: "", internal: false, file: null });
  const [form, setForm] = useState({
    status: "open",
    priority: "normal",
    assignedTo: "",
    dueAt: "",
    resolutionNotes: "",
  });

  const selected = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) || null,
    [tickets, selectedId]
  );

  const filtered = useMemo(() => tickets.filter((ticket) => {
    const text = [ticket.ticket_number, ticket.subject, ticket.description, ticket.client?.full_name, ticket.client?.organisation].filter(Boolean).join(" ").toLowerCase();
    return (!filter.search || text.includes(filter.search.toLowerCase()))
      && (filter.status === "all" || ticket.status === filter.status)
      && (filter.priority === "all" || ticket.priority === filter.priority);
  }), [tickets, filter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    active: tickets.filter((t) => ["in_progress", "waiting_for_client"].includes(t.status)).length,
    urgent: tickets.filter((t) => t.priority === "urgent" && !["resolved", "closed"].includes(t.status)).length,
    overdue: tickets.filter((t) => t.due_at && new Date(t.due_at) < new Date() && !["resolved", "closed"].includes(t.status)).length,
  }), [tickets]);

  useEffect(() => { if (isActive) loadDashboard(); }, [isActive]);
  useEffect(() => {
    if (!selected) return;
    setForm({
      status: selected.status,
      priority: selected.priority,
      assignedTo: selected.assigned_to || "",
      dueAt: selected.due_at ? toLocalInput(selected.due_at) : "",
      resolutionNotes: selected.resolution_notes || "",
    });
    loadMessages(selected.id);
  }, [selected?.id]);

  async function loadDashboard() {
    setLoading(true);
    setNotice({ type: "", text: "" });
    const [ticketsResult, staffResult] = await Promise.all([
      supabase
        .from("support_tickets")
        .select("id, client_id, project_id, ticket_number, ticket_type, priority, subject, description, status, assigned_to, due_at, resolved_at, first_response_at, resolution_notes, closed_at, created_at, updated_at, client:clients(full_name,email,phone,organisation), project:projects(title), assigned_profile:profiles!support_tickets_assigned_to_fkey(full_name)")
        .order("updated_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, role").in("role", ["admin", "staff"]).order("full_name"),
    ]);
    setLoading(false);
    const error = ticketsResult.error || staffResult.error;
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    setTickets(ticketsResult.data || []);
    setStaff(staffResult.data || []);
    if (!selectedId && ticketsResult.data?.[0]?.id) setSelectedId(ticketsResult.data[0].id);
  }

  async function loadMessages(ticketId) {
    const { data, error } = await supabase
      .from("support_ticket_messages")
      .select("id, ticket_id, author_id, author_role, message, is_internal, attachment_path, attachment_name, created_at, author:profiles(full_name)")
      .eq("ticket_id", ticketId)
      .order("created_at");
    if (error) setNotice({ type: "error", text: error.message });
    else setMessages(data || []);
  }

  async function saveTicket(event) {
    event.preventDefault();
    if (!selected) return;
    try {
      setBusy(true);
      const closing = ["resolved", "closed"].includes(form.status);
      const { error } = await supabase.from("support_tickets").update({
        status: form.status,
        priority: form.priority,
        assigned_to: form.assignedTo || null,
        due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        resolution_notes: form.resolutionNotes.trim() || null,
        resolved_at: form.status === "resolved" ? selected.resolved_at || new Date().toISOString() : null,
        closed_at: closing ? selected.closed_at || new Date().toISOString() : null,
      }).eq("id", selected.id);
      if (error) throw error;
      setNotice({ type: "success", text: "Ticket workflow updated." });
      await loadDashboard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally { setBusy(false); }
  }

  async function uploadAttachment(file) {
    if (!file) return null;
    if (file.size > 10 * 1024 * 1024) throw new Error("Attachments must be 10 MB or smaller.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `staff/${profile.id}/tickets/${selected.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("mketics-support").upload(path, file);
    if (error) throw error;
    return { path, name: file.name, size: file.size };
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selected || (!reply.message.trim() && !reply.file)) return;
    try {
      setBusy(true);
      const attachment = await uploadAttachment(reply.file);
      const { error } = await supabase.from("support_ticket_messages").insert({
        ticket_id: selected.id,
        author_role: profile.role,
        message: reply.message.trim() || "Attachment uploaded.",
        is_internal: reply.internal,
        attachment_path: attachment?.path || null,
        attachment_name: attachment?.name || null,
        attachment_size: attachment?.size || null,
      });
      if (error) throw error;
      if (!reply.internal) {
        await supabase.from("support_tickets").update({
          status: selected.status === "open" ? "in_progress" : selected.status,
          first_response_at: selected.first_response_at || new Date().toISOString(),
        }).eq("id", selected.id);
      }
      setReply({ message: "", internal: false, file: null });
      await Promise.all([loadMessages(selected.id), loadDashboard()]);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally { setBusy(false); }
  }

  async function openAttachment(message) {
    const { data, error } = await supabase.storage.from("mketics-support").createSignedUrl(message.attachment_path, 120);
    if (error) setNotice({ type: "error", text: error.message });
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">MKETICS operations</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Support Ticket Centre</h2><p className="mt-2 text-sm font-semibold text-slate-600">Assign technicians, manage conversations and resolve client requests.</p></div>
          <button type="button" onClick={loadDashboard} disabled={loading} className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33]">{loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}Refresh</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Object.entries(stats).map(([key, value]) => <Stat key={key} label={key} value={value} />)}</div>
      </section>

      {notice.text && <Notice {...notice} />}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="relative"><Search className="absolute left-4 top-3.5 text-slate-400" size={17} /><input value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} placeholder="Search tickets or clients" className={`${inputClass} mt-0 pl-11`} /></label>
          <Select value={filter.status} onChange={(value) => setFilter({ ...filter, status: value })} options={[["all", "All statuses"], ...statuses.map((v) => [v, label(v)])]} />
          <Select value={filter.priority} onChange={(value) => setFilter({ ...filter, priority: value })} options={[["all", "All priorities"], ...priorities.map((v) => [v, label(v)])]} />
        </div>
        <div className="mt-5 grid gap-3">
          {filtered.map((ticket) => {
            const overdue = ticket.due_at && new Date(ticket.due_at) < new Date() && !["resolved", "closed"].includes(ticket.status);
            return <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={`rounded-2xl border p-4 text-left ${selectedId === ticket.id ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-[#F8FCFF]"}`}><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">{ticket.ticket_number || "Ticket"} • {label(ticket.ticket_type)}</p><h3 className="mt-1 font-black text-[#020B1F]">{ticket.subject}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{ticket.client?.organisation || ticket.client?.full_name || "Unlinked client"}{ticket.project?.title ? ` • ${ticket.project.title}` : ""}</p></div><div className="flex flex-wrap gap-2"><Badge value={ticket.priority} /><Badge value={ticket.status} />{overdue && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">Overdue</span>}</div></div></button>;
          })}
          {!loading && filtered.length === 0 && <p className="py-8 text-center text-sm font-bold text-slate-500">No tickets match the current filters.</p>}
        </div>
      </section>

      {selected && (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{selected.ticket_number}</p><h3 className="mt-2 text-xl font-black text-[#020B1F]">{selected.subject}</h3><p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">{selected.description}</p></div><TicketCheck className="shrink-0 text-[#0B7CFF]" /></div>
            <div className="mt-6 grid gap-3">
              {messages.map((message) => <article key={message.id} className={`rounded-2xl border p-4 ${message.is_internal ? "border-amber-200 bg-amber-50" : message.author_role === "client" ? "border-slate-200 bg-[#F8FCFF]" : "border-cyan-200 bg-cyan-50"}`}><p className="text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">{message.is_internal ? "Internal note" : message.author_role === "client" ? "Client" : "MKETICS Support"} • {message.author?.full_name || label(message.author_role)} • {new Date(message.created_at).toLocaleString("en-ZA")}</p><p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">{message.message}</p>{message.attachment_path && <button type="button" onClick={() => openAttachment(message)} className="mt-3 inline-flex items-center text-xs font-black text-[#0B7CFF] underline"><Download size={13} className="mr-2" />{message.attachment_name || "Open attachment"}</button>}</article>)}
            </div>
            <form onSubmit={sendReply} className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
              <textarea value={reply.message} onChange={(e) => setReply({ ...reply, message: e.target.value })} rows={4} className={inputClass} placeholder={reply.internal ? "Add a private staff note..." : "Reply to the client..."} />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-4"><label className="inline-flex cursor-pointer items-center text-xs font-black text-[#0B7CFF]"><Paperclip size={15} className="mr-2" />Attach file<input type="file" className="hidden" onChange={(e) => setReply({ ...reply, file: e.target.files?.[0] || null })} /></label><label className="inline-flex items-center text-xs font-black text-amber-800"><input type="checkbox" checked={reply.internal} onChange={(e) => setReply({ ...reply, internal: e.target.checked })} className="mr-2" />Internal note</label></div><button disabled={busy || (!reply.message.trim() && !reply.file)} className="inline-flex items-center justify-center rounded-full bg-[#061A33] px-5 py-2.5 text-xs font-black text-white disabled:opacity-50"><Send size={14} className="mr-2" />{reply.internal ? "Add Note" : "Send Reply"}</button></div>
            </form>
          </section>

          <form onSubmit={saveTicket} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-[#020B1F]">Ticket workflow</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Status"><Select value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={statuses.map((v) => [v, label(v)])} /></Field>
              <Field label="Priority"><Select value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={priorities.map((v) => [v, label(v)])} /></Field>
              <Field label="Assigned technician"><Select value={form.assignedTo} onChange={(value) => setForm({ ...form, assignedTo: value })} options={[["", "Unassigned queue"], ...staff.map((person) => [person.id, `${person.full_name || "Team member"} (${label(person.role)})`])]} /></Field>
              <Field label="Due date"><input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} className={inputClass} /></Field>
              <Field label="Resolution notes"><textarea value={form.resolutionNotes} onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })} rows={5} className={inputClass} placeholder="Record the final fix or outcome." /></Field>
            </div>
            <button disabled={busy} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{busy ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Save size={17} className="mr-2" />}Save Workflow</button>
            <div className="mt-5 grid gap-2 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold text-slate-600"><p><Clock size={14} className="mr-2 inline" />Created: {new Date(selected.created_at).toLocaleString("en-ZA")}</p><p>Client: {selected.client?.full_name || "Not linked"}</p><p>Contact: {selected.client?.email || selected.client?.phone || "Not provided"}</p><p>Assigned: {selected.assigned_profile?.full_name || "Support queue"}</p></div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100";
function Select({ value, onChange, options }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>; }
function Field({ label: text, children }) { return <label><span className="text-sm font-black text-[#061A33]">{text}</span>{children}</label>; }
function Stat({ label: text, value }) { return <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label(text)}</p><p className="mt-2 text-2xl font-black text-[#020B1F]">{value}</p></div>; }
function Badge({ value }) { return <span className="rounded-full border border-[#0B7CFF]/20 bg-white px-3 py-1 text-xs font-black text-[#061A33]">{label(value)}</span>; }
function Notice({ type, text }) { const error = type === "error"; return <div className={`flex items-start rounded-2xl border p-4 text-sm font-bold ${error ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>{error ? <AlertCircle size={17} className="mr-2 shrink-0" /> : <CheckCircle2 size={17} className="mr-2 shrink-0" />}{text}</div>; }
function label(value) { return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function toLocalInput(value) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16); }
