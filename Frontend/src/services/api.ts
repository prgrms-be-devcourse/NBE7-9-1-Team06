import type {
  Product,
  OrderRequest,
  OrderResponse,
  OrderUpdateRequest,
  OrderUpdateResponse,
  OrderDeleteResponse,
  OrderHistory,
  AddressInfo,
  BackendApiResponse,
  BackendOrderListResponse,
  BackendOrderDetailApiResponse,
  BackendProductList,
  BackendProductDetail,
} from "../types";
import {
  transformBackendOrderToFrontend,
  transformBackendOrderDetailToFrontend,
  transformBackendProductListToFrontend,
  transformBackendProductDetailToFrontend,
} from "../types";

// ===== 상품 관련 API =====

// 상품 목록 조회
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch("/api/v1/products");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const backendProducts: BackendProductList[] = await response.json();

    // 백엔드 응답을 프론트엔드 타입으로 변환
    return transformBackendProductListToFrontend(backendProducts);
  } catch (error) {
    console.error("상품 목록 조회 실패:", error);
    throw error;
  }
}

// 상품 상세 조회
export async function getProductById(
  productId: string
): Promise<Product | null> {
  try {
    const response = await fetch(`/api/v1/products/${productId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const backendProduct: BackendProductDetail = await response.json();

    // 백엔드 응답을 프론트엔드 타입으로 변환
    return transformBackendProductDetailToFrontend(backendProduct);
  } catch (error) {
    console.error("상품 상세 조회 실패:", error);
    throw error;
  }
}

// ===== 주문 관련 API =====

// 주문 생성
export async function createOrder(
  orderData: OrderRequest
): Promise<OrderResponse> {
  try {
    const response = await fetch("/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: OrderResponse = await response.json();
    return result;
  } catch (error) {
    console.error("주문 생성 실패:", error);
    throw error;
  }
}

// 이메일로 주문내역 조회
export async function getOrderHistoryByEmail(
  email: string
): Promise<OrderHistory[]> {
  try {
    const url = `/api/v1/orders?email=${encodeURIComponent(email)}`;
    console.log("API 호출 URL:", url);
    const response = await fetch(url, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 오류 응답:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: BackendApiResponse<BackendOrderListResponse> =
      await response.json();

    if (apiResponse.resultCode !== "200-1") {
      throw new Error(apiResponse.msg || "주문내역 조회에 실패했습니다.");
    }

    // 백엔드 응답을 프론트엔드 타입으로 변환
    return apiResponse.data.orders.map(transformBackendOrderToFrontend);
  } catch (error) {
    console.error("주문내역 조회 실패:", error);
    throw error;
  }
}

// 특정 주문 조회
export async function getOrderById(
  orderId: string
): Promise<OrderHistory | null> {
  try {
    const response = await fetch(`/api/v1/orders/${orderId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: BackendApiResponse<BackendOrderDetailApiResponse> =
      await response.json();

    if (apiResponse.resultCode !== "200-1") {
      throw new Error(apiResponse.msg || "주문 조회에 실패했습니다.");
    }

    // 백엔드 응답을 프론트엔드 타입으로 변환
    return transformBackendOrderDetailToFrontend(apiResponse.data);
  } catch (error) {
    console.error("주문 조회 실패:", error);
    throw error;
  }
}

// 주문 수정
export async function updateOrder(
  orderId: string,
  updateData: Partial<OrderUpdateRequest>
): Promise<OrderUpdateResponse> {
  try {
    const response = await fetch(`/api/v1/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: OrderUpdateResponse = await response.json();
    return result;
  } catch (error) {
    console.error("주문 수정 실패:", error);
    throw error;
  }
}

// 주문 삭제
export async function deleteOrder(
  orderId: string
): Promise<OrderDeleteResponse> {
  try {
    const response = await fetch(`/api/v1/orders/${orderId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: OrderDeleteResponse = await response.json();
    return result;
  } catch (error) {
    console.error("주문 삭제 실패:", error);
    throw error;
  }
}

// 주문별 배송 주소 조회
export async function getOrderAddressByOrderId(
  orderId: string
): Promise<AddressInfo | null> {
  try {
    console.log("주소 조회 - 주문 ID:", orderId);
    const url = `/api/v1/orders/${orderId}`;
    console.log("주소 조회 URL:", url);

    const response = await fetch(url);
    console.log("주소 조회 응답 상태:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("주문을 찾을 수 없음 (404)");
        return null;
      }
      const errorText = await response.text();
      console.error("주소 조회 API 오류:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: BackendApiResponse<BackendOrderDetailApiResponse> =
      await response.json();
    console.log("주소 조회 API 응답:", apiResponse);

    const addressInfo = {
      email: apiResponse.data.ordersDto.email,
      postalCode: apiResponse.data.ordersDto.zipCode.toString(),
      address: apiResponse.data.ordersDto.address,
      detailAddress: "",
    };
    console.log("추출된 주소 정보:", addressInfo);

    return addressInfo;
  } catch (error) {
    console.error("주문 주소 조회 실패:", error);
    throw error;
  }
}
