"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ProcurementRfp, ProgressiveProcurementState, ProgressiveStage } from "@/lib/types";
import {
  getProcurementByIdAction,
  getProgressiveProcurementStateAction,
} from "@/actions/procurement-actions";
import { ProgressiveProcurementStepper } from "@/components/procurement/progressive-procurement-stepper";
import { Stage1EligibilityCard } from "@/components/procurement/stage1-eligibility-card";
import { Stage2TechnicalCard } from "@/components/procurement/stage2-technical-card";
import { Stage3CommercialCard } from "@/components/procurement/stage3-commercial-card";
import { Stage4LegalRevealCard } from "@/components/procurement/stage4-legal-reveal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Calendar, ShieldCheck, DollarSign, FileCode2 } from "lucide-react";

export default function ProgressiveProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfpId = resolvedParams.id;
  const { session } = useAuth();
  const userRole = session.role || "vendor";

  const [rfp, setRfp] = useState<ProcurementRfp | null>(null);
  const [progState, setProgState] = useState<ProgressiveProcurementState | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProgressiveStage>("STAGE_1_ELIGIBILITY");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const foundRfp = await getProcurementByIdAction(rfpId);
      setRfp(foundRfp);

      const state = await getProgressiveProcurementStateAction(rfpId);
      setProgState(state);
      if (state) {
        setSelectedStage(state.currentStage);
      }
    } catch (err) {
      console.error("Failed to load progressive procurement detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [rfpId]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading Progressive Procurement RFP...
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="space-y-4">
        <Link href="/procurement">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Procurements
          </Button>
        </Link>
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-6 text-red-300 text-sm">
          Procurement RFP not found for ID: {rfpId}
        </div>
      </div>
    );
  }

  // Determine current vendor's anonymous bidder ID if Stage 1 is completed
  const myStage1 = progState?.stage1Eligibility.find(
    (s) => s.isEligible
  );
  const anonymousBidderId = myStage1?.anonymousBidderId;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/procurement" className="inline-flex items-center text-xs text-gray-400 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Procurements
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="indigo">{rfp.sector}</Badge>
            <Badge variant="emerald">${rfp.estimatedBudgetUsd.toLocaleString()} USD Budget</Badge>
            <Badge variant="zk">PROGRESSIVE CONFIDENTIAL</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{rfp.title}</h1>
          <p className="text-xs text-gray-400 mt-1 max-w-3xl">{rfp.description}</p>
        </div>
      </div>

      {/* RFP Key Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-1">
          <div className="text-gray-500 flex items-center space-x-1.5">
            <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
            <span>Min Turnover Threshold</span>
          </div>
          <div className="text-white font-bold text-sm">
            ${rfp.eligibilityThresholds.minTurnoverUsd.toLocaleString()} USD
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-1">
          <div className="text-gray-500 flex items-center space-x-1.5">
            <Building2 className="h-3.5 w-3.5 text-teal-400" />
            <span>Min Experience</span>
          </div>
          <div className="text-white font-bold text-sm">
            {rfp.eligibilityThresholds.minExperienceYears} Years
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-1">
          <div className="text-gray-500 flex items-center space-x-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Required Certs</span>
          </div>
          <div className="text-gray-300 text-[11px] truncate">
            {rfp.eligibilityThresholds.requiredCertifications.join(", ") || "ISO 9001"}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-1">
          <div className="text-gray-500 flex items-center space-x-1.5">
            <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Predicate Hash</span>
          </div>
          <div className="text-cyan-300 text-[11px] truncate">
            {rfp.compactRules.predicateHash}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <ProgressiveProcurementStepper
        currentStage={progState?.currentStage || "STAGE_1_ELIGIBILITY"}
        onSelectStage={(stage) => setSelectedStage(stage)}
      />

      {/* Stage Components */}
      <div className="space-y-6">
        {(selectedStage === "STAGE_1_ELIGIBILITY" || progState?.currentStage === "STAGE_1_ELIGIBILITY") && (
          <Stage1EligibilityCard
            rfp={rfp}
            userRole={userRole}
            submissions={progState?.stage1Eligibility || []}
            onSubmissionComplete={loadData}
          />
        )}

        {(selectedStage === "STAGE_2_TECHNICAL" || progState?.currentStage === "STAGE_2_TECHNICAL") && (
          <Stage2TechnicalCard
            rfp={rfp}
            userRole={userRole}
            eligibleSubmissions={progState?.stage1Eligibility || []}
            technicalSubmissions={progState?.stage2Technical || []}
            anonymousBidderId={anonymousBidderId}
            onUpdateSubmissions={loadData}
          />
        )}

        {(selectedStage === "STAGE_3_COMMERCIAL" || progState?.currentStage === "STAGE_3_COMMERCIAL") && (
          <Stage3CommercialCard
            rfp={rfp}
            userRole={userRole}
            technicalSubmissions={progState?.stage2Technical || []}
            commercialSubmissions={progState?.stage3Commercial || []}
            anonymousBidderId={anonymousBidderId}
            winningAnonymousBidderId={progState?.winningAnonymousBidderId}
            onUpdateSubmissions={loadData}
          />
        )}

        {(selectedStage === "STAGE_4_LEGAL_REVEAL" || selectedStage === "COMPLETED" || progState?.currentStage === "STAGE_4_LEGAL_REVEAL" || progState?.currentStage === "COMPLETED") && (
          <Stage4LegalRevealCard
            rfp={rfp}
            userRole={userRole}
            winningAnonymousBidderId={progState?.winningAnonymousBidderId}
            legalReveal={progState?.stage4LegalReveal}
            onUpdateSubmissions={loadData}
          />
        )}
      </div>
    </div>
  );
}
