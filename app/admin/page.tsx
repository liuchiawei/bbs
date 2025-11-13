import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { TRANSLATIONS, type Language } from "@/lib/constants";

export default async function AdminPage() {
  // TODO: Get language from user preferences or browser settings
  const lang: Language = 'en';
  const t = TRANSLATIONS[lang];

  const user = await getCurrentUser();

  // Redirect non-admin users to home page
  if (!user || !user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{t.ADMIN_DASHBOARD}</h1>
        <p className="text-muted-foreground mt-2">
          {t.MANAGE_CATEGORIES_POSTS_USERS}
        </p>
      </div>

      <AdminTabs />
    </div>
  );
}
