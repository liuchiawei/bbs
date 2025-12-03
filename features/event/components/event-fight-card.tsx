"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users } from "lucide-react";
import { FighterLink } from "@/features/fighter/components/fighter-link";

/**
 * Fight Card Component
 * 對戰卡組件
 * Displays fight card information parsed from strResult field
 */

interface Fight {
  weightClass: string;
  fighter1: string;
  fighter2: string;
  method?: string;
  round?: string;
  time?: string;
  notes?: string;
}

interface EventFightCardProps {
  fightCardText?: string | null;
  eventName: string;
}

/**
 * Parse fight card text into structured data
 * 解析對戰卡文字為結構化數據
 */
function parseFightCard(fightCardText: string): Fight[] {
  if (!fightCardText) return [];

  const fights: Fight[] = [];
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

/**
 * Event Fight Card Component
 * 賽事對戰卡組件
 */
export function EventFightCard({
  fightCardText,
  eventName,
}: EventFightCardProps) {
  if (!fightCardText) {
    return null;
  }

  const fights = parseFightCard(fightCardText);

  if (fights.length === 0) {
    // If parsing fails, display raw text
    // 如果解析失敗，顯示原始文字
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Fight Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
            {fightCardText}
          </pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Fight Card
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {fights.length} fight{fights.length !== 1 ? "s" : ""} scheduled
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {fights.map((fight, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {fight.weightClass}
              </Badge>
              {index === 0 && (
                <Badge variant="default" className="text-xs">
                  Main Event
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 text-center">
                <FighterLink name={fight.fighter1} className="text-sm" />
              </div>
              <div className="px-4 text-muted-foreground font-bold">VS</div>
              <div className="flex-1 text-center">
                <FighterLink name={fight.fighter2} className="text-sm" />
              </div>
            </div>
            {fight.method && (
              <div className="text-xs text-muted-foreground text-center">
                {fight.method}
                {fight.round && ` • Round ${fight.round}`}
                {fight.time && ` • ${fight.time}`}
              </div>
            )}
            {index < fights.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

