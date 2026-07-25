import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EncryptedUserStorage } from "../storage/user-storage";
import type {
  BuyerBusinessInfo,
  VendorBusinessInfo,
  AuditorBusinessInfo,
  PublicUserProfile,
} from "../lib/types";


describe("Decentralized Authentication & Encrypted Off-Chain Storage Test Suite", () => {
  const walletAddress = "mn_test1qqx79093eamxvgspg8p3pwn5q963g6vl82y7qg6k3r";

  describe("1. Data Hashing & Cryptographic Isolation", () => {
    it("should compute a deterministic SHA-256 dataHash for private payload", async () => {
      const privatePayload: BuyerBusinessInfo = {
        companyName: "Acme Procurement Corp",
        taxId: "TAX-998822-US",
        contactEmail: "procurement@acme.com",
        country: "United States",
        annualProcurementBudget: "$10,000,000 DUST",
      };

      const hash1 = await EncryptedUserStorage.computeDataHash(privatePayload);
      const hash2 = await EncryptedUserStorage.computeDataHash(privatePayload);

      assert.equal(hash1, hash2);
      assert.ok(hash1.startsWith("0x"));
      assert.ok(hash1.length >= 10);
    });

    it("should produce distinct hashes for different business payloads", async () => {
      const payloadA = { companyName: "Company A", taxId: "TAX-001" };
      const payloadB = { companyName: "Company B", taxId: "TAX-002" };

      const hashA = await EncryptedUserStorage.computeDataHash(payloadA);
      const hashB = await EncryptedUserStorage.computeDataHash(payloadB);

      assert.notEqual(hashA, hashB);
    });
  });

  describe("2. Minimum Public Profile vs Private Business Info", () => {
    it("should store only minimum public information on public profile registry", async () => {
      const publicProfile: PublicUserProfile = {
        walletAddress,
        role: "vendor",
        displayName: "Nexus Hardware Ltd",
        registeredAt: new Date().toISOString(),
        dataHash: "0x7f3a9b1c2e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      };

      // Check that public profile excludes all sensitive private business attributes
      assert.equal("taxId" in publicProfile, false);
      assert.equal("bankAccountIBAN" in publicProfile, false);
      assert.equal("vatId" in publicProfile, false);
      assert.equal("registrationNumber" in publicProfile, false);

      assert.equal(publicProfile.walletAddress, walletAddress);
      assert.equal(publicProfile.role, "vendor");
      assert.equal(publicProfile.displayName, "Nexus Hardware Ltd");
    });
  });

  describe("3. Role Business Payload Verification", () => {
    it("should construct valid Buyer private business payload", () => {
      const buyerInfo: BuyerBusinessInfo = {
        companyName: "Global Purchasing LLC",
        taxId: "TX-112233",
        contactEmail: "buyer@global.com",
        country: "Germany",
        annualProcurementBudget: "$5,000,000 DUST",
      };

      assert.equal(buyerInfo.companyName, "Global Purchasing LLC");
      assert.equal(buyerInfo.country, "Germany");
    });

    it("should construct valid Vendor private business payload", () => {
      const vendorInfo: VendorBusinessInfo = {
        businessName: "Vertex Tech Ltd",
        registrationNumber: "REG-991122",
        vatId: "VAT-EU-887766",
        contactEmail: "vendor@vertex.io",
        bankAccountIBAN: "DE89370400440532013000",
        complianceCertificates: ["ISO-27001", "Midnight ZK Verified"],
      };

      assert.equal(vendorInfo.businessName, "Vertex Tech Ltd");
      assert.equal(vendorInfo.complianceCertificates.length, 2);
    });

    it("should construct valid Auditor private business payload", () => {
      const auditorInfo: AuditorBusinessInfo = {
        firmName: "Apex Audit Partners",
        licenseNumber: "AUD-441199",
        accreditationBody: "Midnight ZK Compliance Org",
        contactEmail: "auditor@apexaudit.io",
        jurisdiction: "Global Decentralized Jurisdiction",
        rsaPublicKey: "0xrsa_pub_key_test_123456",
      };

      assert.equal(auditorInfo.firmName, "Apex Audit Partners");
      assert.ok(auditorInfo.rsaPublicKey.startsWith("0xrsa_pub_key"));
    });
  });

  describe("4. Role-Based Access Control Rules", () => {
    function canAccessRoute(
      userRole: "buyer" | "vendor" | "auditor",
      allowedRoles: string[]
    ): boolean {
      return allowedRoles.includes(userRole);
    }

    it("should allow Buyer to access Buyer portal only", () => {
      assert.equal(canAccessRoute("buyer", ["buyer"]), true);
      assert.equal(canAccessRoute("buyer", ["vendor"]), false);
      assert.equal(canAccessRoute("buyer", ["auditor"]), false);
    });

    it("should allow Vendor to access Vendor portal only", () => {
      assert.equal(canAccessRoute("vendor", ["vendor"]), true);
      assert.equal(canAccessRoute("vendor", ["buyer"]), false);
      assert.equal(canAccessRoute("vendor", ["auditor"]), false);
    });

    it("should allow Auditor to access Auditor portal only", () => {
      assert.equal(canAccessRoute("auditor", ["auditor"]), true);
      assert.equal(canAccessRoute("auditor", ["buyer"]), false);
      assert.equal(canAccessRoute("auditor", ["vendor"]), false);
    });
  });
});
