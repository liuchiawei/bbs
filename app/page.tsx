import { getPosts } from "@/lib/services/posts";
import NewPostButton from "@/components/posts/new-post-button";
import { PostCard } from "@/components/posts/post-card";
import { t } from "@/lib/constants";
import HomeHeader from "@/components/home/header";

export default async function Home() {
  const allPosts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <HomeHeader />
      <div className="space-y-4 mt-8">
        {allPosts.length === 0 ? (
          <div className="w-full h-full min-h-72 py-12 flex flex-col items-center justify-center gap-4 bg-muted rounded-xl border text-center">
            <p className="text-muted-foreground">{t("HOME_NO_POSTS")}</p>
            <NewPostButton size="lg" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
