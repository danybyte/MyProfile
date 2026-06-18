import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Monitoring } from "@/components/site/Monitoring";
import { githubQuery, telegramQuery, youtubeQuery } from "@/components/site/feed-queries";
import { MarqueeFooter } from "@/components/site/MarqueeFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daniel — DanyByte" },
      {
        name: "description",
        content:
          "Profile of Daniel (DanyByte) — a young developer exploring Python, the web, and everything in between. Live YouTube, Telegram, and GitHub feed.",
      },
      { property: "og:title", content: "Daniel — DanyByte" },
      {
        property: "og:description",
        content:
          "Profile of Daniel (DanyByte) — a young developer exploring Python, the web, and everything in between.",
      },
      { property: "og:type", content: "profile" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData(githubQuery),
      context.queryClient.ensureQueryData(youtubeQuery),
      context.queryClient.ensureQueryData(telegramQuery),
    ]);
  },
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Hero />
      <About />
      <Monitoring />
      <MarqueeFooter />
    </main>
  );
}
