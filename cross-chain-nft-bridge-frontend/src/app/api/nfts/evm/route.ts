import { NextRequest, NextResponse } from "next/server";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export type EvmChain = "ethereum" | "base" | "moonbeam";

export interface EvmNft {
  contract: string;
  tokenId: string;
  chain: EvmChain;
  name?: string;
  image?: string;
  collectionName?: string;
}

const EVM_CHAINS: { chain: EvmChain; apiHost: string }[] = [
  { chain: "ethereum", apiHost: "eth-mainnet.g.alchemy.com" },
  { chain: "base", apiHost: "base-mainnet.g.alchemy.com" },
  { chain: "moonbeam", apiHost: "moonbeam-mainnet.g.alchemy.com" },
];

async function fetchNftsForChain(
  owner: string,
  chain: EvmChain,
  apiHost: string,
  apiKey: string
): Promise<EvmNft[]> {
  const url = `https://${apiHost}/nft/v2/${apiKey}/getNFTs?owner=${encodeURIComponent(owner)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as {
    ownedNfts?: Array<{
      contract: { address: string };
      tokenId: string;
      title?: string;
      media?: Array<{ gateway: string }>;
      contract?: { name?: string };
    }>;
  };
  const list = data.ownedNfts ?? [];
  return list.map((n) => ({
    contract: n.contract.address,
    tokenId: n.tokenId,
    chain,
    name: n.title ?? `#${n.tokenId}`,
    image: n.media?.[0]?.gateway,
    collectionName: n.contract?.name,
  }));
}

/**
 * GET /api/nfts/evm?address=0x...
 * Returns EVM NFTs for the given address. Alchemy key stays server-side (ALCHEMY_ID).
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const trimmed = typeof address === "string" ? address.trim() : "";
  if (!EVM_ADDRESS_REGEX.test(trimmed)) {
    return NextResponse.json(
      { error: "Invalid or missing EVM address (0x + 40 hex chars)" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ALCHEMY_ID;
  if (!apiKey) {
    return NextResponse.json([]);
  }

  try {
    const results = await Promise.all(
      EVM_CHAINS.map(({ chain, apiHost }) =>
        fetchNftsForChain(trimmed, chain, apiHost, apiKey)
      )
    );
    return NextResponse.json(results.flat());
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 502 }
    );
  }
}
