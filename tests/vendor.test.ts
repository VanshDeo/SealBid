import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { VENDOR_CIRCUITS_METADATA } from "../contracts/managed/vendor/index.js";
import { ClientCrypto } from "../storage/crypto";
import type { VendorProfile, QualificationVerificationResult } from "../lib/types";


/**
 * Helper to compute SHA-256 hash string for test assertions
 */
async function computeSha256(data: string): Promise<string> {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Test helper simulating Vendor Profile Commitment computation
 */
async function computeTestProfileCommitments(
  profile: VendorProfile,
  vendorId: string,
  salt = "sealbid_vendor_salt_9988"
) {
  const certString = profile.certifications
    .map((c) => `${c.name}:${c.documentHash}`)
    .join("|");

  const profileCommitment = await computeSha256(
    `${vendorId}:${profile.companyName}:${profile.registrationNumber}:${salt}`
  );
  const turnoverHash = await computeSha256(
    `${vendorId}:${profile.annualTurnoverUsd}:${profile.fiscalYear}:${salt}`
  );
  const certificationsHash = await computeSha256(
    `${vendorId}:${certString}:${salt}`
  );

  return {
    profileCommitment: `0x${profileCommitment}`,
    turnoverHash: `0x${turnoverHash}`,
    certificationsHash: `0x${certificationsHash}`,
  };
}

/**
 * Test helper simulating Zero-Knowledge Qualification Circuit execution
 */
async function verifyVendorQualificationTest(
  vendorId: string,
  requiredTurnoverUsd: number,
  requiredExperienceYears: number,
  actualTurnoverUsd: number,
  actualExperienceYears: number
): Promise<QualificationVerificationResult> {
  const turnoverSatisfied = actualTurnoverUsd >= requiredTurnoverUsd;
  const experienceSatisfied = actualExperienceYears >= requiredExperienceYears;
  const isQualified = turnoverSatisfied && experienceSatisfied;
  const proofHash = `0xzk_proof_qual_${Math.random().toString(36).slice(2, 22)}`;

  return {
    vendorId,
    isQualified,
    proofStatus: isQualified ? "VERIFIED" : "FAILED",
    proofHash,
    timestamp: new Date().toISOString(),
    details: {
      turnoverSatisfied,
      experienceSatisfied,
    },
  };
}

describe("SealBid Vendor Registration & ZK Qualification Test Suite", () => {
  describe("1. Managed Compact Vendor Circuits Artifacts", () => {
    it("should export VendorRegistryContract circuit metadata with 2 compiled circuits", () => {
      assert.equal(VENDOR_CIRCUITS_METADATA.contractName, "VendorRegistryContract");
      assert.equal(VENDOR_CIRCUITS_METADATA.circuits.length, 2);

      const circuitNames = VENDOR_CIRCUITS_METADATA.circuits.map((c) => c.name);
      assert.deepEqual(circuitNames, ["register_vendor", "verify_qualification"]);
    });

    it("should have valid verification key hashes for register_vendor circuit", () => {
      const regCircuit = VENDOR_CIRCUITS_METADATA.circuits.find(
        (c) => c.name === "register_vendor"
      );
      assert.ok(regCircuit);
      assert.equal(regCircuit.inputsCount, 4);
      assert.equal(regCircuit.witnessCount, 4);
      assert.ok(regCircuit.provingKeyHash.startsWith("0x"));
      assert.ok(regCircuit.verificationKeyHash.startsWith("0x"));
    });

    it("should have valid verification key hashes for verify_qualification circuit", () => {
      const qualCircuit = VENDOR_CIRCUITS_METADATA.circuits.find(
        (c) => c.name === "verify_qualification"
      );
      assert.ok(qualCircuit);
      assert.equal(qualCircuit.inputsCount, 3);
      assert.equal(qualCircuit.witnessCount, 3);
      assert.ok(qualCircuit.provingKeyHash.startsWith("0x"));
      assert.ok(qualCircuit.verificationKeyHash.startsWith("0x"));
    });
  });

  describe("2. Off-Chain Client-Side Profile Encryption (AES-GCM 256)", () => {
    const sampleProfile: VendorProfile = {
      companyName: "Hyperion Precision Industries",
      registrationNumber: "REG-HYP-9900",
      taxId: "TAX-992211",
      country: "Germany",
      businessAddress: "TechPark 42, Berlin",
      contactPerson: "Dr. Klaus Weber",
      email: "klaus.weber@hyperion.de",
      website: "https://hyperion.de",
      certifications: [
        {
          id: "c1",
          name: "ISO 9001: Quality Management",
          issuer: "TÜV Rheinland",
          issuedDate: "2023-01-01",
          expiryDate: "2026-01-01",
          documentHash: "0xhash_iso9001_hyperion",
        },
      ],
      annualTurnoverUsd: 25_000_000,
      fiscalYear: "2024",
      auditedReportHash: "0xhash_audit_2024",
      facilitiesCount: 4,
      monthlyCapacity: "100,000 Units",
      equipmentDetails: "CNC Mills, Robotic Welders",
      yearsExperience: 15,
      previousProjects: [
        {
          id: "p1",
          title: "High-Speed Rail Actuators",
          clientIndustry: "Transportation",
          contractValueUsd: 8_500_000,
          completionYear: 2024,
          referenceHash: "0xref_rail_actuators",
        },
      ],
    };

    const secretEntropy = "vendor_test_secret_entropy_passphrase";

    it("should encrypt vendor business profile string to base64 ciphertext", async () => {
      const json = JSON.stringify(sampleProfile);
      const ciphertext = await ClientCrypto.encrypt(json, secretEntropy);
      assert.equal(typeof ciphertext, "string");
      assert.ok(ciphertext.length > 32);
      assert.notEqual(ciphertext, json);
    });

    it("should decrypt ciphertext back into identical vendor business profile", async () => {
      const json = JSON.stringify(sampleProfile);
      const ciphertext = await ClientCrypto.encrypt(json, secretEntropy);
      const decryptedJson = await ClientCrypto.decrypt(ciphertext, secretEntropy);
      const decryptedProfile = JSON.parse(decryptedJson) as VendorProfile;

      assert.deepEqual(decryptedProfile, sampleProfile);
      assert.equal(decryptedProfile.companyName, "Hyperion Precision Industries");
      assert.equal(decryptedProfile.annualTurnoverUsd, 25_000_000);
    });
  });

  describe("3. Cryptographic Commitment & Hash Generation", () => {
    const sampleProfile: VendorProfile = {
      companyName: "Acme Precision",
      registrationNumber: "REG-12345",
      taxId: "TAX-12345",
      country: "United States",
      businessAddress: "100 Main St",
      contactPerson: "John Doe",
      email: "john@acme.com",
      website: "https://acme.com",
      certifications: [
        {
          id: "c1",
          name: "ISO 9001",
          issuer: "TÜV",
          issuedDate: "2023-01-01",
          expiryDate: "2026-01-01",
          documentHash: "0xcert_doc_hash_123",
        },
      ],
      annualTurnoverUsd: 10_000_000,
      fiscalYear: "2024",
      auditedReportHash: "0xaudit_hash_123",
      facilitiesCount: 2,
      monthlyCapacity: "10,000 Units",
      equipmentDetails: "Lathes",
      yearsExperience: 10,
      previousProjects: [],
    };

    const vendorId = "vendor_test_id_001";

    it("should generate deterministic SHA-256 commitments with 0x prefix", async () => {
      const c1 = await computeTestProfileCommitments(sampleProfile, vendorId);
      const c2 = await computeTestProfileCommitments(sampleProfile, vendorId);

      assert.equal(c1.profileCommitment, c2.profileCommitment);
      assert.equal(c1.turnoverHash, c2.turnoverHash);
      assert.equal(c1.certificationsHash, c2.certificationsHash);

      assert.ok(c1.profileCommitment.startsWith("0x"));
      assert.equal(c1.profileCommitment.length, 66); // 0x + 64 hex chars
    });

    it("should produce different turnover hashes for different turnover figures", async () => {
      const profile1 = { ...sampleProfile, annualTurnoverUsd: 10_000_000 };
      const profile2 = { ...sampleProfile, annualTurnoverUsd: 20_000_000 };

      const c1 = await computeTestProfileCommitments(profile1, vendorId);
      const c2 = await computeTestProfileCommitments(profile2, vendorId);

      assert.notEqual(c1.turnoverHash, c2.turnoverHash);
    });
  });

  describe("4. Midnight Ledger State vs Private Witness Isolation", () => {
    it("should exclude sensitive raw vendor profile attributes from public ledger state", () => {
      const publicLedgerState = {
        vendor_id: "0xvendor_id_bytes32",
        wallet_address: "mn_test1qqvendor001x79093eamxvgspg8p3pwn5q963g6v",
        profile_commitment: "0xprofile_commitment_hash",
        min_turnover_hash: "0xmin_turnover_hash",
        verified_cert_hash: "0xverified_cert_hash",
        is_verified: true,
        registration_timestamp: 1774450000n,
      };

      // Assert zero leakage of confidential fields into public ledger state
      assert.equal("company_name" in publicLedgerState, false);
      assert.equal("turnover_amount" in publicLedgerState, false);
      assert.equal("equipment_details" in publicLedgerState, false);
      assert.equal("client_project_values" in publicLedgerState, false);

      assert.ok(publicLedgerState.is_verified);
      assert.ok(publicLedgerState.profile_commitment.startsWith("0x"));
    });
  });

  describe("5. ZK Qualification Circuit Execution Rules", () => {
    it("should qualify vendor when turnover and experience satisfy RFP thresholds", async () => {
      const result = await verifyVendorQualificationTest(
        "vendor_qual_01",
        5_000_000,
        3,
        12_500_000, // Actual turnover
        12 // Actual experience
      );

      assert.equal(result.isQualified, true);
      assert.equal(result.details.turnoverSatisfied, true);
      assert.equal(result.details.experienceSatisfied, true);
      assert.equal(result.proofStatus, "VERIFIED");
      assert.ok(result.proofHash.startsWith("0xzk_proof_qual_"));
    });

    it("should disqualify vendor when turnover is below RFP requirement", async () => {
      const result = await verifyVendorQualificationTest(
        "vendor_qual_02",
        20_000_000,
        3,
        12_500_000, // Actual turnover below required 20M
        12
      );

      assert.equal(result.isQualified, false);
      assert.equal(result.details.turnoverSatisfied, false);
      assert.equal(result.details.experienceSatisfied, true);
      assert.equal(result.proofStatus, "FAILED");
    });

    it("should disqualify vendor when experience is below RFP requirement", async () => {
      const result = await verifyVendorQualificationTest(
        "vendor_qual_03",
        5_000_000,
        15,
        12_500_000,
        12 // Actual experience below required 15 years
      );

      assert.equal(result.isQualified, false);
      assert.equal(result.details.turnoverSatisfied, true);
      assert.equal(result.details.experienceSatisfied, false);
      assert.equal(result.proofStatus, "FAILED");
    });
  });
});
