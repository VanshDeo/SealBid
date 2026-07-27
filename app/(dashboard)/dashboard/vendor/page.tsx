"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import { getVendorConfidentialSubmissionsAction } from "@/actions/procurement-actions";
import { ProcurementRfp, Stage1EligibilitySubmission, Stage2TechnicalSubmission, Stage3CommercialSubmission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Lock,
  CheckCircle2,
  ExternalLink,
  EyeOff,
} from "lucide-react";

interface SubmissionItem {
  procurement: ProcurementRfp;
  anonymousBidderId: string;
  stage1Status?: Stage1EligibilitySubmission;
  stage2Status?: Stage2TechnicalSubmission;
  stage3Status?: Stage3CommercialSubmission;
  isWinner: boolean;
}

export default function VendorDashboardPage() {
  const { session } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      if (!session.walletAddress) return;
      try {
        const res = await getVendorConfidentialSubmissionsAction(session.walletAddress);
        setSubmissions(res.submissions);
      } catch (err) {
        console.error("Failed to load vendor confidential submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, [session.walletAddress]);

  const vendorInfo = session.privateInfo?.role === "vendor" ? session.privateInfo : null;

  return (
    <RoleGuard allowedRoles={["vendor"]}>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              <Building2 className="h-3.5 w-3.5 text-purple-400" />
              <span>Vendor Confidential Submissions Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {vendorInfo?.businessName || session.profile?.displayName || "Vendor Business Entity"}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Monitor your anonymous ZK eligibility proofs, technical proposals, and sealed commercial bids. Competitors cannot view your bids or identity.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/vendor/profile">
              <Button variant="outline" className="border-indigo-500/40 text-indigo-300">
                🏢 Manage Encrypted Business Profile
              </Button>
            </Link>
            <Link href="/procurement">
              <Button variant="emerald" className="shadow-lg shadow-emerald-600/25">
                + Browse Open Procurement RFPs
              </Button>
            </Link>
          </div>
        </div>

        {/* Encrypted Vendor Credentials & Privacy Guarantee */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="glass-panel space-y-2 rounded-2xl border border-purple-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <span className="block text-xs font-semibold text-gray-400">Business Registration</span>
            <div className="text-lg font-bold text-white">
              {vendorInfo?.registrationNumber || "REG-DE-981273"}
            </div>
            <div className="font-mono text-xs text-purple-300">
              VAT: {vendorInfo?.vatId || "DE-304928174"}
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-cyan-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <span className="block text-xs font-semibold text-gray-400">
              Direct Settlement Target (Encrypted Off-Chain)
            </span>
            <div className="truncate font-mono text-xs text-cyan-300">
              {vendorInfo?.bankAccountIBAN || "DE89370400440532013000"}
            </div>
            <div className="text-[11px] text-gray-400">Selective Unlock for Winner Only</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-emerald-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <span className="block text-xs font-semibold text-gray-400">Privacy & Pseudonym Shield</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <EyeOff className="h-4 w-4 text-emerald-400" />
              <span>Competitor Masking Active</span>
            </div>
            <div className="text-[11px] text-gray-400">Non-winning bids remain sealed</div>
          </div>
        </div>

        {/* Confidential Submissions Monitor List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              <span>Your Progressive Tender Submissions ({submissions.length})</span>
            </h2>
            <Link href="/procurement" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              Explore Active RFPs →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading confidential submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center space-y-3">
              <p className="text-sm text-gray-400">You have not submitted proposals or commercial bids for any active tenders yet.</p>
              <Link href="/procurement">
                <Button variant="emerald" size="sm">
                  Browse Active RFPs
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <Card
                  key={sub.procurement.id}
                  className={`border transition-all bg-gray-900/60 backdrop-blur-xl ${
                    sub.isWinner
                      ? "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-950/20"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-cyan-400">{sub.procurement.sector}</span>
                          <span className="text-gray-600">•</span>
                          <span className="font-mono text-xs text-gray-400">ID: {sub.procurement.id}</span>
                        </div>
                        <h3 className="text-base font-bold text-white flex items-center space-x-2">
                          <span>{sub.procurement.title}</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.isWinner && <Badge variant="emerald">WINNING SUPPLIER</Badge>}
                        <Link href={`/procurement/${sub.procurement.id}`}>
                          <Button size="sm" variant="outline">
                            View Tender Details <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Anonymous Pseudonym & Progressive Stages Breakdown */}
                    <div className="rounded-xl bg-gray-950 p-4 border border-gray-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Your Anonymous Pseudonym</span>
                        <span className="text-cyan-300 font-bold">{sub.anonymousBidderId}</span>
                      </div>

                      <div>
                        <span className="text-gray-500 block text-[10px]">Stage 1 ZK Qualification</span>
                        {sub.stage1Status ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> VERIFIED
                          </span>
                        ) : (
                          <span className="text-gray-500">NOT VERIFIED</span>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-500 block text-[10px]">Stage 2 Technical Score</span>
                        {sub.stage2Status ? (
                          <span className="text-indigo-300 font-bold">
                            {sub.stage2Status.technicalScore ? `${sub.stage2Status.technicalScore} / 100` : "PASSED"}
                          </span>
                        ) : (
                          <span className="text-gray-500">PENDING EVAL</span>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-500 block text-[10px]">Stage 3 Sealed Price Offer</span>
                        {sub.stage3Status ? (
                          <span className="text-emerald-300 font-bold">
                            ${sub.stage3Status.bidAmountUsd.toLocaleString()} USD
                          </span>
                        ) : (
                          <span className="text-gray-500">NOT SUBMITTED</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
