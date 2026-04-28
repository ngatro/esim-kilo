const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Build a clean Unsplash URL from photo ID (exported for use in other files)
export function getValidUrl(photoId: string, width = 1600, height = 900): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=${width}&h=${height}`;
}

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
  };
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

// Fetch image from Unsplash API
export async function getUnsplashImage(query: string): Promise<string> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn("Unsplash Access Key not configured");
    return buildFallbackUrl(query);
  }

  const params = new URLSearchParams({
    query: `${query} travel landmark`,
    client_id: UNSPLASH_ACCESS_KEY,
    orientation: "landscape",
    per_page: "1",
    content_filter: "high",
  });

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );

    const rateLimitRemaining = response.headers.get("X-Ratelimit-Remaining");
    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
      console.warn(`Unsplash rate limit low: ${rateLimitRemaining} remaining`);
    }

    if (!response.ok) {
      console.error("Unsplash API error:", response.status, response.statusText);
      return buildFallbackUrl(query);
    }

    const data: UnsplashSearchResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    console.warn("No Unsplash results for query:", query);
    return buildFallbackUrl(query);
  } catch (error) {
    console.error("Unsplash fetch error:", error);
    return buildFallbackUrl(query);
  }
}

// Store only photo IDs (not full URLs) in fallback
const destinationPhotoIds: Record<string, string> = {
  "japan": "1545569341-9eb8b30979d9",
  "south-korea": "1718958505977-6f5790f1cf1a",
  "thailand": "1552465011-b4e21bf6e79a",
  "singapore": "1525625293386-3f8f99389edd",
  "vietnam": "1528127269322-539801943592",
  "united-states": "1485738422979-f5c462d49f74",
  "united-kingdom": "1513635269975-59663e0ac1ad",
  "france": "1502602898657-3e91760cbb34",
  "germany": "1467269204594-9661b134dd2b",
  "china": "1508804185872-d7badad00f7d",
  "hong-kong": "1536599018102-9f803c140fc1",
  "taiwan": "1552993873-0dd1110e025f",
  "malaysia": "1596018138885-b88eb554411c",
  "indonesia": "1537996194471-e657df975ab4",
  "australia": "1624138784614-87fd1b6528f8",
  "asia": "1528181304800-259d08817609",
  "europe": "1499856871958-5b9627545d1a",
  "americas": "1485738422979-f5c462d49f74",
  "oceania": "1504214208752-2c4b56670f25",
  "global": "1488085061387-422e29b40080",
};

// Build fallback URL from photo ID
function buildFallbackUrl(countrySlug: string): string {
  const photoId = destinationPhotoIds[countrySlug.toLowerCase()];
  if (photoId) {
    return getValidUrl(photoId);
  }
  // Default to global
  return getValidUrl(destinationPhotoIds["global"]);
}

export function getDestinationImage(countrySlug: string): string {
  return buildFallbackUrl(countrySlug);
}