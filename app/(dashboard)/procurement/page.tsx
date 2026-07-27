"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProcurementRfp } from "@/lib/types";
import { ProcurementStorage } from "@/storage/procurement-storage";
import { getProcurementsAction } from "@/actions/procurement-actions";
import { ProcurementCard } from "@/components/procurement/procurement-card";
import { Button } from "@/components/ui/button";
import { Plus, Cpu } from "lucide-react";

export default function ProcurementDashboardPage() {
  const [rfps, setRfps] = useState<ProcurementRfp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const serverData = await getProcurementsAction();
        const localData = ProcurementStorage.getProcurements();
        // Merge unique RFPs
        const map = new Map<string, ProcurementRfp>();
        localData.forEach((p) => map.set(p.id, p));
        serverData.forEach((p) => map.set(p.id, p));
        setRfps(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to load procurements:", err);
        setRfps(ProcurementStorage.getProcurements());
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono text-indigo-300 mb-2">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Midnight Compact ZK Rules</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Procurement RFPs & Tenders
          </h1>
          <p className="text-sm text-gray-400">
            Browse active confidential procurement requests, evaluation criteria, and ZK eligibility rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/procurement/create">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" /> Create Procurement RFP
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-12 text-center text-gray-400">
          Loading procurement RFPs...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Active Tenders ({rfps.length})</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {rfps.map((rfp) => (
              <ProcurementCard key={rfp.id} rfp={rfp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
