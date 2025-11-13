"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { postSchema } from "@/lib/validations";
import { t } from "@/lib/constants";

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    tags: string[];
  };
  mode?: "create" | "edit";
}

export function PostForm({ initialData, mode = "create" }: PostFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          tags: initialData.tags.join(", "),
        }
      : undefined,
  });

  // ホームページに戻った時にフォームをクリア
  // これにより、投稿後に戻った場合でもフォームが空の状態になる
  useEffect(() => {
    if (pathname === "/" && mode === "create" && !initialData) {
      reset({
        title: "",
        content: "",
        tags: "",
      });
    }
  }, [pathname, mode, initialData, reset]);

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const url =
        mode === "edit" && initialData
          ? `/api/posts/${initialData.id}`
          : "/api/posts";

      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          tags,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("ERROR_GENERIC"));
      }

      toast.success(
        mode === "edit" ? t("SUCCESS_UPDATED") : t("SUCCESS_CREATED")
      );

      // フォームをクリアして、次回の投稿時に空のフォームを表示
      if (mode === "create") {
        reset({
          title: "",
          content: "",
          tags: "",
        });
      }

      // API routeでrevalidatePath()が呼ばれているため、キャッシュは既に無効化されている
      // router.refresh()で最新データを取得し、その後新しい投稿ページに遷移する
      // これにより、ユーザーがブラウザの戻るボタンで戻った場合でも最新データが表示される
      router.refresh();
      router.push(`/posts/${result.post.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? `${t("EDIT")}` : t("NEW_POST")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("TITLE")}</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t("CONTENT")}</Label>
            <Textarea
              id="content"
              {...register("content")}
              rows={10}
              className="resize-y"
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t("TAGS_COMMA_SEPARATED")}</Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder={t("TAGS_PLACEHOLDER")}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("LOADING")
                : mode === "edit"
                ? `${t("EDIT")}`
                : `${t("POST")}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("CANCEL")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
