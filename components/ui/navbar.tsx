"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletConnectButton } from "@/components/midnight/wallet-connect-button";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/auctions", label: "Auctions" },
    { href: "/my-bids", label: "My Sealed Bids" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <span className="text-xl">S</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-indigo-300">
              SealBid
            </span>
            <span className="ml-2 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] text-indigo-400">
              Midnight ZK
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center space-x-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border border-gray-700/60 bg-gray-800/80 font-semibold text-white"
                    : "text-gray-400 hover:bg-gray-900/60 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Wallet Connect */}
        <div className="flex items-center space-x-3">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
