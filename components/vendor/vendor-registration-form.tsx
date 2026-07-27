"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  VendorProfile,
  VendorCertification,
  PreviousProject,
  EncryptedVendorProfile,
} from "@/lib/types";
import { encryptedVendorStorage, sha256Hex } from "@/storage/vendor-storage";
import { registerVendorAction } from "@/actions/vendor-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ShieldCheck,
  DollarSign,
  Factory,
  Briefcase,
  Lock,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCode2,
} from "lucide-react";

export function VendorRegistrationForm({ walletAddress }: { walletAddress?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<EncryptedVendorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState("Acme Precision Manufacturing Ltd.");
  const [registrationNumber, setRegistrationNumber] = useState("REG-2024-884920");
  const [taxId, setTaxId] = useState("US-993847291");
  const [country, setCountry] = useState("United States");
  const [businessAddress, setBusinessAddress] = useState(
    "100 Industrial Parkway, Austin, TX 78701"
  );
  const [contactPerson, setContactPerson] = useState("Elena Rostova");
  const [email, setEmail] = useState("elena.rostova@acmeprecision.io");
  const [website, setWebsite] = useState("https://acmeprecision.io");

  // Certifications
  const [certifications, setCertifications] = useState<VendorCertification[]>([
    {
      id: "cert_1",
      name: "ISO 9001: Quality Management",
      issuer: "TÜV SÜD",
      issuedDate: "2023-01-15",
      expiryDate: "2026-01-15",
      documentHash: "0x9f8e7d6c5b4a32109f8e7d6c5b4a32109f8e7d6c5b4a3210",
    },
    {
      id: "cert_2",
      name: "ISO 27001: Information Security",
      issuer: "BSI Group",
      issuedDate: "2023-06-10",
      expiryDate: "2026-06-10",
      documentHash: "0xa1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890",
    },
  ]);

  // Financials
  const [annualTurnoverUsd, setAnnualTurnoverUsd] = useState<number>(12_500_000);
  const [fiscalYear, setFiscalYear] = useState("2024");
  const [auditedReportHash, setAuditedReportHash] = useState(
    "0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a"
  );

  // Capability & Experience
  const [facilitiesCount, setFacilitiesCount] = useState<number>(3);
  const [monthlyCapacity, setMonthlyCapacity] = useState("50,000 Precision Units / Month");
  const [equipmentDetails, setEquipmentDetails] = useState(
    "5-Axis CNC Milling Machines, Robotic Laser Welding, Automated Optical Inspection (AOI)"
  );
  const [yearsExperience, setYearsExperience] = useState<number>(12);

  // Projects
  const [previousProjects, setPreviousProjects] = useState<PreviousProject[]>([
    {
      id: "proj_1",
      title: "Defense Sector Aerospace Components Supply",
      clientIndustry: "Aerospace & Defense",
      contractValueUsd: 4_200_000,
      completionYear: 2024,
      referenceHash: "0x8f7e6d5c4b3a21098f7e6d5c4b3a21098f7e6d5c",
    },
  ]);

  // Live Commitments State
  const [commitments, setCommitments] = useState({
    profileCommitment: "Calculating...",
    turnoverHash: "Calculating...",
    certificationsHash: "Calculating...",
  });

  // Calculate commitments dynamically
  useEffect(() => {
    async function updateHashes() {
      const salt = "sealbid_salt";
      const profileHash = await sha256Hex(`${companyName}:${registrationNumber}:${salt}`);
      const turnHash = await sha256Hex(`${annualTurnoverUsd}:${fiscalYear}:${salt}`);
      const certStr = certifications.map((c) => c.documentHash).join(":");
      const cHash = await sha256Hex(`${certStr}:${salt}`);

      setCommitments({
        profileCommitment: `0x${profileHash}`,
        turnoverHash: `0x${turnHash}`,
        certificationsHash: `0x${cHash}`,
      });
    }
    updateHashes();
  }, [companyName, registrationNumber, annualTurnoverUsd, fiscalYear, certifications]);

  const addCertification = () => {
    const newCert: VendorCertification = {
      id: `cert_${Date.now()}`,
      name: "ISO 14001: Environmental Management",
      issuer: "DNV GL",
      issuedDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 86400 * 365 * 3 * 1000).toISOString().slice(0, 10),
      documentHash: `0x${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    };
    setCertifications([...certifications, newCert]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const addProject = () => {
    const newProj: PreviousProject = {
      id: `proj_${Date.now()}`,
      title: "Automotive Precision Gear Assemblies",
      clientIndustry: "Automotive",
      contractValueUsd: 1_800_000,
      completionYear: 2023,
      referenceHash: `0x${Math.random().toString(36).slice(2)}`,
    };
    setPreviousProjects([...previousProjects, newProj]);
  };

  const removeProject = (id: string) => {
    setPreviousProjects(previousProjects.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const activeWallet = walletAddress || "mn_test1qqvendor001x79093eamxvgspg8p3pwn5q963g6v";

    const profile: VendorProfile = {
      companyName,
      registrationNumber,
      taxId,
      country,
      businessAddress,
      contactPerson,
      email,
      website,
      certifications,
      annualTurnoverUsd: Number(annualTurnoverUsd),
      fiscalYear,
      auditedReportHash,
      facilitiesCount: Number(facilitiesCount),
      monthlyCapacity,
      equipmentDetails,
      yearsExperience: Number(yearsExperience),
      previousProjects,
    };

    try {
      const vendorId = `vendor_${Date.now()}`;
      // 1. Off-chain Client-side Encryption & Storage
      const encryptedRecord = await encryptedVendorStorage.saveVendorProfile(
        vendorId,
        activeWallet,
        profile
      );

      // 2. Server Action for Midnight Compact Commitment
      const actionRes = await registerVendorAction({
        walletAddress: activeWallet,
        profile,
      });

      if (actionRes.success && encryptedRecord) {
        setSuccessResult(encryptedRecord);
      } else {
        setError(actionRes.error || "Failed to submit vendor registration.");
      }
    } catch (err) {
      console.error("Vendor registration error:", err);
      setError("An unexpected error occurred during profile encryption.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <Card className="mx-auto max-w-3xl border-emerald-500/30 bg-emerald-950/20 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl text-white">Vendor Business Profile Registered!</CardTitle>
          <CardDescription className="text-emerald-200/80">
            Sensitive business data encrypted client-side (AES-GCM 256). Cryptographic commitments
            published on Midnight ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-4 font-mono text-xs">
            <div className="flex justify-between text-emerald-300">
              <span className="text-gray-400">Vendor ID:</span>
              <span>{successResult.vendorId}</span>
            </div>
            <div className="flex justify-between truncate text-emerald-300">
              <span className="text-gray-400">Wallet Address:</span>
              <span className="max-w-xs truncate">{successResult.walletAddress}</span>
            </div>
            <div className="flex justify-between truncate text-emerald-300">
              <span className="text-gray-400">Profile Commitment Hash:</span>
              <span className="max-w-xs truncate text-indigo-300">
                {successResult.profileCommitment}
              </span>
            </div>
            <div className="flex justify-between truncate text-emerald-300">
              <span className="text-gray-400">Turnover Commitment Hash:</span>
              <span className="max-w-xs truncate text-cyan-300">{successResult.turnoverHash}</span>
            </div>
            <div className="flex justify-between truncate text-emerald-300">
              <span className="text-gray-400">Certifications Hash:</span>
              <span className="max-w-xs truncate text-teal-300">
                {successResult.certificationsHash}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-xs text-indigo-200">
            <Lock className="h-5 w-5 shrink-0 text-indigo-400" />
            <div>
              <span className="font-semibold text-white">Off-Chain Privacy Enforced:</span> Raw
              financial turnover, manufacturing specs, and client projects remain 100% encrypted
              off-chain.
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => setSuccessResult(null)}>
            Register Another Profile
          </Button>
          <Button variant="primary" onClick={() => router.push("/vendor/profile")}>
            View Encrypted Vendor Profile <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header & Step Bar */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>Confidential ZK Business Profile</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Vendor Registration
        </h1>
        <p className="mx-auto max-w-xl text-sm text-gray-400">
          Create a verifiable business profile. Sensitive info is encrypted client-side; Compact
          contracts store only cryptographic commitments.
        </p>
      </div>

      {/* Step Progress Pills */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { id: 1, label: "Company", icon: Building2 },
          { id: 2, label: "Certifications", icon: ShieldCheck },
          { id: 3, label: "Turnover", icon: DollarSign },
          { id: 4, label: "Capability", icon: Factory },
          { id: 5, label: "Projects", icon: Briefcase },
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
              <Icon
                className={`h-4 w-4 ${isActive ? "text-indigo-400" : isDone ? "text-emerald-400" : "text-gray-500"}`}
              />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Compact Commitment Bar */}
      <div className="rounded-xl border border-indigo-500/20 bg-gray-900/80 p-4 backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-mono text-indigo-300">
            <FileCode2 className="h-4 w-4 text-indigo-400" />
            <span>Compact Smart Contract Commitment Preview</span>
          </div>
          <Badge variant="indigo">Live ZK Witness</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 font-mono text-[11px] md:grid-cols-3">
          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2.5">
            <span className="block text-[10px] text-gray-400">Profile Commitment:</span>
            <span className="block truncate text-indigo-400">{commitments.profileCommitment}</span>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2.5">
            <span className="block text-[10px] text-gray-400">Min Turnover Hash:</span>
            <span className="block truncate text-cyan-400">{commitments.turnoverHash}</span>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-2.5">
            <span className="block text-[10px] text-gray-400">Certifications Hash:</span>
            <span className="block truncate text-teal-400">{commitments.certificationsHash}</span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit}>
        <Card className="border-gray-800/80 bg-gray-900/60 shadow-2xl backdrop-blur-xl">
          {/* STEP 1: Company Info */}
          {step === 1 && (
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center space-x-3 border-b border-gray-800 pb-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Company Information</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Company Legal Name *
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Registration / Incorporation ID *
                  </label>
                  <Input
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Tax ID / VAT Number
                  </label>
                  <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Country of Registration *
                  </label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Business Address *
                  </label>
                  <Input
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Primary Contact Person *
                  </label>
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Corporate Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Corporate Website
                  </label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 2: Certifications */}
          {step === 2 && (
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Quality & Industry Certifications
                  </h3>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addCertification}>
                  <Plus className="h-4 w-4" /> Add Cert
                </Button>
              </div>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div
                    key={cert.id}
                    className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-indigo-300">
                        Certification #{index + 1}
                      </span>
                      {certifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCertification(cert.id)}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">
                          Standard / Certification Name
                        </label>
                        <Input
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[index].name = e.target.value;
                            setCertifications(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">
                          Issuing Accreditation Body
                        </label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[index].issuer = e.target.value;
                            setCertifications(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Issue Date</label>
                        <Input
                          type="date"
                          value={cert.issuedDate}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[index].issuedDate = e.target.value;
                            setCertifications(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Expiry Date</label>
                        <Input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[index].expiryDate = e.target.value;
                            setCertifications(updated);
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs text-gray-400">
                          Verification Document Hash (SHA-256)
                        </label>
                        <Input
                          className="font-mono text-xs"
                          value={cert.documentHash}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[index].documentHash = e.target.value;
                            setCertifications(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}

          {/* STEP 3: Financial Turnover */}
          {step === 3 && (
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center space-x-3 border-b border-gray-800 pb-2">
                <DollarSign className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">
                  Financial Turnover & Audit Proof
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Annual Turnover (USD) *
                  </label>
                  <Input
                    type="number"
                    value={annualTurnoverUsd}
                    onChange={(e) => setAnnualTurnoverUsd(Number(e.target.value))}
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Raw dollar amount stays confidential. ZK proof validates thresholds.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Fiscal Reporting Year *
                  </label>
                  <Input
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Audited Financial Report Cryptographic Hash *
                  </label>
                  <Input
                    className="font-mono text-xs"
                    value={auditedReportHash}
                    onChange={(e) => setAuditedReportHash(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Hash of audited balance sheet provided by accredited auditor.
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 4: Manufacturing Capability */}
          {step === 4 && (
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center space-x-3 border-b border-gray-800 pb-2">
                <Factory className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">
                  Manufacturing Capability & Operations
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Operational Facilities Count
                  </label>
                  <Input
                    type="number"
                    value={facilitiesCount}
                    onChange={(e) => setFacilitiesCount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Monthly Production Capacity
                  </label>
                  <Input
                    value={monthlyCapacity}
                    onChange={(e) => setMonthlyCapacity(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-300">
                    Major Equipment & Machinery Specs
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-gray-800 bg-gray-950/60 p-3 text-sm text-gray-200 focus:border-indigo-500 focus:outline-none"
                    value={equipmentDetails}
                    onChange={(e) => setEquipmentDetails(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 5: Experience & Projects */}
          {step === 5 && (
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Industry Experience & Past Projects
                  </h3>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addProject}>
                  <Plus className="h-4 w-4" /> Add Project
                </Button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-300">
                  Years of Industry Experience *
                </label>
                <Input
                  type="number"
                  className="max-w-xs"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Representative Projects
                </h4>
                {previousProjects.map((proj, index) => (
                  <div
                    key={proj.id}
                    className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-cyan-300">
                        Project #{index + 1}
                      </span>
                      {previousProjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProject(proj.id)}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Project Title</label>
                        <Input
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...previousProjects];
                            updated[index].title = e.target.value;
                            setPreviousProjects(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">
                          Client Industry Sector
                        </label>
                        <Input
                          value={proj.clientIndustry}
                          onChange={(e) => {
                            const updated = [...previousProjects];
                            updated[index].clientIndustry = e.target.value;
                            setPreviousProjects(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">
                          Contract Value (USD)
                        </label>
                        <Input
                          type="number"
                          value={proj.contractValueUsd}
                          onChange={(e) => {
                            const updated = [...previousProjects];
                            updated[index].contractValueUsd = Number(e.target.value);
                            setPreviousProjects(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">Completion Year</label>
                        <Input
                          type="number"
                          value={proj.completionYear}
                          onChange={(e) => {
                            const updated = [...previousProjects];
                            updated[index].completionYear = Number(e.target.value);
                            setPreviousProjects(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}

          {error && (
            <div className="border-t border-b border-red-500/20 bg-red-950/30 px-6 py-2 text-xs text-red-400">
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
                <Sparkles className="h-4 w-4" /> Submit Confidential Registration
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
