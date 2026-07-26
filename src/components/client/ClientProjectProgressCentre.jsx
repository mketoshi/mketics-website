import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  Target,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const decisions = [
  ["approved", "Approve milestone"],
  ["changes_requested", "Request changes"],
  ["question", "Ask a question"],
];

export default function ClientProjectProgressCentre({ projects = [] }) {
  const [data, setData] = useState({ loading: true, error: "", milestones: [], risks: [], activities: [] });
  const [forms, setForms] = useState({});
  const [saving, setSaving] = useState("");

  const projectIds = useMemo(() => projects.map((project) => project.id).filter(Boolean), [projects]);

  useEffect(() => {
    loadProgress();
  }, [projectIds.join("|")]);

  async function loadProgress() {
    if (!supabase || projectIds.length === 0) {
      setData({ loading: false, error: "", milestones: [], risks: [], activities: [] });
      return;
    }
    setData((current) => ({ ...current, loading: true, error: "" }));
    const [milestones, risks, activities] = await Promise.all([
      supabase.from("project_milestones").select("*").in("project_id", projectIds).order("sort_order"),
      supabase.from("project_risks").select("*").in("project_id", projectIds).eq("client_visible", true).order("created_at", { ascending: false }),
      supabase.from("project_activities").select("*").in("project_id", projectIds).eq("client_visible", true).order("created_at", { ascending: false }),
    ]);
    const error = milestones.error || risks.error || activities.error;
    setData({
      loading: false,
      error: error?.message || "",
      milestones: milestones.data || [],
      risks: risks.data || [],
      activities: activities.data || [],
    });
  }

  async function submitResponse(milestone) {
    const form = forms[milestone.id] || { decision: "approved", feedback: "" };
    setSaving(milestone.id);
    const { error } = await supabase.rpc("submit_client_milestone_response", {
      target_milestone_id: milestone.id,
      response_decision: form.decision,
      response_feedback: form.feedback.trim() || null,
    });
    setSaving("");
    if (error) {
      setData((current) => ({ ...current, error: error.message }));
      return;
    }
    setForms((current) => ({ ...current, [milestone.id]: { decision: "approved", feedback: "" } }));
    await loadProgress();
  }

  if (data.loading) return <PanelMessage icon={Loader2} spin text="Loading project progress..." />;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Delivery visibility</p>
          <h2 className="mt-2 text-2xl font-black text-[#020B1F]">Project Progress Centre</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Follow milestones, delivery dates, risks and client approvals in one place.</p>
        </div>
        <button onClick={loadProgress} className="inline-flex items-center justify-center rounded-full border border-cyan-200 px-5 py-3 text-sm font-black text-[#061A33]">
          <RefreshCw size={16} className="mr-2" /> Refresh
        </button>
      </div>

      {data.error && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{data.error}</p>}
      {projects.length === 0 ? <PanelMessage icon={Target} text="No projects are linked to your account yet." /> : (
        <div className="mt-6 grid gap-6">
          {projects.map((project) => {
            const milestones = data.milestones.filter((item) => item.project_id === project.id);
            const risks = data.risks.filter((item) => item.project_id === project.id);
            const activities = data.activities.filter((item) => item.project_id === project.id);
            const progress = milestones.length
              ? Math.round(milestones.reduce((sum, item) => sum + Number(item.progress_percent || 0), 0) / milestones.length)
              : Number(project.progress_percent || (project.status === "completed" ? 100 : 0));
            return (
              <article key={project.id} className="rounded-[1.75rem] border border-slate-200 bg-[#F8FCFF] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">{project.service_type || "MKETICS Project"}</p>
                    <h3 className="mt-2 text-xl font-black text-[#020B1F]">{project.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{project.description}</p>
                  </div>
                  <span className="rounded-full bg-[#061A33] px-4 py-2 text-xs font-black uppercase text-cyan-200">{String(project.status).replaceAll("_", " ")}</span>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm font-black text-[#061A33]"><span>Overall progress</span><span>{progress}%</span></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Info icon={CalendarDays} label="Start" value={formatDate(project.start_date)} />
                  <Info icon={Clock3} label="Expected delivery" value={formatDate(project.revised_due_date || project.due_date)} />
                </div>

                <div className="mt-6 grid gap-4">
                  {milestones.length === 0 ? <PanelMessage icon={Target} text="No milestones have been published yet." /> : milestones.map((milestone) => {
                    const form = forms[milestone.id] || { decision: "approved", feedback: "" };
                    return (
                      <div key={milestone.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                          <div>
                            <p className="font-black text-[#020B1F]">{milestone.title}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">{milestone.description}</p>
                          </div>
                          <span className="text-xs font-black uppercase text-[#0B7CFF]">{String(milestone.status).replaceAll("_", " ")} · {milestone.progress_percent}%</span>
                        </div>
                        {milestone.deliverable_url && (
                          <a href={milestone.deliverable_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-black text-[#0B7CFF]">
                            <Download size={15} className="mr-2" /> Open shared deliverable
                          </a>
                        )}
                        {milestone.requires_client_approval && milestone.client_decision === "pending" && (
                          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-[190px_1fr_auto]">
                            <select value={form.decision} onChange={(event) => setForms((current) => ({ ...current, [milestone.id]: { ...form, decision: event.target.value } }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">
                              {decisions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <input value={form.feedback} onChange={(event) => setForms((current) => ({ ...current, [milestone.id]: { ...form, feedback: event.target.value } }))} placeholder="Add feedback (optional)" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" />
                            <button onClick={() => submitResponse(milestone)} disabled={saving === milestone.id} className="inline-flex items-center justify-center rounded-xl bg-[#0B7CFF] px-4 py-2 text-sm font-black text-white">
                              {saving === milestone.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          </div>
                        )}
                        {milestone.client_decision && milestone.client_decision !== "pending" && <p className="mt-3 text-sm font-bold text-emerald-700"><CheckCircle2 size={15} className="mr-2 inline" />Client response: {milestone.client_decision.replaceAll("_", " ")}</p>}
                      </div>
                    );
                  })}
                </div>

                {(risks.length > 0 || activities.length > 0) && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <MiniList title="Risks & timeline changes" icon={AlertTriangle} items={risks.map((risk) => ({ id: risk.id, title: risk.title, text: risk.impact || risk.mitigation, meta: `${risk.severity} · ${risk.status}` }))} />
                    <MiniList title="Recent activity" icon={MessageSquareText} items={activities.slice(0, 6).map((item) => ({ id: item.id, title: item.title, text: item.message, meta: formatDate(item.created_at) }))} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Info({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><Icon size={17} className="text-[#0B7CFF]" /><p className="mt-2 text-xs font-black uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-black text-[#061A33]">{value}</p></div>; }
function MiniList({ title, icon: Icon, items }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="flex items-center font-black text-[#020B1F]"><Icon size={17} className="mr-2 text-[#0B7CFF]" />{title}</p><div className="mt-3 grid gap-3">{items.length ? items.map((item) => <div key={item.id} className="rounded-xl bg-[#F8FCFF] p-3"><p className="text-sm font-black">{item.title}</p><p className="mt-1 text-xs font-semibold text-slate-600">{item.text}</p><p className="mt-2 text-[11px] font-black uppercase text-[#0B7CFF]">{item.meta}</p></div>) : <p className="text-sm font-semibold text-slate-500">Nothing to report.</p>}</div></div>; }
function PanelMessage({ icon: Icon, text, spin = false }) { return <div className="mt-6 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-7 text-center"><Icon size={25} className={`mx-auto text-[#0B7CFF] ${spin ? "animate-spin" : ""}`} /><p className="mt-3 text-sm font-bold text-slate-600">{text}</p></div>; }
function formatDate(value) { if (!value) return "Not set"; return new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
