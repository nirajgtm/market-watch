# briefs.json schema

Single file, public, served as static asset. Versioned via `version` integer.

```json
{
  "version": 1,
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
  "headline": "one sentence, ≤ 90 chars, no jargon without inline expansion",
  "top_actions": [
    "ACTION/WATCH/NO ACTION starts each bullet — keep ≤ 3"
  ],
  "macro": {
    "indices": [
      { "ticker": "SPY", "last": 720.65, "rsi": 79.1, "note": "above all MAs, 52w high" }
    ],
    "vol_yields": {
      "vix": 16.99,
      "vix_term": "STEEP_CONTANGO",
      "ten_year": 4.38,
      "dxy": 98.21,
      "oil": 101.94,
      "gold": 4629.90
    },
    "sector_rotation": {
      "leaders_5d": [{ "etf": "XLE", "score": 13.1 }],
      "laggards_5d": [{ "etf": "XLK", "score": -9.06 }],
      "read": "one-line plain-English read"
    },
    "events_14d": [{ "date": "2026-05-04", "event": "Fed Williams Speech" }],
    "earnings_7d": [{ "ticker": "AMD", "date": "2026-05-06", "note": "Sets AI-semi tone" }],
    "action": { "tier": "ACTION | WATCH | NO_ACTION", "text": "..." }
  },
  "stocks": {
    "watchlist": [
      { "ticker": "PODD", "last": 175.04, "change_pct": 1.68, "trigger_zone": "$170-175 short", "status": "TRIGGERED|IN_ZONE|NEAR|FAR|INVALIDATED", "note": "..." }
    ],
    "smart_money_clusters": ["NIO", "AAPL"],
    "wsb_top": [{ "ticker": "SNDK", "score": 95 }],
    "action": { "tier": "...", "text": "..." }
  },
  "options": {
    "unusual": [{ "ticker": "AAPL", "vol_oi": 1243, "context": "breakout + active" }],
    "earnings_iv": [{ "ticker": "AMD", "date": "2026-05-06", "note": "..." }],
    "leaps": [{ "ticker": "...", "thesis_window": "Jan 2027", "note": "..." }],
    "action": { "tier": "...", "text": "..." }
  },
  "crypto": {
    "status": "coming_soon | live",
    "note": "string when status=coming_soon",
    "coins": [{ "symbol": "BTC", "last": 95000, "change_5d_pct": 1.2, "note": "..." }],
    "action": { "tier": "...", "text": "..." }
  }
}
```

## Hard rules (enforced by `publish_site.sh`)

- Never include personal position sizes, share counts, dollar P&L, or portfolio percentages.
- Never include phone numbers, recipient names, file paths under `state/portfolio*`, or any string matching `user holds`, `user book`, `personal book`, `my position`, `I hold`, `shadow_outperforming`, `regret_ledger`.
- Watchlist tickers and trigger levels are general market data → OK.
- Unusual options activity by ticker → OK.
- WSB / sentiment counts → OK.
