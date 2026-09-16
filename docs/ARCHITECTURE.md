# SealBid System Architecture: Confidential Procurement on Midnight

## 1. System Overview

SealBid is a privacy-first enterprise procurement platform built on the **Midnight Network** using **Compact smart contracts**. It implements a confidential sealed-bid tender lifecycle with pre-committed evaluation rules, verifiable credentials, progressive multi-stage disclosure, and independent zero-knowledge auditability.

```
+----------------------------------------------------------------------------------------------------+
|                                    SEALBID APPLICATION TIER                                        |
|                                                                                                    |
|   +--------------------------+  +--------------------------+  +--------------------------------+   |
|   |     Buyer Dashboard      |  |     Vendor Dashboard     |  |       Auditor Dashboard        |   |
|   |  - RFP Rule Commitment   |  |  - Reusable Passports    |  |  - 6-Point Tender Audit        |   |
|   |  - Technical Evaluation  |  |  - Blind Qualification   |  |  - Tamper & Timeline Checks    |   |
|   |  - Winner Selection      |  |  - ZK Bid Sealing        |  |  - Zero-Leakage Verifier       |   |
|   +--------------------------+  +--------------------------+  +--------------------------------+   |
|                 │                             │                               │                    |
|                 └──────────────────────┬──────┴───────────────────────────────┘                    |
|                                        ▼                                                           |
|                          Next.js 14 Server Actions Layer                                           |
|                     (actions/procurement-actions, vendor-actions)                                  |
+----------------------------------------┬-----------------------------------------------------------+
                                         │
                                         ▼
+----------------------------------------------------------------------------------------------------+
|                                    MIDNIGHT INTEGRATION LAYER                                      |
|                                                                                                    |
|   +----------------------------------------------------+  +------------------------------------+   |
|   |          Procurement Contract Service              |  |         Circuit Proof Runner       |   |
|   |    (midnight/services/procurement-contract-service)|  |     (midnight/circuit-runner.ts)   |   |
|   +----------------------------------------------------+  +------------------------------------+   |
|                                        │                                                           |
|                 ┌──────────────────────┴──────────────────────┐                                    |
|                 ▼                                             ▼                                    |
|   +----------------------------+                +----------------------------+                     |
|   |   Live Midnight Network    |                |    Proof Engine Simulator  |                     |
|   |   - Lace Wallet Provider   |                |   (Deterministic ZK Prover)|                     |
|   |   - Docker Proof Server    |                |   - Pedersen Commitments   |                     |
|   |   - Indexer Client         |                |   - SHA256 Compact State   |                     |
|   +----------------------------+                +----------------------------+                     |
+----------------------------------------┬-----------------------------------------------------------+
                                         │
                                         ▼
+----------------------------------------------------------------------------------------------------+
|                                MIDNIGHT COMPACT SMART CONTRACTS                                    |
|                                                                                                    |
|   contracts/compact/procurement.compact                                                            |
|   ├── rules_commitment_hash & is_rules_locked (Pre-committed criteria tamper-resistance)           |
|   ├── submit_eligibility_proof (Proof-of-Fact qualification verification)                          |
|   ├── submit_technical_proposal (Anonymized technical hash transition)                             |
|   ├── submit_sealed_bid (Pedersen-committed commercial pricing)                                    |
|   ├── finalize_winner (Zero-knowledge score ranking verification)                                  |
|   └── reveal_winner_legal_proof (Winner-only selective corporate disclosure)                       |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Directory Structure & Key Components

```
sealbid/
├── actions/                         # Next.js Server Actions (Mutation & Verification entrypoints)
│   ├── procurement-actions.ts       # Tender creation, rule locking, stage evaluation, 6-point audit
│   └── vendor-actions.ts            # Reusable credential passports, ZK bids, legal reveals
├── app/                             # Next.js App Router
│   ├── (dashboard)/dashboard/
│   │   ├── auditor/page.tsx         # 6-Point Zero-Knowledge Auditor Verification Suite
│   │   ├── buyer/                   # Buyer tender authoring & multi-stage evaluation
│   │   ├── vendor/                  # Vendor passport manager & confidential bid submission
│   │   └── procurement/             # Multi-stage tender visualizer & timeline inspector
│   └── layout.tsx & page.tsx        # Shell layout & interactive landing page
├── components/                      # UI Components
│   ├── procurement/                 # Stage 1 to 4 interactive cards, Rule Locking modal
│   ├── vendor/                      # Credential Passport viewer, Proof generator
│   └── ui/                          # Design system components
├── contracts/                       # Smart Contract Layer
│   ├── compact/                     # Compact DSL source files (*.compact)
│   │   ├── procurement.compact      # Master procurement lifecycle contract
│   │   ├── bid_evaluation.compact   # Multi-criteria scoring circuits
│   │   ├── vendor_qualification.compact # Turnover & accreditation proof circuits
│   │   └── progressive_disclosure.compact # Stage release state machine
│   └── managed/                     # Compiled Compact artifacts & TypeScript contract types
├── lib/                             # Shared business logic & types
│   ├── types.ts                     # Procurement, Credential Passport, and Audit data models
│   ├── compact-rule-generator.ts    # SHA-256 unified procurement rule commitment calculator
│   └── mock-data.ts                 # Seed fixtures & initial demo state
├── midnight/                        # Midnight.js SDK Client & Adapter Layer
│   ├── circuit-runner.ts            # Proof generation and verification adapter
│   ├── providers/                   # Wallet, Proof Server, and Indexer providers
│   ├── services/                    # Procurement contract service interfacing Midnight contracts
│   └── wallet/                      # Midnight wallet connector & Lace integration
├── storage/                         # Local persistence layer
│   ├── procurement-storage.ts       # Procurement state store with tamper-lock checks
│   └── vendor-storage.ts            # Reusable credential passport repository
└── tests/                           # Verification test suite
    ├── procurement-lifecycle.test.ts # Full 4-stage lifecycle tests
    ├── midnight-circuit-runner.test.ts # Compact circuit runner unit tests
    └── reusable-credentials-and-audit.test.ts # Credential passport & 6-point audit tests
```

---

## 3. Compact Smart Contracts Architecture

The core procurement logic is codified in Compact circuits (`contracts/compact/procurement.compact`), compiled using `compactc` v0.14.2.

### State Representation
- **`procurement_id: Bytes<32>`**: Unique identifier for the procurement tender.
- **`buyer_address: Bytes<32>`**: Midnight public key of the contracting authority.
- **`stage: Stage`**: Enum (`Created`, `Eligibility`, `Technical`, `Commercial`, `Finalized`).
- **`rules_commitment_hash: Bytes<32>`**: Pre-committed cryptographic fingerprint of evaluation criteria.
- **`is_rules_locked: Boolean`**: Prevents rule modifications once bidding initiates.
- **`sealed_bids_count: Uint<32>`**: Public counter of submitted sealed commitments.
- **`winning_vendor_hash: Bytes<32>`**: Public identity hash of the confirmed winner.
- **`winner_legal_revealed: Boolean`**: Flag indicating Stage 4 selective legal reveal completion.

### Circuit Operations & Transitions
1. **`create_procurement(...)`**: Initializes ledger state with rules commitment hash.
2. **`lock_procurement_rules(rules_hash)`**: Irreversibly locks evaluation criteria before Stage 1 closes.
3. **`submit_eligibility_proof(vendor_hash, proof_hash)`**: Records proof-of-fact qualification without receiving financial statements.
4. **`submit_technical_proposal(proposal_hash)`**: Records blinded technical specification hash.
5. **`submit_sealed_bid(bid_commitment)`**: Appends Pedersen commitment $C = \mathcal{H}(B \parallel S)$ to sealed bid ledger.
6. **`finalize_winner(winner_hash, winning_score)`**: Asserts score calculation matches pre-committed rules.
7. **`reveal_winner_legal_proof(vendor_hash, legal_doc_hash)`**: Allows **only** the winning vendor hash to register Stage 4 legal compliance; rejects non-winning submissions.

---

## 4. Reusable Business Credential Passport Architecture

To realize the paradigm of **"RAW DATA ≠ PROOF OF FACT"**, SealBid introduces `ReusableBusinessCredentialPassport`:

```
+--------------------------------------------------------------------------------+
|                   ReusableBusinessCredentialPassport                           |
|  - passportId: "pass-iso27001-fin-001"                                         |
|  - vendorAddress: "0x3f7a...8b9c"                                              |
|  - credentials:                                                                |
|      * FinancialStanding: { certifiedTurnoverTier: "tier_3_15m_to_50m", ... }  |
|      * Accreditations:    [ "ISO_27001", "SOC_2_TYPE_II" ]                    |
|      * SanctionsCheck:    "CLEAN_VERIFIED"                                     |
|  - commitmentHash: SHA256(vendorAddress || credentials || salt)                |
|  - issuedAt, validUntil, issuerPublicKey                                       |
+---------------------------------------┬----------------------------------------+
                                        │
                                        │  proveCriteriaMet(minTurnover, certs)
                                        ▼
+--------------------------------------------------------------------------------+
|                         CredentialFactProof (Witness)                          |
|  - factProofId: "fact-proof-stage1-..."                                        |
|  - passportId: "pass-iso27001-fin-001"                                         |
|  - tenderId: "rfp-2026-001"                                                    |
|  - turnoverMet: true                                                           |
|  - accreditationsMet: true                                                     |
|  - noSanctionsFlag: true                                                       |
|  - proofSignature: "sig_ed25519_fact_zk_verified_..."                          |
|  - zeroKnowledgeFactHash: SHA256(passportHash || tenderId || facts)            |
+--------------------------------------------------------------------------------+
```

Vendors reuse the same passport across any number of RFPs without sharing raw financial data.

---

## 5. Six-Point Auditor Verification Engine

Auditors verify procurement integrity through `getComprehensiveProcurementAuditAction(tenderId)` and `verifyFullTenderAuditAction(tenderId)`:

1. **Rule Lock Verification**: Validates `isRulesLocked === true` and computes SHA-256 of parameters against `procurementRulesCommitmentHash`.
2. **Timeline Integrity**: Cross-checks `submissionTime <= qualificationDeadline` and `biddingDeadline`.
3. **Fact-Based Qualification Integrity**: Cryptographically verifies `CredentialFactProof` zero-knowledge hashes for all Stage 1 qualifiers.
4. **Bid Commitment Integrity**: Validates Pedersen commitments $C = \mathcal{H}(\text{bid} \parallel \text{salt} \parallel \text{tenderId})$.
5. **Selective Disclosure Integrity**: Asserts that Stage 4 legal dossiers are disclosed strictly for `winningVendorHash`; losing suppliers' records remain confidential.
6. **Proof-of-Computation Scoring Integrity**: Validates evaluation weight formula:
   $$\text{FinalScore} = \left(\frac{\text{TechScore}}{100} \times W_{\text{tech}}\right) + \left(\frac{\text{MinBid}}{\text{EvaluatedBid}} \times 100 \times W_{\text{comm}}\right)$$

---

## 6. Execution Modes: Live Testnet vs Proof Simulator

The Midnight integration layer is built with dual-mode execution to ensure seamless development and testnet deployment:

| Dimension | Live Midnight Testnet Mode | Local Simulator Mode (Default/Fallback) |
|---|---|---|
| **Trigger** | `NEXT_PUBLIC_MIDNIGHT_USE_SIMULATOR=false` and Midnight nodes online | `NEXT_PUBLIC_MIDNIGHT_USE_SIMULATOR=true` or network unavailable |
| **Proof Server** | Docker Proof Server running at `http://localhost:6300` | In-memory deterministic cryptographic proof runner (`midnight/circuit-runner.ts`) |
| **Ledger Provider**| Midnight Indexer Client (`http://localhost:8088`) | Synchronized in-memory public ledger state (`storage/procurement-storage.ts`) |
| **Wallet** | Lace DApp Connector (`window.midnight?.mnLace`) | Synthetic vendor and buyer keypairs |
| **ZK Circuits** | ZK-SNARK provers compiled to WASM/native | Cryptographic Pedersen commitments and SHA-256 state transitions |
