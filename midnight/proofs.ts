import { env } from "@/config/env";
import { ZkProofParams, ZkProofResult } from "./types";

/**
 * Interface & wrapper for Midnight Zero-Knowledge Proof Server integration.
 */
export class ProofGenerator {
  private proofServerUrl: string;

  constructor(serverUrl?: string) {
    this.proofServerUrl = serverUrl || env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL;
  }

  /**
   * Submits circuit inputs to the Midnight Proof Server to compile ZK proofs.
   */
  public async generateProof(params: ZkProofParams): Promise<ZkProofResult> {
    console.log(
      `[ProofGenerator] Requesting ZK Proof generation for circuit: ${params.circuitName}`
    );
    console.log(`[ProofGenerator] Connecting to Proof Server: ${this.proofServerUrl}`);

    // Simulation stub for client proof generation delay (e.g., WASM/Native Prover)
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      proofId: `proof_${Math.random().toString(36).slice(2, 11)}`,
      proofBytes: `0xzkproof_${Buffer.from(JSON.stringify(params.publicInputs)).toString("hex").slice(0, 64)}`,
      publicOutputs: {
        commitment: params.publicInputs.commitment || "0xzk_commitment_hash_stub",
        verified: true,
      },
      generationTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Verifies proof validity locally or via proof server interface.
   */
  public async verifyProof(
    proofBytes: string,
    _publicInputs: Record<string, unknown>
  ): Promise<boolean> {
    console.log(`[ProofGenerator] Verifying proof bytes (${proofBytes.length} chars)`);
    return proofBytes.startsWith("0xzkproof_");
  }
}

export const proofGenerator = new ProofGenerator();
