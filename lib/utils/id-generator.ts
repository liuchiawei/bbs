import { prisma } from "@/lib/db";

/**
 * 時間戳IDを生成する（年月日時分秒 + 4桁のランダム数）
 * Generate timestamp ID (YYYYMMDDHHmmss + 4-digit random number)
 * フォーマット: 202511201234561234 (18桁)
 * Format: 202511201234561234 (18 digits)
 */
function generateTimestampIdBase(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  // 4桁のランダム数を生成
  // Generate 4-digit random number
  const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  
  return `${year}${month}${day}${hours}${minutes}${seconds}${randomSuffix}`;
}

/**
 * Post用の一意なIDを生成
 * Generate unique ID for Post
 */
export async function generatePostId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateTimestampIdBase();
    
    // データベースでIDが既に存在するかチェック
    // Check if ID already exists in database
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!existing) {
      return id;
    }
    
    attempts++;
  }
  
  // 最大試行回数に達した場合は、タイムスタンプに追加のランダム数を追加
  // If max attempts reached, add additional random number to timestamp
  return generateTimestampIdBase() + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

/**
 * Comment用の一意なIDを生成
 * Generate unique ID for Comment
 */
export async function generateCommentId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateTimestampIdBase();
    
    // データベースでIDが既に存在するかチェック
    // Check if ID already exists in database
    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!existing) {
      return id;
    }
    
    attempts++;
  }
  
  // 最大試行回数に達した場合は、タイムスタンプに追加のランダム数を追加
  // If max attempts reached, add additional random number to timestamp
  return generateTimestampIdBase() + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

/**
 * Event用の一意なIDを生成
 * Generate unique ID for Event
 */
export async function generateEventId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const id = generateTimestampIdBase();
    
    // データベースでIDが既に存在するかチェック
    // Check if ID already exists in database
    const existing = await prisma.event.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!existing) {
      return id;
    }
    
    attempts++;
  }
  
  // 最大試行回数に達した場合は、タイムスタンプに追加のランダム数を追加
  // If max attempts reached, add additional random number to timestamp
  return generateTimestampIdBase() + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

