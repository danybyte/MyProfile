import { queryOptions } from "@tanstack/react-query";
import { getGithubActivity, getTelegramPosts, getYoutubeVideos } from "@/lib/feeds.functions";

export const githubQuery = queryOptions({
  queryKey: ["feed", "github"],
  queryFn: () => getGithubActivity(),
  staleTime: 5 * 60_000,
});

export const youtubeQuery = queryOptions({
  queryKey: ["feed", "youtube"],
  queryFn: () => getYoutubeVideos(),
  staleTime: 5 * 60_000,
});

export const telegramQuery = queryOptions({
  queryKey: ["feed", "telegram"],
  queryFn: () => getTelegramPosts(),
  staleTime: 5 * 60_000,
});
