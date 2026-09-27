"use client";

import { Bell, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DashboardTopbar() {
  const [user, setUser] = useState({ name: "Guest", role: "", avatarUrl: "" });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await response.json();
        if (data?.success && data.user) {
          const firstName = data.user.firstName || "";
          const lastName = data.user.lastName || "";
          const fullName = [firstName, lastName].filter(Boolean).join(" ") || data.user.name || data.user.fullName || "Guest";

          setUser({
            name: fullName,
            role: data.user.role || "",
            avatarUrl: data.user.avatarUrl || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/dashboard/notifications", { credentials: "include" });
        const data = await response.json();
        if (response.ok) setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const openNotifications = async () => {
    setShowNotifications((open) => !open);
    if (unreadCount) {
      await fetch("/api/dashboard/notifications", { method: "PATCH", credentials: "include" });
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    }
  };

  const getRoleBadge = (role) => {
    if (!role) {
      return { label: "Unknown", style: "bg-amber-100 text-amber-700" };
    }

    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "admin":
        return { label: "Admin", style: "bg-purple-100 text-purple-700" };
      case "seller":
        return { label: "Seller", style: "bg-blue-100 text-blue-700" };
      case "vendor":
        return { label: "Vendor", style: "bg-emerald-100 text-emerald-700" };
      case "buyer":
      case "customer":
        return { label: "Buyer", style: "bg-slate-100 text-slate-600" };
      default:
        return { label: "Unknown", style: "bg-amber-100 text-amber-700" };
    }
  };

  const currentRole = getRoleBadge(user.role);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex w-full max-w-sm items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus-within:border-[#DB4444] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#DB4444]/20">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DB4444] px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="absolute top-16 right-6 z-40 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900">Notifications</div>
              {notifications.length === 0 ? <p className="px-4 py-5 text-sm text-slate-500">No notifications yet.</p> : notifications.slice(0, 5).map((notification) => (
                <div key={notification._id} className="border-b border-slate-100 px-4 py-3 last:border-0">
                  <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{notification.message}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-4">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} width={32} height={32} unoptimized className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DB4444] text-xs font-bold text-white shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold leading-tight text-slate-800">{user.name}</p>
              <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${currentRole.style}`}>
                {currentRole.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}