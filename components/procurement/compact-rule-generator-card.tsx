"use client";

import React, { useState } from "react";
import { CompactEligibilityRules } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Cpu } from "lucide-react";

interface CompactRuleGeneratorCardProps {
  rules: CompactEligibilityRules;
  title?: string;
  minTurnoverUsd?: number;
  minExperienceYears?: number;
}

export function CompactRuleGeneratorCard({
  rules,
  title,
  minTurnoverUsd,
  minExperienceYears,
}: CompactRuleGeneratorCardProps) {
  void minTurnoverUsd;
  void minExperienceYears;
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(rules.compactSourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-indigo-500/30 bg-gray-950/80 shadow-2xl backdrop-blur-xl space-y-4">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg text-white">
                {title ? `ZK Rules: ${title}` : "Generated Compact ZK Circuit Rules"}
              </CardTitle>
              <Badge variant="zk">Compact v0.14.2</Badge>
            </div>
            <CardDescription className="text-gray-400 text-xs">
              Midnight ZK smart contract predicate auto-compiled for buyer threshold requirements.
            </CardDescription>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={copyCode}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Code
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy .compact
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Commitment Metadata Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 space-y-1">
            <span className="text-gray-400 text-[11px] block">Rule Commitment Hash</span>
            <span className="text-indigo-300 truncate block font-bold">{rules.ruleCommitmentHash}</span>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 space-y-1">
            <span className="text-gray-400 text-[11px] block">Predicate Expression Hash</span>
            <span className="text-cyan-300 truncate block font-bold">{rules.predicateHash}</span>
          </div>
        </div>

        {/* Public Inputs & Private Witness Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">Public Inputs:</span>
          {rules.publicInputs.map((input) => (
            <span key={input} className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] text-indigo-300">
              {input}
            </span>
          ))}
          <span className="text-gray-400 font-medium ml-2">Private Witness:</span>
          {rules.privateWitnesses.map((witness) => (
            <span key={witness} className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] text-cyan-300">
              🔒 {witness}
            </span>
          ))}
        </div>

        {/* Syntax Highlighted Compact Code Display */}
        <div className="relative rounded-xl border border-gray-800 bg-black/90 p-4 font-mono text-xs text-gray-300 space-y-2 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] text-gray-500 border-b border-gray-800 pb-2 mb-2">
            <span>File: contracts/compact/procurement_eligibility.compact</span>
            <span className="text-emerald-400 font-semibold">✔ Ready for On-Chain Deployment</span>
          </div>
          <pre className="text-indigo-200 leading-relaxed font-mono whitespace-pre-wrap">
            {rules.compactSourceCode}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
