import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  Video,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const appointmentTypes = [
  ["consultation", "Business consultation"],
  ["technical_support", "Technical support visit"],
  ["project_meeting", "Project meeting"],
  ["follow_up", "Follow-up meeting"],
];

const meetingMethods = [
  ["online", "Online meeting"],
  ["telephone", "Telephone call"],
  ["office", "MKETICS office"],
  ["onsite", "Onsite visit"],
];

export default function ClientAppointmentCentre({ clients, projects }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    clientId: clients[0]?.id || "",
    projectId: "",
    appointmentType: "consultation",
    meetingMethod: "online",
    preferredStart: "",
    durationMinutes: "60",
    subject: "",
    details: "",
    location: "",
  });

  useEffect(() => {
    if (!form.clientId && clients[0]?.id) {
      setForm((current) => ({ ...current, clientId: clients[0].id }));
    }
  }, [clients, form.clientId]);

  useEffect(() => {
    if (clients.length) loadAppointments();
  }, [clients.map((client) => client.id).join(",")]);

  const upcoming = useMemo(
    () =>
      appointments.filter(
        (item) =>
          !["completed", "cancelled"].includes(item.status) &&
          new Date(item.scheduled_start || item.preferred_start) >= new Date()
      ),
    [appointments]
  );

  async function loadAppointments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_appointments")
      .select("id, appointment_number, client_id, project_id, appointment_type, meeting_method, subject, details, location, preferred_start, scheduled_start, scheduled_end, duration_minutes, status, meeting_link, admin_notes, reschedule_reason, cancellation_reason, created_at, project:projects(title), assigned_profile:profiles!client_appointments_assigned_to_fkey(full_name)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) setNotice({ type: "error", text: error.message });
    else setAppointments(data || []);
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!form.clientId || !form.preferredStart || !form.subject.trim()) {
      setNotice({ type: "error", text: "Select a date and enter a meeting subject." });
      return;
    }
    try {
      setBusy(true);
      const { error } = await supabase.from("client_appointments").insert({
        client_id: form.clientId,
        project_id: form.projectId || null,
        appointment_type: form.appointmentType,
        meeting_method: form.meetingMethod,
        preferred_start: new Date(form.preferredStart).toISOString(),
        duration_minutes: Number(form.durationMinutes),
        subject: form.subject.trim(),
        details: form.details.trim() || null,
        location: form.location.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      setForm((current) => ({
        ...current,
        projectId: "",
        preferredStart: "",
        subject: "",
        details: "",
        location: "",
      }));
      setNotice({ type: "success", text: "Your appointment request was submitted to MKETICS." });
      await loadAppointments();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function cancelBooking(appointment) {
    if (!window.confirm("Cancel this appointment request?")) return;
    const { error } = await supabase.rpc("cancel_own_client_appointment", {
      appointment_id_input: appointment.id,
    });
    if (error) setNotice({ type: "error", text: error.message });
    else {
      setNotice({ type: "success", text: "Appointment cancelled." });
      loadAppointments();
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">Client booking</p>
            <h2 className="mt-2 text-2xl font-black text-[#020B1F]">Appointments & Consultations</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">Request a consultation, project meeting, follow-up or technical visit.</p>
          </div>
          <button type="button" onClick={loadAppointments} disabled={loading} className={secondaryButton}>
            {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}Refresh
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="All bookings" value={appointments.length} />
          <Stat label="Upcoming" value={upcoming.length} />
          <Stat label="Pending confirmation" value={appointments.filter((item) => item.status === "pending").length} />
        </div>
      </section>

      {notice.text && <Notice {...notice} />}

      <form onSubmit={submitBooking} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black text-[#020B1F]">Request an appointment</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Client account"><select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputClass}>{clients.map((client) => <option key={client.id} value={client.id}>{client.organisation || client.full_name}</option>)}</select></Field>
          <Field label="Related project"><select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className={inputClass}><option value="">General / no project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></Field>
          <Field label="Appointment type"><select value={form.appointmentType} onChange={(e) => setForm({ ...form, appointmentType: e.target.value })} className={inputClass}>{appointmentTypes.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></Field>
          <Field label="Meeting method"><select value={form.meetingMethod} onChange={(e) => setForm({ ...form, meetingMethod: e.target.value })} className={inputClass}>{meetingMethods.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></Field>
          <Field label="Preferred date and time"><input type="datetime-local" min={toLocalInput(new Date())} value={form.preferredStart} onChange={(e) => setForm({ ...form, preferredStart: e.target.value })} className={inputClass} /></Field>
          <Field label="Expected duration"><select value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className={inputClass}><option value="30">30 minutes</option><option value="60">1 hour</option><option value="90">1 hour 30 minutes</option><option value="120">2 hours</option></select></Field>
          <Field label="Subject" wide><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="What would you like to discuss?" /></Field>
          {["office", "onsite"].includes(form.meetingMethod) && <Field label="Location / address" wide><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="Meeting address or preferred location" /></Field>}
          <Field label="Project details or special instructions" wide><textarea rows={5} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className={inputClass} placeholder="Add context, attendees, access instructions or questions." /></Field>
        </div>
        <button disabled={busy} className="mt-5 inline-flex items-center justify-center rounded-full bg-[#061A33] px-6 py-3 text-sm font-black text-white disabled:opacity-60">{busy ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Send size={17} className="mr-2" />}Submit booking request</button>
      </form>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black text-[#020B1F]">Your bookings</h3>
        <div className="mt-5 grid gap-4">
          {appointments.map((appointment) => {
            const date = appointment.scheduled_start || appointment.preferred_start;
            return (
              <article key={appointment.id} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">{appointment.appointment_number} • {label(appointment.appointment_type)}</p>
                    <h4 className="mt-2 text-lg font-black text-[#020B1F]">{appointment.subject}</h4>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                      <span className="inline-flex items-center"><CalendarDays size={15} className="mr-2" />{formatDate(date)}</span>
                      <span className="inline-flex items-center"><Clock size={15} className="mr-2" />{appointment.duration_minutes} min</span>
                      <span className="inline-flex items-center"><Video size={15} className="mr-2" />{label(appointment.meeting_method)}</span>
                      {appointment.location && <span className="inline-flex items-center"><MapPin size={15} className="mr-2" />{appointment.location}</span>}
                    </div>
                    {appointment.assigned_profile?.full_name && <p className="mt-3 text-sm font-bold text-slate-600">MKETICS representative: {appointment.assigned_profile.full_name}</p>}
                    {appointment.reschedule_reason && <p className="mt-3 text-sm font-semibold text-amber-800">Rescheduling note: {appointment.reschedule_reason}</p>}
                    {appointment.admin_notes && <p className="mt-3 text-sm font-semibold text-slate-600">{appointment.admin_notes}</p>}
                  </div>
                  <span className="rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase text-[#0B7CFF]">{label(appointment.status)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {appointment.meeting_link && ["confirmed", "rescheduled"].includes(appointment.status) && <a href={appointment.meeting_link} target="_blank" rel="noreferrer" className={primaryButton}><ExternalLink size={14} className="mr-2" />Join online meeting</a>}
                  {["pending", "confirmed", "rescheduled"].includes(appointment.status) && <button type="button" onClick={() => cancelBooking(appointment)} className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-black text-rose-700">Cancel booking</button>}
                </div>
              </article>
            );
          })}
          {!loading && appointments.length === 0 && <p className="py-8 text-center text-sm font-bold text-slate-500">No appointment requests yet.</p>}
        </div>
      </section>
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#061A33] outline-none transition focus:border-cyan-400";
const primaryButton = "inline-flex items-center rounded-full bg-[#061A33] px-4 py-2 text-xs font-black text-white";
const secondaryButton = "inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] disabled:opacity-60";
function Field({ label: text, wide, children }) { return <label className={wide ? "md:col-span-2" : ""}><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{text}</span>{children}</label>; }
function Stat({ label: text, value }) { return <div className="rounded-2xl bg-[#F8FCFF] p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{text}</p><p className="mt-2 text-2xl font-black text-[#061A33]">{value}</p></div>; }
function Notice({ type, text }) { const success = type === "success"; return <div className={`flex items-start rounded-2xl border p-4 text-sm font-bold ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{success ? <CheckCircle2 size={18} className="mr-3 shrink-0" /> : <AlertCircle size={18} className="mr-3 shrink-0" />}{text}</div>; }
function label(value) { return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value) { return value ? new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "Awaiting date"; }
function toLocalInput(value) { const date = value instanceof Date ? value : new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16); }
