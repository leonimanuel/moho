"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface AuthorFilterProps {
  authors: string[];
  selectedAuthor?: string;
}

export function AuthorFilter({ authors, selectedAuthor }: AuthorFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const author = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (author) {
      params.set("author", author);
    } else {
      params.delete("author");
    }

    // Reset to page 1 when changing filter
    params.delete("page");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <select
        value={selectedAuthor || ""}
        onChange={handleChange}
        disabled={isPending}
        className="w-full appearance-none rounded-md border border-blue-300 bg-white px-3 py-2 pr-8 text-base text-blue-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-wait disabled:opacity-50 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:px-4 sm:pr-10 sm:text-sm"
        aria-label="Filter by author"
      >
        <option value="">All authors</option>
        {authors.map((author) => (
          <option key={author} value={author}>
            @{author}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400 sm:right-3"
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
