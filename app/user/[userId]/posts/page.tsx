import { prisma } from "@/lib/db";
import type { PostWithUser } from "@/lib/types";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TRANSLATIONS, type Language } from "@/lib/constants";
import { userSelectPublicExtended, categorySelect } from "@/lib/types/prisma-selects";
import { transformUser } from "@/lib/utils";

async function getUserPosts(userId: string) {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      profile: {
        select: {
          name: true,
          nickname: true,
          avatar: true,
        },
      },
      posts: {
        where: {
          deletedAt: null, // 削除されていない投稿のみ取得 / Only get non-deleted posts
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: userSelectPublicExtended,
          },
          category: {
            select: categorySelect,
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // 轉換 posts 中的 user 資料為扁平結構
  // Transform user data in posts to flat structure
  return {
    ...user,
    posts: user.posts.map((post) => ({
      ...post,
      category: post.category?.deletedAt ? null : post.category,
      user: transformUser(post.user),
    })),
  };
}

export default async function UserPostsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // TODO: Get language from user preferences or browser settings
  const lang: Language = "en";
  const t = TRANSLATIONS[lang];

  const { userId } = await params;
  const user = await getUserPosts(userId);

  if (!user) {
    notFound();
  }

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/user/${userId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.BACK_TO_PROFILE}
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {user.profile?.name || user.userId}
          {t.POSTS_BY}
        </h1>
        <p className="text-muted-foreground mt-2">
          {user.posts.length}{" "}
          {user.posts.length === 1 ? t.POST_SINGULAR : t.POST_PLURAL}
        </p>
      </div>

      {user.posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t.NO_POSTS_YET}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user.posts.map((post) => (
            <PostCard key={post.id} post={post as PostWithUser} />
          ))}
        </div>
      )}
    </>
  );
}
