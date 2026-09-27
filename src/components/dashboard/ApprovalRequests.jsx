"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, X } from "lucide-react";

function requestTitle(request) {
  const name = request.payload?.name || request.payload?.title || `${request.entityType} ${request.targetId || ""}`;
  return `${request.operation} ${name}`;
}

export default function ApprovalRequests({ role }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    try {
      const response = await fetch("/api/dashboard/approvals", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load approval requests");
      setRequests(data.requests || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, []);

  const action = async (id, actionName) => {
    setWorkingId(id);
    setError("");
    try {
      const response = await fetch(`/api/dashboard/approvals/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to process request");
      setRequests((previous) => previous.map((request) => request._id === id ? data.request : request));
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setWorkingId(null);
    }
  };

  const pendingCount = requests.filter((request) => request.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6">
        <p className="text-xs font-semibold text-[#DB4444]">Workflow</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{role === "admin" ? "Approval requests" : "My requests"}</h1>
        <p className="mt-2 text-sm text-slate-500">{role === "admin" ? `${pendingCount} request${pendingCount === 1 ? "" : "s"} waiting for review.` : "Seller changes stay pending until an admin approves them."}</p>
      </div>
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading requests...</div> : requests.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No approval requests yet.</div> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {requests.map((request) => (
            <div key={request._id} className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
              <div><div className="flex items-center gap-2"><Clock3 size={16} className={request.status === "pending" ? "text-amber-500" : "text-slate-400"} /><p className="font-semibold capitalize text-slate-900">{requestTitle(request)}</p></div><p className="mt-1 text-xs text-slate-500">{request.entityType} · {new Date(request.createdAt).toLocaleString()}{role === "admin" && request.requestedBy ? ` · ${request.requestedBy.firstName || request.requestedBy.storeName || "Seller"}` : ""}</p></div>
              <div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${request.status === "pending" ? "bg-amber-50 text-amber-700" : request.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{request.status}</span>{request.status === "pending" && role === "admin" && <><button disabled={workingId === request._id} onClick={() => action(request._id, "approve")} className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Check size={13} /> Approve</button><button disabled={workingId === request._id} onClick={() => action(request._id, "dismiss")} className="flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"><X size={13} /> Dismiss</button></>}{request.status === "pending" && role === "seller" && <button disabled={workingId === request._id} onClick={() => action(request._id, "cancel")} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">Undo request</button>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
