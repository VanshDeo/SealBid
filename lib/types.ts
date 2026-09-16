import { AUCTION_STATUS, PROOF_STATUS } from "./constants";


export type AuctionStatus = keyof typeof AUCTION_STATUS;
export type ProofStatus = keyof typeof PROOF_STATUS;

export interface Auction {
  id: string;
  title: string;
  description: string;
  assetName: string;
  assetImageUrl?: string;
  sellerAddress: string;
  contractAddress: string;
  reservePrice: bigint;
  status: AuctionStatus;
  biddingEndTime: string; // ISO String
  revealEndTime: string; // ISO String
  totalSealedBids: number;
  highestBid?: bigint;
  winningBidder?: string;
  createdAt: string;
}

export interface SealedBid {
  id: string;
  auctionId: string;
  bidderAddress: string;
  commitmentHash: string; // ZK commitment hash stored on ledger
  encryptedAmount: string; // Encrypted bid amount stored in client storage
  salt: string;
  proofStatus: ProofStatus;
  submittedAt: string;
  revealed: boolean;
  revealedAmount?: bigint;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  coinPublicKey: string | null;
  balance: bigint;
  networkId: string;
  error: string | null;
}

export interface ProofGenerationState {
  status: ProofStatus;
  progress: number; // 0 to 100
  message: string;
  proofData: string | null;
  error: string | null;
}

// Decentralized Authentication & Role-Based Access Control Types

export type UserRole = "buyer" | "vendor" | "auditor";

/**
 * Minimum public user information stored on public state/ledger registry.
 */
export interface PublicUserProfile {
  walletAddress: string;
  role: UserRole;
  displayName: string;
  registeredAt: string;
  dataHash: string; // SHA-256 hash of private off-chain business info payload
}

/**
 * Private business details for Buyer role (encrypted off-chain)
 */
export interface BuyerBusinessInfo {
  companyName: string;
  taxId: string;
  contactEmail: string;
  country: string;
  annualProcurementBudget: string;
}

/**
 * Private business details for Vendor role (encrypted off-chain)
 */
export interface VendorBusinessInfo {
  businessName: string;
  registrationNumber: string;
  vatId: string;
  contactEmail: string;
  bankAccountIBAN: string;
  complianceCertificates: string[];
}

/**
 * Private business details for Auditor role (encrypted off-chain)
 */
export interface AuditorBusinessInfo {
  firmName: string;
  licenseNumber: string;
  accreditationBody: string;
  contactEmail: string;
  jurisdiction: string;
  rsaPublicKey: string;
}

export type PrivateBusinessInfo =
  | ({ role: "buyer" } & BuyerBusinessInfo)
  | ({ role: "vendor" } & VendorBusinessInfo)
  | ({ role: "auditor" } & AuditorBusinessInfo);

export interface AuthSession {
  isAuthenticated: boolean;
  isRegistered: boolean;
  walletAddress: string | null;
  role: UserRole | null;
  profile: PublicUserProfile | null;
  privateInfo: PrivateBusinessInfo | null;
  sessionToken: string | null;
  authenticatedAt: string | null;
}

export interface VendorCertification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  documentHash: string;
}

export interface PreviousProject {
  id: string;
  title: string;
  clientIndustry: string;
  contractValueUsd: number;
  completionYear: number;
  referenceHash: string;
}

export interface VendorProfile {
  companyName: string;
  registrationNumber: string;
  taxId: string;
  country: string;
  businessAddress: string;
  contactPerson: string;
  email: string;
  website: string;
  certifications: VendorCertification[];
  annualTurnoverUsd: number;
  fiscalYear: string;
  auditedReportHash: string;
  facilitiesCount: number;
  monthlyCapacity: string;
  equipmentDetails: string;
  yearsExperience: number;
  previousProjects: PreviousProject[];
}

export interface EncryptedVendorProfile {
  vendorId: string;
  walletAddress: string;
  ciphertext: string; // Encrypted raw VendorProfile json
  profileCommitment: string; // SHA-256 commitment hash stored on-chain
  turnoverHash: string;
  certificationsHash: string;
  isVerified: boolean;
  updatedAt: string;
}

export interface QualificationCheckRequest {
  vendorId: string;
  requiredTurnoverUsd: number;
  requiredExperienceYears: number;
}

export interface QualificationVerificationResult {
  vendorId: string;
  isQualified: boolean;
  proofStatus: ProofStatus;
  proofHash: string;
  timestamp: string;
  details: {
    turnoverSatisfied: boolean;
    experienceSatisfied: boolean;
  };
}

export interface EvaluationCriteria {
  technicalScoreWeight: number; // e.g. 40%
  financialPriceWeight: number; // e.g. 40%
  qualityScoreWeight: number; // e.g. 20%
  scoringMethod: string;
}

export interface EligibilityThresholds {
  minTurnoverUsd: number;
  minExperienceYears: number;
  minFacilitiesCount: number;
  requiredCertifications: string[];
}

export interface ProcurementDeadlines {
  qualificationDeadline: string; // ISO
  biddingDeadline: string; // ISO
  revealDeadline: string; // ISO
  awardDate: string; // ISO
}

export type BiddingStage =
  | "SINGLE_STAGE_SEALED"
  | "TWO_STAGE_QUALIFICATION"
  | "PROGRESSIVE_CONFIDENTIAL"
  | "DYNAMIC_AUCTION";

export type ProgressiveStage =
  | "STAGE_1_ELIGIBILITY"
  | "STAGE_2_TECHNICAL"
  | "STAGE_3_COMMERCIAL"
  | "STAGE_4_LEGAL_REVEAL"
  | "COMPLETED";

export interface ContractTerms {
  paymentTerms: string;
  deliveryTimelineDays: number;
  warrantyYears: number;
  penaltyClause: string;
}

export interface CompactEligibilityRules {
  compactSourceCode: string;
  circuitName: string;
  ruleCommitmentHash: string;
  predicateHash: string;
  publicInputs: string[];
  privateWitnesses: string[];
  procurementRulesCommitmentHash?: string;
  isRulesLocked?: boolean;
  lockedAt?: string;
}

export interface Stage1EligibilitySubmission {
  anonymousBidderId: string; // Pseudonym hash (vendor identity concealed)
  proofHash: string;
  isEligible: boolean;
  verifiedAt: string;
  details: {
    turnoverSatisfied: boolean;
    experienceSatisfied: boolean;
  };
  reusableCredentialId?: string;
  factProofHash?: string;
}

export interface Stage2TechnicalSubmission {
  submissionId: string;
  anonymousBidderId: string;
  technicalSpecs: string;
  methodology: string;
  deliveryTimelineDays: number;
  equipmentSummary: string;
  proposalHash: string;
  technicalScore?: number;
  status: "PENDING" | "PASSED" | "REJECTED";
  submittedAt: string;
  evaluatedAt?: string;
}

export interface Stage3CommercialSubmission {
  bidId: string;
  anonymousBidderId: string;
  bidCommitmentHash: string;
  encryptedBidPayload: string;
  bidAmountUsd: number;
  commercialScore?: number;
  isWinningBid?: boolean;
  submittedAt: string;
}

export interface Stage4LegalReveal {
  winningAnonymousBidderId: string;
  winningVendorWalletAddress: string;
  revealedLegalDoc: {
    companyName: string;
    registrationNumber: string;
    taxId: string;
    country: string;
    businessAddress: string;
    contactPerson: string;
    email: string;
    bankAccountIBAN: string;
    complianceCertificates: string[];
  };
  unlockedByBuyer: string;
  revealedAt: string;
}

export interface ConfidentialWinnerAuditTrail {
  procurementId: string;
  winningAnonymousBidderId: string;
  evaluationMethod: string;
  totalBidsEvaluated: number;
  proofHash: string;
  verificationKeyHash: string;
  ruleCommitmentHash: string;
  fairnessProofSignature: string;
  timestamp: string;
  losingBidsPrivacyProtected: boolean;
  losingBidCount: number;
}

export interface ProgressiveProcurementState {
  procurementId: string;
  currentStage: ProgressiveStage;
  stage1Eligibility: Stage1EligibilitySubmission[];
  stage2Technical: Stage2TechnicalSubmission[];
  stage3Commercial: Stage3CommercialSubmission[];
  stage4LegalReveal?: Stage4LegalReveal;
  winnerAuditTrail?: ConfidentialWinnerAuditTrail;
  winningAnonymousBidderId?: string;
  updatedAt: string;
}

export interface ProcurementRfp {
  id: string;
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
  compactRules: CompactEligibilityRules;
  status: "DRAFT" | "OPEN" | "QUALIFYING" | "EVALUATING" | "CLOSED";
  createdAt: string;
  progressiveState?: ProgressiveProcurementState;
  isRulesLocked?: boolean;
  rulesCommitmentHash?: string;
  lockedAt?: string;
}

export interface ConfidentialEligibilityCheckInput {
  procurementId: string;
  vendorId: string;
  requiredTurnoverUsd: number;
  requiredExperienceYears: number;
  requiredCertifications?: string[];
  // Private witness document inputs (never revealed to buyer)
  privateWitness: {
    actualTurnoverUsd: number;
    actualExperienceYears: number;
    auditedReportHash?: string;
    certificationsHash?: string;
    identitySalt?: string;
  };
}

export interface ConfidentialEligibilityProofPackage {
  procurementId: string;
  vendorId: string;
  // Binary pass/fail qualification output
  isQualified: boolean;
  // Proof validity metadata for buyer
  proofStatus: ProofStatus;
  proofHash: string;
  verificationKeyHash: string;
  predicateHash: string;
  circuitName: "verify_procurement_eligibility";
  // Zero-knowledge rule satisfaction breakdown (no document or raw financial data)
  criteriaBreakdown: {
    turnoverSatisfied: boolean;
    experienceSatisfied: boolean;
    certificationsSatisfied: boolean;
  };
  verifiedAt: string;
}

// Reusable Business Credentials: RAW DATA != PROOF OF FACT

export interface ReusableBusinessCredentialPassport {
  id: string;
  vendorId: string;
  walletAddress: string;
  companyName: string;
  credentialCommitmentHash: string;
  // Proof of Fact thresholds (no raw balance sheets)
  certifiedTurnoverTierUsd: number; // e.g. 10,000,000 (verifies turnover is >= this amount)
  certifiedExperienceYears: number; // e.g. 5
  certifiedAccreditations: Array<{
    name: string;
    issuer: string;
    validUntil: string;
    documentHash: string;
  }>;
  completedProjectsCount: number;
  complianceAttestationHash: string;
  issuedAt: string;
  expiresAt: string;
  attestationSignature: string;
}

export interface CredentialFactProof {
  passportId: string;
  vendorId: string;
  credentialCommitmentHash: string;
  predicateDescription: string;
  proofOfFactHash: string;
  turnoverSatisfied: boolean;
  experienceSatisfied: boolean;
  complianceSatisfied: boolean;
  generatedAt: string;
}

// Comprehensive 6-Point Auditor Verification Record

export interface ComprehensiveProcurementAuditRecord {
  procurementId: string;
  procurementTitle: string;
  buyerAddress: string;
  auditGeneratedAt: string;
  isFullyAudited: boolean;
  overallComplianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";

  // 1. Tender rules pre-commitment verification
  rulePreCommitmentVerification: {
    passed: boolean;
    rulesCommitmentHash: string;
    isLockedBeforeBidding: boolean;
    criteriaHash: string;
    thresholdsHash: string;
    deadlinesHash: string;
    details: string;
  };

  // 2. Eligibility ZK verification
  eligibilityVerification: {
    passed: boolean;
    totalApplicants: number;
    qualifiedCount: number;
    zeroKnowledgePreserved: boolean; // no raw turnover or identity exposed
    details: string;
  };

  // 3. Bid submission validity & uniqueness
  bidValidityVerification: {
    passed: boolean;
    sealedBidsCount: number;
    allCommitmentsUnique: boolean;
    noDuplicatePseudonyms: boolean;
    details: string;
  };

  // 4. Deadline enforcement
  deadlinesEnforcementVerification: {
    passed: boolean;
    allSubmissionsPrecededDeadlines: boolean;
    qualificationDeadline: string;
    biddingDeadline: string;
    details: string;
  };

  // 5. Winner selection compliance
  winnerSelectionVerification: {
    passed: boolean;
    awardedWinnerId: string;
    followedCommittedMethod: string;
    losingBidsConfidentialityProtected: boolean;
    fairnessProofHash: string;
    details: string;
  };

  // 6. Selective disclosure authorization
  selectiveDisclosureVerification: {
    passed: boolean;
    onlyWinningSupplierDisclosed: boolean;
    authorizedBuyerOnly: boolean;
    zeroLosingDocumentsRevealed: boolean;
    details: string;
  };
}



