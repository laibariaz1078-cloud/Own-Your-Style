"use client";

import { Phone, Mail } from "lucide-react";
import { useState } from "react";
import { showModal } from "../lib/modal";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Unable to send your message.");

      await showModal({ variant: "success", title: "Message sent", message: "We will get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      await showModal({ title: "Message failed", message: error.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-10">
      {/* Breadcrumb Navigation */}
      

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Contact Information Card */}
        <div className="flex flex-col gap-8 rounded-sm bg-white p-8 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)]">
          {/* Call To Us Section */}
          <div className="flex flex-col gap-4 border-b border-black/20 pb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB4444] text-white">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-black">Call To Us</h3>
            </div>
            <p className="text-sm font-normal text-black">
              We are available 24/7, 7 days a week.
            </p>
            <p className="text-sm font-normal text-black">
              Phone: +8801611112222
            </p>
          </div>

          {/* Write To Us Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB4444] text-white">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-black">Write To US</h3>
            </div>
            <p className="text-sm font-normal text-black">
              Fill out our form and we will contact you within 24 hours.
            </p>
            <p className="text-sm font-normal text-black">
              Emails: customer@exclusive.com
            </p>
            <p className="text-sm font-normal text-black">
              Emails: support@exclusive.com
            </p>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 rounded-sm bg-white p-8 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)] lg:col-span-2"
        >
          {/* Input Fields Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your Name *"
                className="w-full rounded bg-[#F5F5F5] px-4 py-3.5 text-sm font-normal text-black outline-none placeholder:text-black/50"
              />
            </div>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Your Email *"
                className="w-full rounded bg-[#F5F5F5] px-4 py-3.5 text-sm font-normal text-black outline-none placeholder:text-black/50"
              />
            </div>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Your Phone *"
                className="w-full rounded bg-[#F5F5F5] px-4 py-3.5 text-sm font-normal text-black outline-none placeholder:text-black/50"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            placeholder="Your Massage"
            rows={7}
            className="w-full resize-none rounded bg-[#F5F5F5] p-4 text-sm font-normal text-black outline-none placeholder:text-black/50"
          />

          {/* Send Message Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              aria-busy={isSending}
              className="rounded bg-[#DB4444] px-12 py-4 text-base font-medium text-white transition-colors duration-200 hover:bg-[#e03a3a] active:scale-95"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}