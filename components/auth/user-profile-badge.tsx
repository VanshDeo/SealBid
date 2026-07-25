"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/lib/types";

const ROLE_STYLES: Record<UserRole, { badge: string; icon: string; title: string }> = {
  buyer: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    icon: "🛒",
    title: "Buyer",
  },
  vendor: {
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    icon: "🏭",
    title: "Vendor",
  },
  auditor: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    icon: "⚖️",
    title: "Auditor",
  },
};

export function UserProfileBadge() {
  const { session } = useAuth();

  if (!session.isAuthenticated || !session.walletAddress) {
    return null;
  }

  if (!session.isRegistered || !session.role) {
    return (
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/20"
      >
        <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" />
        Unregistered Wallet
      </Link>
    );
  }

  const roleConfig = ROLE_STYLES[session.role];

  return (
    <Link
      href="/auth"
      className={`inline-flex items-center gap-1.5 rounded-full border ${roleConfig.badge} px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105`}
      title={`Authenticated as ${roleConfig.title} (${session.profile?.displayName})`}
    >
      <span>{roleConfig.icon}</span>
      <span>{session.profile?.displayName || roleConfig.title}</span>
      <span className="font-mono text-[10px] opacity-75">({roleConfig.title})</span>
    </Link>
  );
}
