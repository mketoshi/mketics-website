import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Download, Eye, FileSignature, Loader2, RefreshCw, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientContractsCentre({ clients = [], profile }) {
  const clientIds = useMemo(() => clients.map((client) => client.id).filter(Boolean), [clients]);
  const [state, setState] = useState({ loading: true, actionId: "", error: "", success: "", agreements: [] });

  useEffect(() => { load(); }, [clientIds.join("|")]);

  async function load() {
    if (!clientIds.length) return setState((current) => ({ ...current, loading: false, agreements: [] }));
    setState((current) => ({ ...current, loading: true, error: "" }));
    const { data, error } = await supabase.from("client_agreements").select("*, agreement_versions(*)").in("client_id", clientIds).neq("status", "draft").order("created_at", { ascending: false });
    setState((current) => ({ ...current, loading: false, agreements: data || [], error: error?.message || "" }));
  }

  async function openAgreement(agreement) {
    setState((current) => ({ ...current, actionId: agreement.id, error: "", success: "" }));
    const versions = [...(agreement.agreement_versions || [])].sort((a, b) => b.version_number - a.version_number);
    const current = versions.find((item) => item.version_number === agreement.current_version) || versions[0];
    if (!current) return setState((value) => ({ ...value, actionId: "", error: "Agreement file is unavailable." }));
    if (agreement.status === "sent") await supabase.rpc("mark_agreement_viewed", { target_agreement_id: agreement.id });
    const { data, error } = await supabase.storage.from("client-agreements").createSignedUrl(current.storage_path, 600);
    if (error) return setState((value) => ({ ...value, actionId: "", error: error.message }));
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    await load();
    setState((value) => ({ ...value, actionId: "" }));
  }

  async function decide(agreement, decision) {
    const signerName = window.prompt("Enter your full legal name:", profile?.full_name || "");
    if (!signerName?.trim()) return;
    const signerPosition = window.prompt("Enter your position or capacity (for example: Director):", "");
    if (signerPosition === null) return;
    const comments = window.prompt(decision === "accepted" ? "Optional approval comments:" : "Please explain why you are declining:", "");
    if (comments === null || (decision === "declined" && !comments.trim())) return;
    if (!window.confirm(`Confirm that you want to ${decision === "accepted" ? "accept" : "decline"} this agreement digitally?`)) return;
    setState((current) => ({ ...current, actionId: agreement.id, error: "", success: "" }));
    const { error } = await supabase.rpc("decide_client_agreement", {
      target_agreement_id: agreement.id, decision_value: decision, signer_full_name: signerName.trim(),
      signer_capacity: signerPosition.trim() || null, decision_comments: comments.trim() || null,
    });
    if (error) setState((current) => ({ ...current, actionId: "", error: error.message })); else { await load(); setState((current) => ({ ...current, actionId: "", success: `Agreement ${decision} successfully.` })); }
  }

  return <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Secure approvals</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Contracts & Agreements</h2><p className="mt-2 text-sm font-semibold text-slate-600">Review the latest version and record your formal decision.</p></div><button onClick={load} className="inline-flex items-center justify-center rounded-full border border-cyan-200 px-5 py-3 text-sm font-black"><RefreshCw size={16} className="mr-2" />Refresh</button></div>
    {state.error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}{state.success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{state.success}</p>}
    <div className="mt-6 grid gap-4">{state.loading ? <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" /> : state.agreements.length === 0 ? <p className="rounded-2xl bg-[#F8FCFF] p-6 text-center text-sm font-bold text-slate-500">No agreements require your attention.</p> : state.agreements.map((agreement) => <article key={agreement.id} className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between"><div><p className="text-xs font-black uppercase text-[#0B7CFF]">{agreement.agreement_number} · {agreement.agreement_type}</p><h3 className="mt-2 text-lg font-black">{agreement.title}</h3><p className="mt-2 text-sm font-semibold text-slate-600">{agreement.description || "Please review the agreement document before responding."}</p></div><span className="h-fit rounded-full bg-[#061A33] px-4 py-2 text-xs font-black uppercase text-cyan-200">{agreement.status}</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><Info icon={FileSignature} label="Current version" value={`Version ${agreement.current_version || 1}`} /><Info icon={Clock3} label="Issued" value={formatDate(agreement.sent_at)} /><Info icon={Clock3} label="Expires" value={formatDate(agreement.expires_at)} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><button disabled={state.actionId === agreement.id} onClick={() => openAgreement(agreement)} className="inline-flex items-center rounded-xl bg-[#0B7CFF] px-4 py-2 text-sm font-black text-white">{agreement.status === "accepted" ? <Download size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}Open agreement</button>{["sent", "viewed"].includes(agreement.status) && <><button onClick={() => decide(agreement, "accepted")} className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"><CheckCircle2 size={16} className="mr-2" />Accept digitally</button><button onClick={() => decide(agreement, "declined")} className="inline-flex items-center rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-700"><XCircle size={16} className="mr-2" />Decline</button></>}</div>
      {agreement.signer_name && <p className="mt-4 rounded-xl bg-[#F8FCFF] p-3 text-sm font-bold">Decision recorded for {agreement.signer_name}{agreement.signer_position ? ` (${agreement.signer_position})` : ""} on {formatDate(agreement.decided_at)}.{agreement.decision_comments ? ` Comment: ${agreement.decision_comments}` : ""}</p>}
    </article>)}</div>
  </section>;
}

function Info({ icon: Icon, label, value }) { return <div className="rounded-xl bg-[#F8FCFF] p-3"><Icon size={16} className="text-[#0B7CFF]" /><p className="mt-2 text-[10px] font-black uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>; }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Not set"; }
