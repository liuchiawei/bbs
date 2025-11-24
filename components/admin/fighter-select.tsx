"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Fighter {
  id: string;
  name: string;
  slug?: string;
  sport_type?: string;
}

interface FighterSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  sportType?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function FighterSelect({
  value,
  onValueChange,
  sportType,
  label = "選手 / Fighter",
  placeholder = "選擇選手 / Select fighter",
  required = false,
}: FighterSelectProps) {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFighters();
  }, [sportType]);

  const fetchFighters = async () => {
    setIsLoading(true);
    try {
      // 獲取選手列表（可以根據運動類型過濾）
      // Fetch fighters list (can filter by sport type)
      const url = sportType
        ? `/api/fighters?sport_type=${sportType}`
        : "/api/fighters";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFighters(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch fighters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFighters = fighters.filter((fighter) =>
    fighter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={`fighter-select-${value || "new"}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger id={`fighter-select-${value || "new"}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="搜尋選手 / Search fighter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : filteredFighters.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              沒有找到選手 / No fighters found
            </div>
          ) : (
            filteredFighters.map((fighter) => (
              <SelectItem key={fighter.id} value={fighter.id}>
                {fighter.name}
                {fighter.sport_type && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({fighter.sport_type})
                  </span>
                )}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

