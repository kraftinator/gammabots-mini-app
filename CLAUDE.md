# Gammabots Mini App

A Farcaster Mini App (Next.js 16 App Router, React 19, TypeScript) for deploying automated
trading bots on Base. **This app is UI + a proxy layer — all business logic lives in a separate
backend service reached over HTTP.** When a behavior looks wrong, first establish whether it
originates here or upstream.

## Commands

```bash
npm run dev     # next dev --turbopack
npm run build   # next build
npm run lint    # next lint
npx tsc --noEmit  # typecheck (tsconfig has noEmit)
```

## Environment (`.env.local`, gitignored)

| Var | Purpose |
| --- | --- |
| `GAMMABOTS_API_URL` | Backend API base, e.g. `http://localhost:3001/api/v1` |
| `GAMMABOTS_API_KEY` | Server-only; sent as `X-API-Key`. Never expose to the client. |
| `NEXT_PUBLIC_STRATEGY_NFT_ADDRESS` | StrategyNFT contract on Base |

## Two surfaces, one codebase

- `/` + `/docs/*` — public marketing site. Fetches `/api/public/dashboard`, links out to Farcaster.
- `/mini-app/*` — the Mini App itself. Manifest: `public/.well-known/farcaster.json`
  (`homeUrl` = `https://gammabots.io/mini-app`); `fc:miniapp` embed meta in `src/app/layout.tsx`.

`/docs/*` and `/mini-app/docs/*` are parallel copies of the same content with different chrome.
Edits to one usually need mirroring in the other.

## Domain concepts

**Bot** — one token/ETH pair on Base + a strategy + a `moving_average` window (1–60 min) + funded ETH.
Statuses: `unfunded` → `active` → `liquidating` / `completed` / `stopped` / `deactivated` /
`funding_failed` / `expired`. `trade_mode` (`buy` = holding ETH, `sell` = holding tokens) decides
whether the primary destructive action is **Deactivate** or **Liquidate**.

**Strategy** — an immutable NFT, written in **GammaScript**: a JSON array of
`[{"c": "condition", "a": ["actions"]}]` rules, evaluated once per minute, top-to-bottom,
**first match wins**. Conditions use `&&` only — there is no OR; you branch by adding rules.
Actions: `buy`, `sell all`, `sell <fraction>`, `liquidate`, `reset`, `deact`, `skip`.

Three places encode the GammaScript variable set and must stay in sync:
- `public/llms.txt` — the LLM-facing spec (also surfaced at `/mini-app/docs/gammascript-for-llms`)
- `src/app/mini-app/docs/gammascript-reference/page.tsx` — human reference
- `VAR_MAPPINGS` in `src/components/strategy-builder/StrategyBuilder.tsx` — long name → 3-letter code

**GammaScore** — backend-computed strategy quality metric. **Always display as `gamma_score / 100`.**

**Clone** — the core viral loop: serializes a bot's params into query string for
`/mini-app/my-bots/create`. Reachable from dashboard, leaderboard, strategies, and my-bots;
all four call sites build the same param set, so changes need applying to each.

## Architecture

### Auth

`src/hooks/useQuickAuth.ts` → `sdk.quickAuth.getToken()` returns a Farcaster JWT. Components call
`authenticate()` before each fetch and pass `Authorization: Bearer <token>`.

`src/lib/apiAuth.ts` `withAuth()` **only checks the header exists and the token is >10 chars** —
it does not verify the JWT. Verification is the backend's job. `callExternalAPI()` forwards
the user's JWT plus the server-side `X-API-Key`. That split is the reason the proxy layer exists:
the API key stays server-side.

Public (no auth): `/api/public/dashboard`, `/api/leaderboard`, `/api/strategies` (GET),
`/api/strategies/[id]/stats`, `/api/strategies/[id]/bots`.
Header-required-but-unvalidated: `/api/strategies/options`, `/api/tokens/lookup`.

### API proxies

`src/app/api/**/route.ts` — ~25 near-identical handlers mapping a Next path to a backend path
(note the casing shift: `/api/bots/[id]/cancel-funding` → `/bots/{id}/cancel_funding`). Several
extract `[id]` by string-splitting `url.pathname` instead of using the `params` argument; match
the surrounding file's style when editing one.

### State

Deliberately minimal. Only `MeContext` is global (`user_exists`, `id`, `fid`, username, avatar,
`wallet_address`) — `userExists` gates nearly every action, falling back to `SignUpModal` with a
`redirectTo`. Everything else is local `useState` per page. There is no data-fetching library and
no client-side cache; modals lazy-load on expand and cache in component state.

### On-chain

Writes go through `sdk.wallet.ethProvider` directly. `src/contracts/index.ts` is only ethers
`Interface` encode/decode helpers — no signer, no provider.

## Key flows

**Sign-up** (`SignUpModal`) — Quick Auth → `sdk.context.user` → `eth_requestAccounts` →
`personal_sign` a plaintext ownership/ToS message → `POST /api/users`. Backend then provisions the
custodial "Gammabots Wallet" shown in My Bots and Settings.

**Create bot** (`src/app/mini-app/my-bots/create/page.tsx`) — debounced (400 ms) token lookup with
`AbortController`; `POST /api/bots` returns a `payment` object → `eth_sendTransaction` →
`POST /api/bots/{id}/fund` with the tx hash. Wallet rejection calls `cancel-funding` and returns
to My Bots silently. `RECOMMENDED_STRATEGIES` is a hardcoded ID list that differs between dev and
prod — update both branches together.

**Mint strategy** (`src/hooks/useMintStrategy.ts`) — the most involved flow, shared by both
authoring paths (raw editor at `strategies/create/gammascript`, visual `StrategyBuilder` at
`strategies/create/builder`):
`validate` → check `mint_details` for balance + ERC20 allowance → optional `approve` and poll until
`needsApproval` clears (2 s / 60 s) → `mintStrategy(compressed)` → `POST /api/strategies` with
`mint_tx_hash` → poll `mint_status` (1 s / 60 s) → redirect to `/mini-app/strategies?view={id}`.
Guarded by `isMountedRef` throughout — preserve those checks. User rejection is swallowed
deliberately. Duplicate scripts return `duplicate_nft_token_id`, which the UI treats as *valid*.

**My Bots** — polls every 5 s while any bot is `unfunded` or `liquidating`; search/sort are
client-side. `BotDetailModal` (~2.2k lines) is the workhorse: owner vs. public view keyed off
`me.id === bot.bot_owner_id`, lazy accordions for Metrics / Trades / Strategy, plus Edit /
Liquidate / Deactivate / Clone drawers.

## Conventions

- **Inline `style` objects everywhere.** Tailwind v4 is installed but effectively unused outside
  `globals.css`. Don't introduce Tailwind classes into existing inline-styled components.
- Shared tokens in `src/styles/common.ts`: `colors`, `styles`, and `getProfitColor(profit, isActive)`
  — 2% dead-band for active bots, 0% for completed. Use it rather than re-deriving profit colors.
- Palette: teal `#14b8a6` = primary action, purple `#8b5cf6` = strategy/GammaScript,
  `#2d3f54` = dark header.
- Every page must `await sdk.actions.ready()` to dismiss the splash, and guard on
  `sdk.isInMiniApp()` so the browser path degrades gracefully.
- Wrap any page using `useSearchParams` in `<Suspense>`.
- Heavy `console.log` instrumentation with emoji prefixes is the existing debugging style.
- Bare `<img>`, not `next/image`.

## Known gaps (verified, unfixed)

1. **`/api/bots/gas_reserve` does not exist.** `my-bots/create/page.tsx` fetches it, so `gasReserve`
   and `botWalletAddress` stay `null` and the "Gas Reserve" / "Bot Wallet" review rows and the whole
   **Total** line never render.
2. Leaderboard timeframe defaults disagree: the page sends `7d`, the route falls back to `all_time`.
3. `src/contexts/AuthContext.tsx` is a 0-byte file.
4. Duplication to watch when editing: the strategy readable/raw renderer and condition formatter are
   copy-pasted between `BotDetailModal` and `StrategyDetailModal`; the status label/color ternary
   chain is duplicated between `my-bots/page.tsx` and `BotDetailModal`; the `Bot` interface is
   declared in both.
5. `public/my-bots.html` is a leftover static mockup. `next.config.ts` is empty.
