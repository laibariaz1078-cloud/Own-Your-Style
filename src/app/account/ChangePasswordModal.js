"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const resetAndClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword(""); // state mein new password na rahein isliye khali karon 
      setConfirmPassword("");
      setLoading(false);

      setTimeout(() => {
        resetAndClose();
      }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : resetAndClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={resetAndClose}
          disabled={loading}
          className="absolute right-5 top-5 text-gray-400 transition-colors hover:text-black disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DB4444]/10">
            <Lock className="h-6 w-6 text-[#DB4444]" />
          </div>
          <h2 className="text-xl font-semibold text-black">Change Password</h2>
          <p className="mt-1 text-sm text-black/50">
            Enter your current password and choose a new one
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-black/70">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[#DB4444] focus:bg-white"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                tabIndex={-1} // focus sirf real inputs aur buttons par jata hai
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-black/70">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[#DB4444] focus:bg-white"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)} // yeh toggle state jasia hnta hn
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-black/70">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[#DB4444] focus:bg-white"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={loading}
              className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#DB4444] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}