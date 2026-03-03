import { TopNav } from "@/components/layout/top-nav";
import { BridgeApp } from "./bridge-app";

export default function BridgePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-16 pt-10 md:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Bridge app
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Bridge NFTs between Polkadot parachains and EVM
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            Connect your wallets to see all your NFTs. Pick one to bridge from
            source chain to destination (coming soon).
          </p>
        </header>

        <BridgeApp />
      </main>
    </div>
  );
}
