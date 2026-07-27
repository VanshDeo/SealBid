"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ProcurementRfp,
  BiddingStage,
  CompactEligibilityRules,
} from "@/lib/types";
import { VENDOR_CERTIFICATION_TYPES, BIDDING_STAGES } from "@/lib/constants";
import { generateCompactEligibilityRules } from "@/lib/compact-rule-generator";
import { createProcurementAction } from "@/actions/procurement-actions";
import { ProcurementStorage } from "@/storage/procurement-storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompactRuleGeneratorCard } from "./compact-rule-generator-card";
import {
  FileText,
  Scale,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export function ProcurementCreationWizard({ buyerAddress }: { buyerAddress?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRfp, setSuccessRfp] = useState<ProcurementRfp | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: General Info
  const [title, setTitle] = useState("High-Precision Aerospace Actuators Procurement");
  const [description, setDescription] = useState(
    "Tender for manufacturing and delivery of 5-axis CNC titanium precision actuators with strict ISO 9001 and AS9100 quality assurance."
  );
  const [sector, setSector] = useState("Aerospace & Defense");
  const [estimatedBudgetUsd, setEstimatedBudgetUsd] = useState<number>(12_000_000);

  // Step 2: Evaluation Criteria & Terms
  const [technicalWeight, setTechnicalWeight] = useState<number>(40);
  const [financialWeight, setFinancialWeight] = useState<number>(40);
  const [qualityWeight, setQualityWeight] = useState<number>(20);
  const [scoringMethod, setScoringMethod] = useState("Most Economically Advantageous Tender (MEAT)");

  const [paymentTerms, setPaymentTerms] = useState("30% Advance, 70% Net 30 Post-Delivery");
  const [deliveryDays, setDeliveryDays] = useState<number>(90);
  const [warrantyYears, setWarrantyYears] = useState<number>(3);
  const [penaltyClause, setPenaltyClause] = useState("0.5% Per Day Delay (Max 10% Contract Value)");

  // Step 3: Required Credentials & Thresholds
  const [minTurnoverUsd, setMinTurnoverUsd] = useState<number>(10_000_000);
  const [minExperienceYears, setMinExperienceYears] = useState<number>(5);
  const [minFacilitiesCount, setMinFacilitiesCount] = useState<number>(2);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([
    "ISO 9001: Quality Management",
    "AS9100: Aerospace Quality",
  ]);

  // Step 4: Deadlines & Bidding Stage
  const [qualificationDate, setQualificationDate] = useState(() =>
    new Date(Date.now() + 86400 * 5 * 1000).toISOString().slice(0, 10)
  );
  const [biddingDate, setBiddingDate] = useState(() =>
    new Date(Date.now() + 86400 * 10 * 1000).toISOString().slice(0, 10)
  );
  const [revealDate, setRevealDate] = useState(() =>
    new Date(Date.now() + 86400 * 12 * 1000).toISOString().slice(0, 10)
  );
  const [awardDate, setAwardDate] = useState(() =>
    new Date(Date.now() + 86400 * 15 * 1000).toISOString().slice(0, 10)
  );
  const [biddingStage, setBiddingStage] = useState<BiddingStage>("TWO_STAGE_QUALIFICATION");

  // Step 5: Generated Compact Rules State
  const [compactRules, setCompactRules] = useState<CompactEligibilityRules | null>(null);

  // Live Rule Generation
  useEffect(() => {
    async function updateRules() {
      const generated = await generateCompactEligibilityRules(
        title,
        minTurnoverUsd,
        minExperienceYears,
        selectedCerts
      );
      setCompactRules(generated);
    }
    updateRules();
  }, [title, minTurnoverUsd, minExperienceYears, selectedCerts]);

  const toggleCert = (cert: string) => {
    if (selectedCerts.includes(cert)) {
      setSelectedCerts(selectedCerts.filter((c) => c !== cert));
    } else {
      setSelectedCerts([...selectedCerts, cert]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const activeBuyer = buyerAddress || "mn_test1qqbuyer001x79093eamxvgspg8p3pwn5q963g6v";

    const payload = {
      title,
      description,
      buyerAddress: activeBuyer,
      sector,
      estimatedBudgetUsd: Number(estimatedBudgetUsd),
      evaluationCriteria: {
        technicalScoreWeight: Number(technicalWeight),
        financialPriceWeight: Number(financialWeight),
        qualityScoreWeight: Number(qualityWeight),
        scoringMethod,
      },
      eligibilityThresholds: {
        minTurnoverUsd: Number(minTurnoverUsd),
        minExperienceYears: Number(minExperienceYears),
        minFacilitiesCount: Number(minFacilitiesCount),
        requiredCertifications: selectedCerts,
      },
      deadlines: {
        qualificationDeadline: new Date(qualificationDate).toISOString(),
        biddingDeadline: new Date(biddingDate).toISOString(),
        revealDeadline: new Date(revealDate).toISOString(),
        awardDate: new Date(awardDate).toISOString(),
      },
      biddingStage,
      contractTerms: {
        paymentTerms,
        deliveryTimelineDays: Number(deliveryDays),
        warrantyYears: Number(warrantyYears),
        penaltyClause,
      },
    };

    try {
      const res = await createProcurementAction(payload);
      if (res.success && res.rfp) {
        await ProcurementStorage.saveProcurement(res.rfp);
        setSuccessRfp(res.rfp);
      } else {
        setError(res.error || "Failed to create procurement RFP.");
      }
    } catch (err) {
      console.error("Procurement creation error:", err);
      setError("An unexpected error occurred during RFP compilation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successRfp) {
    return (
      <Card className="mx-auto max-w-3xl border-indigo-500/30 bg-gray-950/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl text-white">Procurement RFP Created & Compact Rules Compiled!</CardTitle>
          <CardDescription className="text-indigo-200/80">
            Compact ZK eligibility predicate rules published on Midnight ledger. Vendors can now execute ZK proofs to verify qualification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/10 p-4 font-mono text-xs space-y-2">
            <div className="flex justify-between text-indigo-300">
              <span className="text-gray-400">RFP ID:</span>
              <span>{successRfp.id}</span>
            </div>
            <div className="flex justify-between text-indigo-300">
              <span className="text-gray-400">Title:</span>
              <span className="truncate max-w-xs">{successRfp.title}</span>
            </div>
            <div className="flex justify-between text-indigo-300">
              <span className="text-gray-400">Estimated Budget:</span>
              <span>${successRfp.estimatedBudgetUsd.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-indigo-300 truncate">
              <span className="text-gray-400">Rule Commitment Hash:</span>
              <span className="truncate max-w-xs text-cyan-300">{successRfp.compactRules.ruleCommitmentHash}</span>
            </div>
            <div className="flex justify-between text-indigo-300 truncate">
              <span className="text-gray-400">Predicate Expression Hash:</span>
              <span className="truncate max-w-xs text-teal-300">{successRfp.compactRules.predicateHash}</span>
            </div>
          </div>

          {compactRules && <CompactRuleGeneratorCard rules={compactRules} />}
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => setSuccessRfp(null)}>
            Create Another RFP
          </Button>
          <Button variant="primary" onClick={() => router.push("/procurement")}>
            View Active Procurements <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono text-indigo-300">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span>Midnight ZK Procurement Engine</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create Procurement RFP
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Define tender specifications, evaluation criteria, and eligibility thresholds. Compact circuits compile rules automatically.
        </p>
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { id: 1, label: "General Info", icon: FileText },
          { id: 2, label: "Criteria & Terms", icon: Scale },
          { id: 3, label: "Thresholds", icon: ShieldCheck },
          { id: 4, label: "Deadlines & Stage", icon: Calendar },
          { id: 5, label: "Compact ZK Rules", icon: Cpu },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center justify-center space-x-2 rounded-xl p-3 text-xs font-medium transition-all ${
                isActive
                  ? "border border-indigo-500 bg-indigo-600/30 text-white shadow-lg shadow-indigo-500/20"
                  : isDone
                  ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-400"
                  : "border border-gray-800 bg-gray-900/50 text-gray-400 hover:bg-gray-800/80"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : isDone ? "text-emerald-400" : "text-gray-500"}`} />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <Card className="border-gray-800/80 bg-gray-900/60 shadow-2xl backdrop-blur-xl">
          {/* STEP 1: General Info */}
          {step === 1 && (
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-800">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">General Procurement Specifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Procurement Title *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Detailed Description & Scope of Work *</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-gray-800 bg-gray-950/60 p-3 text-sm text-gray-200 focus:border-indigo-500 focus:outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Industry Sector *</label>
                  <Input value={sector} onChange={(e) => setSector(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Estimated Budget Ceiling (USD) *</label>
                  <Input
                    type="number"
                    value={estimatedBudgetUsd}
                    onChange={(e) => setEstimatedBudgetUsd(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 2: Evaluation Criteria & Terms */}
          {step === 2 && (
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-800">
                <Scale className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Evaluation Criteria & Contract Terms</h3>
              </div>

              {/* Weight Distribution */}
              <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 space-y-4">
                <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Evaluation Scoring Weightage (Must sum to 100%)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Technical Score Weight (%)</label>
                    <Input
                      type="number"
                      value={technicalWeight}
                      onChange={(e) => setTechnicalWeight(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Financial Price Weight (%)</label>
                    <Input
                      type="number"
                      value={financialWeight}
                      onChange={(e) => setFinancialWeight(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Quality Score Weight (%)</label>
                    <Input
                      type="number"
                      value={qualityWeight}
                      onChange={(e) => setQualityWeight(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Scoring Methodology</label>
                  <Input value={scoringMethod} onChange={(e) => setScoringMethod(e.target.value)} />
                </div>
              </div>

              {/* Contract Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Payment Structure Terms</label>
                  <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Max Delivery Schedule (Days)</label>
                  <Input
                    type="number"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Warranty Period (Years)</label>
                  <Input
                    type="number"
                    value={warrantyYears}
                    onChange={(e) => setWarrantyYears(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Delay Penalty Clause</label>
                  <Input value={penaltyClause} onChange={(e) => setPenaltyClause(e.target.value)} />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 3: Required Credentials & Thresholds */}
          {step === 3 && (
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-800">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Vendor Eligibility Thresholds</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Min Annual Turnover (USD) *</label>
                  <Input
                    type="number"
                    value={minTurnoverUsd}
                    onChange={(e) => setMinTurnoverUsd(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Min Operating Experience (Years) *</label>
                  <Input
                    type="number"
                    value={minExperienceYears}
                    onChange={(e) => setMinExperienceYears(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Min Facilities Count</label>
                  <Input
                    type="number"
                    value={minFacilitiesCount}
                    onChange={(e) => setMinFacilitiesCount(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Required Certifications Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Mandatory Accreditation Certifications
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VENDOR_CERTIFICATION_TYPES.map((cert) => {
                    const isChecked = selectedCerts.includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => toggleCert(cert)}
                        className={`flex items-center space-x-3 rounded-xl p-3 text-xs font-medium text-left transition-all ${
                          isChecked
                            ? "border border-indigo-500 bg-indigo-600/20 text-white"
                            : "border border-gray-800 bg-gray-950/40 text-gray-400 hover:bg-gray-900/60"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            isChecked
                              ? "border-indigo-500 bg-indigo-600 text-white"
                              : "border-gray-700 bg-gray-900"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span>{cert}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 4: Deadlines & Bidding Stage */}
          {step === 4 && (
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-800">
                <Calendar className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Deadlines & Bidding Stage Workflow</h3>
              </div>

              {/* Bidding Stage Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Select Bidding Stage Architecture
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BIDDING_STAGES.map((s) => {
                    const isSelected = biddingStage === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setBiddingStage(s.id as BiddingStage)}
                        className={`rounded-xl p-4 text-left border transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-500/20"
                            : "border-gray-800 bg-gray-950/40 text-gray-400 hover:bg-gray-900/60"
                        }`}
                      >
                        <span className="font-bold text-sm block text-white">{s.label}</span>
                        <span className="text-xs text-gray-400 block mt-1">{s.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Qualification / EOI Deadline</label>
                  <Input type="date" value={qualificationDate} onChange={(e) => setQualificationDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Sealed Bid Submission Deadline</label>
                  <Input type="date" value={biddingDate} onChange={(e) => setBiddingDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Bid Reveal Window End</label>
                  <Input type="date" value={revealDate} onChange={(e) => setRevealDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Final Award & Settlement Date</label>
                  <Input type="date" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 5: Compact ZK Rules Preview */}
          {step === 5 && (
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-800">
                <Cpu className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Compiled Midnight Compact Circuit Rules</h3>
              </div>
              {compactRules && <CompactRuleGeneratorCard rules={compactRules} title={title} minTurnoverUsd={minTurnoverUsd} minExperienceYears={minExperienceYears} />}
            </CardContent>
          )}

          {error && (
            <div className="px-6 py-2 text-xs text-red-400 bg-red-950/30 border-t border-b border-red-500/20">
              {error}
            </div>
          )}

          {/* Card Footer Actions */}
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button type="button" variant="primary" onClick={() => setStep(step + 1)}>
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Sparkles className="h-4 w-4" /> Publish Procurement RFP & Compact Rules
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
