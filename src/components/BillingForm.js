"use client";

import { useState } from "react";

export default function BillingForm({ values, onChange }) {
  const [saveInfo, setSaveInfo] = useState(true);

  const fields = [
    { label: "First Name", name: "firstName", required: true, type: "text" },
    { label: "Last Name", name: "lastName", required: true, type: "text" },
    { label: "Street Address", name: "streetAddress", required: true, type: "text" },
    { label: "Apartment, floor, etc. (optional)", name: "apartment", required: false, type: "text" },
    { label: "Town/City", name: "city", required: true, type: "text" },
    { label: "Phone Number", name: "phone", required: true, type: "tel" },
    { label: "Email Address", name: "email", required: true, type: "email" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-medium tracking-wide text-black">
        Billing Details
      </h2>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-base text-black/40">
              {field.label}
              {field.required && <span className="text-[#DB4444] ml-0.5">*</span>}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={values?.[field.name] || ""}
              onChange={(event) => onChange?.(field.name, event.target.value)}
              required={field.required}
              className="w-full rounded bg-[#F5F5F5] px-4 py-3 text-base text-black outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        ))}

        <label className="mt-2 flex cursor-pointer items-center gap-4 text-base text-black select-none">
          <input
            type="checkbox"
            checked={saveInfo}
            onChange={(e) => setSaveInfo(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 accent-[#DB4444]"
          />
          Save this information for faster check-out next time
        </label>
      </form>
    </div>
  );
}