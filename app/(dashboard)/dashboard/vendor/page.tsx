"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/providers/auth-provider";
import { getAuctionsAction } from "@/actions/auction-actions";
import { Auction } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function VendorDashboardPage() {
  const { session } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAuctionsAction();
        setAuctions(data);
      } catch (err) {
        console.error("Failed to load vendor auctions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const vendorInfo = session.privateInfo?.role === "vendor" ? session.privateInfo : null;

  return (
    <RoleGuard allowedRoles={["vendor"]}>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              <span>🏭</span> Vendor & Seller Management Portal
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {vendorInfo?.businessName || session.profile?.displayName || "Vendor Business"}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Create confidential auctions, configure reserve price thresholds, and verify
              zero-knowledge winning bids.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/vendor/profile">
              <Button variant="outline" className="border-indigo-500/40 text-indigo-300">
                🏢 Manage Business Profile
              </Button>
            </Link>
            <Link href="/auctions">
              <Button variant="primary" className="glow-primary">
                + Create New Confidential Auction
              </Button>
            </Link>
          </div>
        </div>

        {/* Encrypted Vendor Business Details Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="glass-panel space-y-2 rounded-2xl border border-purple-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">Business Registration</span>
            <div className="text-lg font-bold text-white">
              {vendorInfo?.registrationNumber || "REG-EU-981273"}
            </div>
            <div className="font-mono text-xs text-purple-300">
              VAT: {vendorInfo?.vatId || "VAT-EU-7788"}
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-purple-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">
              Settlement Bank IBAN (Encrypted Off-Chain)
            </span>
            <div className="truncate font-mono text-xs text-cyan-300">
              {vendorInfo?.bankAccountIBAN || "DE89370400440532013000"}
            </div>
            <div className="text-[11px] text-gray-400">Direct ZK Settlement Target</div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl border border-purple-500/20 p-5">
            <span className="block text-xs font-semibold text-gray-400">
              Compliance Certifications
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(vendorInfo?.complianceCertificates || ["ISO-27001", "Midnight ZK Verified"]).map(
                (cert) => (
                  <span
                    key={cert}
                    className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300"
                  >
                    {cert}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Hosted Auctions List */}
        <div className="glass-panel space-y-4 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Listed Auctions</h2>
            <span className="font-mono text-xs text-gray-400">Total Listed: {auctions.length}</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400">Loading vendor listings...</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {auctions.map((auction) => (
                <div
                  key={auction.id}
                  className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">{auction.title}</h3>
                    <p className="mt-0.5 text-xs text-gray-400">{auction.description}</p>
                    <div className="mt-2 flex items-center gap-3 font-mono text-xs text-gray-400">
                      <span>Reserve: {auction.reservePrice.toString()} tDUST</span>
                      <span>•</span>
                      <span>Sealed Bids: {auction.totalSealedBids}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-400 uppercase">
                        {auction.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/auctions/${auction.id}`}>
                      <Button variant="outline" size="sm">
                        Manage & Settle
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
