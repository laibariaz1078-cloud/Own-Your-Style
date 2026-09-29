"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import TopBar from "../../components/TopBar";

import AuthLayout from "../../components/AuthLayout";
import LoginNotice from "../../components/LoginNotice";
import { hasValidRecaptchaConfig } from "../../lib/recaptcha";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
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
    setError("");

    try {
      if (!recaptchaBypassEnabled && recaptchaEnabled && !captchaToken) {
        throw new Error("Please complete the reCAPTCHA challenge before creating your account.");
      }

      const firstName = String(form.firstName || "").trim();
      const lastName = String(form.lastName || "").trim();
      const email = String(form.email || "").trim();
      const phone = String(form.phone || "").trim();
      const password = String(form.password || "");
      const role = form.role === "seller" ? "seller" : "buyer";

      if (!firstName || !lastName || !email || !password) {
        throw new Error("First name, last name, email, and password are required.");
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || "",
          password,
          role,
          captchaToken,
        }),
        credentials: "include",
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Signup failed (${response.status}).`);
        }
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Signup failed.");
      }

      if (recaptchaEnabled && window.grecaptcha && recaptchaWidgetRef.current) {
        window.grecaptcha.reset(recaptchaWidgetRef.current);
      }
      setCaptchaToken("");

      window.dispatchEvent(new CustomEvent("auth:updated"));
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const destination = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Suspense fallback={null}>
        <LoginNotice />
      </Suspense>
      <TopBar />
  

      <AuthLayout>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <h1 className="font-inter text-[36px] font-medium tracking-[0.04em] text-black">
            Create an account
          </h1>
          <p className="mt-4 font-poppins text-[16px] text-black">
            Enter your details below
          </p>

          {error && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-10 flex flex-col gap-8">
            <div className="grid gap-8 md:grid-cols-2">
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="border-b border-black/30 pb-2 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
              />
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="border-b border-black/30 pb-2 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
              />
            </div>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="border-b border-black/30 pb-2 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
            />

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number (optional)"
              className="border-b border-black/30 pb-2 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="border-b border-black/30 pb-2 font-poppins text-[16px] text-black outline-none placeholder:text-black/40 focus:border-black"
            />

            <div className="">
              <label className="mb-3 block text-sm font-medium text-black">Account Type</label>
              <div className="flex gap-6">
                {[
                  { value: "buyer", label: "Buyer" },
                  { value: "seller", label: "Seller" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={form.role === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#DB4444]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {recaptchaSiteKey && (
            <div className="mt-6 flex justify-start">
              <div ref={recaptchaRef} />
            </div>
          )}

          <div className="mt-5 flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded bg-[#DB4444] font-poppins text-[16px] font-medium text-white transition-colors hover:bg-[#e03a3a] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <a
              href="/api/auth/google"
              className="flex h-14 w-full items-center justify-center gap-4 rounded border border-black/30 font-poppins text-[16px] text-black transition-colors hover:bg-gray-50"
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
              Sign up with Google
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 font-poppins text-[16px] text-black/60">
            <span>Already have account?</span>
            <Link
              href="/login"
              className="font-medium text-black border-b border-black/50 pb-0.5 hover:border-black"
            >
              Log in
            </Link>
          </div>
        </form>
      </AuthLayout>

    </div>
  );
}