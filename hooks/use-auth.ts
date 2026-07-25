"use client";

import { useAuth } from "@/providers/auth-provider";

export function useSealBidAuth() {
  return useAuth();
}
