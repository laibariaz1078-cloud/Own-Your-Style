"use client";

import { useAppContext } from "../../context/AppContext";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AccountSidebar from "./AccountSidebar";
import AccountProfileForm from "./AccountProfileForm";

export default function AccountPage() {
  const { user, isAuthenticated } = useAppContext();

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      {/* Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-10 sm:px-6 lg:px-20 text-[#000000]">
        <div className="text-sm">
          <span className="text-black/50">Home</span> /{" "}
          <span className="font-medium text-black">My Account</span>
        </div>
        <div className="text-sm font-normal">
          Welcome!{" "}
          <span className="text-[#DB4444]">
            {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : isAuthenticated ? "User" : "Guest"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto flex max-w-7xl gap-16 px-4 pb-20 sm:px-6 lg:px-20">
        <AccountSidebar />
        <div className="flex-1">
         <AccountProfileForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}