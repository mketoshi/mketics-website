import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, RefreshCw, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientMessages({ clients, profile }) {
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState("");
  const [form, setForm] = useState({ subject: "", body: "" });
  const [state, setState] = useState({ loading: false, sending: false, error: "", success: "" });
  const clientId = clients?.[0]?.id || "";

  const conversations = useMemo(() => {
    const grouped = new Map();
    messages.forEach((message) => {
      const current = grouped.get(message.conversation_id) || [];
      current.push(message);
      grouped.set(message.conversation_id, current);
    });
    return Array.from(grouped.entries())
      .map(([id, items]) => ({
        id,
        subject: items[0]?.subject || "Client message",
        messages: items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        latest: items.at(-1),
      }))
      .sort((a, b) => new Date(b.latest.created_at) - new Date(a.latest.created_at));
  }, [messages]);

  const activeConversation = conversations.find((item) => item.id === selectedConversation);

  useEffect(() => {
    if (clientId) fetchMessages();
  }, [clientId]);

  useEffect(() => {
    if (!selectedConversation && conversations.length) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  async function fetchMessages() {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const { data, error } = await supabase
        .from("client_messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error?.message || "Unable to load messages." }));
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!clientId || !form.body.trim()) return;
    try {
      setState({ loading: false, sending: true, error: "", success: "" });
      const conversationId = activeConversation?.id || crypto.randomUUID();
      const subject = activeConversation?.subject || form.subject.trim() || "Message from client";
      const { data, error } = await supabase
        .from("client_messages")
        .insert({
          conversation_id: conversationId,
          client_id: clientId,
          sender_profile_id: profile.id,
          sender_role: "client",
          subject,
          body: form.body.trim(),
          status: "sent",
        })
        .select("*")
        .single();
      if (error) throw error;
      setMessages((current) => [...current, data]);
      setSelectedConversation(conversationId);
      setForm({ subject: "", body: "" });
      setState({ loading: false, sending: false, error: "", success: "Message sent to MKETICS." });
    } catch (error) {
      setState({ loading: false, sending: false, error: error?.message || "Unable to send message.", success: "" });
    }
  }

  function startConversation() {
    setSelectedConversation("");
    setForm({ subject: "", body: "" });
    setState((current) => ({ ...current, error: "", success: "" }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">Direct messaging</p>
            <h3 className="mt-2 text-xl font-black text-[#020B1F]">Conversations</h3>
          </div>
          <button type="button" onClick={fetchMessages} className="rounded-full bg-[#EAF6FF] p-3 text-[#0B7CFF]" aria-label="Refresh messages">
            <RefreshCw size={17} className={state.loading ? "animate-spin" : ""} />
          </button>
        </div>
        <button type="button" onClick={startConversation} className="mt-5 w-full rounded-full bg-[#061A33] px-5 py-3 text-sm font-black text-white">
          New conversation
        </button>
        <div className="mt-4 grid gap-2">
          {conversations.map((conversation) => (
            <button key={conversation.id} type="button" onClick={() => setSelectedConversation(conversation.id)}
              className={`rounded-2xl border p-4 text-left ${selectedConversation === conversation.id ? "border-cyan-300 bg-[#EAF6FF]" : "border-slate-200"}`}>
              <p className="font-black text-[#061A33]">{conversation.subject}</p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">{conversation.latest.body}</p>
            </button>
          ))}
          {!state.loading && conversations.length === 0 && <p className="py-8 text-center text-sm font-bold text-slate-500">No messages yet.</p>}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-[#061A33]"><MessageCircle size={20} /></span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">MKETICS support</p>
            <h3 className="text-xl font-black text-[#020B1F]">{activeConversation?.subject || "Start a conversation"}</h3>
          </div>
        </div>

        {activeConversation && (
          <div className="mt-5 max-h-[430px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {activeConversation.messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender_role === "client" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender_role === "client" ? "bg-[#061A33] text-white" : "border border-slate-200 bg-white text-[#061A33]"}`}>
                  <p className="text-sm font-semibold leading-6">{message.body}</p>
                  <p className={`mt-2 text-[11px] font-bold ${message.sender_role === "client" ? "text-cyan-100" : "text-slate-400"}`}>
                    {message.sender_role === "client" ? "You" : "MKETICS"} · {new Date(message.created_at).toLocaleString("en-ZA")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="mt-5 grid gap-3">
          {!activeConversation && (
            <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Conversation subject" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-300" />
          )}
          <textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
            placeholder="Write your message to MKETICS..." rows={5} required className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-300" />
          {state.error && <p className="text-sm font-bold text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm font-bold text-emerald-700">{state.success}</p>}
          <button disabled={state.sending || !form.body.trim()} className="inline-flex items-center justify-center rounded-full bg-[#0B7CFF] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {state.sending ? <Loader2 size={17} className="mr-2 animate-spin" /> : <Send size={17} className="mr-2" />}
            Send message
          </button>
        </form>
      </section>
    </div>
  );
}
