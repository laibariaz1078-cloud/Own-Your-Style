"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Store,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  MessageSquareWarning,
  Star,
  House,
  Tags,
  Truck,
  ClipboardCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

const menuConfig = {
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: BarChart3 },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Products", href: "/dashboard/admin/products", icon: Package },
    { label: "Vendors", href: "/dashboard/admin/vendors", icon: Truck },
    { label: "Orders", href: "/dashboard/admin/orders", icon: ShoppingCart },
    { label: "Categories", href: "/dashboard/admin/categories", icon: Tags },
    { label: "Approvals", href: "/dashboard/admin/approvals", icon: ClipboardCheck },
    { label: "Complaints", href: "/dashboard/admin/complaints", icon: MessageSquareWarning },
    { label: "Reviews", href: "/dashboard/admin/reviews", icon: Star },
    // { label: "Home", href: "/", icon: House },
  ],
  seller: [
    { label: "Overview", href: "/dashboard/seller", icon: BarChart3 },
    { label: "Products", href: "/dashboard/seller/products", icon: Package },
    { label: "Categories", href: "/dashboard/seller/categories", icon: Tags },
    { label: "My Requests", href: "/dashboard/seller/approvals", icon: ClipboardCheck },
    { label: "Orders", href: "/dashboard/seller/orders", icon: ShoppingCart },
    { label: "Complaints", href: "/dashboard/seller/complaints", icon: MessageSquareWarning },
    { label: "Reviews", href: "/dashboard/seller/reviews", icon: Star },
    // { label: "Home", href: "/", icon: House },
  ],
  vendor: [
    { label: "Overview", href: "/dashboard/vendor", icon: BarChart3 },
    { label: "Messages", href: "/dashboard/vendor/messages", icon: MessageSquareWarning },
  ],
  buyer: [
    { label: "Overview", href: "/dashboard/customer", icon: BarChart3 },
    { label: "My Orders", href: "/dashboard/customer/orders", icon: ShoppingCart },
    { label: "My Complaints", href: "/dashboard/customer/complaints", icon: MessageSquareWarning },
    { label: "My Reviews", href: "/dashboard/customer/reviews", icon: Star },
    { label: "Home", href: "/", icon: House },
  ],
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAppContext();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await response.json();
        if (data.success && data.user?.role) {
          setUserRole(data.user.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, []);

  const roleFromPath = pathname?.startsWith("/dashboard/admin")
    ? "admin"
    : pathname?.startsWith("/dashboard/seller")
      ? "seller"
      : pathname?.startsWith("/dashboard/vendor")
        ? "vendor"
      : pathname?.startsWith("/dashboard/customer")
          ? "buyer"
        : null;

        const resolvedRole = roleFromPath || userRole || "buyer";
        const menu = menuConfig[resolvedRole] || menuConfig.buyer;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const roleBadge = {
    admin: { label: "Admin Panel", icon: ShieldCheck, color: "border-white/15 bg-white/10 text-white" },
    seller: { label: "Seller Hub", icon: Store, color: "border-white/15 bg-white/10 text-white" },
    vendor: { label: "Vendor Portal", icon: Truck, color: "border-white/15 bg-white/10 text-white" },
    buyer: { label: "Buyer Portal", icon: UserCheck, color: "border-white/15 bg-white/10 text-white" },
  }[resolvedRole];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#DB4444] text-white shadow-lg shadow-red-900/30 transition-transform hover:scale-105 lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-x-0 top-0 z-40 flex h-dvh min-h-screen w-72 flex-col justify-between bg-gradient-to-b from-[#c22626] to-[#8f1414] p-5 text-slate-200 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 lg:rounded-r-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <Link href="/" className="mb-5 block shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-[#DB4444] shadow-md">
                E
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Exclusive</span>
            </div>
          </Link>

          <div className="mb-5 shrink-0">
            <div className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm ${roleBadge.color}`}>
              <roleBadge.icon size={14} />
              <span>{roleBadge.label}</span>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-[#c22626] shadow-md"
                      : "text-red-100/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-4 shrink-0 border-t border-white/15 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-100/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>
    </>
  );
}