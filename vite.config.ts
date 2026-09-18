// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    plugins: [
      {
        name: "oauth-fallback-redirect",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || "";
            if (
              url.startsWith("/~oauth/initiate") ||
              url.startsWith("/auth/callback") ||
              url.startsWith("/callback")
            ) {
              res.writeHead(302, { Location: "/dashboard" });
              res.end();
              return;
            }
            next();
          });
        },
      },
    ],
  },
});
