import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, CheckCircle2, FileUp, Loader2, RefreshCw, Send, WalletCards } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const categories = ["System Design & Development", "IT & Network Infrastructure", "Digital Business Solutions", "Security & Smart Technology", "Digital Marketing", "Business Registration Assistance", "Other"];
const packages = ["Business", "Premium", "Custom", "Not sure yet"];

export default function ClientServiceRequestCentre({ clients = [] }) {
  const [state, setState] = useState({ loading: true, saving: false, error: "", success: "", requests: [] });
  const [form, setForm] = useState({ clientId: clients[0]?.id || "", category: categories[0], packageName: packages[0], title: "", requirements: "", budget: "", desiredDate: "", file: null });
  const clientIds = useMemo(() => clients.map((item) => item.id).filter(Boolean), [clients]);

  useEffect(() => { setForm((current) => ({ ...current, clientId: current.clientId || clients[0]?.id || "" })); }, [clients]);
  useEffect(() => { load(); }, [clientIds.join("|")]);

  async function load() {
    if (!supabase || !clientIds.length) return setState((current) => ({ ...current, loading: false, requests: [] }));
    setState((current) => ({ ...current, loading: true, error: "" }));
    const { data, error } = await supabase.from("service_requests").select("*").in("client_id", clientIds).order("created_at", { ascending: false });
    setState((current) => ({ ...current, loading: false, requests: data || [], error: error?.message || "" }));
  }

  async function submit(event) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: "", success: "" }));
    const { data, error } = await supabase.from("service_requests").insert({
      client_id: form.clientId, service_category: form.category, package_name: form.packageName,
      title: form.title.trim(), requirements: form.requirements.trim(), budget: form.budget.trim() || null,
      desired_completion_date: form.desiredDate || null,
    }).select().single();
    if (error) return setState((current) => ({ ...current, saving: false, error: error.message }));
    if (form.file) {
      const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${form.clientId}/${data.id}/${crypto.randomUUID()}-${safeName}`;
      const upload = await supabase.storage.from("service-request-files").upload(path, form.file, { upsert: false });
      if (upload.error) return setState((current) => ({ ...current, saving: false, error: `Request saved, but attachment failed: ${upload.error.message}` }));
      await supabase.from("service_request_attachments").insert({ request_id: data.id, client_id: form.clientId, file_name: form.file.name, file_size: form.file.size, mime_type: form.file.type, storage_path: path });
    }
    setForm({ clientId: clients[0]?.id || "", category: categories[0], packageName: packages[0], title: "", requirements: "", budget: "", desiredDate: "", file: null });
    await load();
    setState((current) => ({ ...current, saving: false, success: "Service request submitted successfully." }));
  }

  async function respond(request, decision) {
    const feedback = window.prompt(decision === "accepted" ? "Optional acceptance note:" : "Please tell us why you are declining or what should change:") || "";
    const { error } = await supabase.rpc("respond_to_service_request_quote", { target_request_id: request.id, response_decision: decision, response_feedback: feedback.trim() || null });
    if (error) setState((current) => ({ ...current, error: error.message, success: "" })); else { await load(); setState((current) => ({ ...current, success: `Proposal ${decision}.`, error: "" })); }
  }

  return <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">New business</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Service Request Centre</h2><p className="mt-2 text-sm font-semibold text-slate-600">Request a service and follow it from review to quotation and project activation.</p></div><button onClick={load} className="inline-flex items-center justify-center rounded-full border border-cyan-200 px-5 py-3 text-sm font-black"><RefreshCw size={16} className="mr-2" />Refresh</button></div>
    {state.error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}{state.success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{state.success}</p>}
    <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5 md:grid-cols-2">
      {clients.length > 1 && <Select value={form.clientId} onChange={(v) => setForm({ ...form, clientId: v })}>{clients.map((c) => <option key={c.id} value={c.id}>{c.organisation || c.full_name}</option>)}</Select>}
      <Select value={form.category} onChange={(v) => setForm({ ...form, category: v })}>{categories.map((v) => <option key={v}>{v}</option>)}</Select>
      <Select value={form.packageName} onChange={(v) => setForm({ ...form, packageName: v })}>{packages.map((v) => <option key={v}>{v}</option>)}</Select>
      <Input required placeholder="Request title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Input placeholder="Budget or budget range (optional)" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} />
      <Input type="date" value={form.desiredDate} onChange={(v) => setForm({ ...form, desiredDate: v })} />
      <textarea required rows="4" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Describe your requirements, goals and important details" className="rounded-xl border border-slate-200 p-3 text-sm font-semibold md:col-span-2" />
      <label className="flex items-center rounded-xl border border-dashed border-cyan-300 bg-white p-3 text-sm font-bold md:col-span-2"><FileUp size={18} className="mr-2 text-[#0B7CFF]" /><input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="w-full" /></label>
      <button disabled={state.saving || !form.clientId} className="inline-flex items-center justify-center rounded-xl bg-[#0B7CFF] px-4 py-3 text-sm font-black text-white md:col-span-2">{state.saving ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Send size={17} className="mr-2" />}Submit service request</button>
    </form>
    <div className="mt-6 grid gap-4">{state.loading ? <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" /> : state.requests.length === 0 ? <p className="rounded-2xl bg-[#F8FCFF] p-6 text-center text-sm font-bold text-slate-500">No service requests submitted yet.</p> : state.requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between"><div><p className="text-xs font-black uppercase text-[#0B7CFF]">{request.request_number} · {request.service_category}</p><h3 className="mt-2 font-black text-[#020B1F]">{request.title}</h3><p className="mt-2 text-sm font-semibold text-slate-600">{request.requirements}</p></div><span className="h-fit rounded-full bg-[#061A33] px-4 py-2 text-xs font-black uppercase text-cyan-200">{String(request.status).replaceAll("_", " ")}</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><Info icon={WalletCards} label="Package / budget" value={`${request.package_name || "Custom"} · ${request.budget || "Not stated"}`} /><Info icon={CalendarDays} label="Desired completion" value={formatDate(request.desired_completion_date)} /><Info icon={BriefcaseBusiness} label="Assigned to" value={request.assigned_name || "Pending assignment"} /></div>
      {request.admin_notes && <p className="mt-4 rounded-xl bg-[#F8FCFF] p-3 text-sm font-semibold"><strong>MKETICS update:</strong> {request.admin_notes}</p>}
      {request.quoted_amount != null && <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4"><p className="font-black text-[#061A33]">Proposed price: {new Intl.NumberFormat("en-ZA", { style: "currency", currency: request.currency || "ZAR" }).format(request.quoted_amount)}</p><p className="mt-1 text-sm font-semibold text-slate-600">{request.proposed_scope}</p>{request.client_decision === "pending" && <div className="mt-3 flex gap-2"><button onClick={() => respond(request, "accepted")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">Accept</button><button onClick={() => respond(request, "declined")} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-red-700">Decline / request changes</button></div>}{request.client_decision && request.client_decision !== "pending" && <p className="mt-3 text-sm font-black"><CheckCircle2 size={16} className="mr-2 inline" />Response: {request.client_decision}</p>}</div>}
    </article>)}</div>
  </section>;
}
function Select({ value, onChange, children }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-slate-200 p-3 text-sm font-bold">{children}</select>; }
function Input({ value, onChange, ...props }) { return <input {...props} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-slate-200 p-3 text-sm font-semibold" />; }
function Info({ icon: Icon, label, value }) { return <div className="rounded-xl bg-[#F8FCFF] p-3"><Icon size={16} className="text-[#0B7CFF]" /><p className="mt-2 text-[10px] font-black uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>; }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Not specified"; }
