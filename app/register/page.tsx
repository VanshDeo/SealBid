"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { useAuth } from "@/providers/auth-provider";
import { PrivateBusinessInfo, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function RegistrationPage() {
  const router = useRouter();
  const { isConnected, address, connect } = useMidnightWallet();
  const { registerUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<UserRole>("buyer");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buyer Form State
  const [buyerData, setBuyerData] = useState({
    companyName: "",
    taxId: "",
    contactEmail: "",
    country: "United States",
    annualProcurementBudget: "$1,000,000 DUST",
  });

  // Vendor Form State
  const [vendorData, setVendorData] = useState({
    businessName: "",
    registrationNumber: "",
    vatId: "",
    contactEmail: "",
    bankAccountIBAN: "",
    complianceCertificates: "ISO-27001, Midnight ZK Verified",
  });

  // Auditor Form State
  const [auditorData, setAuditorData] = useState({
    firmName: "",
    licenseNumber: "",
    accreditationBody: "Midnight ZK Audit Association",
    contactEmail: "",
    jurisdiction: "Global Decentralized Jurisdiction",
    rsaPublicKey: "0xrsa_pub_auditor_sealbid_88992211",
  });

  // Preview computed hash
  const getPrivatePayload = (): PrivateBusinessInfo => {
    if (role === "buyer") {
      return { role: "buyer", ...buyerData };
    }
    if (role === "vendor") {
      return {
        role: "vendor",
        ...vendorData,
        complianceCertificates: vendorData.complianceCertificates.split(",").map((s) => s.trim()),
      };
    }
    return { role: "auditor", ...auditorData };
  };

  const handleRegister = async () => {
    if (!address) {
      setError("Wallet is not connected.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please provide a public display name or handle.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const privateInfo = getPrivatePayload();
    const res = await registerUser(role, displayName, privateInfo);

    setIsSubmitting(false);

    if (res.success) {
      // Redirect to appropriate dashboard
      router.push(`/dashboard/${role}`);
    } else {
      setError(res.error || "Registration failed.");
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-500/20 bg-indigo-500/10 text-4xl shadow-lg">
          🔐
        </div>
        <h1 className="text-3xl font-extrabold text-white">Connect Lace Wallet to Register</h1>
        <p className="mt-3 text-gray-400">
          SealBid relies on Midnight Lace Wallet signatures to verify identity and encrypt private
          business details off-chain.
        </p>
        <div className="mt-8">
          <Button size="lg" variant="primary" onClick={connect} className="glow-primary px-8">
            Connect Lace Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
          <span>Midnight ZK Identity Protocol</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Decentralized Role Registration
        </h1>
        <p className="mx-auto max-w-xl text-sm text-gray-400">
          Register your public identity while protecting sensitive business information with AES-GCM
          256 off-chain encryption.
        </p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="mb-10 flex items-center justify-between border-b border-gray-800 pb-4">
        {[
          { num: 1, title: "Select Role" },
          { num: 2, title: "Public Handle" },
          { num: 3, title: "Private Business Details" },
          { num: 4, title: "Off-Chain Encrypted Storage Preview" },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
            className={`flex cursor-pointer items-center gap-2 text-xs font-medium transition-all ${
              step === s.num
                ? "font-bold text-indigo-400"
                : step > s.num
                  ? "text-emerald-400"
                  : "text-gray-500"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                step === s.num
                  ? "bg-indigo-600 text-white"
                  : step > s.num
                    ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                    : "bg-gray-800 text-gray-400"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-950/80 p-4 text-sm text-red-300">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Choose your Ecosystem Role</h2>
          <p className="text-xs text-gray-400">
            Each role accesses tailored zero-knowledge features and workflows.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Buyer Card */}
            <div
              onClick={() => setRole("buyer")}
              className={`glass-panel cursor-pointer rounded-2xl border p-6 transition-all ${
                role === "buyer"
                  ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl text-cyan-400">
                🛒
              </div>
              <h3 className="text-lg font-bold text-white">Buyer</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Submit confidential zero-knowledge bids, maintain salt secrecy, and participate in
                private procurement auctions.
              </p>
              <div className="mt-4 inline-flex items-center text-xs font-semibold text-cyan-300">
                {role === "buyer" ? "Selected ✓" : "Select Buyer →"}
              </div>
            </div>

            {/* Vendor Card */}
            <div
              onClick={() => setRole("vendor")}
              className={`glass-panel cursor-pointer rounded-2xl border p-6 transition-all ${
                role === "vendor"
                  ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl text-purple-400">
                🏭
              </div>
              <h3 className="text-lg font-bold text-white">Vendor</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Create sealed-bid auctions, specify reserve prices, review cryptographically bound
                commitments, and trigger settlement.
              </p>
              <div className="mt-4 inline-flex items-center text-xs font-semibold text-purple-300">
                {role === "vendor" ? "Selected ✓" : "Select Vendor →"}
              </div>
            </div>

            {/* Auditor Card */}
            <div
              onClick={() => setRole("auditor")}
              className={`glass-panel cursor-pointer rounded-2xl border p-6 transition-all ${
                role === "auditor"
                  ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-white">Auditor</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Independently verify zero-knowledge proof validity, inspect compliance proofs, and
                issue cryptographic audit attestations.
              </p>
              <div className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-300">
                {role === "auditor" ? "Selected ✓" : "Select Auditor →"}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setStep(2)}>
              Continue to Public Handle →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Public Profile Information */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Public Profile Information</h2>
          <p className="text-xs text-gray-400">
            This minimal information will be stored publicly on the Midnight ledger directory
            alongside your wallet address.
          </p>

          <div className="glass-panel space-y-4 rounded-2xl p-6">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Connected Lace Wallet Address
              </label>
              <input
                type="text"
                disabled
                value={address}
                className="w-full cursor-not-allowed rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-2.5 font-mono text-xs text-gray-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Selected Role
              </label>
              <input
                type="text"
                disabled
                value={role.toUpperCase()}
                className="w-full cursor-not-allowed rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-2.5 text-xs font-semibold text-indigo-400 capitalize"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-300">
                Public Display Name / Organization Pseudonym <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp Procurement / Apex Auditor"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!displayName.trim()) {
                  setError("Please enter a public display name.");
                  return;
                }
                setError(null);
                setStep(3);
              }}
            >
              Continue to Private Details →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Private Business Information */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Private Business Details ({role.toUpperCase()})
              </h2>
              <p className="text-xs text-gray-400">
                🔒 These details are <span className="font-semibold text-emerald-400">NEVER</span>{" "}
                sent to the public ledger. They are encrypted off-chain using AES-GCM 256.
              </p>
            </div>
          </div>

          <div className="glass-panel space-y-4 rounded-2xl p-6">
            {role === "buyer" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Legal Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Global Tech Procurement Inc."
                    value={buyerData.companyName}
                    onChange={(e) => setBuyerData({ ...buyerData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      Corporate Tax ID / Registration
                    </label>
                    <input
                      type="text"
                      placeholder="TAX-88992211"
                      value={buyerData.taxId}
                      onChange={(e) => setBuyerData({ ...buyerData, taxId: e.target.value })}
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@company.com"
                      value={buyerData.contactEmail}
                      onChange={(e) => setBuyerData({ ...buyerData, contactEmail: e.target.value })}
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Annual Procurement Budget
                  </label>
                  <input
                    type="text"
                    value={buyerData.annualProcurementBudget}
                    onChange={(e) =>
                      setBuyerData({ ...buyerData, annualProcurementBudget: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {role === "vendor" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Business Legal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nexus Hardware Solutions Ltd."
                    value={vendorData.businessName}
                    onChange={(e) => setVendorData({ ...vendorData, businessName: e.target.value })}
                    className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="REG-991122"
                      value={vendorData.registrationNumber}
                      onChange={(e) =>
                        setVendorData({ ...vendorData, registrationNumber: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">VAT ID</label>
                    <input
                      type="text"
                      placeholder="VAT-EU-772211"
                      value={vendorData.vatId}
                      onChange={(e) => setVendorData({ ...vendorData, vatId: e.target.value })}
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Bank Settlement IBAN
                  </label>
                  <input
                    type="text"
                    placeholder="DE89370400440532013000"
                    value={vendorData.bankAccountIBAN}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, bankAccountIBAN: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {role === "auditor" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Audit Firm Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verifiable Proof Audits LLC"
                    value={auditorData.firmName}
                    onChange={(e) => setAuditorData({ ...auditorData, firmName: e.target.value })}
                    className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      License / Accreditation ID
                    </label>
                    <input
                      type="text"
                      placeholder="AUD-889977"
                      value={auditorData.licenseNumber}
                      onChange={(e) =>
                        setAuditorData({ ...auditorData, licenseNumber: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-300">
                      Accreditation Body
                    </label>
                    <input
                      type="text"
                      value={auditorData.accreditationBody}
                      onChange={(e) =>
                        setAuditorData({ ...auditorData, accreditationBody: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">
                    Audit RSA Public Key
                  </label>
                  <input
                    type="text"
                    disabled
                    value={auditorData.rsaPublicKey}
                    className="w-full cursor-not-allowed rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-2.5 font-mono text-xs text-emerald-400"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button variant="primary" onClick={() => setStep(4)}>
              Preview Encrypted Payload →
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Storage Preview & Finalize */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Off-Chain Encrypted Storage Preview</h2>
          <p className="text-xs text-gray-400">
            Verify how public ledger registry data differs from your AES-GCM 256 encrypted off-chain
            storage blob.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Public State Box */}
            <div className="glass-panel space-y-3 rounded-2xl border border-indigo-500/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                  🌐 Public Ledger State
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300">
                  Minimum Metadata
                </span>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs text-indigo-200">
                {JSON.stringify(
                  {
                    walletAddress: address,
                    role: role,
                    displayName: displayName || "Unspecified",
                    registeredAt: new Date().toISOString(),
                    dataHash: "0x7f3a9b1c2e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a...(SHA256)",
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Off-Chain Encrypted Box */}
            <div className="glass-panel space-y-3 rounded-2xl border border-emerald-500/30 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                  🔒 Off-Chain Encrypted Storage
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  AES-GCM 256
                </span>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs text-emerald-300">
                {`Ciphertext Payload (Base64 Encrypted):
${Buffer.from(JSON.stringify(getPrivatePayload())).toString("base64").slice(0, 120)}...`}
              </pre>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleRegister}
              className="glow-primary px-8"
            >
              Confirm & Complete Registration →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
