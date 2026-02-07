function TweetSkeleton() {
  return (
    <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 sm:px-4 sm:py-4">
      <div className="flex animate-pulse flex-col gap-2 sm:gap-3">
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
        <div className="flex gap-3 sm:gap-4">
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800 sm:w-12" />
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800 sm:w-12" />
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800 sm:w-12" />
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800 sm:w-12" />
        </div>
      </div>
    </div>
  );
}

function ControlsSkeleton() {
  return (
    <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 sm:px-4">
      <div className="flex animate-pulse flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="h-10 flex-1 rounded-md bg-zinc-200 dark:bg-zinc-800 sm:h-9" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-md bg-zinc-200 dark:bg-zinc-800 sm:h-9 sm:w-36" />
          <div className="h-10 flex-1 rounded-md bg-zinc-200 dark:bg-zinc-800 sm:h-9 sm:w-36" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl bg-white shadow-sm dark:bg-zinc-950 lg:my-4 lg:rounded-lg lg:border lg:border-zinc-200 lg:dark:border-zinc-800">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-4 lg:rounded-t-lg">
          <div className="h-6 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 sm:h-7" />
          <div className="mt-1 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </header>

        <ControlsSkeleton />

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 5 }).map((_, index) => (
            <TweetSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
