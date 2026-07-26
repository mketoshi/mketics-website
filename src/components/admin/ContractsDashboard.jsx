import { useEffect, useMemo, useState } from "react";
import { BellRing, FilePlus2, Loader2, RefreshCw, Send, UploadCloud } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const agreementTypes = ["Contract", "Service Agreement", "SLA", "Project Terms", "NDA", "Other"];
const statuses = ["draft", "sent", "viewed", "accepted", "declined", "expired", "cancelled"];

export default function ContractsDashboard({ isActive, profile }) {
  const [state, setState] = useState({ loading: false, saving: false, error: "", success: "", agreements: [], clients: [] });
  const [form, setForm] = useState({ clientId: "", type: agreementTypes[0], title: "", description: "", expiryDate: "", file: null });
  const clientMap = useMemo(() => new Map(state.clients.map((client) => [client.id, client])), [state.clients]);

  useEffect(() => { if (isActive) load(); }, [isActive]);

  async function load() {
    setState((current) => ({ ...current, loading: true, error: "", success: "" }));
    const [agreements, clients] = await Promise.all([
      supabase.from("client_agreements").select("*, agreement_versions(*)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name, organisation, email").order("full_name"),
    ]);
    const error = agreements.error || clients.error;
    setState((current) => ({ ...current, loading: false, error: error?.message || "", agreements: agreements.data || [], clients: clients.data || [] }));
  }

  async function createAgreement(event) {
    event.preventDefault();
    if (!form.file || !form.clientId) return;
    setState((current) => ({ ...current, saving: true, error: "", success: "" }));
    const created = await supabase.from("client_agreements").insert({
      client_id: form.clientId, agreement_type: form.type, title: form.title.trim(),
      description: form.description.trim() || null, expires_at: form.expiryDate ? new Date(`${form.expiryDate}T23:59:59`).toISOString() : null,
      created_by: profile?.id || null,
    }).select().single();
    if (created.error) return setState((current) => ({ ...current, saving: false, error: created.error.message }));
    const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${form.clientId}/${created.data.id}/v1-${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("client-agreements").upload(path, form.file, { upsert: false });
    if (upload.error) return setState((current) => ({ ...current, saving: false, error: `Agreement created, but upload failed: ${upload.error.message}` }));
    const version = await supabase.from("agreement_versions").insert({
      agreement_id: created.data.id, client_id: form.clientId, version_number: 1,
      file_name: form.file.name, file_size: form.file.size, mime_type: form.file.type || "application/pdf",
      storage_path: path, uploaded_by: profile?.id || null,
    });
    if (version.error) return setState((current) => ({ ...current, saving: false, error: version.error.message }));
    setForm({ clientId: "", type: agreementTypes[0], title: "", description: "", expiryDate: "", file: null });
    await load();
    setState((current) => ({ ...current, saving: false, success: "Draft agreement created." }));
  }

  async function issue(agreement) {
    const { error } = await supabase.rpc("issue_client_agreement", { target_agreement_id: agreement.id });
    if (error) setState((current) => ({ ...current, error: error.message, success: "" })); else { await load(); setState((current) => ({ ...current, success: "Agreement issued to the client." })); }
  }

  async function revise(agreement, file) {
    if (!file) return;
    const nextVersion = Math.max(0, ...(agreement.agreement_versions || []).map((item) => item.version_number)) + 1;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${agreement.client_id}/${agreement.id}/v${nextVersion}-${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("client-agreements").upload(path, file, { upsert: false });
    if (upload.error) return setState((current) => ({ ...current, error: upload.error.message, success: "" }));
    const { error } = await supabase.rpc("add_agreement_version", {
      target_agreement_id: agreement.id, new_file_name: file.name, new_file_size: file.size,
      new_mime_type: file.type || "application/pdf", new_storage_path: path,
    });
    if (error) setState((current) => ({ ...current, error: error.message, success: "" })); else { await load(); setState((current) => ({ ...current, success: `Version ${nextVersion} uploaded as a new draft.` })); }
  }

  async function remind(agreement) {
    const { error } = await supabase.rpc("record_agreement_reminder", { target_agreement_id: agreement.id });
    if (error) setState((current) => ({ ...current, error: error.message, success: "" })); else { await load(); setState((current) => ({ ...current, success: "Reminder recorded for follow-up." })); }
  }

  return <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Legal workflow</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Contracts & Digital Approval</h2><p className="mt-2 text-sm font-semibold text-slate-600">Create, version, issue and monitor client agreements.</p></div><button onClick={load} className="inline-flex items-center justify-center rounded-full border border-cyan-200 px-5 py-3 text-sm font-black"><RefreshCw size={16} className="mr-2" />Refresh</button></div>
    {state.error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}{state.success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{state.success}</p>}
    <form onSubmit={createAgreement} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5 md:grid-cols-2">
      <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="rounded-xl border border-slate-200 p-3 text-sm font-bold"><option value="">Select client</option>{state.clients.map((client) => <option key={client.id} value={client.id}>{client.organisation || client.full_name || client.email}</option>)}</select>
      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-slate-200 p-3 text-sm font-bold">{agreementTypes.map((type) => <option key={type}>{type}</option>)}</select>
      <input required placeholder="Agreement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border border-slate-200 p-3 text-sm font-semibold" />
      <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="rounded-xl border border-slate-200 p-3 text-sm font-semibold" />
      <textarea rows="3" placeholder="Agreement summary or internal context" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-slate-200 p-3 text-sm font-semibold md:col-span-2" />
      <label className="flex items-center rounded-xl border border-dashed border-cyan-300 bg-white p-3 text-sm font-bold md:col-span-2"><UploadCloud size={18} className="mr-2 text-[#0B7CFF]" /><input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /></label>
      <button disabled={state.saving} className="inline-flex items-center justify-center rounded-xl bg-[#0B7CFF] px-4 py-3 text-sm font-black text-white md:col-span-2">{state.saving ? <Loader2 size={17} className="mr-2 animate-spin" /> : <FilePlus2 size={17} className="mr-2" />}Create draft agreement</button>
    </form>
    <div className="mt-6 grid gap-4">{state.loading ? <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" /> : state.agreements.map((agreement) => { const client = clientMap.get(agreement.client_id); const versions = [...(agreement.agreement_versions || [])].sort((a, b) => b.version_number - a.version_number); return <article key={agreement.id} className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between"><div><p className="text-xs font-black uppercase text-[#0B7CFF]">{agreement.agreement_number} · {agreement.agreement_type}</p><h3 className="mt-2 text-lg font-black">{agreement.title}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{client?.organisation || client?.full_name || "Client"} · Version {agreement.current_version || 1}</p></div><span className="h-fit rounded-full bg-[#061A33] px-4 py-2 text-xs font-black uppercase text-cyan-200">{agreement.status}</span></div>
      <div className="mt-4 flex flex-wrap gap-2">{agreement.status === "draft" && <button onClick={() => issue(agreement)} className="inline-flex items-center rounded-xl bg-[#0B7CFF] px-4 py-2 text-sm font-black text-white"><Send size={15} className="mr-2" />Issue agreement</button>}{["sent", "viewed"].includes(agreement.status) && <button onClick={() => remind(agreement)} className="inline-flex items-center rounded-xl bg-amber-100 px-4 py-2 text-sm font-black text-amber-900"><BellRing size={15} className="mr-2" />Record reminder</button>}<label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-black"><UploadCloud size={15} className="mr-2" />Upload revision<input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => revise(agreement, e.target.files?.[0])} /></label></div>
      <p className="mt-3 text-xs font-bold text-slate-500">{versions.length} version(s) · Expires: {formatDate(agreement.expires_at)} · Reminders: {agreement.reminder_count || 0}</p>
      {agreement.signer_name && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{agreement.status === "accepted" ? "Accepted" : "Declined"} by {agreement.signer_name}{agreement.signer_position ? `, ${agreement.signer_position}` : ""} on {formatDate(agreement.decided_at)}.</p>}
    </article>; })}</div>
  </section>;
}

function formatDate(value) { return value ? new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Not set"; }
