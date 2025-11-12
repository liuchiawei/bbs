"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import type { Category } from "@/lib/types";

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: category.id,
          isActive: !category.isActive,
        }),
      });

      if (response.ok) {
        toast.success(
          `Category ${!category.isActive ? "activated" : "deactivated"}`
        );
        fetchCategories();
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error("Failed to toggle category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchCategories();
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Display Order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-center">{category.displayOrder}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                      {category.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
