import { TopNav } from "@/components/layout/top-nav";

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 pb-16 pt-10 md:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            HOW IT WORKS
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            From parachain NFT to EVM in four clear steps.
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            This page unpacks what happens in the UI and on-chain at each stage
            of a cross-chain NFT transfer, based on the TRD/PRD.
          </p>
        </header>

        {/* High-level pipeline */}
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-zinc-900">
                1. The bridge pipeline
              </h2>
              <p className="text-xs text-zinc-600">
                A four-stage pipeline that maps directly to the app status:
                compose, submit, bridge, verify.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                01 • Compose
              </p>
              <p className="text-xs text-zinc-700">
                User selects source parachain, NFT, and destination chain. The
                app uses the asset registry to determine the correct XCM
                instructions or pallet calls for that route.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                02 • Submit
              </p>
              <p className="text-xs text-zinc-700">
                The composed call is sent to the user&apos;s wallet (Polkadot
                extension or EVM wallet). After signing, the app tracks
                inclusion and finality on the source chain.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                03 • Bridge
              </p>
              <p className="text-xs text-zinc-700">
                Hyperbridge executes the cross-consensus hop, locking/burning
                the NFT on the source side and preparing or minting the
                destination representation.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                04 • Verify
              </p>
              <p className="text-xs text-zinc-700">
                The verification logic confirms that the destination chain shows
                the expected owner and token, then updates the UI and history as
                &quot;destination confirmed&quot;.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture diagram */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            2. Architecture at a glance
          </h2>
          <p className="text-xs text-zinc-700">
            The bridge coordinates three main pieces: a Polkadot parachain
            leg, the Hyperbridge leg, and the destination chain. The diagram
            below mirrors the TRD&apos;s system overview.
          </p>
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <div className="inline-flex min-w-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-700 md:flex-row md:items-stretch md:justify-between">
                <div className="flex-1 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Parachain side
                  </p>
                  <p className="text-xs text-zinc-700">
                    User wallet ↔ parachain RPC. XCM / pallet call moves the NFT
                    into the bridge context on Asset Hub or an NFT parachain.
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Example: Polkadot → Asset Hub.
                  </p>
                </div>

                <div className="flex items-center justify-center px-2 text-sm text-zinc-400">
                  <div className="hidden h-px flex-1 rounded-full bg-zinc-200 md:block" />
                  <span className="mx-3 text-[11px] uppercase tracking-[0.18em]">
                    XCM + Hyperbridge
                  </span>
                  <div className="hidden h-px flex-1 rounded-full bg-zinc-200 md:block" />
                </div>

                <div className="flex-1 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Hyperbridge & EVM side
                  </p>
                  <p className="text-xs text-zinc-700">
                    Hyperbridge contract locks/burns on source and mints/unwraps
                    on the destination EVM chain, emitting events used for status.
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Example: Ethereum / Base.
                  </p>
                </div>
              </div>
            </div>

            {/* Example route diagram */}
            <div className="overflow-x-auto">
              <div className="inline-flex min-w-full items-stretch gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
                <div className="flex-1 space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Source
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    Asset Hub (Polkadot)
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    NFT #123 in collection 42 owned by Alice.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 px-2 text-[11px] text-zinc-400">
                  <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-600">
                    Bridge route
                  </span>
                  <span>via XCM + Hyperbridge</span>
                </div>
                <div className="flex-1 space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Destination
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    Base (EVM)
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Wrapped ERC-721 token with same metadata, owned by Alice&apos;s
                    EVM address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User-facing flow */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            3. What the user experiences
          </h2>
          <ol className="space-y-3 text-xs text-zinc-700">
            <li>
              <span className="font-semibold text-zinc-900">
                Step 1 – Connect wallets:
              </span>{" "}
              The user connects a Polkadot wallet (for parachains) and, if
              needed, an EVM wallet. The header and bridge panel reflect which
              sides are connected.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                Step 2 – Choose route:
              </span>{" "}
              Source chain, NFT collection/item or ERC-721 contract/tokenId, and
              destination chain are chosen from options allowed by the asset
              registry routes.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                Step 3 – Review fees and confirm:
              </span>{" "}
              Estimated fees (XCM weight + Hyperbridge/EVM gas) are shown. The
              user confirms and their wallet pops up to sign.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                Step 4 – Watch status update:
              </span>{" "}
              The status widget walks through &quot;Compose XCM message&quot; →
              &quot;Submit on source parachain&quot; → &quot;Hyperbridge EVM
              leg&quot; → &quot;Confirm destination NFT&quot; with explorer
              links when tx hashes are known.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                Step 5 – View history:
              </span>{" "}
              Completed and in-progress transfers appear on the history page,
              keyed by user address and route.
            </li>
          </ol>
        </section>

        {/* On-chain behaviour */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            4. What happens on each chain
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Parachain leg
              </h3>
              <p className="text-xs text-zinc-700">
                The app uses Dedot/PAPI to connect to the selected parachain,
                builds an XCM or pallet call to move the NFT into the bridge
                context, and submits it via the user&apos;s Polkadot extension.
                Finality is tracked via subscriptions.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Hyperbridge leg
              </h3>
              <p className="text-xs text-zinc-700">
                On the EVM side, Hyperbridge contracts lock or burn the NFT
                (or wrapped representation) and emit events. The frontend can
                query these via viem/ethers or an HTTP API, updating status to
                &quot;bridge in progress&quot; and then &quot;destination
                pending&quot;.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Verification layer
              </h3>
              <p className="text-xs text-zinc-700">
                A verification loop (pure frontend in the MVP) periodically
                checks both chains for finality and ownership. Once the
                destination NFT is visible with the expected owner, the
                transfer is marked as &quot;destination confirmed&quot;.
              </p>
            </div>
          </div>
        </section>

        {/* Data & status model */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            5. Data model and statuses
          </h2>
          <p className="text-xs text-zinc-700">
            Each transfer is tracked as a typed object (id, route, asset,
            addresses, tx hashes, timestamps) with a simple status machine:
          </p>
          <ul className="grid gap-3 text-xs text-zinc-700 md:grid-cols-2">
            <li>
              <span className="font-semibold text-zinc-900">
                Pipeline states:
              </span>{" "}
              idle → selecting → estimating → signing → source pending → source
              finalized → bridge in progress → destination pending →
              destination confirmed → complete or error.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                What the user sees:
              </span>{" "}
              human-readable labels, progress indicators, and explorer links for
              both source and destination, plus any error messages if a stage
              fails.
            </li>
          </ul>

          {/* Status timeline diagram */}
          <div className="mt-4 overflow-x-auto">
            <div className="inline-flex min-w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-[11px] text-zinc-600 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-[10px] font-semibold text-white">
                  1
                </span>
                <span>Compose</span>
              </div>
              <span className="hidden text-zinc-300 md:inline">➝</span>
              <div className="flex flex-1 items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                  2
                </span>
                <span>Submit</span>
              </div>
              <span className="hidden text-zinc-300 md:inline">➝</span>
              <div className="flex flex-1 items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                  3
                </span>
                <span>Bridge</span>
              </div>
              <span className="hidden text-zinc-300 md:inline">➝</span>
              <div className="flex flex-1 items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                  4
                </span>
                <span>Verify</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

