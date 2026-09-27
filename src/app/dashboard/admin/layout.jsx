import { redirect } from "next/navigation";
import { getAuthUser } from "../../../lib/auth";

const roleHome = {
  seller: "/dashboard/seller",
  vendor: "/dashboard/vendor",
  customer: "/dashboard/customer",
};

export default async function AdminDashboardLayout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect(roleHome[user.role] || "/dashboard/customer");
  }

  return children;
}