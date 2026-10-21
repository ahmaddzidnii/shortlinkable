import type { UrlItem } from "./types";

const BASE_URL = "https://links.ahmadzidni.com"

/** Builds the public short URL for a URL record. */
export function getFullShortUrl(item: UrlItem): string {
  const path = item.uniquePath || item.id;

  if (BASE_URL) {
    return `${BASE_URL}/${path}`;
  }

  // Keep server and client output consistent when no public base URL is configured.
  // Relative URLs work in anchors and avoid hydration mismatches.
  return `/${path}`;
}
