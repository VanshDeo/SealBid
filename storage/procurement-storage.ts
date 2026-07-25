import { STORAGE_KEYS } from "@/lib/constants";
import {
  ProcurementRfp,
  ProgressiveProcurementState,
  Stage1EligibilitySubmission,
  Stage2TechnicalSubmission,
  Stage3CommercialSubmission,
  Stage4LegalReveal,
} from "@/lib/types";

// Default initial mock procurements showcase
export const INITIAL_PROCUREMENTS: ProcurementRfp[] = [
  {
    id: "rfp_2026_001",
    title: "High-Precision Defense CNC Aerospace Components Supply",
    description:
      "Confidential procurement tender for manufacturing 5-axis CNC titanium actuators for next-gen aerospace defense systems.",
    buyerAddress: "mn_test1qqbuyer001x79093eamxvgspg8p3pwn5q963g6v",
    sector: "Aerospace & Defense",
    estimatedBudgetUsd: 15_000_000,
    evaluationCriteria: {
      technicalScoreWeight: 40,
      financialPriceWeight: 40,
      qualityScoreWeight: 20,
      scoringMethod: "Weighted Quality-Cost Ratio (MEAT)",
    },
    eligibilityThresholds: {
      minTurnoverUsd: 10_000_000,
      minExperienceYears: 5,
      minFacilitiesCount: 2,
      requiredCertifications: ["ISO 9001: Quality Management", "AS9100: Aerospace Quality"],
    },
    deadlines: {
      qualificationDeadline: new Date(Date.now() + 86400 * 5 * 1000).toISOString(),
      biddingDeadline: new Date(Date.now() + 86400 * 10 * 1000).toISOString(),
      revealDeadline: new Date(Date.now() + 86400 * 12 * 1000).toISOString(),
      awardDate: new Date(Date.now() + 86400 * 15 * 1000).toISOString(),
    },
    biddingStage: "PROGRESSIVE_CONFIDENTIAL",
    contractTerms: {
      paymentTerms: "30% Advance, 70% Net 30 Post-Delivery",
      deliveryTimelineDays: 90,
      warrantyYears: 3,
      penaltyClause: "0.5% Per Day Delay (Max 10% Contract Value)",
    },
    compactRules: {
      compactSourceCode: `// Generated Compact Rule
module ProcurementEligibilityCircuit { ... }`,
      circuitName: "verify_procurement_eligibility",
      ruleCommitmentHash: "0x7f3a9b1c2e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      predicateHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      publicInputs: ["procurement_id", "min_turnover_threshold_usd", "min_experience_threshold_years"],
      privateWitnesses: ["vendor_turnover_usd", "vendor_experience_years", "certifications_hash"],
    },
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rfp_2026_002",
    title: "Confidential Cleanroom Semiconductor Silicon Wafers",
    description:
      "Procurement of high-purity 300mm silicon wafer substrates with strict ISO Class 4 cleanroom packaging standards.",
    buyerAddress: "mn_test1qqbuyer002x79093eamxvgspg8p3pwn5q963g6v",
    sector: "Semiconductor Hardware",
    estimatedBudgetUsd: 8_500_000,
    evaluationCriteria: {
      technicalScoreWeight: 50,
      financialPriceWeight: 35,
      qualityScoreWeight: 15,
      scoringMethod: "Technical Supremacy Threshold",
    },
    eligibilityThresholds: {
      minTurnoverUsd: 5_000_000,
      minExperienceYears: 3,
      minFacilitiesCount: 1,
      requiredCertifications: ["ISO 9001: Quality Management", "ISO 14001: Environmental Management"],
    },
    deadlines: {
      qualificationDeadline: new Date(Date.now() + 86400 * 3 * 1000).toISOString(),
      biddingDeadline: new Date(Date.now() + 86400 * 7 * 1000).toISOString(),
      revealDeadline: new Date(Date.now() + 86400 * 8 * 1000).toISOString(),
      awardDate: new Date(Date.now() + 86400 * 10 * 1000).toISOString(),
    },
    biddingStage: "PROGRESSIVE_CONFIDENTIAL",
    contractTerms: {
      paymentTerms: "Net 60 Days",
      deliveryTimelineDays: 45,
      warrantyYears: 2,
      penaltyClause: "1% Per Week Delay",
    },
    compactRules: {
      compactSourceCode: `// Generated Compact Rule
module ProcurementEligibilityCircuit { ... }`,
      circuitName: "verify_procurement_eligibility",
      ruleCommitmentHash: "0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b",
      predicateHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
      publicInputs: ["procurement_id", "min_turnover_threshold_usd", "min_experience_threshold_years"],
      privateWitnesses: ["vendor_turnover_usd", "vendor_experience_years", "certifications_hash"],
    },
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
];

const IN_MEMORY_PROGRESSIVE_STORE: Record<string, ProgressiveProcurementState> = {};

export class ProcurementStorage {
  /**
   * Saves a new procurement RFP.
   */
  public static async saveProcurement(rfp: ProcurementRfp): Promise<boolean> {
    try {
      if (typeof window !== "undefined") {
        const existing = this.getProcurements();
        const updated = [rfp, ...existing.filter((p) => p.id !== rfp.id)];
        localStorage.setItem(STORAGE_KEYS.PROCUREMENT_RFPS, JSON.stringify(updated));
      }
      return true;
    } catch (err) {
      console.error("[ProcurementStorage] Error saving RFP:", err);
      return false;
    }
  }

  /**
   * Retrieves all procurements (local storage + initial fallback).
   */
  public static getProcurements(): ProcurementRfp[] {
    if (typeof window === "undefined") return INITIAL_PROCUREMENTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROCUREMENT_RFPS);
      if (!raw) return INITIAL_PROCUREMENTS;
      const parsed = JSON.parse(raw) as ProcurementRfp[];
      return parsed.length > 0 ? parsed : INITIAL_PROCUREMENTS;
    } catch {
      return INITIAL_PROCUREMENTS;
    }
  }

  /**
   * Fetches procurement by ID.
   */
  public static getProcurementById(id: string): ProcurementRfp | null {
    const list = this.getProcurements();
    return list.find((p) => p.id === id) || null;
  }

  /**
   * Retrieves progressive procurement stage state for a given procurement ID.
   */
  public static getProgressiveState(procurementId: string): ProgressiveProcurementState {
    const defaultState: ProgressiveProcurementState = {
      procurementId,
      currentStage: "STAGE_1_ELIGIBILITY",
      stage1Eligibility: [],
      stage2Technical: [],
      stage3Commercial: [],
      updatedAt: new Date().toISOString(),
    };

    if (typeof window === "undefined") {
      return IN_MEMORY_PROGRESSIVE_STORE[procurementId] || defaultState;
    }

    try {
      const key = `sealbid_prog_state_${procurementId}`;
      const raw = localStorage.getItem(key);
      if (!raw) {
        return IN_MEMORY_PROGRESSIVE_STORE[procurementId] || defaultState;
      }
      return JSON.parse(raw) as ProgressiveProcurementState;
    } catch {
      return IN_MEMORY_PROGRESSIVE_STORE[procurementId] || defaultState;
    }
  }

  /**
   * Saves or updates progressive procurement state.
   */
  public static saveProgressiveState(state: ProgressiveProcurementState): boolean {
    IN_MEMORY_PROGRESSIVE_STORE[state.procurementId] = state;
    if (typeof window !== "undefined") {
      try {
        const key = `sealbid_prog_state_${state.procurementId}`;
        localStorage.setItem(key, JSON.stringify(state));
      } catch (err) {
        console.error("[ProcurementStorage] Failed to persist progressive state:", err);
        return false;
      }
    }
    return true;
  }

  /**
   * Adds or updates Stage 1 Eligibility Verification.
   */
  public static addStage1Submission(
    procurementId: string,
    submission: Stage1EligibilitySubmission
  ): ProgressiveProcurementState {
    const state = this.getProgressiveState(procurementId);
    const existingFiltered = state.stage1Eligibility.filter(
      (s) => s.anonymousBidderId !== submission.anonymousBidderId
    );
    const updatedState: ProgressiveProcurementState = {
      ...state,
      stage1Eligibility: [submission, ...existingFiltered],
      updatedAt: new Date().toISOString(),
    };
    this.saveProgressiveState(updatedState);
    return updatedState;
  }

  /**
   * Adds or updates Stage 2 Technical Proposal.
   */
  public static addStage2Submission(
    procurementId: string,
    submission: Stage2TechnicalSubmission
  ): ProgressiveProcurementState {
    const state = this.getProgressiveState(procurementId);
    const existingFiltered = state.stage2Technical.filter(
      (s) => s.anonymousBidderId !== submission.anonymousBidderId
    );
    const updatedState: ProgressiveProcurementState = {
      ...state,
      currentStage: "STAGE_2_TECHNICAL",
      stage2Technical: [submission, ...existingFiltered],
      updatedAt: new Date().toISOString(),
    };
    this.saveProgressiveState(updatedState);
    return updatedState;
  }

  /**
   * Evaluates Stage 2 Technical Proposal (Passed / Rejected).
   */
  public static updateStage2TechnicalStatus(
    procurementId: string,
    anonymousBidderId: string,
    status: "PASSED" | "REJECTED",
    technicalScore?: number
  ): ProgressiveProcurementState {
    const state = this.getProgressiveState(procurementId);
    const updatedList = state.stage2Technical.map((item) => {
      if (item.anonymousBidderId === anonymousBidderId) {
        return {
          ...item,
          status,
          technicalScore: technicalScore ?? item.technicalScore,
          evaluatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const anyPassed = updatedList.some((i) => i.status === "PASSED");
    const updatedState: ProgressiveProcurementState = {
      ...state,
      stage2Technical: updatedList,
      currentStage: anyPassed ? "STAGE_3_COMMERCIAL" : state.currentStage,
      updatedAt: new Date().toISOString(),
    };
    this.saveProgressiveState(updatedState);
    return updatedState;
  }

  /**
   * Adds Stage 3 Commercial Sealed Bid.
   */
  public static addStage3Submission(
    procurementId: string,
    submission: Stage3CommercialSubmission
  ): ProgressiveProcurementState {
    const state = this.getProgressiveState(procurementId);
    const existingFiltered = state.stage3Commercial.filter(
      (s) => s.anonymousBidderId !== submission.anonymousBidderId
    );
    const updatedState: ProgressiveProcurementState = {
      ...state,
      currentStage: "STAGE_3_COMMERCIAL",
      stage3Commercial: [submission, ...existingFiltered],
      updatedAt: new Date().toISOString(),
    };
    this.saveProgressiveState(updatedState);
    return updatedState;
  }

  /**
   * Evaluates Stage 3 and selects winning bidder.
   */
  public static awardStage3Winner(
    procurementId: string,
    winningAnonymousBidderId: string
  ): ProgressiveProcurementState {
    const state = this.getProgressiveState(procurementId);
    const updatedCommercial = state.stage3Commercial.map((item) => ({
      ...item,
      isWinningBid: item.anonymousBidderId === winningAnonymousBidderId,
    }));

    const updatedState: ProgressiveProcurementState = {
      ...state,
      stage3Commercial: updatedCommercial,
      winningAnonymousBidderId,
      currentStage: "STAGE_4_LEGAL_REVEAL",
      updatedAt: new Date().toISOString(),
    };
    this.saveProgressiveState(updatedState);
    return updatedState;
  }

  /**
   * Saves Stage 4 Selective Legal Reveal (ONLY for winning bidder).
   */
  public static saveStage4LegalReveal(
    procurementId: string,
    legalReveal: Stage4LegalReveal
  ): ProgressiveProcurementState {
    const state = this.getProgressiveState(procurementId);
    const updatedState: ProgressiveProcurementState = {
      ...state,
      stage4LegalReveal: legalReveal,
      currentStage: "COMPLETED",
      updatedAt: new Date().toISOString(),
    };
    this.saveProgressiveState(updatedState);
    return updatedState;
  }
}

