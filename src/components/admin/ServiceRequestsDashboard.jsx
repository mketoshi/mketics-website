import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, RefreshCw, Save } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const statuses = ["submitted", "under_review", "more_information_required", "quotation_prepared", "awaiting_client", "approved", "declined", "converted", "closed"];

export default function ServiceRequestsDashboard({ isActive, profile }) {
  const [state, setState] = useState({ loading: false, error: "", success: "", requests: [], clients: [], staff: [] });
  const clientMap = useMemo(() => new Map(state.clients.map((v) => [v.id, v])), [state.clients]);
  useEffect(() => { if (isActive) load(); }, [isActive]);
  async function load() {
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    const [requests, clients, staff] = await Promise.all([
      supabase.from("service_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name, organisation, email"),
      supabase.from("profiles").select("id, full_name, email, role").in("role", ["admin", "staff"]),
    ]);
    const error = requests.error || clients.error || staff.error;
    setState({ loading: false, error: error?.message || "", success: "", requests: requests.data || [], clients: clients.data || [], staff: staff.data || [] });
  }
  async function update(request, changes) {
    const { error } = await supabase.from("service_requests").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", request.id);
    if (error) setState((s) => ({ ...s, error: error.message, success: "" })); else { await load(); setState((s) => ({ ...s, success: "Service request updated." })); }
  }
  async function quote(request) {
    const amount = window.prompt("Proposed price in ZAR:", request.quoted_amount || "");
    if (amount === null || Number.isNaN(Number(amount))) return;
    const scope = window.prompt("Proposed scope summary:", request.proposed_scope || request.requirements);
    if (scope === null) return;
    const { error } = await supabase.rpc("prepare_service_request_quote", { target_request_id: request.id, quote_amount: Number(amount), scope_summary: scope.trim() });
    if (error) setState((s) => ({ ...s, error: error.message, success: "" })); else { await load(); setState((s) => ({ ...s, success: "Quotation proposal sent to client." })); }
  }
  async function convert(request) {
    if (!window.confirm("Convert this approved request into an active project?")) return;
    const { error } = await supabase.rpc("convert_service_request_to_project", { target_request_id: request.id, actor_profile_id: profile?.id || null });
    if (error) setState((s) => ({ ...s, error: error.message, success: "" })); else { await load(); setState((s) => ({ ...s, success: "Approved request converted into a project." })); }
  }
  return <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Sales workflow</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Service Request Centre</h2><p className="mt-2 text-sm font-semibold text-slate-600">Review, assign, quote and convert client requests into active projects.</p></div><button onClick={load} className="inline-flex items-center justify-center rounded-full border border-cyan-200 px-5 py-3 text-sm font-black"><RefreshCw size={16} className="mr-2" />Refresh</button></div>
    {state.error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}{state.success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{state.success}</p>}
    <div className="mt-6 grid gap-4">{state.loading ? <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" /> : state.requests.map((request) => { const client = clientMap.get(request.client_id); return <article key={request.id} className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between"><div><p className="text-xs font-black uppercase text-[#0B7CFF]">{request.request_number} · {client?.organisation || client?.full_name || "Client"}</p><h3 className="mt-2 text-lg font-black">{request.title}</h3><p className="mt-2 text-sm font-semibold text-slate-600">{request.requirements}</p><p className="mt-2 text-xs font-bold text-slate-500">{request.service_category} · {request.package_name} · Budget: {request.budget || "Not stated"}</p></div><span className="h-fit rounded-full bg-[#061A33] px-4 py-2 text-xs font-black uppercase text-cyan-200">{request.status.replaceAll("_", " ")}</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3"><select value={request.status} onChange={(e) => update(request, { status: e.target.value })} className="rounded-xl border border-slate-200 p-3 text-sm font-bold">{statuses.map((v) => <option key={v} value={v}>{v.replaceAll("_", " ")}</option>)}</select><select value={request.assigned_to || ""} onChange={(e) => update(request, { assigned_to: e.target.value || null, assigned_name: state.staff.find((v) => v.id === e.target.value)?.full_name || null })} className="rounded-xl border border-slate-200 p-3 text-sm font-bold"><option value="">Unassigned</option>{state.staff.map((v) => <option key={v.id} value={v.id}>{v.full_name || v.email}</option>)}</select><button onClick={() => quote(request)} className="inline-flex items-center justify-center rounded-xl bg-[#0B7CFF] px-4 py-3 text-sm font-black text-white"><Save size={16} className="mr-2" />Prepare quotation</button></div>
      <textarea defaultValue={request.admin_notes || ""} onBlur={(e) => { if (e.target.value !== (request.admin_notes || "")) update(request, { admin_notes: e.target.value.trim() || null }); }} placeholder="Client-visible update or information request" rows="2" className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold" />
      {request.client_feedback && <p className="mt-3 rounded-xl bg-[#F8FCFF] p-3 text-sm font-semibold"><strong>Client response:</strong> {request.client_decision} — {request.client_feedback}</p>}
      {request.client_decision === "accepted" && !request.project_id && <button onClick={() => convert(request)} className="mt-3 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">Convert to active project <ArrowRight size={16} className="ml-2" /></button>}
      {request.project_id && <p className="mt-3 text-sm font-black text-emerald-700">Converted to project successfully.</p>}
    </article>; })}</div>
  </section>;
}
