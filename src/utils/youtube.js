import fs from "node:fs";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

let fallbackCache = { updatedAt: "", channel: { title: "mudo.games", videos: [] }, playlists: {} };
try {
  const cachePath = path.resolve(process.cwd(), "src/data/youtube-cache.json");
  if (fs.existsSync(cachePath)) {
    fallbackCache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  }
} catch (e) {
  console.warn("[YouTube Cache] Error leyendo caché inicial:", e instanceof Error ? e.message : e);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
});

export function parseFeed(xml) {
  const data = parser.parse(xml);
  const title = data?.feed?.title ?? "";
  const entries = data?.feed?.entry ?? [];
  const items = Array.isArray(entries) ? entries : entries ? [entries] : [];

  const parsedVideos = items.map((entry) => {
    const id = entry.videoId;
    const title = entry.title ?? "Video";
    const published = entry.published ?? "";
    const description = entry?.group?.description ?? entry?.summary ?? "";

    const link = Array.isArray(entry.link)
      ? entry.link.find((l) => l.rel === "alternate")?.href
      : entry.link?.href;

    const thumbFromFeed = entry?.group?.thumbnail?.url;
    const thumbnail =
      thumbFromFeed ?? (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");

    const lowerTitle = title.toLowerCase();
    const isShort =
      (typeof link === "string" && link.includes("/shorts/")) ||
      lowerTitle.includes("#shorts") ||
      lowerTitle.includes("short");

    return { id, title, published, link, thumbnail, isShort, description };
  });

  return { title, videos: parsedVideos };
}

// In-memory cache copy
let currentCache = {
  updatedAt: fallbackCache.updatedAt,
  channel: fallbackCache.channel ?? { title: "", videos: [] },
  playlists: fallbackCache.playlists ?? {},
};

export function getCache() {
  return currentCache;
}

export function saveCacheToDisk() {
  currentCache.updatedAt = new Date().toISOString();
  try {
    const filePath = path.resolve(process.cwd(), "src/data/youtube-cache.json");
    fs.writeFileSync(filePath, JSON.stringify(currentCache, null, 2), "utf-8");
  } catch (err) {
    // Keep in-memory if disk is not writable
    console.warn("[YouTube Cache] No se pudo guardar el archivo en disco:", err instanceof Error ? err.message : err);
  }
}

/**
 * Fetch a YouTube feed with automatic fallback to previous videos from cache.
 * If YouTube responds with an error (404, 429, 500, network failure),
 * previous cached videos will be returned instead so the site never breaks.
 */
export async function fetchFeed({ url, type = "channel", playlistId = null, fallbackTitle = "" }) {
  let fetchFailed = false;
  let statusText = "";

  try {
    const res = await fetch(url);
    if (res.ok) {
      const xml = await res.text();
      const parsed = parseFeed(xml);
      if (parsed.videos && parsed.videos.length > 0) {
        const finalTitle = parsed.title || fallbackTitle;
        if (type === "channel") {
          currentCache.channel = {
            title: finalTitle || currentCache.channel?.title || "mudo.games",
            videos: parsed.videos,
          };
        } else if (playlistId) {
          currentCache.playlists = currentCache.playlists || {};
          currentCache.playlists[playlistId] = {
            title: finalTitle,
            videos: parsed.videos,
          };
        }
        saveCacheToDisk();
        return {
          title: finalTitle,
          videos: parsed.videos,
          error: "",
          fromCache: false,
        };
      }
    } else {
      fetchFailed = true;
      statusText = `Respuesta ${res.status}`;
    }
  } catch (err) {
    fetchFailed = true;
    statusText = err instanceof Error ? err.message : "Error de red";
  }

  // Fallback to cache
  let cached = null;
  if (type === "channel") {
    cached = currentCache.channel;
  } else if (playlistId) {
    cached = currentCache.playlists?.[playlistId];
  }

  if (cached && Array.isArray(cached.videos) && cached.videos.length > 0) {
    console.warn(`[YouTube RSS] Feed no disponible (${url}: ${statusText || "vacío"}). Usando ${cached.videos.length} videos en caché.`);
    return {
      title: cached.title || fallbackTitle,
      videos: cached.videos,
      error: "",
      fromCache: true,
    };
  }

  console.error(`[YouTube RSS] Feed no disponible y sin caché (${url}): ${statusText}`);
  return {
    title: fallbackTitle,
    videos: [],
    error: statusText || "No se pudo cargar el feed",
    fromCache: false,
  };
}
