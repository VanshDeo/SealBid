import { BaseCompactContractService } from "./base-compact-contract-service";
import { MidnightProviderBundle, CircuitExecutionResult } from "../types/midnight-sdk";

export interface VendorRegistryState {
  vendor_id: string;
  wallet_address: string;
  profile_commitment: string;
  min_turnover_hash: string;
  verified_cert_hash: string;
  is_verified: boolean;
  registration_timestamp: bigint;
}

export type VendorRegistryCircuits = {
  register_vendor: {
    publicInputs: {
      vendor_id: string;
      profile_commitment: string;
      min_turnover_hash: string;
      verified_cert_hash: string;
    };
    output: boolean;
  };
  verify_qualification: {
    publicInputs: {
      vendor_id: string;
      required_turnover: bigint;
      required_experience: bigint;
    };
    output: boolean;
  };
};

/**
 * Service wrapper for VendorRegistryContract Compact ZK Smart Contract.
 */
export class VendorContractService extends BaseCompactContractService<
  VendorRegistryState,
  VendorRegistryCircuits
> {
  constructor(providers: MidnightProviderBundle, contractAddress?: string) {
    super("VendorRegistryContract", providers, contractAddress);
  }

  /**
   * Registers vendor profile commitments on-chain while storing private witness off-chain.
   */
  public async registerVendor(
    vendorId: string,
    profileCommitment: string,
    minTurnoverHash: string,
    verifiedCertHash: string,
    privateWitnessData: {
      company_name_hash: string;
      turnover_amount: bigint;
      years_experience: bigint;
      certifications_salt: string;
    }
  ): Promise<CircuitExecutionResult<boolean>> {
    return await this.executeCircuit(
      "register_vendor",
      {
        vendor_id: vendorId,
        profile_commitment: profileCommitment,
        min_turnover_hash: minTurnoverHash,
        verified_cert_hash: verifiedCertHash,
      },
      {
        company_name_hash: privateWitnessData.company_name_hash,
        turnover_amount: privateWitnessData.turnover_amount.toString(),
        years_experience: privateWitnessData.years_experience.toString(),
        certifications_salt: privateWitnessData.certifications_salt,
      },
      true
    );
  }

  /**
   * Evaluates vendor qualification against RFQ requirements using zero-knowledge circuit.
   */
  public async verifyQualification(
    vendorId: string,
    requiredTurnoverUsd: bigint,
    requiredExperienceYears: bigint,
    privateWitnessData: {
      turnover_amount: bigint;
      years_experience: bigint;
      certifications_salt: string;
    }
  ): Promise<CircuitExecutionResult<boolean>> {
    return await this.executeCircuit(
      "verify_qualification",
      {
        vendor_id: vendorId,
        required_turnover: requiredTurnoverUsd,
        required_experience: requiredExperienceYears,
      },
      {
        turnover_amount: privateWitnessData.turnover_amount.toString(),
        years_experience: privateWitnessData.years_experience.toString(),
        certifications_salt: privateWitnessData.certifications_salt,
      },
      false
    );
  }

  /**
   * Retrieves public vendor state from Midnight ledger.
   */
  public async getVendorState(): Promise<VendorRegistryState | null> {
    return await this.getState();
  }
}
