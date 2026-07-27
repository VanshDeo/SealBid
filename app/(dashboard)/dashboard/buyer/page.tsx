"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import { getBuyerProcurementStatsAction } from "@/actions/procurement-actions";
import { ProcurementRfp } from "@/lib/types";
import { ProcurementCard } from "@/components/procurement/procurement-card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  PlusCircle,
  Lock,
  FileCheck,
  Building2,
  DollarSign,
} from "lucide-react";

export default function BuyerDashboardPage() {
  const { session } = useAuth();
  const [procurements, setProcurements] = useState<ProcurementRfp[]>([]);
  const [stats, setStats] = useState({
    activeProcurementsCount: 0,
    totalEstimatedBudgetUsd: 0,
    totalSealedBidsReceived: 0,
    completedProcurementsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getBuyerProcurementStatsAction(session.walletAddress || undefined);
        setProcurements(data.myProcurements);
        setStats({
          activeProcurementsCount: data.activeProcurementsCount,
          totalEstimatedBudgetUsd: data.totalEstimatedBudgetUsd,
          totalSealedBidsReceived: data.totalSealedBidsReceived,
          completedProcurementsCount: data.completedProcurementsCount,
        });
      } catch (err) {
        console.error("Failed to load buyer procurement dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session.walletAddress]);

  const buyerInfo = session.privateInfo?.role === "buyer" ? session.privateInfo : null;

  const filteredProcurements = procurements.filter((p) => {
    if (stageFilter === "ALL") return true;
    if (stageFilter === "OPEN") return p.status === "OPEN";
    if (stageFilter === "CLOSED") return p.status === "CLOSED";
    return true;
  });

  return (
    <RoleGuard allowedRoles={["buyer"]}>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
              <span>Buyer Procurement Control Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome, {session.profile?.displayName || "Procurement Officer"}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Manage multi-stage progressive RFPs, review ZK technical proposals, execute Compact commercial winner awards, and unlock winning supplier documentation.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/procurement/create">
              <Button variant="emerald" className="shadow-lg shadow-emerald-600/25">
                <PlusCircle className="h-4 w-4 mr-1.5" /> Create New Procurement RFP
              </Button>
            </Link>
            <Link href="/procurement">
              <Button variant="outline">Browse All Tenders</Button>
            </Link>
          </div>
        </div>

        {/* Procurement Metrics Summary Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="glass-panel space-y-2 rounded-2xl border border-indigo-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Active RFPs Managed</span>
              <Briefcase className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.activeProcurementsCount}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> OPEN FOR BIDDING
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-cyan-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Total Estimated Budget</span>
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300">
              ${stats.totalEstimatedBudgetUsd.toLocaleString()} <span className="text-xs text-gray-500 font-normal">USD</span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">Budget Allocation</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-emerald-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Sealed Bids Received</span>
              <Lock className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats.totalSealedBidsReceived}</div>
            <div className="text-[11px] text-emerald-300 font-mono">ZK Commercial Offers</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-purple-500/20 bg-gray-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Organization Entity</span>
              <Building2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white truncate">
              {buyerInfo?.companyName || "Defense Systems Corp"}
            </div>
            <div className="text-[11px] text-purple-300 font-mono">
              Tax ID: {buyerInfo?.taxId || "TAX-DE-981273"}
            </div>
          </div>
        </div>

        {/* Buyer Procurement Management Console */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-indigo-400" />
              <span>Your Procurement Tenders ({filteredProcurements.length})</span>
            </h2>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={stageFilter === "ALL" ? "primary" : "outline"}
                onClick={() => setStageFilter("ALL")}
              >
                All RFPs
              </Button>
              <Button
                size="sm"
                variant={stageFilter === "OPEN" ? "primary" : "outline"}
                onClick={() => setStageFilter("OPEN")}
              >
                Active Open
              </Button>
              <Button
                size="sm"
                variant={stageFilter === "CLOSED" ? "primary" : "outline"}
                onClick={() => setStageFilter("CLOSED")}
              >
                Completed
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading procurement tenders...</div>
          ) : filteredProcurements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center space-y-3">
              <p className="text-sm text-gray-400">No procurement tenders match your selected filter.</p>
              <Link href="/procurement/create">
                <Button variant="emerald" size="sm">
                  + Create Procurement RFP
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProcurements.map((rfp) => (
                <ProcurementCard key={rfp.id} rfp={rfp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
