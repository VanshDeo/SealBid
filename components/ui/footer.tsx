import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800/60 bg-gray-950/60 py-8 text-sm text-gray-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-300">{APP_NAME}</span>
          <span>— Confidential Zero-Knowledge Auctions on Midnight Network</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/api/health" className="transition-colors hover:text-gray-300">
            API Health
          </Link>
          <a
            href="https://midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-indigo-400"
          >
            Midnight Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
