"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PostManagement } from "@/components/admin/post-management";
import { UserManagement } from "@/components/admin/user-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { ProfileManagement } from "@/components/admin/profile-management";
import { EventResultForm } from "@/components/admin/event-result-form";
import { RollbackPanel } from "@/components/admin/rollback-panel";
import { EventSyncButton } from "@/components/admin/event-sync-button";
import { EventCreateForm } from "@/components/admin/event-create-form";
import { FighterCreateForm } from "@/components/admin/fighter-create-form";
import { t } from "@/lib/constants";
import { MessageSquare, Users, Database } from "lucide-react";

export function AdminTabs() {
  return (
    <div className="space-y-6">
      {/* 第一區：討論區管理 / Forum Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t("FORUM_MANAGEMENT")}</CardTitle>
              <CardDescription>
                管理分類與文章內容 / Manage categories and posts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">
                {t("CATEGORIES_MANAGEMENT")}
              </TabsTrigger>
              <TabsTrigger value="posts">{t("POSTS_MANAGEMENT")}</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="mt-6">
              <CategoryManagement />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <PostManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 第二區：用戶管理 / User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t("USER_MANAGEMENT_SECTION")}</CardTitle>
              <CardDescription>
                管理用戶帳號與個人資料 / Manage user accounts and profiles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">{t("USERS_MANAGEMENT")}</TabsTrigger>
              <TabsTrigger value="profiles">{t("PROFILE_MANAGEMENT")}</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="profiles" className="mt-6">
              <ProfileManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 第三區：資料管理 / Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t("DATA_MANAGEMENT")}</CardTitle>
              <CardDescription>
                管理賽事與選手資料 / Manage events and fighters data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">{t("EVENTS_MANAGEMENT")}</TabsTrigger>
              <TabsTrigger value="fighters">{t("FIGHTERS_MANAGEMENT")}</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-6 space-y-6">
              <EventCreateForm />
              <EventSyncButton />
              <EventResultForm />
              <RollbackPanel />
            </TabsContent>

            <TabsContent value="fighters" className="mt-6">
              <FighterCreateForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
