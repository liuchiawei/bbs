import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { t } from "@/lib/constants";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Redirect non-admin users to home page
  if (!user || !user.isAdmin) {
    redirect("/");
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{t("ADMIN_DASHBOARD")}</h1>
        <p className="text-muted-foreground mt-2">
          管理討論區、用戶與資料 / Manage forum, users, and data
        </p>
      </div>

      <AdminTabs />
    </>
  );
}
