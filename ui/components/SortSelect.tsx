"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { TweetSortField, SortOrder } from "@/lib/types";

interface SortSelectProps {
  sortBy?: TweetSortField;
  sortOrder?: SortOrder;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "created_at:asc", label: "Oldest first" },
  { value: "like_count:desc", label: "Most liked" },
  { value: "like_count:asc", label: "Least liked" },
  { value: "retweet_count:desc", label: "Most retweeted" },
  { value: "retweet_count:asc", label: "Least retweeted" },
];

export function SortSelect({
  sortBy = "created_at",
  sortOrder = "desc",
}: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValue = `${sortBy}:${sortOrder}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split(":") as [
      TweetSortField,
      SortOrder,
    ];
    const params = new URLSearchParams(searchParams.toString());

    // Only set if not default
    if (newSortBy !== "created_at" || newSortOrder !== "desc") {
      params.set("sortBy", newSortBy);
      params.set("sortOrder", newSortOrder);
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    // Reset to page 1 when changing sort
    params.delete("page");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleChange}
        disabled={isPending}
        className="w-full appearance-none rounded-md border border-green-300 bg-white px-3 py-2 pr-8 text-base text-green-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-wait disabled:opacity-50 dark:border-green-700 dark:bg-green-950 dark:text-green-100 dark:focus:border-green-400 dark:focus:ring-green-400 sm:px-4 sm:pr-10 sm:text-sm"
        aria-label="Sort tweets"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400 sm:right-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}
