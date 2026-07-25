"use client";

import React from "react";
import { ProgressiveStage } from "@/lib/types";
import { ShieldCheck, FileText, Lock, Eye, CheckCircle2 } from "lucide-react";

interface ProgressiveProcurementStepperProps {
  currentStage: ProgressiveStage;
  onSelectStage?: (stage: ProgressiveStage) => void;
}

export function ProgressiveProcurementStepper({
  currentStage,
  onSelectStage,
}: ProgressiveProcurementStepperProps) {
  const stages: {
    id: ProgressiveStage;
    number: number;
    title: string;
    description: string;
    privacyBadge: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "STAGE_1_ELIGIBILITY",
      number: 1,
      title: "Stage 1: Eligibility Verification",
      description: "ZK threshold check without identity disclosure",
      privacyBadge: "Identity Hidden",
      icon: ShieldCheck,
    },
    {
      id: "STAGE_2_TECHNICAL",
      number: 2,
      title: "Stage 2: Technical Proposals",
      description: "Confidential technical evaluation",
      privacyBadge: "Price Concealed",
      icon: FileText,
    },
    {
      id: "STAGE_3_COMMERCIAL",
      number: 3,
      title: "Stage 3: Commercial Bids",
      description: "Sealed pricing submission & award",
      privacyBadge: "Encrypted Pricing",
      icon: Lock,
    },
    {
      id: "STAGE_4_LEGAL_REVEAL",
      number: 4,
      title: "Stage 4: Winner Legal Reveal",
      description: "Selective winner legal disclosure",
      privacyBadge: "Winner Only",
      icon: Eye,
    },
  ];

  const getStageStatus = (stageId: ProgressiveStage) => {
    const stageOrder: ProgressiveStage[] = [
      "STAGE_1_ELIGIBILITY",
      "STAGE_2_TECHNICAL",
      "STAGE_3_COMMERCIAL",
      "STAGE_4_LEGAL_REVEAL",
      "COMPLETED",
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = stageOrder.indexOf(stageId);

    if (currentStage === "COMPLETED") return "completed";
    if (targetIndex < currentIndex) return "completed";
    if (targetIndex === currentIndex) return "active";
    return "upcoming";
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Progressive Procurement Architecture</span>
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              Confidential Multi-Stage
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Every stage strictly exposes only the minimum required information using Midnight ZK Proofs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;

          let cardStyle = "border-gray-800 bg-gray-950/40 text-gray-400";
          let badgeStyle = "bg-gray-800 text-gray-400 border-gray-700";
          let numberStyle = "bg-gray-800 text-gray-400";

          if (status === "active") {
            cardStyle =
              "border-indigo-500 bg-indigo-950/30 text-white shadow-lg ring-1 ring-indigo-500/50";
            badgeStyle = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
            numberStyle = "bg-indigo-600 text-white font-bold";
          } else if (status === "completed") {
            cardStyle = "border-emerald-500/50 bg-emerald-950/20 text-emerald-200";
            badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
            numberStyle = "bg-emerald-600 text-white";
          }

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage && onSelectStage(stage.id)}
              className={`rounded-xl border p-4 space-y-3 transition-all cursor-pointer hover:border-indigo-400 ${cardStyle}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${numberStyle}`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      stage.number
                    )}
                  </div>
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeStyle}`}
                >
                  {stage.privacyBadge}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-white line-clamp-1">{stage.title}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
