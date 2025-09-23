import { useEffect, useState } from "react";
import type { Product, RawProduct } from "../types";
import { defensivelyMapProducts } from "../utils";
import { ProductCard } from "../ui/ProductCard";

type HomeProps = {
  onAddToCart?: (p: Product) => void;
};

export function Home({ onAddToCart }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/products", {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as unknown;
        const raw: RawProduct[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.items)
          ? (data as any).items
          : [];
        const mapped = defensivelyMapProducts(raw);
        if (mounted) setProducts(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || "상품을 불러오지 못했습니다");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    fetch("/api/v1/products", { headers: { accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const raw: RawProduct[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.items)
          ? (data as any).items
          : [];
        setProducts(defensivelyMapProducts(raw));
      })
      .catch((e: any) => setError(e?.message || "상품을 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }

  if (loading) return <SkeletonGrid />;
  if (error)
    return (
      <div className="error-banner" role="alert">
        <div>상품을 불러오는 중 오류가 발생했어요.</div>
        <button className="retry-button" onClick={handleRetry}>
          다시 시도
        </button>
      </div>
    );
  if (!products.length)
    return <div className="empty">현재 판매 중인 상품이 없습니다</div>;

  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAddToCart ? () => onAddToCart(p) : undefined} />
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="image-wrap skeleton-box" />
          <div className="card-body">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  );
}
