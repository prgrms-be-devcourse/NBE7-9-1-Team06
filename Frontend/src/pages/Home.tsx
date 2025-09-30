import { useEffect, useState } from "react";
import type { Product } from "../types";
import { ProductCard } from "../ui/ProductCard";
import { getProducts } from "../services";

type HomeProps = {
  onAddToCart?: (p: Product) => void;
  onProductClick?: (productId: string) => void;
};

export function Home({ onAddToCart, onProductClick }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock 데이터를 사용하여 상품 목록 조회
        const data = await getProducts();
        // 수량이 0인 상품들을 제외하고 필터링
        const availableProducts = data.filter((product) => product.stock > 0);
        if (mounted) setProducts(availableProducts);
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

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      // 수량이 0인 상품들을 제외하고 필터링
      const availableProducts = data.filter((product) => product.stock > 0);
      setProducts(availableProducts);
    } catch (e: any) {
      setError(e?.message || "상품을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
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
        <ProductCard
          key={p.id}
          product={p}
          onAdd={onAddToCart ? () => onAddToCart(p) : undefined}
          onClick={onProductClick ? () => onProductClick(p.id) : undefined}
        />
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
