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
import { Eye, MessageCircle, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { AdminPostListItem } from "@/lib/types";
import { t } from "@/lib/constants";

export function PostManagement() {
  const [posts, setPosts] = useState<AdminPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/posts?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
        setPagination(data.pagination);
      } else {
        toast.error(t("FAILED_TO_LOAD_POSTS"));
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error(t("FAILED_TO_LOAD_POSTS"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      const response = await fetch(`/api/admin/posts/${deletePostId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("POST_DELETED_SUCCESS"));
        fetchPosts();
      } else {
        toast.error(t("FAILED_TO_DELETE_POST"));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(t("FAILED_TO_DELETE_POST"));
    } finally {
      setDeletePostId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("LOADING_POSTS")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("POSTS_MANAGEMENT")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("TOTAL")}: {pagination.total} {t("POSTS").toLowerCase()}
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("TITLE")}</TableHead>
              <TableHead>{t("AUTHOR")}</TableHead>
              <TableHead className="text-center">{t("VIEWS")}</TableHead>
              <TableHead className="text-center">{t("LIKES")}</TableHead>
              <TableHead className="text-center">{t("COMMENTS")}</TableHead>
              <TableHead>{t("CREATED")}</TableHead>
              <TableHead className="text-right">{t("ACTIONS")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t("NO_POSTS_FOUND")}
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-md truncate">
                    {post.title}
                  </TableCell>
                  <TableCell>{post.user.name}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{post.likes}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post._count.comments}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/posts/${post.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletePostId(post.id)}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t("PREVIOUS")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("PAGE")} {page} {t("OF")} {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            {t("NEXT")}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ARE_YOU_SURE")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("DELETE_POST_CONFIRMATION")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("CANCEL")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("DELETE")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
