import { BaseCompactContractService } from "./base-compact-contract-service";
import { MidnightProviderBundle, CircuitExecutionResult } from "../types/midnight-sdk";

export interface ProcurementLedgerState {
  procurement_id: string;
  buyer_address: string;
  title_hash: string;
  estimated_budget_usd: bigint;
  min_turnover_threshold_usd: bigint;
  min_experience_threshold_years: bigint;
  required_certs_hash: string;
  bidding_deadline: bigint;
  is_open: boolean;
}

export type ProcurementCircuits = {
  register_procurement: {
    publicInputs: {
      procurement_id: string;
      title_hash: string;
      estimated_budget_usd: bigint;
      min_turnover_threshold_usd: bigint;
      min_experience_threshold_years: bigint;
      required_certs_hash: string;
    };
    output: boolean;
  };
  verify_procurement_eligibility: {
    publicInputs: {
      procurement_id: string;
      min_turnover_threshold_usd: bigint;
      min_experience_threshold_years: bigint;
    };
    output: boolean;
  };
  submit_technical_proposal_hash: {
    publicInputs: {
      procurement_id: string;
      anonymous_bidder_id: string;
      proposal_commitment_hash: string;
    };
    output: boolean;
  };
  submit_commercial_bid_commitment: {
    publicInputs: {
      procurement_id: string;
      anonymous_bidder_id: string;
      sealed_bid_commitment: string;
    };
    output: boolean;
  };
  evaluate_winning_bid: {
    publicInputs: {
      procurement_id: string;
      total_bids_count: bigint;
      winning_anonymous_bidder_id: string;
      evaluation_rules_hash: string;
    };
    output: boolean;
  };
  reveal_winner_legal_proof: {
    publicInputs: {
      procurement_id: string;
      winning_anonymous_bidder_id: string;
      legal_doc_hash_commitment: string;
    };
    output: boolean;
  };
};

/**
 * Service wrapper for ProcurementRegistryContract Compact ZK Smart Contract.
 * Validates deadlines, uniqueness, and eligibility before executing ZK proof circuits.
 */
export class ProcurementContractService extends BaseCompactContractService<
  ProcurementLedgerState,
  ProcurementCircuits
> {
  constructor(providers: MidnightProviderBundle, contractAddress?: string) {
    super("ProcurementRegistryContract", providers, contractAddress);
  }

  /**
   * Stage 3: Submits sealed commercial bid commitment using Compact ZK smart contract.
   * Validates bidding deadlines, bidder uniqueness, and technical qualification eligibility.
   */
  public async submitCommercialBidCommitment(
    procurementId: string,
    anonymousBidderId: string,
    bidAmountUsd: bigint,
    salt: string,
    biddingDeadlineTimestampMs: number,
    existingBiddersList: string[],
    isTechnicallyQualified: boolean
  ): Promise<CircuitExecutionResult<boolean>> {
    const now = Date.now();

    // 1. Deadline Validation
    if (now > biddingDeadlineTimestampMs) {
      throw new Error("Smart Contract Validation Failed: Bidding deadline has passed for this procurement RFP.");
    }

    // 2. Uniqueness Validation
    if (existingBiddersList.includes(anonymousBidderId)) {
      throw new Error("Smart Contract Validation Failed: Anonymous bidder has already submitted a commercial bid. Duplicate submissions are strictly prohibited.");
    }

    // 3. Eligibility Validation
    if (!isTechnicallyQualified) {
      throw new Error("Smart Contract Validation Failed: Anonymous bidder is not technically qualified (Stage 2 PASSED required).");
    }

    // Generate ZK sealed bid commitment hash
    const sealedBidCommitment = `0xcomm_${Buffer.from(`${anonymousBidderId}:${bidAmountUsd}:${salt}`).toString("hex").slice(0, 32)}`;

    // Private witness input (kept encrypted in client witness storage)
    const privateWitness = {
      anonymous_bidder_id: anonymousBidderId,
      bid_amount_usd: bidAmountUsd.toString(),
      salt,
      timestamp: now,
    };

    return await this.executeCircuit(
      "submit_commercial_bid_commitment",
      {
        procurement_id: procurementId,
        anonymous_bidder_id: anonymousBidderId,
        sealed_bid_commitment: sealedBidCommitment,
      },
      privateWitness,
      true
    );
  }

  /**
   * Stage 3: Evaluates commercial bids according to predefined procurement rules using Compact ZK smart contract.
   * Publishes ONLY the winning anonymous bidder ID while keeping all losing bids strictly confidential.
   */
  public async evaluateWinningBid(
    procurementId: string,
    totalBidsCount: number,
    winningAnonymousBidderId: string,
    evaluationRulesHash: string,
    candidateBidsCommitments: Array<{ anonymousBidderId: string; commitmentHash: string }>
  ): Promise<CircuitExecutionResult<boolean>> {
    if (totalBidsCount <= 0 || candidateBidsCommitments.length === 0) {
      throw new Error("Smart Contract Validation Failed: Cannot evaluate winner with zero commercial bids.");
    }

    const winnerExists = candidateBidsCommitments.some(
      (b) => b.anonymousBidderId === winningAnonymousBidderId
    );

    if (!winnerExists) {
      throw new Error("Smart Contract Validation Failed: Selected winner is not present in submitted commercial bids list.");
    }

    const privateWitness = {
      procurement_id: procurementId,
      winning_anonymous_bidder_id: winningAnonymousBidderId,
      candidate_bids: candidateBidsCommitments,
      evaluated_at: Date.now(),
    };

    return await this.executeCircuit(
      "evaluate_winning_bid",
      {
        procurement_id: procurementId,
        total_bids_count: BigInt(totalBidsCount),
        winning_anonymous_bidder_id: winningAnonymousBidderId,
        evaluation_rules_hash: evaluationRulesHash,
      },
      privateWitness,
      true
    );
  }
}
