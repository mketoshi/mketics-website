import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, RefreshCw, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientMessagesDashboard({ isActive, profile }) {
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  const [state, setState] = useState({ loading: false, sending: false, error: "", success: "" });

  const conversations = useMemo(() => {
    const grouped = new Map();
    messages.forEach((message) => {
      const current = grouped.get(message.conversation_id) || [];
      current.push(message);
      grouped.set(message.conversation_id, current);
    });
    return Array.from(grouped.entries()).map(([id, items]) => ({
      id,
      clientId: items[0].client_id,
      subject: items[0].subject,
      messages: items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      latest: items.at(-1),
    })).sort((a, b) => new Date(b.latest.created_at) - new Date(a.latest.created_at));
  }, [messages]);
  const selected = conversations.find((item) => item.id === selectedId);

  useEffect(() => { if (isActive) fetchMessages(); }, [isActive]);
  useEffect(() => { if (!selectedId && conversations.length) setSelectedId(conversations[0].id); }, [conversations, selectedId]);

  async function fetchMessages() {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const [messagesResult, clientsResult] = await Promise.all([
        supabase.from("client_messages").select("*").order("created_at", { ascending: true }),
        supabase.from("clients").select("id, full_name, email, organisation"),
      ]);
      if (messagesResult.error) throw messagesResult.error;
      if (clientsResult.error) throw clientsResult.error;
      setMessages(messagesResult.data || []);
      setClients(Object.fromEntries((clientsResult.data || []).map((client) => [client.id, client])));
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error?.message || "Unable to load client messages." }));
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    try {
      setState({ loading: false, sending: true, error: "", success: "" });
      const { data, error } = await supabase.from("client_messages").insert({
        conversation_id: selected.id,
        client_id: selected.clientId,
        sender_profile_id: profile.id,
        sender_role: "admin",
        subject: selected.subject,
        body: reply.trim(),
        status: "sent",
      }).select("*").single();
      if (error) throw error;
      setMessages((current) => [...current, data]);
      setReply("");
      setState({ loading: false, sending: false, error: "", success: "Reply sent to the client." });
    } catch (error) {
      setState({ loading: false, sending: false, error: error?.message || "Unable to send reply.", success: "" });
    }
  }

  if (!isActive) return null;
  return (
    <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Step 73</p><h2 className="mt-2 text-2xl font-black text-[#020B1F]">Client Messages</h2></div>
          <button type="button" onClick={fetchMessages} className="rounded-full bg-[#EAF6FF] p-3 text-[#0B7CFF]"><RefreshCw size={17} className={state.loading ? "animate-spin" : ""} /></button>
        </div>
        <div className="mt-5 grid gap-2">
          {conversations.map((conversation) => {
            const client = clients[conversation.clientId];
            return <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)}
              className={`rounded-2xl border p-4 text-left ${selectedId === conversation.id ? "border-cyan-300 bg-[#EAF6FF]" : "border-slate-200"}`}>
              <p className="font-black text-[#061A33]">{conversation.subject}</p>
              <p className="mt-1 text-xs font-bold text-[#0B7CFF]">{client?.organisation || client?.full_name || "Client"}</p>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-500">{conversation.latest.body}</p>
            </button>;
          })}
          {!state.loading && !conversations.length && <p className="py-8 text-center text-sm font-bold text-slate-500">No client conversations yet.</p>}
        </div>
      </aside>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        {!selected ? (
          <div className="grid min-h-[360px] place-items-center text-center"><div><MessageCircle className="mx-auto text-[#0B7CFF]" size={34}/><p className="mt-3 font-black text-slate-500">Select a client conversation.</p></div></div>
        ) : (
          <>
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">{clients[selected.clientId]?.email || "Client conversation"}</p><h3 className="mt-2 text-2xl font-black text-[#020B1F]">{selected.subject}</h3></div>
            <div className="mt-5 max-h-[460px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
              {selected.messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_role === "client" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender_role === "client" ? "border border-slate-200 bg-white" : "bg-[#061A33] text-white"}`}>
                    <p className="text-sm font-semibold leading-6">{message.body}</p>
                    <p className="mt-2 text-[11px] font-bold opacity-60">{message.sender_role === "client" ? "Client" : "MKETICS"} · {new Date(message.created_at).toLocaleString("en-ZA")}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendReply} className="mt-5 grid gap-3">
              <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} required placeholder="Write an admin reply..."
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-300" />
              {state.error && <p className="text-sm font-bold text-red-600">{state.error}</p>}
              {state.success && <p className="text-sm font-bold text-emerald-700">{state.success}</p>}
              <button disabled={state.sending || !reply.trim()} className="inline-flex items-center justify-center rounded-full bg-[#0B7CFF] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                {state.sending ? <Loader2 size={17} className="mr-2 animate-spin"/> : <Send size={17} className="mr-2"/>}Reply to client
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
