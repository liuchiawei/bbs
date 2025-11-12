import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

async function getUser(userId: string) {
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

export default async function EditProfilePage() {
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
      <EditProfileForm
        user={{
          ...user,
          birthDate: user.birthDate?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
