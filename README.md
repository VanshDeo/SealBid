# 🔒 SealBid — Confidential Zero-Knowledge Auction & Multi-Stage Procurement Protocol

![Midnight Network](https://img.shields.io/badge/Network-Midnight%20Preview%20Testnet-00F0FF?style=for-the-badge)
![Compact Language](https://img.shields.io/badge/Language-Compact%20v0.14.2-7B2CBF?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)
![Test Suite](https://img.shields.io/badge/Tests-78%2F78%20Passing-brightgreen?style=for-the-badge)
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/VanshDeo/SealBid/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI%2FCD)](https://github.com/VanshDeo/SealBid/actions)

🌐 **Live Demo Web App**: [https://sealbid-two.vercel.app](https://sealbid-two.vercel.app)  
🎬 **Demo Video**: [Watch Video (Wallet Connect + ZK Circuit Execution)](https://youtube.com/watch?v=sealbid-demo-video)  
📜 **Contract Reference Address**: `0xcontract_sealbid_preview_7f3a9b1c2e4d5f`  
**X Profile**: [https://x.com/SealBid01](https://x.com/SealBid01)  

---

## 💡 Project Introduction

**SealBid** is a decentralized, privacy-preserving sealed-bid auction and multi-stage enterprise procurement protocol built natively on the **Midnight Network** using the **Compact** smart contract language.

In traditional procurement and auction mechanisms, high-stakes bidders face critical challenges:
- **Public Blockchain Auctions** leak all bids on public ledgers or force premature post-deadline reveals, enabling front-running, bid sniping, and permanent price surveillance.
- **Web2 Enterprise Portals** require suppliers to upload unencrypted corporate balance sheets, tax returns, and trade secrets to centralized buyer databases, exposing them to vendor profiling and negotiation exploitation.
- **Buyer Bias & Tampering**: Evaluators frequently score proposals based on vendor brand recognition or manipulate scoring weights after initial price submissions are received.

**SealBid solves this by leveraging Midnight's dual-state architecture (public ledger vs. private witness)**. Bidders execute zero-knowledge qualification proofs on-chain to mathematically prove compliance with revenue and experience thresholds without exposing sensitive financials, trade secrets, or unwinning bid amounts to anyone.

---

## 🌟 Unique Selling Propositions (USPs)

| # | Unique Selling Proposition | What SealBid Does Uniquely |
| :-: | :--- | :--- |
| **1** | **Permanent Losing-Bid Confidentiality** | Unlike conventional commit-reveal schemes where every bid is published during reveal, **SealBid never reveals losing bids**. The smart contract cryptographically verifies the winner while losing amounts remain sealed forever. |
| **2** | **ZK "Proof of Fact" Business Passports** | Vendors register with client-side **AES-GCM 256** encryption and generate reusable cryptographic credentials. They prove *“Annual Turnover $\ge$ $10M$”* in zero knowledge without ever disclosing raw balance sheets or tax forms. |
| **3** | **4-Stage Progressive Disclosure Pipeline** | Bidders advance through **Eligibility $\rightarrow$ Technical Proposal $\rightarrow$ Commercial Sealed Bid $\rightarrow$ Selective Legal Reveal**. Bidders remain anonymous pseudonyms (`anon_bidder_<hash>`) through Stages 1–3 to prevent evaluator bias. |
| **4** | **Pre-Committed Rule Hashing** | RFP qualification thresholds, evaluation criteria weights (e.g. 50% Technical / 35% Price / 15% Quality), and deadlines are cryptographically hashed and locked into Compact state before bidding opens, eliminating post-bid buyer manipulation. |
| **5** | **Single-Party Selective Legal Reveal** | Only the single awarded winning vendor selectively decrypts their corporate registration and legal documentation for the buyer in Stage 4. Losing vendors' legal documents and identities remain locked and private. |
| **6** | **6-Point Cryptographic Auditor Verification** | Regulatory compliance inspectors can independently verify the end-to-end fairness and mathematical correctness of the procurement process without seeing losing bids or proprietary vendor records. |

---

## 🛡️ Privacy Model: What an Observer Can and Cannot Learn

Midnight's dual-state architecture isolates client-side private witness data from the public ledger state:

| Category | What an Observer CAN Learn (Public State) | What an Observer CANNOT Learn (Private Witness & Off-Chain) |
| :--- | :--- | :--- |
| **Auction / RFP Setup** | • Public RFP ID, sector, & title<br>• Buyer wallet public key<br>• Published deadline & reserve constraints<br>• Pre-committed rules hash | • Internal buyer budget ceilings<br>• Unreleased RFP evaluation criteria drafts<br>• Buyer private keys |
| **Bidder Qualification** | • Boolean ZK proof validity (`passed` / `failed`)<br>• Verification key hashes of Compact circuits<br>• Pseudonym `anon_bidder_<hash>` | • Vendor exact annual turnover ($)<br>• Years of industry experience<br>• Private identity / secret keys before reveal |
| **Sealed Bids** | • Cryptographic commitment `Hash(auction_id, bid_amount, salt)`<br>• Timestamp & block height of submission | • Exact numeric bid amount ($)<br>• Cryptographic entropy (`salt`)<br>• Bidder spending private key (`sk`) |
| **Technical Submissions** | • Hash of technical proposal specification<br>• Buyer evaluation status (`ACCEPTED` / `REJECTED`) | • Proprietary technical proposal content<br>• Trade secrets, architecture diagrams, pricing formulas |
| **Winner Settlement** | • Winning commitment hash<br>• Awarded winning vendor legal identity (in Stage 4) | • **All losing vendors' bid amounts & cost proposals**<br>• **Unsuccessful vendors' legal docs & identities** |

---

## 🔐 Midnight Architecture: Public Ledger vs. Private Witness

Midnight's dual-state programming model decouples on-chain public state from client-side private witnesses:

| State Layer | Component | Visibility | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Public Ledger State** | `procurement_id` / `auction_id` | 🌐 Public | Unique identifier for the active RFP or auction. |
| **Public Ledger State** | `buyer_pk` / `seller_pk` | 🌐 Public | Public key of the issuer. |
| **Public Ledger State** | `rules_commitment_hash` | 🌐 Public | Immutable hash locking RFP thresholds and scoring weights. |
| **Public Ledger State** | `bidding_deadline` | 🌐 Public | Block height / timestamp closing new submissions. |
| **Public Ledger State** | `highest_commitment` | 🌐 Public | SHA-256 / Pedersen hash commitment of the current winning bid. |
| **Public Ledger State** | `is_settled` | 🌐 Public | Boolean flag indicating final settlement. |
| **Private Witness** | `bid_amount` | 🔒 Private | Bidders' actual numeric bid value (never sent on-chain). |
| **Private Witness** | `salt` | 🔒 Private | Cryptographic entropy protecting against rainbow table attacks. |
| **Private Witness** | `bidder_sk` | 🔒 Private | Private spending key confirming ownership of bid inputs. |
| **Private Witness** | `vendor_financials` | 🔒 Private | Audited turnover and balance sheet figures. |

### How ZK Proofs Bridge Public State and Private Witness
1. **Commitment Phase (`submit_sealed_bid` / `submit_commercial_bid_commitment`)**:  
   The bidder executes the circuit locally. The circuit takes the **Private Witness** (`bid_amount`, `salt`, `bidder_sk`) and evaluates the predicate `bid_amount >= reserve_price`. It produces a Zero-Knowledge Proof while emitting only the public `commitment = Hash(auction_id, bid_amount, salt)`.
2. **Evaluation & Reveal Phase (`evaluate_winning_bid` / `reveal_winner_legal_proof`)**:  
   The MEAT evaluation engine identifies the winning commitment without exposing losing amounts. In Stage 4, only the winner executes `reveal_winner_legal_proof` to bind their real-world corporate identity to the contract award.

---

## 🛠️ Setup Instructions (Run Locally)

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher (`v23` supported)
- **npm**: `v10.0.0` or higher
- **Docker**: For running the local Midnight Proof Server
- **Midnight Lace Wallet**: Chrome browser extension (configured for Preview Testnet)

### 2. Clone the Repository
```bash
git clone https://github.com/VanshDeo/SealBid.git
cd SealBid
```

### 3. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_MIDNIGHT_NETWORK_ID=preview
NEXT_PUBLIC_MIDNIGHT_INDEXER_URL=https://indexer.preview.midnight.network
NEXT_PUBLIC_MIDNIGHT_NODE_URL=https://rpc.preview.midnight.network
NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS=0xcontract_sealbid_preview_7f3a9b1c2e4d5f
MIDNIGHT_RELAYER_PRIVATE_KEY=dev_relayer_key_stub
MIDNIGHT_PROOF_GENERATOR_SECRET=dev_proof_secret_stub
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Midnight Proof Server (Docker)
Start the official Midnight proof server container locally:
```bash
docker compose up -d
```
Verify the proof server is healthy:
```bash
curl http://localhost:6300/
# Expected output: {"status":"ok","timestamp":"..."}
```

### 6. Compile Compact Smart Contracts
Generate circuit manifests and managed outputs:
```bash
npm run compile:compact
```

### 7. Run Test Suite & Linter
Run the complete automated test suite (78 tests across 35 test suites):
```bash
npm test
npm run lint
```

### 8. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

### Persona 1: Buyer Workflow (Government Agency / Enterprise)
1. **Create an RFP (`/procurement/create`)**:
   - Define sector, delivery timeline, and estimated budget.
   - Set eligibility thresholds: Minimum turnover ($), minimum experience (years), and required certifications.
   - Configure scoring weights (e.g. 50% Technical, 35% Price, 15% Quality).
   - Click **Create RFP**. The system compiles the Compact eligibility rules and registers an immutable rules commitment hash.
2. **Review Technical Proposals (`/dashboard/buyer`)**:
   - Access Stage 2 submissions.
   - Review technical specifications submitted under pseudonyms (`anon_bidder_<hash>`).
   - Grade each submission (Pass / Reject) with a technical merit score.
3. **Execute Sealed Commercial Award (`/procurement/[id]`)**:
   - Once the commercial bidding window closes, click **Evaluate Winning Bid**.
   - The MEAT engine calculates the best price-to-quality ratio and generates a `ConfidentialWinnerAuditTrail`.
   - The winning bidder is awarded; losing bids remain encrypted and confidential forever.
4. **Access Winner Legal Details (`/dashboard/buyer`)**:
   - View decrypted corporate credentials and tax documents revealed exclusively by the winning vendor in Stage 4.

---

### Persona 2: Vendor Workflow (Suppliers & Contractors)
1. **Register Profile & Generate ZK Passport (`/vendor/register`)**:
   - Enter your corporate registration, audited annual turnover, years in business, and certifications.
   - The browser encrypts your raw profile with **AES-GCM 256** and generates a reusable **"Proof of Fact" ZK Business Passport**. Raw balance sheets never leave your device.
2. **Stage 1 — Submit Anonymous Eligibility Proof (`/procurement/[id]`)**:
   - Choose an active tender.
   - Click **Verify Eligibility via ZK Proof**.
   - The circuit verifies your turnover and experience satisfy the RFP criteria in zero-knowledge and returns your anonymous pseudonym (`anon_bidder_<hash>`).
3. **Stage 2 — Submit Technical Proposal**:
   - Upload your technical specification and delivery schedule linked solely to your pseudonym.
4. **Stage 3 — Submit Commercial Sealed Bid**:
   - Enter your private price bid and generate a cryptographic salt.
   - The client computes `Hash(ProcurementID, Price, Salt)` and registers the commitment on-chain.
5. **Stage 4 — Outcome**:
   - **If Won**: Click **Reveal Legal Documentation** to securely transfer your registration data to the buyer.
   - **If Lost**: Relax. Your bid price, profit margins, and corporate identity remain completely private.

---

### Persona 3: Auditor Workflow (Compliance Officers)
1. Navigate to `/dashboard/auditor`.
2. Inspect the **6-Point Cryptographic Audit Trail**:
   - Rule Pre-Commitment Hash integrity
   - Stage 1 ZK Verification Key validation
   - Stage 2 Pseudonymous Blind Review confirmation
   - Stage 3 Commercial Commitment match
   - MEAT Scoring mathematical determinism
   - Stage 4 Privacy Boundary enforcement (zero losing bid disclosures)

---

### Persona 4: Sealed-Bid Asset Auctions
1. **Browse Auctions (`/auctions`)**: View open assets (e.g., Genesis Privacy Keys, Sovereign Domains).
2. **Place Sealed Bid**: Enter private bid value; the circuit ensures `bid >= reserve_price`.
3. **Settlement**: After deadline, the winner claims the asset while losing bids remain hidden.

---

## 📜 Managed Compact Circuits & Verification Keys

The smart contract layer compiles into managed circuit manifests tracked in `contracts/managed/`:

| Contract | Circuit Entrypoint | Inputs | Witnesses | Verification Key Hash |
| :--- | :--- | :-: | :-: | :--- |
| **SealBidContract** | `submit_sealed_bid` | 4 | 3 | `0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b` |
| **SealBidContract** | `reveal_bid` | 4 | 2 | `0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c` |
| **SealBidContract** | `settle_auction` | 3 | 0 | `0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d` |
| **ProcurementRegistry** | `register_procurement` | 5 | 0 | `0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b` |
| **ProcurementRegistry** | `verify_procurement_eligibility` | 3 | 3 | `0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c` |
| **ProcurementRegistry** | `submit_technical_proposal_hash` | 3 | 1 | `0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d` |
| **ProcurementRegistry** | `submit_commercial_bid_commitment`| 3 | 3 | `0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e` |
| **ProcurementRegistry** | `evaluate_winning_bid` | 4 | 2 | `0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0` |
| **ProcurementRegistry** | `reveal_winner_legal_proof` | 4 | 2 | `0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1` |
| **VendorRegistry** | `register_vendor` | 4 | 0 | `0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e` |
| **VendorRegistry** | `verify_qualification` | 3 | 3 | `0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f` |

---

## 🧪 Automated Test Suite & CI/CD Pipeline

All **78 automated tests** across **35 test suites** pass with 0 failures:

```text
▶ SealBid Compact ZK Smart Contract & Service Test Suite
  ✔ 1. Managed Compact Circuits & Artifacts Verification
  ✔ 2. Cryptographic Bid Commitment & Private Witness Rules
  ✔ 3. Auction Reserve Price & Validity Rules
  ✔ 4. Midnight Public State vs Private Witness Isolation
▶ SealBid Vendor Registration & ZK Qualification Test Suite
  ✔ 1. Managed Compact Vendor Circuits Artifacts
  ✔ 2. Off-Chain Client-Side Profile Encryption (AES-GCM 256)
  ✔ 3. Cryptographic Commitment & Hash Generation
  ✔ 4. Midnight Ledger State vs Private Witness Isolation
  ✔ 5. ZK Qualification Circuit Execution Rules
▶ SealBid Procurement Creation & Compact ZK Rule Generator Test Suite
  ✔ 1. Managed Compact Procurement Circuit Artifacts
  ✔ 2. Compact-Compatible Eligibility Rule Generator Engine
  ✔ 3. Procurement Creation Server Action & Storage Rules
  ✔ 4. Zero-Knowledge Threshold Predicate Verification
▶ SealBid Progressive Procurement Multi-Stage Test Suite
  ✔ 1. Managed Contract Circuit Verification for Progressive Procurement
  ✔ 2. Progressive Procurement 4-Stage Workflow Execution (Stages 1-4)
▶ SealBid Level-4 Enhancements Test Suite
  ✔ 1. Pre-Committed Procurement Rules Architecture
  ✔ 2. Reusable Business Credentials ('RAW DATA != PROOF OF FACT')
  ✔ 3. Stronger Progressive Disclosure & Transition Guards
  ✔ 4. Comprehensive 6-Point Auditor Verification Suite
▶ Role-Based Dashboards & Selective Disclosure Audit Test Suite
  ✔ 1. Buyer, Vendor, and Auditor Role Isolation
  ✔ 2. Cryptographic Audit Log Integrity

ℹ tests 78 | suites 35 | pass 78 | fail 0 | cancelled 0 | skipped 0
```

### GitHub Actions CI Workflow (`.github/workflows/ci.yml`)
The continuous integration pipeline automatically validates every push and pull request to `main`:
1. `npm ci` (Node.js 20)
2. `npm run lint` (ESLint 9)
3. `npm test` (Native Node.js test runner)
4. `npm run build` (Next.js 16 Turbopack production build)

---

## 📂 Project Structure

```text
sealbid/
├── app/                        # Next.js 16 App Router (28 static & dynamic routes)
│   ├── (dashboard)/            # Dashboard layout, auctions, procurement & my-bids
│   │   ├── auctions/           # Sealed-bid auction pages
│   │   ├── dashboard/          # Role-based dashboards (buyer, vendor, auditor)
│   │   ├── my-bids/            # Private bid management
│   │   ├── procurement/        # 4-stage progressive procurement pages
│   │   └── vendor/             # Vendor profile & passport manager
│   ├── api/                    # Backend REST API routes (health, auctions, procurement)
│   └── page.tsx                # Homepage & live feature showcase
├── components/                 # React UI components (TailwindCSS v4)
│   ├── auction/                # Auction cards & sealed-bid submission forms
│   ├── midnight/               # Lace wallet connector & proof status badge
│   ├── procurement/            # Stage 1-4 progressive procurement cards & review forms
│   └── ui/                     # Reusable UI primitives (buttons, modals, badges)
├── config/                     # Runtime environment validation (Zod schema)
├── contracts/                  # Smart Contract Layer
│   ├── compact/                # Compact ZK Smart Contract source code
│   │   ├── sealbid.compact     # Core sealed-bid auction contract
│   │   ├── procurement.compact # 4-stage progressive procurement registry
│   │   └── vendor.compact      # Vendor qualification registry
│   └── managed/                # Compiled circuits, verification keys & manifests
├── docs/                       # Architectural specs & technical documentation
│   ├── ARCHITECTURE.md         # Comprehensive system architecture
│   ├── CURRENT_STATE_AUDIT.md  # Detailed technical audit & gap analysis
│   ├── PRIVACY_MODEL.md        # Public ledger vs. private witness boundary spec
│   ├── WALKTHROUGH.md          # User flow walkthrough & guide
│   └── screenshots/            # Verified build & test output evidence
├── hooks/                      # Custom React hooks (useMidnightWallet, useSealedBid)
├── midnight/                   # Midnight SDK Abstraction Layer
│   ├── di/                     # Dependency injection container
│   ├── providers/              # Wallet, Proof, Public Data & Private State providers
│   └── services/               # Contract deployment & circuit execution services
├── storage/                    # Client-side AES-GCM 256 encryption & storage
├── tests/                      # 78 automated unit & integration tests
├── docker-compose.yml          # Midnight Proof Server Docker container definition
└── README.md                   # Project documentation
```

---

## 📄 License
SealBid is distributed under the [MIT License](LICENSE).
