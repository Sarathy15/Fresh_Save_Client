import React from "react"
import { useNavigate } from "react-router-dom"
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Sparkles,
} from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { EmptyState } from "../components/common/EmptyState"
import type { CartItem } from "../types"

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    savings,
    deliveryFee,
    finalTotal,
  } = useCart()
  const { location } = useAuth()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          title="Your Basket is Empty"
          description="You haven't added any groceries to your basket yet. Check out today's fresh arrivals or explore verified smart deals."
          actionText="Browse Fresh Produce"
          actionLink="/shop"
          icon={<ShoppingBag className="w-10 h-10" />}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Shopping Basket
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Delivering to <strong className="text-gray-800">{location}</strong>
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
        >
          Clear Entire Basket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs divide-y divide-gray-100">
          <div className="flex items-center justify-between pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Items ({totalItems})</span>
            <span>Price & Subtotal</span>
          </div>

          {items.map((item: CartItem) => {
            const unitPrice =
              item.product.discount_price && item.product.discount_price > 0
                ? item.product.discount_price
                : item.product.base_price
            const itemTotal = (unitPrice * item.quantity).toFixed(2)

            return (
              <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={
                      item.product.image_url ||
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80"
                    }
                    alt={item.product.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{item.product.unit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-green-800">₹{unitPrice}</span>
                      {item.product.base_price > unitPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{item.product.base_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity adjustments */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total & delete */}
                  <div className="text-right w-20">
                    <span className="text-sm font-bold text-gray-950 block">
                      ₹{itemTotal}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors mt-0.5 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-950 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Retailer Markdown Savings
                  </span>
                  <span>-₹{savings}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-700 font-bold uppercase text-[10px]">
                      FREE
                    </span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-black text-gray-950">
                <span>Total Amount to Pay</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Food waste badge */}
            <div className="bg-lime-50 text-green-900 rounded-xl p-3 border border-lime-200 text-xs flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-700 shrink-0" />
              <span>
                You are diverting <strong>{(items.length * 0.45).toFixed(1)} kg</strong> of harvest from landfill waste!
              </span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-lime-300" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
              <span>Simulated Safe Checkout • 100% Guaranteed Fresh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
