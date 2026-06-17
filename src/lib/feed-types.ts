export type FeedItem = {
  id: string;
  title: string;
  url?: string;
  timestamp: string;
  meta?: string;
  unavailable?: boolean;
};

export type FeedBundle = {
  generatedAt: string;
  github: FeedItem[];
  youtube: FeedItem[];
  telegram: FeedItem[];
};
