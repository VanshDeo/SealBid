import Link from "next/link";
import { getAuctionsAction } from "@/actions/auction-actions";
import { APP_DESCRIPTION } from "@/lib/constants";
import { AuctionCard } from "@/components/auction/auction-card";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const auctions = await getAuctionsAction();

  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl space-y-8 px-4 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[350px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-cyan-500/20 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Built natively for Midnight Network ZK-SDK
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-6xl">
          Confidential Sealed-Bid Auctions Powered by{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Zero-Knowledge Proofs
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
          {APP_DESCRIPTION}. Protect bid amounts, eliminate front-running, and ensure absolute
          privacy using Compact smart contracts and client-side encryption.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" variant="primary" className="glow-primary">
              Launch DApp Dashboard
            </Button>
          </Link>
          <Link href="/auctions">
            <Button size="lg" variant="outline">
              Explore Active Auctions
            </Button>
          </Link>
        </div>

        {/* Scalable Architecture Highlights */}
        <div className="grid grid-cols-1 gap-6 pt-12 text-left md:grid-cols-3">
          <div className="glass-panel space-y-3 rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-xl font-bold text-indigo-400">
              🔒
            </div>
            <h3 className="text-lg font-semibold text-white">Client-Side ZK Witness</h3>
            <p className="text-sm text-gray-400">
              Private bid values never leave your browser unencrypted. ZK proofs compile locally
              before submission.
            </p>
          </div>

          <div className="glass-panel space-y-3 rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-xl font-bold text-cyan-400">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-white">Compact Smart Contracts</h3>
            <p className="text-sm text-gray-400">
              Modular Compact language integration structure ready for Midnight network deployment.
            </p>
          </div>

          <div className="glass-panel space-y-3 rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-xl font-bold text-purple-400">
              🛡️
            </div>
            <h3 className="text-lg font-semibold text-white">AES-GCM Encrypted Storage</h3>
            <p className="text-sm text-gray-400">
              Web Crypto API integration safely stores bid salts and private parameters for reveal
              phases.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Auctions Showcase */}
      <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Confidential Auctions</h2>
            <p className="text-sm text-gray-400">
              Active auctions accepting zero-knowledge sealed bids
            </p>
          </div>
          <Link
            href="/auctions"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>
    </div>
  );
}
