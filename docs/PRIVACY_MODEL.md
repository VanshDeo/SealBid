# SealBid Privacy Model: Confidential Sealed-Bid Procurement

## 1. Core Thesis: "RAW DATA ≠ PROOF OF FACT"

In traditional enterprise and public procurement, vendors are routinely forced to surrender confidential proprietary information—audited balance sheets, customer lists, exact profit margins, unit-cost economics, and patent disclosures—merely to prove baseline compliance. This creates systemic risks:
1. **Bid Leakage**: Buyers or colluding insiders leak pricing structures to favoured incumbents.
2. **Post-Tender Rule Retrofitting**: Tender rules or scoring weights are secretly adjusted after bids are inspected to engineer an outcome.
3. **Overexposure of Proprietary IP**: Disqualified or losing bidders suffer permanent exposure of trade secrets without commercial benefit.

**SealBid flips this paradigm using Midnight's zero-knowledge dual-state architecture.**
Instead of uploading raw balance sheets or tax returns to a buyer's server:
- A vendor maintains their **private financial balance sheet locally**.
- A local zero-knowledge proof verifies: $\text{AnnualTurnover} \ge \$15\text{M}$ and $\text{SolvencyRatio} \ge 1.35$ and $\text{Accreditation} \in \{\text{ISO 27001, SOC 2}\}$.
- Only the **cryptographic fact proof** is submitted on-chain. The buyer and the public ledger learn that the vendor satisfies all criteria without learning the vendor's actual revenue, EBITDA, or proprietary finances.

---

## 2. Dual-State Ledger Visibility Architecture

SealBid leverages Midnight's Compact smart contract model, which explicitly distinguishes between **Public Ledger State** and **Private Local State**:

```
+-----------------------------------------------------------------------------------+
|                              PUBLIC LEDGER STATE                                  |
|  - procurement_id (Bytes<32>)                                                     |
|  - buyer_address (Bytes<32>)                                                      |
|  - stage (Stage: Created | Eligibility | Technical | Commercial | Finalized)       |
|  - rules_commitment_hash (Bytes<32>)                                              |
|  - is_rules_locked (Boolean)                                                       |
|  - sealed_bids_count (Uint<32>)                                                   |
|  - winning_vendor_hash (Bytes<32>)                                                |
|  - winner_legal_revealed (Boolean)                                                |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |  Zero-Knowledge Transition Proofs
                                         |  (Witnessed by private local secrets)
                                         v
+-----------------------------------------------------------------------------------+
|                        LOCAL PRIVATE STATE (Witness Data)                         |
|  Vendor Secret:                                                                   |
|    - vendor_sk / salt                                                             |
|    - Raw Financials: exact revenue, balance sheet, credit score                   |
|    - Raw Commercial Bid: unit pricing, financial bid amount                       |
|    - Stage 4 Legal Dossier: tax registration number, jurisdiction, corporate ID   |
|                                                                                   |
|  Buyer Secret:                                                                    |
|    - Evaluation scoring private nonces                                            |
|    - Commercial reserve price threshold                                          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Four-Stage Progressive Disclosure State Machine

The disclosure of information in SealBid is strictly progressive, unidirectional, and enforceable on-chain:

```
[ Stage 0: Pre-Committed Rules ]
   │
   ├─► Buyer publishes criteria, budget cap, scoring weights
   ├─► Unified `procurementRulesCommitmentHash` locked on Midnight ledger
   ├─► Rules CANNOT be altered once bids begin
   │
   ▼
[ Stage 1: Blind Qualification (Proof of Fact) ]
   │
   ├─► Vendor presents Reusable Credential Passport
   ├─► Proves: Turnover >= Min Threshold, ISO Cert Valid, Sanction-Free
   ├─► Disclosed: Zero raw financial data. Only cryptographic compliance proof.
   │
   ▼
[ Stage 2: Anonymized Technical Evaluation ]
   │
   ├─► Vendor submits anonymized technical specification + blinded proposal hash
   ├─► Disclosed: Architecture, SLA commitments, technical narrative.
   ├─► Hidden: Commercial pricing and company identity.
   │
   ▼
[ Stage 3: Zero-Knowledge Sealed Bid ]
   │
   ├─► Vendor submits Pedersen-committed commercial bid:
   │     commitment = H(bid_amount || vendor_salt || rfp_id)
   ├─► Vendor proves: bid_amount <= budget_cap without revealing bid_amount
   ├─► Disclosed: Zero knowledge of bid amount until official reveal phase.
   │
   ▼
[ Stage 4: Winner-Only Selective Legal Reveal ]
   │
   ├─► Evaluator proves winner selection based on pre-committed multi-criteria score.
   ├─► ONLY the confirmed winning bidder reveals Stage 4 corporate legal registration.
   ├─► Strict Guarantee: Losing bidders' identities, pricing, and raw data REMAIN PERMANENTLY PRIVATE.
```

---

## 4. Reusable Business Credential Passports

SealBid vendors hold portable, reusable credential passports issued or attested by institutional bodies (auditors, trade bodies, tax authorities):

### Structure
1. **Issuer Verification**: Attestation by certified authority key (`auth_pk`).
2. **Commitment Binding**: `passport_hash = H(vendor_public_key || credentials || nonce)`.
3. **Fact Proof Circuits**:
   - `proveTurnoverTier(balance_sheet, tier)`:
     $$\text{Turnover} \ge \text{TierMin} \implies \text{True}$$
   - `proveActiveAccreditation(cert_hash_list, required_cert)`:
     $$\text{required_cert} \in \text{cert_hash_list} \implies \text{True}$$
   - `proveCleanRegulatoryStanding(jurisdiction, timestamp)`:
     $$\text{SanctionsCheck} == \text{Clear} \implies \text{True}$$

### Privacy Guarantee
The vendor passes qualification across $N$ distinct tenders without re-submitting bank statements, tax IDs, or company director passports. The qualification check is atomic and zero-knowledge.

---

## 5. Tamper-Proof Pre-Committed Procurement Rules

To prevent procurement fraud and post-hoc tender manipulation:

1. **Commitment Construction**:
   $$\mathcal{H}_{\text{rules}} = \text{SHA256}(\text{RFP\_ID} \parallel \text{BudgetCap} \parallel \text{MinTurnover} \parallel \text{Weights} \parallel \text{Deadlines} \parallel \text{ScoringMethod})$$
2. **On-Chain Enforcement**:
   - Written to Midnight Compact contract ledger (`rules_commitment_hash`).
   - Flag `is_rules_locked = true` prevents any updates to tender parameters.
   - Any stage transition validates that inputs conform to $\mathcal{H}_{\text{rules}}$.
3. **Auditor Guarantee**:
   An independent auditor verifies that the evaluation formula and scoring weights applied to rank the bids match $\mathcal{H}_{\text{rules}}$ recorded before the first bid was received.

---

## 6. Six-Point Zero-Knowledge Auditor Verification Suite

An external auditor, regulatory ombudsman, or public compliance officer can verify the absolute integrity of a tender without seeing private bids or losing vendor identities:

| Point | Verification Dimension | Cryptographic Guarantee | Zero-Knowledge Property |
|---|---|---|---|
| **1** | **Pre-Committed Rule Lock** | Evaluates ledger state `is_rules_locked == true` and validates hash against criteria. | Buyer could not alter scoring weights after seeing submissions. |
| **2** | **Timeline Integrity** | Verifies all bids and qualifications occurred before on-chain deadlines. | No late bids or backdoor extensions. |
| **3** | **Fact-Based Qualification** | Validates `CredentialFactProof` cryptographic signatures and hash commitments. | Every qualified bidder met criteria without exposing balance sheets. |
| **4** | **Bid Confidentiality & Commitments** | Verifies Pedersen bid commitments: $C = \mathcal{H}(B \parallel S \parallel \text{RFP})$. | Bid amounts were tamper-proof and unreadable before opening. |
| **5** | **Strict Selective Disclosure** | Proves only the winning supplier's legal dossier is disclosed; losing dossiers remain locked. | 100% protection against bid-leakage to competitors. |
| **6** | **Proof-of-Computation Scoring** | Verifies winner selection matches: $\text{Rank} = f(\text{TechnicalScore}, \text{EvaluatedBid}, \mathcal{H}_{\text{rules}})$. | Evaluation faithfully followed the pre-committed formula. |

---

## 7. Threat Model & Security Properties

- **Honest-but-Curious Buyer**: Cannot peek at sealed bids before deadline, cannot adjust criteria to favour an incumbent, cannot view losing vendors' legal registrations.
- **Malicious Colluding Vendor**: Cannot submit bids after deadline, cannot claim turnover they lack (fails fact proof), cannot change bid after commitment.
- **Rogue Auditor**: Cannot reconstruct commercial bids or trade secrets from the public audit trail. Audit relies entirely on zero-knowledge verification keys and commitment consistency.
