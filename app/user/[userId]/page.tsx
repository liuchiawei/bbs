import { getSession } from "@/lib/auth";
import { getUserProfilePage } from "@/lib/services/users";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import { Settings } from "lucide-react";
import type { PostWithUser, UserProfilePage } from "@/lib/types";
import { t } from "@/lib/constants";

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [session, userData] = await Promise.all([
    getSession(),
    getUserProfilePage(userId),
  ]);

  if (!userData) {
    notFound();
  }

  const user = userData as UserProfilePage;
  const profile = user.profile;

  const isOwnProfile = session?.userId === user.userId;

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="text-3xl">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">
                  {profile.nickname ? profile.nickname : profile.name}
                </h1>
                {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
              </div>
              <p className="text-muted-foreground">@{user.userId}</p>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {t("JOINED")}{" "}
                  {new Date(user.createdAt ?? "").toLocaleDateString()}
                </p>
                <Badge variant="secondary" className="text-sm">
                  {user.points ?? 0} {t("POINTS")}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href={`/user/${user.userId}/posts`}>
              <div className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                <p className="text-2xl font-bold">{user._count.posts}</p>
                <p className="text-sm text-muted-foreground">{t("POSTS")}</p>
              </div>
            </Link>
            <Link href={`/user/${user.userId}/comments`}>
              <div className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                <p className="text-2xl font-bold">{user._count.comments}</p>
                <p className="text-sm text-muted-foreground">{t("COMMENTS")}</p>
              </div>
            </Link>
            <Link href={`/user/${user.userId}/likes`}>
              <div className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                <p className="text-2xl font-bold">
                  {user._count.likedPosts + user._count.likedComments}
                </p>
                <p className="text-sm text-muted-foreground">{t("LIKES")}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="about">{t("ABOUT")}</TabsTrigger>
          <TabsTrigger value="posts">{t("POSTS")}</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl md:text-3xl font-bold">
                  {t("ABOUT")}
                </CardTitle>
                {isOwnProfile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/user/${user.userId}/edit`}>
                          <Settings className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("EDIT_PROFILE")}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.name && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("NAME")}</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
              )}
              {profile.birthDate && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("BIRTHDAY")}
                  </p>
                  <p className="font-medium">
                    {new Date(profile.birthDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {profile.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("GENDER")}</p>
                  <p className="font-medium">{profile.gender}</p>
                </div>
              )}
              {profile.height && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("HEIGHT")}</p>
                  <p className="font-medium">{profile.height} cm</p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("WEIGHT")}</p>
                  <p className="font-medium">{profile.weight} kg</p>
                </div>
              )}
              {profile.description && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("DESCRIPTION")}</p>
                  <p className="font-medium whitespace-pre-wrap">{profile.description}</p>
                </div>
              )}
              {profile.record && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("RECORD")}</p>
                  <p className="font-medium">{profile.record}</p>
                </div>
              )}
              {profile.train_start && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("TRAIN_START_YEAR")}</p>
                  <p className="font-medium">{profile.train_start}</p>
                </div>
              )}
              {profile.stance && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("STANCE")}</p>
                  <p className="font-medium">{profile.stance}</p>
                </div>
              )}
              {profile.gym && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("GYM")}</p>
                  <p className="font-medium">{profile.gym}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("MEMBER_SINCE")}
                </p>
                <p className="font-medium">
                  {new Date(user.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4 mt-8">
          {user.posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {t("NO_POSTS_YET")}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {user.posts.map((post) => (
                <PostCard key={post.id} post={post as PostWithUser} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
