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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import { formatAdminDate } from "@/lib/utils/admin";
import { t } from "@/lib/constants";

interface ProfileListItem extends Profile {
  user?: {
    userId: string;
    email: string;
    isAdmin: boolean;
    isBanned: boolean;
  };
}

export function ProfileManagement() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProfiles();
  }, [page]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/profiles?page=${page}&limit=20&includeDeleted=true`
      );
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.data || []);
        setPagination(data.pagination);
      } else {
        toast.error(t("ERROR_GENERIC"));
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
      toast.error(t("ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/profiles/${userId}/restore`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to restore profile");
      }

      toast.success(t("SUCCESS_RESTORED"));
      fetchProfiles();
    } catch (error) {
      toast.error(t("ERROR_GENERIC"));
    }
  };


  if (isLoading) {
    return <div className="text-center py-8">{t("LOADING")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("PROFILE_MANAGEMENT")}</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("NAME")}</TableHead>
            <TableHead>{t("EMAIL")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{t("CREATED_AT")}</TableHead>
            <TableHead>{t("ACTIONS")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                {t("NO_PROFILES_FOUND")}
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          typeof profile.avatar === "string"
                            ? profile.avatar
                            : profile.avatar
                            ? String(profile.avatar)
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/user/${profile.userId}`}
                      className="font-medium hover:underline"
                    >
                      {profile.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {profile.user?.email || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {profile.deletedAt ? (
                      <Badge variant="destructive">{t("DELETED")}</Badge>
                    ) : (
                      <Badge variant="default">{t("ACTIVE")}</Badge>
                    )}
                    {profile.user?.isAdmin && (
                      <Badge variant="default">Admin</Badge>
                    )}
                    {profile.user?.isBanned && (
                      <Badge variant="destructive">{t("BANNED")}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatAdminDate(profile.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/user/${profile.userId}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    {profile.deletedAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(profile.userId)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t("PREVIOUS")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("PAGE")} {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
          >
            {t("NEXT")}
          </Button>
        </div>
      )}
    </div>
  );
}
