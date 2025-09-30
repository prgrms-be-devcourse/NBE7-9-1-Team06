/**
 * 주문관리 JavaScript
 * - 주문 목록 조회 및 렌더링
 * - 주문 취소 처리
 */

const API_BASE_URL = "/api/v1/admin";

/**
 * 주문 목록 로드
 */
async function loadOrders() {
  try {
    showTableState("loading", { message: "주문 목록을 불러오는 중..." });

    const response = await fetch(`${API_BASE_URL}/orders`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("API 응답:", result); // 디버깅용

    // RsData 구조에서 실제 데이터 추출
    if (result.resultCode === "200-1" && result.data && result.data.orders) {
      renderOrders(result.data.orders);
    } else {
      throw new Error(result.msg || "주문 목록을 불러올 수 없습니다.");
    }
  } catch (error) {
    console.error("주문 목록 로드 오류:", error);
    showTableState("error", {
      title: "오류가 발생했습니다",
      message: error.message || "주문 목록을 불러오는 중 오류가 발생했습니다.",
    });
  }
}

/**
 * 주문 목록 렌더링
 * @param {Array} orders - 주문 배열
 */
function renderOrders(orders) {
  const tableBody = document.getElementById("ordersTableBody");
  if (!tableBody) return;

  // 테이블 바디 초기화
  tableBody.innerHTML = "";

  if (!orders || orders.length === 0) {
    showTableState("empty", {
      title: "주문이 없습니다",
      message: "아직 등록된 주문이 없습니다.",
    });
    return;
  }

  // 주문 데이터 렌더링
  orders.forEach((orderWithDetails) => {
    const row = createOrderRow(orderWithDetails);
    tableBody.appendChild(row);
  });

  showTableState("data");
}

/**
 * 주문 행 생성
 * @param {object} orderWithDetails - 주문 데이터 (OrdersWithDetailsDto)
 * @returns {HTMLTableRowElement} 주문 행 요소
 */
function createOrderRow(orderWithDetails) {
  const row = document.createElement("tr");

  // OrdersWithDetailsDto에서 실제 주문 데이터 추출
  const order = orderWithDetails.ordersDto;

  // 주문 ID (OrdersDto에서는 'id' 필드) - number 타입을 문자열로 변환
  const orderId = String(order.id);

  // 배송상태 (OrdersDto에서는 'status' 필드)
  const status = order.status;

  // 주소 (OrdersDto에는 address만 있음)
  const address = order.address || "";

  console.log("전체 주문 데이터:", orderWithDetails);
  console.log("주문 데이터 (ordersDto):", order);
  console.log("주문 ID:", orderId, "타입:", typeof orderId);
  console.log("배송상태:", status);
  console.log("주문 객체의 모든 키:", Object.keys(order));

  if (!orderId || orderId === "undefined") {
    console.error("주문 ID가 없습니다:", order);
  }

  row.innerHTML = `
        <td>${escapeHtml(orderId || "N/A")}</td>
        <td>${escapeHtml(order.email)}</td>
        <td>${escapeHtml(address)}</td>
        <td>${formatPrice(order.totalPrice)}</td>
        <td>${escapeHtml(status || "알 수 없음")}</td>
        <td class="text-right">
            <button class="btn btn-primary btn-sm" onclick="viewOrderDetail('${orderId}')" ${
    !orderId || orderId === "undefined" ? "disabled" : ""
  }>
                상세보기
            </button>
            <button class="btn btn-secondary btn-sm" onclick="editOrder('${orderId}')" ${
    !orderId || orderId === "undefined" ? "disabled" : ""
  }>
                주문 수정
            </button>
            <button class="btn btn-danger btn-sm" onclick="cancelOrder('${orderId}')" ${
    !orderId || orderId === "undefined" ? "disabled" : ""
  }>
                주문 취소
            </button>
        </td>
    `;

  return row;
}

/**
 * 주문 수정 처리 (목록에서 직접 수정)
 * @param {string} orderId - 주문 ID
 */
async function editOrder(orderId) {
  try {
    console.log("주문 수정 요청 - ID:", orderId);

    if (!orderId || orderId === "undefined" || orderId === "") {
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    // 먼저 주문 상세 정보를 가져와서 수정 폼에 표시
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("주문 상세 응답:", result);

    if (result.resultCode === "200-1" && result.data) {
      // 주문 수정 폼에 데이터 설정 후 모달 표시
      setupOrderUpdateForm(result.data);
      showOrderUpdateModal();
    } else {
      throw new Error(result.msg || "주문 정보를 불러올 수 없습니다.");
    }
  } catch (error) {
    console.error("주문 수정 오류:", error);
    notify(error.message || "주문 수정 중 오류가 발생했습니다.", "error");
  }
}

/**
 * 주문 수정 모달 표시
 */
function showOrderUpdateModal() {
  const updateModal = document.getElementById("orderUpdateModal");
  if (updateModal) {
    updateModal.style.display = "flex";

    // 첫 번째 입력 필드에 포커스
    setTimeout(() => {
      const firstInput = updateModal.querySelector("input, textarea");
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }
}

/**
 * 주문 수정 폼에 데이터 설정
 * @param {object} orderData - 주문 데이터
 */
function setupOrderUpdateForm(orderData) {
  console.log("주문 수정 폼 설정 - 데이터:", orderData);

  // 실제 주문 데이터 구조에 맞게 수정
  const actualOrderData = orderData.ordersDto || orderData;
  const orderDetails = orderData.orderDetails || [];

  // 폼 필드 설정
  const updateOrderId = document.getElementById("updateOrderId");
  const updateOrderAddress = document.getElementById("updateOrderAddress");
  const updateOrderZipCode = document.getElementById("updateOrderZipCode");
  const updateOrderStatus = document.getElementById("updateOrderStatus");
  const orderItemsList = document.getElementById("orderItemsList");

  if (updateOrderId) {
    updateOrderId.value = actualOrderData.id || "";
  }

  if (updateOrderAddress) {
    updateOrderAddress.value = actualOrderData.address || "";
  }

  if (updateOrderZipCode) {
    updateOrderZipCode.value = actualOrderData.zipCode || "";
  }

  if (updateOrderStatus) {
    // 배송상태 설정 (대소문자 구분 없이 매칭)
    const status = (actualOrderData.status || "").toUpperCase();
    updateOrderStatus.value = status;

    // 상태가 유효하지 않으면 기본값으로 설정
    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      updateOrderStatus.value = "PENDING";
    }
  }

  // 주문 상품 목록 표시
  if (orderItemsList && orderDetails.length > 0) {
    renderOrderItemsForUpdate(orderDetails);
  }

  // 현재 주문 데이터 저장
  window.currentOrderId = actualOrderData.id;
  window.currentOrderData = actualOrderData;
}

/**
 * 주문 취소 처리
 * @param {string} orderId - 주문 ID
 */
async function cancelOrder(orderId) {
  try {
    console.log("주문 취소 요청 - ID:", orderId, "타입:", typeof orderId);

    if (!orderId || orderId === "undefined" || orderId === "") {
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    const confirmed = await confirm(
      `주문 ID ${orderId}를 취소하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    showTableState("loading", { message: "주문을 취소하는 중..." });

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("주문 취소 응답:", result); // 디버깅용

    if (result.resultCode === "200-1") {
      notify("주문이 성공적으로 취소되었습니다.", "success");
    } else {
      throw new Error(result.msg || "주문 취소에 실패했습니다.");
    }

    // 목록 재조회
    await loadOrders();
  } catch (error) {
    console.error("주문 취소 오류:", error);
    notify(error.message || "주문 취소 중 오류가 발생했습니다.", "error");

    // 에러 발생 시에도 목록 재조회
    await loadOrders();
  }
}

/**
 * HTML 이스케이프 처리
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
  if (typeof text !== "string") return "";

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 주문 데이터 유효성 검사
 * @param {object} order - 주문 데이터
 * @returns {boolean} 유효성 여부
 */
function validateOrder(order) {
  if (!order) return false;

  const requiredFields = ["orderId", "email", "address", "totalPrice"];
  return requiredFields.every((field) => {
    const value = order[field];
    return value !== null && value !== undefined && value !== "";
  });
}

/**
 * 주문 목록 새로고침
 */
function refreshOrders() {
  loadOrders();
}

/**
 * 주문 상세 조회
 * @param {string} orderId - 주문 ID
 */
async function viewOrderDetail(orderId) {
  try {
    console.log("주문 상세 조회 요청 - ID:", orderId);

    if (!orderId || orderId === "undefined" || orderId === "") {
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("주문 상세 응답:", result);

    if (result.resultCode === "200-1" && result.data) {
      // API 응답 구조에 따라 데이터 처리
      const orderData = result.data;
      console.log("전체 응답 데이터:", orderData);
      console.log("데이터 타입:", typeof orderData);
      console.log("데이터 키들:", Object.keys(orderData || {}));

      showOrderDetailModal(orderData);
    } else {
      throw new Error(result.msg || "주문 상세 정보를 불러올 수 없습니다.");
    }
  } catch (error) {
    console.error("주문 상세 조회 오류:", error);
    notify(error.message || "주문 상세 조회 중 오류가 발생했습니다.", "error");
  }
}

/**
 * 주문 상세 모달 표시
 * @param {object} orderData - 주문 데이터
 */
function showOrderDetailModal(orderData) {
  console.log("주문 상세 데이터:", orderData); // 디버깅용

  const modal = document.getElementById("orderDetailModal");
  const modalTitle = document.getElementById("orderDetailTitle");
  const modalBody = document.getElementById("orderDetailBody");
  const updateBtn = document.getElementById("updateOrderBtn");

  if (!modal || !modalTitle || !modalBody) {
    console.error("모달 요소를 찾을 수 없습니다");
    return;
  }

  // 실제 주문 데이터 구조에 맞게 수정
  // OrdersWithDetailsDto 구조를 고려
  const actualOrderData = orderData.ordersDto || orderData;
  const orderDetails = orderData.orderDetails || [];

  console.log("실제 주문 데이터:", actualOrderData);
  console.log("주문 상세:", orderDetails);

  // 모달 제목 설정
  modalTitle.textContent = `주문 상세 정보 (ID: ${
    actualOrderData.id || "N/A"
  })`;

  // 주문 상세 정보 HTML 생성
  const orderDetailsHtml = orderDetails
    .map(
      (detail) => `
    <div class="order-detail-item">
      <div class="detail-info">
        <strong>${escapeHtml(detail.productName || "상품명 없음")}</strong>
        <span class="detail-quantity">수량: ${detail.quantity || 0}개</span>
        <span class="detail-price">${formatPrice(detail.price || 0)}</span>
      </div>
    </div>
  `
    )
    .join("");

  // 주문일 처리 (안전하게)
  const orderDate = actualOrderData.orderDate || actualOrderData.createdAt;
  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleString("ko-KR")
    : "알 수 없음";

  modalBody.innerHTML = `
    <div class="order-detail-section">
      <h3>주문 정보</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <label>주문 ID:</label>
          <span>${actualOrderData.id || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>주문자 이메일:</label>
          <span>${escapeHtml(actualOrderData.email || "N/A")}</span>
        </div>
        <div class="detail-item">
          <label>주소:</label>
          <span>${escapeHtml(actualOrderData.address || "N/A")}</span>
        </div>
        <div class="detail-item">
          <label>우편번호:</label>
          <span>${actualOrderData.zipCode || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>총 가격:</label>
          <span class="total-price">${formatPrice(
            actualOrderData.totalPrice || 0
          )}</span>
        </div>
        <div class="detail-item">
          <label>주문일:</label>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-item">
          <label>배송상태:</label>
          <span class="status-${
            actualOrderData.status
              ? actualOrderData.status.toLowerCase()
              : "unknown"
          }">${getStatusText(actualOrderData.status)}</span>
        </div>
        <div class="detail-item">
          <label>수정 가능:</label>
          <span>${
            actualOrderData.canModify !== false ? "가능" : "불가능"
          }</span>
        </div>
      </div>
    </div>
    
    <div class="order-detail-section">
      <h3>주문 상품</h3>
      <div class="order-details-list">
        ${orderDetailsHtml || "<p>주문 상품 정보가 없습니다.</p>"}
      </div>
    </div>
  `;

  // 상세보기 모달에서는 수정 버튼 제거 (이제 목록에서 직접 수정)

  // 현재 주문 ID와 데이터 저장
  window.currentOrderId = actualOrderData.id;
  window.currentOrderData = actualOrderData;

  modal.style.display = "flex";
}

/**
 * 주문 수정 폼 표시
 */
function showOrderUpdateForm() {
  const detailModal = document.getElementById("orderDetailModal");
  const updateModal = document.getElementById("orderUpdateModal");
  const updateOrderId = document.getElementById("updateOrderId");
  const updateOrderAddress = document.getElementById("updateOrderAddress");
  const updateOrderZipCode = document.getElementById("updateOrderZipCode");
  const orderItemsList = document.getElementById("orderItemsList");

  if (!detailModal || !updateModal) return;

  // 현재 주문 ID 설정
  if (updateOrderId && window.currentOrderId) {
    updateOrderId.value = window.currentOrderId;
  }

  // 현재 주문 데이터로 폼 채우기
  if (window.currentOrderData) {
    if (updateOrderAddress) {
      updateOrderAddress.value = window.currentOrderData.address || "";
    }
    if (updateOrderZipCode) {
      updateOrderZipCode.value = window.currentOrderData.zipCode || "";
    }

    // 주문 상품 목록 표시
    if (orderItemsList && window.currentOrderData.orderDetails) {
      renderOrderItemsForUpdate(window.currentOrderData.orderDetails);
    }
  }

  // 모달 전환
  detailModal.style.display = "none";
  updateModal.style.display = "flex";
}

/**
 * 주문 수정 모달 닫기
 */
function closeOrderUpdate() {
  const modal = document.getElementById("orderUpdateModal");
  if (modal) {
    modal.style.display = "none";
    hideOrderUpdateError();
  }
}

/**
 * 주문 상세 모달 닫기
 */
function closeOrderDetail() {
  const modal = document.getElementById("orderDetailModal");
  if (modal) {
    modal.style.display = "none";
    window.currentOrderId = null;
    window.currentOrderData = null;
  }
}

/**
 * 주문 상품 목록을 수정 폼에 표시
 * @param {Array} orderDetails - 주문 상세 목록
 */
function renderOrderItemsForUpdate(orderDetails) {
  const orderItemsList = document.getElementById("orderItemsList");
  if (!orderItemsList) return;

  const itemsHtml = orderDetails
    .map(
      (detail, index) => `
    <div class="order-item-update" data-product-id="${detail.productId}">
      <div class="item-info">
        <span class="item-name">${escapeHtml(detail.productName)}</span>
        <span class="item-price">${formatPrice(detail.price)}</span>
      </div>
      <div class="item-quantity">
        <label>수량:</label>
        <input 
          type="number" 
          name="itemQuantity_${detail.productId}" 
          value="${detail.quantity}" 
          min="1" 
          class="quantity-input"
          data-product-id="${detail.productId}"
        />
      </div>
    </div>
  `
    )
    .join("");

  orderItemsList.innerHTML = itemsHtml;
}

/**
 * 주문 수정 처리
 */
async function handleOrderUpdate(event) {
  event.preventDefault();

  try {
    const form = document.getElementById("orderUpdateForm");
    if (!form) return;

    const formData = new FormData(form);
    const orderId = formData.get("orderId");
    const address = formData.get("address");
    const zipCode = formData.get("zipCode");
    const status = formData.get("status");

    if (!orderId) {
      throw new Error("주문 ID가 없습니다.");
    }

    if (!address || !zipCode) {
      throw new Error("주소와 우편번호를 모두 입력해주세요.");
    }

    if (!status) {
      throw new Error("주문 상태를 선택해주세요.");
    }

    // 주문 상품 목록 수집
    const items = [];
    const quantityInputs = document.querySelectorAll(".quantity-input");

    quantityInputs.forEach((input) => {
      const productId = parseInt(input.dataset.productId);
      const quantity = parseInt(input.value);

      if (productId && quantity > 0) {
        items.push({
          productId: productId,
          quantity: quantity,
        });
      }
    });

    if (items.length === 0) {
      throw new Error("주문 상품이 없습니다.");
    }

    hideOrderUpdateError();

    // API 요청 데이터 구성
    const updateData = {
      address: address,
      zipCode: parseInt(zipCode),
      status: status,
      items: items,
    };

    console.log("주문 수정 요청 데이터:", updateData);

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("주문 수정 응답:", result);

    if (result.resultCode === "200-1") {
      notify("주문이 성공적으로 수정되었습니다.", "success");
      closeOrderUpdate();
      closeOrderDetail();
      await loadOrders(); // 목록 새로고침
    } else {
      throw new Error(result.msg || "주문 수정에 실패했습니다.");
    }
  } catch (error) {
    console.error("주문 수정 오류:", error);
    showOrderUpdateError(error.message || "주문 수정 중 오류가 발생했습니다.");
  }
}

/**
 * 주문 수정 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showOrderUpdateError(message) {
  const errorElement = document.getElementById("orderUpdateErrorMessage");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

/**
 * 주문 수정 에러 메시지 숨기기
 */
function hideOrderUpdateError() {
  const errorElement = document.getElementById("orderUpdateErrorMessage");
  if (errorElement) {
    errorElement.style.display = "none";
  }
}

/**
 * 주문 상태 텍스트 변환
 * @param {string} status - 주문 상태
 * @returns {string} 한국어 상태 텍스트
 */
function getStatusText(status) {
  const statusMap = {
    PENDING: "대기중",
    CONFIRMED: "확정",
    CANCELLED: "취소",
  };
  return statusMap[status] || status;
}

/**
 * 이메일로 주문 검색
 */
async function searchByEmail() {
  const emailInput = document.getElementById("emailSearch");
  const email = emailInput?.value?.trim();

  if (!email) {
    notify("이메일을 입력해주세요.", "error");
    return;
  }

  try {
    showTableState("loading", { message: "이메일로 주문을 검색하는 중..." });

    const response = await fetch(
      `${API_BASE_URL}/orders?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("이메일 검색 응답:", result);

    if (result.resultCode === "200-1" && result.data && result.data.orders) {
      renderOrders(result.data.orders);
      notify(
        `${email}으로 검색된 주문: ${result.data.orders.length}건`,
        "success"
      );
    } else {
      renderOrders([]);
      notify(`${email}으로 검색된 주문이 없습니다.`, "info");
    }
  } catch (error) {
    console.error("이메일 검색 오류:", error);
    showTableState("error", {
      title: "검색 오류",
      message: error.message || "이메일 검색 중 오류가 발생했습니다.",
    });
  }
}

/**
 * 주문 ID로 주문 검색
 */
async function searchByOrderId() {
  const orderIdInput = document.getElementById("orderIdSearch");
  const orderId = orderIdInput?.value?.trim();

  if (!orderId) {
    notify("주문 ID를 입력해주세요.", "error");
    return;
  }

  try {
    showTableState("loading", { message: "주문 ID로 검색하는 중..." });

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

    if (!response.ok) {
      if (response.status === 404) {
        renderOrders([]);
        notify(`주문 ID ${orderId}를 찾을 수 없습니다.`, "info");
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("주문 ID 검색 응답:", result);

    if (result.resultCode === "200-1" && result.data) {
      // 단일 주문 데이터를 배열로 변환하여 표시
      renderOrders([result.data]);
      notify(`주문 ID ${orderId}를 찾았습니다.`, "success");
    } else {
      renderOrders([]);
      notify(`주문 ID ${orderId}를 찾을 수 없습니다.`, "info");
    }
  } catch (error) {
    console.error("주문 ID 검색 오류:", error);
    showTableState("error", {
      title: "검색 오류",
      message: error.message || "주문 ID 검색 중 오류가 발생했습니다.",
    });
  }
}

/**
 * 검색 초기화 및 전체 목록 로드
 */
function clearSearch() {
  const emailInput = document.getElementById("emailSearch");
  const orderIdInput = document.getElementById("orderIdSearch");

  if (emailInput) emailInput.value = "";
  if (orderIdInput) orderIdInput.value = "";

  loadOrders();
}

// 전역 함수로 등록
window.loadOrders = loadOrders;
window.cancelOrder = cancelOrder;
window.refreshOrders = refreshOrders;
window.viewOrderDetail = viewOrderDetail;
window.editOrder = editOrder;
window.showOrderUpdateModal = showOrderUpdateModal;
window.setupOrderUpdateForm = setupOrderUpdateForm;
window.closeOrderUpdate = closeOrderUpdate;
window.closeOrderDetail = closeOrderDetail;
window.handleOrderUpdate = handleOrderUpdate;
window.searchByEmail = searchByEmail;
window.searchByOrderId = searchByOrderId;
window.clearSearch = clearSearch;
