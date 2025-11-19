import { getPosts } from "@/lib/services/posts";
import NewPostButtonXL from "@/components/posts/new-post-button-xl";
import NewPostButton from "@/components/posts/new-post-button";
import { PostCard } from "@/components/posts/post-card";
import { PostForm } from "@/components/posts/post-form";
import HomeHeader from "@/components/home/header";
import ScrollProgressBar from "@/components/home/scroll-progress-bar";
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
      <div className="h-120 border" />
      <div className="h-120 border" />
      <div className="h-120 border" />
      <div className="h-120 border" />
      <div className="h-120 border" />
      <div className="h-120 border" />
      <div className="h-120 border" />
      <div className="h-120 border" />
      <NewPostButtonXL className="fixed -bottom-8 right-1/2 md:right-12 translate-x-1/2 z-0" />
    </section>
  );
}
