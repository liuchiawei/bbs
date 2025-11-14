import { getPosts } from "@/lib/services/posts";
import { getCurrentUser } from "@/lib/auth";
import NewPostButtonXL from "@/components/posts/new-post-button-xl";
import NewPostButton from "@/components/posts/new-post-button";
import { PostCard } from "@/components/posts/post-card";
import { PostForm } from "@/components/posts/post-form";
import HomeHeader from "@/components/home/header";
import { Timeline } from "@/components/ui/timeline";
import { t } from "@/lib/constants";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

const timelineData: TimelineEntry[] = [
  {
    title: "Post 1",
    content: (
      <div className="w-full h-96 bg-red-500 rounded-lg shadow-md">Post 1</div>
    ),
  },
  {
    title: "Post 2",
    content: (
      <div className="w-full h-96 bg-red-500 rounded-lg shadow-md">Post 2</div>
    ),
  },
  {
    title: "Post 3",
    content: (
      <div className="w-full h-96 bg-red-500 rounded-lg shadow-md">Post 3</div>
    ),
  },
  {
    title: "Post 4",
    content: (
      <div className="w-full h-96 bg-red-500 rounded-lg shadow-md">Post 4</div>
    ),
  },
  {
    title: "Post 5",
    content: (
      <div className="w-full h-96 bg-red-500 rounded-lg shadow-md">Post 5</div>
    ),
  },
];

export default async function Home() {
  const allPosts = await getPosts();
  const currentUser = await getCurrentUser();

  return (
    <section>
      <HomeHeader />
      <Timeline data={timelineData} />
      <div className="w-full flex flex-col gap-2">
        {currentUser && <PostForm currentUser={currentUser} />}
        {allPosts.length === 0 ? (
          <div className="w-full h-full min-h-72 py-12 flex flex-col items-center justify-center gap-4 bg-muted rounded-xl border text-center">
            <p className="text-muted-foreground">{t("HOME_NO_POSTS")}</p>
            <NewPostButton size="lg" />
          </div>
        ) : (
          allPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <NewPostButtonXL className="fixed bottom-0 right-1/2 md:right-0 translate-x-1/2 md:translate-x-1/5 translate-y-1/3 md:translate-y-1/4 z-50" />
    </section>
  );
}
