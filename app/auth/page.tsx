"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { useAuth } from "@/providers/auth-provider";
import { EncryptedUserStorage } from "@/storage/user-storage";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const { isConnected, address, coinPublicKey, networkId, connect, disconnect } =
    useMidnightWallet();
  const { session, authenticateWithSignature, switchRoleForDemo, logout } = useAuth();

  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [showRawCiphertext, setShowRawCiphertext] = useState(false);

  const encryptedBlob = address ? EncryptedUserStorage.getEncryptedBlob(address) : null;

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-500/20 bg-indigo-500/10 text-4xl shadow-lg">
          🔐
        </div>
        <h1 className="text-3xl font-extrabold text-white">Authentication Hub</h1>
        <p className="mt-3 text-gray-400">
          Connect your Lace Wallet to inspect your decentralized session, cryptographic key
          commitments, and off-chain storage.
        </p>
        <div className="mt-8">
          <Button size="lg" variant="primary" onClick={connect} className="glow-primary px-8">
            Connect Lace Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Lace Wallet Verified Session
          </div>
          <h1 className="text-3xl font-extrabold text-white">Decentralized Auth Hub</h1>
          <p className="mt-1 text-xs text-gray-400">
            Manage your wallet authentication session, public ledger identity, and encrypted
            off-chain storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {session.isRegistered ? (
            <Link href={`/dashboard/${session.role}`}>
              <Button variant="primary" className="glow-primary">
                Open {session.role?.toUpperCase()} Dashboard →
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button variant="primary" className="glow-primary">
                Register Role →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid: Session Status & Wallet Credentials */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Wallet Credentials */}
        <div className="glass-panel space-y-4 rounded-2xl border border-indigo-500/20 p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              <span>💳</span> Connected Wallet Credentials
            </h3>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block font-medium text-gray-400">Lace Address</span>
              <span className="mt-1 block rounded-lg border border-gray-800 bg-gray-900/80 p-2 font-mono break-all text-indigo-300">
                {address}
              </span>
            </div>

            <div>
              <span className="block font-medium text-gray-400">Coin Public Key</span>
              <span className="mt-1 block rounded-lg border border-gray-800 bg-gray-900/80 p-2 font-mono break-all text-gray-300">
                {coinPublicKey || `0xcoin_pk_${address.slice(-16)}`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-400">Network ID:</span>
              <span className="font-mono font-semibold text-cyan-300 uppercase">{networkId}</span>
            </div>
          </div>
        </div>

        {/* Auth Session Status */}
        <div className="glass-panel space-y-4 rounded-2xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              <span>🔑</span> Cryptographic Session Challenge
            </h3>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
              {session.sessionToken ? "Verified" : "Pending Signature"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block font-medium text-gray-400">Session Nonce Token</span>
              <span className="mt-1 block rounded-lg border border-gray-800 bg-gray-900/80 p-2 font-mono break-all text-purple-300">
                {session.sessionToken || "Not Authenticated"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-400">Registered Role:</span>
              <span className="rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 font-semibold text-white uppercase">
                {session.role || "UNREGISTERED"}
              </span>
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={authenticateWithSignature}
                className="text-xs"
              >
                Refresh Wallet Signature Challenge
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Public Profile vs Encrypted Business Storage */}
      <div className="glass-panel space-y-6 rounded-2xl border border-gray-800 p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <span>🛡️</span> Minimum Public Profile & Encrypted Off-Chain Data
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Demonstrates SealBid&apos;s architecture: minimum metadata is visible publicly;
              business details are AES-GCM encrypted off-chain.
            </p>
          </div>

          {session.isRegistered && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                className="text-xs"
              >
                {showPrivateInfo
                  ? "🔒 Hide Decrypted Business Info"
                  : "🔓 Decrypt Off-Chain Details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawCiphertext(!showRawCiphertext)}
                className="font-mono text-xs"
              >
                {showRawCiphertext ? "Hide Ciphertext" : "View Raw Ciphertext"}
              </Button>
            </div>
          )}
        </div>

        {/* Public Profile Metadata */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
            🌐 Public Ledger Profile (Unencrypted)
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <span className="block text-[11px] text-gray-400">Display Name / Pseudonym</span>
              <span className="text-sm font-semibold text-white">
                {session.profile?.displayName || "N/A"}
              </span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <span className="block text-[11px] text-gray-400">Ecosystem Role</span>
              <span className="text-sm font-semibold text-indigo-300 capitalize">
                {session.role || "Unregistered"}
              </span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <span className="block text-[11px] text-gray-400">Off-Chain Data Hash (SHA-256)</span>
              <span className="block truncate font-mono text-xs text-cyan-300">
                {session.profile?.dataHash || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Decrypted Private Business Information */}
        {showPrivateInfo && session.privateInfo && (
          <div className="space-y-3 pt-2">
            <h4 className="flex items-center gap-1 text-xs font-bold tracking-wider text-emerald-400 uppercase">
              <span>🔓</span> Decrypted Off-Chain Business Info (Client-Side AES-GCM Decrypted)
            </h4>
            <pre className="overflow-x-auto rounded-xl border border-emerald-500/30 bg-gray-950 p-4 font-mono text-xs text-emerald-300">
              {JSON.stringify(session.privateInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Raw Ciphertext Inspection */}
        {showRawCiphertext && encryptedBlob && (
          <div className="space-y-3 pt-2">
            <h4 className="flex items-center gap-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
              <span>📦</span> Raw AES-GCM Ciphertext Blob (Stored Off-Chain)
            </h4>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-amber-500/30 bg-gray-950 p-4 font-mono text-xs break-all text-amber-300">
              {encryptedBlob}
            </div>
          </div>
        )}
      </div>

      {/* Demo Role Switcher Panel */}
      <div className="glass-panel space-y-4 rounded-2xl border border-gray-800 p-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-white">
          <span>🔄</span> Demo Role Switcher
        </h3>
        <p className="text-xs text-gray-400">
          Switch your active registered role instantly for testing Buyer, Vendor, and Auditor
          workflows.
        </p>

        <div className="flex flex-wrap gap-3">
          {(["buyer", "vendor", "auditor"] as UserRole[]).map((r) => (
            <Button
              key={r}
              variant={session.role === r ? "primary" : "outline"}
              onClick={() => switchRoleForDemo(r)}
              className="capitalize"
            >
              Set Active Role to {r}
            </Button>
          ))}
          <Button variant="secondary" onClick={logout} className="text-red-400 hover:text-red-300">
            Clear Local Session
          </Button>
        </div>
      </div>
    </div>
  );
}
