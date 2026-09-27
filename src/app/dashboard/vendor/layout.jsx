import { redirect } from "next/navigation";
import { getAuthUser } from "../../../lib/auth";

export default async function VendorDashboardLayout({ children }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (user.role !== "vendor") redirect(user.role === "admin" ? "/dashboard/admin" : user.role === "seller" ? "/dashboard/seller" : "/dashboard/customer");
  return children;
}
