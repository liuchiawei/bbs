import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/services/users";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import type { User } from "@/lib/types";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await getUserProfile(session.id);

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
      <EditProfileForm
        user={{
          ...user,
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : null,
        } as User}
      />
    </>
  );
}
