"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUpload } from "./avatar-upload";
import { ProfileVisibilitySettings } from "./profile-visibility-settings";
import { toast } from "sonner";
import { motion } from "motion/react";
import type {
  Profile,
  UserWithProfile,
  ProfileVisibilitySettings as ProfileVisibilitySettingsType,
} from "@/lib/types";
import { t } from "@/lib/constants";
import { updateProfileSchema } from "@/lib/validations";

type EditProfileFormData = z.infer<typeof updateProfileSchema>;

export function EditProfileForm({ user }: { user: UserWithProfile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.profile.avatar);
  const profile = user.profile;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      nickname: profile.nickname || "",
      gender: profile.gender || "",
      birthDate: profile.birthDate
        ? new Date(profile.birthDate).toISOString().split("T")[0]
        : "",
      avatar: profile.avatar || "",
      height: profile.height || undefined,
      weight: profile.weight || undefined,
      description: profile.description || "",
      record: profile.record || "",
      train_start: profile.train_start || undefined,
      stance: profile.stance || "",
      gym: profile.gym || "",
      visibility: profile.visibility || {},
    },
  });

  const visibility = watch("visibility");

  // Avatar アップロード成功時のコールバック
  const handleAvatarUploadSuccess = (url: string) => {
    setAvatarUrl(url);
    setValue("avatar", url);
  };

  // 可見性設定更新
  const handleVisibilityChange = (
    newVisibility: ProfileVisibilitySettingsType
  ) => {
    setValue("visibility", newVisibility);
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profile/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          birthDate: data.birthDate || null,
          height: data.height || null,
          weight: data.weight || null,
          description: data.description || null,
          record: data.record || null,
          train_start: data.train_start || null,
          stance: data.stance || null,
          gym: data.gym || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("ERROR_GENERIC"));
      }

      toast.success(t("SUCCESS_UPDATED"));

      // user-updatedイベントを発火
      window.dispatchEvent(new CustomEvent("user-updated"));

      router.refresh();
      router.push(`/user/${user.userId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{`${t("EDIT")} ${t("PROFILE")}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{t("BASIC_INFO")}</TabsTrigger>
              <TabsTrigger value="visibility">
                {t("VISIBILITY_SETTINGS")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <AvatarUpload
                currentAvatar={avatarUrl}
                userName={profile.name}
                onUploadSuccess={handleAvatarUploadSuccess}
              />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("NAME_LABEL")}</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">{t("NICKNAME_LABEL")}</Label>
                  <Input id="nickname" {...register("nickname")} />
                  {errors.nickname && (
                    <p className="text-sm text-destructive">
                      {errors.nickname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("EMAIL")} ({t("CANNOT_BE_CHANGED")})
                  </Label>
                  <Input id="email" value={user.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t("GENDER")}</Label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">{t("SELECT_GENDER")}</option>
                    <option value="male">{t("MALE")}</option>
                    <option value="female">{t("FEMALE")}</option>
                    <option value="other">{t("OTHER")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">{t("BIRTH_DATE_OPTIONAL")}</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register("birthDate")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">{t("HEIGHT")} (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      max="300"
                      {...register("height", { valueAsNumber: true })}
                    />
                    {errors.height && (
                      <p className="text-sm text-destructive">
                        {errors.height.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">{t("WEIGHT")} (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="500"
                      {...register("weight", { valueAsNumber: true })}
                    />
                    {errors.weight && (
                      <p className="text-sm text-destructive">
                        {errors.weight.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("DESCRIPTION")}</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    maxLength={1000}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="record">{t("RECORD")}</Label>
                  <Input id="record" {...register("record")} />
                  {errors.record && (
                    <p className="text-sm text-destructive">
                      {errors.record.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="train_start">{t("TRAIN_START_YEAR")}</Label>
                    <Input
                      id="train_start"
                      type="number"
                      min="1900"
                      max="2100"
                      {...register("train_start", { valueAsNumber: true })}
                    />
                    {errors.train_start && (
                      <p className="text-sm text-destructive">
                        {errors.train_start.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stance">{t("STANCE")}</Label>
                    <Input id="stance" {...register("stance")} />
                    {errors.stance && (
                      <p className="text-sm text-destructive">
                        {errors.stance.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gym">{t("GYM")}</Label>
                  <Input id="gym" {...register("gym")} />
                  {errors.gym && (
                    <p className="text-sm text-destructive">
                      {errors.gym.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="w-1/2">
                    {isLoading ? t("LOADING") : t("SAVE")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-1/2"
                  >
                    {t("CANCEL")}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="visibility" className="space-y-4 mt-4">
              <ProfileVisibilitySettings
                currentVisibility={visibility || {}}
                onChange={handleVisibilityChange}
                onSave={async (newVisibility) => {
                  setIsLoading(true);
                  try {
                    const response = await fetch(
                      `/api/profile/${user.userId}/visibility`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ visibility: newVisibility }),
                      }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                      throw new Error(result.error || t("ERROR_GENERIC"));
                    }

                    toast.success(t("SUCCESS_UPDATED"));
                    window.dispatchEvent(new CustomEvent("user-updated"));
                    router.refresh();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : t("ERROR_GENERIC")
                    );
                  } finally {
                    setIsLoading(false);
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
