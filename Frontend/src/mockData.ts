import type { OrderHistory } from "./ui/OrderHistoryPanel";
import type { Product } from "./types";

// 상품 목록 mock 데이터
export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "프리미엄 원두 1kg",
    price: 12900,
    imageUrl: "https://picsum.photos/seed/p1/600/600",
    stock: 12,
    isActive: true,
  },
  {
    id: "p2",
    name: "핸드드립 주전자",
    price: 35900,
    imageUrl: "https://picsum.photos/seed/p2/600/600",
    stock: 3,
    isActive: true,
  },
  {
    id: "p3",
    name: "에스프레소 컵(2개 세트)",
    price: 15900,
    imageUrl: "https://picsum.photos/seed/p3/600/600",
    stock: 0,
    isActive: false,
  },
  {
    id: "p4",
    name: "콜드브루 병 1L",
    price: null,
    imageUrl: "https://picsum.photos/seed/p4/600/600",
    stock: 8,
    isActive: true,
  },
  {
    id: "p5",
    name: "여분 필터(100매)",
    price: 4900,
    imageUrl: "https://picsum.photos/seed/p5/600/600",
    stock: 1,
    isActive: true,
  },
  {
    id: "p6",
    name: "그라인더 전동",
    price: 89000,
    imageUrl: "https://picsum.photos/seed/p6/600/600",
    stock: 5,
    isActive: true,
  },
  {
    id: "p7",
    name: "바리스타 머그컵",
    price: 25000,
    imageUrl: "https://picsum.photos/seed/p7/600/600",
    stock: 7,
    isActive: true,
  },
  {
    id: "p8",
    name: "원두 보관통",
    price: 19900,
    imageUrl: "https://picsum.photos/seed/p8/600/600",
    stock: 4,
    isActive: true,
  },
];

// Mock 데이터 생성
export const mockOrderHistory: OrderHistory[] = [
  {
    orderId: "ORD-2024-001",
    email: "frank1130@naver.com",
    orderDate: "2024-01-15T10:30:00Z",
    status: "완료",
    totalAmount: 45000,
    items: [
      {
        productId: "PROD-001",
        name: "프리미엄 무선 이어폰",
        unitPrice: 25000,
        quantity: 1,
      },
      {
        productId: "PROD-002",
        name: "스마트 워치",
        unitPrice: 20000,
        quantity: 1,
      },
    ],
  },
  {
    orderId: "ORD-2024-002",
    email: "frank1130@naver.com",
    orderDate: "2024-02-20T14:15:00Z",
    status: "배송중",
    totalAmount: 85000,
    items: [
      {
        productId: "PROD-003",
        name: "게이밍 키보드",
        unitPrice: 120000,
        quantity: 1,
      },
      {
        productId: "PROD-004",
        name: "무선 마우스",
        unitPrice: 35000,
        quantity: 1,
      },
    ],
  },
  {
    orderId: "ORD-2024-003",
    email: "frank1130@naver.com",
    orderDate: "2024-03-10T09:45:00Z",
    status: "완료",
    totalAmount: 150000,
    items: [
      {
        productId: "PROD-005",
        name: "노트북 스탠드",
        unitPrice: 45000,
        quantity: 1,
      },
      {
        productId: "PROD-006",
        name: "USB 허브",
        unitPrice: 25000,
        quantity: 2,
      },
      {
        productId: "PROD-007",
        name: "모니터 암",
        unitPrice: 55000,
        quantity: 1,
      },
    ],
  },
  {
    orderId: "ORD-2024-004",
    email: "frank1130@naver.com",
    orderDate: "2024-03-25T16:20:00Z",
    status: "주문접수",
    totalAmount: 75000,
    items: [
      {
        productId: "PROD-008",
        name: "블루투스 스피커",
        unitPrice: 75000,
        quantity: 1,
      },
    ],
  },
];

// 주소 정보 mock 데이터
export interface AddressInfo {
  email: string;
  postalCode: string;
  address: string;
  detailAddress: string;
}

export const mockAddressInfo: AddressInfo = {
  email: "frank1130@naver.com",
  postalCode: "12345",
  address: "경기도 성남시",
  detailAddress: "분당구",
};

// 이메일로 주문내역 조회하는 mock 함수
export function getOrderHistoryByEmail(email: string): Promise<OrderHistory[]> {
  return new Promise((resolve) => {
    // 실제 API 호출처럼 약간의 지연을 추가
    setTimeout(() => {
      if (email === "frank1130@naver.com") {
        resolve(mockOrderHistory);
      } else {
        resolve([]);
      }
    }, 500);
  });
}

// 주소 정보 조회하는 mock 함수
export function getAddressInfoByEmail(
  email: string
): Promise<AddressInfo | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "frank1130@naver.com") {
        resolve(mockAddressInfo);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

// 주문 생성 mock 함수
export interface OrderRequest {
  customerInfo: {
    email: string;
    zipCode: string;
    address: string;
    detailAddress: string;
  };
  items: Array<{
    productId: string;
    name: string;
    unitPrice: number;
    qty: number;
  }>;
  totalAmount: number;
  orderStatus: string;
}

export interface OrderResponse {
  orderId: string;
  message: string;
  success: boolean;
}

export function createOrder(orderData: OrderRequest): Promise<OrderResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 주문 ID 생성 (현재 시간 기반)
      const orderId = `ORD-${Date.now()}`;

      // 주문 정보를 mock 데이터에 추가 (실제로는 서버에 저장)
      const newOrder: OrderHistory = {
        orderId,
        email: orderData.customerInfo.email,
        orderDate: new Date().toISOString(),
        status: orderData.orderStatus === "COMPLETED" ? "완료" : "주문접수",
        totalAmount: orderData.totalAmount,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.qty,
        })),
      };

      // mock 데이터에 새 주문 추가
      mockOrderHistory.unshift(newOrder);

      resolve({
        orderId,
        message: "주문이 성공적으로 생성되었습니다.",
        success: true,
      });
    }, 1000); // 1초 지연으로 실제 API 호출 시뮬레이션
  });
}

// 상품 목록 조회 mock 함수
export function getProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 500);
  });
}

// 상품 상세 조회 mock 함수
export function getProductById(productId: string): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p.id === productId);
      resolve(product || null);
    }, 300);
  });
}
