interface SkeletonBlockProps {
  className: string;
}

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-16">
      {/* Hero skeleton */}
      <div className="text-center space-y-6 py-12">
        <SkeletonBlock className="h-8 w-64 mx-auto" />
        <div className="flex justify-center gap-8 sm:gap-16">
          <div className="space-y-3">
            <SkeletonBlock className="h-16 w-32" />
            <SkeletonBlock className="h-4 w-24 mx-auto" />
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-16 w-32" />
            <SkeletonBlock className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </div>

      {/* Chart section skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-4">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-72" />
          <SkeletonBlock className="h-[300px] w-full" />
        </div>
      ))}

      {/* Footer skeleton */}
      <div className="space-y-2 pt-8">
        <SkeletonBlock className="h-3 w-64 mx-auto" />
        <SkeletonBlock className="h-3 w-48 mx-auto" />
      </div>
    </div>
  );
}
