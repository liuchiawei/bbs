import { getUserLikedPosts, getUserLikedComments } from "@/lib/services/users";
import { getSession } from "@/lib/auth";
import type { PostWithUser } from "@/lib/types";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRANSLATIONS, type Language } from "@/lib/constants";

export default async function UserLikesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // TODO: Get language from user preferences or browser settings
  const lang: Language = 'en';
  const t = TRANSLATIONS[lang];

  const { userId } = await params;
  const session = await getSession();

  if (!session || session.userId !== userId) {
    redirect("/");
  }

  const [likedPosts, likedComments] = await Promise.all([
    getUserLikedPosts(userId),
    getUserLikedComments(userId),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/users/${userId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.BACK_TO_PROFILE}
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">{t.LIKED_CONTENT}</h1>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="posts">
            {t.LIKED_POSTS} ({likedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            {t.LIKED_COMMENTS} ({likedComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-8">
          {likedPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {t.NO_LIKED_POSTS}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {likedPosts.map((post) => (
                <PostCard key={post.id} post={post as PostWithUser} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4 mt-8">
          {likedComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {t.NO_LIKED_COMMENTS}
            </p>
          ) : (
            <div className="space-y-4">
              {likedComments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar || undefined} />
                        <AvatarFallback>
                          {comment.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          href={`/users/${comment.user.id}`}
                          className="font-semibold hover:underline"
                        >
                          {comment.user.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {t.ON}{" "}
                          <Link
                            href={`/posts/${comment.post.id}`}
                            className="hover:underline"
                          >
                            {comment.post.title}
                          </Link>
                        </p>
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>{comment.likes} {t.LIKES_LABEL}</span>
                      <span>{comment.replies} {t.REPLIES_LABEL}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
