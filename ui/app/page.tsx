import { getTweets } from "@/lib/db";
import { TweetCard } from "@/components/TweetCard";
import { Pagination } from "@/components/Pagination";

// Force dynamic rendering since we always need fresh data from the database
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const { tweets, total } = await getTweets({
    page: currentPage,
    pageSize: PAGE_SIZE,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </main>
    </div>
  );
}
