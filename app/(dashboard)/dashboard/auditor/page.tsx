"use client";

import React, { useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

export default function AuditorDashboardPage() {
  const { session } = useAuth();
  const [verifyingHash, setVerifyingHash] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const auditorInfo = session.privateInfo?.role === "auditor" ? session.privateInfo : null;

  const mockAudits = [
    {
      id: "bid-proof-001",
      auctionTitle: "Enterprise GPU Server Cluster",
      commitmentHash: "0x8f3a9b1c2e4d5f... (SHA-256)",
      proofStatus: "VERIFIED",
      circuit: "submit_sealed_bid",
      timestamp: "2026-07-25 14:30:00 UTC",
    },
    {
      id: "bid-proof-002",
      auctionTitle: "Commercial Real Estate Lease Token",
      commitmentHash: "0x4b7c9e1f3a2d5e... (SHA-256)",
      proofStatus: "VERIFIED",
      circuit: "submit_sealed_bid",
      timestamp: "2026-07-25 16:15:22 UTC",
    },
    {
      id: "bid-proof-003",
      auctionTitle: "Rare Digital Collectible #404",
      commitmentHash: "0x1d2e3f4a5b6c7d... (SHA-256)",
      proofStatus: "VERIFIED",
      circuit: "reveal_bid",
      timestamp: "2026-07-25 17:00:10 UTC",
    },
  ];

  const runAuditVerification = (proofId: string) => {
    setVerifyingHash(proofId);
    setVerificationResult(null);
    setTimeout(() => {
      setVerifyingHash(null);
      setVerificationResult(
        `ZK Proof ${proofId} cryptographically verified! Zero-Knowledge circuit predicate (bid >= reserve) holds without disclosing private bid scalar.`
      );
    }, 1200);
  };

  return (
    <RoleGuard allowedRoles={["auditor"]}>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span>⚖️</span> Auditor Zero-Knowledge Compliance Portal
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {auditorInfo?.firmName || session.profile?.displayName || "Independent Audit Partner"}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Verify zero-knowledge proof validity, audit auction commitments, and issue compliance
              attestations.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" className="glow-primary">
              + Generate Audit Attestation
            </Button>
          </div>
        </div>

        {/* Encrypted Auditor Credentials */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="glass-panel space-y-2 rounded-2xl border border-emerald-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">Audit Accreditation</span>
            <div className="text-sm font-bold text-white">
              {auditorInfo?.accreditationBody || "Midnight ZK Audit Association"}
            </div>
            <div className="font-mono text-xs text-emerald-300">
              License: {auditorInfo?.licenseNumber || "AUD-889977"}
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-emerald-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">Jurisdiction</span>
            <div className="text-sm font-bold text-white">
              {auditorInfo?.jurisdiction || "Global Decentralized Jurisdiction"}
            </div>
            <div className="text-[11px] text-gray-400">Multi-Chain Regulatory Scope</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-emerald-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">Audit RSA Public Key</span>
            <div className="truncate font-mono text-xs text-emerald-300">
              {auditorInfo?.rsaPublicKey || "0xrsa_pub_auditor_sealbid_88992211"}
            </div>
            <div className="text-[11px] text-gray-400">Public Verification Target</div>
          </div>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-4 font-mono text-xs text-emerald-300">
            <span>✅ {verificationResult}</span>
            <button
              onClick={() => setVerificationResult(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* ZK Proof Audit Log */}
        <div className="glass-panel space-y-4 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Zero-Knowledge Audit Trail</h2>
              <p className="text-xs text-gray-400">
                Verifiable ZK circuit executions across active auctions
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              3 Proofs Ready for Audit
            </span>
          </div>

          <div className="divide-y divide-gray-800">
            {mockAudits.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {item.id}
                    </span>
                    <span className="rounded border border-gray-700 bg-gray-900 px-2 py-0.5 font-mono text-[10px] text-gray-300">
                      {item.circuit}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.auctionTitle}</h3>
                  <div className="font-mono text-xs text-gray-400">
                    Commitment: {item.commitmentHash}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={verifyingHash === item.id}
                    onClick={() => runAuditVerification(item.id)}
                    className="border-emerald-500/30 text-xs text-emerald-300 hover:bg-emerald-500/10"
                  >
                    Verify ZK Witness
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
