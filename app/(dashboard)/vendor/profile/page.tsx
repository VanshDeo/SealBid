"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { EncryptedVendorProfile, VendorProfile } from "@/lib/types";
import { encryptedVendorStorage } from "@/storage/vendor-storage";
import { VendorProfileCard } from "@/components/vendor/vendor-profile-card";
import { VendorQualificationTester } from "@/components/vendor/vendor-qualification-tester";
import { Button } from "@/components/ui/button";
import { Building2, Plus, ShieldCheck, ArrowRight } from "lucide-react";

export default function VendorProfilePage() {
  const [record, setRecord] = useState<EncryptedVendorProfile | null>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    const res = await encryptedVendorStorage.getVendorProfile();
    setRecord(res.record);
    setProfile(res.profile);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      loadProfile();
    }, 0);
  }, []);

  const handleClear = async () => {
    await encryptedVendorStorage.clearStorage();
    setRecord(null);
    setProfile(null);
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Encrypted Off-Chain Storage</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Vendor Business Profile
          </h1>
          <p className="text-sm text-gray-400">
            Inspect public ledger state vs. private witness and execute zero-knowledge qualification
            proofs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/vendor/register">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" /> {record ? "Update Profile" : "Register Vendor"}
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-12 text-center text-gray-400">
          Loading confidential vendor profile...
        </div>
      ) : (
        <div className="space-y-8">
          <VendorProfileCard record={record} profile={profile} onClearStorage={handleClear} />

          {record && (
            <VendorQualificationTester
              vendorId={record.vendorId}
              actualTurnoverUsd={profile?.annualTurnoverUsd || 12_500_000}
              actualExperienceYears={profile?.yearsExperience || 12}
            />
          )}
        </div>
      )}
    </div>
  );
}
