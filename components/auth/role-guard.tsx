"use client";

import React from "react";
import Link from "next/link";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isConnected, connect, error } = useMidnightWallet();
  const { session, switchRoleForDemo } = useAuth();

  // 1. Wallet Not Connected
  if (!isConnected) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-2xl border border-indigo-500/20 bg-gray-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
          🔐
        </div>
        <h2 className="text-2xl font-bold text-white">Connect Midnight Lace Wallet</h2>
        <p className="mt-2 text-sm text-gray-400">
          Decentralized authentication requires a connected Lace Wallet to verify your identity and
          decrypt off-chain business role data.
        </p>
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/80 p-3 text-xs text-red-300">
            {error}
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={connect} className="glow-primary px-8">
            Connect Lace Wallet
          </Button>
        </div>
      </div>
    );
  }

  // 2. Wallet Connected but Not Registered
  if (!session.isRegistered) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-2xl border border-amber-500/20 bg-gray-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
          🆔
        </div>
        <h2 className="text-2xl font-bold text-white">Role Registration Required</h2>
        <p className="mt-2 text-sm text-gray-400">
          Your Lace Wallet (
          <span className="font-mono text-amber-300">{session.walletAddress?.slice(0, 10)}...</span>
          ) is connected but has not completed decentralized role registration.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button variant="primary" className="glow-primary px-6">
              Complete Role Registration →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. User Role Not Authorized for this route
  if (session.role && !allowedRoles.includes(session.role)) {
    const formatRole = (r: string) => r.toUpperCase();

    return (
      <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-red-500/30 bg-gray-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
          ⛔
        </div>
        <h2 className="text-2xl font-bold text-white">Access Restricted — Role Conflict</h2>
        <p className="mt-2 text-sm text-gray-400">
          This portal is reserved for{" "}
          <span className="font-semibold text-indigo-400">
            {allowedRoles.map(formatRole).join(" or ")}
          </span>{" "}
          roles. Your active wallet profile is registered as{" "}
          <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-red-300">
            {formatRole(session.role)}
          </span>
          .
        </p>

        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-left">
          <div className="text-xs font-semibold text-gray-400">Quick Demo Role Switcher:</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {allowedRoles.map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                onClick={() => switchRoleForDemo(role)}
                className="text-xs capitalize"
              >
                Switch to {role} Role
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary">Return to My Dashboard</Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline">View Auth Identity Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
