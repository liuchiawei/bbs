import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categorySlug = searchParams.get("category");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }
    if (userId) where.userId = userId;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Failed to get posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        categoryId: validatedData.categoryId,
        tags: validatedData.tags,
        userId: session.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
