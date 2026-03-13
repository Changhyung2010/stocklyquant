import { NextRequest, NextResponse } from "next/server";
import type { PricePoint } from "@/lib/types";

const INDICES = ["SPY", "QQQ", "DIA", "IWM", "VXX"];

async function fetchLatestBar(
  ticker: string,
  apiKey: string
): Promise<{ ticker: string; price: number; change: number; changePct: number } | null> {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 7 * 86400 * 1000).toISOString().slice(0, 10);
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=10&apiKey=${apiKey}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache
    const data = await res.json();
    const results: PricePoint[] = (data.results ?? []).map(
      (b: { t: number; c: number; v: number; o: number; h: number; l: number }) => ({
        date: new Date(b.t).toISOString().slice(0, 10),
        price: b.c,
        volume: b.v,
      })
    );
    if (results.length < 2) return null;
    const latest = results[results.length - 1];
    const prev = results[results.length - 2];
    const change = latest.price - prev.price;
    const changePct = prev.price > 0 ? (change / prev.price) * 100 : 0;
    return { ticker, price: latest.price, change, changePct };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userKey = req.nextUrl.searchParams.get("key");
  const apiKey = process.env.POLYGON_API_KEY || userKey;

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 400 });
  }

  const results = await Promise.all(INDICES.map((t) => fetchLatestBar(t, apiKey)));
  const filtered = results.filter(Boolean);
  return NextResponse.json({ indices: filtered });
}
