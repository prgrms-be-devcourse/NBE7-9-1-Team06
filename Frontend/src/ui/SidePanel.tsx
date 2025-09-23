import { useState } from "react";
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    address: "",
    zipCode: "",
  });
  const [showOrderComplete, setShowOrderComplete] = useState(false);

  function handleCheckout() {
    if (items.length === 0) return;
    setShowCheckout(true);
  }

  function handleOrderComplete() {
    setShowOrderComplete(true);
  }

  function handleBackToCart() {
    setShowCheckout(false);
    setShowOrderComplete(false);
  }

  if (showOrderComplete) {
    return (
      <>
        <aside
          className={`side-panel ${open ? "open" : ""}`}
          aria-hidden={!open}
        >
          <div className="side-header">
            <div className="side-title">주문 완료</div>
            <button
              className="side-close"
              onClick={onClose}
              aria-label="사이드패널 닫기"
            >
              ✕
            </button>
          </div>
          <div className="side-content">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <h3>주문이 완료되었습니다!</h3>
              <button className="checkout-button" onClick={handleBackToCart}>
                계속 쇼핑하기
              </button>
            </div>
          </div>
        </aside>
        {open && <div className="backdrop" onClick={onClose} aria-hidden />}
      </>
    );
  }

  if (showCheckout) {
    return (
      <>
        <aside
          className={`side-panel ${open ? "open" : ""}`}
          aria-hidden={!open}
        >
          <div className="side-header">
            <div className="side-title">주문 정보</div>
            <button
              className="side-close"
              onClick={handleBackToCart}
              aria-label="뒤로가기"
            >
              ←
            </button>
          </div>
          <div className="side-content">
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                }}
              >
                이메일
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="이메일을 입력하세요"
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                }}
              >
                주소
              </label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="주소를 입력하세요"
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                }}
              >
                우편번호
              </label>
              <input
                type="text"
                value={customerInfo.zipCode}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="우편번호를 입력하세요"
              />
            </div>
            <div className="side-summary">
              <div className="summary-line">
                <span>합계</span>
                <strong>{formatKRW(total)}</strong>
              </div>
              <button className="checkout-button" onClick={handleOrderComplete}>
                주문 완료
              </button>
            </div>
          </div>
        </aside>
        {open && (
          <div className="backdrop" onClick={handleBackToCart} aria-hidden />
        )}
      </>
    );
  }
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
            <button className="checkout-button" onClick={handleCheckout}>
              결제하기
            </button>
          </div>
        </div>
      </aside>
      {open && <div className="backdrop" onClick={onClose} aria-hidden />}
    </>
  );
}
