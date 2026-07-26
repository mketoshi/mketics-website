import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plus, RefreshCw, Save, Target } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const emptyMilestone = { projectId: "", title: "", description: "", dueDate: "", progress: 0, requiresApproval: false, deliverableUrl: "" };

export default function ProjectProgressDashboard({ isActive }) {
  const [state, setState] = useState({ loading: false, error: "", success: "", projects: [], clients: [], milestones: [], risks: [] });
  const [form, setForm] = useState(emptyMilestone);
  const [risk, setRisk] = useState({ projectId: "", title: "", impact: "", mitigation: "", severity: "medium" });
  const clients = useMemo(() => new Map(state.clients.map((item) => [item.id, item])), [state.clients]);

  useEffect(() => { if (isActive) load(); }, [isActive]);

  async function load() {
    setState((current) => ({ ...current, loading: true, error: "", success: "" }));
    const [projects, clientRows, milestones, risks] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name, organisation"),
      supabase.from("project_milestones").select("*").order("sort_order"),
      supabase.from("project_risks").select("*").order("created_at", { ascending: false }),
    ]);
    const error = projects.error || clientRows.error || milestones.error || risks.error;
    setState({ loading: false, error: error?.message || "", success: "", projects: projects.data || [], clients: clientRows.data || [], milestones: milestones.data || [], risks: risks.data || [] });
  }

  async function addMilestone(event) {
    event.preventDefault();
    const { error } = await supabase.from("project_milestones").insert({
      project_id: form.projectId, title: form.title.trim(), description: form.description.trim() || null,
      due_date: form.dueDate || null, progress_percent: Number(form.progress), status: Number(form.progress) >= 100 ? "completed" : Number(form.progress) > 0 ? "in_progress" : "pending",
      requires_client_approval: form.requiresApproval, client_decision: form.requiresApproval ? "pending" : null, deliverable_url: form.deliverableUrl.trim() || null,
    });
    if (error) return setState((current) => ({ ...current, error: error.message, success: "" }));
    await supabase.from("project_activities").insert({ project_id: form.projectId, activity_type: "milestone", title: form.title.trim(), message: "A project milestone was created or updated.", client_visible: true });
    setForm(emptyMilestone); await load(); setState((current) => ({ ...current, success: "Milestone published to the client portal." }));
  }

  async function addRisk(event) {
    event.preventDefault();
    const { error } = await supabase.from("project_risks").insert({ project_id: risk.projectId, title: risk.title.trim(), impact: risk.impact.trim() || null, mitigation: risk.mitigation.trim() || null, severity: risk.severity, client_visible: true });
    if (error) return setState((current) => ({ ...current, error: error.message, success: "" }));
    setRisk({ projectId: "", title: "", impact: "", mitigation: "", severity: "medium" }); await load(); setState((current) => ({ ...current, success: "Risk and mitigation published." }));
  }

  async function updateMilestone(item, changes) {
    const next = { ...item, ...changes };
    const { error } = await supabase.from("project_milestones").update({ status: next.status, progress_percent: Number(next.progress_percent), due_date: next.due_date || null }).eq("id", item.id);
    if (error) setState((current) => ({ ...current, error: error.message }));
    else load();
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Project delivery</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Project Progress Centre</h2><p className="mt-2 text-sm font-semibold text-slate-600">Publish timelines, milestones, deliverables, risks and approval requests.</p></div><button onClick={load} className="inline-flex items-center justify-center rounded-full border border-cyan-200 px-5 py-3 text-sm font-black"><RefreshCw size={16} className="mr-2" />Refresh</button></div>
      {state.error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}{state.success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{state.success}</p>}
      {state.loading ? <Loader2 className="mx-auto mt-8 animate-spin text-[#0B7CFF]" /> : <>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <form onSubmit={addMilestone} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5"><h3 className="flex items-center font-black"><Target size={18} className="mr-2 text-[#0B7CFF]" />Add milestone or deliverable</h3><ProjectSelect value={form.projectId} projects={state.projects} clients={clients} onChange={(value) => setForm({ ...form, projectId: value })} /><Input value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Milestone title" required /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Progress note, completed work and next step" className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm" rows="3" /><div className="grid gap-3 sm:grid-cols-2"><Input type="date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} /><Input type="number" min="0" max="100" value={form.progress} onChange={(value) => setForm({ ...form, progress: value })} placeholder="Progress %" /></div><Input value={form.deliverableUrl} onChange={(value) => setForm({ ...form, deliverableUrl: value })} placeholder="Shared deliverable URL (optional)" /><label className="mt-3 flex items-center text-sm font-bold"><input type="checkbox" checked={form.requiresApproval} onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} className="mr-2" />Request client approval</label><Submit label="Publish milestone" /></form>
          <form onSubmit={addRisk} className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5"><h3 className="flex items-center font-black"><AlertTriangle size={18} className="mr-2 text-amber-500" />Add visible risk or delay</h3><ProjectSelect value={risk.projectId} projects={state.projects} clients={clients} onChange={(value) => setRisk({ ...risk, projectId: value })} /><Input value={risk.title} onChange={(value) => setRisk({ ...risk, title: value })} placeholder="Risk or delay title" required /><textarea value={risk.impact} onChange={(e) => setRisk({ ...risk, impact: e.target.value })} placeholder="Impact on scope or delivery date" className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm" rows="2" /><textarea value={risk.mitigation} onChange={(e) => setRisk({ ...risk, mitigation: e.target.value })} placeholder="Mitigation or revised plan" className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm" rows="2" /><select value={risk.severity} onChange={(e) => setRisk({ ...risk, severity: e.target.value })} className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select><Submit label="Publish risk update" /></form>
        </div>
        <div className="mt-6 grid gap-5">{state.projects.map((project) => { const items = state.milestones.filter((item) => item.project_id === project.id); if (!items.length) return null; return <article key={project.id} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-[#020B1F]">{project.title}</h3><p className="mt-1 text-xs font-bold uppercase text-[#0B7CFF]">{clients.get(project.client_id)?.organisation || clients.get(project.client_id)?.full_name || "Client"}</p><div className="mt-4 grid gap-3">{items.map((item) => <div key={item.id} className="grid gap-3 rounded-xl bg-[#F8FCFF] p-4 lg:grid-cols-[1fr_160px_120px] lg:items-center"><div><p className="text-sm font-black">{item.title}</p><p className="mt-1 text-xs font-semibold text-slate-600">{item.client_decision && `Client: ${item.client_decision.replaceAll("_", " ")}`}</p></div><select value={item.status} onChange={(e) => updateMilestone(item, { status: e.target.value })} className="rounded-xl border border-slate-200 p-2 text-xs font-bold"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="awaiting_approval">Awaiting approval</option><option value="completed">Completed</option><option value="delayed">Delayed</option></select><input type="number" min="0" max="100" value={item.progress_percent} onChange={(e) => updateMilestone(item, { progress_percent: e.target.value })} className="rounded-xl border border-slate-200 p-2 text-xs font-bold" /></div>)}</div></article>; })}</div>
      </>}
    </section>
  );
}
function ProjectSelect({ value, projects, clients, onChange }) { return <select required value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title} — {clients.get(project.client_id)?.organisation || clients.get(project.client_id)?.full_name || "Client"}</option>)}</select>; }
function Input({ value, onChange, ...props }) { return <input {...props} value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold" />; }
function Submit({ label }) { return <button type="submit" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#0B7CFF] px-4 py-3 text-sm font-black text-white"><Plus size={16} className="mr-2" />{label}</button>; }
