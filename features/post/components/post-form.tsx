"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PostCardHeader from "@/features/post/components/post-card-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { postSchema } from "@/lib/validations";
import { t } from "@/lib/constants";
import type { Category, Event } from "@/lib/types";

type PostFormData = z.infer<typeof postSchema> & { eventId?: string };

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    categoryId?: string | null;
    eventId?: string | null;
  };
  mode?: "create" | "edit";
}

export function PostForm({
  initialData,
  mode = "create",
}: PostFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none");
  const [selectedEventId, setSelectedEventId] = useState<string>("none");

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

  // 初期データのカテゴリとイベントIDを設定
  useEffect(() => {
    if (initialData) {
      if (initialData.categoryId) setSelectedCategoryId(initialData.categoryId);
      if (initialData.eventId) setSelectedEventId(initialData.eventId);
    }
  }, [initialData]);

  // カテゴリリストを取得 / Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 公開APIから取得 / Get from public API
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          // displayOrderでソート / Sort by displayOrder
          const sortedCategories = (data.data || []).sort(
            (a: Category, b: Category) => a.displayOrder - b.displayOrder
          );
          setCategories(sortedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();

    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events?status=OPEN");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  // ホームページに戻った時にフォームをクリア
  // これにより、投稿後に戻った場合でもフォームが空の状態になる
  useEffect(() => {
    if (pathname === "/" && mode === "create" && !initialData) {
      reset({
        title: "",
        content: "",
        tags: "",
      });
      setSelectedCategoryId("none");
      setSelectedEventId("none");
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
          categoryId: selectedCategoryId === "none" ? null : selectedCategoryId,
          eventId: selectedEventId === "none" ? null : selectedEventId,
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
        setSelectedCategoryId("none");
        setSelectedEventId("none");
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
    <Card className="w-full">
      <CardContent>
        <PostCardHeader />
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

          <div className="space-y-2">
            <Label htmlFor="category">{t("CATEGORY")}</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t("SELECT_CATEGORY")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("NO_CATEGORY")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Event (Optional)</Label>
            <Select
              value={selectedEventId}
              onValueChange={setSelectedEventId}
            >
              <SelectTrigger id="event">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Event</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} ({new Date(event.fight_date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

