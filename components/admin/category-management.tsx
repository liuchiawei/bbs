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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/types";
import { t } from "@/lib/constants";

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    displayOrder: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        // 削除されていないカテゴリのみ表示 / Only show non-deleted categories
        const activeCategories = (data.data || []).filter(
          (cat: Category) => !cat.deletedAt
        );
        setCategories(activeCategories);
      } else {
        toast.error(t("FAILED_TO_LOAD_CATEGORIES"));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error(t("FAILED_TO_LOAD_CATEGORIES"));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t("CATEGORY_NAME_REQUIRED");
    }

    if (formData.displayOrder < 1 || !Number.isInteger(formData.displayOrder)) {
      errors.displayOrder = t("DISPLAY_ORDER_INVALID");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t("CATEGORY_CREATED_SUCCESS"));
        setIsCreateDialogOpen(false);
        setFormData({ name: "", slug: "", description: "", displayOrder: 1 });
        setFormErrors({});
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || t("FAILED_TO_CREATE_CATEGORY"));
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error(t("FAILED_TO_CREATE_CATEGORY"));
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !validateForm()) return;

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t("CATEGORY_UPDATED_SUCCESS"));
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", slug: "", description: "", displayOrder: 1 });
        setFormErrors({});
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || t("FAILED_TO_UPDATE_CATEGORY"));
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error(t("FAILED_TO_UPDATE_CATEGORY"));
    }
  };

  const handleDelete = async () => {
    if (!deleteCategoryId) return;

    try {
      const response = await fetch(`/api/admin/categories/${deleteCategoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("CATEGORY_DELETED_SUCCESS"));
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || t("FAILED_TO_DELETE_CATEGORY"));
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(t("FAILED_TO_DELETE_CATEGORY"));
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      displayOrder: category.displayOrder,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ name: "", slug: "", description: "", displayOrder: 1 });
    setFormErrors({});
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("LOADING_CATEGORIES")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("CATEGORIES_MANAGEMENT")}</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t("ADD_CATEGORY")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("ADD_CATEGORY")}</DialogTitle>
              <DialogDescription>
                {t("ADD_CATEGORY_DESCRIPTION")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("CATEGORY_NAME")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("CATEGORY_NAME_PLACEHOLDER")}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="slug">{t("CATEGORY_SLUG")} (Optional)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder={t("CATEGORY_SLUG_PLACEHOLDER")}
                />
              </div>
              <div>
                <Label htmlFor="description">{t("CATEGORY_DESCRIPTION")} (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("CATEGORY_DESCRIPTION_PLACEHOLDER")}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="displayOrder">{t("DISPLAY_ORDER")}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 1,
                    })
                  }
                />
                {formErrors.displayOrder && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.displayOrder}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t("CANCEL")}
              </Button>
              <Button onClick={handleCreate}>{t("CREATE")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("CATEGORY_NAME")}</TableHead>
              <TableHead>{t("CATEGORY_SLUG")}</TableHead>
              <TableHead>{t("DISPLAY_ORDER")}</TableHead>
              <TableHead>{t("CATEGORY_DESCRIPTION")}</TableHead>
              <TableHead className="text-right">{t("ACTIONS")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("NO_CATEGORIES_FOUND")}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug || "-"}
                  </TableCell>
                  <TableCell>{category.displayOrder}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategoryId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("EDIT_CATEGORY")}</DialogTitle>
            <DialogDescription>
              {t("EDIT_CATEGORY_DESCRIPTION")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">{t("CATEGORY_NAME")}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("CATEGORY_NAME_PLACEHOLDER")}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-slug">{t("CATEGORY_SLUG")} (Optional)</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder={t("CATEGORY_SLUG_PLACEHOLDER")}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">
                {t("CATEGORY_DESCRIPTION")} (Optional)
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("CATEGORY_DESCRIPTION_PLACEHOLDER")}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-displayOrder">{t("DISPLAY_ORDER")}</Label>
              <Input
                id="edit-displayOrder"
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 1,
                  })
                }
              />
              {formErrors.displayOrder && (
                <p className="text-sm text-destructive mt-1">
                  {formErrors.displayOrder}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("CANCEL")}
            </Button>
            <Button onClick={handleEdit}>{t("SAVE")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={() => setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ARE_YOU_SURE")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("CATEGORY_DELETE_WARNING")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("CANCEL")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("DELETE")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

