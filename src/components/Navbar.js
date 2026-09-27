"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Menu, X, ShoppingBag, XCircle, Star, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const baseNavLinks = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
  { label: "Sign Up", href: "/signup" },
  //  { label: "Dashboard", href: "/dashboard/customer" },
];

export default function Navbar({ searchValue = "", onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef(null);
  const { isAuthenticated, user, cartCount, wishlistCount, logout } = useAppContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = baseNavLinks;
  const dashboardPath = user?.role === "admin" ? "/dashboard/admin" : user?.role === "seller" ? "/dashboard/seller" : "/dashboard/customer";
  const dashboardOrdersPath = user?.role === "admin" ? "/dashboard/admin/orders" : user?.role === "seller" ? "/dashboard/seller/orders" : "/dashboard/customer/orders";
  const dashboardComplaintsPath = user?.role === "admin" ? "/dashboard/admin/complaints" : user?.role === "seller" ? "/dashboard/seller/complaints" : "/dashboard/customer/complaints";
  const dashboardReviewsPath = user?.role === "admin" ? "/dashboard/admin/reviews" : user?.role === "seller" ? "/dashboard/seller/reviews" : "/dashboard/customer/reviews";

  const handleLogout = async () => {
    try {
      await logout();
      setAccountMenuOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="relative border-b border-gray-300 bg-white">
      <div className="page-shell flex items-center justify-between py-5">
        <Link href="/" className="text-2xl font-bold tracking-wide text-black">
          Exclusive
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-10 lg:flex text-nowrap mx-5 overflow-x-hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg text-black transition-colors hover:text-black ${
                  isActive ? "border-b border-black font-medium" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          {/* Search Box */}
          <div className="relative hidden items-center sm:flex">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              className="w-55 rounded bg-gray-100 py-2 pl-4 pr-10 text-sm outline-none placeholder:text-gray-400"
            />
            <Search className="absolute right-3 h-5 w-5 text-gray-600" />
          </div>

          {/* Action Icons */}
          <Link href="/wishlist" aria-label="Wishlist" className="relative transition-opacity hover:opacity-80">
            <Heart className="h-6 w-6 fill-transparent text-black transition-colors duration-200 hover:fill-red-500 hover:text-red-500" />
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DB4444] px-1 text-[10px] font-semibold text-white">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </span>
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative transition-opacity hover:opacity-80">
            <ShoppingCart className="h-6 w-6 text-black transition-colors duration-200 hover:text-red-500" />
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DB4444] px-1 text-[10px] font-semibold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                aria-label="Account Menu"
                className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full transition-colors ${
                  accountMenuOpen ? "bg-[#DB4444] text-white" : "text-black hover:bg-gray-100"
                }`}
              >
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.fullName || "User"} width={32} height={32} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-56 rounded-md bg-black/80 p-4 text-white shadow-lg backdrop-blur-md">
                  <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
                    {user?.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.fullName || "User"} width={32} height={32} unoptimized className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DB4444] text-xs font-bold text-white">
                        {(user?.fullName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium text-white">{user?.fullName || "User"}</p>
                      <p className="text-[10px] uppercase tracking-wide text-white/60">{user?.role || "buyer"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 font-poppins text-sm">
                    <Link href="/account" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                      <User className="h-5 w-5" />
                      <span>Manage My Account</span>
                    </Link>

                    <Link href={dashboardPath} onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                      <ShoppingBag className="h-5 w-5" />
                      <span>{user?.role === "admin" ? "Admin Dashboard" : user?.role === "seller" ? "Seller Dashboard" : "Buyer Dashboard"}</span>
                    </Link>

                    <Link href={dashboardOrdersPath} onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                      <ShoppingBag className="h-5 w-5" />
                      <span>{user?.role === "admin" ? "Orders" : user?.role === "seller" ? "My Orders" : "My Orders"}</span>
                    </Link>

                    <Link href={dashboardComplaintsPath} onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                      <XCircle className="h-5 w-5" />
                      <span>{user?.role === "admin" ? "Complaints" : "My Complaints"}</span>
                    </Link>

                    <Link href={dashboardReviewsPath} onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                      <Star className="h-5 w-5" />
                      <span>{user?.role === "admin" ? "Reviews" : "My Reviews"}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Mobile Menu Toggle Button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {mobileOpen && (
        <nav className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 lg:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`w-max text-sm text-black ${
                  isActive ? "border-b border-black pb-0.5 font-medium" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}