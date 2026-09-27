"use client";

import { useEffect, useState } from "react";
import { showModal } from "../lib/modal";

export default function ProfileForm({ user }) {
  const [form, setForm] = useState({
    firstName: "Md",
    lastName: "Rimel",
    email: "rimel1111@gmail.com",
    address: "Kingston, 5236, United State",
  });

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setForm({
          firstName: user.firstName || "Md",
          lastName: user.lastName || "Rimel",
          email: user.email || "rimel1111@gmail.com",
          address: user.address || "Kingston, 5236, United State",
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await showModal({ variant: "success", title: "Profile saved", message: "Profile saved successfully." });
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-sm bg-white p-10 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)]"
      onSubmit={handleSubmit}
    >
      <h3 className="text-xl font-medium text-[#DB4444]">Edit Your Profile</h3>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-base text-black">First Name</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base text-black">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base text-black">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base text-black">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Password Section */}
      <div className="flex flex-col gap-4 pt-2">
        <label className="text-base text-black">Password Changes</label>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-8 pt-4">
        <button
          type="button"
          className="text-base font-normal text-black transition-colors hover:text-black/70"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-[#DB4444] px-12 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}