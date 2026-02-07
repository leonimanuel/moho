export function logProgress(pageTweets: number, totalSoFar: number) {
  console.log(
    `Fetched ${pageTweets} tweets (${totalSoFar.toLocaleString()} total)...`
  );
}

export function logRateLimit(resetTime: Date) {
  const timeStr = resetTime.toLocaleTimeString();
  console.log(`Rate limited. Pausing until ${timeStr}...`);
}

export function logError(msg: string) {
  console.error(`[ERROR] ${msg}`);
}

export function logComplete(total: number) {
  console.log(
    `Ingestion complete. ${total.toLocaleString()} tweets processed.`
  );
}
