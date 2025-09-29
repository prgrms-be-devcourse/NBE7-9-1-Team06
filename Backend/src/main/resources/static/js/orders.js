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

  // 주소 조합 (address + addressDetail)
  const fullAddress = [order.address, order.addressDetail]
    .filter((addr) => addr && addr.trim())
    .join(" ");

  row.innerHTML = `
        <td>${escapeHtml(order.orderId)}</td>
        <td>${escapeHtml(order.email)}</td>
        <td>${escapeHtml(fullAddress)}</td>
        <td>${formatPrice(order.totalPrice)}</td>
        <td>복</td>
        <td class="text-right">
            <button class="btn btn-danger btn-sm" onclick="cancelOrder('${
              order.orderId
            }')">
                주문 취소
            </button>
        </td>
    `;

  return row;
}

/**
 * 주문 취소 처리
 * @param {string} orderId - 주문 ID
 */
async function cancelOrder(orderId) {
  try {
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

// 전역 함수로 등록
window.loadOrders = loadOrders;
window.cancelOrder = cancelOrder;
window.refreshOrders = refreshOrders;
