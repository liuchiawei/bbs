import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UserLikesLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-6">
        <Skeleton className="h-10 w-40" />
      </div>

      <Skeleton className="h-9 w-48 mb-8" />

      <div className="w-full">
        <Skeleton className="h-10 w-full max-w-md mx-auto mb-8" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-4 mt-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
