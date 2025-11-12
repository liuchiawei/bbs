import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Redirect non-admin users to home page
  if (!user || !user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage categories, posts, and users
        </p>
      </div>

      <AdminTabs />
    </div>
  );
}
