import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PostContent } from "@/components/posts/post-content";
import { getPostById, incrementPostViews } from "@/lib/services/posts";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/constants";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 投稿データを取得し、viewsを増やす
  // Fetch post data and increment views
  const [post, user] = await Promise.all([getPostById(id), getCurrentUser()]);

  if (!post) {
    notFound();
  }

  // ビュー数を増やす（非同期で実行、エラーは無視）
  // Increment views (async, ignore errors)
  incrementPostViews(id).catch(() => {
    // エラーを無視（ビュー数の増加は重要ではない）
    // Ignore errors (view increment is not critical)
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <PostContent
            post={{
              ...post,
              createdAt: post.createdAt.toString(),
              deletedAt: post.deletedAt?.toString() || null,
              category: post.category
                ? {
                    id: post.category.id,
                    name: post.category.name,
                    slug: post.category.slug || null,
                  }
                : null,
              // 明確確保 user 類型正確（transformUser 已確保 avatar 為 string | null）
              // Explicitly ensure user type is correct (transformUser ensures avatar is string | null)
              user: {
                ...post.user,
                avatar: post.user.avatar ?? null, // 確保 undefined 轉為 null
                nickname: post.user.nickname ?? null, // 確保 undefined 轉為 null
              },
              comments: post.comments.map((comment) => ({
                ...comment,
                createdAt: comment.createdAt.toString(),
                // 明確確保 comment.user 類型正確
                // Explicitly ensure comment.user type is correct
                user: {
                  ...comment.user,
                  avatar: comment.user.avatar ?? null, // 確保 undefined 轉為 null
                  nickname: comment.user.nickname ?? null, // 確保 undefined 轉為 null
                },
              })),
            }}
            currentUserId={user?.id}
            postId={post.id}
          />
        </CardHeader>
      </Card>
    </div>
  );
}
