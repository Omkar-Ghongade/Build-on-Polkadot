import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <TopNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-10 md:px-6 lg:px-8">
        {/* Hero (above the fold only) */}
        <section className="grid flex-1 gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-7 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
              Polkadot Hub • Cross-chain Apps #302
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl">
                Polkadot-native NFT bridge for parachains and EVM.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-600 md:text-base">
                A web-first interface that feels like a YC startup landing page,
                backed by Polkadot XCM and Hyperbridge for secure, multi-chain
                NFT transfers.
              </p>
              <p className="max-w-xl text-xs uppercase tracking-[0.18em] text-zinc-500 md:text-[11px]">
                BUILT FOR THE CROSS-CHAIN APPS TRACK • ADVANCED • 4–6 WEEK SCOPE
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/bridge">
                <Button size="lg">Launch Polkadot bridge</Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="ghost" size="lg">
                  How it works
                </Button>
              </Link>
              <p className="text-xs text-zinc-500 md:text-sm">
                No custodial wallets. You sign everything from your own
                extension.
              </p>
            </div>

            <dl className="grid gap-4 text-xs text-zinc-600 sm:grid-cols-3 md:text-sm">
              <div className="space-y-1 rounded-xl border border-zinc-200 bg-white p-3">
                <dt className="text-zinc-900">Chains</dt>
                <dd>Polkadot Relay, Asset Hub, Ethereum, Base (extensible)</dd>
              </div>
              <div className="space-y-1 rounded-xl border border-zinc-200 bg-white p-3">
                <dt className="text-zinc-900">Standards</dt>
                <dd>Uniques / NFTs / ERC-721 (MVP)</dd>
              </div>
              <div className="space-y-1 rounded-xl border border-zinc-200 bg-white p-3">
                <dt className="text-zinc-900">Built for</dt>
                <dd>Collectors, creators & infra teams</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between pb-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Bridge pipeline
                </p>
                <p className="text-sm text-zinc-700">
                  From source parachain to destination EVM in minutes.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-1 text-[11px] font-medium text-pink-600 ring-1 ring-pink-200">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                Live
              </span>
            </div>

            <div className="mt-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Source chain
                  </p>
                  <p className="text-sm text-zinc-900">Select parachain</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Polkadot, Asset Hub, Unique…
                  </p>
                </div>
                <div className="space-y-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Destination
                  </p>
                  <p className="text-sm text-zinc-900">Select EVM chain</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Ethereum, Base or more.
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Fees & timing
                </p>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2.5">
                  <div className="space-y-0.5">
                    <p className="text-sm text-zinc-900">
                      XCM weight + Hyperbridge gas
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      The bridge estimates cross-chain fees and typical
                      confirmation time before you submit a transfer.
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-300 px-3 py-1 text-[11px] font-medium text-zinc-700">
                    ~ minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Status
                </p>
                <ol className="space-y-1.5 text-xs text-zinc-700">
                  <li className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-pink-300 bg-pink-50">
                      <span className="h-2 w-2 rounded-full bg-pink-500" />
                    </span>
                    Compose XCM message
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-zinc-300 bg-white" />
                    Submit on source parachain
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-zinc-300 bg-white" />
                    Hyperbridge EVM leg
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-zinc-300 bg-white" />
                    Confirm destination NFT
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-zinc-500">
                <span>Designed for the Polkadot Cross-chain Apps track.</span>
                <span className="hidden text-pink-600 md:inline">
                  Built on Polkadot XCM, Hyperbridge & Next.js.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
