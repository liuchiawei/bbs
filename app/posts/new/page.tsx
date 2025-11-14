import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PostForm } from "@/components/posts/post-form";

export default async function NewPostPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <PostForm />;
}
