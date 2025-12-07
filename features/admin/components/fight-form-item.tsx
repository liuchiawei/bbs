"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FighterSelect } from "./fighter-select";
import { X } from "lucide-react";

interface Fight {
  fighterId: string;
  opponentId: string;
  fightType: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
  fightOrder: number;
  weightClass?: string;
  isBettable?: boolean;
}

interface FightFormItemProps {
  fight: Fight;
  index: number;
  sportType?: string;
  onUpdate: (index: number, fight: Partial<Fight>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const fightTypeLabels = {
  MAIN: "主賽 / Main Event",
  CO_MAIN: "副賽 / Co-Main Event",
  PRELIMS: "預賽 / Prelims",
  EARLY_PRELIMS: "早期預賽 / Early Prelims",
};

export function FightFormItem({
  fight,
  index,
  sportType,
  onUpdate,
  onRemove,
  canRemove,
}: FightFormItemProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            對戰 #{fight.fightOrder} / Fight #{fight.fightOrder}
          </CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FighterSelect
            value={fight.fighterId}
            onValueChange={(value) =>
              onUpdate(index, { fighterId: value })
            }
            sportType={sportType}
            label="選手1 / Fighter 1"
            placeholder="選擇選手1 / Select fighter 1"
            required
          />
          <FighterSelect
            value={fight.opponentId}
            onValueChange={(value) =>
              onUpdate(index, { opponentId: value })
            }
            sportType={sportType}
            label="選手2 / Fighter 2"
            placeholder="選擇選手2 / Select fighter 2"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`fight-type-${index}`}>
              對戰類型 / Fight Type
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={fight.fightType}
              onValueChange={(value: Fight["fightType"]) =>
                onUpdate(index, { fightType: value })
              }
              required
            >
              <SelectTrigger id={`fight-type-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fightTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`fight-order-${index}`}>
              對戰順序 / Fight Order
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={`fight-order-${index}`}
              type="number"
              min="1"
              value={fight.fightOrder}
              onChange={(e) =>
                onUpdate(index, {
                  fightOrder: parseInt(e.target.value) || 1,
                })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`weight-class-${index}`}>
            量級 / Weight Class (可選 / Optional)
          </Label>
          <Input
            id={`weight-class-${index}`}
            value={fight.weightClass || ""}
            onChange={(e) =>
              onUpdate(index, { weightClass: e.target.value || undefined })
            }
            placeholder="例如：Heavyweight, 155 lbs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            title="開放預測 / Bettable"
            type="checkbox"
            id={`is-bettable-${index}`}
            checked={fight.isBettable !== false}
            onChange={(e) =>
              onUpdate(index, { isBettable: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label
            htmlFor={`is-bettable-${index}`}
            className="text-sm font-normal cursor-pointer"
          >
            開放預測 / Bettable
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

