"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

/**
 * Fighter Page Error Boundary
 * 選手頁面錯誤邊界
 */
export default function FighterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fighter page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error Loading Fighter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              An error occurred while loading the fighter profile. Please try
              again.
            </p>
            {error.message && (
              <p className="text-sm text-muted-foreground font-mono">
                {error.message}
              </p>
            )}
            <Button onClick={reset} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

