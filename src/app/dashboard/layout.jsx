import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../../components/dashboard/DashboardTopbar";
import { getAuthUser } from "../../lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Exclusive",
};

export default async function DashboardLayout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#efefef] text-slate-800">
      <div className="mx-auto flex h-screen max-h-screen w-full max-w-350 overflow-hidden border border-slate-200/80 bg-[#f5f3ef] shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
        <div className="shrink-0 lg:sticky lg:top-0 lg:h-screen">
          <DashboardSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopbar />
          <main className="flex-1 overflow-y-auto bg-[#f8f7f5] p-6">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
