"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TopBar from "../../components/TopBar";

import AuthLayout from "../../components/AuthLayout";
import StatusModal from "../../components/StatusModal";
import { hasValidRecaptchaConfig } from "../../lib/recaptcha";
import { useAppContext } from "../../context/AppContext";

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    {open ? (
      <>
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
          stroke="#00000066"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3" stroke="#00000066" strokeWidth="1.6" />
      </>
    ) : (
      <>
        <path
          d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M6.1 6.1C3.6 7.8 2 10 1 12c0 0 4 7 11 7 2 0 3.7-.5 5.1-1.3M9.9 4.24C10.6 4.08 11.28 4 12 4c7 0 11 7 11 7-.5.9-1.4 2.2-2.6 3.5"
          stroke="#00000066"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAppContext();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);
  const recaptchaWidgetRef = useRef(null);
  const recaptchaBypassEnabled = ["1", "true", "yes", "on"].includes(
    String(process.env.NEXT_PUBLIC_RECAPTCHA_DEV_BYPASS ?? "").trim().toLowerCase()
  );
  const recaptchaSiteKey = recaptchaBypassEnabled
    ? ""
    : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const recaptchaEnabled = !recaptchaBypassEnabled && hasValidRecaptchaConfig(recaptchaSiteKey);

  // Status modal (shows both error and success messages)
  const [status, setStatus] = useState({ open: false, type: "error", title: "", message: "" });

  // Forgot password modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [resetMethod, setResetMethod] = useState("email");
  const [resetInput, setResetInput] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (recaptchaBypassEnabled || !recaptchaEnabled || typeof window === "undefined") return;

    const initRecaptcha = () => {
      if (!recaptchaRef.current || !window.grecaptcha) return;

      if (typeof window.grecaptcha.render !== "function") {
        if (typeof window.grecaptcha.ready === "function") {
          window.grecaptcha.ready(() => {
            if (typeof window.grecaptcha.render === "function") {
              initRecaptcha();
            }
          });
        }
        return;
      }

      if (recaptchaWidgetRef.current !== null && recaptchaWidgetRef.current !== undefined) {
        return;
      }

      recaptchaWidgetRef.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: recaptchaSiteKey,
        callback: (token) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(""),
      });
    };

    if (window.grecaptcha) {
      if (typeof window.grecaptcha.ready === "function") {
        window.grecaptcha.ready(initRecaptcha);
        return;
      }
      initRecaptcha();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.google.com/recaptcha/api.js?render=explicit"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initRecaptcha, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = initRecaptcha;
    document.body.appendChild(script);

    return () => {
      if (recaptchaWidgetRef.current && window.grecaptcha) {
        try {
          window.grecaptcha.reset(recaptchaWidgetRef.current);
        } catch {
          // ignore reset errors during teardown
        }
      }
      recaptchaWidgetRef.current = null;
    };
  }, [recaptchaBypassEnabled, recaptchaEnabled, recaptchaSiteKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!recaptchaBypassEnabled && recaptchaEnabled && !captchaToken) {
        throw new Error("Please complete the reCAPTCHA challenge before logging in.");
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe, captchaToken }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Login failed.");
      }

      if (!(await refreshSession())) {
        throw new Error("Your login could not be verified. Please try again.");
      }

      const role = data.user?.role || "buyer";
      const homeRoute = {
        admin: "/dashboard/admin",
        seller: "/dashboard/seller",
        vendor: "/dashboard/vendor",
        buyer: "/",
        
      }[role] || "/";

      setStatus({
        open: true,
        type: "success",
        title: "Welcome back!",
        message: "You've logged in successfully. Redirecting you now...",
      });

      if (recaptchaEnabled && window.grecaptcha && recaptchaWidgetRef.current) {
        window.grecaptcha.reset(recaptchaWidgetRef.current);
      }
      setCaptchaToken("");

      setTimeout(() => {
        const returnTo = searchParams.get("returnTo");
        const destination = returnTo && returnTo.startsWith("/") ? returnTo : homeRoute;
        window.dispatchEvent(new CustomEvent("auth:updated"));
        router.push(destination);
        router.refresh();
      }, 1200);
    } catch (err) {
      setStatus({
        open: true,
        type: "error",
        title: "Login failed",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: resetMethod, value: resetInput }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Code bhejne me masla hua.");

      setModalStep(2);
    } catch (err) {
      setModalError(err.message || "Kuch ghalat ho gaya.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) {
      setModalError("Meharbani karke 4 digits poore likhein.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: resetInput, code, method: resetMethod }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ghalat code hai.");

      closeModal();
      router.push(`/reset-password?identifier=${encodeURIComponent(resetInput)}`);
    } catch (err) {
      setModalError(err.message || "Code verify nahi ho saka.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalStep(1);
    setResetInput("");
    setOtp(["", "", "", ""]);
    setModalError("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
     

      <AuthLayout>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <h1 className="font-inter text-[36px] font-medium tracking-[0.04em] text-black">
            Log in to Exclusive
          </h1>
          <p className="mt-4 font-poppins text-[16px] text-black">
            Enter your details below
          </p>

          <div className="mt-10 flex flex-col gap-8">
            <input
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="Email or Phone Number"
              required
              className="border-b border-black/30 pb-2 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full border-b border-black/30 pb-2 pr-8 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-0 flex h-full items-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 font-poppins text-sm text-black/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-[#DB4444]"
              />
              Remember me
            </label>
          </div>

          {recaptchaSiteKey && (
            <div className="mt-6 flex justify-start">
              <div ref={recaptchaRef} />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="h-[56px] rounded bg-[#DB4444] px-12 font-poppins text-[16px] font-medium text-white transition-colors hover:bg-[#e03a3a] disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="font-poppins text-[16px] font-normal text-[#DB4444] transition-opacity hover:opacity-80"
            >
              Forget Password?
            </button>
          </div>

          <a
            href="/api/auth/google"
            className="mt-6 flex h-[56px] w-full items-center justify-center gap-4 rounded border border-black/30 font-poppins text-[16px] text-black transition-colors hover:bg-gray-50"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>

          <div className="mt-4 text-center">
            <p>
              Already have an account?{" "}
              <a
                href="/signup"
                className="font-poppins text-[16px] font-normal text-[#DB4444] transition-opacity hover:opacity-80"
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </AuthLayout>

      {/* Login result modal (success or error) */}
      <StatusModal
        isOpen={status.open}
        type={status.type}
        title={status.title}
        message={status.message}
        onClose={() => setStatus((s) => ({ ...s, open: false }))}
      />

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-inter text-xl font-medium text-black">
                {modalStep === 1 ? "Reset Password" : "Verify Code"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded bg-red-50 p-2 text-xs text-red-600">
                {modalError}
              </div>
            )}

            {modalStep === 1 ? (
              <form onSubmit={handleSendCode} className="mt-4 flex flex-col gap-4">
                <p className="font-poppins text-sm text-gray-600">
                  Select the method to receive your verification code and enter your email or phone number below.:
                </p>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetMethod"
                      value="email"
                      checked={resetMethod === "email"}
                      onChange={() => setResetMethod("email")}
                      className="accent-[#DB4444]"
                    />
                    <span className="font-poppins text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetMethod"
                      value="phone"
                      checked={resetMethod === "phone"}
                      onChange={() => setResetMethod("phone")}
                      className="accent-[#DB4444]"
                    />
                    <span className="font-poppins text-sm">SMS (Phone)</span>
                  </label>
                </div>

                <input
                  type={resetMethod === "email" ? "email" : "tel"}
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  placeholder={
                    resetMethod === "email"
                      ? "Enter your email"
                      : "Enter phone number"
                  }
                  required
                  className="w-full border-b border-black/30 pb-2 font-poppins text-sm outline-none focus:border-black"
                />

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="mt-4 h-[48px] w-full rounded bg-[#DB4444] font-poppins font-medium text-white hover:bg-[#e03a3a] disabled:opacity-50"
                >
                  {modalLoading ? "Sending Code..." : "Send Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="mt-4 flex flex-col gap-4">
                <p className="font-poppins text-sm text-gray-600">
                  Humne 4-digit verification code{" "}
                  <span className="font-semibold">{resetInput}</span> par bhej diya hai.
                </p>

                <div className="my-4 flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, idx)}
                      onFocus={(e) => e.target.select()}
                      className="h-12 w-12 rounded border border-gray-300 text-center font-inter text-xl font-bold focus:border-[#DB4444] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="h-[48px] w-full rounded bg-[#DB4444] font-poppins font-medium text-white hover:bg-[#e03a3a] disabled:opacity-50"
                >
                  {modalLoading ? "Verifying..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className="text-center font-poppins text-xs text-gray-500 hover:underline"
                >
                  Method / Number badlein
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </div>
  );
}