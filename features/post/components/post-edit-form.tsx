"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Edit, X, Save } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/constants";
import type { Category, Event } from "@/lib/types";

// フォーム用のスキーマ（tagsは文字列として扱う）
const postFormSchema = z.object({
  title: z.string().min(1, t("ALERT_TITLE_REQUIRED")),
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")),
  tags: z.string().optional(),
});

type PostFormData = z.infer<typeof postFormSchema>;

interface PostEditFormProps {
  postId: string;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
  initialCategoryId?: string | null;
  initialEventId?: string | null;
  onCancel: () => void;
}

export function PostEditForm({
  postId,
  initialTitle,
  initialContent,
  initialTags,
  initialCategoryId,
  initialEventId,
  onCancel,
}: PostEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId || ""
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || ""
  );

  // カテゴリリストを取得 / Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialTitle,
      content: initialContent,
      tags: initialTags.join(", "),
    },
  });

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(t("UPDATING_POST"));
    try {
      // カンマ区切りの文字列を配列に変換
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          tags: tags,
          categoryId: selectedCategoryId || null,
          eventId: selectedEventId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("FAILED_TO_UPDATE_POST"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("POST_UPDATED_SUCCESS"));
      router.refresh();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : t("FAILED_TO_UPDATE_POST")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset({
      title: initialTitle,
      content: initialContent,
      tags: initialTags.join(", "),
    });
    setSelectedCategoryId(initialCategoryId || "");
    setSelectedEventId(initialEventId || "");
    onCancel();
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="default"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Save className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("SAVE")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("CANCEL")}</TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t("TITLE")}</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">{t("TAGS_COMMA_SEPARATED")}</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="e.g. javascript, react, nextjs"
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
              <SelectItem value="">{t("NO_CATEGORY")}</SelectItem>
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
              <SelectItem value="">No Event</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} ({new Date(event.fight_date).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <Label htmlFor="content">{t("CONTENT")}</Label>
        <Textarea
          id="content"
          {...register("content")}
          rows={10}
          className="resize-y"
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>
    </>
  );
}




