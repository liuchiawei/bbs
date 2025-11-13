import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// 檔名生成関数：時間戳記 + UUID + 原始檔名
function generateUniqueFileName(originalFileName: string): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "");
  const uuid = randomUUID();
  const extension = originalFileName.includes(".")
    ? originalFileName.substring(originalFileName.lastIndexOf("."))
    : "";
  const nameWithoutExtension = originalFileName.includes(".")
    ? originalFileName.substring(0, originalFileName.lastIndexOf("."))
    : originalFileName;

  return `${timestamp}-${uuid}-${nameWithoutExtension}${extension}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 使用者認證チェック
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 4MB limit" },
        { status: 400 }
      );
    }

    // ユニークな檔名を生成
    const uniqueFileName = generateUniqueFileName(file.name);

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
