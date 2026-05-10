/**
 * Stock Quotes — public handler layer.
 *
 * Orchestrates across data sources (yahoo.ts, finnhub.ts).
 * Pure logic: no knowledge of how it's invoked (plugin vs CLI).
 * Config is passed in; handlers never read env vars or plugin APIs directly.
 *
 * Data sources (in priority order):
 *   1. Finnhub (if `finnhubApiKey` is configured) — higher rate limits, more reliable
 *   2. Yahoo Finance (public, no API key required) — default fallback
 */

import { fetchFinnhubQuote } from "./finnhub.js";
import { fetchYahooQuote } from "./yahoo.js";
import type { MultiQuoteResult, QuoteResult, StockQuote, StockQuotesConfig } from "./types.js";

// Re-export types so callers (index.ts) only need to import from one place.
export type { MultiQuoteResult, QuoteResult, StockQuote, StockQuotesConfig };

/**
 * Get the latest quote for a single symbol.
 *
 * Tries Finnhub first if an API key is configured; falls back to Yahoo Finance.
 *
 * @param symbol - Ticker symbol (e.g. "AAPL", "QQQ", "FXAIX"). Case-insensitive.
 * @param config - Plugin config, including optional Finnhub API key.
 */
export async function getStockQuote(
  symbol: string,
  config: StockQuotesConfig,
): Promise<QuoteResult> {
  symbol = symbol.trim().toUpperCase();
  if (!symbol) return { error: "Symbol is required" };

  if (config.finnhubApiKey) {
    const result = await fetchFinnhubQuote(symbol, config.finnhubApiKey);
    // Only fall through to Yahoo if Finnhub returned a data error, not an auth error.
    if (!("error" in result)) return result;
  }
  return fetchYahooQuote(symbol);
}

/**
 * Get quotes for multiple symbols in parallel.
 *
 * Returns a `MultiQuoteResult` with successful quotes and per-symbol errors
 * separated, so one failed symbol doesn't hide the rest.
 *
 * @param symbols - Array of ticker symbols.
 * @param config - Plugin config.
 */
export async function getStockQuotes(
  symbols: string[],
  config: StockQuotesConfig,
): Promise<MultiQuoteResult> {
  const quotes: StockQuote[] = [];
  const errors: { symbol: string; error: string }[] = [];

  // Fetch all symbols concurrently.
  const results = await Promise.all(symbols.map((s) => getStockQuote(s, config)));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if ("error" in r) {
      errors.push({ symbol: symbols[i].toUpperCase(), error: r.error });
    } else {
      quotes.push(r);
    }
  }

  return { quotes, errors: errors.length ? errors : null, count: quotes.length };
}
