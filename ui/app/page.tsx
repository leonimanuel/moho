import { Suspense } from "react";
import { getTweets, getAuthors } from "@/lib/db";
import type { TweetSortField, SortOrder } from "@/lib/types";
import { TweetCard } from "@/components/TweetCard";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { AuthorFilter } from "@/components/AuthorFilter";
import { SortSelect } from "@/components/SortSelect";

// Force dynamic rendering since we always need fresh data from the database
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    author?: string;
    sortBy?: TweetSortField;
    sortOrder?: SortOrder;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const search = params.search || "";
  const author = params.author || "";
  const sortBy: TweetSortField = params.sortBy || "created_at";
  const sortOrder: SortOrder = params.sortOrder || "desc";

  const [{ tweets, total }, authors] = await Promise.all([
    getTweets({
      page: currentPage,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      author: author || undefined,
      sortBy,
      sortOrder,
    }),
    getAuthors(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Build current filter state for pagination
  const currentFilters = {
    search,
    author,
    sortBy,
    sortOrder,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl bg-white dark:bg-zinc-950">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Tweets
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {total.toLocaleString()} {total === 1 ? "tweet" : "tweets"}
          </p>
        </header>

        {/* Search, Filter, and Sort Controls */}
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Suspense fallback={null}>
                <SearchBar defaultValue={search} />
              </Suspense>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 sm:w-40 sm:flex-none">
                <Suspense fallback={null}>
                  <AuthorFilter authors={authors} selectedAuthor={author} />
                </Suspense>
              </div>
              <div className="flex-1 sm:w-40 sm:flex-none">
                <Suspense fallback={null}>
                  <SortSelect sortBy={sortBy} sortOrder={sortOrder} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {tweets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              No tweets found.
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard key={tweet.tweet_id} tweet={tweet} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            currentFilters={currentFilters}
          />
        )}
      </main>
    </div>
  );
}
