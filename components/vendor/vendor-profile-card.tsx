"use client";

import React, { useState } from "react";
import { VendorProfile, EncryptedVendorProfile } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Lock,
  Building2,
  ShieldCheck,
  DollarSign,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

interface VendorProfileCardProps {
  record: EncryptedVendorProfile | null;
  profile: VendorProfile | null;
  onClearStorage?: () => void;
}

export function VendorProfileCard({ record, profile, onClearStorage }: VendorProfileCardProps) {
  const [viewMode, setViewMode] = useState<"public" | "private">("public");

  if (!record) {
    return (
      <Card className="border-gray-800 bg-gray-900/40 py-12 text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 text-gray-400">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl text-white">No Registered Vendor Profile Found</CardTitle>
          <CardDescription className="mx-auto max-w-md text-gray-400">
            You have not created a confidential business profile yet. Register your company to
            participate in confidential tender auctions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="space-y-6 border-gray-800/80 bg-gray-900/60 shadow-2xl backdrop-blur-xl">
      {/* Header & Toggle */}
      <CardHeader className="flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white">
              {profile ? profile.companyName : "Confidential Vendor"}
            </h2>
            <Badge variant="emerald" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Verified On-Chain
            </Badge>
          </div>
          <p className="font-mono text-xs text-gray-400">
            Vendor ID: <span className="text-gray-200">{record.vendorId}</span>
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center self-start rounded-xl border border-gray-800 bg-gray-950 p-1 sm:self-auto">
          <button
            onClick={() => setViewMode("public")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "public"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Public Ledger State</span>
          </button>
          <button
            onClick={() => setViewMode("private")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "private"
                ? "bg-emerald-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Private Local Witness</span>
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* PUBLIC LEDGER STATE VIEW */}
        {viewMode === "public" ? (
          <div className="space-y-6">
            <div className="flex items-start space-x-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-xs text-indigo-200">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
              <div>
                <span className="font-semibold text-white">Midnight Ledger Visibility:</span> The
                public state contains zero raw financial figures, client project lists, or internal
                capacity details. Only cryptographic commitments and verification hashes are visible
                to public observers.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 font-mono text-xs md:grid-cols-2">
              <div className="space-y-1 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                <span className="block text-[11px] text-gray-400">Wallet Address</span>
                <span className="block truncate text-white">{record.walletAddress}</span>
              </div>
              <div className="space-y-1 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                <span className="block text-[11px] text-gray-400">Registration Timestamp</span>
                <span className="block text-white">
                  {new Date(record.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1 rounded-xl border border-gray-800 bg-gray-950/60 p-4 md:col-span-2">
                <span className="block text-[11px] text-indigo-400">
                  Profile Commitment Hash (SHA-256)
                </span>
                <span className="block truncate text-sm text-indigo-200">
                  {record.profileCommitment}
                </span>
              </div>
              <div className="space-y-1 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                <span className="block text-[11px] text-cyan-400">Turnover Commitment Hash</span>
                <span className="block truncate text-cyan-200">{record.turnoverHash}</span>
              </div>
              <div className="space-y-1 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                <span className="block text-[11px] text-teal-400">
                  Certifications Verified Hash
                </span>
                <span className="block truncate text-teal-200">{record.certificationsHash}</span>
              </div>
            </div>
          </div>
        ) : (
          /* PRIVATE LOCAL WITNESS VIEW */
          <div className="space-y-6">
            <div className="flex items-start space-x-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <span className="font-semibold text-white">Client-Side Decrypted View:</span> This
                information is stored in local client storage encrypted with AES-GCM 256. It is
                never sent in plaintext over the wire.
              </div>
            </div>

            {profile ? (
              <div className="space-y-6">
                {/* Section 1: Company Details */}
                <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-indigo-300">
                    <Building2 className="h-4 w-4" />
                    <span>Company Overview</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
                    <div>
                      <span className="block text-gray-400">Registration ID</span>
                      <span className="font-mono text-white">{profile.registrationNumber}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Tax ID / VAT</span>
                      <span className="font-mono text-white">{profile.taxId}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Country</span>
                      <span className="text-white">{profile.country}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Contact Person</span>
                      <span className="text-white">{profile.contactPerson}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-400">Corporate Email</span>
                      <span className="font-mono text-white">{profile.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-400">Website</span>
                      <span className="font-mono text-indigo-400">{profile.website}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Financials & Experience */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-cyan-300">
                      <DollarSign className="h-4 w-4" />
                      <span>Financial Turnover</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-white">
                      ${profile.annualTurnoverUsd.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        USD / Year ({profile.fiscalYear})
                      </span>
                    </div>
                    <p className="truncate font-mono text-[11px] text-gray-400">
                      Audited Hash: {profile.auditedReportHash}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-teal-300">
                      <Briefcase className="h-4 w-4" />
                      <span>Years of Experience</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-white">
                      {profile.yearsExperience}{" "}
                      <span className="text-xs font-normal text-gray-400">Years Operational</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Facilities: {profile.facilitiesCount} Factories ({profile.monthlyCapacity})
                    </p>
                  </div>
                </div>

                {/* Section 3: Certifications */}
                <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Certifications ({profile.certifications.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {profile.certifications.map((c) => (
                      <div
                        key={c.id}
                        className="space-y-1 rounded-lg border border-gray-800 bg-gray-900/60 p-3 text-xs"
                      >
                        <span className="block font-semibold text-white">{c.name}</span>
                        <div className="flex justify-between text-gray-400">
                          <span>Issuer: {c.issuer}</span>
                          <span>Expires: {c.expiryDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Previous Projects */}
                <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-amber-300">
                    <Briefcase className="h-4 w-4" />
                    <span>Representative Projects ({profile.previousProjects.length})</span>
                  </div>
                  <div className="space-y-2">
                    {profile.previousProjects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/60 p-3 text-xs"
                      >
                        <div>
                          <span className="block font-semibold text-white">{p.title}</span>
                          <span className="text-[11px] text-gray-400">
                            Sector: {p.clientIndustry} ({p.completionYear})
                          </span>
                        </div>
                        <div className="font-mono font-bold text-emerald-400">
                          ${p.contractValueUsd.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Decrypted profile unavailable.</p>
            )}
          </div>
        )}
      </CardContent>

      {onClearStorage && (
        <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
          <Button variant="danger" size="sm" onClick={onClearStorage}>
            Clear Stored Encrypted Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
