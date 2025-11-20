import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
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

  // Fetch betting tags if post is linked to an event
  let userBets: Record<string, any> = {};
  if (post.eventId) {
    // Get unique user IDs from comments
    const commentUserIds = Array.from(new Set(post.comments.map(c => c.userId)));
    
    if (commentUserIds.length > 0) {
      const bets = await prisma.bettingLog.findMany({
        where: {
          eventId: post.eventId,
          userId: { in: commentUserIds },
          settlement_status: { not: "VOID" },
        },
      });

      // Create map of userId -> bet
      bets.forEach(bet => {
        // Convert Decimal to number/string for serialization
        userBets[bet.userId] = {
          ...bet,
          bet_amount: Number(bet.bet_amount),
          odds_snapshot: Number(bet.odds_snapshot),
          final_payout: bet.final_payout ? Number(bet.final_payout) : null,
        };
      });
    }
  }

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
              // 明確確保 user 類型正確，移除 email 欄位（PostContent 不需要）
              // Explicitly ensure user type is correct, remove email field (PostContent doesn't need it)
              user: {
                id: post.user.id,
                userId: post.user.userId,
                name: post.user.name,
                nickname: post.user.nickname ?? null, // 確保 undefined 轉為 null
                avatar: post.user.avatar ?? null, // 確保 undefined 轉為 null
              },
              comments: post.comments.map((comment) => ({
                id: comment.id,
                content: comment.content,
                likes: comment.likes,
                replies: comment.replies,
                createdAt: comment.createdAt.toString(),
                userId: comment.userId,
                postId: comment.postId,
                parentId: comment.parentId ?? null, // 確保 undefined 轉為 null
                // 明確確保 comment.user 類型正確，移除 email 欄位
                // Explicitly ensure comment.user type is correct, remove email field
                user: {
                  id: comment.user.id,
                  userId: comment.user.userId,
                  name: comment.user.name,
                  nickname: comment.user.nickname ?? null, // 確保 undefined 轉為 null
                  avatar: comment.user.avatar ?? null, // 確保 undefined 轉為 null
                },
              })),
            }}
            currentUserId={user?.id}
            postId={post.id}
            userBets={userBets}
          />
        </CardHeader>
      </Card>
    </div>
  );
}
