import { useState, useEffect } from "react";
import "./OrderHistoryPanel.css";
import {
  getOrderHistoryByEmail,
  getOrderById,
  getOrderAddressByOrderId,
  getProducts,
  updateOrder,
  deleteOrder,
  type AddressInfo,
  type OrderHistory,
  type Product,
} from "../services";

// 타입들은 이제 services에서 import

interface OrderHistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function OrderHistoryPanel({ open, onClose }: OrderHistoryPanelProps) {
  const [email, setEmail] = useState("");
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderAddress, setOrderAddress] = useState<AddressInfo | null>(null);
  const [orderAddresses, setOrderAddresses] = useState<
    Record<string, AddressInfo>
  >({});
  const [editingOrderData, setEditingOrderData] = useState<OrderHistory | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setOrderHistory([]);
      setError(null);
      setActionLoading(null);
      setSelectedOrder(null);
      setOrderAddress(null);
      setOrderAddresses({});
      setEditingOrderData(null);
      setShowEditModal(false);
      setAvailableProducts([]);
      setShowProductSelector(false);
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
      console.log("주문내역 조회 - 이메일:", email);
      // Mock 데이터를 사용하여 주문내역 조회
      const orderData = await getOrderHistoryByEmail(email);
      setOrderHistory(orderData);

      // 각 주문별 배송 주소 정보도 함께 조회
      const addressPromises = orderData.map((order) =>
        getOrderAddressByOrderId(order.orderId).then((address) => ({
          orderId: order.orderId,
          address,
        }))
      );
      const addressResults = await Promise.all(addressPromises);
      const addressMap = addressResults.reduce((acc, { orderId, address }) => {
        if (address) acc[orderId] = address;
        return acc;
      }, {} as Record<string, AddressInfo>);
      setOrderAddresses(addressMap);
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

  const handleEditOrder = async (orderId: string) => {
    try {
      console.log("주문 수정 - 주문 ID:", orderId);
      const [orderDetail, products] = await Promise.all([
        getOrderById(orderId),
        getProducts(),
      ]);

      console.log("주문 상세:", orderDetail);

      if (orderDetail) {
        setEditingOrderData(orderDetail);
        setAvailableProducts(products);
        setShowEditModal(true);
      } else {
        alert("주문 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("주문 수정 오류:", error);
      alert("주문 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderData(null);
    setShowEditModal(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("정말로 이 주문을 취소하시겠습니까?")) {
      return;
    }

    setActionLoading(orderId);
    try {
      const response = await deleteOrder(orderId);
      if (response.resultCode === "200-1") {
        // 주문내역 다시 조회
        await handleSearch();
        alert(response.msg);
        // 선택된 주문이 삭제된 경우 선택 해제
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder(null);
        }
      } else {
        alert(response.msg);
      }
    } catch (error) {
      alert("주문 취소 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewOrderDetail = async (orderId: string) => {
    setOrderDetailLoading(true);
    try {
      // 주문 정보와 배송 주소를 동시에 조회
      const [orderDetail, orderAddressData] = await Promise.all([
        getOrderById(orderId),
        getOrderAddressByOrderId(orderId),
      ]);

      if (orderDetail) {
        setSelectedOrder(orderDetail);
        setOrderAddress(orderAddressData);
      } else {
        alert("주문 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      alert("주문 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setOrderDetailLoading(false);
    }
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

                  {/* 배송 주소 정보 표시 */}
                  {orderAddresses[order.orderId] && (
                    <div className="order-address-section">
                      <h4>배송 주소</h4>
                      <div className="order-address-info">
                        <div className="address-row">
                          <span className="address-label">우편번호:</span>
                          <span className="address-value">
                            {orderAddresses[order.orderId].postalCode}
                          </span>
                        </div>
                        <div className="address-row">
                          <span className="address-label">주소:</span>
                          <span className="address-value">
                            {orderAddresses[order.orderId].address}{" "}
                            {orderAddresses[order.orderId].detailAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="order-actions">
                    {/* 주문접수 상태일 때만 수정/취소 가능 */}
                    {order.status === "주문접수" && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditOrder(order.orderId)}
                          disabled={actionLoading === order.orderId}
                        >
                          {actionLoading === order.orderId
                            ? "처리중..."
                            : "주문 수정"}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteOrder(order.orderId)}
                          disabled={actionLoading === order.orderId}
                        >
                          {actionLoading === order.orderId
                            ? "처리중..."
                            : "주문 취소"}
                        </button>
                      </>
                    )}

                    {/* 모든 상태에서 상세 보기 가능 */}
                    <button
                      className="view-detail-btn"
                      onClick={() => handleViewOrderDetail(order.orderId)}
                      disabled={orderDetailLoading}
                    >
                      {orderDetailLoading ? "로딩중..." : "상세 보기"}
                    </button>

                    {/* 상태별 표시 */}
                    {order.status === "완료" && (
                      <span className="completed-notice">주문 완료</span>
                    )}
                    {order.status === "배송중" && (
                      <span className="shipping-notice">배송 중</span>
                    )}
                    {order.status === "취소" && (
                      <span className="cancelled-notice">주문 취소</span>
                    )}
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

      {/* 주문 상세 정보 모달 */}
      {selectedOrder && (
        <div
          className="order-detail-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-detail-header">
              <h3>주문 상세 정보</h3>
              <button
                className="close-button"
                onClick={() => setSelectedOrder(null)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="order-detail-content">
              <div className="order-detail-section">
                <h4>주문 정보</h4>
                <div className="detail-row">
                  <span className="detail-label">주문 ID:</span>
                  <span className="detail-value">{selectedOrder.orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">주문일:</span>
                  <span className="detail-value">
                    {formatDate(selectedOrder.orderDate)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">상태:</span>
                  <span className="detail-value">{selectedOrder.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">총 금액:</span>
                  <span className="detail-value">
                    ₩{formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>주문 상품</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="detail-item">
                    <div className="item-detail-info">
                      <span className="item-detail-name">{item.name}</span>
                      <span className="item-detail-quantity">
                        수량: {item.quantity}개
                      </span>
                    </div>
                    <div className="item-detail-price">
                      ₩{formatPrice(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {orderAddress && (
                <div className="order-detail-section">
                  <h4>배송 정보</h4>
                  <div className="detail-row">
                    <span className="detail-label">이메일:</span>
                    <span className="detail-value">{orderAddress.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">우편번호:</span>
                    <span className="detail-value">
                      {orderAddress.postalCode}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">주소:</span>
                    <span className="detail-value">{orderAddress.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">상세주소:</span>
                    <span className="detail-value">
                      {orderAddress.detailAddress}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 주문 수정 모달 */}
      {showEditModal && editingOrderData && (
        <div className="order-edit-modal-overlay" onClick={handleCancelEdit}>
          <div
            className="order-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-edit-header">
              <h3>주문 수정</h3>
              <button
                className="close-button"
                onClick={handleCancelEdit}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="order-edit-content">
              <div className="edit-section">
                <h4>주문 정보</h4>
                <div className="edit-row">
                  <span className="edit-label">주문 ID:</span>
                  <span className="edit-value">{editingOrderData.orderId}</span>
                </div>
                <div className="edit-row">
                  <span className="edit-label">주문일:</span>
                  <span className="edit-value">
                    {formatDate(editingOrderData.orderDate)}
                  </span>
                </div>
                <div className="edit-row">
                  <span className="edit-label">현재 상태:</span>
                  <span className="edit-value">{editingOrderData.status}</span>
                </div>
              </div>

              <div className="edit-section">
                <div className="edit-section-header">
                  <h4>주문 상품</h4>
                  <button
                    className="add-product-btn"
                    onClick={() => setShowProductSelector(!showProductSelector)}
                  >
                    + 상품 추가
                  </button>
                </div>

                {showProductSelector && (
                  <div className="product-selector">
                    <h5>상품 선택</h5>
                    <div className="product-grid">
                      {availableProducts
                        .filter(
                          (product) =>
                            product.isActive &&
                            product.stock &&
                            product.stock > 0
                        )
                        .map((product) => (
                          <div
                            key={product.id}
                            className="product-select-item"
                            onClick={() => {
                              const existingItem = editingOrderData.items.find(
                                (item) => item.productId === product.id
                              );
                              if (existingItem) {
                                // 이미 있는 상품이면 수량 증가
                                const updatedItems = editingOrderData.items.map(
                                  (item) =>
                                    item.productId === product.id
                                      ? { ...item, quantity: item.quantity + 1 }
                                      : item
                                );
                                const newTotal = updatedItems.reduce(
                                  (sum, item) =>
                                    sum + item.unitPrice * item.quantity,
                                  0
                                );
                                setEditingOrderData({
                                  ...editingOrderData,
                                  items: updatedItems,
                                  totalAmount: newTotal,
                                });
                              } else {
                                // 새로운 상품 추가
                                const newItem = {
                                  productId: product.id,
                                  name: product.name,
                                  unitPrice: product.price || 0,
                                  quantity: 1,
                                };
                                const updatedItems = [
                                  ...editingOrderData.items,
                                  newItem,
                                ];
                                const newTotal = updatedItems.reduce(
                                  (sum, item) =>
                                    sum + item.unitPrice * item.quantity,
                                  0
                                );
                                setEditingOrderData({
                                  ...editingOrderData,
                                  items: updatedItems,
                                  totalAmount: newTotal,
                                });
                              }
                            }}
                          >
                            <div className="product-select-info">
                              <span className="product-select-name">
                                {product.name}
                              </span>
                              <span className="product-select-price">
                                ₩{formatPrice(product.price || 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {editingOrderData.items.map((item, index) => (
                  <div key={index} className="edit-item">
                    <div className="edit-item-info">
                      <span className="edit-item-name">{item.name}</span>
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => {
                            if (item.quantity > 1) {
                              const updatedItems = editingOrderData.items.map(
                                (editItem, idx) =>
                                  idx === index
                                    ? {
                                        ...editItem,
                                        quantity: editItem.quantity - 1,
                                      }
                                    : editItem
                              );
                              const newTotal = updatedItems.reduce(
                                (sum, editItem) =>
                                  sum + editItem.unitPrice * editItem.quantity,
                                0
                              );
                              setEditingOrderData({
                                ...editingOrderData,
                                items: updatedItems,
                                totalAmount: newTotal,
                              });
                            }
                          }}
                        >
                          -
                        </button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <button
                          className="quantity-btn"
                          onClick={() => {
                            const updatedItems = editingOrderData.items.map(
                              (editItem, idx) =>
                                idx === index
                                  ? {
                                      ...editItem,
                                      quantity: editItem.quantity + 1,
                                    }
                                  : editItem
                            );
                            const newTotal = updatedItems.reduce(
                              (sum, editItem) =>
                                sum + editItem.unitPrice * editItem.quantity,
                              0
                            );
                            setEditingOrderData({
                              ...editingOrderData,
                              items: updatedItems,
                              totalAmount: newTotal,
                            });
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="edit-item-actions">
                      <div className="edit-item-price">
                        ₩{formatPrice(item.unitPrice * item.quantity)}
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={() => {
                          const updatedItems = editingOrderData.items.filter(
                            (_, idx) => idx !== index
                          );
                          const newTotal = updatedItems.reduce(
                            (sum, editItem) =>
                              sum + editItem.unitPrice * editItem.quantity,
                            0
                          );
                          setEditingOrderData({
                            ...editingOrderData,
                            items: updatedItems,
                            totalAmount: newTotal,
                          });
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="edit-section">
                <h4>총 금액</h4>
                <div className="edit-total">
                  ₩{formatPrice(editingOrderData.totalAmount)}
                </div>
              </div>

              <div className="edit-actions">
                <button
                  className="save-edit-btn"
                  onClick={async () => {
                    try {
                      // 주문 수정 시 기본 정보 사용 (주소 정보는 백엔드에서 제공하지 않음)
                      const response = await updateOrder(
                        editingOrderData.orderId,
                        {
                          email: editingOrderData.email,
                          address: "주소 정보 없음", // 백엔드에서 주소 정보를 제공하지 않으므로 기본값 사용
                          zipCode: 12345, // 기본 우편번호
                          items: editingOrderData.items.map((item) => ({
                            productId: parseInt(item.productId),
                            quantity: item.quantity,
                          })),
                        }
                      );

                      if (response.resultCode === "200-1") {
                        alert(response.msg);
                        handleCancelEdit();
                        // 주문내역 다시 조회
                        await handleSearch();
                      } else {
                        alert(response.msg);
                      }
                    } catch (error) {
                      alert("주문 수정 중 오류가 발생했습니다.");
                    }
                  }}
                >
                  수정 완료
                </button>
                <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
