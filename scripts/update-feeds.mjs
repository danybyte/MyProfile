import { mkdir, writeFile } from "node:fs/promises";

const GITHUB_USER = "danybyte";
const GITHUB_EVENTS_PER_PAGE = 30;
const GITHUB_FEED_LIMIT = 5;
const YT_CHANNELS = [
  { id: "UC5A4Wq8fmNG6d0BK_lSuN_g", label: "FA Channel" },
  { id: "UCcJPa01ovQs0xdKrV03g5EQ", label: "EN Channel" },
];
const TG_CHANNEL = "DanyByteCH";
const OUT_FILE = new URL("../public/feeds.json", import.meta.url);
const TIMEOUT_MS = 15000;

const cachedFeeds = {
  generatedAt: new Date().toISOString(),
  github: [
    {
      id: "github-cache-13362328661",
      title: "Pushed 1 commit to danybyte",
      url: "https://github.com/danybyte/danybyte",
      timestamp: "2026-06-15T17:13:40Z",
      meta: "danybyte/danybyte · cached",
    },
    {
      id: "github-cache-13361875893",
      title: "Pushed 1 commit to Prompter",
      url: "https://github.com/danybyte/Prompter",
      timestamp: "2026-06-15T17:03:55Z",
      meta: "danybyte/Prompter · cached",
    },
    {
      id: "13496829447",
      title: "Pushed to MyProfile on main",
      url: "https://github.com/danybyte/MyProfile",
      timestamp: "2026-06-18T00:30:39Z",
      meta: "danybyte/MyProfile",
    },
    {
      id: "13496580231",
      title: "Pushed to MyProfile on main",
      url: "https://github.com/danybyte/MyProfile",
      timestamp: "2026-06-18T00:21:47Z",
      meta: "danybyte/MyProfile",
    },
    {
      id: "13495855460",
      title: "Pushed to MyProfile on main",
      url: "https://github.com/danybyte/MyProfile",
      timestamp: "2026-06-17T23:57:55Z",
      meta: "danybyte/MyProfile",
    },
  ],
  youtube: [
    {
      id: "youtube-cache-R3wtMbq2S3U",
      title: "جنگو بلد نبودم ولی باهاش یک سایت ساختم!",
      url: "https://www.youtube.com/watch?v=R3wtMbq2S3U",
      timestamp: "2026-08-28T19:25:10+00:00",
      meta: "FA Channel · cached",
    },
    {
      id: "youtube-cache-XBoUWUzeagM",
      title: "Stop Coding with the wrong AI! 🛑 ChatGPT vs Gemini vs Grok",
      url: "https://www.youtube.com/watch?v=XBoUWUzeagM",
      timestamp: "2025-12-20T21:56:10+00:00",
      meta: "EN Channel · cached",
    },
    {
      id: "youtube-cache-pdznwcR6_14",
      title: "پرامپت معمولی ننویس! معرفی پروژه متن‌باز Prompter",
      url: "https://www.youtube.com/watch?v=pdznwcR6_14",
      timestamp: "2026-06-15T23:38:14+00:00",
      meta: "FA Channel · cached",
    },
    {
      id: "youtube-cache-hYsP5foKG4g",
      title: "Found the best AI for coding🤖",
      url: "https://www.youtube.com/watch?v=hYsP5foKG4g",
      timestamp: "2025-12-21T13:31:53+00:00",
      meta: "EN Channel · cached",
    },
    {
      id: "youtube-cache-kWpaluJsSb8",
      title: "قسمت اول Bit Learn | فعالیت من در گیت هاب + استفاده حرفه ای از هوش مصنوعی",
      url: "https://www.youtube.com/watch?v=kWpaluJsSb8",
      timestamp: "2026-02-20T18:31:31+00:00",
      meta: "FA Channel · cached",
    },
  ],
  telegram: [
    {
      id: "DanyByteCH/190",
      title: "عادیه همچین چیزی؟ 😂",
      url: "https://t.me/DanyByteCH/190",
      timestamp: "2026-08-30T18:38:11+00:00",
      meta: "@DanyByteCH · cached",
    },
    {
      id: "DanyByteCH/189",
      title: "بالاخره",
      url: "https://t.me/DanyByteCH/189",
      timestamp: "2026-08-28T19:34:24+00:00",
      meta: "@DanyByteCH · cached",
    },
    {
      id: "DanyByteCH/188",
      title: "ویدیوی جدید: جنگو بلد نبودم ولی باهاش یک سایت ساختم!",
      url: "https://t.me/DanyByteCH/188",
      timestamp: "2026-08-28T19:34:03+00:00",
      meta: "@DanyByteCH · cached",
    },
    {
      id: "DanyByteCH/187",
      title:
        "متاسفانه چون توی ادیت هم کندم هم سخت گیر، تازه ۱۰ دقیقه از ویدیو ادیت شده ولی از ویدیو راضیم",
      url: "https://t.me/DanyByteCH/187",
      timestamp: "2026-08-26T23:43:08+00:00",
      meta: "@DanyByteCH · cached",
    },
    {
      id: "DanyByteCH/185",
      title: "نیاز مندی های ویدیو بعدی",
      url: "https://t.me/DanyByteCH/185",
      timestamp: "2026-08-19T21:40:24+00:00",
      meta: "@DanyByteCH · cached",
    },
  ],
};

async function main() {
  const [github, youtube, telegram] = await Promise.all([
    safe(getGithubActivity(), cachedFeeds.github, "github", 5),
    safe(getYoutubeVideos(), cachedFeeds.youtube, "youtube", 5),
    safe(getTelegramPosts(), cachedFeeds.telegram, "telegram", 5),
  ]);

  const feeds = {
    generatedAt: new Date().toISOString(),
    github,
    youtube,
    telegram,
  };

  await mkdir(new URL("../public", import.meta.url), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(feeds, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_FILE.pathname}`);
}

async function safe(promise, fallback, label, limit) {
  try {
    const items = await promise;
    return topUp(items, fallback, limit);
  } catch (error) {
    console.warn(`[feeds] ${label} failed; using cache.`, error?.message ?? error);
    return fallback;
  }
}

function topUp(items, fallback, limit) {
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

async function fetchText(url, headers = {}) {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

async function getGithubActivity() {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=${GITHUB_EVENTS_PER_PAGE}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "danybyte-profile-site",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}`);

  const events = await res.json();
  return compactGithubEvents(events).slice(0, GITHUB_FEED_LIMIT);
}

function compactGithubEvents(events) {
  const items = [];

  for (const event of events) {
    items.push({
      id: event.id,
      title: describeGithubEvent(event.type, event.payload, event.repo.name),
      url: githubEventUrl(event),
      timestamp: event.created_at,
      meta: event.repo.name,
    });
  }

  return items;
}

function describeGithubEvent(type, payload, repo) {
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

function githubEventUrl(event) {
  return (
    event.payload.pull_request?.html_url ||
    event.payload.issue?.html_url ||
    event.payload.comment?.html_url ||
    event.payload.release?.html_url ||
    `https://github.com/${event.repo.name}`
  );
}

async function getYoutubeVideos() {
  const all = [];

  for (const channel of YT_CHANNELS) {
    const xml = await fetchText(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
      {
        "User-Agent": "Mozilla/5.0 DanyByteFeedReader",
      },
    );
    all.push(...parseXmlFeed(xml, channel.label, channel.id).slice(0, 5));
  }

  return dedupeByUrl(all)
    .sort((a, b) => dateValue(b.timestamp) - dateValue(a.timestamp))
    .slice(0, 5);
}

async function getTelegramPosts() {
  const html = await fetchText(`https://t.me/s/${TG_CHANNEL}`, {
    "User-Agent": "Mozilla/5.0 (compatible; DanyByteBot/1.0; +https://danybyte.dev)",
  });

  return parseTelegramHtml(html)
    .sort((a, b) => dateValue(b.timestamp) - dateValue(a.timestamp))
    .slice(0, 10);
}

function parseXmlFeed(xml, meta, idPrefix) {
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
      };
    })
    .filter((item) => item.title && item.url);
}

function parseTelegramHtml(html) {
  const msgs = html.split('class="tgme_widget_message ').slice(1);
  const items = [];
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

function pickTag(s, tag) {
  const match = s.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function pickAtomLink(s) {
  const match = s.match(/<link[^>]+href="([^"]+)"/i);
  return match ? decodeEntities(match[1]) : "";
}

function cleanXml(s) {
  return decodeEntities(s)
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function dedupeByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url ?? item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dateValue(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function branchName(ref) {
  return ref?.replace(/^refs\/heads\//, "") || "main";
}

function shortRepoName(repo) {
  return repo.split("/").pop() || repo;
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Updated";
}

await main();
