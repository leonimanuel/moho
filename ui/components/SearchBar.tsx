"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  // Sync local state with URL when it changes externally
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const updateSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }

      // Reset to page 1 when searching
      params.delete("page");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== defaultValue) {
        updateSearch(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, defaultValue, updateSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search tweets..."
        className="w-full rounded-md border border-green-300 bg-white px-4 py-2 pl-10 text-base text-green-900 placeholder-green-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-green-700 dark:bg-green-950 dark:text-green-100 dark:placeholder-green-400 dark:focus:border-green-400 dark:focus:ring-green-400 sm:text-sm"
        aria-label="Search tweets"
      />
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-300 border-t-green-600" />
        </div>
      )}
    </div>
  );
}
