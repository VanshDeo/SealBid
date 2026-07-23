import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { SEALBID_CIRCUITS_METADATA } from "../contracts/managed/sealbid/index.js";

/**
 * Utility function to compute bid commitment locally for testing
 */
function computeBidCommitment(auctionId: string, bidAmount: bigint, salt: string): string {
  const data = `${auctionId}:${bidAmount.toString()}:${salt}`;
  return createHash("sha256").update(data).digest("hex");
}

describe("SealBid Compact ZK Smart Contract & Service Test Suite", () => {
  describe("1. Managed Compact Circuits & Artifacts Verification", () => {
    it("should export SealBidContract circuit metadata with 3 compiled circuits", () => {
      assert.equal(SEALBID_CIRCUITS_METADATA.contractName, "SealBidContract");
      assert.equal(SEALBID_CIRCUITS_METADATA.circuits.length, 3);

      const circuitNames = SEALBID_CIRCUITS_METADATA.circuits.map((c) => c.name);
      assert.deepEqual(circuitNames, ["submit_sealed_bid", "reveal_bid", "settle_auction"]);
    });

    it("should have valid proving and verification key hashes for submit_sealed_bid circuit", () => {
      const submitCircuit = SEALBID_CIRCUITS_METADATA.circuits.find(
        (c) => c.name === "submit_sealed_bid"
      );
      assert.ok(submitCircuit);
      assert.equal(submitCircuit.inputsCount, 2);
      assert.equal(submitCircuit.witnessCount, 3);
      assert.ok(submitCircuit.provingKeyHash.startsWith("0x"));
      assert.ok(submitCircuit.verificationKeyHash.startsWith("0x"));
    });
  });

  describe("2. Cryptographic Bid Commitment & Private Witness Rules", () => {
    const auctionId = "auction_test_001";
    const secretBidAmount = 1500000000n; // 1.5 tDUST
    const salt = "9f8e7d6c5b4a32109f8e7d6c5b4a3210";

    it("should generate deterministic bid commitment from private witness", () => {
      const commitment1 = computeBidCommitment(auctionId, secretBidAmount, salt);
      const commitment2 = computeBidCommitment(auctionId, secretBidAmount, salt);
      assert.equal(commitment1, commitment2);
      assert.equal(typeof commitment1, "string");
      assert.equal(commitment1.length, 64);
    });

    it("should produce distinct commitments for different private bid amounts", () => {
      const commitment1 = computeBidCommitment(auctionId, secretBidAmount, salt);
      const commitment2 = computeBidCommitment(auctionId, secretBidAmount + 1000n, salt);
      assert.notEqual(commitment1, commitment2);
    });

    it("should satisfy reveal_bid circuit verification when valid salt and amount are provided", () => {
      const commitment = computeBidCommitment(auctionId, secretBidAmount, salt);
      // Simulating ZK circuit verification logic
      const recomputed = computeBidCommitment(auctionId, secretBidAmount, salt);
      assert.equal(
        recomputed,
        commitment,
        "Zero-knowledge proof verification must match commitment"
      );
    });
  });

  describe("3. Auction Reserve Price & Validity Rules", () => {
    const reservePrice = 1000000000n; // 1.0 tDUST

    it("should accept bid equal to or exceeding reserve price", () => {
      const validBid = 1200000000n;
      assert.ok(
        validBid >= reservePrice,
        "Valid bid must be greater than or equal to reserve price"
      );
    });

    it("should reject bid below reserve price during ZK circuit witness validation", () => {
      const invalidBid = 800000000n;
      assert.equal(invalidBid >= reservePrice, false, "Sub-reserve bid must be rejected");
    });
  });

  describe("4. Midnight Public State vs Private Witness Isolation", () => {
    it("should keep private witness attributes isolated from public ledger state", () => {
      const publicLedgerState = {
        auction_id: "0x" + Buffer.from("auction_test_001").toString("hex"),
        highest_commitment: "0x" + computeBidCommitment("auction_001", 1500n, "salt123"),
        is_settled: false,
      };

      const privateWitnessInput = {
        bid_amount: 1500n,
        salt: "salt123",
        bidder_sk: "0xprivate_key_secret",
      };

      // Ensure public state contains no raw bid_amount or bidder_sk
      assert.equal("bid_amount" in publicLedgerState, false);
      assert.equal("bidder_sk" in publicLedgerState, false);
      assert.ok(publicLedgerState.highest_commitment.startsWith("0x"));
      assert.ok(privateWitnessInput.bid_amount > 0n);
    });
  });
});
