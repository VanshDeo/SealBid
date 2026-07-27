"use client";

import React, { useState, useEffect, useCallback, use } from "react";
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
import { ArrowLeft, Building2, ShieldCheck, DollarSign, FileCode2 } from "lucide-react";

export default function ProgressiveProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfpId = resolvedParams.id;
  const { session } = useAuth();
  const userRole = session?.role || "vendor";

  const [rfp, setRfp] = useState<ProcurementRfp | null>(null);
  const [progState, setProgState] = useState<ProgressiveProcurementState | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProgressiveStage>("STAGE_1_ELIGIBILITY");
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const foundRfp = await getProcurementByIdAction(rfpId);
        if (ignore) return;
        setRfp(foundRfp);

        const state = await getProgressiveProcurementStateAction(rfpId);
        if (ignore) return;
        setProgState(state);
        if (state && state.currentStage) {
          setSelectedStage(state.currentStage);
        }
      } catch (err) {
        console.error("Failed to load progressive procurement detail:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    void fetchData();
    return () => {
      ignore = true;
    };
  }, [rfpId, reloadKey]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading Progressive Procurement RFP...
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Procurement RFP Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/procurement">Back to Procurements</Link>
        </Button>
      </div>
    );
  }

  const myStage1 = progState?.stage1Eligibility.find(
    (s) => s.isEligible
  );
  const anonymousBidderId = myStage1?.anonymousBidderId;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white mb-2">
          <Link href="/procurement">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Procurements
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                Progressive Procurement
              </Badge>
              <span className="text-xs font-mono text-gray-400">ID: {rfp.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{rfp.title}</h1>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">{rfp.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Badge className="bg-indigo-600 text-white font-mono text-xs px-3 py-1">
              Role: {userRole.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center text-xs font-medium text-gray-400 space-x-1.5">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Buyer Public Address</span>
          </div>
          <div className="text-white font-mono text-xs truncate">{rfp.buyerAddress}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center text-xs font-medium text-gray-400 space-x-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>Estimated Budget</span>
          </div>
          <div className="text-emerald-400 font-semibold text-sm">
            ${rfp.estimatedBudgetUsd ? rfp.estimatedBudgetUsd.toLocaleString() : "Undisclosed"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center text-xs font-medium text-gray-400 space-x-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Compact ZK Rule Commitment</span>
          </div>
          <div className="text-cyan-400 font-mono text-[11px] truncate">
            {rfp.compactRules.ruleCommitment}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center text-xs font-medium text-gray-400 space-x-1.5">
            <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
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
            onSubmissionComplete={handleReload}
          />
        )}

        {(selectedStage === "STAGE_2_TECHNICAL" || progState?.currentStage === "STAGE_2_TECHNICAL") && (
          <Stage2TechnicalCard
            rfp={rfp}
            userRole={userRole}
            eligibleSubmissions={progState?.stage1Eligibility || []}
            technicalSubmissions={progState?.stage2Technical || []}
            anonymousBidderId={anonymousBidderId}
            onUpdateSubmissions={handleReload}
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
            onUpdateSubmissions={handleReload}
          />
        )}

        {(selectedStage === "STAGE_4_LEGAL_REVEAL" || selectedStage === "COMPLETED" || progState?.currentStage === "STAGE_4_LEGAL_REVEAL" || progState?.currentStage === "COMPLETED") && (
          <Stage4LegalRevealCard
            rfp={rfp}
            userRole={userRole}
            winningAnonymousBidderId={progState?.winningAnonymousBidderId}
            legalReveal={progState?.stage4LegalReveal}
            onUpdateSubmissions={handleReload}
          />
        )}
      </div>
    </div>
  );
}
