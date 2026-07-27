"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProcurementRfp, QualificationVerificationResult } from "@/lib/types";
import { verifyVendorQualificationAction } from "@/actions/vendor-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ShieldCheck,
  Zap,
  FileCode2,
  DollarSign,
  Briefcase,
  ArrowRight,
} from "lucide-react";

interface ProcurementCardProps {
  rfp: ProcurementRfp;
  vendorTurnoverUsd?: number;
  vendorExperienceYears?: number;
}

export function ProcurementCard({
  rfp,
  vendorTurnoverUsd = 12_500_000,
  vendorExperienceYears = 12,
}: ProcurementCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<QualificationVerificationResult | null>(null);

  const handleTestEligibility = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyVendorQualificationAction(
        {
          vendorId: "vendor_current_user",
          requiredTurnoverUsd: rfp.eligibilityThresholds.minTurnoverUsd,
          requiredExperienceYears: rfp.eligibilityThresholds.minExperienceYears,
        },
        vendorTurnoverUsd,
        vendorExperienceYears
      );
      setResult(res);
    } catch (err) {
      console.error("Eligibility check error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="border-gray-800/80 bg-gray-900/60 shadow-xl backdrop-blur-xl space-y-4 hover:border-indigo-500/40 transition-all">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="indigo">{rfp.sector}</Badge>
            <Badge variant="zk">{rfp.biddingStage.replace(/_/g, " ")}</Badge>
            <Badge variant="emerald">${rfp.estimatedBudgetUsd.toLocaleString()} USD Budget</Badge>
          </div>
          <CardTitle className="text-xl text-white hover:text-indigo-300 transition-colors">
            {rfp.title}
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs mt-1 line-clamp-2">
            {rfp.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Eligibility Threshold Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="font-semibold">Min Turnover</span>
            </div>
            <span className="text-white font-mono font-bold text-sm block">
              ${rfp.eligibilityThresholds.minTurnoverUsd.toLocaleString()} USD
            </span>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3 space-y-1">
            <div className="flex items-center space-x-1.5 text-teal-400">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="font-semibold">Min Experience</span>
            </div>
            <span className="text-white font-mono font-bold text-sm block">
              {rfp.eligibilityThresholds.minExperienceYears} Years
            </span>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="font-semibold">Required Certifications</span>
            </div>
            <span className="text-gray-300 text-[11px] block truncate">
              {rfp.eligibilityThresholds.requiredCertifications.join(", ") || "None"}
            </span>
          </div>
        </div>

        {/* Compact Rule Commitment */}
        <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950/80 p-2.5 font-mono text-[11px]">
          <div className="flex items-center space-x-2 text-indigo-300">
            <FileCode2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-gray-400">Compact Predicate Hash:</span>
            <span className="text-cyan-300 truncate max-w-xs">{rfp.compactRules.predicateHash}</span>
          </div>
          <span className="text-emerald-400 text-[10px] uppercase font-semibold">ZK Ledger Active</span>
        </div>

        {/* Dynamic Verification Result */}
        {result && (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Vendor ZK Eligibility Proof:</span>
              <Badge variant={result.isQualified ? "emerald" : "red"}>
                {result.isQualified ? "QUALIFIED TO BID" : "DISQUALIFIED"}
              </Badge>
            </div>
            <div className="flex justify-between text-gray-400 text-[11px] truncate">
              <span>Proof Hash:</span>
              <span className="text-cyan-300 truncate max-w-xs">{result.proofHash}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800 pt-4">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5 text-gray-500" />
          <span>Bidding Deadline: {new Date(rfp.deadlines.biddingDeadline).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button type="button" variant="outline" size="sm" isLoading={isVerifying} onClick={handleTestEligibility}>
            <Zap className="h-3.5 w-3.5" /> Test ZK Eligibility
          </Button>
          <Link href={`/procurement/${rfp.id}`}>
            <Button variant="primary" size="sm">
              Enter Progressive Tender <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
