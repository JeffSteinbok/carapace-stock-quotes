/**
 * Finnhub data source.
 *
 * Requires a free API key from https://finnhub.io.
 * Rate-limited to 60 req/min on the free tier — higher than Yahoo Finance.
 * Used as the primary source when a key is configured.
 */

import { httpGet } from "./http.js";
import type { QuoteResult } from "./types.js";

const FINNHUB_API_BASE = "https://finnhub.io/api/v1";

/**
 * Fetch a quote from Finnhub.
 *
 * Finnhub returns `c: 0` when a symbol is not found or has no data —
 * treat that as a "symbol not supported" error rather than a zero price.
 *
 * @param symbol - Ticker symbol (already normalised to uppercase).
 * @param apiKey - Finnhub API key.
 * @returns A `StockQuote` on success, or `{ error: string }` on failure.
 */
export async function fetchFinnhubQuote(symbol: string, apiKey: string): Promise<QuoteResult> {
  const url = `${FINNHUB_API_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`;
  try {
    const raw = await httpGet(url);
    const data = JSON.parse(raw);

    // Finnhub returns `c: 0` when the symbol is not found or has no data.
    const currentPrice = data.c;
    if (currentPrice === 0) {
      return { error: `No data found for symbol ${symbol} (may not be supported by Finnhub)` };
    }

    return {
      symbol,
      price: currentPrice,
      previous_close: data.pc ?? null,
      change: data.d ?? null,
      change_percent: data.dp ?? null,
      currency: "USD",
      market_state: "REGULAR",
      timezone: "America/New_York",
      timestamp: new Date().toISOString(),
      source: "finnhub",
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("HTTP 401")) return { error: "Invalid Finnhub API key" };
    return { error: `Failed to fetch quote: ${msg}` };
  }
}
