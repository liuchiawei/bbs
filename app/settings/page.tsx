import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import type { User } from "@/lib/types";

async function getUser(userId: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
    },
  });
}

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await getUser(session.userId);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
      <EditProfileForm
        user={{
          ...user,
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : null,
        } as User}
      />
    </div>
  );
}
