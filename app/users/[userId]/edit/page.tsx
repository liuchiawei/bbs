import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/services/users";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

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
  const user = await getUserProfile(userId);

  if (!user) {
    notFound();
  }

  // Check if user is editing their own profile
  if (session.userId !== userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Profile</h1>
      <EditProfileForm
        user={{
          ...user,
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : null,
        }}
      />
    </div>
  );
}
