import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllCategoriesAdmin, createCategory } from "@/lib/services/categories";
import { createCategorySchema } from "@/lib/validations";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await getAllCategoriesAdmin();

    return NextResponse.json({
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // バリデーション / Validation
    const validatedData = createCategorySchema.parse(body);

    const category = await createCategory({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      displayOrder: validatedData.displayOrder,
    });

    // キャッシュを無効化（符合 Next.js 16 規範，使用 'max' 參數）
    // Invalidate cache (符合 Next.js 16 規範，使用 'max' 參數)
    revalidateTag("categories", "max");
    revalidateTag("posts", "max"); // 更新貼文快取以反映新分類

    return NextResponse.json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    console.error("Error creating category:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

