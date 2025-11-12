import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/posts/post-card";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

async function getUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
      isAdmin: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.userId === user.id;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            {isOwnProfile && (
              <Button variant="outline" asChild>
                <Link href={`/users/${user.id}/edit`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{user._count.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{user._count.comments}</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
            {user.gender && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold capitalize">{user.gender}</p>
                <p className="text-sm text-muted-foreground">Gender</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-8">
          {user.posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No posts yet
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {user.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.birthDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Birthday</p>
                  <p className="font-medium">
                    {new Date(user.birthDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
