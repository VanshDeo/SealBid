"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import { getAuctionsAction } from "@/actions/auction-actions";
import { Auction } from "@/lib/types";
import { AuctionCard } from "@/components/auction/auction-card";
import { Button } from "@/components/ui/button";

export default function BuyerDashboardPage() {
  const { session } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAuctionsAction();
        setAuctions(data);
      } catch (err) {
        console.error("Failed to load auctions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const buyerInfo = session.privateInfo?.role === "buyer" ? session.privateInfo : null;

  return (
    <RoleGuard allowedRoles={["buyer"]}>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <span>🛒</span> Buyer Procurement Portal
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome, {session.profile?.displayName || "Procurement Officer"}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Submit confidential zero-knowledge bids without disclosing private bid amounts
              on-chain.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/procurement/create">
              <Button variant="primary" className="glow-primary">
                + Create Procurement RFP
              </Button>
            </Link>
            <Link href="/my-bids">
              <Button variant="outline">View My Sealed Bids</Button>
            </Link>
            <Link href="/auctions">
              <Button variant="outline">Explore Auctions</Button>
            </Link>
          </div>

        </div>

        {/* Procurement Summary & Business Details (Encrypted Off-Chain) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="glass-panel space-y-2 rounded-2xl border border-cyan-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">
              Company Entity (Off-Chain)
            </span>
            <div className="text-lg font-bold text-white">
              {buyerInfo?.companyName || "Acme Procurement Corp"}
            </div>
            <div className="font-mono text-xs text-cyan-300">
              Tax ID: {buyerInfo?.taxId || "TAX-PRIV-8899"}
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-cyan-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">
              Annual Procurement Budget
            </span>
            <div className="text-lg font-bold text-cyan-400">
              {buyerInfo?.annualProcurementBudget || "$5,000,000 DUST"}
            </div>
            <div className="text-xs text-gray-400">Encrypted AES-GCM Storage</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-cyan-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">ZK Witness Security</span>
            <div className="flex items-center gap-1 text-lg font-bold text-emerald-400">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" /> Local
              Client Witness
            </div>
            <div className="text-xs text-gray-400">Bid salts kept on browser</div>
          </div>
        </div>

        {/* Active Bidding Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Sealed-Bid Auctions</h2>
            <Link
              href="/auctions"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Browse All →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading auction listings...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {auctions.slice(0, 3).map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
