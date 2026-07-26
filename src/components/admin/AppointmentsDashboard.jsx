import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock, Loader2, RefreshCw, Save, Search } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const statuses = ["pending", "confirmed", "rescheduled", "completed", "cancelled"];

export default function AppointmentsDashboard({ isActive }) {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [form, setForm] = useState({ status: "pending", assignedTo: "", scheduledStart: "", durationMinutes: "60", meetingLink: "", location: "", adminNotes: "", rescheduleReason: "", cancellationReason: "" });

  const selected = appointments.find((item) => item.id === selectedId) || null;
  const filtered = useMemo(() => appointments.filter((item) => [item.appointment_number, item.subject, item.client?.full_name, item.client?.organisation, item.project?.title].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())), [appointments, search]);
  const stats = useMemo(() => ({ total: appointments.length, pending: appointments.filter((item) => item.status === "pending").length, confirmed: appointments.filter((item) => ["confirmed", "rescheduled"].includes(item.status)).length, today: appointments.filter((item) => { const date = item.scheduled_start && new Date(item.scheduled_start); return date && date.toDateString() === new Date().toDateString() && !["cancelled", "completed"].includes(item.status); }).length }), [appointments]);

  useEffect(() => { if (isActive) loadDashboard(); }, [isActive]);
  useEffect(() => {
    if (!selected) return;
    setForm({
      status: selected.status,
      assignedTo: selected.assigned_to || "",
      scheduledStart: selected.scheduled_start ? toLocalInput(selected.scheduled_start) : toLocalInput(selected.preferred_start),
      durationMinutes: String(selected.duration_minutes || 60),
      meetingLink: selected.meeting_link || "",
      location: selected.location || "",
      adminNotes: selected.admin_notes || "",
      rescheduleReason: selected.reschedule_reason || "",
      cancellationReason: selected.cancellation_reason || "",
    });
  }, [selected?.id]);

  async function loadDashboard() {
    setLoading(true);
    const [appointmentsResult, staffResult] = await Promise.all([
      supabase.from("client_appointments").select("id, appointment_number, client_id, project_id, appointment_type, meeting_method, subject, details, location, preferred_start, scheduled_start, scheduled_end, duration_minutes, status, assigned_to, meeting_link, admin_notes, reschedule_reason, cancellation_reason, created_at, client:clients(full_name,email,phone,organisation), project:projects(title), assigned_profile:profiles!client_appointments_assigned_to_fkey(full_name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, role").in("role", ["admin", "staff"]).order("full_name"),
    ]);
    setLoading(false);
    const error = appointmentsResult.error || staffResult.error;
    if (error) return setNotice({ type: "error", text: error.message });
    setAppointments(appointmentsResult.data || []);
    setStaff(staffResult.data || []);
    if (!selectedId && appointmentsResult.data?.[0]?.id) setSelectedId(appointmentsResult.data[0].id);
  }

  async function saveAppointment(event) {
    event.preventDefault();
    if (!selected || !form.scheduledStart) return;
    try {
      setBusy(true);
      const start = new Date(form.scheduledStart);
      const end = new Date(start.getTime() + Number(form.durationMinutes) * 60000);
      if (form.status !== "cancelled") {
        let conflictQuery = supabase.from("client_appointments").select("id, appointment_number").neq("id", selected.id).in("status", ["confirmed", "rescheduled"]).lt("scheduled_start", end.toISOString()).gt("scheduled_end", start.toISOString()).limit(1);
        if (form.assignedTo) conflictQuery = conflictQuery.eq("assigned_to", form.assignedTo);
        const { data: conflicts, error: conflictError } = await conflictQuery;
        if (conflictError) throw conflictError;
        if (conflicts?.length) throw new Error(`Scheduling conflict with ${conflicts[0].appointment_number}. Choose another time or staff member.`);
      }
      const { error } = await supabase.from("client_appointments").update({
        status: form.status,
        assigned_to: form.assignedTo || null,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        duration_minutes: Number(form.durationMinutes),
        meeting_link: form.meetingLink.trim() || null,
        location: form.location.trim() || null,
        admin_notes: form.adminNotes.trim() || null,
        reschedule_reason: form.status === "rescheduled" ? form.rescheduleReason.trim() || "Appointment time changed by MKETICS." : null,
        cancellation_reason: form.status === "cancelled" ? form.cancellationReason.trim() || "Cancelled by MKETICS." : null,
        confirmed_at: ["confirmed", "rescheduled"].includes(form.status) ? selected.confirmed_at || new Date().toISOString() : null,
        completed_at: form.status === "completed" ? new Date().toISOString() : null,
        cancelled_at: form.status === "cancelled" ? new Date().toISOString() : null,
      }).eq("id", selected.id);
      if (error) throw error;
      setNotice({ type: "success", text: "Appointment workflow updated." });
      await loadDashboard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">MKETICS scheduling</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Appointments & Consultations</h2><p className="mt-2 text-sm font-semibold text-slate-600">Confirm requests, assign staff and manage meeting details.</p></div><button type="button" onClick={loadDashboard} disabled={loading} className={secondaryButton}>{loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}Refresh</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">{Object.entries(stats).map(([key, value]) => <Stat key={key} label={key} value={value} />)}</div>
      </section>
      {notice.text && <Notice {...notice} />}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <label className="relative block"><Search className="absolute left-4 top-3.5 text-slate-400" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings, clients or projects" className={`${inputClass} mt-0 pl-11`} /></label>
        <div className="mt-5 grid gap-3">{filtered.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`rounded-2xl border p-4 text-left ${selectedId === item.id ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-[#F8FCFF]"}`}><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">{item.appointment_number} • {label(item.appointment_type)}</p><h3 className="mt-1 font-black text-[#020B1F]">{item.subject}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{item.client?.organisation || item.client?.full_name}{item.project?.title ? ` • ${item.project.title}` : ""}</p><p className="mt-2 inline-flex items-center text-xs font-bold text-slate-500"><Clock size={14} className="mr-2" />{formatDate(item.scheduled_start || item.preferred_start)}</p></div><span className="rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase text-[#0B7CFF]">{label(item.status)}</span></div></button>)}{!loading && filtered.length === 0 && <p className="py-8 text-center text-sm font-bold text-slate-500">No appointment requests found.</p>}</div>
      </section>
      {selected && <form onSubmit={saveAppointment} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">{selected.appointment_number}</p><h3 className="mt-2 text-xl font-black text-[#020B1F]">{selected.subject}</h3><p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-slate-600">{selected.details || "No additional instructions."}</p></div><CalendarDays className="text-[#0B7CFF]" /></div><div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></Field>
        <Field label="Assigned staff member"><select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className={inputClass}><option value="">Unassigned</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.full_name || label(person.role)}</option>)}</select></Field>
        <Field label="Scheduled date and time"><input type="datetime-local" value={form.scheduledStart} onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })} className={inputClass} /></Field>
        <Field label="Duration"><select value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className={inputClass}><option value="30">30 minutes</option><option value="60">1 hour</option><option value="90">1 hour 30 minutes</option><option value="120">2 hours</option></select></Field>
        <Field label="Meeting link"><input type="url" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} className={inputClass} placeholder="https://meet..." /></Field>
        <Field label="Office / onsite location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} /></Field>
        {form.status === "rescheduled" && <Field label="Rescheduling reason" wide><textarea rows={3} value={form.rescheduleReason} onChange={(e) => setForm({ ...form, rescheduleReason: e.target.value })} className={inputClass} /></Field>}
        {form.status === "cancelled" && <Field label="Cancellation reason" wide><textarea rows={3} value={form.cancellationReason} onChange={(e) => setForm({ ...form, cancellationReason: e.target.value })} className={inputClass} /></Field>}
        <Field label="Client-facing notes" wide><textarea rows={4} value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} className={inputClass} placeholder="Confirmation details or preparation instructions." /></Field>
      </div><button disabled={busy} className="mt-5 inline-flex items-center justify-center rounded-full bg-[#061A33] px-6 py-3 text-sm font-black text-white disabled:opacity-60">{busy ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Save size={17} className="mr-2" />}Save appointment</button></form>}
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#061A33] outline-none focus:border-cyan-400";
const secondaryButton = "inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] disabled:opacity-60";
function Field({ label: text, wide, children }) { return <label className={wide ? "md:col-span-2" : ""}><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{text}</span>{children}</label>; }
function Stat({ label: text, value }) { return <div className="rounded-2xl bg-[#F8FCFF] p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{text}</p><p className="mt-2 text-2xl font-black text-[#061A33]">{value}</p></div>; }
function Notice({ type, text }) { const success = type === "success"; return <div className={`flex items-start rounded-2xl border p-4 text-sm font-bold ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{success ? <CheckCircle2 size={18} className="mr-3 shrink-0" /> : <AlertCircle size={18} className="mr-3 shrink-0" />}{text}</div>; }
function label(value) { return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value) { return value ? new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "Awaiting schedule"; }
function toLocalInput(value) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16); }
