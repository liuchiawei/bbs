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
          eventId:
            typeof post.eventId === "string" ? post.eventId : String(post.eventId),
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
              createdAt:
                typeof post.createdAt === "string"
                  ? post.createdAt
                  : post.createdAt.toString(),
              deletedAt:
                post.deletedAt && typeof post.deletedAt !== "string"
                  ? post.deletedAt.toString()
                  : post.deletedAt || null,
              eventId:
                typeof post.eventId === "string"
                  ? post.eventId
                  : post.eventId
                  ? String(post.eventId)
                  : null,
              category: post.category
                ? (() => {
                    const cat = post.category as {
                      id: string;
                      name: string;
                      slug: string | null;
                    };
                    return {
                      id: cat.id,
                      name: cat.name,
                      slug: cat.slug || null,
                    };
                  })()
                : null,
              // 明確確保 user 類型正確，移除 email 欄位（PostContent 不需要）
              // Explicitly ensure user type is correct, remove email field (PostContent doesn't need it)
              // Use transformUser utility function to handle type conversion
              // 使用 transformUser 工具函數處理類型轉換
              user: (() => {
                const u = post.user as {
                  id: string;
                  userId: string;
                  email: string;
                  profile: {
                    name: string;
                    nickname: string | null;
                    avatar: string | null;
                  } | null;
                };
                return {
                  id: u.id,
                  userId: u.userId,
                  name: u.profile?.name || "",
                  nickname: u.profile?.nickname ?? null,
                  avatar: u.profile?.avatar ?? null,
                };
              })(),
              comments: post.comments.map((comment) => {
                const commentUser = comment.user as {
                  id: string;
                  userId: string;
                  email: string;
                  profile: {
                    name: string;
                    nickname: string | null;
                    avatar: string | null;
                  } | null;
                };
                return {
                  id: comment.id,
                  content: comment.content,
                  likes: comment.likes,
                  replies: comment.replies,
                  createdAt:
                    typeof comment.createdAt === "string"
                      ? comment.createdAt
                      : comment.createdAt.toString(),
                  userId: comment.userId,
                  postId: comment.postId,
                  parentId:
                    typeof comment.parentId === "string"
                      ? comment.parentId
                      : comment.parentId
                      ? String(comment.parentId)
                      : null,
                  user: {
                    id: commentUser.id,
                    userId: commentUser.userId,
                    name: commentUser.profile?.name || commentUser.userId,
                    nickname: commentUser.profile?.nickname ?? null,
                    avatar: commentUser.profile?.avatar ?? null,
                  },
                };
              }),
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
