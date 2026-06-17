import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import type { FeedItem } from "@/lib/feed-types";
import { githubQuery, telegramQuery, youtubeQuery } from "./feed-queries";
import { Reveal } from "./Reveal";

export function Monitoring() {
  return (
    <section id="monitoring" className="border-b border-black/10 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60">
                Monitoring
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">
                Live signal.
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-black/60 md:block">
              Latest activity from across the channels, pulled fresh every few minutes.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-px border border-black/10 bg-black/10 lg:grid-cols-3">
          <FeedColumn title="YouTube" sub="Latest videos">
            <Suspense fallback={<Skeleton />}>
              <YoutubeList />
            </Suspense>
          </FeedColumn>
          <FeedColumn title="Telegram" sub="Latest posts">
            <Suspense fallback={<Skeleton />}>
              <TelegramList />
            </Suspense>
          </FeedColumn>
          <FeedColumn title="GitHub" sub="Latest activity">
            <Suspense fallback={<Skeleton />}>
              <GithubList />
            </Suspense>
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
    <div className="bg-white p-6 md:p-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-black/10 pb-4">
        <h3 className="font-display text-xl">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/50">
          {sub}
        </span>
      </div>
      {children}
    </div>
  );
}

function YoutubeList() {
  const { data } = useSuspenseQuery(youtubeQuery);
  return <FeedList items={data} empty="No videos to show yet." />;
}
function TelegramList() {
  const { data } = useSuspenseQuery(telegramQuery);
  return <FeedList items={data} empty="No posts to show yet." />;
}
function GithubList() {
  const { data } = useSuspenseQuery(githubQuery);
  return <FeedList items={data} empty="No public activity yet." />;
}

function FeedList({ items, empty }: { items: FeedItem[]; empty: string }) {
  if (!items.length) {
    return <p className="font-mono text-xs text-black/50">{empty}</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const date = formatDate(item.timestamp);
        const titleClass = item.unavailable
          ? "line-clamp-2 font-display text-base leading-snug text-black/50"
          : "line-clamp-2 font-display text-base leading-snug transition-colors group-hover:text-black/60";
        const content = (
          <>
            <p className={titleClass}>{item.title}</p>
            <p className="mt-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
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
                className="group block border-b border-dashed border-black/10 pb-4 last:border-b-0"
              >
                {content}
              </a>
            ) : (
              <div className="border-b border-dashed border-black/10 pb-4 last:border-b-0">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Skeleton() {
  return (
    <ul className="space-y-4">
      {[0, 1, 2].map((i) => (
        <li key={i} className="border-b border-dashed border-black/10 pb-4 last:border-b-0">
          <div className="h-4 w-3/4 animate-pulse bg-black/5" />
          <div className="mt-3 h-2 w-1/3 animate-pulse bg-black/5" />
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
