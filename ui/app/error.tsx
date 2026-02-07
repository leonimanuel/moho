"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to the console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex max-w-2xl flex-col items-center justify-center bg-white px-4 py-16 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            An error occurred while loading the tweets.
          </p>
          {error.digest && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      </main>
    </div>
  );
}
