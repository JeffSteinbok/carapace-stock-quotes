/**
 * Stock Quotes — OpenClaw plugin entry.
 *
 * Declares config schema and tools. Business logic lives in handlers.ts,
 * with data sources split into yahoo.ts and finnhub.ts.
 *
 * Config:
 *   finnhubApiKey — optional; when set, Finnhub is the primary data source.
 *                   Without it, Yahoo Finance is used (no key required).
 *
 * Tools:
 *   stock_quote  — single symbol
 *   stock_quotes — multiple symbols (batch, parallel)
 */

import { definePlugin } from "carapace-plugin-sdk";
import { Type } from "@sinclair/typebox";
import { getStockQuote, getStockQuotes } from "./handlers.js";

// `createEntry` is a required export name — the SDK's build tools look for it by name.
export const createEntry = definePlugin({
  id: "stock-quotes",
  name: "Stock Quotes",
  description: "Fetch current stock, ETF, and mutual fund quotes from Yahoo Finance or Finnhub.",

  configSchema: Type.Object({
    finnhubApiKey: Type.Optional(
      Type.String({
        description:
          "Finnhub API key. When set, Finnhub is used as the primary data source (higher rate limits). Free key at finnhub.io.",
      }),
    ),
  }),

  tools: (tool) => [
    // -----------------------------------------------------------------
    // stock_quote — single symbol
    // -----------------------------------------------------------------
    tool({
      name: "stock_quote",
      label: "Stock Quote",
      description: "Get the latest quote for a stock, ETF, or mutual fund symbol.",
      parameters: Type.Object({
        symbol: Type.String({
          description: "Ticker symbol (e.g. AAPL, GOOGL, QQQ, FXAIX). Case-insensitive.",
        }),
      }),
      execute: async ({ symbol }, config) => {
        if (!symbol?.trim()) return { error: "symbol is required" };
        return getStockQuote(symbol.trim(), config);
      },
    }),

    // -----------------------------------------------------------------
    // stock_quotes — batch
    // -----------------------------------------------------------------
    tool({
      name: "stock_quotes",
      label: "Stock Quotes",
      description:
        "Get the latest quotes for multiple symbols in one call. Returns successful quotes and per-symbol errors separately.",
      parameters: Type.Object({
        symbols: Type.Array(Type.String(), {
          description: "Array of ticker symbols (e.g. ['MSFT', 'QQQ', 'FXAIX']).",
          minItems: 1,
        }),
      }),
      execute: async ({ symbols }, config) => {
        if (!symbols?.length) return { error: "symbols is required" };
        return getStockQuotes(symbols, config);
      },
    }),
  ],
});
