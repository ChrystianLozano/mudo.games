import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mudo.games",
  base: "/",
  server: { port: 4321, host: true }
});
