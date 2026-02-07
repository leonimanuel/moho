function TweetSkeleton() {
  return (
    <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex animate-pulse flex-col gap-3">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Text skeleton - multiple lines */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Metrics skeleton */}
        <div className="flex gap-4">
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl bg-white dark:bg-zinc-950">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="h-7 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-1 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </header>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 5 }).map((_, index) => (
            <TweetSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
