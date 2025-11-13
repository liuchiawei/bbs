import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { DeleteCommentButton } from "@/components/comments/delete-comment-button";
import { getUserComments } from "@/lib/services/users";
import { TRANSLATIONS, type Language } from "@/lib/constants";

export default async function UserCommentsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // TODO: Get language from user preferences or browser settings
  const lang: Language = 'en';
  const t = TRANSLATIONS[lang];

  const { userId } = await params;
  const user = await getUserComments(userId);
  const currentUser = await getCurrentUser();

  if (!user) {
    notFound();
  }

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

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user.name}{t.COMMENTS_BY}</h1>
        <p className="text-muted-foreground mt-2">
          {user.comments.length}{" "}
          {user.comments.length === 1 ? t.COMMENT_SINGULAR : t.COMMENT_PLURAL}
        </p>
      </div>

      {user.comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t.NO_COMMENTS_YET}
        </p>
      ) : (
        <div className="space-y-4">
          {user.comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <time className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </time>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <Link
                    href={`/posts/${comment.post.id}`}
                    className="block w-fit text-2xl md:text-5xl font-bold hover:underline"
                  >
                    {comment.post.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {comment.post.content.length > 25
                      ? comment.post.content.substring(0, 25) + "..."
                      : comment.post.content}
                  </p>
                </div>
                <div className="flex items-center justify-between ml-4 md:ml-8 border-l-2 pl-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span>{comment.likes} {t.LIKES_LABEL}</span>
                    <span>{comment.replies} {t.REPLIES_LABEL}</span>
                  </div>
                  {currentUser &&
                    (currentUser.id === comment.userId ||
                      currentUser.isAdmin) && (
                      <DeleteCommentButton commentId={comment.id} />
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
