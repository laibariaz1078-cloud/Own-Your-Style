"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Users as UsersIcon, ShieldCheck, UserRound, Star, Ban, CheckCircle2, Clock3, Store, UserCircle2 } from "lucide-react";
import { mockUsers } from "../../mock-data";
import { showModal } from "../../../../lib/modal";

const TOP_SELLER_THRESHOLD = 50;
const TOP_BUYER_THRESHOLD = 10;

const filterOptions = [
  { value: "all", label: "All" },
  { value: "allSellers", label: "Sellers" },
  { value: "allCustomers", label: "Buyers" },
  { value: "topSellers", label: "Top sellers" },
  { value: "topBuyers", label: "Top buyers" },
  { value: "favSellers", label: "Favorite sellers" },
  { value: "favUsers", label: "Favorite users" },
];

const roleStyles = {
  buyer: "bg-blue-100 text-blue-700",
  seller: "bg-amber-100 text-amber-700",
  admin: "bg-red-100 text-red-700",
};

const avatarPalette = ["#DB4444", "#DB9E44", "#3B82F6", "#1F9D55", "#8B5CF6", "#EC4899"];

function paletteColor(id) {
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/dashboard/admin/users", { credentials: "include" });
        const data = await response.json();

        const merged = [
          ...(data.customers || []).map((user) => ({ ...user, role: "buyer" })),
          ...(data.sellers || []).map((user) => ({ ...user, role: "seller" })),
        ];

        setUsers(merged);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([
          ...mockUsers.customers.map((user) => ({ ...user, role: "buyer" })),
          ...mockUsers.sellers.map((user) => ({ ...user, role: "seller" })),
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId, name) => {
    if (!(await showModal({ type: "confirm", title: "Delete user", message: `Delete user ${name}?`, confirmLabel: "Delete" }))) return;

    try {
      const response = await fetch(`/api/dashboard/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId));
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      await showModal({ title: "Delete failed", message: "Unable to delete user right now." });
    }
  };

  const updateUserStatus = async (user, action, extra = {}) => {
    try {
      const response = await fetch(`/api/dashboard/admin/users/${user._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update user status");
      setUsers((previous) => previous.map((item) => item._id === user._id ? { ...item, ...data.user } : item));
    } catch (error) {
      await showModal({ title: "Status update failed", message: error.message });
    }
  };

  const handleStatusAction = async (user) => {
    if (user.status === "suspended") {
      updateUserStatus(user, "activate");
      return;
    }
    if (user.role === "seller") {
      if (await showModal({ type: "confirm", title: "Deactivate seller", message: `Deactivate ${user.firstName || "this seller"}?`, confirmLabel: "Deactivate" })) updateUserStatus(user, "deactivate");
      return;
    }
    const choice = (await showModal({ type: "prompt", title: "Suspension type", message: "Enter temporary or permanent.", defaultValue: "temporary" }))?.toLowerCase();
    if (choice === "permanent") {
      if (await showModal({ type: "confirm", title: "Suspend customer", message: "Permanently suspend this customer?", confirmLabel: "Suspend" })) updateUserStatus(user, "suspend_permanent");
      return;
    }
    if (choice === "temporary") {
      const duration = await showModal({ type: "prompt", title: "Temporary suspension", message: "How many days should the suspension last?", defaultValue: "15", inputType: "number" });
      if (duration !== null) updateUserStatus(user, "suspend_temporary", { durationDays: Number(duration) || 15 });
    }
  };

  const toggleFavorite = (userId) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredUsers = useMemo(() => {
    switch (filter) {
      case "allSellers":
        return users.filter((user) => user.role === "seller");
      case "allCustomers":
        return users.filter((user) => user.role === "buyer");
      case "topSellers":
        return users.filter(
          (user) => user.role === "seller" && (user.totalSales || 0) >= TOP_SELLER_THRESHOLD
        );
      case "topBuyers":
        return users.filter(
          (user) => user.role === "buyer" && (user.totalOrders || 0) >= TOP_BUYER_THRESHOLD
        );
      case "favSellers":
        return users.filter((user) => user.role === "seller" && favoriteIds.has(user._id));
      case "favUsers":
        return users.filter((user) => user.role === "buyer" && favoriteIds.has(user._id));
      default:
        return users;
    }
  }, [users, filter, favoriteIds]);

  const stats = useMemo(() => {
    const sellers = users.filter((u) => u.role === "seller").length;
    const customers = users.filter((u) => u.role === "buyer").length;
    const active = users.filter((u) => (u.status || "active") === "active").length;
    return { total: users.length, sellers, customers, active };
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-[#DB4444]">Members</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Users</h1>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <UsersIcon size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Store size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Sellers</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-700">{stats.sellers}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <UserCircle2 size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Buyers</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-700">{stats.customers}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Active</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.active}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === option.value
                  ? "bg-[#DB4444] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">Loading users...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold"></th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No users match this filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const displayName = `${user.firstName || user.name || "User"} ${user.lastName || ""}`.trim();
                  const initial = (user.firstName || user.name || "U").charAt(0).toUpperCase();
                  return (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFavorite(user._id)}
                          className="text-slate-300 hover:text-amber-400"
                        >
                          <Star
                            size={16}
                            fill={favoriteIds.has(user._id) ? "#f59e0b" : "none"}
                            className={favoriteIds.has(user._id) ? "text-amber-400" : ""}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: paletteColor(user._id) }}
                          >
                            {initial}
                          </div>
                          <span className="font-semibold text-slate-800">{displayName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[user.role] || roleStyles.customer}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {user.status || "active"}
                        </span>
                        {user.status === "suspended" && user.suspensionType === "temporary" && user.suspendedUntil && (
                          <p className="mt-1 text-xs text-slate-500">Until {new Date(user.suspendedUntil).toLocaleDateString()}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusAction(user)}
                            title={user.status === "suspended" ? "Activate" : user.role === "seller" ? "Deactivate seller" : "Suspend buyer"}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${user.status === "suspended" ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                          >
                            {user.status === "suspended" ? <CheckCircle2 size={14} /> : user.role === "buyer" ? <Clock3 size={14} /> : <Ban size={14} />}
                            {user.status === "suspended" ? "Activate" : user.role === "buyer" ? "Suspend" : "Deactivate"}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, displayName)}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: paletteColor(selectedUser._id) }}
              >
                {selectedUser.firstName?.charAt(0) || selectedUser.name?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedUser.firstName || selectedUser.name || "User"} {selectedUser.lastName || ""}
                </h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <ShieldCheck size={14} /> Role
              </div>
              <p className="text-base font-semibold text-slate-800 capitalize">{selectedUser.role}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <UserRound size={14} /> Status
              </div>
              <p className="text-base font-semibold text-slate-800 capitalize">{selectedUser.status || "active"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <UsersIcon size={14} /> Login
              </div>
              <p className="text-base font-semibold text-slate-800">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : "Not available"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}