import type {
  TweetsQueryParams,
  TweetsQueryResult,
  TweetWithMedia,
} from "./types";

const MOCK_AUTHORS = ["elonmusk", "sama", "karpathy", "naval", "paulg"];

const MOCK_TWEETS: TweetWithMedia[] = [
  {
    tweet_id: "1",
    author_id: "elonmusk",
    text: "The thing I love most about Twitter/X is the raw, unfiltered exchange of ideas. No gatekeepers. Just people and their thoughts.",
    created_at: new Date("2024-03-01T10:00:00Z"),
    retweet_count: 4200,
    reply_count: 1800,
    like_count: 52000,
    quote_count: 900,
    impression_count: 4200000,
    media: [],
  },
  {
    tweet_id: "2",
    author_id: "sama",
    text: "AGI is going to be the most transformative technology in human history. We should take it seriously and make sure it benefits everyone.",
    created_at: new Date("2024-03-02T14:30:00Z"),
    retweet_count: 3100,
    reply_count: 980,
    like_count: 38000,
    quote_count: 650,
    impression_count: 2800000,
    media: [],
  },
  {
    tweet_id: "3",
    author_id: "karpathy",
    text: "Neural networks are just matrix multiplications and nonlinearities all the way down. The magic is in how you stack them and what data you feed them.",
    created_at: new Date("2024-03-03T09:15:00Z"),
    retweet_count: 2700,
    reply_count: 420,
    like_count: 29000,
    quote_count: 510,
    impression_count: 1900000,
    media: [],
  },
  {
    tweet_id: "4",
    author_id: "naval",
    text: "Specific knowledge is knowledge you cannot be trained for. If society can train you, it can train someone else and replace you.",
    created_at: new Date("2024-03-04T16:45:00Z"),
    retweet_count: 5800,
    reply_count: 760,
    like_count: 71000,
    quote_count: 1200,
    impression_count: 5100000,
    media: [],
  },
  {
    tweet_id: "5",
    author_id: "paulg",
    text: "The best startup ideas seem at first like bad ideas. If they were obviously good ideas, someone would have already done them.",
    created_at: new Date("2024-03-05T11:20:00Z"),
    retweet_count: 4400,
    reply_count: 580,
    like_count: 55000,
    quote_count: 870,
    impression_count: 3600000,
    media: [],
  },
  {
    tweet_id: "6",
    author_id: "karpathy",
    text: "Just spent the weekend implementing a transformer from scratch. There's no better way to understand attention than to write every line yourself.",
    created_at: new Date("2024-03-06T20:00:00Z"),
    retweet_count: 1900,
    reply_count: 310,
    like_count: 22000,
    quote_count: 390,
    impression_count: 1400000,
    media: [],
  },
  {
    tweet_id: "7",
    author_id: "sama",
    text: "One of the most important things we can do is make sure the benefits of AI are widely distributed. Concentration of power is the real risk.",
    created_at: new Date("2024-03-07T13:00:00Z"),
    retweet_count: 2300,
    reply_count: 670,
    like_count: 31000,
    quote_count: 480,
    impression_count: 2200000,
    media: [],
  },
  {
    tweet_id: "8",
    author_id: "naval",
    text: "Read what you love until you love to read. Read to understand, not to remember. Summarizing is overrated.",
    created_at: new Date("2024-03-08T08:30:00Z"),
    retweet_count: 6100,
    reply_count: 890,
    like_count: 83000,
    quote_count: 1500,
    impression_count: 6200000,
    media: [],
  },
];

export async function getTweets(
  params: TweetsQueryParams
): Promise<TweetsQueryResult> {
  const { search, author, sortBy, sortOrder, page, pageSize } = params;

  const filtered = MOCK_TWEETS.filter((t) => {
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (author && t.author_id !== author) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const aVal = sortBy === "created_at" ? a.created_at.getTime() : a[sortBy];
    const bVal = sortBy === "created_at" ? b.created_at.getTime() : b[sortBy];
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const total = filtered.length;
  const offset = (page - 1) * pageSize;
  const tweets = filtered.slice(offset, offset + pageSize);

  return { tweets, total };
}

export async function getAuthors(): Promise<string[]> {
  return MOCK_AUTHORS;
}
