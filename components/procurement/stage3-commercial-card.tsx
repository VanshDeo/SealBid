"use client";

import React, { useState } from "react";
import { ProcurementRfp, Stage2TechnicalSubmission, Stage3CommercialSubmission, ConfidentialWinnerAuditTrail } from "@/lib/types";
import {
  submitStage3CommercialBidAction,
  evaluateStage3AwardAction,
} from "@/actions/procurement-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, DollarSign, Trophy, CheckCircle2, AlertCircle, ShieldAlert, Cpu, FileCheck2, Scale, KeyRound } from "lucide-react";

interface Stage3CommercialCardProps {
  rfp: ProcurementRfp;
  userRole: "buyer" | "vendor" | "auditor";
  technicalSubmissions: Stage2TechnicalSubmission[];
  commercialSubmissions: Stage3CommercialSubmission[];
  anonymousBidderId?: string;
  winningAnonymousBidderId?: string;
  auditTrail?: ConfidentialWinnerAuditTrail;
  onUpdateSubmissions: () => void;
}

export function Stage3CommercialCard({
  rfp,
  userRole,
  technicalSubmissions,
  commercialSubmissions,
  anonymousBidderId,
  winningAnonymousBidderId,
  auditTrail: propsAuditTrail,
  onUpdateSubmissions,
}: Stage3CommercialCardProps) {
  const [bidAmountUsd, setBidAmountUsd] = useState(13_800_000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditTrail = propsAuditTrail || rfp.progressiveState?.winnerAuditTrail;

  const techEntry = technicalSubmissions.find(
    (t) => t.anonymousBidderId === anonymousBidderId && t.status === "PASSED"
  );
  const myCommercial = commercialSubmissions.find(
    (c) => c.anonymousBidderId === anonymousBidderId
  );

  const handleSubmitCommercial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousBidderId || !techEntry) {
      setError("Only vendors who passed Stage 2 technical evaluation can submit commercial bids.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await submitStage3CommercialBidAction({
        procurementId: rfp.id,
        anonymousBidderId,
        bidAmountUsd: Number(bidAmountUsd),
      });

      if (res.success) {
        onUpdateSubmissions();
      } else {
        setError(res.error || "Failed to submit commercial bid.");
      }
    } catch (err) {
      setError("Error during commercial bid submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateCompactWinner = async (targetAnonId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await evaluateStage3AwardAction({
        procurementId: rfp.id,
        winningAnonymousBidderId: targetAnonId,
      });

      if (res.success) {
        onUpdateSubmissions();
      } else {
        setError(res.error || "Failed to execute Compact ZK winner evaluation.");
      }
    } catch (err) {
      console.error("Compact award error:", err);
      setError("Error executing Compact ZK evaluation circuit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900/60 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-lg text-white">Stage 3: Encrypted Commercial Bids & Compact Winner Selection</CardTitle>
          </div>
          <Badge variant="emerald">Sealed Pricing</Badge>
        </div>
        <CardDescription className="text-xs text-gray-400 mt-1">
          Accepts sealed commercial pricing bids from technically qualified vendors. Evaluates bids according to predefined Compact ZK procurement rules, keeping losing bids 100% confidential.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Security Note */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-start space-x-3 text-xs text-emerald-200">
          <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white block">Commercial Sealing & Compact Winner Evaluation:</span>
            <p className="text-gray-300 text-[11px]">
              Only technically qualified vendors (Stage 2 PASSED) can participate. Compact ZK smart contracts evaluate bids against predefined criteria. Losing bids remain strictly confidential and unrevealed.
            </p>
          </div>
        </div>

        {/* Vendor Commercial Bid Submission Form */}
        {userRole === "vendor" && !myCommercial && (
          <form onSubmit={handleSubmitCommercial} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Submit Sealed Commercial Bid
            </h4>

            {!techEntry && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You must pass Stage 2 technical evaluation before submitting a commercial pricing bid.</span>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 block mb-1">Commercial Price Offer ($ USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="number"
                  value={bidAmountUsd}
                  onChange={(e) => setBidAmountUsd(Number(e.target.value))}
                  disabled={!techEntry}
                  className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 pl-9 pr-3 py-2 text-sm font-mono font-bold text-emerald-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Estimated RFP Budget: ${rfp.estimatedBudgetUsd.toLocaleString()} USD</p>
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}

            <Button
              type="submit"
              variant="emerald"
              disabled={!techEntry}
              isLoading={isLoading}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" /> Submit Sealed Commercial Bid
            </Button>
          </form>
        )}

        {/* Vendor Submission Confirmation */}
        {myCommercial && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Sealed Commercial Bid Submitted
              </span>
              <Badge variant={myCommercial.isWinningBid ? "emerald" : "indigo"}>
                {myCommercial.isWinningBid ? "WINNER AWARDED" : "SEALED"}
              </Badge>
            </div>
            <div className="text-gray-300 text-[11px]">
              <div><span className="text-gray-500">Bid Amount:</span> <span className="text-emerald-300 font-bold">${myCommercial.bidAmountUsd.toLocaleString()} USD</span></div>
              <div><span className="text-gray-500">ZK Commitment:</span> <span className="text-indigo-300">{myCommercial.bidCommitmentHash}</span></div>
            </div>
          </div>
        )}

        {/* Buyer Compact ZK Winner Selection Console */}
        {userRole === "buyer" && !winningAnonymousBidderId && commercialSubmissions.length > 0 && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-indigo-300 flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-indigo-400" />
                <span>Compact ZK Predefined Rules Winner Evaluation</span>
              </h4>
              <Badge variant="indigo">Circuit: evaluate_winning_bid</Badge>
            </div>
            <p className="text-[11px] text-gray-300">
              Predefined Scoring Rule: <span className="font-mono text-cyan-300 font-bold">{rfp.evaluationCriteria?.scoringMethod || "MEAT (Weighted Quality-Cost Ratio)"}</span> (Tech: {rfp.evaluationCriteria?.technicalScoreWeight ?? 50}%, Price: {rfp.evaluationCriteria?.financialPriceWeight ?? 50}%)
            </p>
            {error && <div className="text-xs text-red-400">{error}</div>}
            <Button
              variant="secondary"
              isLoading={isLoading}
              className="w-full text-xs font-semibold"
              onClick={() => handleEvaluateCompactWinner()}
            >
              <Scale className="h-4 w-4 mr-2" /> Execute Compact ZK Winner Selection & Audit Trail
            </Button>
          </div>
        )}

        {/* Immutable Fairness Audit Trail Display */}
        {auditTrail && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold flex items-center">
                <FileCheck2 className="h-4.5 w-4.5 mr-1.5 text-cyan-400" />
                Immutable Zero-Bias Audit Trail Certificate
              </span>
              <Badge variant="cyan">ZK AUDITED & VERIFIED</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-gray-950/80 p-3 rounded-lg border border-gray-800">
              <div>
                <span className="text-gray-500 block text-[10px]">Winning Anonymous Pseudonym</span>
                <span className="text-emerald-300 font-bold">{auditTrail.winningAnonymousBidderId}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Predefined Evaluation Rule</span>
                <span className="text-indigo-300 font-semibold">{auditTrail.evaluationMethod}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">ZK Proof Circuit Hash</span>
                <span className="text-cyan-300">{auditTrail.proofHash.slice(0, 24)}...</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Compact Verification Key</span>
                <span className="text-cyan-300">{auditTrail.verificationKeyHash.slice(0, 24)}...</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Rule Commitment Hash</span>
                <span className="text-indigo-300">{auditTrail.ruleCommitmentHash.slice(0, 24)}...</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Fairness Proof Signature</span>
                <span className="text-emerald-300">{auditTrail.fairnessProofSignature.slice(0, 24)}...</span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5 flex items-center justify-between text-[11px]">
              <span className="text-emerald-200 flex items-center">
                <KeyRound className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Losing Bids Privacy Status: <strong className="ml-1 text-white">100% Confidential ({auditTrail.losingBidCount} losing offer(s) sealed)</strong>
              </span>
              <span className="text-gray-400 text-[10px]">{new Date(auditTrail.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Buyer Commercial Evaluation List */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Commercial Bids Received ({commercialSubmissions.length})</span>
            <span className="text-[10px] text-gray-500 font-normal">Identities Still Hidden</span>
          </h4>

          {commercialSubmissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
              No commercial bids submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {commercialSubmissions.map((comm) => {
                const isWinner = winningAnonymousBidderId === comm.anonymousBidderId || comm.isWinningBid;
                return (
                  <div
                    key={comm.bidId}
                    className={`rounded-xl border p-4 space-y-3 transition-all ${
                      isWinner ? "border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50" : "border-gray-800 bg-gray-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-mono font-bold text-xs">{comm.anonymousBidderId}</span>
                      <Badge variant={isWinner ? "emerald" : "indigo"}>
                        {isWinner ? "WINNING BIDDER" : "QUALIFIED CANDIDATE"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      {userRole === "vendor" && comm.anonymousBidderId !== anonymousBidderId ? (
                        <div>
                          <span className="text-gray-500 block text-[10px]">Commercial Price Offer</span>
                          <span className="text-amber-400/90 font-bold text-xs flex items-center">
                            <Lock className="h-3 w-3 mr-1 text-amber-400" />
                            SEALED CONFIDENTIAL BID
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Commitment: {comm.bidCommitmentHash.slice(0, 18)}...
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-gray-500 block text-[10px]">Commercial Price Offer</span>
                          <span className="text-emerald-300 font-bold text-base">
                            ${comm.bidAmountUsd.toLocaleString()} USD
                          </span>
                        </div>
                      )}
                      <div className="text-right">
                        <span className="text-gray-500 block text-[10px]">Submitted</span>
                        <span className="text-gray-300 text-[11px]">{new Date(comm.submittedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {userRole === "buyer" && !winningAnonymousBidderId && (
                      <div className="pt-2 border-t border-gray-800">
                        <Button
                          size="sm"
                          variant="emerald"
                          className="w-full"
                          onClick={() => handleEvaluateCompactWinner(comm.anonymousBidderId)}
                        >
                          <Trophy className="h-3.5 w-3.5 mr-1.5" /> Award Contract via Compact ZK
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

