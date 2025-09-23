// no hooks used in this minimal step
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import type { CartItem, Product } from "./types";
import { SidePanel } from "./ui/SidePanel";
import { ProductDetailPanel } from "./ui/ProductDetailPanel";

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sidePanelOpen, setSidePanelOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  function addToCart(p: Product) {
    if (!p.isActive || p.stock === 0 || p.stock == null || p.price == null)
      return;
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, unitPrice: p.price as number, qty: 1 },
      ];
    });
    setSidePanelOpen(true);
    setToast("장바구니에 담겼어요");
  }

  function closeSidePanel() {
    setSidePanelOpen(false);
  }

  function handleOrderComplete() {
    // Reset cart items
    setCartItems([]);
  }

  function changeQty(productId: string, delta: number) {
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === productId);
      if (idx < 0) return prev;
      const item = prev[idx];
      const nextQty = item.qty + delta;

      // Remove item if quantity becomes 0 or less
      if (nextQty <= 0) {
        return prev.filter((it) => it.productId !== productId);
      }

      // Update quantity
      const next = [...prev];
      next[idx] = { ...item, qty: nextQty };
      return next;
    });
  }

  function openProductDetail(productId: string) {
    setSelectedProductId(productId);
    setProductDetailOpen(true);
  }

  function closeProductDetail() {
    setProductDetailOpen(false);
    setSelectedProductId(null);
  }

  function openCartFromHeader() {
    setSidePanelOpen(true);
  }

  // Calculate total cart quantity
  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="page">
      <header className="header" role="banner" aria-label="서비스 헤더">
        <div className="brand">
          <Link to="/">Grids Circles</Link>
        </div>
        <button
          className="header-cart-button"
          onClick={openCartFromHeader}
          aria-label="장바구니 보기"
        >
          🛒
          {totalCartQuantity > 0 && (
            <span className="cart-badge">{totalCartQuantity}</span>
          )}
        </button>
      </header>

      <main className="main" role="main">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onAddToCart={addToCart}
                onProductClick={openProductDetail}
              />
            }
          />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      <SidePanel
        open={sidePanelOpen}
        items={cartItems}
        onClose={closeSidePanel}
        onChangeQty={changeQty}
        onOrderComplete={handleOrderComplete}
      />

      <ProductDetailPanel
        open={productDetailOpen}
        productId={selectedProductId}
        onClose={closeProductDetail}
        onAddToCart={addToCart}
      />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
