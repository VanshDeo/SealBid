"use client";

import React, { useState } from "react";
import { ProcurementRfp, ConfidentialEligibilityProofPackage } from "@/lib/types";
import { verifyConfidentialEligibilityAction } from "@/actions/procurement-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  CheckCircle2,
  XCircle,
  Cpu,
  EyeOff,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface ConfidentialEligibilityVerifierProps {
  rfp: ProcurementRfp;
  vendorId?: string;
}

export function ConfidentialEligibilityVerifier({
  rfp,
  vendorId = "vendor_demo_user_01",
}: ConfidentialEligibilityVerifierProps) {
  // Private witness inputs (kept strictly on client)
  const [actualTurnoverUsd, setActualTurnoverUsd] = useState(16_500_000);
  const [actualExperienceYears, setActualExperienceYears] = useState(8);
  const [auditedReportHash, setAuditedReportHash] = useState(
    "0xaudited_report_2025_tuv_sud_8f9a0b1c2d3e4f5a"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [proofPackage, setProofPackage] = useState<ConfidentialEligibilityProofPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateProof = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await verifyConfidentialEligibilityAction({
        procurementId: rfp.id,
        vendorId,
        requiredTurnoverUsd: rfp.eligibilityThresholds.minTurnoverUsd,
        requiredExperienceYears: rfp.eligibilityThresholds.minExperienceYears,
        requiredCertifications: rfp.eligibilityThresholds.requiredCertifications,
        privateWitness: {
          actualTurnoverUsd: Number(actualTurnoverUsd),
          actualExperienceYears: Number(actualExperienceYears),
          auditedReportHash,
        },
      });

      if (res.success && res.proofPackage) {
        setProofPackage(res.proofPackage);
      } else {
        setError(res.error || "ZK Proof generation failed.");
      }
    } catch {
      setError("Error executing Compact ZK smart contract circuit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900/60 shadow-xl backdrop-blur-xl space-y-6">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Compact ZK Confidential Eligibility Verifier
            </CardTitle>
          </div>
          <Badge variant="zk">Midnight Compact v0.14.2</Badge>
        </div>
        <CardDescription className="text-xs text-gray-400 mt-1">
          Proves compliance with RFP thresholds (${rfp.eligibilityThresholds.minTurnoverUsd.toLocaleString()} USD turnover, {rfp.eligibilityThresholds.minExperienceYears} yrs experience) without revealing underlying financial documents.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Zero Document Leakage Banner */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex items-start space-x-3 text-xs text-indigo-200">
          <EyeOff className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white block">Document Secrecy Guarantee</span>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Buyers receive <strong>ONLY binary Pass/Fail verification</strong> and ZK proof validity metadata (<code className="text-cyan-300">proofHash</code>, <code className="text-cyan-300">verificationKeyHash</code>). Raw turnover figures, tax filings, and audited report hashes remain completely hidden in the private ZK witness.
            </p>
          </div>
        </div>

        {/* Private Witness Form (Vendor Inputs) */}
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span>Private Witness Inputs (Kept Confidential)</span>
            <span className="text-[10px] text-emerald-400 flex items-center font-mono">
              <Lock className="h-3 w-3 mr-1" /> Client-Side Only
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Actual Financial Turnover ($ USD)
              </label>
              <input
                type="number"
                value={actualTurnoverUsd}
                onChange={(e) => setActualTurnoverUsd(Number(e.target.value))}
                className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Operating Experience (Years)
              </label>
              <input
                type="number"
                value={actualExperienceYears}
                onChange={(e) => setActualExperienceYears(Number(e.target.value))}
                className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Audited Financial Report Hash (Private Witness)
            </label>
            <input
              type="text"
              value={auditedReportHash}
              onChange={(e) => setAuditedReportHash(e.target.value)}
              className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs font-mono text-gray-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            onClick={handleGenerateProof}
          >
            <Sparkles className="h-4 w-4 mr-2" /> Execute Compact Circuit & Generate ZK Proof
          </Button>
        </div>

        {/* Buyer View: Pass/Fail + Proof Validity Card */}
        {proofPackage && (
          <div
            className={`rounded-2xl border p-5 space-y-4 font-mono text-xs transition-all ${
              proofPackage.isQualified
                ? "border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10"
                : "border-red-500/50 bg-red-950/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-3 gap-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                  Buyer Verification Result Payload (No Document Exposure)
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  {proofPackage.isQualified ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-base font-bold text-white">
                    {proofPackage.isQualified ? "ELIGIBILITY VERIFIED (PASS)" : "DISQUALIFIED (FAIL)"}
                  </span>
                </div>
              </div>
              <Badge variant={proofPackage.isQualified ? "emerald" : "red"}>
                {proofPackage.proofStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="rounded-lg border border-gray-800 bg-gray-950/80 p-3 space-y-1">
                <span className="text-gray-500 block text-[10px]">ZK Circuit Name</span>
                <span className="text-indigo-300 font-bold">{proofPackage.circuitName}</span>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-950/80 p-3 space-y-1">
                <span className="text-gray-500 block text-[10px]">Verification Key Hash</span>
                <span className="text-cyan-300 font-bold truncate block">
                  {proofPackage.verificationKeyHash}
                </span>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-950/80 p-3 space-y-1 sm:col-span-2">
                <span className="text-gray-500 block text-[10px]">ZK Proof Hash Commitment</span>
                <span className="text-emerald-300 font-bold block truncate">
                  {proofPackage.proofHash}
                </span>
              </div>
            </div>

            {/* Criteria Satisfaction Flags */}
            <div className="rounded-lg border border-gray-800 bg-gray-950/80 p-3 space-y-2 text-[11px]">
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                Compact Predicate Rule Evaluation Summary
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-gray-900 p-2">
                  <span className="text-gray-500 block text-[9px]">Turnover Threshold</span>
                  <span
                    className={
                      proofPackage.criteriaBreakdown.turnoverSatisfied
                        ? "text-emerald-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {proofPackage.criteriaBreakdown.turnoverSatisfied ? "SATISFIED" : "FAILED"}
                  </span>
                </div>

                <div className="rounded bg-gray-900 p-2">
                  <span className="text-gray-500 block text-[9px]">Experience Threshold</span>
                  <span
                    className={
                      proofPackage.criteriaBreakdown.experienceSatisfied
                        ? "text-emerald-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {proofPackage.criteriaBreakdown.experienceSatisfied ? "SATISFIED" : "FAILED"}
                  </span>
                </div>

                <div className="rounded bg-gray-900 p-2">
                  <span className="text-gray-500 block text-[9px]">Certifications</span>
                  <span
                    className={
                      proofPackage.criteriaBreakdown.certificationsSatisfied
                        ? "text-emerald-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {proofPackage.criteriaBreakdown.certificationsSatisfied ? "SATISFIED" : "FAILED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
