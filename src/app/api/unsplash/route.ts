import { NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("query") || "travel";
  
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Unsplash API key not configured" },
      { status: 500 }
    );
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

    // Check rate limit
    const rateLimitRemaining = response.headers.get("X-Ratelimit-Remaining");
    if (rateLimitRemaining) {
      console.log(`Unsplash rate limit: ${rateLimitRemaining} remaining`);
    }

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Unsplash API error: ${response.status}`, details: error },
        { status: response.status }
      );
    }

    const data: UnsplashSearchResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      return NextResponse.json({
        url: data.results[0].urls.regular,
        thumbnail: data.results[0].urls.small,
        id: data.results[0].id,
      });
    }

    return NextResponse.json(
      { error: "No images found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Unsplash API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}