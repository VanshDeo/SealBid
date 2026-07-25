"use client";

import React, { useState } from "react";
import { ProcurementRfp, Stage4LegalReveal, VendorProfile } from "@/lib/types";
import { revealStage4WinningLegalDocAction } from "@/actions/procurement-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ShieldCheck, CheckCircle2, Lock, Building2, FileCheck, Mail, MapPin, CreditCard } from "lucide-react";

interface Stage4LegalRevealCardProps {
  rfp: ProcurementRfp;
  userRole: "buyer" | "vendor" | "auditor";
  winningAnonymousBidderId?: string;
  legalReveal?: Stage4LegalReveal;
  buyerWalletAddress?: string;
  onUpdateSubmissions: () => void;
}

export function Stage4LegalRevealCard({
  rfp,
  userRole,
  winningAnonymousBidderId,
  legalReveal,
  buyerWalletAddress = "mn_test1qqbuyer001x79093eamxvgspg8p3pwn5q963g6v",
  onUpdateSubmissions,
}: Stage4LegalRevealCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockWinnerProfile: VendorProfile = {
    companyName: "Aerospace Precision Dynamics Solutions GmbH",
    registrationNumber: "HRB-987452-DE",
    taxId: "DE-304928174",
    country: "Germany",
    businessAddress: "Technologiepark 14, 80331 Munich, Germany",
    contactPerson: "Dr. Klaus Obermeier",
    email: "klaus.obermeier@aerospace-precision.de",
    website: "https://aerospace-precision.de",
    certifications: [
      {
        id: "c1",
        name: "ISO 9001: Quality Management",
        issuer: "TÜV SÜD",
        issuedDate: "2023-01-15",
        expiryDate: "2027-01-15",
        documentHash: "0xhash_iso9001",
      },
      {
        id: "c2",
        name: "AS9100: Aerospace Quality",
        issuer: "DEKRA Certification",
        issuedDate: "2022-06-10",
        expiryDate: "2026-06-10",
        documentHash: "0xhash_as9100",
      },
    ],
    annualTurnoverUsd: 18_500_000,
    fiscalYear: "2025",
    auditedReportHash: "0xhash_audit_2025",
    facilitiesCount: 3,
    monthlyCapacity: "500 CNC Titanium Units",
    equipmentDetails: "5x 5-axis DMG Mori Titanium Mills",
    yearsExperience: 10,
    previousProjects: [],
  };

  const handleRevealWinnerLegalDoc = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await revealStage4WinningLegalDocAction({
        procurementId: rfp.id,
        buyerWalletAddress,
        winningVendorWalletAddress: "mn_test1qqvendor001x79093eamxvgspg8p3pwn5q963g6v",
        vendorProfile: mockWinnerProfile,
      });

      if (res.success) {
        onUpdateSubmissions();
      } else {
        setError(res.error || "Failed to reveal winning legal documentation.");
      }
    } catch (err) {
      setError("Error during selective legal reveal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900/60 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">Stage 4: Selective Winning Supplier Legal Disclosure</CardTitle>
          </div>
          <Badge variant="indigo">Winner Only</Badge>
        </div>
        <CardDescription className="text-xs text-gray-400 mt-1">
          Selectively decrypts legal documentation and corporate identity ONLY for the winning supplier. All non-winning bidders remain 100% anonymous.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Guarantees Box */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2 text-xs text-indigo-200">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Strict Selective Privacy Rule</span>
          </div>
          <p className="text-gray-300 text-[11px]">
            • <strong>Winning Supplier:</strong> Legal identity, registration #, tax ID, and IBAN revealed to buyer for contract execution.
            <br />• <strong>Non-Winning Suppliers:</strong> Identities, legal documents, and prices remain 100% confidential. Zero data leak.
          </p>
        </div>

        {!winningAnonymousBidderId && (
          <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
            Stage 4 unlocks after the buyer awards a winning bidder in Stage 3 Commercial Bids.
          </div>
        )}

        {winningAnonymousBidderId && !legalReveal && (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-mono block">Awarded Winner Anonymous Bidder ID:</span>
              <span className="text-lg font-mono font-bold text-cyan-300">{winningAnonymousBidderId}</span>
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}

            <Button
              type="button"
              variant="primary"
              isLoading={isLoading}
              onClick={handleRevealWinnerLegalDoc}
            >
              <Eye className="h-4 w-4 mr-2" /> Authorize Selective Legal Reveal for Winner
            </Button>
          </div>
        )}

        {/* Decrypted Winner Legal Documents */}
        {legalReveal && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/30 pb-3 gap-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  Decrypted Legal Document Payload (Winning Supplier Only)
                </span>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2 mt-0.5">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <span>{legalReveal.revealedLegalDoc.companyName}</span>
                </h3>
              </div>
              <Badge variant="emerald" className="self-start sm:self-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" /> LEGAL IDENTITY UNLOCKED
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-3 space-y-1">
                <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                  <FileCheck className="h-3 w-3 text-cyan-400" />
                  <span>Registration & Tax ID</span>
                </div>
                <div className="text-white font-bold">{legalReveal.revealedLegalDoc.registrationNumber}</div>
                <div className="text-indigo-300 text-[11px]">Tax ID: {legalReveal.revealedLegalDoc.taxId}</div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-3 space-y-1">
                <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-cyan-400" />
                  <span>Legal Contact & Representative</span>
                </div>
                <div className="text-white font-bold">{legalReveal.revealedLegalDoc.contactPerson}</div>
                <div className="text-indigo-300 text-[11px]">{legalReveal.revealedLegalDoc.email}</div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-3 space-y-1">
                <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-cyan-400" />
                  <span>Jurisdiction & Headquarters</span>
                </div>
                <div className="text-white font-bold">{legalReveal.revealedLegalDoc.country}</div>
                <div className="text-gray-300 text-[11px] truncate">{legalReveal.revealedLegalDoc.businessAddress}</div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-3 space-y-1">
                <div className="text-gray-500 text-[10px] flex items-center space-x-1">
                  <CreditCard className="h-3 w-3 text-cyan-400" />
                  <span>Bank IBAN Account (Contract Payments)</span>
                </div>
                <div className="text-emerald-300 font-bold">{legalReveal.revealedLegalDoc.bankAccountIBAN}</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-3 text-xs">
              <span className="text-gray-400 text-[11px] font-semibold block mb-1">
                Verified Compliance & Quality Certifications:
              </span>
              <div className="flex flex-wrap gap-2">
                {legalReveal.revealedLegalDoc.complianceCertificates.map((cert) => (
                  <Badge key={cert} variant="indigo">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
