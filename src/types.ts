/**
 * Shared types for carapace-stock-quotes.
 *
 * Defined here so they can be imported by both the data-source clients
 * (yahoo.ts, finnhub.ts) and the public handler layer (handlers.ts)
 * without creating circular dependencies.
 */

/** Plugin config fields. All optional — sensible defaults apply when absent. */
export interface StockQuotesConfig {
  /** Finnhub API key. When provided, Finnhub is tried first before Yahoo Finance. */
  finnhubApiKey?: string;
}

/** A successful stock quote result. */
export interface StockQuote {
  symbol: string;
  price: number | null;
  previous_close: number | null;
  change: number | null;
  change_percent: number | null;
  currency: string;
  market_state: string;
  timezone: string;
  timestamp: string | null;
  source: string;
}

/** A single quote result — either a successful quote or an error. */
export type QuoteResult = StockQuote | { error: string };

/** Result for a batch multi-symbol request. */
export interface MultiQuoteResult {
  quotes: StockQuote[];
  /** Symbols that failed to fetch, with their error messages. Null if all succeeded. */
  errors: { symbol: string; error: string }[] | null;
  count: number;
}
