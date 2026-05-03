# briefs.json schema (v2)

Single file, public, served as static asset. Versioned via `version` integer.

```json
{
  "version": 2,
  "briefs": [ /* newest first; the publish script sorts on merge */ ]
}
```

## Brief object

```json
{
  "date": "YYYY-MM-DD",
  "updated_at": "ISO 8601 with offset, e.g. 2026-05-02T12:30:00-07:00",
  "regime": "BULL | BEAR | NEUTRAL",
  "regime_note": "short qualifier, e.g. 'FOMO-extended', 'breadth narrow'",
  "vix_bucket": "calm | normal | elevated | fearful",
  "headline": { "plain": "zero-jargon, expand acronyms", "pro": "analyst shorthand OK" },

  "market_status": {
    "tier": "MARKET CLOSED | PRE-MARKET | MARKET OPEN | AFTER-HOURS",
    "text": "one sentence describing current session state and next transition"
  },

  "sparks": {
    "TICKER": [14 daily closes oldest first],
    "vix": [14 closes], "ten_year": [...], "dxy": [...], "oil": [...], "gold": [...]
  },

  "top_actions": [
    {
      "verb": "ACTION | WATCH | NO ACTION",
      "target": "TICKER",
      "text": "one-sentence summary",
      "detail": { "plain": "...", "pro": "..." }
    }
  ],

  "macro": {
    "indices": [
      { "ticker": "SPY", "last": 720.65, "rsi": 79.1, "note": "above all MAs",
        "detail": { "plain": "...", "pro": "..." } }
    ],
    "vol_yields": { "vix": 16.99, "vix_term": "STEEP_CONTANGO",
                    "ten_year": 4.38, "dxy": 98.21, "oil": 101.94, "gold": 4629.90 },
    "sector_rotation": {
      "leaders_5d": [{ "etf": "XLE", "score": 13.1, "detail": {"plain":"...","pro":"..."} }],
      "laggards_5d": [{ "etf": "XLK", "score": -9.06, "detail": {"plain":"...","pro":"..."} }],
      "read": "one-line plain-English read"
    },
    "events_14d": [{ "date": "Mon May 4", "event": "Fed Williams Speech",
                     "detail": {"plain":"...","pro":"..."} }],
    "earnings_7d": [{ "ticker": "AMD", "date": "Wed May 6", "note": "Sets AI-semi tone",
                      "detail": {"plain":"...","pro":"..."} }],
    "action": { "tier": "ACTION | WATCH | NO_ACTION", "text": "..." },
    "recommendations": {
      "buy":  [Recommendation, ...],
      "sell": [Recommendation, ...]
    }
  },

  "stocks": {
    "watchlist": [
      { "ticker": "PODD", "last": 175.04, "change_pct": 1.68,
        "trigger_zone": "$170-175 short", "status": "TRIGGERED|IN_ZONE|NEAR|FAR|INVALIDATED",
        "note": "...", "detail": {"plain":"...","pro":"..."} }
    ],
    "movers": {
      "gainers": [{ "ticker": "INTC", "last": 99.62, "chg": 5.42, "vol": 158502811,
                    "spark": [8 closes], "note": "...", "detail": {"plain":"...","pro":"..."} }],
      "losers":  [...]
    },
    "smart_money_clusters": ["NIO", "AAPL"],
    "wsb_top": [{ "ticker": "SNDK", "score": 95 }],
    "action": { "tier": "...", "text": "..." },
    "recommendations": { "buy": [...], "sell": [...] }
  },

  "options": {
    "unusual": [{ "ticker": "AAPL", "vol_oi": 1243, "context": "breakout + active",
                  "detail": {"plain":"...","pro":"..."} }],
    "earnings_iv": [{ "ticker": "AMD", "date": "Wed May 6", "note": "...",
                      "detail": {"plain":"...","pro":"..."} }],
    "leaps": [{ "ticker": "...", "thesis_window": "Jan 2027", "note": "...",
                "detail": {"plain":"...","pro":"..."} }],
    "action": { "tier": "...", "text": "..." },
    "recommendations": { "buy": [...], "sell": [...] }
  },

  "crypto": {
    "status": "coming_soon | live",
    "note": "string when status=coming_soon",
    "coins": [{ "symbol": "BTC", "last": 95000, "change_5d_pct": 1.2,
                "note": "...", "detail": {"plain":"...","pro":"..."} }],
    "action": { "tier": "...", "text": "..." },
    "recommendations": { "buy": [...], "sell": [...] }
  }
}
```

## Recommendation object

```json
{
  "ticker": "TICKER or short trade name (e.g. 'AMD 5/16 365/380 call spread')",
  "verdict": "BUY ON DIP | BUY ON BREAKOUT | BUY VIA SPREAD | SHORT ON CONFIRMATION | SHORT ON BOUNCE | AVOID | TRIM IF EXTENDED | HOLD",
  "confidence": 0,
  "vehicle": "stock | ETF | put option | debit call spread | put debit spread | LEAP call | crypto",
  "pros": "Strongest evidence-grounded argument for the verdict. 2-3 sentences. Lead with catalyst + setup.",
  "cons": "Strongest evidence-grounded counter. 2-3 sentences. Lead with what could invalidate.",
  "action": {
    "plain": "Beginner-friendly action steps. No options-jargon-as-verb.",
    "pro":   "Robinhood-explicit. search X, Trade Options, [exact contract], Limit, GFD, stop alert at $Y, target $Z."
  }
}
```

Cap each `recommendations.{buy, sell}` at 5 entries. Empty arrays are fine on slow days; never pad to 5.

## Auto-enrichment

`publish_site.sh` automatically calls `enrich_briefs.py` after merging staging.json into briefs.json. That script populates:

- `sparks` (14-day price arrays per ticker)
- `market_status` (computed from current ET time)
- `stocks.movers` (refreshed live from `movers.py`)
- `stocks.wsb_top` (refreshed from `social_sentiment.py`)
- `options.unusual` (refreshed from `flow_scan.py --majors`)

The `/trader` skill does NOT need to write these. If it does, the enricher merges by ticker and preserves any `detail` and `note` strings the skill wrote.

The 30-min cron `refresh_site_prices.py` keeps prices and sparks fresh during US weekday extended hours (04:00-20:00 ET) without touching detail or recommendations.

## Hard rules (enforced by `publish_site.sh` redaction grep)

- Never include personal position sizes, share counts, dollar P&L, or portfolio percentages.
- Never include phone numbers, recipient names, file paths under `state/portfolio*`, or any string matching `user holds`, `user book`, `personal book`, `my position`, `I hold`, `shadow_outperforming`, `regret_ledger`, `portfolio_id`.
- Watchlist tickers and trigger levels are general market data: OK.
- Unusual options activity by ticker: OK.
- WSB / sentiment counts: OK.

## Style rules for all `detail`, `note`, and `recommendation.*` text

- No em-dashes, en-dashes, curly punctuation, arrows, or emoji.
- No LLM preambles or postambles.
- Plain-mode reads like a human analyst writing for a friend new to investing.
- Pro-mode reads like an analyst note: tight, technical, no fluff.
- Robinhood instructions in pro mode use exact UI verbs: "search", "Trade Options", "Buy to Open", "Limit at mid", "Good for day" / "GTC", "Stop Limit", "alert at $X".
