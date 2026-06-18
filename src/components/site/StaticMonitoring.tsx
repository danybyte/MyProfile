import { useEffect, useState } from "react";
import { cachedGithubActivity, cachedTelegramPosts, cachedYoutubeVideos } from "@/lib/feed-cache";
import type { FeedBundle, FeedItem } from "@/lib/feed-types";
import { Reveal } from "./Reveal";

const initialFeeds: FeedBundle = {
  generatedAt: "",
  github: cachedGithubActivity,
  youtube: cachedYoutubeVideos,
  telegram: cachedTelegramPosts,
};

export function StaticMonitoring() {
  const [feeds, setFeeds] = useState<FeedBundle>(initialFeeds);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}feeds.json?v=${Date.now()}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`feeds.json ${res.status}`);
        return res.json() as Promise<FeedBundle>;
      })
      .then((nextFeeds) => {
        setFeeds({
          generatedAt: nextFeeds.generatedAt || "",
          github: nextFeeds.github?.length ? nextFeeds.github : initialFeeds.github,
          youtube: nextFeeds.youtube?.length ? nextFeeds.youtube : initialFeeds.youtube,
          telegram: nextFeeds.telegram?.length ? nextFeeds.telegram : initialFeeds.telegram,
        });
      })
      .catch((error) => {
        console.warn("[feeds] static feeds unavailable; using bundled cache.", error);
      });
  }, []);

  return (
    <section id="monitoring" className="border-b border-border px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Monitoring
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
                Live signal.
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-muted-foreground md:block">
              Latest activity from across the channels, refreshed by GitHub Actions.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-px border border-border bg-border lg:grid-cols-3">
          <FeedColumn title="YouTube" sub="Latest videos">
            <FeedList items={feeds.youtube} empty="No videos to show yet." />
          </FeedColumn>
          <FeedColumn title="Telegram" sub="Latest posts">
            <FeedList items={feeds.telegram} empty="No posts to show yet." />
          </FeedColumn>
          <FeedColumn title="GitHub" sub="Latest activity">
            <FeedList items={feeds.github} empty="No public activity yet." />
          </FeedColumn>
        </div>
      </div>
    </section>
  );
}

function FeedColumn({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card p-6 text-card-foreground md:p-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-border pb-4">
        <h3 className="font-display text-xl">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {sub}
        </span>
      </div>
      {children}
    </div>
  );
}

function FeedList({ items, empty }: { items: FeedItem[]; empty: string }) {
  if (!items.length) {
    return <p className="font-mono text-xs text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const date = formatDate(item.timestamp);
        const content = (
          <>
            <p className="line-clamp-2 font-display text-base leading-snug transition-colors group-hover:text-primary">
              {item.title}
            </p>
            <p className="mt-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>{item.meta}</span>
              {date ? <span>{date}</span> : null}
            </p>
          </>
        );

        return (
          <li key={item.id}>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block border-b border-dashed border-border pb-4 last:border-b-0"
              >
                {content}
              </a>
            ) : (
              <div className="border-b border-dashed border-border pb-4 last:border-b-0">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
