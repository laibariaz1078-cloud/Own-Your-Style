"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, X } from "lucide-react";

export default function ModalHost() {
  const [request, setRequest] = useState(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const handleModal = (event) => {
      setValue(event.detail.defaultValue || "");
      setRequest(event.detail);
    };
    window.addEventListener("app:modal", handleModal);
    return () => window.removeEventListener("app:modal", handleModal);
  }, []);

  if (!request) return null;

  const isPrompt = request.type === "prompt";
  const isConfirm = request.type === "confirm";
  const isSuccess = request.variant === "success";
  const close = (result) => {
    request.resolve(result);
    setRequest(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isSuccess ? "bg-emerald-50 text-emerald-600" : isConfirm ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
              {isSuccess ? <CheckCircle2 size={22} /> : isConfirm ? <HelpCircle size={22} /> : <AlertCircle size={22} />}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{request.title || (isConfirm ? "Please confirm" : isPrompt ? "Enter a value" : isSuccess ? "Success" : "Something went wrong")}</h2>
          </div>
          <button type="button" onClick={() => close(isPrompt ? null : false)} aria-label="Close dialog" className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        {request.message && <p className="mt-4 text-sm leading-6 text-slate-600">{request.message}</p>}
        {isPrompt && <input autoFocus value={value} onChange={(event) => setValue(event.target.value)} type={request.inputType || "text"} className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-[#DB4444]" />}
        <div className="mt-6 flex justify-end gap-3">
          {(isConfirm || isPrompt) && <button type="button" onClick={() => close(isPrompt ? null : false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>}
          <button type="button" onClick={() => close(isPrompt ? value : isConfirm ? true : true)} className="rounded-lg bg-[#DB4444] px-5 py-2 text-sm font-semibold text-white hover:bg-[#bf3636]">{request.confirmLabel || (isConfirm || isPrompt ? "Continue" : "OK")}</button>
        </div>
      </div>
    </div>
  );
}