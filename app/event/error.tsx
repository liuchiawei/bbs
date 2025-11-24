"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * Events Page Error Boundary
 * イベントページのエラーバウンダリ
 * Handles errors in the events page with retry functionality
 */
export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    // Log error for monitoring
    console.error("Events page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Error Loading Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error.message || "An error occurred while loading events. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

