"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { WalletState } from "@/lib/types";
import { midnightClient } from "@/midnight/client";
import { midnightWalletAdapter } from "@/midnight/providers";
import { MidnightServicesProvider } from "./MidnightServicesProvider";

interface MidnightContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isNetworkReady: boolean;
}

const initialWalletState: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: null,
  coinPublicKey: null,
  balance: 0n,
  networkId: "undeployed-testnet",
  error: null,
};

const MidnightContext = createContext<MidnightContextType>({
  wallet: initialWalletState,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isNetworkReady: false,
});

export function MidnightProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isNetworkReady, setIsNetworkReady] = useState(false);

  useEffect(() => {
    async function initMidnight() {
      const ready = await midnightClient.initialize();
      setIsNetworkReady(ready);
    }
    initMidnight();
  }, []);

  const connectWallet = async () => {
    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const res = await midnightWalletAdapter.connect();
      const balance = await midnightWalletAdapter.getBalance();

      setWallet({
        isConnected: true,
        isConnecting: false,
        address: res.address,
        coinPublicKey: res.coinPublicKey,
        balance,
        networkId: midnightClient.getNetworkConfig().networkId,
        error: null,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  };

  const disconnectWallet = async () => {
    await midnightWalletAdapter.disconnect();
    setWallet(initialWalletState);
  };

  return (
    <MidnightServicesProvider>
      <MidnightContext.Provider
        value={{
          wallet,
          connectWallet,
          disconnectWallet,
          isNetworkReady,
        }}
      >
        {children}
      </MidnightContext.Provider>
    </MidnightServicesProvider>
  );
}

export const useMidnight = () => useContext(MidnightContext);
