import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const mockApi = {
    name: "mock-api",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === "/api/v1/products") {
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify([
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
                title: "핸드드립 주전자",
                unitPrice: 35900,
                image: "https://picsum.photos/seed/p2/600/600",
                inventory: 3,
                active: true,
              },
              {
                productId: "p3",
                name: "에스프레소 컵(2개 세트)",
                amount: 15900,
                thumbnailUrl: "https://picsum.photos/seed/p3/600/600",
                qty: 0,
                isActive: true,
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
            ])
          );
          return;
        }

        // Individual product API
        if (req.url?.startsWith("/api/v1/products/")) {
          const productId = req.url.split("/").pop();
          const mockProducts = [
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
              isActive: true,
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
          ];

          const product = mockProducts.find((p) => p.id === productId);
          if (product) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(product));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Product not found" }));
          }
          return;
        }

        // Order creation API
        if (req.url === "/api/v1/orders" && req.method === "POST") {
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              orderId: `order_${Date.now()}`,
              message: "주문이 성공적으로 생성되었습니다.",
            })
          );
          return;
        }

        // Order history API
        if (req.url === "/api/v1/orders/history" && req.method === "GET") {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const email = url.searchParams.get("email");

          if (!email) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "이메일이 필요합니다." }));
            return;
          }

          // Mock order history data
          const mockOrderHistory = [
            {
              orderId: "order_1703123456789",
              email: email,
              orderDate: "2024-01-15T10:30:00Z",
              status: "완료",
              totalAmount: 48800,
              items: [
                {
                  productId: "p1",
                  name: "프리미엄 원두 1kg",
                  unitPrice: 12900,
                  quantity: 2,
                },
                {
                  productId: "p5",
                  name: "여분 필터(100매)",
                  unitPrice: 4900,
                  quantity: 1,
                },
              ],
            },
            {
              orderId: "order_1703123456790",
              email: email,
              orderDate: "2024-01-10T14:20:00Z",
              status: "완료",
              totalAmount: 35900,
              items: [
                {
                  productId: "p2",
                  name: "핸드드립 주전자",
                  unitPrice: 35900,
                  quantity: 1,
                },
              ],
            },
          ];

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(mockOrderHistory));
          return;
        }

        next();
      });
    },
  };
  return {
    plugins: [react(), mockApi],
  };
});
