# Technical Requirements Document: Cross-chain NFT Bridge

**Version:** 1.0  
**Status:** Draft  
**Related:** [PRD](./cross-chain-nft-bridge-PRD.md)  
**Last Updated:** March 3, 2025

---

## 1. Technical Overview

### 1.1 Architecture Summary

The Cross-chain NFT Bridge uses a **web-first, multi-chain architecture**:

- **Frontend:** Next.js/React app with dual wallet support (Polkadot + EVM), bridge UI, transaction status, and history
- **Application layer:** TypeScript services for XCM composition, Hyperbridge client, asset registry, and cross-chain verification
- **Chains:** Polkadot parachains (via multi-chain RPC) and EVM chains (via Hyperbridge + EVM RPC); no custom smart contracts required for MVP beyond interaction with existing bridge/pallet interfaces

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js, TypeScript)                            │
│  • Polkadot.js + MetaMask/WalletConnect                                           │
│  • Source/destination chain + NFT selector                                        │
│  • Bridge status (pending → XCM/bridge → confirming → confirmed)                  │
│  • History + optional analytics dashboard                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                    │                                    ▲
                    │ User signs tx(es)                  │ Status / history updates
                    ▼                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (in-browser or API)                        │
│  • XCM SDK: compose + send NFT transfer message                                    │
│  • Hyperbridge client: initiate / track EVM leg                                    │
│  • Asset registry: chain + asset IDs, NFT standards                                │
│  • Verification: poll or subscribe source/dest confirmation                       │
└─────────────────────────────────────────────────────────────────────────────────┘
        │                        │                              │
        ▼                        ▼                              ▼
┌───────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Polkadot     │    │   Hyperbridge        │    │   EVM RPC            │
│  Parachains   │    │   (bridge protocol)  │    │   (multi-chain)      │
│  (RPC/WS)     │    │   (EVM bridge APIs)  │    │   (e.g. Ethereum)    │
└───────────────┘    └─────────────────────┘    └─────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Frontend | Next.js | 14.x |
| Language | TypeScript | 5.x (strict) |
| Polkadot | Dedot or Polkadot-API (PAPI) | per docs |
| XCM | XCM SDK / PAPI XCM helpers | per Polkadot Hub docs |
| EVM | viem or ethers.js | 2.x / 6.x |
| Polkadot wallet | @polkadot/extension-dapp (or similar) | latest |
| EVM wallet | wagmi + viem, or RainbowKit | latest |
| Testing | Vitest or Jest | latest |
| CI/CD | GitHub Actions | — |
| Package manager | pnpm | 9.x |

---

## 2. Network Configuration

### 2.1 Supported Chains (MVP)

| Chain Type | Chain | Chain ID / Para ID | RPC (example) | Explorer |
|------------|--------|---------------------|---------------|----------|
| Relay | Polkadot | 0 | wss://rpc.polkadot.io | Subscan |
| Parachain | Asset Hub (Polkadot) | 1000 | wss://polkadot-asset-hub-rpc.dwellir.com | Subscan |
| Parachain | Unique (optional) | 2037 | per Unique docs | Unique Explorer |
| EVM | Ethereum Mainnet | 1 | public RPC | Etherscan |
| EVM | Base (optional) | 8453 | public RPC | Basescan |

*Exact RPC URLs and chain list to be maintained in asset registry config; testnets (e.g. Westend, Sepolia) for development.*

### 2.2 Asset Registry Chain Entry

```typescript
interface ChainConfig {
  chainId: string           // e.g. "polkadot", "1000", "1"
  type: 'relay' | 'parachain' | 'evm'
  name: string
  rpcUrl: string
  wsUrl?: string
  explorerUrl: string
  nativeCurrency?: { name: string; symbol: string; decimals: number }
  // Polkadot-specific
  paraId?: number
  ss58Prefix?: number
}
```

### 2.3 Environment Variables

```env
# Multi-chain RPC (override defaults in asset registry)
NEXT_PUBLIC_POLKADOT_WS_URL=wss://rpc.polkadot.io
NEXT_PUBLIC_ASSET_HUB_WS_URL=wss://polkadot-asset-hub-rpc.dwellir.com
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Hyperbridge (per Hyperbridge docs)
NEXT_PUBLIC_HYPERBRIDGE_API_URL=https://...
HYPERBRIDGE_API_KEY=optional

# Feature flags / supported chains (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 3. XCM Integration

### 3.1 Role of XCM

- **Outbound (Parachain → EVM):** User on parachain initiates transfer; application composes XCM message (or calls pallet that does) to send NFT to bridge pallet/destination. Hyperbridge (or relay) handles EVM side (lock on Polkadot, mint on EVM, or equivalent).
- **Inbound (EVM → Parachain):** User on EVM initiates; bridge burns/locks on EVM; XCM delivers to parachain (mint/unwrap). Application may only need to trigger EVM tx and then verify on parachain.

*Exact instructions (e.g. `WithdrawAsset`, `TransferAsset`, `UniversalOrigin`, `DescendOrigin`) depend on parachain and bridge pallet; follow XCM SDK and Polkadot Hub documentation.*

### 3.2 XCM Message Composition (Conceptual)

```typescript
// Pseudocode; actual API from XCM SDK / PAPI
import { buildXcmMessage } from '@polkadot/xcm-sdk' // or equivalent

async function composeNftTransferXcm(params: {
  sourceChainId: string
  destinationChainId: string
  collectionId: string | number
  itemId: string | number
  recipient: string  // SS58 or EVM address per destination
}): Promise<SubmittableExtrinsic> {
  const { sourceChainId, collectionId, itemId, recipient } = params
  const api = await getParachainApi(sourceChainId)
  // Build WithdrawAsset + BuyExecution + TransferAsset (or pallet-specific call)
  const extrinsic = await buildXcmMessage(api, {
    asset: { collectionId, itemId },
    dest: params.destinationChainId,
    beneficiary: recipient,
  })
  return extrinsic
}
```

### 3.3 Parachain API Setup (Dedot / PAPI)

```typescript
// Dedot example
import { DedotClient } from 'dedot'

const client = new DedotClient(registryConfig.parachains[chainId].wsUrl)
await client.connect()
const api = client.api
// Use api.tx.* for pallet calls; use XCM pallet or NFT pallet per chain
```

*Replace with PAPI if using @polkadot/api; ensure type definitions for NFT pallets (e.g. Uniques, Nfts) and XCM pallet.*

### 3.4 Transaction Submission (Polkadot)

- User signs via Polkadot.js extension (or injected wallet).
- Application submits extrinsic from composed XCM (or pallet call); track inclusion and finality via subscription.

```typescript
const unsub = await extrinsic.signAndSend(account, { nonce: -1 }, ({ status, txHash }) => {
  if (status.isInBlock) setStatus('in_block')
  if (status.isFinalized) {
    setStatus('finalized')
    setSourceTxHash(txHash.toHex())
    unsub()
  }
})
```

---

## 4. Hyperbridge Integration

### 4.1 Responsibility

- **EVM side:** Lock/burn NFT (or wrapped representation); emit bridge event or call bridge contract.
- **Polkadot side:** Receive message from bridge; mint/unwrap on parachain.
- **Application:** Call or trigger bridge UI/contract on EVM; optionally query bridge API for status; verify finality on both chains.

### 4.2 Client Usage (EVM)

- Use viem (or ethers) to:
  - Read bridge contract ABI (per Hyperbridge docs).
  - Call `lock`, `burn`, or equivalent with NFT contract + tokenId.
  - Listen for bridge events (e.g. `Locked`, `Bridged`) for status.

```typescript
// Pseudocode
const bridgeContract = getContract({
  address: HYPERBRIDGE_EVM_CONTRACT,
  abi: hyperbridgeNftBridgeAbi,
  client: publicClient,
})
const hash = await bridgeContract.write.lock([nftContract, tokenId, destChainId])
// Poll or subscribe for bridge completion on destination
```

### 4.3 Status and Verification

- **Source chain:** Track tx receipt and finality (Polkadot: finalized block; EVM: confirmations).
- **Destination chain:** Poll or subscribe for mint/transfer event or bridge “delivered” event; update UI when confirmed.

---

## 5. Asset Registry

### 5.1 Purpose

- Map chain identifiers to RPC, explorers, and chain type (relay/parachain/evm).
- Map asset IDs and NFT standards per chain (e.g. Uniques `collectionId` + `itemId`, ERC-721 `contract` + `tokenId`).
- Support “supported routes” (which source–destination pairs are enabled).

### 5.2 Data Structures

```typescript
interface AssetRegistryConfig {
  chains: Record<string, ChainConfig>
  assets: AssetMapping[]
  routes: BridgeRoute[]
}

interface AssetMapping {
  chainId: string
  standard: 'uniques' | 'nfts' | 'erc721' | 'erc1155'
  // Polkadot: collectionId, itemId or similar
  collectionId?: string
  // EVM: contract address
  contractAddress?: `0x${string}`
  symbol?: string
  name?: string
}

interface BridgeRoute {
  sourceChainId: string
  destinationChainId: string
  bridge: 'hyperbridge' | 'xcm-only'
  enabled: boolean
}
```

### 5.3 Storage

- **MVP:** JSON or TypeScript config in repo (e.g. `src/config/asset-registry.json`).
- **Later:** Backend or DB for dynamic updates.

### 5.4 NFT Metadata

- **Polkadot:** Use chain RPC (e.g. `uniques.item`, `nfts.item`) for metadata URI and attributes.
- **EVM:** Use ERC-721 `tokenURI()` and optional metadata standard; resolve IPFS/HTTP in frontend.

---

## 6. Frontend Technical Specifications

### 6.1 Pages & Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | HomePage | Connect wallets, source/destination + NFT selector, fee estimate, “Bridge” CTA |
| `/transfer/:transferId?` | TransferStatusPage | Step-by-step status, tx hashes, explorer links, error/retry |
| `/history` | HistoryPage | List of user’s bridge transfers with filters |
| `/analytics` | AnalyticsPage (optional) | Volume, success rate, popular routes |

### 6.2 State Management

- **Wallets:** Separate state for Polkadot account(s) and EVM address(es); optional context or store (e.g. Zustand).
- **Bridge flow:** Local state for current transfer (source chain, NFT, destination, status, sourceTxHash, destTxHash).
- **History:** Fetched from local storage, indexer, or backend (if implemented); keyed by user address(es).

### 6.3 Wallet Connection

**Polkadot:**

```typescript
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp'

const extensions = await web3Enable('Cross-chain NFT Bridge')
const accounts = await web3Accounts()
// Use accounts[0].address and accounts[0].meta.source for signing
```

**EVM:**

```typescript
// wagmi
const { connect, address, chain } = useAccount()
const { switchChain } = useSwitchChain()
// Ensure chain matches destination when bridging to EVM
```

### 6.4 Bridge Flow (User Actions)

1. User selects **source chain** → load supported NFTs for connected Polkadot account (or EVM if source is EVM).
2. User selects **NFT** (collection + item or contract + tokenId) → load metadata, image, name.
3. User selects **destination chain** → filter by `routes` in asset registry.
4. **Estimate fee:** Query XCM weight/fee and/or Hyperbridge fee; display in UI.
5. User clicks **Bridge** → compose XCM (or EVM call), open wallet for sign; on success, show “Transaction submitted” and move to status view.
6. **Status view:** Poll or subscribe for source finality → bridge progress → destination confirmation; show explorer links.

### 6.5 Responsive and Accessibility

- CSS (e.g. Tailwind) with breakpoints for mobile and desktop.
- Loading skeletons for NFT list and status; disabled buttons with tooltips when chain/wallet not selected.
- Semantic HTML and ARIA where needed for critical actions.

---

## 7. Verification Service

### 7.1 Responsibilities

- Confirm source transaction is finalized (Polkadot: block finality; EVM: N confirmations).
- Determine when bridge has completed (Hyperbridge API or destination chain event).
- Confirm destination chain has received NFT (query NFT owner or bridge “received” event).

### 7.2 Implementation Options

| Option | Pros | Cons |
|--------|------|------|
| Frontend polling | No backend | Higher latency; rate limits |
| Next.js API route + polling | Centralized logic | Still polling |
| WebSocket / subscription | Real-time | Depends on chain/bridge support |

**Recommendation for MVP:** Frontend polling with exponential backoff; optional API route to encapsulate RPC calls and cache.

### 7.3 Verification States

```typescript
type VerificationStatus =
  | 'source_pending'
  | 'source_finalized'
  | 'bridge_in_progress'
  | 'destination_pending'
  | 'destination_confirmed'
  | 'failed'
```

---

## 8. Data Models

### 8.1 Bridge Transfer (Frontend / History)

```typescript
interface BridgeTransfer {
  id: string
  userPolkadotAddress?: string
  userEvmAddress?: string
  sourceChainId: string
  destinationChainId: string
  asset: {
    standard: string
    collectionId?: string
    itemId?: string
    contractAddress?: `0x${string}`
    tokenId?: string
  }
  status: VerificationStatus
  sourceTxHash?: string
  destinationTxHash?: string
  createdAt: number
  updatedAt: number
  error?: string
}
```

### 8.2 Pipeline Status (UI)

```typescript
type PipelineStatus =
  | 'idle'
  | 'selecting'
  | 'estimating'
  | 'signing'
  | 'source_pending'
  | 'source_finalized'
  | 'bridge_in_progress'
  | 'destination_pending'
  | 'destination_confirmed'
  | 'complete'
  | 'error'

interface PipelineState {
  status: PipelineStatus
  transferId?: string
  sourceTxHash?: string
  destinationTxHash?: string
  error?: string
}
```

---

## 9. Project Structure

```
cross-chain-nft-bridge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx
│   │   ├── transfer/[...id]/page.tsx
│   │   ├── history/page.tsx
│   │   └── analytics/page.tsx
│   ├── components/
│   │   ├── wallet/
│   │   ├── bridge/
│   │   ├── history/
│   │   └── ui/
│   ├── lib/
│   │   ├── polkadot/            # API client, XCM helpers
│   │   ├── evm/                 # viem, Hyperbridge client
│   │   ├── asset-registry/
│   │   ├── verification/
│   │   └── config.ts
│   ├── config/
│   │   └── asset-registry.json
│   └── types/
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .github/workflows/ci.yml
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 10. Development Environment

### 10.1 Prerequisites

- Node.js 18+
- pnpm 9+
- Polkadot.js extension (or Talisman) for browser
- MetaMask (or compatible) for EVM
- Optional: local relay/parachain nodes for integration tests

### 10.2 Local Development

```bash
pnpm install
cp .env.example .env
# Fill RPC URLs and optional API keys
pnpm dev
```

- Use testnets (e.g. Westend, Asset Hub Westend, Sepolia) to avoid mainnet fees during development.

### 10.3 Config

- `src/lib/config.ts` reads `process.env` and exports chain list, RPC URLs, and feature flags.
- Asset registry loaded from `src/config/asset-registry.json` or equivalent.

---

## 11. Testing Strategy

### 11.1 Unit Tests (Vitest/Jest)

- **Asset registry:** Parse config; resolve chain by id; resolve route.
- **XCM composition:** Mock API; assert correct pallet/call structure (if SDK allows).
- **Verification:** Given mock RPC responses, assert status transitions.
- **Data models:** Serialization and validation of `BridgeTransfer`, `PipelineState`.

### 11.2 Integration Tests

- **Polkadot:** Connect to testnet RPC; fetch NFT list for a test account; optional: dry-run extrinsic.
- **EVM:** Connect to testnet; read NFT balance; optional: call bridge with revert expectation.
- **E2E (optional):** Playwright or Cypress: connect wallet, select chain, assert UI states; avoid real mainnet txs in CI.

### 11.3 CI (GitHub Actions)

```yaml
# .github/workflows/ci.yml
- run: pnpm install
- run: pnpm lint
- run: pnpm test
- run: pnpm build
```

---

## 12. Security Considerations

| Area | Measure |
|------|--------|
| Private keys | Never in frontend; user signs only in wallet extension |
| RPC / API keys | Use env vars; no keys in client bundle for sensitive ops |
| Bridge contracts | Use only documented Hyperbridge interfaces; no custom untrusted contracts |
| XCM payloads | Compose via official SDK; validate destination and beneficiary |
| User data | History can be stored client-side (e.g. localStorage) or hashed; no PII on server without consent |
| Dependencies | Audit (pnpm audit); pin critical deps |

---

## 13. Deployment

### 13.1 Build

```bash
pnpm build
```

- Output: Next.js static/Node output per config (e.g. `out/` for static export if applicable).

### 13.2 Hosting

- **MVP:** Vercel or Netlify (Next.js); set env vars in dashboard.
- **Alternative:** Node server with `pnpm start` behind reverse proxy.

### 13.3 Environment

- Production: use production RPC endpoints; optional rate limiting and error reporting (e.g. Sentry).

---

## 14. Appendix

### A. Glossary

- **XCM:** Cross-Consensus Message Format (Polkadot).
- **Hyperbridge:** Bridge protocol for Polkadot ↔ EVM.
- **Asset registry:** Config of chains, assets, and bridge routes.
- **Parachain:** Chain secured by Polkadot relay chain.

### B. References

- [PRD](./cross-chain-nft-bridge-PRD.md)
- [Cross-chain NFT Bridge brief](./cross-chain-nft-bridge.md)
- [Polkadot Wiki – XCM](https://wiki.polkadot.network/docs/learn-cross-chain)
- [Dedot](https://dedot.dev/)
- [Polkadot-API (PAPI)](https://polkadot-api.io/)
- [Hyperbridge Documentation](https://hyperbridge.network/)

---

**Document Owner:** Engineering  
**Reviewers:** —
