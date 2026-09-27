"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import ChangePasswordModal from "./ChangePasswordModal"; // for User Icon

export default function AccountProfileForm() {
  const { user, refreshSession } = useAppContext(); // user ke liye session ko refresh karne ke liye useAppContext se user aur refreshSession ko destructure kiya gaya hai
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const firstNameValue = firstName || user?.firstName || "";
  const lastNameValue = lastName || user?.lastName || "";
  const emailValue = email || user?.email || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!firstNameValue || !lastNameValue || !emailValue) {
      setError("First name, last name and email are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }, //extra information meta info 
        credentials: "include",
        body: JSON.stringify({ firstName: firstNameValue, lastName: lastNameValue, email: emailValue }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      await refreshSession();
      setSuccess("Profile updated successfully");
      setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-2xl rounded-md border border-gray-200 p-8 shadow-sm">
      <h3 className="text-lg font-medium text-[#DB4444]">Edit Your Profile</h3>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-black/70">First Name</label>
            <input
              type="text"
              value={firstNameValue}
              onChange={(event) => setFirstName(event.target.value)}
              disabled={loading} // bg mein data load hn ra hn tu loading state mein disable kr do
              className="rounded-sm bg-gray-100 px-4 py-3 text-sm outline-none transition-colors focus:bg-gray-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-black/70">Last Name</label>
            <input
              type="text"
              value={lastNameValue}
              onChange={(event) => setLastName(event.target.value)}
              disabled={loading}
              className="rounded-sm bg-gray-100 px-4 py-3 text-sm outline-none transition-colors focus:bg-gray-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-black/70">Email</label>
          <input
            type="email"
            value={emailValue}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            className="rounded-sm bg-gray-100 px-4 py-3 text-sm outline-none transition-colors focus:bg-gray-50"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="text-sm font-medium text-black/70 underline underline-offset-4 transition-colors hover:text-[#DB4444]"
          >
            Change Password
          </button>
        </div>

        {error && ( // conditional and chaining 
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

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-black transition-colors hover:text-[#DB4444]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-sm bg-[#DB4444] px-8 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}

// Destruction of user and refreshSession from useAppContext is done to access the current user's information and to refresh the session after updating the profile. The component manages state for form fields, loading, error, and success messages, and handles form submission to update the user's profile via an API call. It also includes a modal for changing the password.
//credentials mein omit keh koi cookie na bhejo 
// same-origin agr api aur website ek hi server hn tu bhejo 
// include hr haal mein bhejo 