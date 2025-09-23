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
        next();
      });
    },
  };
  return {
    plugins: [react(), mockApi],
  };
});
