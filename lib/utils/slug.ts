/**
 * Slug Generation Utilities
 * Slug生成工具函數
 * Generate URL-friendly slugs from fighter names
 */

/**
 * Normalize fighter name
 * 標準化選手名字
 * Removes special characters, normalizes spaces
 */
export function normalizeFighterName(name: string): string {
  if (!name) return "";

  return name
    .trim()
    // Remove common prefixes/suffixes
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+/i, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, "")
    .trim();
}

/**
 * Generate slug from fighter name
 * 從選手名字生成 slug
 * Converts name to URL-friendly format
 * 
 * @param name - Fighter name (e.g., "Conor McGregor")
 * @returns Slug (e.g., "conor-mcgregor")
 */
export function generateSlug(name: string): string {
  if (!name) return "";

  const normalized = normalizeFighterName(name);

  return normalized
    .toLowerCase()
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Remove multiple consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate unique slug with number suffix if needed
 * 生成唯一 slug，必要時添加數字後綴
 * 
 * @param name - Fighter name
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  name: string,
  existingSlugs: string[]
): string {
  const baseSlug = generateSlug(name);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Add number suffix if slug already exists
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Convert slug back to possible fighter names
 * 從 slug 推測可能的名字列表
 * 
 * This is used for on-demand sync when a fighter is not found in database.
 * 用於當資料庫找不到選手時進行 on-demand 同步
 * 
 * @param slug - Fighter slug (e.g., "conor-mcgregor" or "conor-mcgregor-2")
 * @returns Array of possible names to search for
 */
export function slugToPossibleNames(slug: string): string[] {
  if (!slug) return [];

  const names: string[] = [];

  // Remove number suffix if present (e.g., "conor-mcgregor-2" -> "conor-mcgregor")
  // 移除數字後綴（如果存在）
  const baseSlug = slug.replace(/-\d+$/, "");

  // Convert slug to name: replace hyphens with spaces and capitalize
  // 將 slug 轉換為名字：連字號轉空格並首字母大寫
  const parts = baseSlug.split("-");
  
  // Basic conversion: capitalize each word
  // 基本轉換：每個單字首字母大寫
  const basicName = parts
    .map((part) => {
      if (!part) return "";
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
  
  if (basicName) {
    names.push(basicName);
  }

  // Try variations for common name patterns
  // 嘗試常見名字模式的變體
  if (parts.length >= 2) {
    // For names like "conor-mcgregor", also try "Conor McGregor" (already added)
    // For names with "mc" prefix, try "McGregor" format
    // 對於 "mc" 前綴的名字，嘗試 "McGregor" 格式
    const mcIndex = parts.findIndex((p) => p.toLowerCase().startsWith("mc"));
    if (mcIndex >= 0) {
      const mcPart = parts[mcIndex];
      const mcCapitalized =
        mcPart.charAt(0).toUpperCase() +
        mcPart.charAt(1).toUpperCase() +
        mcPart.slice(2).toLowerCase();
      
      const partsCopy = [...parts];
      partsCopy[mcIndex] = mcCapitalized;
      
      const mcName = partsCopy
        .map((part) => {
          if (!part) return "";
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join(" ");
      
      if (mcName && mcName !== basicName) {
        names.push(mcName);
      }
    }
  }

  return names.filter((name) => name.length > 0);
}

