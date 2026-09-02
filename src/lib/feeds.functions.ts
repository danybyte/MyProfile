import { createServerFn } from "@tanstack/react-start";
import { cachedGithubActivity, cachedTelegramPosts, cachedYoutubeVideos } from "./feed-cache";
import type { FeedItem } from "./feed-types";

const GITHUB_USER = "danybyte";
const GITHUB_EVENTS_PER_PAGE = 30;
const GITHUB_FEED_LIMIT = 5;
const YT_CHANNELS = [
  { id: "UC5A4Wq8fmNG6d0BK_lSuN_g", label: "FA" }, // @theDanyByte
  { id: "UCcJPa01ovQs0xdKrV03g5EQ", label: "EN" }, // @DanyByteBug
];
const TG_CHANNEL = "DanyByteCH";
const FETCH_TIMEOUT_MS = 5_000;
const FEED_CACHE_MS = 5 * 60_000;

type FeedCacheEntry = {
  items: FeedItem[];
  expiresAt: number;
  warningKey?: string;
};

const feedCache = new Map<string, FeedCacheEntry>();

async function withFeedCache(
  label: string,
  fallback: FeedItem[],
  load: () => Promise<FeedItem[]>,
  limit: number,
): Promise<FeedItem[]> {
  const now = Date.now();
  const cached = feedCache.get(label);
  if (cached && cached.expiresAt > now) return cached.items;

  try {
    const items = await load();
    const nextItems = topUpWithFallback(items, fallback, limit);
    feedCache.set(label, { items: nextItems, expiresAt: now + FEED_CACHE_MS });
    return nextItems;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const warningKey = `${label}:${message}`;
    if (cached?.warningKey !== warningKey) {
      console.warn(`[feeds] ${label} unavailable; showing cached items. ${message}`);
    }

    const items = cached?.items.length ? cached.items : fallback;
    feedCache.set(label, {
      items,
      expiresAt: now + FEED_CACHE_MS,
      warningKey,
    });
    return items;
  }
}

function topUpWithFallback(items: FeedItem[], fallback: FeedItem[], limit: number): FeedItem[] {
  if (items.length >= limit) return items.slice(0, limit);
  const seen = new Set(items.map((item) => item.url ?? item.id));
  const merged = [...items];
  for (const item of fallback) {
    if (merged.length >= limit) break;
    const key = item.url ?? item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged.sort((a, b) => dateValue(b.timestamp) - dateValue(a.timestamp)).slice(0, limit);
}

async function fetchText(url: string, headers: HeadersInit = {}): Promise<string> {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

async function firstNonEmpty(
  sources: Array<() => Promise<FeedItem[]>>,
  label: string,
): Promise<FeedItem[]> {
  const results = await Promise.allSettled(sources.map((source) => source()));
  const items = results
    .filter((result): result is PromiseFulfilledResult<FeedItem[]> => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((item) => item.title.trim());

  if (!items.length) {
    const failed = results.filter((result) => result.status === "rejected").length;
    throw new Error(`${label} sources returned no items (${failed} failed)`);
  }

  return dedupeByUrl(items)
    .sort((a, b) => dateValue(b.timestamp) - dateValue(a.timestamp))
    .slice(0, 5);
}

export const getGithubActivity = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeedItem[]> => {
    return withFeedCache(
      "github",
      cachedGithubActivity,
      async () => {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=${GITHUB_EVENTS_PER_PAGE}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "danybyte-profile-site",
            },
          },
        );
        if (!res.ok) throw new Error(`GitHub ${res.status}`);
        const events = (await res.json()) as Array<{
          id: string;
          type: string;
          repo: { name: string };
          created_at: string;
          payload: GithubEventPayload;
        }>;
        return compactGithubEvents(events).slice(0, GITHUB_FEED_LIMIT);
      },
      GITHUB_FEED_LIMIT,
    );
  },
);

type GithubEventPayload = {
  action?: string;
  commits?: unknown[];
  size?: number;
  ref?: string;
  ref_type?: string;
  comment?: {
    html_url?: string;
  };
  issue?: {
    html_url?: string;
    number?: number;
    title?: string;
  };
  pull_request?: {
    html_url?: string;
    number?: number;
    title?: string;
  };
  release?: {
    html_url?: string;
    tag_name?: string;
  };
};

type GithubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: GithubEventPayload;
};

function compactGithubEvents(events: GithubEvent[]): FeedItem[] {
  const items: FeedItem[] = [];

  for (const event of events) {
    items.push({
      id: event.id,
      title: describeEvent(event.type, event.payload, event.repo.name),
      url: eventUrl(event),
      timestamp: event.created_at,
      meta: event.repo.name,
    });
  }

  return items;
}

function describeEvent(type: string, payload: GithubEventPayload, repo: string): string {
  const repoName = shortRepoName(repo);

  switch (type) {
    case "PushEvent": {
      const n = payload.commits?.length ?? payload.size ?? 0;
      const branch = branchName(payload.ref);
      if (n <= 0) return `Pushed to ${repoName} on ${branch}`;
      return `Pushed ${n} commit${n === 1 ? "" : "s"} to ${repoName} on ${branch}`;
    }
    case "PullRequestEvent":
      return `${cap(payload.action)} PR #${payload.pull_request?.number ?? ""} in ${repoName}`.trim();
    case "IssuesEvent": {
      const issue = payload.issue?.number ? ` #${payload.issue.number}` : "";
      return `${cap(payload.action)} issue${issue} in ${repoName}`;
    }
    case "IssueCommentEvent":
      return `Commented on issue #${payload.issue?.number ?? ""} in ${repoName}`.trim();
    case "CreateEvent":
      return `Created ${payload.ref_type}${payload.ref ? ` "${payload.ref}"` : ""} in ${repoName}`;
    case "DeleteEvent":
      return `Deleted ${payload.ref_type} "${payload.ref}" in ${repoName}`;
    case "ForkEvent":
      return `Forked ${repoName}`;
    case "WatchEvent":
      return `Starred ${repoName}`;
    case "ReleaseEvent":
      return `Released ${payload.release?.tag_name ?? ""} in ${repoName}`.trim();
    default:
      return `${type.replace(/Event$/, "")} in ${repoName}`;
  }
}

function eventUrl(event: GithubEvent): string {
  return (
    event.payload.pull_request?.html_url ||
    event.payload.issue?.html_url ||
    event.payload.comment?.html_url ||
    event.payload.release?.html_url ||
    `https://github.com/${event.repo.name}`
  );
}

function shortRepoName(repo: string): string {
  return repo.split("/").pop() || repo;
}

function branchName(ref?: string): string {
  return ref?.replace(/^refs\/heads\//, "") || "main";
}

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "Updated");

export const getYoutubeVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeedItem[]> => {
    return withFeedCache(
      "youtube",
      cachedYoutubeVideos,
      async () => {
        const channelItems = await Promise.allSettled(
          YT_CHANNELS.map((ch) =>
            firstNonEmpty(
              [
                async () =>
                  parseXmlFeed(
                    await fetchText(
                      `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`,
                      {
                        "User-Agent": "Mozilla/5.0 DanyByteFeedReader",
                      },
                    ),
                    `${ch.label} Channel`,
                    ch.id,
                  ),
                async () =>
                  parseXmlFeed(
                    await fetchText(`https://rsshub.app/youtube/channel/${ch.id}`),
                    `${ch.label} Channel`,
                    ch.id,
                  ),
              ],
              `youtube ${ch.label}`,
            ),
          ),
        );

        const all = channelItems
          .filter(
            (result): result is PromiseFulfilledResult<FeedItem[]> => result.status === "fulfilled",
          )
          .flatMap((result) => result.value);

        if (!all.length) throw new Error("No YouTube feed items found");
        return dedupeByUrl(all)
          .sort((a, b) => dateValue(b.timestamp) - dateValue(a.timestamp))
          .slice(0, 3);
      },
      3,
    );
  },
);

function pickTag(s: string, tag: string): string {
  const match = s.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function pickAtomLink(s: string): string {
  const match = s.match(/<link[^>]+href="([^"]+)"/i);
  return match ? decodeEntities(match[1]) : "";
}

function parseXmlFeed(xml: string, meta: string, idPrefix: string): FeedItem[] {
  const blocks = [
    ...Array.from(xml.matchAll(/<entry[\s\S]*?<\/entry>/gi), (match) => match[0]),
    ...Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/gi), (match) => match[0]),
  ];

  return blocks
    .map((block, index) => {
      const videoId = cleanXml(pickTag(block, "yt:videoId"));
      const link = cleanXml(pickTag(block, "link")) || pickAtomLink(block);
      const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : link;
      const title = cleanXml(pickTag(block, "title"));
      const timestamp =
        cleanXml(pickTag(block, "published")) ||
        cleanXml(pickTag(block, "updated")) ||
        cleanXml(pickTag(block, "pubDate"));

      return {
        id:
          cleanXml(pickTag(block, "guid")) ||
          cleanXml(pickTag(block, "id")) ||
          `${idPrefix}-${index}`,
        title,
        url,
        timestamp,
        meta,
      } satisfies FeedItem;
    })
    .filter((item) => item.title && item.url);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function cleanXml(s: string): string {
  return decodeEntities(s)
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeByUrl(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url ?? item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dateValue(iso: string): number {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export const getTelegramPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeedItem[]> => {
    return withFeedCache(
      "telegram",
      cachedTelegramPosts,
      async () => {
        return (
          await firstNonEmpty(
            [
              async () =>
                parseTelegramHtml(
                  await fetchText(`https://t.me/s/${TG_CHANNEL}`, {
                    "User-Agent":
                      "Mozilla/5.0 (compatible; DanyByteBot/1.0; +https://danybyte.dev)",
                  }),
                ),
              async () =>
                parseXmlFeed(
                  await fetchText(`https://rsshub.app/telegram/channel/${TG_CHANNEL}`),
                  `@${TG_CHANNEL}`,
                  TG_CHANNEL,
                ),
            ],
            "telegram",
          )
        ).slice(0, 3);
      },
      3,
    );
  },
);

function parseTelegramHtml(html: string): FeedItem[] {
  const msgs = html.split('class="tgme_widget_message ').slice(1);
  const items: FeedItem[] = [];
  for (const block of msgs) {
    const linkMatch = block.match(/data-post="([^"]+)"/);
    const timeMatch = block.match(/datetime="([^"]+)"/);
    const textMatch = block.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (!linkMatch) continue;
    const post = linkMatch[1];
    const text = cleanXml(textMatch ? textMatch[1] : "");
    items.push({
      id: post,
      title: text || "(media post)",
      url: `https://t.me/${post}`,
      timestamp: timeMatch ? timeMatch[1] : new Date().toISOString(),
      meta: `@${TG_CHANNEL}`,
    });
  }
  return items;
}
