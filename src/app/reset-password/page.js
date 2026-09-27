"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const identifier = params.get("identifier") || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset password.");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
      <Navbar />

      <main className="mx-auto w-full max-w-md px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-black">Reset Password</h1>
          <p className="mt-3 text-sm text-slate-600">Set a new password for {identifier || "your account"}.</p>

          {error && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border-b border-black/30 pb-2 outline-none focus:border-black"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border-b border-black/30 pb-2 outline-none focus:border-black"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="h-[52px] w-full rounded bg-[#DB4444] font-medium text-white hover:bg-[#e03a3a] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-slate-600">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
