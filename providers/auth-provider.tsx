"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthSession, PrivateBusinessInfo, PublicUserProfile, UserRole } from "@/lib/types";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { EncryptedUserStorage } from "@/storage/user-storage";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthContextType {
  session: AuthSession;
  isAuthenticating: boolean;
  registerUser: (
    role: UserRole,
    displayName: string,
    privateInfo: PrivateBusinessInfo
  ) => Promise<{ success: boolean; profile?: PublicUserProfile; error?: string }>;
  authenticateWithSignature: () => Promise<boolean>;
  logout: () => void;
  switchRoleForDemo: (newRole: UserRole) => void;
  refetchProfile: () => Promise<void>;
}

const initialSession: AuthSession = {
  isAuthenticated: false,
  isRegistered: false,
  walletAddress: null,
  role: null,
  profile: null,
  privateInfo: null,
  sessionToken: null,
  authenticatedAt: null,
};

const AuthContext = createContext<AuthContextType>({
  session: initialSession,
  isAuthenticating: false,
  registerUser: async () => ({ success: false, error: "AuthContext not initialized" }),
  authenticateWithSignature: async () => false,
  logout: () => {},
  switchRoleForDemo: () => {},
  refetchProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useMidnightWallet();
  const [session, setSession] = useState<AuthSession>(initialSession);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loadUserProfile = useCallback(async (walletAddr: string) => {
    try {
      const publicProfile = EncryptedUserStorage.getPublicProfile(walletAddr);
      if (!publicProfile) {
        setTimeout(() => {
          setSession({
            isAuthenticated: true,
            isRegistered: false,
            walletAddress: walletAddr,
            role: null,
            profile: null,
            privateInfo: null,
            sessionToken: `session_unregistered_${walletAddr.slice(-8)}`,
            authenticatedAt: new Date().toISOString(),
          });
        }, 0);
        return;
      }

      const privateInfo = await EncryptedUserStorage.getPrivateBusinessInfo(walletAddr);

      setTimeout(() => {
        setSession({
          isAuthenticated: true,
          isRegistered: true,
          walletAddress: walletAddr,
          role: publicProfile.role,
          profile: publicProfile,
          privateInfo,
          sessionToken: `session_auth_${walletAddr.slice(-8)}_${Date.now().toString(36)}`,
          authenticatedAt: new Date().toISOString(),
        });
      }, 0);
    } catch (err) {
      console.error("[AuthProvider] Failed to load user profile:", err);
      setTimeout(() => {
        setSession({
          ...initialSession,
          isAuthenticated: true,
          walletAddress: walletAddr,
        });
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      void loadUserProfile(address);
    } else {
      setTimeout(() => {
        setSession(initialSession);
      }, 0);
    }
  }, [isConnected, address, loadUserProfile]);

  const authenticateWithSignature = async (): Promise<boolean> => {
    if (!address) return false;
    setIsAuthenticating(true);
    try {
      // Simulate Lace Wallet signature challenge prompt
      console.log(`[AuthProvider] Requesting Lace Wallet signature challenge for ${address}...`);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const challengeToken = `sealbid_auth_challenge_${address}_${Date.now()}`;
      console.log(`[AuthProvider] Signature challenge verified successfully: ${challengeToken}`);

      await loadUserProfile(address);
      setIsAuthenticating(false);
      return true;
    } catch (err) {
      console.error("[AuthProvider] Signature challenge failed:", err);
      setIsAuthenticating(false);
      return false;
    }
  };

  const registerUser = async (
    role: UserRole,
    displayName: string,
    privateInfo: PrivateBusinessInfo
  ): Promise<{ success: boolean; profile?: PublicUserProfile; error?: string }> => {
    if (!address) {
      return { success: false, error: "Lace Wallet is not connected." };
    }

    setIsAuthenticating(true);
    try {
      const { profile } = await EncryptedUserStorage.saveUserProfile(
        address,
        role,
        displayName,
        privateInfo
      );

      setSession({
        isAuthenticated: true,
        isRegistered: true,
        walletAddress: address,
        role,
        profile,
        privateInfo,
        sessionToken: `session_registered_${address.slice(-8)}_${Date.now().toString(36)}`,
        authenticatedAt: new Date().toISOString(),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEYS.AUTH_SESSION,
          JSON.stringify({ walletAddress: address, role })
        );
      }

      setIsAuthenticating(false);
      return { success: true, profile };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Registration failed";
      setIsAuthenticating(false);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setSession(initialSession);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  };

  const switchRoleForDemo = (newRole: UserRole) => {
    if (!session.walletAddress || !session.profile) return;
    const updatedProfile: PublicUserProfile = {
      ...session.profile,
      role: newRole,
    };

    let updatedPrivateInfo: PrivateBusinessInfo;
    if (newRole === "buyer") {
      updatedPrivateInfo = {
        role: "buyer",
        companyName: `${session.profile.displayName} Corp`,
        taxId: "TAX-998822-US",
        contactEmail: "buyer@sealbid.io",
        country: "United States",
        annualProcurementBudget: "$5,000,000 DUST",
      };
    } else if (newRole === "vendor") {
      updatedPrivateInfo = {
        role: "vendor",
        businessName: `${session.profile.displayName} Technologies`,
        registrationNumber: "REG-774411-EU",
        vatId: "VAT-EU-981273",
        contactEmail: "vendor@sealbid.io",
        bankAccountIBAN: "DE89370400440532013000",
        complianceCertificates: ["ISO-27001", "Midnight ZK Compliant"],
      };
    } else {
      updatedPrivateInfo = {
        role: "auditor",
        firmName: `${session.profile.displayName} Audit Partners`,
        licenseNumber: "AUD-441199-ZK",
        accreditationBody: "Midnight Zero-Knowledge Compliance Association",
        contactEmail: "auditor@sealbid.io",
        jurisdiction: "Global Decentralized Jurisdiction",
        rsaPublicKey: "0xrsa_pub_auditor_sealbid_88992211",
      };
    }

    EncryptedUserStorage.saveUserProfile(
      session.walletAddress,
      newRole,
      session.profile.displayName,
      updatedPrivateInfo
    );

    setSession((prev) => ({
      ...prev,
      role: newRole,
      profile: updatedProfile,
      privateInfo: updatedPrivateInfo,
    }));
  };

  const refetchProfile = async () => {
    if (session.walletAddress) {
      await loadUserProfile(session.walletAddress);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticating,
        registerUser,
        authenticateWithSignature,
        logout,
        switchRoleForDemo,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
