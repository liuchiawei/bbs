/**
 * Fight Card Parser Utilities
 * 對戰卡解析工具函數
 * Parse fight card text to extract fighter information
 */

export interface ParsedFight {
  weightClass: string;
  fighter1: string;
  fighter2: string;
  method?: string;
  round?: string;
  time?: string;
  notes?: string;
}

/**
 * Parse fight card text into structured data
 * 解析對戰卡文字為結構化數據
 * Same logic as in EventFightCard component
 */
export function parseFightCard(fightCardText: string): ParsedFight[] {
  if (!fightCardText) return [];

  const fights: ParsedFight[] = [];
  const lines = fightCardText.split(/\r?\n/).filter((line) => line.trim());

  // Skip header lines (Fight card, Weight class, etc.)
  // 跳過標題行
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Weight class") || lines[i].includes("Method")) {
      startIndex = i + 1;
      break;
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.includes("Weight class") || line.includes("Method")) {
      continue;
    }

    // Parse fight line: "Lightweight \tArman Tsarukyan \tvs. \tDan Hooker"
    // 解析對戰行
    const parts = line.split(/\t+/).filter((p) => p.trim());
    if (parts.length >= 3) {
      const weightClass = parts[0].trim();
      const fighter1 = parts[1].trim();
      const vsIndex = parts.findIndex((p) => p.toLowerCase().includes("vs"));

      if (vsIndex > 0 && vsIndex < parts.length - 1) {
        const fighter2 = parts[vsIndex + 1].trim();

        fights.push({
          weightClass,
          fighter1,
          fighter2,
          method: parts[vsIndex + 2]?.trim() || undefined,
          round: parts[vsIndex + 3]?.trim() || undefined,
          time: parts[vsIndex + 4]?.trim() || undefined,
          notes: parts[vsIndex + 5]?.trim() || undefined,
        });
      }
    }
  }

  return fights;
}

