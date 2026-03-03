"use client";

const ASSET_HUB_WS =
  process.env.NEXT_PUBLIC_ASSET_HUB_WS_URL ||
  "wss://polkadot-asset-hub-rpc.dwellir.com";

export interface PolkadotNft {
  collectionId: string;
  itemId: string;
  name?: string;
  image?: string;
  metadata?: string;
  collectionName?: string;
}

export async function fetchPolkadotNfts(
  address: string
): Promise<PolkadotNft[]> {
  const { ApiPromise, WsProvider } = await import("@polkadot/api");
  const provider = new WsProvider(ASSET_HUB_WS);
  const api = await ApiPromise.create({ provider });

  try {
    const nfts: PolkadotNft[] = [];
    // Asset Hub uses "uniques" pallet; account is (AccountId, (CollectionId, ItemId))
    const accountKeys = await api.query.uniques.account.keys(address);
    for (const key of accountKeys) {
      const rest = key.args.slice(1);
      const collectionId = Array.isArray(rest[0]) ? rest[0][0] : rest[0];
      const itemId = Array.isArray(rest[0]) ? rest[0][1] : rest[1];
      const colStr = String(collectionId);
      const itemStr = String(itemId);
      let name: string | undefined;
      let image: string | undefined;
      let metadata: string | undefined;
      let collectionName: string | undefined;

      try {
        const itemMeta = await api.query.uniques.itemMetadata(collectionId, itemId) as unknown as { isSome: boolean; unwrap: () => { data: { isSome: boolean; unwrap: () => { toHuman?: () => string; toString: () => string } } } };
        if (itemMeta.isSome) {
          const meta = itemMeta.unwrap();
          if (meta.data.isSome) {
            const raw = meta.data.unwrap();
            metadata = raw.toHuman?.() as string ?? raw.toString();
            try {
              const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
              if (parsed?.name) name = parsed.name;
              if (parsed?.image) image = parsed.image;
            } catch {
              name = metadata?.slice?.(0, 32) ?? `#${itemStr}`;
            }
          }
        }
      } catch {
        // ignore
      }
      if (!name) name = `Collection ${colStr} #${itemStr}`;
      try {
        const colMeta = await api.query.uniques.collectionMetadata(collectionId) as unknown as { isSome: boolean; unwrap: () => { data: { isSome: boolean; unwrap: () => { toHuman?: () => string; toString: () => string } } } };
        if (colMeta.isSome) {
          const data = colMeta.unwrap().data;
          if (data.isSome) {
            const raw = data.unwrap().toHuman?.() as string ?? data.unwrap().toString();
            try {
              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              if (parsed?.name) collectionName = parsed.name;
            } catch {
              collectionName = `Collection ${colStr}`;
            }
          }
        }
      } catch {
        collectionName = `Collection ${colStr}`;
      }

      nfts.push({
        collectionId: colStr,
        itemId: itemStr,
        name,
        image,
        metadata,
        collectionName,
      });
    }
    return nfts;
  } finally {
    await api.disconnect();
  }
}
