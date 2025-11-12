"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Category } from "@/lib/types";

const categoryFormSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
  });

  useEffect(() => {
    if (category) {
      reset({
        slug: category.slug,
        name: category.name,
        description: category.description || "",
        displayOrder: category.displayOrder,
      });
    } else {
      reset({
        slug: "",
        name: "",
        description: "",
        displayOrder: 0,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const url = "/api/admin/categories";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit ? { id: category.id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEdit ? "update" : "create"} category`);
      }

      toast.success(`Category ${isEdit ? "updated" : "created"} successfully!`);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEdit ? "update" : "create"} category`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Create New Category"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update category information" : "Add a new category to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Technology" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="tech"
              disabled={isEdit}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            {isEdit && (
              <p className="text-sm text-muted-foreground">
                Slug cannot be changed after creation
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Technology, programming, and development"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              {...register("displayOrder")}
              placeholder="0"
            />
            {errors.displayOrder && (
              <p className="text-sm text-destructive">{errors.displayOrder.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
