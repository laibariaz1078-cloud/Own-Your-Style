"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";

export default function VendorMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/vendor/messages", { credentials: "include" }).then((response) => response.json()).then((data) => {
      if (data.success) setMessages(data.messages || []); else setError(data.error || "Unable to load messages");
    }).catch(() => setError("Unable to load messages"));
  }, []);

  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const response = await fetch("/api/dashboard/vendor/messages", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: draft }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Unable to send message");
    setMessages((current) => [...current, data.message]);
    setDraft("");
  };

  return <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-6"><h1 className="text-2xl font-bold text-slate-900">Messages with admin</h1><p className="mt-1 text-sm text-slate-500">Keep payment and supply conversations in one place.</p></div>{error && <p className="m-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}<div className="min-h-96 space-y-3 p-6">{messages.map((item) => <div key={item._id} className={`max-w-[85%] rounded-xl p-3 text-sm ${item.senderRole === "vendor" ? "ml-auto bg-[#DB4444] text-white" : "bg-slate-100 text-slate-700"}`}>{item.message}<div className="mt-1 text-[10px] opacity-70">{new Date(item.createdAt).toLocaleString()}</div></div>)}</div><form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-5"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write to admin..." className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#DB4444]" /><button className="flex items-center gap-2 rounded-xl bg-[#DB4444] px-4 py-2 text-sm font-semibold text-white"><Send size={16} /> Send</button></form></div>;
}
