import type { Product, RawProduct } from "./types";

export function defensivelyMapProducts(rawList: RawProduct[]): Product[] {
  const seen = new Set<string>();
  return rawList.map((r, index) => {
    const idCandidate = (r as any).id ?? (r as any)._id ?? (r as any).productId;
    const name = String((r as any).name ?? (r as any).title ?? "");
    const priceRaw =
      (r as any).price ?? (r as any).unitPrice ?? (r as any).amount;
    const imageUrl =
      (r as any).imageUrl ??
      (r as any).image ??
      (r as any).thumbnailUrl ??
      null;
    const stockRaw = (r as any).stock ?? (r as any).inventory ?? (r as any).qty;
    const activeRaw = (r as any).isActive ?? (r as any).active;

    const price =
      typeof priceRaw === "number"
        ? priceRaw
        : Number.isFinite(Number(priceRaw))
        ? Number(priceRaw)
        : null;
    const stock =
      typeof stockRaw === "number"
        ? stockRaw
        : Number.isFinite(Number(stockRaw))
        ? Number(stockRaw)
        : stockRaw == null
        ? null
        : null;

    let baseId =
      idCandidate != null
        ? String(idCandidate)
        : `${name || "product"}-${index}`;
    while (seen.has(baseId)) {
      baseId = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
    }
    seen.add(baseId);

    const isActive =
      typeof activeRaw === "boolean"
        ? activeRaw
        : stock != null
        ? stock > 0
        : false;

    return {
      id: baseId,
      name: name || "이름 미상",
      price,
      imageUrl: imageUrl ? String(imageUrl) : null,
      stock,
      isActive,
    } as Product;
  });
}

export function formatKRW(amount: number): string {
  try {
    const formatted = new Intl.NumberFormat("ko-KR").format(Math.round(amount));
    return `₩ ${formatted}`;
  } catch {
    return `₩ ${amount}`;
  }
}
