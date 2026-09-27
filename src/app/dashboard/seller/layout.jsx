import { redirect } from "next/navigation";
import { getAuthUser } from "../../../lib/auth";

export default async function SellerDashboardLayout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "seller") {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }

  return children;
}