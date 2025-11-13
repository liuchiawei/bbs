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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "motion/react";
import { t } from "@/lib/constants";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  displayOrder: number;
}

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    tags: string[];
  };
  mode?: "create" | "edit";
}

export function PostForm({ initialData, mode = "create" }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          categoryId: initialData.categoryId,
          tags: initialData.tags.join(", "),
        }
      : undefined,
  });

  const selectedCategory = watch("categoryId");

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          const fetchedCategories = data.data || [];
          setCategories(fetchedCategories);

          // Set default category to "General" if no initial data
          if (!initialData && fetchedCategories.length > 0) {
            const generalCategory = fetchedCategories.find(
              (cat: Category) => cat.displayOrder === 1
            );
            if (generalCategory) {
              setValue("categoryId", generalCategory.id);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error(t("ERROR_GENERIC"));
      }
    }
    fetchCategories();
  }, [initialData, setValue]);

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const tags = data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      const url = mode === "edit" && initialData
        ? `/api/posts/${initialData.id}`
        : "/api/posts";

      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
          tags,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("ERROR_GENERIC"));
      }

      toast.success(mode === "edit" ? t("SUCCESS_UPDATED") : t("SUCCESS_CREATED"));
      router.push(`/posts/${result.post.id}`);
      router.refresh();
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
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>
            {mode === "edit" ? `${t("EDIT")} ${t("POST")}` : t("NEW_POST")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("TITLE")}</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">{t("CATEGORY")}</Label>
              <Tabs
                value={selectedCategory || ""}
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <TabsList className="w-full grid grid-cols-4">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              {errors.categoryId && (
                <p className="text-sm text-destructive">
                  {errors.categoryId.message}
                </p>
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
                  ? `${t("EDIT")} ${t("POST")}`
                  : `${t("SUBMIT")} ${t("POST")}`}
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
    </motion.div>
  );
}
