# 🦞🐚 carapace-stock-quotes

Stock, ETF, and mutual fund quotes for [OpenClaw](https://github.com/JeffSteinbok/openclaw) — powered by Yahoo Finance with optional Finnhub fallback.

Built with [🦞🐚 Carapace](https://github.com/JeffSteinbok/carapace-plugin-sdk).

## Installation

> **Pre-release** — not yet published to npm. Clone and build locally:

```bash
git clone https://github.com/JeffSteinbok/carapace-stock-quotes.git
cd carapace-stock-quotes
npm install
npm run build
```

## OpenClaw plugin

Add to your OpenClaw config:

```json
{
  "plugins": [
    {
      "package": "carapace-stock-quotes",
      "config": {
        "finnhubApiKey": "your-key-here"
      }
    }
  ]
}
```

### Config

| Field | Type | Required | Description |
|---|---|---|---|
| `finnhubApiKey` | string | No | Finnhub API key. When set, Finnhub is used as the primary data source (higher rate limits). Free key at [finnhub.io](https://finnhub.io). Without it, Yahoo Finance is used. |

### Tools

#### `stock_quote`

Get the latest quote for a single symbol.

| Parameter | Type | Description |
|---|---|---|
| `symbol` | string | Ticker symbol (e.g. `AAPL`, `QQQ`, `FXAIX`). Case-insensitive. |

**Example response:**
```json
{
  "symbol": "AAPL",
  "price": 189.30,
  "previous_close": 187.15,
  "change": 2.15,
  "change_percent": 1.15,
  "currency": "USD",
  "market_state": "REGULAR",
  "timezone": "America/New_York",
  "timestamp": "2026-05-10T20:00:00Z",
  "source": "yahoo_finance"
}
```

#### `stock_quotes`

Get quotes for multiple symbols in one call.

| Parameter | Type | Description |
|---|---|---|
| `symbols` | string[] | Array of ticker symbols. |

**Example response:**
```json
{
  "quotes": [
    { "symbol": "AAPL", "price": 189.30, "..." : "..." },
    { "symbol": "MSFT", "price": 420.50, "..." : "..." }
  ],
  "errors": null,
  "count": 2
}
```

Failed symbols are reported in `errors` without hiding the successful ones:
```json
{
  "quotes": [{ "symbol": "AAPL", "..." : "..." }],
  "errors": [{ "symbol": "BADTICKER", "error": "Symbol BADTICKER not found" }],
  "count": 1
}
```

## Standalone CLI `>_`

The package also installs a `stock-quotes` CLI:

```bash
# Single quote
stock-quotes AAPL
stock-quotes quote AAPL

# Multiple quotes
stock-quotes quotes AAPL MSFT QQQ

# Raw JSON output
stock-quotes AAPL --json

# With Finnhub
STOCK_QUOTES_FINNHUB_API_KEY=your-key stock-quotes AAPL
```

### CLI config via environment variables

| Variable | Description |
|---|---|
| `STOCK_QUOTES_FINNHUB_API_KEY` | Finnhub API key |

## Data sources

| Source | Key required | Rate limit | Notes |
|---|---|---|---|
| Yahoo Finance | No | ~100 req/min | Default. Public API, may change without notice. |
| Finnhub | Yes (free) | 60 req/min | Used first when key is configured. More reliable. |

## Development

```bash
git clone https://github.com/JeffSteinbok/carapace-stock-quotes
cd carapace-stock-quotes
npm install
npm run build
npm test
```

## License

MIT
