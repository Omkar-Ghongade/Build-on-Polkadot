import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-100">
            <span className="h-3 w-3 rounded-full bg-pink-500" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-zinc-900">
              Cross-chain NFT Bridge
            </span>
            <span className="text-[11px] text-zinc-500">
              Polkadot Hub • XCM • Hyperbridge
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-3 text-xs md:text-sm">
          <Link
            href="/how-it-works"
            className="hidden text-zinc-500 hover:text-zinc-900 md:inline-flex"
          >
            How it works
          </Link>
          <Button variant="secondary" size="sm">
            Launch app
          </Button>
        </nav>
      </div>
    </header>
  );
}

