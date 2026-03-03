# Product Requirements Document: Cross-chain NFT Bridge

**Version:** 1.0  
**Status:** Draft  
**Target:** Polkadot Hub / Cross-chain Apps Track (ID #302)  
**Last Updated:** March 3, 2025

---

## 1. Executive Summary

### 1.1 Product Vision

The **Cross-chain NFT Bridge** is a web application that enables users to transfer NFTs seamlessly between Polkadot parachains and EVM chains. It leverages Polkadot Hub infrastructure—XCM for cross-parachain messaging and Hyperbridge for EVM interoperability—to deliver an intuitive, cost-effective, and secure bridge experience.

### 1.2 Problem Statement

Current cross-chain NFT solutions often suffer from:

- **Poor user experience** — Confusing flows, multiple manual steps, unclear status
- **High fees** — Expensive bridging and gas on multiple chains
- **Lack of interoperability** — Fragmented tools that don’t leverage the full Polkadot ecosystem

Users need a cross-chain NFT bridge that is intuitive, cost-effective, and built on Polkadot’s native cross-chain capabilities.

### 1.3 Solution

A web-first application that:

1. **Composes and sends XCM messages** for NFT transfers from Polkadot parachains
2. **Integrates with Hyperbridge** for secure bridging to and from EVM chains
3. **Tracks assets** across multiple chains via an asset registry
4. **Verifies cross-chain transactions** and surfaces clear status to the user
5. **Provides NFT-specific flows** (select NFT, choose destination chain, confirm, track)
6. **Delivers responsive UI** with comprehensive error handling and an analytics dashboard

---

## 2. Goals & Success Metrics

### 2.1 Goals

| Goal | Description |
|------|-------------|
| **G1** | Enable NFT transfers between Polkadot parachains and EVM chains via XCM + Hyperbridge |
| **G2** | Deliver a seamless, intuitive user experience (connect wallet, bridge, track status) |
| **G3** | Maintain security and decentralization of the underlying protocols |
| **G4** | Meet track requirements: documentation, testing, CI/CD, responsive design |

### 2.2 Success Metrics

| Metric | Target |
|--------|--------|
| Transaction success rate | > 99% |
| Average user session duration | > 5 minutes |
| User satisfaction score (NPS) | > 40 |
| Page load time | < 2 seconds |
| Critical security vulnerabilities | Zero |

---

## 3. User Personas

### 3.1 Primary: NFT Collector (Alice)

- **Needs:** Move NFTs between Polkadot (e.g., Unique, Efinity) and EVM (e.g., Ethereum, Base) without technical complexity
- **Pain:** Fragmented bridges, unclear fees, lost or stuck transfers
- **Expectation:** Connect wallet, pick NFT and destination, see clear status and history

### 3.2 Secondary: Developer (Bob)

- **Needs:** Clear documentation and integration points to extend or integrate with the platform
- **Pain:** Undocumented or opaque bridge APIs and flows
- **Expectation:** README, API/docs, and type-safe (TypeScript) code to build on

---

## 4. Core Features

### 4.1 Feature Overview

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F1 | XCM message composition and sending | P0 | Build and submit XCM messages for NFT transfer from source parachain |
| F2 | Multi-chain asset tracking | P0 | Asset registry and chain mappings; show NFT location and bridge status |
| F3 | Bridge protocol integration | P0 | Hyperbridge integration for Polkadot ↔ EVM NFT transfers |
| F4 | Cross-chain transaction verification | P0 | Verify and display confirmation status on source and destination chains |
| F5 | NFT-specific functionality | P0 | Select NFT, choose destination chain, estimate fees, execute and track |
| F6 | Responsive design | P0 | Usable on mobile and desktop |
| F7 | Error handling and user feedback | P0 | Clear errors, retry guidance, and status messages |
| F8 | Analytics dashboard | P1 | Usage insights (volume, success rate, popular routes) for operators/users |
| F9 | Transaction history | P1 | User-facing history of past bridge transactions |
| F10 | Wallet connection | P0 | Easy connect for Polkadot (e.g., Polkadot.js) and EVM (e.g., MetaMask) |

### 4.2 Out of Scope

- Fiat on/off ramps (future iteration)
- Native mobile apps (web-first only)
- Non-Polkadot chains (ecosystem focus)
- Advanced trading features (unless required by track)

---

## 5. Workflow Design

### 5.1 High-Level Bridge Flow

```
┌─────────────────────┐                    ┌─────────────────────┐
│  Polkadot Parachain  │                    │     EVM Chain       │
│  (e.g. Unique)      │                    │  (e.g. Ethereum)    │
│                     │                    │                     │
│  User's NFT         │   XCM +            │   Wrapped/          │
│  (Source)           │   Hyperbridge      │   Mapped NFT         │
│                     │ ◄────────────────► │   (Destination)     │
└─────────────────────┘                    └─────────────────────┘
         │                                              │
         │ 1. User selects NFT & destination            │ 4. Verify receipt
         │ 2. Compose XCM / trigger bridge              │ 5. Update asset registry
         │ 3. Track progress                            │
         └────────────────── Frontend ──────────────────┘
```

### 5.2 Step-by-Step User Flow

| Step | Actor | Action | System Response |
|------|--------|--------|------------------|
| 1 | User | Connects wallet (Polkadot +/or EVM) | Show connected address(es), supported chains |
| 2 | User | Selects source chain and NFT | Load NFT metadata; show destination options and fee estimate |
| 3 | User | Selects destination chain and confirms | Compose XCM / call bridge; show “Transaction submitted” |
| 4 | System | Sends XCM / interacts with Hyperbridge | Emit progress events; update UI (pending → confirming) |
| 5 | System | Verifies on destination | Mark “Confirmed”; update asset registry and history |
| 6 | User | Views history | List of past transfers with status and tx links |

### 5.3 XCM and Hyperbridge Integration

- **Outbound (Parachain → EVM):** Compose XCM message to transfer NFT to bridge pallet/contract; Hyperbridge handles EVM side (lock/mint or equivalent).
- **Inbound (EVM → Parachain):** User initiates on EVM; bridge locks/burns on EVM; XCM delivers to parachain and mints/unwraps NFT.
- **Verification:** Query source and destination chain state (and bridge state if exposed) to show confirmation.

*Exact message formats and pallet/contract interfaces to be aligned with XCM SDK and Hyperbridge documentation.*

---

## 6. Technical Architecture

### 6.1 System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Next.js, TypeScript)                   │
│  - Wallet connect (Polkadot.js, MetaMask/WalletConnect)                       │
│  - NFT selection, chain selection, fee display                                │
│  - Transaction status and history                                             │
│  - Analytics dashboard                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Application / API Layer                              │
│  - XCM message composition (XCM SDK)                                          │
│  - Hyperbridge client (bridge protocol integration)                           │
│  - Asset registry (chain + asset mappings)                                    │
│  - Cross-chain verification service                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│  Polkadot Parachains   │ │   Hyperbridge        │ │   EVM RPC            │
│  (Multi-chain RPC)     │ │   (EVM bridge)       │ │   (Multi-chain)       │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### 6.2 Key Technical Elements

| Component | Responsibility |
|-----------|----------------|
| **XCM SDK** | Compose and send XCM messages for NFT transfer from parachains |
| **Hyperbridge integration** | Execute and track Polkadot ↔ EVM bridge operations |
| **Multi-chain RPC** | Read state and submit transactions on multiple parachains and EVM chains |
| **Asset registry** | Map chain IDs, asset IDs, and NFT standards (e.g., RMRK, ERC-721) |
| **Verification service** | Check finality/confirmation on source and destination |

### 6.3 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React or Next.js, TypeScript |
| Polkadot | Dedot or Polkadot-API (PAPI), XCM SDK |
| EVM | ethers.js or viem, Hyperbridge SDK/docs |
| Testing | Jest or Vitest (unit + integration) |
| CI/CD | GitHub Actions |
| RPC | Multi-chain RPC providers per chain |

---

## 7. User Stories

### 7.1 Primary Flow

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US1 | As a user, I want to access a bridge for transferring NFTs between Polkadot parachains and EVM chains | I can open the app and see bridge UI with source/destination chain options |
| US2 | As a user, I want to connect my wallet easily | I can connect Polkadot and/or EVM wallet in few clicks and see my address(es) |
| US3 | As a user, I want to see clear transaction status | I see pending → confirming → confirmed (or error) with chain explorer links |
| US4 | As a user, I want to view my history | I see a list of past bridge transactions with status and links |
| US5 | As a user, I want to select an NFT and destination and complete a transfer | I select NFT, choose destination chain, see fee estimate, confirm, and transfer completes or fails with clear feedback |

### 7.2 Secondary Flow

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US6 | As a developer, I want clear documentation | README and docs explain architecture, XCM/Hyperbridge usage, and how to run/extend |
| US7 | As a user, I want to use the app on my phone | Layout and actions work on mobile viewports |

---

## 8. UI/UX Requirements

### 8.1 Screens / Key Views

| Screen / View | Elements |
|----------------|----------|
| **Connect** | Wallet connect (Polkadot, EVM), network/chain indicators |
| **Bridge** | Source chain + NFT selector; destination chain selector; amount/NFT count; fee estimate; “Transfer” / “Bridge” CTA |
| **Transaction status** | Step-by-step status (submit → XCM/bridge → confirm); tx hashes and explorer links; error state with retry or support |
| **History** | Table or list: date, source chain, destination chain, NFT, status, tx links |
| **Analytics (optional)** | Dashboard: volume, success rate, popular routes (for operators or power users) |

### 8.2 Responsive and Feedback

- Responsive layout for mobile and desktop (per track requirement).
- Loading states for wallet, NFT list, and transaction submission.
- Success and error toasts or inline messages; no silent failures.
- Accessible labels and structure for core actions.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load time < 2 seconds; UI remains responsive during bridge steps |
| **Reliability** | Graceful handling of RPC/bridge errors; retry or clear “failed” state |
| **Security** | No private keys in frontend; user signs only in wallet; no critical vulnerabilities |
| **Testing** | Unit and integration tests (Jest/Vitest); CI runs on push/PR |
| **Documentation** | README, setup, and where relevant API/architecture docs |
| **CI/CD** | Pipeline with GitHub Actions (build, test, optional deploy) |

---

## 10. Track Submission Alignment

| Requirement | How We Meet It |
|-------------|----------------|
| XCM message composition and sending | Implemented via XCM SDK in application layer |
| Multi-chain asset tracking | Asset registry + chain mappings; UI shows NFT location and status |
| Bridge protocol integration | Hyperbridge integration for EVM leg |
| Cross-chain transaction verification | Verification step and UI status |
| NFT-specific functionality | NFT selection, destination choice, transfer and history |
| Responsive design | Mobile and desktop layouts |
| Error handling and user feedback | Clear errors and status at each step |
| Analytics dashboard | Usage insights view |
| TypeScript, testing, CI/CD | TypeScript codebase; Jest/Vitest; GitHub Actions |

---

## 11. Risks & Assumptions

### 11.1 Risks

| Risk | Mitigation |
|------|------------|
| XCM/Hyperbridge API or flow changes | Pin to documented versions; abstract behind internal service layer |
| Multi-chain RPC latency or downtime | Use reliable RPC providers; show “loading” and retry on failure |
| NFT standard differences (RMRK vs ERC-721) | Asset registry and adapters per chain/standard |
| Security of bridge contracts | Rely on official Hyperbridge deployment; document assumptions |

### 11.2 Assumptions

- XCM SDK supports the required NFT transfer instructions for target parachains.
- Hyperbridge supports NFT (or wrapped NFT) flows for specified EVM chains.
- Polkadot and EVM wallets can be connected from the same web app (e.g., Polkadot.js + MetaMask).
- Asset registry can be maintained as config or database for supported chain/asset IDs.

---

## 12. Milestones & Timeline

| Phase | Deliverable | Target |
|-------|-------------|--------|
| **M1** | Architecture finalised; asset registry and chain mapping design | Week 1 |
| **M2** | XCM composition and send path (parachain → bridge); multi-chain RPC | Week 2 |
| **M3** | Hyperbridge integration; end-to-end bridge flow (one direction) | Week 3 |
| **M4** | Frontend: connect, bridge UI, status, history; responsive layout | Week 4 |
| **M5** | Verification, error handling, analytics dashboard; tests and CI | Week 5 |
| **M6** | Documentation, security pass, submission | Week 6 |

*Total estimated: 4–6 weeks (Advanced).*

---

## 13. Appendix

### A. Glossary

- **XCM:** Cross-Consensus Message Format; Polkadot’s standard for cross-chain messages.
- **Hyperbridge:** Bridge protocol connecting Polkadot ecosystem to EVM chains.
- **Asset registry:** Mapping of chain IDs, asset IDs, and NFT standards for supported chains.
- **Parachain:** A blockchain connected to the Polkadot relay chain via consensus.

### B. References

- [Polkadot Hub Builder Playbook](https://wiki.polkadot.network/docs/build-build-with-polkadot)
- [Polkadot Wiki](https://wiki.polkadot.network/)
- [Dedot Documentation](https://dedot.dev/) (recommended JS client)
- [Polkadot-API (PAPI) Documentation](https://polkadot-api.io/)
- [XCM Documentation](https://wiki.polkadot.network/docs/learn-cross-chain)
- [Hyperbridge Documentation](https://hyperbridge.network/)
- [Cross-chain NFT Bridge brief](./cross-chain-nft-bridge.md)

---

**Document Owner:** Project Team  
**Reviewers:** —  
**Approval:** —
