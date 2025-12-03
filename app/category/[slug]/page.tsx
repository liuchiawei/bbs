import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/services/categories";
import { getPosts } from "@/lib/services/posts";
import { PostCard } from "@/features/post/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/constants";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 如果 slug 是 "general"（預設值），顯示所有無分類的貼文
  // If slug is "general" (default), show all posts without category
  if (slug === "general") {
    const posts = await getPosts({ limit: 20 });
    const postsWithoutCategory = posts.filter((post) => !post.category);

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("NO_CATEGORY")}</CardTitle>
          </CardHeader>
          <CardContent>
            {postsWithoutCategory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t("NO_POSTS_FOUND")}
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {postsWithoutCategory.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 根據 slug 查找 category
  // Find category by slug
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // 取得該分類的貼文
  // Get posts for this category
  const posts = await getPosts({ limit: 20 });
  // Type assertion needed due to PrismaToApp type transformation
  // 由於 PrismaToApp 類型轉換，需要類型斷言
  // Non-null assertion is safe here because we checked above
  // 非空斷言在這裡是安全的，因為我們已經在上面檢查過了
  const categoryId = (category as { id: string }).id;
  const categoryPosts = posts.filter((post) => {
    const postCategoryId = post.category ? (post.category as { id: string }).id : null;
    return postCategoryId === categoryId;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
          {category.description && (
            <p className="text-muted-foreground">
              {typeof category.description === "string"
                ? category.description
                : String(category.description)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {categoryPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("NO_POSTS_FOUND")}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
