"use client";

import React, { useState } from "react";
import { ProcurementRfp, Stage1EligibilitySubmission } from "@/lib/types";
import { submitStage1EligibilityAction } from "@/actions/procurement-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, UserX, AlertTriangle, Fingerprint } from "lucide-react";

interface Stage1EligibilityCardProps {
  rfp: ProcurementRfp;
  userRole: "buyer" | "vendor" | "auditor";
  vendorWalletAddress?: string;
  submissions: Stage1EligibilitySubmission[];
  onSubmissionComplete: (submission: Stage1EligibilitySubmission) => void;
}

export function Stage1EligibilityCard({
  rfp,
  userRole,
  vendorWalletAddress = "mn_test1qqvendor001x79093eamxvgspg8p3pwn5q963g6v",
  submissions,
  onSubmissionComplete,
}: Stage1EligibilityCardProps) {
  const [turnoverUsd, setTurnoverUsd] = useState(15_000_000);
  const [experienceYears, setExperienceYears] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySubmission, setMySubmission] = useState<Stage1EligibilitySubmission | null>(null);

  const handleVerifyZK = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await submitStage1EligibilityAction({
        procurementId: rfp.id,
        vendorWalletAddress,
        vendorTurnoverUsd: Number(turnoverUsd),
        vendorExperienceYears: Number(experienceYears),
      });

      if (res.success && res.submission) {
        setMySubmission(res.submission);
        onSubmissionComplete(res.submission);
      } else {
        setError(res.error || "ZK Eligibility Verification failed.");
      }
    } catch {
      setError("Execution error during Stage 1 ZK proof generation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900/60 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">Stage 1: Anonymous ZK Eligibility Verification</CardTitle>
          </div>
          <Badge variant="indigo">Identity Concealed</Badge>
        </div>
        <CardDescription className="text-xs text-gray-400 mt-1">
          Prove your company satisfies turnover (${rfp.eligibilityThresholds.minTurnoverUsd.toLocaleString()} USD) and experience ({rfp.eligibilityThresholds.minExperienceYears} yrs) without exposing your identity or exact financials.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Minimum Exposure Security Banner */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 flex items-start space-x-3 text-xs">
          <UserX className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-indigo-200">
            <span className="font-semibold text-white block">Minimum Exposure Principle:</span>
            <p className="text-gray-300 text-[11px]">
              The buyer will ONLY see an Anonymous Bidder ID (<code className="text-cyan-300">anon_bidder_...</code>) and a ZK proof hash. Your legal identity, company name, address, tax ID, and exact revenue stay 100% hidden.
            </p>
          </div>
        </div>

        {userRole === "vendor" && !mySubmission && (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Private Witness Inputs (Kept Confidential)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Your Annual Turnover ($ USD)</label>
                <input
                  type="number"
                  value={turnoverUsd}
                  onChange={(e) => setTurnoverUsd(Number(e.target.value))}
                  className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Your Operating Experience (Years)</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
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
              onClick={handleVerifyZK}
            >
              <Fingerprint className="h-4 w-4 mr-2" /> Submit Anonymous ZK Eligibility Proof
            </Button>
          </div>
        )}

        {/* Display Verified Result for Vendor */}
        {mySubmission && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Stage 1 ZK Proof Verified!
              </span>
              <Badge variant="emerald">ELIBIGLE</Badge>
            </div>
            <div className="space-y-1 text-gray-300 text-[11px]">
              <div><span className="text-gray-500">Anonymous Bidder ID:</span> <span className="text-cyan-300 font-bold">{mySubmission.anonymousBidderId}</span></div>
              <div><span className="text-gray-500">ZK Proof Hash:</span> <span className="text-indigo-300 truncate block">{mySubmission.proofHash}</span></div>
              <div><span className="text-gray-500">Verified At:</span> <span>{new Date(mySubmission.verifiedAt).toLocaleString()}</span></div>
            </div>
          </div>
        )}

        {/* Display Verified Submissions List for Buyer */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Stage 1 Verified Anonymous Bidders ({submissions.length})</span>
            <span className="text-[10px] text-gray-500 font-normal">Identities 100% Sealed</span>
          </h4>

          {submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
              No anonymous bidders have submitted Stage 1 ZK proofs yet.
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <div
                  key={sub.anonymousBidderId}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950/80 p-3 text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="text-cyan-300 font-bold block">{sub.anonymousBidderId}</span>
                      <span className="text-[10px] text-gray-500">Proof: {sub.proofHash.slice(0, 24)}...</span>
                    </div>
                  </div>
                  <Badge variant="emerald">ZK VERIFIED</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
