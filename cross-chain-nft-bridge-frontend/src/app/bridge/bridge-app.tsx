"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { fetchPolkadotNfts, type PolkadotNft } from "@/lib/nfts-polkadot";
import { fetchEvmNfts, type EvmNft } from "@/lib/nfts-evm";
import { sanitizeImageUrl } from "@/lib/utils";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const CHAINS = [
  { id: "polkadot", name: "Polkadot Asset Hub", type: "polkadot" as const },
  { id: "ethereum", name: "Ethereum", type: "evm" as const },
  { id: "base", name: "Base", type: "evm" as const },
  { id: "moonbeam", name: "Moonbeam (Polkadot EVM)", type: "evm" as const },
] as const;

type BridgeStep = "idle" | "composing" | "submitted" | "bridging" | "confirmed";

function shorten(address: string, chars = 4) {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function BridgeApp() {
  const [polkadotAddress, setPolkadotAddress] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [polkadotNfts, setPolkadotNfts] = useState<PolkadotNft[]>([]);
  const [evmNfts, setEvmNfts] = useState<EvmNft[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedNft, setSelectedNft] = useState<
    { type: "polkadot"; nft: PolkadotNft } | { type: "evm"; nft: EvmNft } | null
  >(null);
  const [destChainId, setDestChainId] = useState<string>("ethereum");
  const [destAddress, setDestAddress] = useState("");
  const [bridgeStep, setBridgeStep] = useState<BridgeStep>("idle");
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [mockSourceTx, setMockSourceTx] = useState<string | null>(null);
  const [mockDestTx, setMockDestTx] = useState<string | null>(null);

  const isDestEvm =
    destChainId === "ethereum" ||
    destChainId === "base" ||
    destChainId === "moonbeam";
  const isDestAddressValid =
    destAddress.trim().length > 0 &&
    (isDestEvm
      ? /^0x[a-fA-F0-9]{40}$/.test(destAddress.trim())
      : destAddress.trim().length >= 47 && destAddress.trim().length <= 49);

  const connectWallets = useCallback(async () => {
    setConnectLoading(true);
    setError(null);
    try {
      const { web3Enable, web3Accounts } = await import(
        "@polkadot/extension-dapp"
      );
      const extensions = await web3Enable("Cross-chain NFT Bridge");
      if (extensions.length > 0) {
        const accounts = await web3Accounts();
        if (accounts.length > 0) setPolkadotAddress(accounts[0].address);
      }
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts?.length > 0) setEvmAddress(accounts[0]);
      }
    } catch (e) {
      setError("Could not connect. Install Polkadot.js and/or MetaMask.");
    } finally {
      setConnectLoading(false);
    }
  }, []);

  const disconnectWallets = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // Not all wallets support wallet_revokePermissions; still clear our state
      }
    }
    setPolkadotAddress(null);
    setEvmAddress(null);
    setPolkadotNfts([]);
    setEvmNfts([]);
    setSelectedNft(null);
    setBridgeStep("idle");
    setError(null);
  }, []);

  // Restore connection state on load (wallets stay authorized; we just re-read accounts)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { web3Enable, web3Accounts } = await import(
          "@polkadot/extension-dapp"
        );
        await web3Enable("Cross-chain NFT Bridge");
        const accounts = await web3Accounts();
        if (!cancelled && accounts.length > 0) {
          setPolkadotAddress(accounts[0].address);
        }
      } catch {
        // Extension not available or not authorized
      }
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({
            method: "eth_accounts",
          })) as string[] | undefined;
          if (!cancelled && accounts?.length > 0) {
            setEvmAddress(accounts[0]);
          }
        } catch {
          // EVM wallet not available
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceChainId = selectedNft
    ? selectedNft.type === "polkadot"
      ? "polkadot"
      : selectedNft.nft.chain
    : null;
  const destChainOptions = CHAINS.filter((c) => c.id !== sourceChainId);

  const startMockBridge = useCallback(() => {
    if (!selectedNft) return;
    setBridgeError(null);
    setMockSourceTx(null);
    setMockDestTx(null);
    setBridgeStep("composing");
    setTimeout(() => setBridgeStep("submitted"), 800);
    setTimeout(() => {
      setMockSourceTx("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      setBridgeStep("bridging");
    }, 1600);
    setTimeout(() => {
      setMockDestTx("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      setBridgeStep("confirmed");
    }, 3200);
  }, [selectedNft]);

  const closeBridgePanel = useCallback(() => {
    setSelectedNft(null);
    setDestAddress("");
    setBridgeStep("idle");
    setBridgeError(null);
    setMockSourceTx(null);
    setMockDestTx(null);
  }, []);

  useEffect(() => {
    if (!polkadotAddress && !evmAddress) return;
    setNftsLoading(true);
    const run = async () => {
      try {
        if (polkadotAddress) {
          const list = await fetchPolkadotNfts(polkadotAddress);
          setPolkadotNfts(list);
        } else {
          setPolkadotNfts([]);
        }
        if (evmAddress) {
          const list = await fetchEvmNfts(evmAddress);
          setEvmNfts(list);
        } else {
          setEvmNfts([]);
        }
      } catch (e) {
        setPolkadotNfts([]);
        setEvmNfts([]);
        setError("Failed to load NFTs.");
      } finally {
        setNftsLoading(false);
      }
    };
    run();
  }, [polkadotAddress, evmAddress]);

  const hasAddress = polkadotAddress || evmAddress;
  const hasNfts = polkadotNfts.length > 0 || evmNfts.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Connect wallets
            </h2>
            <p className="text-xs text-zinc-500">
              Connect Polkadot and/or EVM to see your NFTs below.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasAddress && (
              <Button
                variant="ghost"
                size="md"
                onClick={disconnectWallets}
                className="text-zinc-500"
              >
                Disconnect
              </Button>
            )}
            <Button
              variant={hasAddress ? "secondary" : "primary"}
              size="md"
              loading={connectLoading}
              onClick={connectWallets}
            >
              {hasAddress ? "Wallets connected" : "Connect wallets"}
            </Button>
          </div>
        </div>
        {hasAddress && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-600">
            {polkadotAddress && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                Polkadot: {shorten(polkadotAddress)}
              </span>
            )}
            {evmAddress && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                EVM: {shorten(evmAddress)}
              </span>
            )}
          </div>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </section>

      {!hasAddress && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
          Connect one or both wallets above to load your NFTs.
        </div>
      )}

      {hasAddress && nftsLoading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          Loading NFTs…
        </div>
      )}

      {hasAddress && !nftsLoading && (
        <>
          {selectedNft && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Bridge NFT (mock)
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {selectedNft.type === "polkadot"
                      ? selectedNft.nft.name ?? `#${selectedNft.nft.itemId}`
                      : selectedNft.nft.name ?? `#${selectedNft.nft.tokenId}`}{" "}
                    → {CHAINS.find((c) => c.id === destChainId)?.name ?? destChainId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeBridgePanel}
                  className="text-zinc-500"
                >
                  Cancel
                </Button>
              </div>

              {bridgeStep === "idle" ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                        Source
                      </p>
                      <p className="text-sm font-medium text-zinc-900">
                        {sourceChainId === "polkadot"
                          ? "Polkadot Asset Hub"
                          : sourceChainId === "base"
                            ? "Base"
                            : sourceChainId === "moonbeam"
                              ? "Moonbeam (Polkadot EVM)"
                              : "Ethereum"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                        Destination chain
                      </p>
                      <select
                        value={destChainId}
                        onChange={(e) => {
                          setDestChainId(e.target.value);
                          setDestAddress("");
                        }}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      >
                        {destChainOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
                      Destination address
                    </p>
                    <input
                      type="text"
                      value={destAddress}
                      onChange={(e) => setDestAddress(e.target.value)}
                      placeholder={
                        isDestEvm
                          ? "0x... (EVM address on " +
                            (destChainId === "base"
                              ? "Base"
                              : destChainId === "moonbeam"
                                ? "Moonbeam"
                                : "Ethereum") +
                            ")"
                          : "SS58 address (e.g. 5Grw... on Polkadot Asset Hub)"
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    {destAddress.trim() && !isDestAddressValid && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {isDestEvm
                          ? "Enter a valid EVM address (0x + 40 hex characters)"
                          : "Enter a valid SS58 address (47–49 characters)"}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                    Estimated fee (mock): ~0.002 DOT + ~0.0005 ETH
                  </div>
                  {bridgeError && (
                    <p className="text-xs text-red-500">{bridgeError}</p>
                  )}
                  <Button
                    size="lg"
                    onClick={startMockBridge}
                    className="w-full sm:w-auto"
                    disabled={!isDestAddressValid}
                  >
                    Start bridge (mock)
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-medium text-zinc-500">
                    Status
                  </p>
                  <ol className="space-y-2 text-sm text-zinc-700">
                    {(["composing", "submitted", "bridging", "confirmed"] as const).map((step, idx) => {
                      const stepLabel =
                        step === "composing"
                          ? "Compose XCM / bridge message"
                          : step === "submitted"
                            ? "Submit on source chain"
                            : step === "bridging"
                              ? "Hyperbridge EVM leg"
                              : "Confirm destination NFT";
                      const order = { composing: 0, submitted: 1, bridging: 2, confirmed: 3 };
                      const done = order[bridgeStep] > order[step] || bridgeStep === step;
                      const isCurrent = bridgeStep === step;
                      return (
                        <li
                          key={step}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              done
                                ? "bg-pink-500 text-white"
                                : isCurrent
                                  ? "border-2 border-pink-500 bg-pink-50 text-pink-600"
                                  : "border border-zinc-300 bg-white text-zinc-400"
                            }`}
                          >
                            {done ? "✓" : idx + 1}
                          </span>
                          <span className={done ? "text-zinc-900" : ""}>
                            {stepLabel}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  {mockSourceTx && (
                    <p className="text-[11px] text-zinc-500">
                      Source tx:{" "}
                      <code className="rounded bg-zinc-100 px-1">
                        {shorten(mockSourceTx, 10)}
                      </code>
                    </p>
                  )}
                  {mockDestTx && (
                    <p className="text-[11px] text-zinc-500">
                      Destination tx:{" "}
                      <code className="rounded bg-zinc-100 px-1">
                        {shorten(mockDestTx, 10)}
                      </code>
                    </p>
                  )}
                  {bridgeStep === "confirmed" && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" onClick={closeBridgePanel}>
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900">Your NFTs</h2>
            {!hasNfts ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              No NFTs found for the connected address(es). We fetch from
              Polkadot (Asset Hub), Ethereum, Base, and Moonbeam (Polkadot EVM). Set{" "}
                <code className="rounded bg-zinc-200 px-1 text-xs">ALCHEMY_ID</code> in .env for
                Ethereum & Base.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {polkadotNfts.map((nft) => (
                  <div
                    key={`${nft.collectionId}-${nft.itemId}`}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-square bg-zinc-100">
                      {(() => {
                        const src = sanitizeImageUrl(nft.image);
                        return src ? (
                          <img
                            src={src}
                            alt={nft.name ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400 text-xs">
                            No image
                          </div>
                        );
                      })()}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-pink-600">
                        Polkadot · Asset Hub
                      </p>
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {nft.name ?? `#${nft.itemId}`}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {nft.collectionName ?? `Collection ${nft.collectionId}`} · #{nft.itemId}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 w-full"
                        onClick={() => {
                          setSelectedNft({ type: "polkadot", nft });
                          setDestChainId(CHAINS.find((c) => c.id !== "polkadot")?.id ?? "ethereum");
                          setDestAddress("");
                          setBridgeStep("idle");
                        }}
                      >
                        Bridge
                      </Button>
                    </div>
                  </div>
                ))}
                {evmNfts.map((nft, i) => (
                  <div
                    key={`${nft.chain}-${nft.contract}-${nft.tokenId ?? i}`}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-square bg-zinc-100">
                      {(() => {
                        const src = sanitizeImageUrl(nft.image);
                        return src ? (
                          <img
                            src={src}
                            alt={nft.name ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400 text-xs">
                            No image
                          </div>
                        );
                      })()}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-violet-600">
                        EVM ·{" "}
                        {nft.chain === "base"
                          ? "Base"
                          : nft.chain === "moonbeam"
                            ? "Moonbeam (Polkadot EVM)"
                            : "Ethereum"}
                      </p>
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {nft.name ?? `#${nft.tokenId}`}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {nft.collectionName ?? shorten(nft.contract)} · #{nft.tokenId}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 w-full"
                        onClick={() => {
                          setSelectedNft({ type: "evm", nft });
                          setDestChainId(CHAINS.find((c) => c.id !== nft.chain)?.id ?? "polkadot");
                          setDestAddress("");
                          setBridgeStep("idle");
                        }}
                      >
                        Bridge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
