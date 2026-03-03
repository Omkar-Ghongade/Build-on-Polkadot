import Link from "next/link";

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
          <Link
            href="/bridge"
            className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-900 transition-colors hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/70 focus-visible:ring-offset-2"
          >
            Launch app
          </Link>
        </nav>
      </div>
    </header>
  );
}

