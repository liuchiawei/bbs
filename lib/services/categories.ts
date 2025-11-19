import { prisma } from "@/lib/db";
import type { Category } from "@/lib/types";
import { unstable_cache } from "next/cache";
import { categorySelect } from "@/lib/validations";

/**
 * Get all categories (excluding soft-deleted ones)
 * unstable_cacheを使用してISRを実装
 * Use unstable_cache to implement ISR
 */
export async function getAllCategories(): Promise<Category[]> {
  return unstable_cache(
    async () => {
      const categories = await prisma.category.findMany({
        where: {
          deletedAt: null, // 削除されていないカテゴリのみ取得 / Only get non-deleted categories
        },
        select: categorySelect,
        orderBy: [
          { displayOrder: "asc" }, // displayOrderでソート / Sort by displayOrder
          { createdAt: "asc" }, // その後作成日時でソート / Then sort by createdAt
        ],
      });

      return categories as Category[];
    },
    ["categories"],
    {
      tags: ["categories"],
      revalidate: 300, // 5分間キャッシュ / Cache for 5 minutes
    }
  )();
}

/**
 * Get category by slug
 * slugでカテゴリを取得
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  const category = await prisma.category.findUnique({
    where: { slug },
    select: categorySelect,
  });

  if (!category || category.deletedAt) {
    return null;
  }

  return category as Category;
}

/**
 * Get all categories including soft-deleted ones (for admin)
 * 管理員用：削除されたカテゴリも含む
 * For admin: Include deleted categories
 */
export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    select: categorySelect,
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
  });

  return categories as Category[];
}

/**
 * Get category by ID
 * IDでカテゴリを取得
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });

  return category as Category | null;
}

/**
 * Create a new category
 * 新しいカテゴリを作成
 */
export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
}): Promise<Category> {
  // 自動生成slug（未提供の場合）
  // Auto-generate slug if not provided
  let slug = data.slug;
  if (!slug) {
    slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // 名前の一意性を確認
  // Check name uniqueness
  const existingByName = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existingByName) {
    throw new Error("Category name already exists");
  }

  // slugの一意性を確認
  // Check slug uniqueness
  if (slug) {
    const existingBySlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingBySlug) {
      throw new Error("Category slug already exists");
    }
  }

  // displayOrderの検証
  // Validate displayOrder
  const displayOrder = data.displayOrder ?? 1;
  if (displayOrder < 1 || !Number.isInteger(displayOrder)) {
    throw new Error("Display order must be a positive integer (minimum 1)");
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: slug || null,
      description: data.description || null,
      displayOrder,
    },
    select: categorySelect,
  });

  return category as Category;
}

/**
 * Update a category
 * カテゴリを更新
 */
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    displayOrder?: number;
  }
): Promise<Category> {
  // カテゴリが存在するか確認
  // Check if category exists
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  // 名前の一意性を確認（自分を除く）
  // Check name uniqueness (excluding self)
  if (data.name && data.name !== existing.name) {
    const existingByName = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingByName) {
      throw new Error("Category name already exists");
    }
  }

  // slugの一意性を確認（自分を除く）
  // Check slug uniqueness (excluding self)
  if (data.slug && data.slug !== existing.slug) {
    const existingBySlug = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingBySlug) {
      throw new Error("Category slug already exists");
    }
  }

  // displayOrderの検証
  // Validate displayOrder
  if (data.displayOrder !== undefined) {
    if (data.displayOrder < 1 || !Number.isInteger(data.displayOrder)) {
      throw new Error("Display order must be a positive integer (minimum 1)");
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug || null }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
      ...(data.displayOrder !== undefined && {
        displayOrder: data.displayOrder,
      }),
    },
    select: categorySelect,
  });

  return category as Category;
}

/**
 * Soft delete a category
 * カテゴリをソフトデリート
 */
export async function softDeleteCategory(id: string): Promise<void> {
  // カテゴリが存在するか確認
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // 既に削除されているか確認
  // Check if already deleted
  if (category.deletedAt) {
    throw new Error("Category already deleted");
  }

  // このカテゴリを使用しているPostを取得
  // Get posts using this category
  const postsWithCategory = await prisma.post.findMany({
    where: {
      categoryId: id,
      deletedAt: null, // 削除されていないPostのみ / Only non-deleted posts
    },
    select: { id: true },
  });

  // 関連するPostのcategoryIdをnullに設定
  // Set categoryId to null for related posts
  if (postsWithCategory.length > 0) {
    await prisma.post.updateMany({
      where: {
        id: { in: postsWithCategory.map((p) => p.id) },
      },
      data: {
        categoryId: null,
      },
    });
  }

  // カテゴリをソフトデリート
  // Soft delete the category
  await prisma.category.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
