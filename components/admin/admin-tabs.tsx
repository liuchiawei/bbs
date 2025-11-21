"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostManagement } from "@/components/admin/post-management";
import { UserManagement } from "@/components/admin/user-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { ProfileManagement } from "@/components/admin/profile-management";
import { EventResultForm } from "@/components/admin/event-result-form";
import { RollbackPanel } from "@/components/admin/rollback-panel";
import { EventSyncButton } from "@/components/admin/event-sync-button";
import { t } from "@/lib/constants";

export function AdminTabs() {
  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5">
        <TabsTrigger value="categories">{t("CATEGORIES_MANAGEMENT")}</TabsTrigger>
        <TabsTrigger value="posts">{t("POSTS_MANAGEMENT")}</TabsTrigger>
        <TabsTrigger value="users">{t("USERS_MANAGEMENT")}</TabsTrigger>
        <TabsTrigger value="profiles">{t("PROFILE_MANAGEMENT")}</TabsTrigger>
        <TabsTrigger value="events">Events Management</TabsTrigger>
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

      <TabsContent value="profiles" className="mt-8">
        <ProfileManagement />
      </TabsContent>

      <TabsContent value="events" className="mt-8 space-y-8">
        <EventSyncButton />
        <EventResultForm />
        <RollbackPanel />
      </TabsContent>
    </Tabs>
  );
}
