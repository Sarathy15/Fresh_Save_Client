import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import { AuthProvider } from "./context/AuthContext"
import { Header } from "./components/layout/Header"
import { Footer } from "./components/layout/Footer"
import { CartDrawer } from "./components/cart/CartDrawer"
import { Toast } from "./components/common/Toast"

import { Home } from "./pages/Home"
import { Shop } from "./pages/Shop"
import { Deals } from "./pages/Deals"
import { Packages } from "./pages/Packages"
import { Cart } from "./pages/Cart"
import { Checkout } from "./pages/Checkout"
import { MyOrders } from "./pages/MyOrders"
import { Account } from "./pages/Account"
import { ProductDetails } from "./pages/ProductDetails"

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 font-sans selection:bg-green-100 selection:text-green-900">
            {/* Main Flipkart-Style Header */}
            <Header />

            {/* Main Application Body */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/account" element={<Account />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Slide-in Cart Drawer */}
            <CartDrawer />

            {/* Micro-Notification Toast */}
            <Toast />

            {/* Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
