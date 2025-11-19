"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileVisibilitySettings, ProfileVisibility } from "@/lib/types";
import { t } from "@/lib/constants";

interface ProfileVisibilitySettingsProps {
  currentVisibility: ProfileVisibilitySettings;
  onChange: (visibility: ProfileVisibilitySettings) => void;
  onSave: (visibility: ProfileVisibilitySettings) => Promise<void>;
}

const visibilityOptions: { value: ProfileVisibility; label: string }[] = [
  { value: "public", label: t("PUBLIC") },
  { value: "friends", label: t("FRIENDS_ONLY") },
  { value: "private", label: t("PRIVATE") },
];

const profileFields = [
  { key: "name", label: t("NAME_LABEL") },
  { key: "nickname", label: t("NICKNAME_LABEL") },
  { key: "gender", label: t("GENDER") },
  { key: "birthDate", label: t("BIRTH_DATE_OPTIONAL") },
  { key: "avatar", label: t("AVATAR") },
  { key: "height", label: t("HEIGHT") },
  { key: "weight", label: t("WEIGHT") },
  { key: "description", label: t("DESCRIPTION") },
  { key: "record", label: t("RECORD") },
  { key: "train_start", label: t("TRAIN_START_YEAR") },
  { key: "stance", label: t("STANCE") },
  { key: "gym", label: t("GYM") },
] as const;

export function ProfileVisibilitySettings({
  currentVisibility,
  onChange,
  onSave,
}: ProfileVisibilitySettingsProps) {
  const [visibility, setVisibility] =
    useState<ProfileVisibilitySettings>(currentVisibility);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (
    field: keyof ProfileVisibilitySettings,
    value: ProfileVisibility
  ) => {
    const newVisibility = {
      ...visibility,
      [field]: value,
    };
    setVisibility(newVisibility);
    onChange(newVisibility);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(visibility);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("VISIBILITY_SETTINGS")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("VISIBILITY_SETTINGS_DESCRIPTION")}
        </p>

        <div className="space-y-4">
          {profileFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <Label htmlFor={field.key} className="flex-1">
                {field.label}
              </Label>
              <Select
                value={visibility[field.key] || "public"}
                onValueChange={(value) =>
                  handleFieldChange(
                    field.key as keyof ProfileVisibilitySettings,
                    value as ProfileVisibility
                  )
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? t("LOADING") : t("SAVE")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

