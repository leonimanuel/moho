import { TweetWithMedia } from "@/lib/types";
import { TweetMetrics } from "./TweetMetrics";
import { MediaGallery } from "./MediaGallery";

interface TweetCardProps {
  tweet: TweetWithMedia;
}

/**
 * Formats a date for display in the tweet card.
 * Shows time for today, date for this year, full date otherwise.
 */
function formatTweetDate(date: Date): string {
  const now = new Date();
  const tweetDate = new Date(date);

  // Same day - show time
  if (tweetDate.toDateString() === now.toDateString()) {
    return tweetDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Same year - show month and day
  if (tweetDate.getFullYear() === now.getFullYear()) {
    return tweetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Different year - show full date
  return tweetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TweetCard({ tweet }: TweetCardProps) {
  const formattedDate = formatTweetDate(tweet.created_at);

  return (
    <article className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 sm:px-4 sm:py-4">
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Header: Author and Date */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            @{tweet.author_id}
          </span>
          <time
            dateTime={new Date(tweet.created_at).toISOString()}
            className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400"
          >
            {formattedDate}
          </time>
        </div>

        {/* Tweet Text */}
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-base">
          {tweet.text}
        </p>

        {/* Media Gallery */}
        {tweet.media.length > 0 && <MediaGallery media={tweet.media} />}

        {/* Metrics */}
        <TweetMetrics
          likeCount={tweet.like_count}
          retweetCount={tweet.retweet_count}
          replyCount={tweet.reply_count}
          quoteCount={tweet.quote_count}
          impressionCount={tweet.impression_count}
        />
      </div>
    </article>
  );
}
