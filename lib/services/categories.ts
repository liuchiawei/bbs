import { prisma } from "@/lib/db";

/**
 * Get all active categories, sorted by display order
 * This is cached to reduce database load
 */
export async function getCategories() {
  "use cache";
  return await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      displayOrder: true,
    },
  });
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string) {
  "use cache";
  return await prisma.category.findUnique({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
  });
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string) {
  "use cache";
  return await prisma.category.findUnique({
    where: {
      id,
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
  });
}

/**
 * Get a single category by display order
 */
export async function getCategoriesByDisplayOrder(displayOrder: number) {
  "use cache";
  return await prisma.category.findMany({
    where: {
      displayOrder,
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      displayOrder: true,
      description: true,
    },
  });
}

/**
 * Admin: Get all categories (including inactive)
 */
export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: {
      displayOrder: "asc",
    },
  });
}

/**
 * Admin: Create a new category
 */
export async function createCategory(data: {
  slug: string;
  name: string;
  description?: string;
  displayOrder?: number;
}) {
  return await prisma.category.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      displayOrder: data.displayOrder ?? 0,
    },
  });
}

/**
 * Admin: Update a category
 */
export async function updateCategory(
  id: string,
  data: {
    slug?: string;
    name?: string;
    description?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  }
) {
  return await prisma.category.update({
    where: { id },
    data,
  });
}

/**
 * Admin: Delete a category (soft delete by setting isActive to false)
 */
export async function deleteCategory(id: string) {
  return await prisma.category.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

/**
 * Get category with post count
 */
export async function getCategoriesWithCount() {
  "use cache";
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return categories;
}
