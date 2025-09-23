import type { CartItem } from "../types";
import { formatKRW } from "../utils";

type SidePanelProps = {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onChangeQty: (productId: string, delta: number) => void;
};

export function SidePanel({
  open,
  items,
  onClose,
  onChangeQty,
}: SidePanelProps) {
  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  return (
    <>
      <aside className={`side-panel ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="side-header">
          <div className="side-title">장바구니</div>
          <button
            className="side-close"
            onClick={onClose}
            aria-label="사이드패널 닫기"
          >
            ✕
          </button>
        </div>
        <div className="side-content">
          {items.length === 0 ? (
            <div className="side-empty">담긴 상품이 없습니다</div>
          ) : (
            <ul className="cart-list">
              {items.map((it) => (
                <li key={it.productId} className="cart-item">
                  <div className="cart-line">
                    <div className="cart-name">{it.name}</div>
                    <div className="cart-price">{formatKRW(it.unitPrice)}</div>
                  </div>
                  <div className="cart-controls">
                    <button
                      onClick={() => onChangeQty(it.productId, -1)}
                      aria-label={`${it.name} 수량 감소`}
                    >
                      -
                    </button>
                    <div className="cart-qty" aria-live="polite">
                      {it.qty}
                    </div>
                    <button
                      onClick={() => onChangeQty(it.productId, 1)}
                      aria-label={`${it.name} 수량 증가`}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="side-summary">
            <div className="summary-line">
              <span>합계</span>
              <strong>{formatKRW(total)}</strong>
            </div>
            <button className="checkout-button">결제하기</button>
          </div>
        </div>
      </aside>
      {open && <div className="backdrop" onClick={onClose} aria-hidden />}
    </>
  );
}
