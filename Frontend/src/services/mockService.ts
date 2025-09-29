import type {
  Product,
  OrderRequest,
  OrderResponse,
  OrderUpdateRequest,
  OrderUpdateResponse,
  OrderDeleteResponse,
  OrderHistory,
  AddressInfo,
  BackendOrder,
  BackendProductList,
  BackendProductDetail,
} from "../types";
import {
  transformBackendOrderToFrontend,
  extractAddressFromBackendOrder,
  transformBackendProductListToFrontend,
  transformBackendProductDetailToFrontend,
} from "../types";

// ===== Mock 데이터 =====

// 백엔드 구조의 Mock 상품 목록 데이터
export const mockBackendProducts: BackendProductList[] = [
  {
    productId: 1,
    productName: "콜롬비아 수프리모",
    productPrice: 18000,
    quantity: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
  {
    productId: 2,
    productName: "에티오피아 예가체프",
    productPrice: 22000,
    quantity: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
  {
    productId: 3,
    productName: "브라질 산토스",
    productPrice: 15000,
    quantity: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
  {
    productId: 4,
    productName: "케냐 AA",
    productPrice: 24000,
    quantity: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
];

// 백엔드 구조의 Mock 상품 상세 데이터
export const mockBackendProductDetails: Record<number, BackendProductDetail> = {
  1: {
    productId: 1,
    productName: "콜롬비아 수프리모",
    productPrice: 18000,
    description: "부드럽고 균형 잡힌 산미와 단맛이 특징인 콜롬비아 원두",
    quantity: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
  2: {
    productId: 2,
    productName: "에티오피아 예가체프",
    productPrice: 22000,
    description: "과일 같은 산미와 꽃향이 특징인 에티오피아 원두",
    quantity: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
  3: {
    productId: 3,
    productName: "브라질 산토스",
    productPrice: 15000,
    description: "부드럽고 달콤한 맛이 특징인 브라질 원두",
    quantity: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
  4: {
    productId: 4,
    productName: "케냐 AA",
    productPrice: 24000,
    description: "강렬한 산미와 와인 같은 맛이 특징인 케냐 원두",
    quantity: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  },
};

// 백엔드 구조의 Mock 주문 데이터
export const mockBackendOrders: BackendOrder[] = [
  {
    ordersDto: {
      id: 1,
      email: "test@test.com",
      address: "서울시 강남구 테헤란로 123",
      zipCode: 12345,
      totalPrice: 42000,
      orderDate: "2025-01-15T10:30:00",
      status: "PENDING",
      canModify: true,
    },
    orderDetails: [
      {
        id: 1,
        productId: 1,
        productName: "콜롬비아 수프리모",
        quantity: 2,
        price: 18000,
      },
      {
        id: 2,
        productId: 2,
        productName: "에티오피아 예가체프",
        quantity: 1,
        price: 24000,
      },
    ],
  },
  {
    ordersDto: {
      id: 2,
      email: "test@test.com",
      address: "서울시 서초구 서초대로 456",
      zipCode: 67890,
      totalPrice: 36000,
      orderDate: "2025-01-14T15:20:00",
      status: "SHIPPED",
      canModify: false,
    },
    orderDetails: [
      {
        id: 3,
        productId: 3,
        productName: "브라질 산토스",
        quantity: 2,
        price: 15000,
      },
      {
        id: 4,
        productId: 4,
        productName: "케냐 AA",
        quantity: 1,
        price: 24000,
      },
    ],
  },
];

// Mock 주소 정보
export const mockOrderAddresses: Record<string, AddressInfo> = {
  "1": {
    email: "test@test.com",
    postalCode: "12345",
    address: "서울시 강남구 테헤란로 123",
    detailAddress: "101동 201호",
  },
  "2": {
    email: "test@test.com",
    postalCode: "67890",
    address: "서울시 서초구 서초대로 456",
    detailAddress: "202동 301호",
  },
};

// ===== Mock 서비스 함수들 =====

// 상품 목록 조회 (Mock)
export async function getProductsMock(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products =
        transformBackendProductListToFrontend(mockBackendProducts);
      resolve(products);
    }, 300);
  });
}

// 상품 상세 조회 (Mock)
export async function getProductByIdMock(
  productId: string
): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const productIdNum = parseInt(productId);
      const backendProduct = mockBackendProductDetails[productIdNum];
      if (backendProduct) {
        const product = transformBackendProductDetailToFrontend(backendProduct);
        resolve(product);
      } else {
        resolve(null);
      }
    }, 200);
  });
}

// 주문 생성 (Mock)
export async function createOrderMock(
  orderData: OrderRequest
): Promise<OrderResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOrderId =
        Math.max(...mockBackendOrders.map((o) => o.ordersDto.id)) + 1;
      resolve({
        resultCode: "201-1",
        msg: "주문이 성공적으로 생성되었습니다.",
        data: { orderId: newOrderId },
      });
    }, 500);
  });
}

// 이메일로 주문내역 조회 (Mock)
export async function getOrderHistoryByEmailMock(
  email: string
): Promise<OrderHistory[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userOrders = mockBackendOrders.filter(
        (order) => order.ordersDto.email === email
      );
      const orderHistory = userOrders.map(transformBackendOrderToFrontend);
      resolve(orderHistory);
    }, 300);
  });
}

// 특정 주문 조회 (Mock)
export async function getOrderByIdMock(
  orderId: string
): Promise<OrderHistory | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIdNum = parseInt(orderId);
      const backendOrder = mockBackendOrders.find(
        (order) => order.ordersDto.id === orderIdNum
      );
      if (backendOrder) {
        const orderHistory = transformBackendOrderToFrontend(backendOrder);
        resolve(orderHistory);
      } else {
        resolve(null);
      }
    }, 200);
  });
}

// 주문 수정 (Mock)
export async function updateOrderMock(
  orderId: string,
  updateData: Partial<OrderUpdateRequest>
): Promise<OrderUpdateResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIdNum = parseInt(orderId);
      const orderIndex = mockBackendOrders.findIndex(
        (order) => order.ordersDto.id === orderIdNum
      );

      if (orderIndex === -1) {
        resolve({
          resultCode: "404-1",
          msg: "주문을 찾을 수 없습니다.",
          data: null,
        });
        return;
      }

      // 14시 이후 수정 제한 체크
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= 14) {
        resolve({
          resultCode: "403-1",
          msg: "14시 이후에는 주문을 수정할 수 없습니다.",
          data: null,
        });
        return;
      }

      // 주문 수정 로직 (실제로는 데이터를 업데이트하지 않음)
      resolve({
        resultCode: "200-1",
        msg: `${orderId}번 주문이 수정되었습니다.`,
        data: mockBackendOrders[orderIndex],
      });
    }, 400);
  });
}

// 주문 삭제 (Mock)
export async function deleteOrderMock(
  orderId: string
): Promise<OrderDeleteResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIdNum = parseInt(orderId);
      const orderIndex = mockBackendOrders.findIndex(
        (order) => order.ordersDto.id === orderIdNum
      );

      if (orderIndex === -1) {
        resolve({
          resultCode: "404-1",
          msg: "주문을 찾을 수 없습니다.",
          data: null,
        });
        return;
      }

      // 14시 이후 삭제 제한 체크
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= 14) {
        resolve({
          resultCode: "403-1",
          msg: "14시 이후에는 주문을 삭제할 수 없습니다.",
          data: null,
        });
        return;
      }

      // 주문 삭제 로직 (실제로는 데이터를 삭제하지 않음)
      resolve({
        resultCode: "200-1",
        msg: `${orderId}번 주문이 취소되었습니다.`,
        data: null,
      });
    }, 300);
  });
}

// 이메일로 주소 정보 조회 (Mock)
export async function getAddressInfoByEmailMock(
  email: string
): Promise<AddressInfo | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 첫 번째 주문의 주소 정보를 반환
      const firstOrder = mockBackendOrders.find(
        (order) => order.ordersDto.email === email
      );
      if (firstOrder) {
        const addressInfo = extractAddressFromBackendOrder(firstOrder);
        resolve(addressInfo);
      } else {
        resolve(null);
      }
    }, 200);
  });
}

// 주문별 배송 주소 조회 (Mock)
export async function getOrderAddressByOrderIdMock(
  orderId: string
): Promise<AddressInfo | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const backendOrder = mockBackendOrders.find(
        (order) => order.ordersDto.id.toString() === orderId
      );
      if (backendOrder) {
        // 백엔드 구조에서 주소 정보 추출
        const addressInfo = extractAddressFromBackendOrder(backendOrder);
        resolve(addressInfo);
      } else {
        resolve(null);
      }
    }, 200);
  });
}
