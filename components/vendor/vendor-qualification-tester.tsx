"use client";

import React, { useState } from "react";
import { QualificationVerificationResult } from "@/lib/types";
import { verifyVendorQualificationAction } from "@/actions/vendor-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Cpu,
  Lock,
  FileCheck2,
} from "lucide-react";

interface VendorQualificationTesterProps {
  vendorId?: string;
  actualTurnoverUsd?: number;
  actualExperienceYears?: number;
}

export function VendorQualificationTester({
  vendorId = "vendor_preview_001",
  actualTurnoverUsd = 12_500_000,
  actualExperienceYears = 12,
}: VendorQualificationTesterProps) {
  const [requiredTurnover, setRequiredTurnover] = useState<number>(5_000_000);
  const [requiredExperience, setRequiredExperience] = useState<number>(3);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<QualificationVerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setResult(null);

    try {
      const res = await verifyVendorQualificationAction(
        {
          vendorId,
          requiredTurnoverUsd: Number(requiredTurnover),
          requiredExperienceYears: Number(requiredExperience),
        },
        actualTurnoverUsd,
        actualExperienceYears
      );
      setResult(res);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="space-y-6 border-gray-800/80 bg-gray-900/60 shadow-2xl backdrop-blur-xl">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="mb-1 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-500 text-white shadow-lg shadow-cyan-500/25">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">
              Zero-Knowledge Qualification Tester
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Execute Midnight ZK Circuit{" "}
              <code className="font-mono text-cyan-400">verify_qualification</code> to prove RFP
              criteria satisfaction.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Required Annual Turnover Threshold (USD)
              </label>
              <Input
                type="number"
                value={requiredTurnover}
                onChange={(e) => setRequiredTurnover(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Required Minimum Operating Experience (Years)
              </label>
              <Input
                type="number"
                value={requiredExperience}
                onChange={(e) => setRequiredExperience(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950/60 p-3 text-xs">
            <div className="flex items-center space-x-2 text-gray-400">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>
                Zero-Knowledge Privacy: Actual vendor turnover & client details remain unrevealed.
              </span>
            </div>
            <Button type="submit" variant="secondary" size="sm" isLoading={isVerifying}>
              <Zap className="h-4 w-4" /> Run ZK Verification
            </Button>
          </div>
        </form>

        {result && (
          <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950/80 p-5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">ZK Circuit Verification Result</span>
              </div>
              <Badge variant={result.isQualified ? "emerald" : "red"}>
                {result.isQualified ? "QUALIFIED" : "DISQUALIFIED"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/60 p-3">
                <span className="text-gray-400">Turnover Threshold Check:</span>
                {result.details.turnoverSatisfied ? (
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> SATISFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-red-400">
                    <XCircle className="h-4 w-4" /> NOT SATISFIED
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/60 p-3">
                <span className="text-gray-400">Experience Threshold Check:</span>
                {result.details.experienceSatisfied ? (
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> SATISFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-red-400">
                    <XCircle className="h-4 w-4" /> NOT SATISFIED
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-gray-800 bg-gray-900/40 p-3 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>Proof Status:</span>
                <span className="font-bold text-indigo-300">{result.proofStatus}</span>
              </div>
              <div className="flex justify-between truncate text-gray-400">
                <span>ZK Proof Hash:</span>
                <span className="max-w-xs truncate text-cyan-300">{result.proofHash}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Evaluated Timestamp:</span>
                <span className="text-gray-300">{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
