"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { PostLikeButton } from "@/components/posts/post-like-button";
import { PostDeleteButton } from "@/components/posts/post-delete-button";
import { MessageCircle, Eye, Edit, X, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { TRANSLATIONS, type Language } from "@/lib/constants";

// TODO: Get language from user preferences or browser settings
const lang: Language = 'en';
const t = TRANSLATIONS[lang];

const postSchema = z.object({
  title: z.string().min(1, t.TITLE_REQUIRED),
  content: z.string().min(1, t.CONTENT_REQUIRED),
  categoryId: z.string().min(1, t.CATEGORY_REQUIRED),
  tags: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category: Category;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    userId: string;
    name: string;
    nickname?: string | null;
    avatar: string | null;
  };
  comments: Array<{
    id: string;
    content: string;
    likes: number;
    replies: number;
    createdAt: string;
    userId: string;
    postId: string;
    parentId: string | null;
    user: {
      id: string;
      userId: string;
      name: string;
      nickname?: string | null;
      avatar: string | null;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface Session {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  birthDate: string | null;
  avatar: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [postId, setPostId] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
    }
    init();
  }, [params]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!postId) return;

    async function fetchData() {
      try {
        // Fetch post
        const postResponse = await fetch(`/api/posts/${postId}`);
        if (!postResponse.ok) {
          router.push("/404");
          return;
        }
        const postData = await postResponse.json();
        setPost(postData.post);

        // Fetch session
        const sessionResponse = await fetch("/api/auth/me");
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSession(sessionData.user);

          // Check if user liked the post
          if (sessionData.user) {
            const likeResponse = await fetch(`/api/posts/${postId}/like/check`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              setIsLiked(likeData.isLiked);
            }
          }
        }

        // Set form default values
        reset({
          title: postData.post.title,
          content: postData.post.content,
          categoryId: postData.post.categoryId,
          tags: postData.post.tags.join(", "),
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(t.FAILED_TO_LOAD_POST);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [postId, router, reset]);

  const onSubmit = async (data: PostFormData) => {
    const loadingToast = toast.loading(t.UPDATING_POST);
    try {
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
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
        throw new Error(result.error || t.FAILED_TO_UPDATE_POST);
      }

      toast.dismiss(loadingToast);
      toast.success(t.POST_UPDATED_SUCCESS);
      setPost(result.post);
      setIsEditing(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : t.FAILED_TO_UPDATE_POST
      );
    }
  };

  const handleCancel = () => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
        categoryId: post.categoryId,
        tags: post.tags.join(", "),
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{t.LOADING}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isOwner = session?.id === post.user.id;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/users/${post.user.id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.user.avatar || undefined} />
                  <AvatarFallback>
                    {post.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  href={`/users/${post.user.id}`}
                  className="font-medium hover:underline"
                >
                  {post.user.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && <Badge>{post.category.name}</Badge>}
              {isOwner && (
                <>
                  {!isEditing ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.EDIT}</TooltipContent>
                      </Tooltip>
                      <PostDeleteButton postId={post.id} />
                    </>
                  ) : (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="default"
                            onClick={handleSubmit(onSubmit)}
                          >
                            <Save className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.SAVE}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.CANCEL}</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t.TITLE}</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">{t.CATEGORY}</Label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">{t.SELECT_CATEGORY}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">{t.TAGS_COMMA_SEPARATED}</Label>
                <Input
                  id="tags"
                  {...register("tags")}
                  placeholder="e.g. javascript, react, nextjs"
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="content">{t.CONTENT}</Label>
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
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          )}

          {!isEditing && (
            <>
              <Separator />

              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{post.views} {t.VIEWS}</span>
                </div>
                <PostLikeButton
                  postId={post.id}
                  initialLikes={post.likes}
                  initialIsLiked={isLiked}
                  isAuthenticated={!!session}
                />
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post._count.comments} {t.COMMENTS.toLowerCase()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{t.COMMENTS}</h2>

                {session ? (
                  <CommentForm postId={post.id} />
                ) : (
                  <div className="text-center py-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground">
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
                        {t.LOGIN}
                      </Link>{" "}
                      {t.LOGIN_TO_COMMENT}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {post.comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t.NO_COMMENTS_BE_FIRST}
                    </p>
                  ) : (
                    post.comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={{
                          ...comment,
                          updatedAt: comment.createdAt,
                        }}
                        postId={post.id}
                        currentUserId={session?.id}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
