// no hooks used in this minimal step
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
// (Cart & SidePanel will be added in later commits)

function App() {
  // Product list only in this commit

  return (
    <div className="page">
      <header className="header" role="banner" aria-label="서비스 헤더">
        <div className="brand">
          <Link to="/">Grids Circles</Link>
        </div>
      </header>

      <main className="main" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
