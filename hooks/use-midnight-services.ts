"use client";

import { useMemo } from "react";
import { useMidnightServices } from "@/providers/MidnightServicesProvider";
import { SealBidContractService } from "@/midnight/services/sealbid-contract-service";

export { useMidnightServices };

/**
 * Custom React Hook to instantiate and interact with the SealBid Contract Service.
 */
export function useSealBidContract(contractAddress?: string): {
  sealBidService: SealBidContractService;
  account: ReturnType<typeof useMidnightServices>["account"];
  isConnected: boolean;
} {
  const { container, account, isConnected } = useMidnightServices();

  const sealBidService = useMemo(() => {
    return container.createSealBidContractService(contractAddress);
  }, [container, contractAddress]);

  return {
    sealBidService,
    account,
    isConnected,
  };
}
