"use client";

import React, { useState } from "react";
import { ProcurementRfp, Stage2TechnicalSubmission, Stage3CommercialSubmission } from "@/lib/types";
import {
  submitStage3CommercialBidAction,
  evaluateStage3AwardAction,
} from "@/actions/procurement-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, DollarSign, Trophy, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

interface Stage3CommercialCardProps {
  rfp: ProcurementRfp;
  userRole: "buyer" | "vendor" | "auditor";
  technicalSubmissions: Stage2TechnicalSubmission[];
  commercialSubmissions: Stage3CommercialSubmission[];
  anonymousBidderId?: string;
  winningAnonymousBidderId?: string;
  onUpdateSubmissions: () => void;
}

export function Stage3CommercialCard({
  rfp,
  userRole,
  technicalSubmissions,
  commercialSubmissions,
  anonymousBidderId,
  winningAnonymousBidderId,
  onUpdateSubmissions,
}: Stage3CommercialCardProps) {
  const [bidAmountUsd, setBidAmountUsd] = useState(13_800_000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAwardWinner = async (targetAnonId: string) => {
    setIsLoading(true);
    try {
      const res = await evaluateStage3AwardAction({
        procurementId: rfp.id,
        winningAnonymousBidderId: targetAnonId,
      });

      if (res.success) {
        onUpdateSubmissions();
      }
    } catch (err) {
      console.error("Award error:", err);
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
            <CardTitle className="text-lg text-white">Stage 3: Encrypted Commercial Bids</CardTitle>
          </div>
          <Badge variant="emerald">Sealed Pricing</Badge>
        </div>
        <CardDescription className="text-xs text-gray-400 mt-1">
          Accepts sealed commercial pricing bids from technically qualified vendors. Buyer evaluates bids and selects the winning bidder.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Security Note */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-start space-x-3 text-xs text-emerald-200">
          <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white block">Commercial Sealing Protection:</span>
            <p className="text-gray-300 text-[11px]">
              Only technically qualified vendors (Stage 2 PASSED) can participate. Non-winning prices and legal identities remain strictly protected.
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

        {/* Buyer Commercial Evaluation & Award Console */}
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
                      <div>
                        <span className="text-gray-500 block text-[10px]">Commercial Price Offer</span>
                        <span className="text-emerald-300 font-bold text-base">
                          ${comm.bidAmountUsd.toLocaleString()} USD
                        </span>
                      </div>
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
                          onClick={() => handleAwardWinner(comm.anonymousBidderId)}
                        >
                          <Trophy className="h-3.5 w-3.5 mr-1.5" /> Award Contract to Bidder
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
