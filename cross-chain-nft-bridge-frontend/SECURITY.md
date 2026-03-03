# Security Review: Cross-Chain NFT Bridge Frontend

## Summary

Review covered: env/secrets, API usage, wallet handling, XSS/injection, dependencies, and HTTP security headers.

---

## Critical

### 1. ~~Alchemy API key exposed to the client~~ — Fixed

- **Where:** Alchemy was previously used from `src/lib/nfts-evm.ts` with `NEXT_PUBLIC_ALCHEMY_ID`.
- **Fix:** A backend proxy is in place. The frontend calls `GET /api/nfts/evm?address=0x...`; the API route (`src/app/api/nfts/evm/route.ts`) uses server-only `process.env.ALCHEMY_ID` to call Alchemy. The key is no longer exposed to the client.
- **Recommendations:** Rotate the key if it was ever committed or deployed before this change. Do **not** commit `.env` or `.env.local`; use `.env.example` with placeholders only.

---

### 2. `.env` with real key in the repo

- **Where:** `.env` contains `NEXT_PUBLIC_ALCHEMY_ID=B2h9GpVIoSkWHtQDORnjY`.
- **Risk:** If this file is (or was) tracked by git, the key is in history and should be considered compromised.
- **Recommendations:**
  - Ensure `.env` and `.env*.local` are in `.gitignore` (already the case with `.env*`).
  - If `.env` was ever committed: remove it from the repo and from history (`git rm --cached .env`, then `git filter-branch` or BFG if needed), and **rotate the Alchemy key**.
  - Use `.env.example` with placeholder values only; developers copy it to `.env` and fill in real values locally.

---

## High

### 3. No security headers

- **Where:** `next.config.ts` does not set security-related headers.
- **Risk:** Missing CSP, X-Frame-Options, etc. can increase impact of XSS and clickjacking.
- **Recommendation:** Add security headers in `next.config.ts` (see implemented fix: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).

---

### 4. Unvalidated image URLs (XSS / tracking)

- **Where:** `bridge-app.tsx` uses `<img src={nft.image}>` where `nft.image` comes from Alchemy API or Polkadot metadata.
- **Risk:** If metadata or API ever returns `javascript:...` or a `data:` URL that could be abused, the browser could execute script or leak data. Restricting to `https:` (and safe `data:` image types) mitigates this.
- **Recommendation:** Sanitize image URLs before use: allow only `https:` and `data:image/...` (see implemented helper in `src/lib/utils.ts` and usage in bridge-app).

---

## Medium

### 5. EVM address not validated before API call

- **Where:** `fetchEvmNfts(address)` in `nfts-evm.ts` passes `owner` directly into the Alchemy URL.
- **Risk:** Address comes from the wallet extension, so risk is low, but validating format (e.g. 0x + 40 hex chars) avoids malformed URLs and ensures only intended queries are sent.
- **Recommendation:** Validate EVM address format before building the URL (see implemented validation in `nfts-evm.ts`).

---

### 6. RPC / WebSocket URL in frontend

- **Where:** `nfts-polkadot.ts` uses `NEXT_PUBLIC_ASSET_HUB_WS_URL` or a default public RPC (`wss://polkadot-asset-hub-rpc.dwellir.com`).
- **Risk:** If you later use a private/authenticated RPC and put it in a `NEXT_PUBLIC_*` var, it would be exposed. Default is public, so current risk is low.
- **Recommendation:** Keep RPC URLs that must stay private on the server (e.g. API routes) and never prefix them with `NEXT_PUBLIC_`.

---

## Low / informational

### 7. Wallet disconnect

- **Where:** `bridge-app.tsx` calls `wallet_revokePermissions` for EVM; not all wallets support it.
- **Note:** Code already catches failures and clears local state; acceptable. No change required.

### 8. Dependencies

- **Recommendation:** Run `npm audit` regularly and fix high/critical issues; keep Next and React up to date for security patches.

### 9. No `dangerouslySetInnerHTML`

- **Status:** No use of `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` found; good for XSS prevention.

---

## Implemented mitigations

1. **Backend proxy for Alchemy:** `GET /api/nfts/evm?address=0x...` (see `src/app/api/nfts/evm/route.ts`). The key is set as `ALCHEMY_ID` (no `NEXT_PUBLIC_`) and never sent to the client. Frontend `src/lib/nfts-evm.ts` calls this API only.
2. **`.env.example`** uses `ALCHEMY_ID` (server-only); do not commit real `.env`.
3. **Security headers** in `next.config.ts`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
4. **Image URL sanitization** in `src/lib/utils.ts` (`sanitizeImageUrl`) and used for NFT images in `bridge-app.tsx` (only `https:` and `data:image/*` allowed).
5. **EVM address validation** in the API route and in `nfts-evm.ts` before requesting (0x + 40 hex chars).

---

## Checklist for maintainers

- [ ] Rotate Alchemy key if it was ever committed or shipped in client bundle before the backend proxy was added.
- [x] Alchemy calls use server-side API route (`/api/nfts/evm`); key is `ALCHEMY_ID` (not `NEXT_PUBLIC_`).
- [ ] Ensure `.env` is never committed; use `.env.example` for documentation only.
- [ ] Run `npm audit` and address findings.
- [ ] Re-review when adding auth, payments, or sensitive user data.
