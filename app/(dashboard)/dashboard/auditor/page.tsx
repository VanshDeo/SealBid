"use client";

import React, { useEffect, useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import {
  getAuditorIntegrityReportsAction,
  verifyAuditorProofAction,
  AuditorAuditReportItem,
} from "@/actions/procurement-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Cpu,
} from "lucide-react";

export default function AuditorDashboardPage() {
  const { session } = useAuth();
  const [auditReports, setAuditReports] = useState<AuditorAuditReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const auditorInfo = session.privateInfo?.role === "auditor" ? session.privateInfo : null;

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await getAuditorIntegrityReportsAction();
        setAuditReports(res.auditReports);
      } catch (err) {
        console.error("Failed to load auditor integrity reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

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
            <Button variant="emerald" className="shadow-lg shadow-emerald-600/25">
              <FileCheck2 className="h-4 w-4 mr-1.5" /> Issue Compliance Attestation
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

        {/* ZK Selective Disclosure Audit Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Zero-Knowledge Selective Disclosure Audit Trail ({auditReports.length})</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Verify cryptographic ZK circuit proof validity packages across active procurements
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
