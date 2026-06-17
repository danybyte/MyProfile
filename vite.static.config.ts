import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function githubPagesBase() {
  if (process.env.BASE_PATH) return process.env.BASE_PATH;

  const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
  if (!owner || !repo) return "/";

  return repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? "/" : `/${repo}/`;
}

export default defineConfig({
  base: githubPagesBase(),
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
