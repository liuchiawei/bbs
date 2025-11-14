"use client";

import { useState } from "react";
import { useRouter, redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "./avatar-upload";
import { toast } from "sonner";
import { motion } from "motion/react";
import type { User } from "@/lib/types";
import { t } from "@/lib/constants";
import { updateUserSchema } from "@/lib/validations";

type EditProfileFormData = z.infer<typeof updateUserSchema>;

export function EditProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      nickname: user.nickname || "",
      gender: user.gender || "",
      birthDate: user.birthDate
        ? new Date(user.birthDate).toISOString().split("T")[0]
        : "",
      avatar: user.avatar || "",
    },
  });

  // Avatar アップロード成功時のコールバック：表單状態とUI状態を同期
  const handleAvatarUploadSuccess = (url: string) => {
    setAvatarUrl(url); // UI状態を更新
    setValue("avatar", url); // 表單状態を同期
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("ERROR_GENERIC"));
      }

      toast.success(t("SUCCESS_UPDATED"));
      
      // user-updatedイベントを発火してNavbarコンポーネントに即座に更新を通知
      // revalidateTag()と組み合わせて、UIを即座に更新できるようにする
      window.dispatchEvent(new CustomEvent("user-updated"));
      
      router.refresh();
      router.push(`/user/${user.userId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
      redirect(`/user/${user.userId}`);
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
        <CardContent className="space-y-4">
          <AvatarUpload
            currentAvatar={avatarUrl}
            userName={user.name}
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
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="w-1/2">
                {isLoading ? t("LOADING") : t("SAVE")}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-1/2">
                {t("CANCEL")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
