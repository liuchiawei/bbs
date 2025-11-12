import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/posts/post-form";

async function getPost(id: string) {
  return await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      tags: true,
      userId: true,
    },
  });
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  if (post.userId !== session.userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PostForm initialData={post} mode="edit" />
    </div>
  );
}
