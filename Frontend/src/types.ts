export type RawProduct = Record<string, unknown>;

export type Product = {
  id: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  stock: number | null;
  isActive: boolean;
  description?: string;
};

// 백엔드 상품 목록 응답 타입
export interface BackendProductList {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  imageUrl: string;
}

// 백엔드 상품 상세 응답 타입
export interface BackendProductDetail {
  productId: number;
  productName: string;
  productPrice: number;
  description: string;
  quantity: number;
  imageUrl: string;
}

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};

// ===== API 관련 타입들 =====

// 주문 관련 타입
export interface OrderRequest {
  email: string;
  address: string;
  zipCode: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface OrderResponse {
  resultCode: string;
  msg: string;
  data: {
    orderId: number;
  } | null;
}

export interface OrderUpdateRequest {
  email: string;
  address: string;
  zipCode: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface OrderUpdateResponse {
  resultCode: string;
  msg: string;
  data: BackendOrderDetailResponse | null;
}

export interface OrderDeleteResponse {
  resultCode: string;
  msg: string;
  data: null;
}

// 주문 내역 타입
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

// 주소 정보 타입
export interface AddressInfo {
  email: string;
  postalCode: string;
  address: string;
  detailAddress: string;
}

// ===== 백엔드 API 응답 타입들 =====

// 백엔드 주문 DTO
export interface BackendOrderDto {
  id: number;
  email: string;
  address: string;
  zipCode: number;
  totalPrice: number;
  orderDate: string;
  status: string;
  canModify: boolean;
}

// 백엔드 주문 상세 DTO
export interface BackendOrderDetail {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

// 백엔드 주문 응답 (목록조회용)
export interface BackendOrder {
  ordersDto: BackendOrderDto;
  orderDetails: BackendOrderDetail[];
}

// 백엔드 주문 상세 응답 (상세조회용)
export interface BackendOrderDetailResponse {
  ordersDto: BackendOrderDto;
  orderDetails: BackendOrderDetail[];
}

// 백엔드 API 공통 응답 구조
export interface BackendApiResponse<T> {
  resultCode: string;
  msg: string;
  data: T;
}

// 주문 목록 조회 응답
export interface BackendOrderListResponse {
  orders: BackendOrder[];
}

// 주문 상세 조회 응답
export interface BackendOrderDetailApiResponse {
  ordersDto: BackendOrderDto;
  orderDetails: BackendOrderDetail[];
}

// ===== 데이터 변환 함수들 =====

// 백엔드 주문을 프론트엔드 OrderHistory로 변환
export function transformBackendOrderToFrontend(
  backendOrder: BackendOrder
): OrderHistory {
  return {
    orderId: backendOrder.ordersDto.id.toString(),
    email: backendOrder.ordersDto.email,
    orderDate: backendOrder.ordersDto.orderDate,
    status: transformStatus(backendOrder.ordersDto.status),
    totalAmount: backendOrder.ordersDto.totalPrice,
    items: backendOrder.orderDetails.map((detail) => ({
      productId: detail.productId.toString(),
      name: detail.productName,
      unitPrice: detail.price,
      quantity: detail.quantity,
    })),
  };
}

// 백엔드 주문 상세를 프론트엔드 OrderHistory로 변환
export function transformBackendOrderDetailToFrontend(
  backendOrderDetail: BackendOrderDetailResponse
): OrderHistory {
  return {
    orderId: backendOrderDetail.ordersDto.id.toString(),
    email: backendOrderDetail.ordersDto.email,
    orderDate: backendOrderDetail.ordersDto.orderDate,
    status: transformStatus(backendOrderDetail.ordersDto.status),
    totalAmount: backendOrderDetail.ordersDto.totalPrice,
    items: backendOrderDetail.orderDetails.map((detail) => ({
      productId: detail.productId.toString(),
      name: detail.productName,
      unitPrice: detail.price,
      quantity: detail.quantity,
    })),
  };
}

// 백엔드 주문 DTO에서 주소 정보 추출
export function extractAddressFromBackendOrder(
  backendOrder: BackendOrder
): AddressInfo {
  return {
    email: backendOrder.ordersDto.email,
    postalCode: backendOrder.ordersDto.zipCode.toString(),
    address: backendOrder.ordersDto.address,
    detailAddress: "", // 백엔드에서 detailAddress가 없으므로 빈 문자열
  };
}

// 백엔드 상태를 프론트엔드 상태로 변환
export function transformStatus(backendStatus: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "주문접수",
    SHIPPING: "배송중",
    COMPLETED: "완료",
    CANCELLED: "취소",
  };
  return statusMap[backendStatus] || backendStatus;
}

// 프론트엔드 상태를 백엔드 상태로 변환
export function transformStatusToBackend(frontendStatus: string): string {
  const statusMap: Record<string, string> = {
    주문접수: "PENDING",
    배송중: "SHIPPING",
    완료: "COMPLETED",
    취소: "CANCELLED",
  };
  return statusMap[frontendStatus] || frontendStatus;
}

// 백엔드 상품 목록을 프론트엔드 Product로 변환
export function transformBackendProductListToFrontend(
  backendProducts: BackendProductList[]
): Product[] {
  return backendProducts.map((product) => ({
    id: product.productId.toString(),
    name: product.productName,
    price: product.productPrice,
    imageUrl: product.imageUrl,
    stock: product.quantity,
    isActive: product.quantity > 0, // 재고가 있으면 활성화
    description: undefined, // 상품 목록에는 description이 없으므로 undefined
  }));
}

// 백엔드 상품 상세를 프론트엔드 Product로 변환
export function transformBackendProductDetailToFrontend(
  backendProduct: BackendProductDetail
): Product {
  return {
    id: backendProduct.productId.toString(),
    name: backendProduct.productName,
    price: backendProduct.productPrice,
    imageUrl: backendProduct.imageUrl,
    stock: backendProduct.quantity,
    isActive: backendProduct.quantity > 0, // 재고가 있으면 활성화
    description: backendProduct.description,
  };
}
