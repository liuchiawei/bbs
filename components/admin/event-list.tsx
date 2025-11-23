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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { AdminEventListItem } from "@/lib/types";
import { formatAdminDate } from "@/lib/utils/admin";
import { t } from "@/lib/constants";

export function EventList() {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/events?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
        setPagination(data.pagination);
      } else {
        toast.error(t("ERROR_GENERIC"));
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error(t("ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (
    status: AdminEventListItem["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "secondary";
      case "SETTLED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      case "PENDING":
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: AdminEventListItem["status"]): string => {
    switch (status) {
      case "PENDING":
        return t("PENDING") || "Pending";
      case "OPEN":
        return t("OPEN") || "Open";
      case "CLOSED":
        return t("CLOSED") || "Closed";
      case "SETTLED":
        return t("SETTLED") || "Settled";
      case "CANCELLED":
        return t("CANCELLED") || "Cancelled";
      default:
        return status;
    }
  };

  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) {
              setPage(currentPage - 1);
            }
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    // Page numbers
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(i);
              }}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(1);
            }}
            isActive={1 === currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(i);
              }}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(totalPages);
            }}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
              setPage(currentPage + 1);
            }
          }}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    return items;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("LOADING")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("EVENTS_MANAGEMENT")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("TOTAL")}: {pagination.total} {t("EVENTS")?.toLowerCase() || "events"}
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("NAME") || "Name"}</TableHead>
              <TableHead>{t("DATE") || "Date"}</TableHead>
              <TableHead className="text-center">{t("STATUS") || "Status"}</TableHead>
              <TableHead>{t("SPORT_TYPE") || "Sport Type"}</TableHead>
              <TableHead className="text-center">{t("FIGHTS") || "Fights"}</TableHead>
              <TableHead className="text-center">{t("BETS") || "Bets"}</TableHead>
              <TableHead className="text-center">{t("POSTS") || "Posts"}</TableHead>
              <TableHead className="text-right">{t("ACTIONS")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t("NO_EVENTS_FOUND") || "No events found"}
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium max-w-md truncate">
                    {event.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatAdminDate(event.fight_date)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {getStatusLabel(event.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.sport_type || "-"}
                  </TableCell>
                  <TableCell className="text-center">{event._count.fights}</TableCell>
                  <TableCell className="text-center">{event._count.bets}</TableCell>
                  <TableCell className="text-center">{event._count.posts}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/event/${event.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>{renderPaginationItems()}</PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

