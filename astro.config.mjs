import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://mudo.games",
  base: "/",
  server: { port: 4321, host: true },
  integrations: [sitemap()]
});