import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PostForm } from "@/components/posts/post-form";

export default async function NewPostPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container w-full max-w-3xl mx-auto px-4 py-12">
      <PostForm />
    </div>
  );
}
