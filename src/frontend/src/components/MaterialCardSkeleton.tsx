import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}
