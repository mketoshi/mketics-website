import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Paperclip,
  RefreshCw,
  Send,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const priorities = ["low", "normal", "high", "urgent"];
const categories = [
  ["technical", "Technical support"],
  ["website", "Website / system"],
  ["billing", "Billing / payment"],
  ["documents", "Documents"],
  ["account", "Portal account"],
  ["general", "General support"],
];

export default function ClientSupportTicketCentre({ clients = [], projects = [] }) {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [reply, setReply] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const [form, setForm] = useState({
    clientId: clients[0]?.id || "",
    projectId: "",
    category: "technical",
    priority: "normal",
    subject: "",
    description: "",
    file: null,
  });

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) || null,
    [tickets, selectedId]
  );

  useEffect(() => {
    if (!form.clientId && clients[0]?.id) {
      setForm((current) => ({ ...current, clientId: clients[0].id }));
    }
  }, [clients, form.clientId]);

  useEffect(() => {
    loadTickets();
  }, [clients.map((client) => client.id).join(",")]);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);

  async function loadTickets() {
    const clientIds = clients.map((client) => client.id).filter(Boolean);
    if (!supabase || clientIds.length === 0) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, client_id, project_id, ticket_number, ticket_type, priority, subject, description, status, assigned_to, due_at, resolution_notes, closed_at, created_at, updated_at, assigned_profile:profiles!support_tickets_assigned_to_fkey(full_name)")
      .in("client_id", clientIds)
      .order("updated_at", { ascending: false });

    setLoading(false);
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }

    setTickets(data || []);
    if (!selectedId && data?.[0]?.id) setSelectedId(data[0].id);
  }

  async function loadMessages(ticketId) {
    const { data, error } = await supabase
      .from("support_ticket_messages")
      .select("id, ticket_id, author_id, author_role, message, attachment_path, attachment_name, attachment_size, created_at")
      .eq("ticket_id", ticketId)
      .eq("is_internal", false)
      .order("created_at", { ascending: true });

    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    setMessages(data || []);
  }

  async function uploadAttachment(ticketId, file) {
    if (!file) return null;
    if (file.size > 10 * 1024 * 1024) throw new Error("Attachments must be 10 MB or smaller.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `clients/${form.clientId || selectedTicket?.client_id}/tickets/${ticketId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("mketics-support").upload(path, file);
    if (error) throw error;
    return { path, name: file.name, size: file.size };
  }

  async function createTicket(event) {
    event.preventDefault();
    if (!form.clientId || !form.subject.trim() || !form.description.trim()) {
      setNotice({ type: "error", text: "Choose a client record and enter a subject and description." });
      return;
    }

    try {
      setBusy(true);
      setNotice({ type: "", text: "" });
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .insert({
          client_id: form.clientId,
          project_id: form.projectId || null,
          ticket_type: form.category,
          priority: form.priority,
          subject: form.subject.trim(),
          description: form.description.trim(),
        })
        .select("id")
        .single();
      if (error) throw error;

      const attachment = await uploadAttachment(ticket.id, form.file);
      const { error: messageError } = await supabase.from("support_ticket_messages").insert({
        ticket_id: ticket.id,
        author_role: "client",
        message: form.description.trim(),
        attachment_path: attachment?.path || null,
        attachment_name: attachment?.name || null,
        attachment_size: attachment?.size || null,
      });
      if (messageError) throw messageError;

      setForm((current) => ({
        ...current,
        projectId: "",
        category: "technical",
        priority: "normal",
        subject: "",
        description: "",
        file: null,
      }));
      await loadTickets();
      setSelectedId(ticket.id);
      setNotice({ type: "success", text: "Your support ticket was created successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to create the support ticket." });
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selectedTicket || (!reply.trim() && !replyFile)) return;
    try {
      setBusy(true);
      const attachment = await uploadAttachment(selectedTicket.id, replyFile);
      const { error } = await supabase.from("support_ticket_messages").insert({
        ticket_id: selectedTicket.id,
        author_role: "client",
        message: reply.trim() || "Attachment uploaded.",
        attachment_path: attachment?.path || null,
        attachment_name: attachment?.name || null,
        attachment_size: attachment?.size || null,
      });
      if (error) throw error;

      if (selectedTicket.status === "waiting_for_client") {
        await supabase
          .from("support_tickets")
          .update({ status: "in_progress" })
          .eq("id", selectedTicket.id);
      }
      setReply("");
      setReplyFile(null);
      await Promise.all([loadMessages(selectedTicket.id), loadTickets()]);
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Unable to send your reply." });
    } finally {
      setBusy(false);
    }
  }

  async function reopenTicket() {
    if (!selectedTicket) return;
    setBusy(true);
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: "open", closed_at: null, resolved_at: null })
      .eq("id", selectedTicket.id)
      .eq("status", "resolved");
    setBusy(false);
    if (error) setNotice({ type: "error", text: error.message });
    else {
      setNotice({ type: "success", text: "Ticket reopened. Add a reply with the remaining issue." });
      await loadTickets();
    }
  }

  async function openAttachment(message) {
    const { data, error } = await supabase.storage
      .from("mketics-support")
      .createSignedUrl(message.attachment_path, 120);
    if (error) setNotice({ type: "error", text: error.message });
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Client help desk</p>
          <h2 className="mt-2 text-2xl font-black text-[#020B1F]">Support Ticket Centre</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">Create, track and continue support requests in one secure place.</p>
        </div>
        <button type="button" onClick={loadTickets} className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33]">
          <RefreshCw size={16} className="mr-2" /> Refresh
        </button>
      </div>

      {notice.text && <Notice {...notice} />}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={createTicket} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <LifeBuoy className="text-[#0B7CFF]" />
          <h3 className="mt-3 text-xl font-black text-[#020B1F]">Create a new ticket</h3>
          <div className="mt-5 grid gap-4">
            {clients.length > 1 && <Select label="Client" value={form.clientId} onChange={(value) => setForm({ ...form, clientId: value })} options={clients.map((c) => [c.id, c.organisation || c.full_name])} />}
            <Select label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} options={categories} />
            <Select label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={priorities.map((p) => [p, label(p)])} />
            <Select label="Related project" value={form.projectId} onChange={(value) => setForm({ ...form, projectId: value })} options={[["", "General support"], ...projects.map((p) => [p.id, p.title])]} />
            <Field label="Subject"><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="Short summary of the issue" /></Field>
            <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className={inputClass} placeholder="Explain the problem and what you have already tried." /></Field>
            <Field label="Screenshot or file (optional)"><input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className={inputClass} /></Field>
          </div>
          <button disabled={busy} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {busy ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Send size={17} className="mr-2" />} Create Ticket
          </button>
        </form>

        <div className="grid gap-5 content-start">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-[#020B1F]">Your tickets</h3>
            {loading ? <Loader2 className="mt-5 animate-spin text-[#0B7CFF]" /> : tickets.length === 0 ? <p className="mt-4 text-sm font-semibold text-slate-500">No support tickets yet.</p> : (
              <div className="mt-4 grid gap-3">
                {tickets.map((ticket) => (
                  <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={`rounded-2xl border p-4 text-left ${selectedId === ticket.id ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-[#F8FCFF]"}`}>
                    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">{ticket.ticket_number || "Ticket"} • {label(ticket.priority)}</p><p className="mt-1 font-black text-[#020B1F]">{ticket.subject}</p></div><Badge value={ticket.status} /></div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {selectedTicket && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{selectedTicket.ticket_number || "Support ticket"}</p><h3 className="mt-2 text-xl font-black text-[#020B1F]">{selectedTicket.subject}</h3><p className="mt-2 text-sm font-semibold text-slate-600">Assigned to: {selectedTicket.assigned_profile?.full_name || "MKETICS support queue"}</p></div>
                <Badge value={selectedTicket.status} />
              </div>
              {selectedTicket.resolution_notes && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"><CheckCircle2 size={16} className="mb-2" />{selectedTicket.resolution_notes}</div>}
              <div className="mt-5 grid gap-3">
                {messages.map((message) => <div key={message.id} className={`max-w-[88%] rounded-2xl p-4 ${message.author_role === "client" ? "ml-auto bg-[#061A33] text-white" : "bg-[#EAF6FF] text-[#061A33]"}`}><p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{message.author_role === "client" ? "You" : "MKETICS Support"} • {new Date(message.created_at).toLocaleString("en-ZA")}</p><p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6">{message.message}</p>{message.attachment_path && <button type="button" onClick={() => openAttachment(message)} className="mt-3 inline-flex items-center text-xs font-black underline"><Download size={13} className="mr-2" />{message.attachment_name || "Open attachment"}</button>}</div>)}
              </div>
              {!["closed"].includes(selectedTicket.status) && (
                <form onSubmit={sendReply} className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} className={inputClass} placeholder="Reply to MKETICS support..." />
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="inline-flex cursor-pointer items-center text-xs font-black text-[#0B7CFF]"><Paperclip size={15} className="mr-2" />Attach file<input type="file" className="hidden" onChange={(e) => setReplyFile(e.target.files?.[0] || null)} /></label><button disabled={busy || (!reply.trim() && !replyFile)} className="inline-flex items-center justify-center rounded-full bg-[#061A33] px-5 py-2.5 text-xs font-black text-white disabled:opacity-50"><Send size={14} className="mr-2" />Send Reply</button></div>
                  {replyFile && <p className="mt-2 text-xs font-bold text-slate-500"><FileText size={13} className="mr-1 inline" />{replyFile.name}</p>}
                </form>
              )}
              {selectedTicket.status === "resolved" && <button type="button" onClick={reopenTicket} disabled={busy} className="mt-4 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-xs font-black text-amber-900">Reopen Ticket</button>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100";
function Field({ label: text, children }) { return <label><span className="text-sm font-black text-[#061A33]">{text}</span>{children}</label>; }
function Select({ label: text, value, onChange, options }) { return <Field label={text}><select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>{options.map(([v, l]) => <option key={`${text}-${v}`} value={v}>{l}</option>)}</select></Field>; }
function Badge({ value }) { return <span className="shrink-0 rounded-full border border-[#0B7CFF]/20 bg-white px-3 py-1 text-xs font-black text-[#061A33]">{label(value)}</span>; }
function Notice({ type, text }) { const error = type === "error"; return <div className={`flex items-start rounded-2xl border p-4 text-sm font-bold ${error ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>{error ? <AlertCircle size={17} className="mr-2 shrink-0" /> : <CheckCircle2 size={17} className="mr-2 shrink-0" />}{text}</div>; }
function label(value) { return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
