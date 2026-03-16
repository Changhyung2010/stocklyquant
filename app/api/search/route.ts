import { NextRequest, NextResponse } from "next/server";
import type { StockSearchResult } from "@/lib/types";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const userKey = req.nextUrl.searchParams.get("key");
  const apiKey = process.env.POLYGON_API_KEY || userKey;

  if (!q || !apiKey) {
    return NextResponse.json({ error: "Missing query or API key" }, { status: 400 });
  }

  if (q.length > 50) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const encoded = encodeURIComponent(q);
    const url = `https://api.polygon.io/v3/reference/tickers?search=${encoded}&active=true&market=stocks&limit=20&apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();

    if (res.status === 403) {
      return NextResponse.json({ error: "Invalid Polygon API key" }, { status: 403 });
    }

    const results: StockSearchResult[] = (data.results ?? []).map(
      (r: { ticker: string; name: string; primary_exchange?: string }) => ({
        ticker: r.ticker,
        name: r.name,
        exchange: r.primary_exchange ?? "",
      })
    );
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
