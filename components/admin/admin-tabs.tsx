"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostManagement } from "@/components/admin/post-management";
import { UserManagement } from "@/components/admin/user-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { t } from "@/lib/constants";

export function AdminTabs() {
  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
        <TabsTrigger value="categories">{t("CATEGORIES_MANAGEMENT")}</TabsTrigger>
        <TabsTrigger value="posts">{t("POSTS_MANAGEMENT")}</TabsTrigger>
        <TabsTrigger value="users">{t("USERS_MANAGEMENT")}</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="mt-8">
        <CategoryManagement />
      </TabsContent>

      <TabsContent value="posts" className="mt-8">
        <PostManagement />
      </TabsContent>

      <TabsContent value="users" className="mt-8">
        <UserManagement />
      </TabsContent>
    </Tabs>
  );
}
