import { useState, useEffect } from "react";
import type { Product } from "../types";
import { formatKRW } from "../utils";

type ProductDetailPanelProps = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
};

export function ProductDetailPanel({
  open,
  productId,
  onClose,
  onAddToCart,
}: ProductDetailPanelProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null);
      setQuantity(1);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Mock API call - 실제로는 GET /api/v1/products/{productId}
    fetch(`/api/v1/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("상품을 불러올 수 없습니다");
        return res.json();
      })
      .then((data) => {
        // Mock data for now - 실제 API 응답에 맞게 조정 필요
        const mockProduct: Product = {
          id: productId,
          name: data.name || "프리미엄 원두 1kg",
          price: data.price || 12900,
          imageUrl: data.imageUrl || "https://picsum.photos/400/300?random=1",
          stock: data.stock || 10,
          isActive: data.isActive !== false,
        };
        setProduct(mockProduct);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, productId]);

  function handleAddToCart() {
    if (!product) return;

    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }

    // Reset quantity and close panel
    setQuantity(1);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <>
      <aside
        className="side-panel open"
        aria-hidden={false}
        role="dialog"
        aria-labelledby="product-detail-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="side-header">
          <div id="product-detail-title" className="side-title">
            {product?.name || "상품 상세"}
          </div>
          <button
            className="side-close"
            onClick={onClose}
            aria-label="상품 상세 닫기"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="side-content">
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div>상품 정보를 불러오는 중...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#dc2626",
              }}
            >
              <div>{error}</div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: "#8b4513",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {product && !loading && !error && (
            <div>
              {/* Product Image */}
              <div style={{ marginBottom: "20px" }}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      color: "#666",
                    }}
                  >
                    이미지 없음
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#8b4513",
                  }}
                >
                  {product.name}
                </h2>

                <div style={{ marginBottom: "12px" }}>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#111",
                    }}
                  >
                    {product.price ? formatKRW(product.price) : "가격 문의"}
                  </span>
                </div>

                {/* Stock Status */}
                <div style={{ marginBottom: "16px" }}>
                  {product.stock === 0 || !product.isActive ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#dc2626",
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      품절
                    </span>
                  ) : product.stock !== null && product.stock <= 5 ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#f59e0b",
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      소량
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {product && !loading && !error && (
          <div className="side-footer">
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#8b4513",
                }}
              >
                수량
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #8b4513",
                    background: "white",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: quantity <= 1 ? "not-allowed" : "pointer",
                    opacity: quantity <= 1 ? 0.5 : 1,
                    color: "#8b4513",
                    fontWeight: "600",
                  }}
                  aria-label="수량 감소"
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: "24px",
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#8b4513",
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #8b4513",
                    background: "white",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#8b4513",
                    fontWeight: "600",
                  }}
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="checkout-button"
              onClick={handleAddToCart}
              disabled={
                product.stock === 0 || !product.isActive || !product.price
              }
            >
              장바구니에 담기
            </button>
          </div>
        )}
      </aside>

      <div
        className={`backdrop ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
    </>
  );
}
