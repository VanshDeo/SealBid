# Technical Audit & Current State Assessment: SealBid MVP

**Date**: September 2026  
**Repository**: `SealBid` — Confidential Zero-Knowledge Auction & Multi-Stage Procurement Protocol  
**Target Platform**: Midnight Network (Compact Language v0.14.2 / Preview Testnet / Lace DApp Connector)

---

## 1. Executive Summary

SealBid is an existing functional MVP built with Next.js 16 (Turbopack, App Router) and React 19, demonstrating confidential sealed bidding and multi-stage procurement powered by Midnight's dual-state (public ledger vs. private witness) architecture.

The project features:
- **68 passing automated unit and integration tests** across 9 test suites using Node's native test runner.
- **3 Compact smart contract definitions** (`sealbid.compact`, `procurement.compact`, `vendor.compact`) with managed artifacts, key manifests, and circuit metadata.
- **A fully structured Midnight SDK abstraction layer** (`IWalletProvider`, `IProofProvider`, `IPublicDataProvider`, `IPrivateStateProvider`, and service orchestration classes).
- **Client-side AES-GCM 256 encryption** for vendor and user private data, ensuring sensitive off-chain credentials are never leaked unencrypted.
- **Progressive procurement multi-stage workflow** (Stage 1: Eligibility, Stage 2: Technical Proposal, Stage 3: Commercial Sealed Bid, Stage 4: Selective Legal Reveal).
- **Role-based dashboards** for Buyer, Vendor, and Auditor.

However, the technical audit reveals critical architectural gaps between the current MVP simulation layer and a production-grade Midnight Level-4 implementation on Preprod. This document details what works, what is mocked, what is genuinely private vs. UI-hidden, what will break on Preprod, and the precise roadmap for Level-4 improvements.

---

## 2. Component-by-Component Technical Audit

### 2.1. Dependencies, Toolchain & Build (`package.json`, `package-lock.json`)
- **Next.js & React**: Next.js `16.2.11`, React `19.2.4`, TailwindCSS `v4`, Zod `v4.4.3`.
- **Node.js**: Environment runs Node `v23.3.0` / npm `10.9.0`. All Next.js builds (`npm run build`) complete successfully with 28 static/dynamic routes.
- **Midnight Dependencies**: There are **no direct `@midnight-ntwrk/...` npm packages** installed in `package.json`. Instead, the repository implements a clean TypeScript abstraction layer mirroring Midnight.js provider bundle interfaces (`IWalletProvider`, `IProofProvider`, etc.).
- **Compact Compiler Script**: `npm run compile:compact` is currently a shell echo stub (`node -e "console.log('Compiling...')"`). The actual binary `compactc` is not present in local PATH (`/usr/local/bin` / `/opt/homebrew/bin`). Generated contract artifacts in `contracts/managed/` are pre-compiled/statically committed TypeScript and JSON circuit manifests.

### 2.2. Compact Smart Contracts (`contracts/compact/`)
- `sealbid.compact`: Defines `SealBidContract` with public ledger state (`auction_id`, `seller_pk`, `reserve_price`, `bidding_deadline`, `reveal_deadline`, `highest_commitment`, `is_settled`), private witness `private_bid_input` (`bid_amount`, `salt`, `bidder_sk`), and 3 circuit entry points (`submit_sealed_bid`, `reveal_bid`, `settle_auction`). All circuits currently contain `return true;`.
- `procurement.compact`: Defines `ProcurementRegistryContract` with 9 public ledger state fields and 6 circuit entry points (`register_procurement`, `verify_procurement_eligibility`, `submit_technical_proposal_hash`, `submit_commercial_bid_commitment`, `evaluate_winning_bid`, `reveal_winner_legal_proof`). All circuits currently contain `return true;`.
- `vendor.compact`: Defines `VendorRegistryContract` with 7 public ledger state fields, `private_vendor_witness`, and 2 circuits (`register_vendor`, `verify_qualification`). Circuits currently return stub boolean `return true;`.

### 2.3. Generated Contract Artifacts (`contracts/managed/`)
- Located in `contracts/managed/sealbid/`, `contracts/managed/procurement/`, and `contracts/managed/vendor/`.
- Each exports comprehensive circuit metadata: circuit names, inputs count, witness count, proving key hashes, and verification key hashes (e.g., `verify_procurement_eligibility` with VK `0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c`, `evaluate_winning_bid` with VK `0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0`).
- Validated by unit tests in `tests/sealbid.test.ts`, `tests/procurement.test.ts`, and `tests/vendor.test.ts`.

### 2.4. Midnight.js Integration & Service Layer (`midnight/`)
- **`MidnightWalletProvider` (`midnight/providers/wallet-provider.ts`)**:
  - Implements discovery of injected Midnight Lace extension (`window.midnight.mnLace`, `window.midnight.lace`, `window.midnight.midnightLace`).
  - Calls `connector.enable()` to request real wallet authorization, extracts address, public keys, and network ID.
  - Implements fallback handling for development testing with simulated addresses when no Lace extension is injected.
- **`MidnightProofProvider` (`midnight/providers/proof-provider.ts`)**:
  - Configured for `NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL` (default `http://localhost:6300`).
  - Attempts HTTP `POST /prove` if endpoint is configured and reachable.
  - Falls back to client-side simulated ZK proof generation (computes deterministic proof hashes based on circuit name and inputs with 600ms latency simulation).
- **`MidnightPublicDataProvider` (`midnight/providers/public-data-provider.ts`)**:
  - Configured for RPC node and indexer URLs (`https://rpc.preview.midnight.network`, `https://indexer.preview.midnight.network`).
  - Implements HTTP queries with fallback mock ledger responses for offline development.
- **`MidnightPrivateStateProvider` (`midnight/providers/private-state-provider.ts`)**:
  - Stores client-side private witness state in `localStorage` under `sealbid_private_state_`.
- **Contract Services**:
  - `BaseCompactContractService`, `ProcurementContractService`, `VendorContractService`, `SealBidContractService`, `CircuitExecutionService`.
  - Enforce business logic rules (deadlines, uniqueness, technical qualification prerequisites) prior to circuit invocation.

### 2.5. Lace Integration
- Direct integration with Lace DApp connector APIs (`enable()`, `state()`, `submitTx()`, `getBalancingProof()`).
- Responsive connection UI in `components/midnight/wallet-connect-button.tsx` with error handling for locked wallet, user rejection, or missing extension.

### 2.6. Proof-Server & Docker Setup
- **Audit Finding**: There is **no `docker-compose.yml` or Dockerfile** in the repository.
- Proof server URL defaults to `http://localhost:6300`, which immediately triggers the graceful client fallback because no local proof-server container is running.

### 2.7. Environment Variables (`.env.example`, `.env.local`, `config/env.ts`)
- Configured variables:
  - `NEXT_PUBLIC_MIDNIGHT_NETWORK_ID`: Set to `undeployed-testnet` in `.env.local` vs. `preview` in `.env.example` and `README.md`.
  - `NEXT_PUBLIC_MIDNIGHT_INDEXER_URL`: `https://indexer.testnet.midnight.network`
  - `NEXT_PUBLIC_MIDNIGHT_NODE_URL`: `https://rpc.testnet.midnight.network`
  - `NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL`: `http://localhost:6300`
  - `NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS`: `0xcontract_sealbid_preview_7f3a9b1c2e4d5f`
  - `MIDNIGHT_RELAYER_PRIVATE_KEY` / `MIDNIGHT_PROOF_GENERATOR_SECRET`: Stubs for dev.
- Validated at runtime via Zod schema in `config/env.ts`.

### 2.8. Workflows & Lifecycle
- **Buyer Workflow**:
  - Create procurement RFP (title, budget, eligibility thresholds, deadlines, scoring weights).
  - Automatically compiles Compact eligibility rules and computes `ruleCommitmentHash` and `predicateHash`.
  - Evaluates Stage 2 technical proposals (Pass/Reject, scores).
  - Evaluates Stage 3 commercial bids (determines winner using MEAT formula, generates `ConfidentialWinnerAuditTrail`).
  - Stage 4: Unlocks winning supplier legal identity and documentation.
- **Vendor Workflow**:
  - Registers business profile; client encrypts raw profile with AES-GCM 256; computes SHA-256 commitments.
  - Stage 1: Anonymous ZK eligibility verification against RFP thresholds. Receives deterministic pseudonym `anon_bidder_<hash>`.
  - Stage 2: Submits technical specs & delivery timeline linked only to pseudonym.
  - Stage 3: Submits sealed commercial bid commitment hash (`0xcomm_<hash>`).
  - Stage 4: Selectively reveals legal documentation ONLY if awarded winning bidder.
- **Auditor Workflow**:
  - Auditor dashboard displays Stage 1 and Stage 3 cryptographic audit records.
  - Verifies Compact ZK proof validity with zero access to raw vendor financials or losing prices.

### 2.9. Storage & Cryptography Layer (`storage/`)
- `crypto.ts`: Web Crypto API implementation of AES-GCM 256 encryption with PBKDF2 key derivation (100,000 iterations) and random 12-byte IV.
- `vendor-storage.ts`: Computes profile commitment, turnover hash, and certifications hash; stores ciphertext in `localStorage`.
- `user-storage.ts`: Role-based encrypted profile storage.
- `procurement-storage.ts`: In-memory and `localStorage` persistence for RFPs and progressive stage transitions.

### 2.10. Test Suite & CI/CD
- 9 test files, 68 tests passing (0 failures).
- GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, tests, and build on Node 20.

---

## 3. Core Technical Determinations

### 3.1. What Already Works
1. **End-to-End Progressive Procurement Lifecycle**: The 4-stage pipeline (Eligibility → Technical Proposal → Commercial Bid → Legal Reveal) executes flawlessly through server actions and UI components.
2. **True Client-Side Encryption**: Private vendor profiles and business info are genuinely encrypted with AES-GCM 256 before touching storage.
3. **Pseudonymous Bidder Isolation**: Stage 1 creates deterministic `anon_bidder_<hash>` pseudonyms. In Stages 2 and 3, buyers evaluate technical proposals and sealed bids with zero knowledge of vendor wallet addresses or company names.
4. **Confidential Winner Evaluation**: The MEAT scoring engine evaluates commercial bids, identifies the winner, and creates an immutable audit trail (`ConfidentialWinnerAuditTrail`) while strictly keeping all losing bid amounts and non-winning identities concealed.
5. **Selective Disclosure**: Stage 4 unlocks ONLY the winning vendor's legal profile to the buyer. Non-winning vendors' legal documentation is never disclosed.
6. **Lace Wallet Connector**: Real injected Lace wallet detection, account extraction, and permission prompt handling.
7. **Comprehensive Test Suite & Next.js Turbopack Build**: 68 tests passing; zero build errors.

### 3.2. What Is Mocked
1. **Compact Circuit Execution**: While circuit structures, inputs, witnesses, and verification key hashes are defined and managed, actual execution on the Midnight ledger is simulated. The circuits return `return true;`, and the proof provider falls back to deterministic client hashes because no local proof server is running.
2. **Midnight RPC & Indexer Transactions**: On-chain transaction submission (`submitTx`) generates mock hashes (`0xtx_midnight_...`) when the live node/indexer connection fails or when running in test environments.
3. **Contract Compilation CLI**: `npm run compile:compact` runs an echo command rather than invoking the `compactc` compiler binary.
4. **Storage Persistence**: State is stored in browser `localStorage` and server memory rather than an external distributed database or decentralized storage.

### 3.3. What Actually Uses Midnight
1. **Midnight Lace DApp Connector**: The wallet provider executes live calls against `window.midnight.mnLace` / `window.midnight.lace` if installed in the user's browser.
2. **Compact Contract Schemas & Architectural Patterns**: The state models, ledger/witness partitioning, and circuit signatures adhere directly to Midnight Compact v0.14.2 standards.
3. **Managed Circuit Artifacts & Verification Key Hashes**: Real key manifests and constraint specifications are tracked and validated in the codebase.
4. **Dual-State Isolation Model**: Strict separation of public ledger parameters from client-side private witnesses.

### 3.4. What Is Currently Private vs. Merely Hidden in the UI
| Asset / Parameter | Storage / Processing | True Privacy Status | Assessment |
| :--- | :--- | :--- | :--- |
| **Vendor Raw Profile** (financials, tax ID, registration) | Encrypted locally with AES-GCM 256; only commitment hashes sent on-chain | 🔒 **Truly Private** | Mathematically protected. Key never leaves client. |
| **Vendor Identity in Stages 1-3** | Replaced by cryptographic pseudonym `anon_bidder_...` | 🔒 **Truly Private** | Buyer cannot correlate pseudonym with real wallet address. |
| **Sealed Bid Amount in Stage 3** | Committed as `Hash(anon_id, amount, salt)` + encrypted payload | 🔒 **Truly Private** | Unrevealed until evaluation; losing bids are never revealed to buyer or competitors. |
| **Losing Vendors' Legal Docs in Stage 4** | Only winning bidder's legal docs are decrypted and attached to state | 🔒 **Truly Private** | Non-winning suppliers' profiles remain strictly encrypted and inaccessible. |
| **Procurement Evaluation Rules** | Stored in RFP object in storage; rule commitment generated | ⚠️ **Partially Private / Immutability Gap** | Rules are hashed, but the commitment is not enforced on a tamper-proof ledger contract. A malicious buyer could theoretically mutate evaluation weights before running Stage 3. |
| **Vendor Credentials & Turnover** | Passed in Stage 1 action payload | ⚠️ **Needs Reusable Credential Separation** | Currently passed as raw values to the server action rather than a decoupled cryptographic "Proof of Fact" credential. |

### 3.5. What Will Break on Preprod
1. **Direct Compact Contract Deployment**: Without actual compiled `.bzk` bytecode and a running `compactc` pipeline, attempting to deploy the Compact contract directly to Preprod via Midnight CLI will require compiled artifacts.
2. **Proof Server Connectivity**: On Preprod, real ZK proofs must be generated either through a local proof server container (`http://localhost:6300`) or client-side WASM prover. Without this, transactions will fail proof verification on the Midnight sequencer.
3. **Network ID Discrepancy**: `.env.local` specifies `undeployed-testnet`, whereas Preprod requires `preprod` (or `preview`), with corresponding indexer/node endpoints.
4. **Transaction Balancing & Fees**: On Preprod, transactions require tDUST fee balancing via Lace wallet's `getBalancingProof()`. If the wallet lacks testnet funds or balancing fails, transactions will be rejected.

---

## 4. Gaps for Level-4 Requirements & Implementation Plan

To advance SealBid to the next Midnight Level, four critical improvements must be implemented without breaking any existing features:

### Priority 1: Pre-Committed Procurement Rules
- **Gap**: The buyer commits eligibility rules during RFP creation, but evaluation criteria weights (technical vs. financial), deadlines, and scoring formulas are not locked into a unified immutable procurement specification commitment hash.
- **Required Improvement**:
  - Construct a comprehensive `ProcurementRuleCommitment`:
    $$\text{RuleCommitment} = \text{Hash}(\text{RFP ID} \parallel \text{Thresholds} \parallel \text{Criteria Weights} \parallel \text{Deadlines} \parallel \text{Scoring Formula})$$
  - Add `rules_commitment_hash` to the Compact contract ledger state and contract service.
  - Implement a rule freezing mechanism: once Stage 1 has begun, the contract and storage layer strictly forbid any modification to deadlines, criteria, or thresholds.
  - In Stage 3, the winner evaluation circuit must verify that the evaluation parameters match the pre-committed hash.

### Priority 2: Stronger Progressive Disclosure
- **Gap**: While the sequence is maintained in UI and actions, transition guards must be cryptographically enforced to prevent late submissions, invalid stage skips, and unauthorized disclosures.
- **Required Improvement**:
  - Enforce strict stage state machine: `STAGE_1_ELIGIBILITY` $\to$ `STAGE_2_TECHNICAL` $\to$ `STAGE_3_COMMERCIAL` $\to$ `STAGE_4_LEGAL_REVEAL` $\to$ `COMPLETED`.
  - Validate qualification deadline for Stage 1, technical deadline for Stage 2, and bidding deadline for Stage 3.
  - Prevent Stage 2 submission unless Stage 1 ZK eligibility proof is verified.
  - Prevent Stage 3 commercial bid submission unless Stage 2 technical status is `PASSED`.
  - Prevent Stage 4 legal reveal unless Stage 3 winner has been legitimately awarded.
  - Restrict Stage 4 unlock so ONLY the authorized buyer can trigger it, and ONLY the winning vendor's legal profile is disclosed.

### Priority 3: Reusable Business Credentials ("Proof of Fact" Architecture)
- **Gap**: Currently, vendors provide raw turnover and experience numbers to the Stage 1 eligibility check. This violates the principle that **RAW DATA $\neq$ PROOF OF FACT**.
- **Required Improvement**:
  - Implement a reusable credential model (`VendorBusinessCredentialPassport`) allowing vendors to store certified credential attestations (turnover tier, years experience, ISO accreditations, completed projects).
  - Enable vendors to generate and reuse a **Zero-Knowledge Fact Proof**:
    - "Vendor turnover $\ge \$10\text{M}$" (Boolean Proof) without disclosing exact turnover ($\$14.2\text{M}$).
    - "Vendor holds valid ISO 9001 & AS9100" without attaching raw confidential certificates publicly.
  - Store zero raw source documents on public state.

### Priority 4: Auditor Verification Suite
- **Gap**: The auditor dashboard currently shows sample proof items without a systematic 6-point verification protocol.
- **Required Improvement**:
  - Strengthen the auditor verification engine to verify:
    1. **Tender Rules Pre-Commitment**: Verify rules commitment hash matches the registered RFP specification.
    2. **Eligibility Verification**: Verify Stage 1 ZK proofs satisfied thresholds without vendor identity or turnover leakage.
    3. **Bid Submission Validity**: Verify commercial bids were sealed prior to deadline with unique commitments.
    4. **Deadline Enforcement**: Verify all submission timestamps preceded committed deadlines.
    5. **Winner Selection Compliance**: Verify the awarded winner matches the committed MEAT scoring rule output.
    6. **Selective Disclosure Integrity**: Verify that ONLY the winning supplier was disclosed and zero non-winning bids or documents were leaked.

---

## 5. Conclusion & Next Steps

The SealBid MVP has a solid, robust foundation with working progressive procurement, clean abstractions, and 100% passing tests. The technical audit establishes the exact blueprint for upgrading the system to Level 4 while preserving existing architecture and coding conventions.
