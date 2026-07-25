"use server";

import {
  ProcurementRfp,
  EvaluationCriteria,
  EligibilityThresholds,
  ProcurementDeadlines,
  BiddingStage,
  ContractTerms,
} from "@/lib/types";
import { generateCompactEligibilityRules } from "@/lib/compact-rule-generator";
import { INITIAL_PROCUREMENTS } from "@/storage/procurement-storage";

export interface CreateProcurementInput {
  title: string;
  description: string;
  buyerAddress: string;
  sector: string;
  estimatedBudgetUsd: number;
  evaluationCriteria: EvaluationCriteria;
  eligibilityThresholds: EligibilityThresholds;
  deadlines: ProcurementDeadlines;
  biddingStage: BiddingStage;
  contractTerms: ContractTerms;
}

export interface CreateProcurementResponse {
  success: boolean;
  rfp?: ProcurementRfp;
  transactionHash?: string;
  error?: string;
}

// Memory cache store for server action state during session execution
let SERVER_RFP_STORE: ProcurementRfp[] = [...INITIAL_PROCUREMENTS];

/**
 * Server Action for creating a confidential procurement RFP with compiled Compact ZK eligibility rules.
 */
export async function createProcurementAction(
  input: CreateProcurementInput
): Promise<CreateProcurementResponse> {
  try {
    if (!input.title || !input.buyerAddress || input.estimatedBudgetUsd <= 0) {
      return {
        success: false,
        error: "Missing required procurement title, buyer address, or budget.",
      };
    }

    const rfpId = `rfp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Generate Compact ZK eligibility circuit rules & predicate commitment hash
    const compactRules = await generateCompactEligibilityRules(
      input.title,
      input.eligibilityThresholds.minTurnoverUsd,
      input.eligibilityThresholds.minExperienceYears,
      input.eligibilityThresholds.requiredCertifications
    );

    const rfp: ProcurementRfp = {
      id: rfpId,
      ...input,
      compactRules,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    // Simulate network delay for circuit compilation & transaction broadcast
    await new Promise((resolve) => setTimeout(resolve, 600));

    SERVER_RFP_STORE = [rfp, ...SERVER_RFP_STORE.filter((p) => p.id !== rfp.id)];

    const transactionHash = `0xtx_procurement_reg_${Math.random().toString(36).slice(2, 20)}`;

    return {
      success: true,
      rfp,
      transactionHash,
    };
  } catch (error) {
    console.error("[procurement-actions] Failed to create procurement RFP:", error);
    return {
      success: false,
      error: "Failed to compile Compact rules or broadcast procurement transaction.",
    };
  }
}

/**
 * Server Action for fetching active procurement RFPs.
 */
export async function getProcurementsAction(): Promise<ProcurementRfp[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return SERVER_RFP_STORE;
}

/**
 * Server Action for fetching procurement RFP by ID.
 */
export async function getProcurementByIdAction(id: string): Promise<ProcurementRfp | null> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return SERVER_RFP_STORE.find((p) => p.id === id) || null;
}
