import { getPosts } from "@/lib/services/posts";
import NewPostButton from "@/features/post/components/new-post-button";
import { PostCard } from "@/features/post/components/post-card";
import { PostForm } from "@/features/post/components/post-form";
import HomeHeader from "@/components/common/header";
import ScrollProgressBar from "@/components/common/scroll-progress-bar";
import { t } from "@/lib/constants";

export default async function Home() {
  const allPosts = await getPosts();
  return (
    <section>
      <ScrollProgressBar />
      <HomeHeader />
      <div className="w-full flex flex-col gap-2">
        <PostForm mode="create" />
        {allPosts.length === 0 ? (
          <div className="w-full h-full min-h-72 py-12 flex flex-col items-center justify-center gap-4 bg-muted rounded-xl border text-center">
            <p className="text-muted-foreground">{t("HOME_NO_POSTS")}</p>
            <NewPostButton size="lg" />
          </div>
        ) : (
          allPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <div className="flex flex-col gap-6 *:h-120 *:rounded-2xl">
        <div className="border" />
        <div className="border" />
        <div className="red" />
        <div className="border" />
        <div className="border" />
        <div className="border" />
      </div>
    </section>
  );
}
