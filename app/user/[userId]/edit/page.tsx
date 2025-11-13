import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/services/users";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { t } from "@/lib/constants";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { userId } = await params;
  const user = await getUserProfile(session.userId);

  if (!user) {
    notFound();
  }

  // Check if user is editing their own profile (compare URL userId with user's userId field)
  if (user.userId !== userId) {
    redirect("/");
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-center">{t("EDIT_PROFILE")}</h1>
      <EditProfileForm
        user={{
          ...user,
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : null,
        }}
      />
    </>
  );
}
