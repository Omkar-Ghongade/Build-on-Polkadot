"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

function shorten(address: string, chars = 4) {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function WalletConnectButton() {
  const [polkadotAddress, setPolkadotAddress] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const { web3Enable, web3Accounts } = await import(
        "@polkadot/extension-dapp"
      );

      // Polkadot extension
      const extensions = await web3Enable("Cross-chain NFT Bridge");
      if (extensions.length > 0) {
        const accounts = await web3Accounts();
        if (accounts.length > 0) {
          setPolkadotAddress(accounts[0].address);
        }
      }

      // EVM wallet (e.g. MetaMask)
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setEvmAddress(accounts[0]);
        }
      }
    } catch (e) {
      setError("Unable to connect wallets. Check your browser extensions.");
    } finally {
      setLoading(false);
    }
  };

  const connectedLabel =
    polkadotAddress || evmAddress ? "Wallets connected" : "Connect";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="secondary"
        loading={loading}
        onClick={handleConnect}
      >
        {connectedLabel}
      </Button>
      {(polkadotAddress || evmAddress) && (
        <p className="max-w-[240px] text-right text-[10px] text-zinc-500">
          {polkadotAddress && (
            <>
              Polkadot:{" "}
              <span className="font-medium">{shorten(polkadotAddress)}</span>
              {evmAddress && " • "}
            </>
          )}
          {evmAddress && (
            <>
              EVM: <span className="font-medium">{shorten(evmAddress)}</span>
            </>
          )}
        </p>
      )}
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

