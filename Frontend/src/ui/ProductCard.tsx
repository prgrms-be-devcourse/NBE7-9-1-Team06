import type { Product } from "../types";
import { formatKRW } from "../utils";

type ProductCardProps = {
  product: Product;
  onAdd?: () => void;
  onClick?: () => void;
};

export function ProductCard({ product: p, onAdd, onClick }: ProductCardProps) {
  const isUnavailable =
    !p.isActive || p.stock === 0 || p.stock == null || p.price == null;
  const isLowStock =
    !isUnavailable &&
    typeof p.stock === "number" &&
    p.stock > 0 &&
    p.stock <= 5;
  return (
    <div
      className={`card ${isUnavailable ? "card-disabled" : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="image-wrap">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} />
        ) : (
          <div className="image-fallback" aria-hidden>
            이미지 없음
          </div>
        )}
        {!p.isActive || p.stock === 0 ? (
          <div className="badge badge-danger">품절</div>
        ) : isLowStock ? (
          <div className="badge badge-warning">소량</div>
        ) : null}
      </div>
      <div className="card-body">
        <div className="name" title={p.name}>
          {p.name}
        </div>
        <div className="price">
          {p.price == null ? "가격 문의" : formatKRW(p.price)}
        </div>
        {onAdd && (
          <button
            className="add-button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            disabled={isUnavailable}
            aria-label={`${p.name} 장바구니에 담기`}
          >
            담기
          </button>
        )}
      </div>
    </div>
  );
}
