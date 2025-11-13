import { getPosts } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { TRANSLATIONS, type Language } from "@/lib/constants";

export default async function Home() {
  // TODO: Get language from user preferences or browser settings
  const lang: Language = 'en';
  const t = TRANSLATIONS[lang];

  const categories = await getCategories();
  const allPosts = await getPosts();

  // Fetch posts for each category dynamically
  const categoryPosts = await Promise.all(
    categories.map(async (category) => ({
      slug: category.slug,
      name: category.name,
      posts: await getPosts({ categorySlug: category.slug }),
    }))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-5xl font-bold">{t.HOME_WELCOME}</h1>
        <p className="text-xl text-muted-foreground">
          {t.HOME_SUBTITLE}
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList
          className="grid w-full max-w-md mx-auto"
          style={{ gridTemplateColumns: `repeat(${categories.length + 1}, 1fr)` }}
        >
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.slug} value={category.slug}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-8">
          {allPosts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">{t.HOME_NO_POSTS}</p>
              <Button asChild>
                <Link href="/posts/new">{t.HOME_CREATE_FIRST_POST}</Link>
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

        {categoryPosts.map((category) => (
          <TabsContent
            key={category.slug}
            value={category.slug}
            className="space-y-4 mt-8"
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
