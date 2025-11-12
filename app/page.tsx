import { getPosts } from "@/lib/services/posts";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function Home() {
  const allPosts = await getPosts();
  const techPosts = await getPosts({ category: "tech" });
  const gamingPosts = await getPosts({ category: "gaming" });
  const generalPosts = await getPosts({ category: "general" });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-5xl font-bold">Welcome to BBS</h1>
        <p className="text-xl text-muted-foreground">
          Share your thoughts, connect with others
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tech">Tech</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-8">
          {allPosts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">No posts yet</p>
              <Button asChild>
                <Link href="/posts/new">Create the first post</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tech" className="space-y-4 mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {techPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gaming" className="space-y-4 mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gamingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4 mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generalPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
