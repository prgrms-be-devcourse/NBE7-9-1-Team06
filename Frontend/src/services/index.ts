import type {
  Product,
  OrderRequest,
  OrderResponse,
  OrderUpdateRequest,
  OrderUpdateResponse,
  OrderDeleteResponse,
  OrderHistory,
  AddressInfo,
} from "../types";

// API 서비스 import
import * as apiService from "./api";

// Mock 서비스 import
import * as mockService from "./mockService";

// ===== 통합 서비스 함수들 (API 실패 시 Mock으로 fallback) =====

// 상품 목록 조회
export async function getProducts(): Promise<Product[]> {
  try {
    return await apiService.getProducts();
  } catch (error) {
    console.warn("API 실패, Mock 데이터 사용:", error);
    return await mockService.getProductsMock();
  }
}

// 상품 상세 조회
export async function getProductById(
  productId: string
): Promise<Product | null> {
  try {
    return await apiService.getProductById(productId);
  } catch (error) {
    console.warn("API 실패, Mock 데이터 사용:", error);
    return await mockService.getProductByIdMock(productId);
  }
}

// 주문 생성
export async function createOrder(
  orderData: OrderRequest
): Promise<OrderResponse> {
  try {
    console.log("🔄 API 호출 시도:", orderData);
    const result = await apiService.createOrder(orderData);
    console.log("✅ API 호출 성공:", result);
    return result;
  } catch (error) {
    console.error("❌ API 실패, Mock 데이터 사용:", error);
    const mockResult = await mockService.createOrderMock(orderData);
    console.log("🔄 Mock 결과:", mockResult);
    return mockResult;
  }
}

// 이메일로 주문내역 조회
export async function getOrderHistoryByEmail(
  email: string
): Promise<OrderHistory[]> {
  try {
    return await apiService.getOrderHistoryByEmail(email);
  } catch (error) {
    console.warn("API 실패, Mock 데이터 사용:", error);
    return await mockService.getOrderHistoryByEmailMock(email);
  }
}

// 특정 주문 조회
export async function getOrderById(
  orderId: string
): Promise<OrderHistory | null> {
  try {
    return await apiService.getOrderById(orderId);
  } catch (error) {
    console.warn("API 실패, Mock 데이터 사용:", error);
    return await mockService.getOrderByIdMock(orderId);
  }
}

// 주문 수정
export async function updateOrder(
  orderId: string,
  updateData: Partial<OrderUpdateRequest>
): Promise<OrderUpdateResponse> {
  try {
    console.log("🔄 주문 수정 API 호출 시도:", { orderId, updateData });
    const result = await apiService.updateOrder(orderId, updateData);
    console.log("✅ 주문 수정 API 호출 성공:", result);
    return result;
  } catch (error) {
    console.error("❌ 주문 수정 API 실패, Mock 데이터 사용:", error);
    const mockResult = await mockService.updateOrderMock(orderId, updateData);
    console.log("🔄 주문 수정 Mock 결과:", mockResult);
    return mockResult;
  }
}

// 주문 삭제
export async function deleteOrder(
  orderId: string
): Promise<OrderDeleteResponse> {
  try {
    return await apiService.deleteOrder(orderId);
  } catch (error) {
    console.warn("API 실패, Mock 데이터 사용:", error);
    return await mockService.deleteOrderMock(orderId);
  }
}

// 주소 정보 조회 (Mock만 있음)
export async function getAddressInfoByEmail(
  email: string
): Promise<AddressInfo | null> {
  return await mockService.getAddressInfoByEmailMock(email);
}

// 주문별 배송 주소 조회 (Mock만 있음)
export async function getOrderAddressByOrderId(
  orderId: string
): Promise<AddressInfo | null> {
  return await mockService.getOrderAddressByOrderIdMock(orderId);
}

// ===== 타입 export =====
export type {
  Product,
  OrderRequest,
  OrderResponse,
  OrderUpdateRequest,
  OrderUpdateResponse,
  OrderDeleteResponse,
  OrderHistory,
  OrderHistoryItem,
  AddressInfo,
  BackendOrder,
  BackendOrderDto,
  BackendOrderDetail,
  BackendApiResponse,
  BackendOrderListResponse,
  BackendOrderDetailApiResponse,
  BackendProductList,
  BackendProductDetail,
} from "../types";
