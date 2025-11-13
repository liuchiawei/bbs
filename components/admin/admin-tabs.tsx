"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostManagement } from "@/components/admin/post-management";
import { UserManagement } from "@/components/admin/user-management";

export function AdminTabs() {
  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-8">
        <PostManagement />
      </TabsContent>

      <TabsContent value="users" className="mt-8">
        <UserManagement />
      </TabsContent>
    </Tabs>
  );
}
