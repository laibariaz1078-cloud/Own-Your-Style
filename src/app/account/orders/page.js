import TopBar from "../../../components/TopBar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AccountSidebar from "../AccountSidebar";
import CustomerOrdersTable from "../../../components/dashboard/CustomerOrdersTable";

export default function AccountOrdersPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-10 sm:px-6 lg:px-20 text-[#000000]">
        <div className="text-sm">
          <span className="text-black/50">Home</span> /{" "}
          <span className="font-medium text-black">My Orders</span>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl gap-16 px-4 pb-20 sm:px-6 lg:px-20">
        <AccountSidebar />
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-black">My Orders</h1>
            <p className="mt-1 text-sm text-black/60">Track your recent purchases and order status.</p>
          </div>
          <CustomerOrdersTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}
