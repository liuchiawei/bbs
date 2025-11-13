import { getPosts } from "@/lib/services/posts";
import NewPostButton from "@/components/posts/new-post-button";
import { PostCard } from "@/components/posts/post-card";
import { PostForm } from "@/components/posts/post-form";
import { t } from "@/lib/constants";
import HomeHeader from "@/components/home/header";

export default async function Home() {
  const allPosts = await getPosts();

  return (
    <section>
      <HomeHeader />
      <div className="w-full flex flex-col gap-2">
        <PostForm />
        {allPosts.length === 0 ? (
          <div className="w-full h-full min-h-72 py-12 flex flex-col items-center justify-center gap-4 bg-muted rounded-xl border text-center">
            <p className="text-muted-foreground">{t("HOME_NO_POSTS")}</p>
            <NewPostButton size="lg" />
          </div>
        ) : (
          allPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </section>
  );
}
