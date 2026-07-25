"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardRouterPage() {
  const router = useRouter();
  const { isConnected } = useMidnightWallet();
  const { session } = useAuth();

  useEffect(() => {
    if (isConnected && session.isRegistered && session.role) {
      router.replace(`/dashboard/${session.role}`);
    }
  }, [isConnected, session.isRegistered, session.role, router]);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
          🔐
        </div>
        <h1 className="text-2xl font-bold text-white">Wallet Connection Required</h1>
        <p className="text-sm text-gray-400">
          Connect your Midnight Lace Wallet to access role-based confidential auction portals.
        </p>
        <div className="pt-2">
          <Link href="/register">
            <Button variant="primary" className="glow-primary">
              Register or Connect Wallet →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!session.isRegistered) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
          🆔
        </div>
        <h1 className="text-2xl font-bold text-white">Role Registration Needed</h1>
        <p className="text-sm text-gray-400">
          Your wallet (
          <span className="font-mono text-amber-300">{session.walletAddress?.slice(0, 12)}...</span>
          ) is connected but requires role registration (Buyer, Vendor, or Auditor).
        </p>
        <div className="pt-2">
          <Link href="/register">
            <Button variant="primary" className="glow-primary">
              Register Your Role →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-12 text-center">
      <div className="animate-spin text-3xl">⏳</div>
      <h2 className="text-xl font-bold text-white">
        Redirecting to {session.role?.toUpperCase()} Portal...
      </h2>
      <div className="flex justify-center gap-3 pt-4">
        <Link href="/dashboard/buyer">
          <Button variant="outline" size="sm">
            Buyer Portal
          </Button>
        </Link>
        <Link href="/dashboard/vendor">
          <Button variant="outline" size="sm">
            Vendor Portal
          </Button>
        </Link>
        <Link href="/dashboard/auditor">
          <Button variant="outline" size="sm">
            Auditor Portal
          </Button>
        </Link>
      </div>
    </div>
  );
}
