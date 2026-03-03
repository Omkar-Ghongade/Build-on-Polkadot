"use client";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
function isEvmAddress(address: string): boolean {
  return typeof address === "string" && EVM_ADDRESS_REGEX.test(address.trim());
}

export type EvmChain = "ethereum" | "base" | "moonbeam";

export interface EvmNft {
  contract: string;
  tokenId: string;
  chain: EvmChain;
  name?: string;
  image?: string;
  collectionName?: string;
}

/** Fetches NFTs from Ethereum, Base, and Moonbeam via server API (Alchemy key stays server-side). */
export async function fetchEvmNfts(address: string): Promise<EvmNft[]> {
  const trimmed = typeof address === "string" ? address.trim() : "";
  if (!isEvmAddress(trimmed)) return [];

  try {
    const res = await fetch(
      `/api/nfts/evm?address=${encodeURIComponent(trimmed)}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as EvmNft[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
