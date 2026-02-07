import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800"
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:justify-start sm:gap-2">
        {hasPrevious ? (
          <Link
            href={`?page=${currentPage - 1}`}
            className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600">
            Previous
          </span>
        )}

        {hasNext ? (
          <Link
            href={`?page=${currentPage + 1}`}
            className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600">
            Next
          </span>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Page{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {totalPages}
          </span>
        </p>
      </div>
    </nav>
  );
}
