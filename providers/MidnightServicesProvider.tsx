"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { MidnightServicesContainer, createDefaultContainer } from "@/midnight/di/container";
import { WalletAccountState } from "@/midnight/types/midnight-sdk";

interface MidnightServicesContextValue {
  container: MidnightServicesContainer;
  account: WalletAccountState | null;
  isConnected: boolean;
  isInitializing: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const MidnightServicesContext = createContext<MidnightServicesContextValue | null>(null);

export interface MidnightServicesProviderProps {
  children: React.ReactNode;
  customContainer?: MidnightServicesContainer;
}

export const MidnightServicesProvider: React.FC<MidnightServicesProviderProps> = ({
  children,
  customContainer,
}) => {
  const container = useMemo(() => customContainer || createDefaultContainer(), [customContainer]);

  const [account, setAccount] = useState<WalletAccountState | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const acc = await container.wallet.getAccount();
        if (isMounted) {
          setAccount(acc);
        }
      } catch (err) {
        console.warn("[MidnightServicesProvider] Auto wallet fetch warning:", err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [container]);

  const connectWallet = async () => {
    try {
      const acc = await container.wallet.connect();
      setAccount(acc);
    } catch (err) {
      console.error("[MidnightServicesProvider] Wallet connection failed:", err);
      throw err;
    }
  };

  const disconnectWallet = async () => {
    await container.wallet.disconnect();
    setAccount(null);
  };

  return (
    <MidnightServicesContext.Provider
      value={{
        container,
        account,
        isConnected: Boolean(account),
        isInitializing,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </MidnightServicesContext.Provider>
  );
};

export function useMidnightServices(): MidnightServicesContextValue {
  const ctx = useContext(MidnightServicesContext);
  if (!ctx) {
    throw new Error("useMidnightServices must be used within a MidnightServicesProvider.");
  }
  return ctx;
}
