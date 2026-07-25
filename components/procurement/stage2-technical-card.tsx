"use client";

import React, { useState } from "react";
import { ProcurementRfp, Stage1EligibilitySubmission, Stage2TechnicalSubmission } from "@/lib/types";
import {
  submitStage2TechnicalProposalAction,
  evaluateStage2TechnicalAction,
} from "@/actions/procurement-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Lock, CheckCircle2, XCircle, AlertCircle, Send, Award } from "lucide-react";

interface Stage2TechnicalCardProps {
  rfp: ProcurementRfp;
  userRole: "buyer" | "vendor" | "auditor";
  eligibleSubmissions: Stage1EligibilitySubmission[];
  technicalSubmissions: Stage2TechnicalSubmission[];
  anonymousBidderId?: string;
  onUpdateSubmissions: () => void;
}

export function Stage2TechnicalCard({
  rfp,
  userRole,
  eligibleSubmissions,
  technicalSubmissions,
  anonymousBidderId,
  onUpdateSubmissions,
}: Stage2TechnicalCardProps) {
  const [technicalSpecs, setTechnicalSpecs] = useState(
    "High-precision 5-axis CNC titanium machining with tolerance under ±0.002mm and ISO 9001 quality audit certification."
  );
  const [methodology, setMethodology] = useState(
    "Automated cleanroom assembly with real-time laser interferometry inspection and stress testing."
  );
  const [deliveryTimelineDays, setDeliveryTimelineDays] = useState(60);
  const [equipmentSummary, setEquipmentSummary] = useState(
    "3x DMG Mori 5-axis Titanium CNC mills, 2x Zeiss CMM inspection stations."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEligible = eligibleSubmissions.some((e) => e.anonymousBidderId === anonymousBidderId);
  const myTechnical = technicalSubmissions.find((t) => t.anonymousBidderId === anonymousBidderId);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousBidderId) {
      setError("Please complete Stage 1 eligibility verification first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await submitStage2TechnicalProposalAction({
        procurementId: rfp.id,
        anonymousBidderId,
        technicalSpecs,
        methodology,
        deliveryTimelineDays,
        equipmentSummary,
      });

      if (res.success) {
        onUpdateSubmissions();
      } else {
        setError(res.error || "Failed to submit technical proposal.");
      }
    } catch (err) {
      setError("Error during technical proposal submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async (targetAnonId: string, status: "PASSED" | "REJECTED", technicalScore: number) => {
    setIsLoading(true);
    try {
      const res = await evaluateStage2TechnicalAction({
        procurementId: rfp.id,
        anonymousBidderId: targetAnonId,
        status,
        technicalScore,
      });

      if (res.success) {
        onUpdateSubmissions();
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900/60 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-lg text-white">Stage 2: Confidential Technical Proposals</CardTitle>
          </div>
          <Badge variant="cyan">Price Concealed</Badge>
        </div>
        <CardDescription className="text-xs text-gray-400 mt-1">
          Collects technical specifications, methodology, and equipment standards from eligible anonymous bidders. Commercial prices remain completely hidden.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Privacy Note */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 flex items-start space-x-3 text-xs text-cyan-200">
          <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white block">Stage 2 Confidentiality Guarantee:</span>
            <p className="text-gray-300 text-[11px]">
              Evaluators review technical merit strictly by Anonymous Bidder ID. No commercial price or legal entity details are visible in this stage.
            </p>
          </div>
        </div>

        {/* Vendor Submission Form */}
        {userRole === "vendor" && !myTechnical && (
          <form onSubmit={handleSubmitProposal} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Submit Confidential Technical Proposal
            </h4>

            {!isEligible && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You must complete Stage 1 ZK eligibility verification before submitting Stage 2 technical proposals.</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Technical Specifications & Standards</label>
                <textarea
                  rows={2}
                  value={technicalSpecs}
                  onChange={(e) => setTechnicalSpecs(e.target.value)}
                  disabled={!isEligible}
                  className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Manufacturing & QA Methodology</label>
                <textarea
                  rows={2}
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  disabled={!isEligible}
                  className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Delivery Timeline (Days)</label>
                  <input
                    type="number"
                    value={deliveryTimelineDays}
                    onChange={(e) => setDeliveryTimelineDays(Number(e.target.value))}
                    disabled={!isEligible}
                    className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Key Equipment & Machinery</label>
                  <input
                    type="text"
                    value={equipmentSummary}
                    onChange={(e) => setEquipmentSummary(e.target.value)}
                    disabled={!isEligible}
                    className="w-[#100%] rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}

            <Button
              type="submit"
              variant="primary"
              disabled={!isEligible}
              isLoading={isLoading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" /> Submit Technical Proposal
            </Button>
          </form>
        )}

        {/* Vendor Submission Confirmation */}
        {myTechnical && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Technical Proposal Submitted
              </span>
              <Badge variant={myTechnical.status === "PASSED" ? "emerald" : myTechnical.status === "REJECTED" ? "red" : "indigo"}>
                {myTechnical.status}
              </Badge>
            </div>
            <div className="text-gray-300 text-[11px]">
              <div><span className="text-gray-500">Proposal Commitment:</span> <span className="text-indigo-300">{myTechnical.proposalHash}</span></div>
              <div><span className="text-gray-500">Submitted At:</span> {new Date(myTechnical.submittedAt).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Buyer Technical Review Console */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Submitted Technical Proposals ({technicalSubmissions.length})</span>
            <span className="text-[10px] text-gray-500 font-normal">Pricing & Identities Concealed</span>
          </h4>

          {technicalSubmissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
              No technical proposals submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {technicalSubmissions.map((sub) => (
                <div key={sub.submissionId} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-mono font-bold text-xs">{sub.anonymousBidderId}</span>
                    <Badge variant={sub.status === "PASSED" ? "emerald" : sub.status === "REJECTED" ? "red" : "indigo"}>
                      {sub.status} {sub.technicalScore ? `(${sub.technicalScore}/100)` : ""}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 text-gray-300">
                    <div><span className="text-gray-500">Specs:</span> {sub.technicalSpecs}</div>
                    <div><span className="text-gray-500">Methodology:</span> {sub.methodology}</div>
                    <div><span className="text-gray-500">Delivery:</span> {sub.deliveryTimelineDays} Days</div>
                    <div><span className="text-gray-500">Equipment:</span> {sub.equipmentSummary}</div>
                  </div>

                  {userRole === "buyer" && sub.status === "PENDING" && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-800">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-950"
                        onClick={() => handleEvaluate(sub.anonymousBidderId, "PASSED", 92)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Pass Technical
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600/50 text-red-400 hover:bg-red-950"
                        onClick={() => handleEvaluate(sub.anonymousBidderId, "REJECTED", 45)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
