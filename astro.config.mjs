import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://chrystianlozano.github.io",
  base: "/mudo.games",
  server: { port: 4321, host: true }
});
