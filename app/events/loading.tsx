import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Events Page Loading State
 * イベントページのローディング状態
 * Uses Next.js 16 Suspense boundaries for optimal loading experience
 */
export default function EventsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              <Skeleton className="h-8 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

