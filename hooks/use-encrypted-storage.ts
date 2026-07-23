"use client";

import { useCallback, useEffect, useState } from "react";
import { SealedBid } from "@/lib/types";
import { encryptedBidStorage } from "@/storage/encrypted-storage";

export function useEncryptedStorage() {
  const [bids, setBids] = useState<SealedBid[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await encryptedBidStorage.getEncryptedBids();
      setBids(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    encryptedBidStorage.getEncryptedBids().then((stored) => {
      if (active) {
        setBids(stored);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    bids,
    loading,
    refresh,
  };
}
