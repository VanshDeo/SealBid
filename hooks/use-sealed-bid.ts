"use client";

import { useState } from "react";
import { submitSealedBidAction } from "@/actions/bid-actions";
import { PROOF_STATUS } from "@/lib/constants";
import { ProofGenerationState, SealedBid } from "@/lib/types";
import { generateCommitmentHash } from "@/lib/utils";
import { proofGenerator } from "@/midnight/proofs";
import { encryptedBidStorage } from "@/storage/encrypted-storage";
import { useMidnightWallet } from "./use-midnight-wallet";

export function useSealedBid() {
  const { address } = useMidnightWallet();
  const [provingState, setProvingState] = useState<ProofGenerationState>({
    status: PROOF_STATUS.IDLE,
    progress: 0,
    message: "Ready",
    proofData: null,
    error: null,
  });

  const submitBid = async (auctionId: string, bidAmount: bigint) => {
    if (!address) {
      setProvingState((prev) => ({ ...prev, error: "Please connect your Midnight wallet first." }));
      return { success: false };
    }

    try {
      // Step 1: Witness Generation
      setProvingState({
        status: PROOF_STATUS.GENERATING_WITNESS,
        progress: 25,
        message: "Generating private witness and salt...",
        proofData: null,
        error: null,
      });

      const salt = `0xsalt_${Math.random().toString(36).slice(2, 18)}`;
      const commitmentHash = generateCommitmentHash(bidAmount, salt);

      // Step 2: ZK Proving
      setProvingState({
        status: PROOF_STATUS.PROVING,
        progress: 60,
        message: "Compiling Zero-Knowledge proof via Midnight Prover...",
        proofData: null,
        error: null,
      });

      const zkProof = await proofGenerator.generateProof({
        circuitName: "submit_sealed_bid",
        publicInputs: { auctionId, commitment: commitmentHash },
        privateWitness: { bidAmount: bidAmount.toString(), salt },
      });

      // Step 3: Local Storage Encryption
      setProvingState({
        status: PROOF_STATUS.VERIFIED,
        progress: 85,
        message: "Encrypting bid parameters in client storage...",
        proofData: zkProof.proofBytes,
        error: null,
      });

      const bidRecord: SealedBid = {
        id: `bid_${Date.now()}`,
        auctionId,
        bidderAddress: address,
        commitmentHash,
        encryptedAmount: bidAmount.toString(),
        salt,
        proofStatus: PROOF_STATUS.VERIFIED,
        submittedAt: new Date().toISOString(),
        revealed: false,
      };

      await encryptedBidStorage.saveEncryptedBid(bidRecord);

      // Step 4: Relay Commitment to On-chain Ledger
      setProvingState({
        status: PROOF_STATUS.SUBMITTED,
        progress: 100,
        message: "Submitting commitment hash to Midnight transaction relay...",
        proofData: zkProof.proofBytes,
        error: null,
      });

      const response = await submitSealedBidAction({
        auctionId,
        bidderAddress: address,
        commitmentHash,
        encryptedAmount: bidRecord.encryptedAmount,
        proofData: zkProof.proofBytes,
      });

      return response;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit sealed bid";
      setProvingState({
        status: PROOF_STATUS.FAILED,
        progress: 0,
        message: "Error during ZK proof generation.",
        proofData: null,
        error: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  return {
    submitBid,
    provingState,
  };
}
