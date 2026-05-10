/**
 * Yahoo Finance data source.
 *
 * Public API — no key required. Rate-limited to roughly 100 req/min.
 * Used as the default source when no Finnhub key is configured.
 *
 * Note: Yahoo Finance's public API is unofficial and may change without notice.
 */

import { httpGet } from "./http.js";
import type { QuoteResult } from "./types.js";

const YAHOO_API_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

/**
 * Fetch a quote from Yahoo Finance.
 *
 * Yahoo requires a browser-like User-Agent header or it returns 429.
 *
 * @param symbol - Ticker symbol (already normalised to uppercase).
 * @returns A `StockQuote` on success, or `{ error: string }` on failure.
 */
export async function fetchYahooQuote(symbol: string): Promise<QuoteResult> {
  const url = `${YAHOO_API_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  try {
    const raw = await httpGet(url, { "User-Agent": "Mozilla/5.0" });
    const data = JSON.parse(raw);

    const chartError = data?.chart?.error;
    if (!data?.chart || chartError) {
      const msg =
        typeof chartError === "object" && chartError
          ? chartError.description ?? "Unknown error"
          : String(chartError);
      return { error: `Yahoo Finance API error: ${msg}` };
    }

    const chartResult = data.chart.result;
    if (!chartResult?.length) return { error: `No data found for symbol ${symbol}` };

    const meta = chartResult[0].meta ?? {};
    if (!meta) return { error: `No metadata found for symbol ${symbol}` };

    const currentPrice: number | null = meta.regularMarketPrice ?? null;
    const previousClose: number | null = meta.chartPreviousClose ?? null;

    let change: number | null = null;
    let changePercent: number | null = null;
    if (currentPrice != null && previousClose != null && previousClose !== 0) {
      change = Math.round((currentPrice - previousClose) * 100) / 100;
      changePercent =
        Math.round(((currentPrice - previousClose) / previousClose) * 10000) / 100;
    }

    let timestamp: string | null = null;
    if (meta.regularMarketTime) {
      timestamp = new Date(meta.regularMarketTime * 1000).toISOString().replace("+00:00", "Z");
    }

    return {
      symbol,
      price: currentPrice,
      previous_close: previousClose,
      change,
      change_percent: changePercent,
      currency: meta.currency ?? "USD",
      market_state: meta.marketState ?? "REGULAR",
      timezone: meta.exchangeTimezoneName ?? "America/New_York",
      timestamp,
      source: "yahoo_finance",
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("HTTP 404")) return { error: `Symbol ${symbol} not found` };
    return { error: `Failed to fetch quote: ${msg}` };
  }
}
