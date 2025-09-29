import { useState } from "react";
import type { CartItem } from "../types";
import { createOrder, type OrderRequest } from "../mockData";
import { formatKRW } from "../utils";

type SidePanelProps = {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onChangeQty: (productId: string, delta: number) => void;
  onOrderComplete?: () => void;
};

export function SidePanel({
  open,
  items,
  onClose,
  onChangeQty,
  onOrderComplete,
}: SidePanelProps) {
  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    zipCode: "",
    address: "",
    detailAddress: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    zipCode: "",
    address: "",
    detailAddress: "",
  });

  function validateCustomerInfo() {
    const errors = {
      email: "",
      zipCode: "",
      address: "",
      detailAddress: "",
    };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerInfo.email) {
      errors.email = "이메일을 입력해주세요";
    } else if (!emailRegex.test(customerInfo.email)) {
      errors.email = "올바른 이메일 형식이 아닙니다";
    }

    // Zip code validation
    const zipRegex = /^\d{5}$/;
    if (!customerInfo.zipCode) {
      errors.zipCode = "우편번호를 입력해주세요";
    } else if (!zipRegex.test(customerInfo.zipCode)) {
      errors.zipCode = "우편번호는 숫자 5자리로 입력해주세요";
    }

    // Address validation
    if (!customerInfo.address) {
      errors.address = "주소를 입력해주세요";
    } else if (customerInfo.address.length < 5) {
      errors.address = "주소는 5자 이상 입력해주세요";
    }

    // Detail address validation
    if (!customerInfo.detailAddress) {
      errors.detailAddress = "상세주소를 입력해주세요";
    } else if (customerInfo.detailAddress.length < 2) {
      errors.detailAddress = "상세주소는 2자 이상 입력해주세요";
    }

    setValidationErrors(errors);
    return (
      !errors.email &&
      !errors.zipCode &&
      !errors.address &&
      !errors.detailAddress
    );
  }

  function isFormValid() {
    return validateCustomerInfo();
  }
  const [showOrderComplete, setShowOrderComplete] = useState(false);

  async function handleCheckout() {
    if (items.length === 0) return;
    if (!isFormValid()) return;

    try {
      // Mock 데이터를 사용하여 주문 생성
      const orderData: OrderRequest = {
        customerInfo,
        items,
        totalAmount: total,
        orderStatus: "COMPLETED",
      };

      const response = await createOrder(orderData);

      if (!response.success) {
        throw new Error("주문 생성에 실패했습니다.");
      }

      // 주문 성공 시 완료 화면 표시
      setShowOrderComplete(true);
    } catch (error) {
      console.error("주문 생성 오류:", error);
      alert("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  function handleFinalOrderComplete() {
    // Reset cart and close panel
    if (onOrderComplete) {
      onOrderComplete();
    }
    setShowOrderComplete(false);
    setCustomerInfo({ email: "", zipCode: "", address: "", detailAddress: "" });
    setValidationErrors({
      email: "",
      zipCode: "",
      address: "",
      detailAddress: "",
    });
    onClose();
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
              <p style={{ margin: "12px 0", color: "#666" }}>
                배송 예정: TODAY | TOMORROW
              </p>
              <button
                className="checkout-button"
                onClick={handleFinalOrderComplete}
              >
                확인
              </button>
            </div>
          </div>
        </aside>
        <div
          className={`backdrop ${open ? "visible" : ""}`}
          onClick={onClose}
          aria-hidden
        />
      </>
    );
  }

  return (
    <>
      <aside className={`side-panel ${open ? "open" : ""}`} aria-hidden={!open}>
        {/* Header - Fixed */}
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

        {/* Content - Scrollable */}
        <div className="side-content">
          {/* Cart Items Section */}
          <div>
            {items.length === 0 ? (
              <div className="side-empty">담긴 상품이 없습니다</div>
            ) : (
              <ul className="cart-list">
                {items.map((it) => (
                  <li key={it.productId} className="cart-item">
                    <div className="cart-product-info">
                      <div className="cart-name">{it.name}</div>
                      <div className="cart-unit-price">
                        단가: {formatKRW(it.unitPrice)}
                      </div>
                    </div>
                    <div className="cart-quantity-section">
                      <div className="cart-controls">
                        <button
                          onClick={() => onChangeQty(it.productId, -1)}
                          aria-label={`${it.name} 수량 감소`}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <div className="cart-qty" aria-live="polite">
                          {it.qty}
                        </div>
                        <button
                          onClick={() => onChangeQty(it.productId, 1)}
                          aria-label={`${it.name} 수량 증가`}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-subtotal">
                        소계: {formatKRW(it.unitPrice * it.qty)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(139, 69, 19, 0.1)",
              margin: "16px 0",
            }}
          />

          {/* Customer Info Section - Always Visible */}
          <div>
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: "16px",
                fontWeight: "600",
                color: "#8b4513",
              }}
            >
              고객정보
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                  color: "#8b4513",
                }}
              >
                이메일
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => {
                  setCustomerInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: `1px solid ${
                    validationErrors.email ? "#dc2626" : "#ddd"
                  }`,
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="이메일을 입력하세요"
              />
              {validationErrors.email && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {validationErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                  color: "#8b4513",
                }}
              >
                우편번호
              </label>
              <input
                type="text"
                value={customerInfo.zipCode}
                onChange={(e) => {
                  setCustomerInfo((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }));
                  if (validationErrors.zipCode) {
                    setValidationErrors((prev) => ({ ...prev, zipCode: "" }));
                  }
                }}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: `1px solid ${
                    validationErrors.zipCode ? "#dc2626" : "#ddd"
                  }`,
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="우편번호(5자리)"
              />
              {validationErrors.zipCode && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {validationErrors.zipCode}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                  color: "#8b4513",
                }}
              >
                주소
              </label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => {
                  setCustomerInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }));
                  if (validationErrors.address) {
                    setValidationErrors((prev) => ({ ...prev, address: "" }));
                  }
                }}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: `1px solid ${
                    validationErrors.address ? "#dc2626" : "#ddd"
                  }`,
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="주소를 입력하세요"
              />
              {validationErrors.address && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {validationErrors.address}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                  color: "#8b4513",
                }}
              >
                상세주소
              </label>
              <input
                type="text"
                value={customerInfo.detailAddress}
                onChange={(e) => {
                  setCustomerInfo((prev) => ({
                    ...prev,
                    detailAddress: e.target.value,
                  }));
                  if (validationErrors.detailAddress) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      detailAddress: "",
                    }));
                  }
                }}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: `1px solid ${
                    validationErrors.detailAddress ? "#dc2626" : "#ddd"
                  }`,
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="상세주소를 입력하세요"
              />
              {validationErrors.detailAddress && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {validationErrors.detailAddress}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="side-footer">
          <div className="side-summary">
            <div className="summary-line">
              <span>합계</span>
              <strong>{formatKRW(total)}</strong>
            </div>

            {/* Shipping notice */}
            <div
              style={{
                marginBottom: "12px",
                padding: "8px 12px",
                background: "rgba(139, 69, 19, 0.1)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#8b4513",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              당일 오후 2시 이후 주문은 다음날 배송을 시작합니다.
            </div>

            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              결제하기
            </button>
          </div>
        </div>
      </aside>
      <div
        className={`backdrop ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
    </>
  );
}
