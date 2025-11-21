"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function EventSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // 從環境變數或設定中獲取 secret（前端無法直接訪問，需要通過 API）
      // 這裡假設有一個管理員專用的 sync API，不需要 secret
      // 或者可以通過後端 API 來處理 secret
      const response = await fetch("/api/admin/events/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync events");
      }

      toast.success(
        `Sync completed! Created: ${data.result?.created || 0}, Updated: ${data.result?.updated || 0}`
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to sync events");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Synchronization</CardTitle>
        <CardDescription>
          Manually sync events from external APIs (TheSportsDB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSync} disabled={isSyncing} className="w-full">
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Events Now
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          This will fetch events from TheSportsDB API and update the database.
          Events are synced for the next 3 months.
        </p>
      </CardContent>
    </Card>
  );
}

