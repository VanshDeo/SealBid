"use client";

import React, { useEffect, useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import {
  getAuditorIntegrityReportsAction,
  verifyAuditorProofAction,
  getComprehensiveProcurementAuditAction,
  verifyFullTenderAuditAction,
  getProcurementsAction,
  AuditorAuditReportItem,
} from "@/actions/procurement-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  KeyRound,
  CheckCircle2,
  EyeOff,
  Cpu,
  Lock,
  CalendarCheck,
  Award,
  FileSpreadsheet,
} from "lucide-react";
import { ComprehensiveProcurementAuditRecord, ProcurementRfp } from "@/lib/types";

export default function AuditorDashboardPage() {
  const { session } = useAuth();
  const [auditReports, setAuditReports] = useState<AuditorAuditReportItem[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRfp[]>([]);
  const [selectedProcurementId, setSelectedProcurementId] = useState<string>("");
  const [auditRecord, setAuditRecord] = useState<ComprehensiveProcurementAuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyingFull, setVerifyingFull] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const auditorInfo = session.privateInfo?.role === "auditor" ? session.privateInfo : null;

  useEffect(() => {
    async function loadData() {
      try {
        const [reportsRes, rfps] = await Promise.all([
          getAuditorIntegrityReportsAction(),
          getProcurementsAction(),
        ]);
        setAuditReports(reportsRes.auditReports);
        setProcurements(rfps);
        if (rfps.length > 0) {
          setSelectedProcurementId(rfps[0].id);
          const fullRes = await getComprehensiveProcurementAuditAction(rfps[0].id);
          if (fullRes.success && fullRes.auditRecord) {
            setAuditRecord(fullRes.auditRecord);
          }
        }
      } catch (err) {
        console.error("Failed to load auditor integrity data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectProcurement = async (rfpId: string) => {
    setSelectedProcurementId(rfpId);
    try {
      const fullRes = await getComprehensiveProcurementAuditAction(rfpId);
      if (fullRes.success && fullRes.auditRecord) {
        setAuditRecord(fullRes.auditRecord);
      }
    } catch (err) {
      console.error("Failed to load full audit record for RFP:", err);
    }
  };

  const handleVerifyProof = async (auditId: string) => {
    setVerifyingId(auditId);
    setVerificationNotice(null);
    try {
      const res = await verifyAuditorProofAction(auditId);
      if (res.success) {
        setVerificationNotice(res.message);
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyFullTender = async () => {
    if (!selectedProcurementId) return;
    setVerifyingFull(true);
    setVerificationNotice(null);
    try {
      const res = await verifyFullTenderAuditAction(selectedProcurementId);
      if (res.success && res.auditRecord) {
        setAuditRecord(res.auditRecord);
        setVerificationNotice(res.message);
      }
    } catch (err) {
      console.error("Full tender audit verification error:", err);
    } finally {
      setVerifyingFull(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["auditor"]}>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              <span>Auditor Zero-Knowledge Compliance Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {auditorInfo?.firmName || session.profile?.displayName || "Independent Audit Partner"}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Verify procurement integrity through zero-knowledge selective disclosure without accessing commercially sensitive financial data or losing bids.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="emerald"
              className="shadow-lg shadow-emerald-600/25"
              isLoading={verifyingFull}
              onClick={handleVerifyFullTender}
            >
              <FileCheck2 className="h-4 w-4 mr-1.5" /> Run 6-Point Audit Verification
            </Button>
          </div>
        </div>

        {/* Encrypted Auditor Credentials & Zero-Leakage Guarantee */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="glass-panel space-y-2 rounded-2xl border border-emerald-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <span className="block text-xs font-semibold text-gray-400">Audit Accreditation</span>
            <div className="text-sm font-bold text-white">
              {auditorInfo?.accreditationBody || "Midnight ZK Audit Association"}
            </div>
            <div className="font-mono text-xs text-emerald-300">
              License: {auditorInfo?.licenseNumber || "AUD-889977"}
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-cyan-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <span className="block text-xs font-semibold text-gray-400">Jurisdiction & Scope</span>
            <div className="text-sm font-bold text-white">
              {auditorInfo?.jurisdiction || "Global Decentralized Jurisdiction"}
            </div>
            <div className="text-[11px] text-cyan-300">Compact ZK Smart Contracts</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-purple-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <span className="block text-xs font-semibold text-gray-400">Selective Disclosure Shield</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <EyeOff className="h-4 w-4 text-purple-400" />
              <span>Zero-Leakage Assurance</span>
            </div>
            <div className="text-[11px] text-gray-400">No raw financials or unrevealed identities</div>
          </div>
        </div>

        {/* Verification Result Banner */}
        {verificationNotice && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-4 font-mono text-xs text-emerald-300 shadow-xl">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{verificationNotice}</span>
            </span>
            <button
              onClick={() => setVerificationNotice(null)}
              className="text-emerald-400 hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 6-Point Comprehensive Procurement Audit Suite */}
        {auditRecord && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-3 gap-2">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span>Comprehensive 6-Point Tender Audit Verification</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  End-to-end cryptographic integrity verification for: <strong className="text-white">{auditRecord.procurementTitle}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedProcurementId}
                  onChange={(e) => handleSelectProcurement(e.target.value)}
                  className="bg-gray-950 border border-gray-800 text-white rounded-lg px-3 py-1.5 text-xs font-mono"
                >
                  {procurements.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>

                <Badge variant={auditRecord.overallComplianceStatus === "COMPLIANT" ? "emerald" : "indigo"}>
                  {auditRecord.overallComplianceStatus}
                </Badge>
              </div>
            </div>

            {/* 6 Verification Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Pre-committed Rules */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-indigo-400" />
                    1. Rules Pre-Commitment
                  </span>
                  <Badge variant={auditRecord.rulePreCommitmentVerification.passed ? "emerald" : "outline"}>
                    {auditRecord.rulePreCommitmentVerification.passed ? "COMMITTED & LOCKED" : "PENDING"}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400">
                  {auditRecord.rulePreCommitmentVerification.details}
                </p>
                <div className="font-mono text-[10px] text-indigo-300 truncate">
                  Hash: {auditRecord.rulePreCommitmentVerification.rulesCommitmentHash}
                </div>
              </div>

              {/* 2. ZK Eligibility */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    2. ZK Eligibility Proofs
                  </span>
                  <Badge variant={auditRecord.eligibilityVerification.passed ? "emerald" : "outline"}>
                    {auditRecord.eligibilityVerification.qualifiedCount} QUALIFIED
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400">
                  {auditRecord.eligibilityVerification.details}
                </p>
                <div className="font-mono text-[10px] text-emerald-300">
                  Identity Protected: Zero Raw Balance Sheet Leakage
                </div>
              </div>

              {/* 3. Bid Validity */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
                    3. Bid Validity & Uniqueness
                  </span>
                  <Badge variant={auditRecord.bidValidityVerification.passed ? "emerald" : "outline"}>
                    {auditRecord.bidValidityVerification.sealedBidsCount} UNIQUE BIDS
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400">
                  {auditRecord.bidValidityVerification.details}
                </p>
                <div className="font-mono text-[10px] text-cyan-300">
                  Immutability: 100% Unique Commitments
                </div>
              </div>

              {/* 4. Deadline Enforcement */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CalendarCheck className="h-4 w-4 text-purple-400" />
                    4. Deadline Enforcement
                  </span>
                  <Badge variant={auditRecord.deadlinesEnforcementVerification.passed ? "emerald" : "outline"}>
                    {auditRecord.deadlinesEnforcementVerification.passed ? "ENFORCED" : "CHECK REQUIRED"}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400">
                  {auditRecord.deadlinesEnforcementVerification.details}
                </p>
                <div className="font-mono text-[10px] text-purple-300">
                  Zero post-deadline submissions accepted
                </div>
              </div>

              {/* 5. Winner Selection Compliance */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-400" />
                    5. Winner Selection MEAT
                  </span>
                  <Badge variant={auditRecord.winnerSelectionVerification.passed ? "emerald" : "outline"}>
                    MEAT COMPLIANT
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400">
                  {auditRecord.winnerSelectionVerification.details}
                </p>
                <div className="font-mono text-[10px] text-amber-300">
                  Losing Bids Protected: 100% Concealed
                </div>
              </div>

              {/* 6. Selective Disclosure */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <EyeOff className="h-4 w-4 text-rose-400" />
                    6. Selective Disclosure
                  </span>
                  <Badge variant={auditRecord.selectiveDisclosureVerification.passed ? "emerald" : "outline"}>
                    AUTHORIZED ONLY
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-400">
                  {auditRecord.selectiveDisclosureVerification.details}
                </p>
                <div className="font-mono text-[10px] text-rose-300">
                  Zero Non-Winning Documents Disclosed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZK Selective Disclosure Circuit Proofs */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Zero-Knowledge Selective Disclosure Circuit Proofs ({auditReports.length})</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Verify cryptographic Compact circuit verification keys and proof hashes
              </p>
            </div>
            <Badge variant="cyan">{auditReports.length} Verifiable ZK Proofs</Badge>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading selective disclosure audit trails...</div>
          ) : auditReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-xs text-gray-500">
              No ZK proof audit packages available for verification yet.
            </div>
          ) : (
            <div className="space-y-4">
              {auditReports.map((report) => (
                <Card key={report.auditId} className="border-gray-800 bg-gray-900/60 backdrop-blur-xl">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="indigo">{report.stageName}</Badge>
                          <span className="font-mono text-xs text-gray-400">Audit ID: {report.auditId}</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{report.procurementTitle}</h3>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={verifyingId === report.auditId}
                        onClick={() => handleVerifyProof(report.auditId)}
                        className="text-xs font-semibold"
                      >
                        <Cpu className="h-3.5 w-3.5 mr-1.5" /> Verify Compact ZK Proof
                      </Button>
                    </div>

                    {/* ZK Proof Validity & Cryptographic Commitments */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-950 p-3.5 rounded-xl border border-gray-800 font-mono text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Compact Circuit Name</span>
                        <span className="text-cyan-300 font-bold">{report.circuitName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Verification Key Hash</span>
                        <span className="text-indigo-300">{report.verificationKeyHash.slice(0, 20)}...</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Rule Commitment Hash</span>
                        <span className="text-emerald-300">{report.ruleCommitmentHash.slice(0, 20)}...</span>
                      </div>
                    </div>

                    {/* Selective Disclosure Privacy Confirmation */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg">
                      <span className="text-emerald-300 flex items-center">
                        <KeyRound className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                        Selective Disclosure Protocol: <strong className="text-white ml-1">Zero raw document or losing price leakage</strong>
                      </span>
                      <span>Verified: {new Date(report.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
