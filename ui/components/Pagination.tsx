import Link from "next/link";
import type { TweetSortField, SortOrder } from "@/lib/types";

interface CurrentFilters {
  search?: string;
  author?: string;
  sortBy?: TweetSortField;
  sortOrder?: SortOrder;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentFilters?: CurrentFilters;
}

function buildPageUrl(page: number, filters?: CurrentFilters): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.author) {
    params.set("author", filters.author);
  }

  // Only include sort params if not default
  if (
    filters?.sortBy &&
    (filters.sortBy !== "created_at" || filters.sortOrder !== "desc")
  ) {
    params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) {
      params.set("sortOrder", filters.sortOrder);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "/";
}

export function Pagination({
  currentPage,
  totalPages,
  currentFilters,
}: PaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      className="flex items-center justify-between border-t border-blue-200 px-3 py-3 dark:border-blue-800 sm:px-4"
      aria-label="Pagination"
    >
      <div className="flex flex-1 items-center justify-between gap-2 sm:justify-start">
        {hasPrevious ? (
          <Link
            href={buildPageUrl(currentPage - 1, currentFilters)}
            className="inline-flex items-center rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 active:bg-blue-100 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:px-4"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-400 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-600 sm:px-4">
            Previous
          </span>
        )}

        {/* Mobile page indicator */}
        <span className="text-sm text-blue-500 dark:text-blue-400 sm:hidden">
          {currentPage} / {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={buildPageUrl(currentPage + 1, currentFilters)}
            className="inline-flex items-center rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 active:bg-blue-100 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:px-4"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-3 py-2 text-sm font-medium text-blue-400 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-600 sm:px-4">
            Next
          </span>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
        <p className="text-sm text-blue-500 dark:text-blue-400">
          Page{" "}
          <span className="font-medium text-blue-700 dark:text-blue-300">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-medium text-blue-700 dark:text-blue-300">
            {totalPages}
          </span>
        </p>
      </div>
    </nav>
  );
}
