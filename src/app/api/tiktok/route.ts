import { NextResponse } from "next/server";
import { scrapeTikTok } from "@/lib/tiktokFetcher";
import { tiktokCache } from "@/lib/cache";
import { rateLimiter } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    const rateCheck = rateLimiter.check(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateCheck.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace("@", "").trim().toLowerCase();

    // Check cache first
    const cached = tiktokCache.get<Record<string, unknown>>(cleanUsername);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const { error, ...data } = await scrapeTikTok(cleanUsername);

    if (error) {
      return NextResponse.json({ error: error }, { status: 500 });
    }

    // Cache successful results only
    tiktokCache.set(cleanUsername, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
