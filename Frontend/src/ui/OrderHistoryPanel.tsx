import { useState, useEffect } from "react";
import "./OrderHistoryPanel.css";
import {
  getOrderHistoryByEmail,
  getAddressInfoByEmail,
  type AddressInfo,
} from "../mockData";

export interface OrderHistoryItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderHistory {
  orderId: string;
  email: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  items: OrderHistoryItem[];
}

interface OrderHistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function OrderHistoryPanel({ open, onClose }: OrderHistoryPanelProps) {
  const [email, setEmail] = useState("");
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setOrderHistory([]);
      setAddressInfo(null);
      setError(null);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock 데이터를 사용하여 주문내역과 주소 정보 조회
      const [orderData, addressData] = await Promise.all([
        getOrderHistoryByEmail(email),
        getAddressInfoByEmail(email),
      ]);
      setOrderHistory(orderData);
      setAddressInfo(addressData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "주문내역을 불러오는데 실패했습니다."
      );
      setOrderHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR");
  };

  if (!open) return null;

  return (
    <div className="order-history-overlay" onClick={onClose}>
      <div className="order-history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="order-history-header">
          <h2>주문내역 조회</h2>
          <button className="close-button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="order-history-content">
          <div className="email-input-section">
            <label htmlFor="email-input">이메일 주소</label>
            <div className="email-input-group">
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="주문 시 사용한 이메일을 입력하세요"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="search-button"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "조회 중..." : "조회"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {addressInfo && (
            <div className="address-info-section">
              <h3>배송 주소 정보</h3>
              <div className="address-details">
                <div className="address-item">
                  <span className="address-label">이메일:</span>
                  <span className="address-value">{addressInfo.email}</span>
                </div>
                <div className="address-item">
                  <span className="address-label">우편번호:</span>
                  <span className="address-value">
                    {addressInfo.postalCode}
                  </span>
                </div>
                <div className="address-item">
                  <span className="address-label">주소:</span>
                  <span className="address-value">
                    {addressInfo.address} {addressInfo.detailAddress}
                  </span>
                </div>
              </div>
            </div>
          )}

          {orderHistory.length > 0 && (
            <div className="order-history-list">
              <h3>주문내역 ({orderHistory.length}건)</h3>
              {orderHistory.map((order) => (
                <div key={order.orderId} className="order-item">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-id">
                        주문번호: {order.orderId}
                      </span>
                      <span className="order-date">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                    <div className="order-status">
                      <span
                        className={`status-badge ${
                          order.status === "완료" ? "completed" : "pending"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">
                            수량: {item.quantity}개
                          </span>
                        </div>
                        <div className="item-price">
                          {formatPrice(item.unitPrice * item.quantity)}원
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-total">
                    <span>
                      총 주문금액:{" "}
                      <strong>{formatPrice(order.totalAmount)}원</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orderHistory.length === 0 && !loading && !error && email && (
            <div className="no-orders">
              <p>해당 이메일로 주문한 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
