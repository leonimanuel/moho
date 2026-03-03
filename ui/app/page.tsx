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
    <div className="min-h-screen bg-green-50 dark:bg-green-950">
      <main className="mx-auto max-w-2xl bg-white shadow-sm dark:bg-green-950 lg:my-4 lg:rounded-lg lg:border lg:border-green-200 lg:dark:border-green-800">
        <header className="sticky top-0 z-10 border-b border-green-200 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-green-800 dark:bg-green-950/95 sm:px-4 lg:rounded-t-lg">
          <h1 className="text-lg font-bold text-green-900 dark:text-green-100 sm:text-xl">
            Tweets
          </h1>
          <p className="text-sm text-green-600 dark:text-green-400">
            {total.toLocaleString()} {total === 1 ? "tweet" : "tweets"}
          </p>
        </header>

        {/* Search, Filter, and Sort Controls */}
        <div className="border-b border-green-200 px-3 py-3 dark:border-green-800 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex-1">
              <Suspense fallback={null}>
                <SearchBar defaultValue={search} />
              </Suspense>
            </div>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 sm:w-36 sm:flex-none md:w-40">
                <Suspense fallback={null}>
                  <AuthorFilter authors={authors} selectedAuthor={author} />
                </Suspense>
              </div>
              <div className="min-w-0 flex-1 sm:w-36 sm:flex-none md:w-40">
                <Suspense fallback={null}>
                  <SortSelect sortBy={sortBy} sortOrder={sortOrder} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-green-200 dark:divide-green-800">
          {tweets.length === 0 ? (
            <div className="px-4 py-12 text-center text-green-600 dark:text-green-400 sm:py-16">
              <p className="text-base sm:text-lg">No tweets found.</p>
              {search && (
                <p className="mt-1 text-sm">
                  Try adjusting your search or filters.
                </p>
              )}
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard key={tweet.tweet_id} tweet={tweet} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="lg:rounded-b-lg lg:overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              currentFilters={currentFilters}
            />
          </div>
        )}
      </main>
    </div>
  );
}
